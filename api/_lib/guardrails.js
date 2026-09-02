// Capa 3 de contención: filtros que corren ANTES de gastar un token de la API.
// Rate limit en memoria por instancia, mismo patrón que check-domain.js.

export const LIMITS = {
    MAX_MESSAGE_CHARS: 800,     // un mensaje más largo que esto no es una consulta comercial
    MAX_HISTORY_TURNS: 24,      // 12 idas y vueltas por conversación
    MAX_OUTPUT_TOKENS: 700,     // respuestas cortas: es un chat, no un informe
    HOUR_MS: 3_600_000,
    MAX_PER_HOUR: 20,
    DAY_MS: 86_400_000,
    MAX_PER_DAY: 60,
    MAX_STRIKES: 3,             // intentos de manipulación antes de bloquear
    STRIKE_WINDOW_MS: 1_800_000, // ...dentro de media hora
    BLOCK_MS: 3_600_000,        // bloqueo de 1 hora
};

// Patrones de manipulación del prompt. Deliberadamente acotados: solo cosas que
// ningún cliente real escribiría. El resto del filtrado lo hace el system prompt.
//
// Los patrones NO viven en el repositorio, que es público: publicarlos es
// entregar el manual para esquivarlos. Se cargan desde la variable de entorno
// AGENT_GUARDRAILS, un JSON con el arreglo de expresiones regulares en texto.
// Todas se compilan con la bandera 'i'.
//
// Si la variable falta o viene mal, esto lanza excepción a propósito: es
// preferible que el chat no atienda a que atienda sin filtro previo.
let patronesCache = null;

function patronesInyeccion() {
    if (patronesCache) return patronesCache;

    const raw = process.env.AGENT_GUARDRAILS;
    if (!raw) {
        throw new Error('Falta la variable de entorno AGENT_GUARDRAILS con los patrones de inyección.');
    }

    let lista;
    try {
        lista = JSON.parse(raw);
    } catch {
        throw new Error('AGENT_GUARDRAILS no contiene JSON válido.');
    }

    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error('AGENT_GUARDRAILS debe ser un arreglo de patrones no vacío.');
    }

    patronesCache = lista.map((fuente) => {
        if (typeof fuente !== 'string' || !fuente) {
            throw new Error('AGENT_GUARDRAILS: hay un patrón vacío o que no es texto.');
        }
        return new RegExp(fuente, 'i');
    });

    return patronesCache;
}

const REFUSAL_REPLY =
    'Jaja, buen intento 😅 Yo solo puedo ayudarte con los servicios y precios de Interfaz360. ¿Te cuento de algún plan, o prefieres que te contacte un asesor?';

/**
 * Valida el payload y aplica el filtro previo.
 * Devuelve { ok: true, message, history } o { ok: false, status, error, reply? }
 */
export function validateRequest(body) {
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
        return { ok: false, status: 400, error: 'Mensaje vacío.' };
    }

    if (message.length > LIMITS.MAX_MESSAGE_CHARS) {
        return {
            ok: false,
            status: 400,
            error: `El mensaje es muy largo (máximo ${LIMITS.MAX_MESSAGE_CHARS} caracteres). Resúmelo y te ayudo.`,
        };
    }

    if (history.length > LIMITS.MAX_HISTORY_TURNS) {
        return {
            ok: false,
            status: 400,
            error: 'La conversación es muy larga. Escríbenos por WhatsApp al +56 9 5414 6176 y seguimos por ahí.',
        };
    }

    const visitor = cleanVisitor(body?.visitor);

    if (patronesInyeccion().some((pattern) => pattern.test(message))) {
        // No es un error: respondemos sin llamar a la API.
        return { ok: false, status: 200, reply: REFUSAL_REPLY, blocked: true, strike: true };
    }

    // Solo aceptamos roles válidos y recortamos por si acaso.
    const cleanHistory = history
        .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
        .filter((turn) => typeof turn.content === 'string' && turn.content.trim())
        .slice(-LIMITS.MAX_HISTORY_TURNS)
        .map((turn) => ({
            role: turn.role,
            content: turn.content.slice(0, LIMITS.MAX_MESSAGE_CHARS * 4),
        }));

    return { ok: true, message, history: cleanHistory, visitor };
}

