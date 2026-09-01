// Cerebro del agente IA de interfaz360.cl
//
// El TEXTO del prompt NO vive en el repositorio: se carga desde la variable de
// entorno AGENT_PROMPT, un JSON con los bloques. Acá queda solo la lógica de
// ensamblado. Motivo: el repositorio es público y el prompt es el activo del
// producto.
//
// Este archivo es la Capa 1 y 2 de contención (alcance cerrado + reglas duras).
// La Capa 3 (filtro previo) vive en ./guardrails.js
//
// IMPORTANTE: mantener el texto ESTABLE entre requests. Se envía con
// cache_control y cualquier cambio de un solo byte invalida el caché.
// No insertar fechas, horas ni datos variables en los bloques.

const BLOQUES = ['base', 'pricing', 'gateAnonimo', 'gateIdConTelefono', 'gateIdSinTelefono'];

// Marca que ocupa el lugar del nombre del visitante dentro de los bloques de
// gate identificado. Se sustituye en cada request.
const TOKEN_NOMBRE = '{{NOMBRE}}';

let cache = null;

function cargarBloques() {
    if (cache) return cache;

    const raw = process.env.AGENT_PROMPT;
    if (!raw) {
        throw new Error('Falta la variable de entorno AGENT_PROMPT con los bloques del prompt.');
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('AGENT_PROMPT no contiene JSON válido.');
    }

    for (const bloque of BLOQUES) {
        if (typeof parsed[bloque] !== 'string' || !parsed[bloque]) {
            throw new Error(`AGENT_PROMPT: falta el bloque "${bloque}" o está vacío.`);
        }
    }

    cache = parsed;
    return cache;
}

/**
 * Arma el system prompt según si el visitante se identificó o no.
 * Devuelve bloques separados para que el bloque base (el más grande y estable)
 * se cachee entre requests.
 * @param {{nombre?: string, email?: string, telefono?: string} | null} visitor
 */
export function buildSystemPrompt(visitor) {
    const bloques = cargarBloques();
    const base = { type: 'text', text: bloques.base, cache_control: { type: 'ephemeral' } };

    if (!visitor?.nombre || !visitor?.email) {
        return [base, { type: 'text', text: bloques.gateAnonimo }];
    }

    const gate = (visitor.telefono ? bloques.gateIdConTelefono : bloques.gateIdSinTelefono)
        .split(TOKEN_NOMBRE)
        .join(visitor.nombre);

    return [
        base,
        { type: 'text', text: bloques.pricing, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: gate },
    ];
}

// Primer mensaje que ve el visitante. No pasa por la API, es texto fijo.
export const WELCOME_MESSAGE =
    '¡Hola! 👋 Soy el asistente de Interfaz360. Te puedo contar sobre nuestros servicios, precios y planes, o dejarte agendada una reunión con Carlos. ¿Qué andas buscando?';

export const SUGGESTED_PROMPTS = [
    '¿Cuánto cuesta una página web?',
    'Quiero un agente IA para mi negocio',
    '¿Qué incluye la Suite Digital 360?',
    'Necesito hablar con alguien',
];