// Validación simple y permisiva: filtra basura evidente sin rechazar correos
// legítimos raros. Un correo falso igual llega como lead y se evalúa a mano.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function cleanVisitor(visitor) {
    const nombre = typeof visitor?.nombre === 'string' ? visitor.nombre.trim().slice(0, 80) : '';
    const email = typeof visitor?.email === 'string' ? visitor.email.trim().toLowerCase().slice(0, 120) : '';

    if (nombre.length < 2 || !EMAIL_RE.test(email)) return null;
    return { nombre, email, telefono: cleanPhone(visitor?.telefono) };
}

/**
 * Normaliza un celular chileno a formato internacional (56912345678).
 * Es opcional: si no se puede interpretar, devuelve cadena vacía.
 */
export function cleanPhone(value) {
    if (typeof value !== 'string') return '';

    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    if (/^569\d{8}$/.test(digits)) return digits;           // 56912345678
    if (/^9\d{8}$/.test(digits)) return `56${digits}`;      // 912345678
    if (/^09\d{8}$/.test(digits)) return `56${digits.slice(1)}`;

    return '';
}

const hourly = new Map();
const daily = new Map();

function track(store, ip, windowMs, max) {
    const now = Date.now();
    const recent = (store.get(ip) || []).filter((t) => now - t < windowMs);
    recent.push(now);
    store.set(ip, recent);

    if (store.size > 500) {
        for (const [key, times] of store) {
            if (times.every((t) => now - t >= windowMs)) store.delete(key);
        }
    }

    return recent.length > max;
}

export function getClientIp(req) {
    const forwarded = String(req.headers['x-forwarded-for'] || '');
    return forwarded.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

// Reincidencia: quien insiste con intentos de manipulación queda bloqueado
// un rato. Un cliente real nunca llega a 3 intentos; un curioso sí.
const strikes = new Map();
const blocked = new Map();

/** Registra un intento de manipulación. Al tercero, bloquea la IP. */
export function registerStrike(ip) {
    const now = Date.now();
    const recent = (strikes.get(ip) || []).filter((t) => now - t < LIMITS.STRIKE_WINDOW_MS);
    recent.push(now);
    strikes.set(ip, recent);

    if (recent.length >= LIMITS.MAX_STRIKES) {
        blocked.set(ip, now + LIMITS.BLOCK_MS);
        strikes.delete(ip);
        return true;
    }
    return false;
}

/**
 * Momento (epoch ms) hasta el que la IP está bloqueada, o 0 si puede pasar.
 * El front lo usa para cerrar la ventana y dejar el botón apagado ese rato.
 */
export function blockedUntil(ip) {
    const until = blocked.get(ip);
    return until && until > Date.now() ? until : 0;
}

/** Devuelve null si puede pasar, o un mensaje de error si superó el límite. */
export function checkRateLimit(ip) {
    const until = blocked.get(ip);
    if (until && until > Date.now()) {
        return 'Cerramos el chat por ahora. Si de verdad necesitas ayuda, escríbenos por WhatsApp al +56 9 5414 6176.';
    }
    if (until) blocked.delete(ip);

    if (track(hourly, ip, LIMITS.HOUR_MS, LIMITS.MAX_PER_HOUR)) {
        return 'Llevas varias consultas seguidas. Espera un rato o escríbenos por WhatsApp al +56 9 5414 6176.';
    }
    if (track(daily, ip, LIMITS.DAY_MS, LIMITS.MAX_PER_DAY)) {
        return 'Alcanzaste el límite de mensajes por hoy. Escríbenos por WhatsApp al +56 9 5414 6176 y te atendemos al tiro.';
    }
    return null;
}

const ALLOWED_HOSTS = [
    'interfaz360.cl',
    'www.interfaz360.cl',
    'localhost',
    '127.0.0.1',
];

/** Bloquea el uso del endpoint desde otros sitios. */
export function isAllowedOrigin(req) {
    const source = req.headers.origin || req.headers.referer;
    if (!source) return true; // curl o navegación directa: lo frena el rate limit

    try {
        const { hostname } = new URL(source);
        return (
            ALLOWED_HOSTS.includes(hostname) ||
            hostname.endsWith('.vercel.app') // previews de Vercel
        );
    } catch {
        return false;
    }
}
