// Suite 8 — Base de datos Supabase. Cierra el hueco que la suite del agente no
// alcanza a ver: que un lead legítimo de verdad llegue a la tabla public.leads.
// Si la clave vence, el proyecto se pausa o la tabla cambia de nombre, el chat
// sigue contestando pero los leads se pierden en silencio.
//
// SOLO LECTURA. Nunca escribe, nunca crea leads de prueba. Del contenido de los
// leads solo se cuentan filas: ningún nombre, correo ni teléfono sale al informe.
// Las claves tampoco: ni completas ni en pedazos.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ok, falla, aviso, omitido } from '../lib/check.mjs';
import { pedir } from '../lib/red.mjs';

export const id = 'supabase';
export const nombre = 'Base de datos (Supabase y leads)';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Tablas de clientes que un visitante sin sesión jamás debe poder leer.
const TABLAS_PRIVADAS = ['profiles', 'tickets', 'documents'];

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

export async function run() {
    const env = leerVariables();
    const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const service = env.SUPABASE_SERVICE_ROLE_KEY || '';
    const anon = env.VITE_SUPABASE_ANON_KEY || '';
    const limpiar = censor([service, anon]);

    if (!url) {
        return [aviso('supabase.config', 'Chequeo de Supabase omitido: falta SUPABASE_URL',
            'Sin la URL del proyecto (SUPABASE_URL o VITE_SUPABASE_URL) no se puede revisar que los leads lleguen a la base.')];
    }
    if (!service && !anon) {
        return [aviso('supabase.config', 'Chequeo de Supabase omitido: faltan las claves',
            'Falta SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_ANON_KEY.')];
    }

    const checks = [];

    // --- 1. El proyecto responde (no está pausado) ---
    const vivo = await revisarProyecto(url, service || anon, limpiar);
    checks.push(vivo);
    if (vivo.estado === 'falla') {
        checks.push(omitido('supabase.resto', 'Resto de pruebas de Supabase',
            'El proyecto no responde: no tiene sentido seguir.'));
        return checks;
    }

    // --- 2 y 3. Tabla de leads legible y leads recientes (service role) ---
    if (!service) {
        checks.push(aviso('supabase.service-role', 'Chequeo de leads omitido: falta SUPABASE_SERVICE_ROLE_KEY',
            'Sin la clave de servicio no se puede confirmar que los leads del chat lleguen a public.leads. '
            + 'Configúrala como secreto del repositorio (GitHub → Settings → Secrets and variables → Actions).'));
    } else {
        checks.push(...await revisarLeads(url, service, limpiar));
    }

    // --- 4. RLS: un visitante sin sesión no ve nada (anon key) ---
    if (!anon) {
        checks.push(aviso('supabase.rls', 'Prueba de RLS omitida: falta VITE_SUPABASE_ANON_KEY',
            'Sin la clave pública no se puede comprobar que un visitante anónimo no lea los leads.'));
    } else {
        for (const tabla of ['leads', ...TABLAS_PRIVADAS]) {
            checks.push(await revisarRls(url, anon, service, tabla, limpiar));
        }
    }

    return checks;
}

// ---------------------------------------------------------------------------

async function revisarProyecto(url, clave, limpiar) {
    const res = await pedir(`${url}/rest/v1/`, { headers: cabeceras(clave), sinCuerpo: true });

    if (res.status === 0) {
        return falla('supabase.proyecto', 'El proyecto de Supabase no responde',
            `No hubo respuesta de la API (${limpiar(res.error)}). Si el proyecto está pausado, se reactiva desde el panel de Supabase. Mientras tanto, los leads no se guardan.`);
    }
    if (res.status === 540 || res.status === 503 || res.status >= 500) {
        return falla('supabase.proyecto', 'El proyecto de Supabase está pausado o caído',
            `La API respondió ${res.status}. Mientras siga así, los leads del chat no se guardan y el portal de clientes no funciona. `
            + 'Reactívalo desde el panel de Supabase.', { status: res.status });
    }
    return ok('supabase.proyecto', 'El proyecto de Supabase está activo',
        `La API respondió ${res.status} en ${res.ms} ms.`, { status: res.status, ms: res.ms });
}

async function revisarLeads(url, service, limpiar) {
    const checks = [];

    // 2. La tabla existe y la clave de servicio puede leerla. Solo se pide el id.
    const lectura = await pedir(`${url}/rest/v1/leads?select=id&limit=1`, { headers: cabeceras(service) });
    if (lectura.status !== 200) {
        const error = lectura.json() || {};
        const codigo = error.code || '';
        let causa = 'La conexión con la base falló.';
        if (lectura.status === 404 || codigo === '42P01' || codigo === 'PGRST205') causa = 'La tabla public.leads no existe (¿se renombró o se borró?).';
        else if (lectura.status === 401 || lectura.status === 403) causa = 'La clave de servicio fue rechazada: está vencida, rotada o mal copiada.';
        checks.push(falla('supabase.leads.tabla', 'Los leads del chat no se pueden guardar',
            `${causa} Status ${lectura.status}. Mientras esto siga, cada lead se pierde en silencio (solo queda el correo, si sale).`,
            { status: lectura.status, codigo: codigo || null, mensaje: limpiar(error.message || lectura.error || '') || null }));
        checks.push(omitido('supabase.leads.recientes', 'Leads recientes', 'No se pudo leer la tabla.'));
        return checks;
    }

    const total = await contar(url, service, 'leads', '');
    checks.push(ok('supabase.leads.tabla', 'La tabla de leads existe y la conexión funciona',
        `La clave de servicio lee public.leads${total !== null ? ` (${total} leads en total)` : ''}.`,
        total !== null ? { total } : null));

    // 3. Leads recientes. Solo conteos.
    const ahora = Date.now();
    const hace24h = new Date(ahora - DIA).toISOString();
    const hace7d = new Date(ahora - 7 * DIA).toISOString();
    const haceUnaHora = new Date(ahora - HORA).toISOString();

    const ultimas24 = await contar(url, service, 'leads', `created_at=gte.${hace24h}`);
    const ultimos7 = await contar(url, service, 'leads', `created_at=gte.${hace7d}`);

    if (ultimas24 === null || ultimos7 === null) {
        checks.push(aviso('supabase.leads.recientes', 'No se pudieron contar los leads recientes',
            'La tabla responde, pero el conteo por fecha falló. ¿Cambió la columna created_at?'));
    } else if (ultimas24 === 0) {
        checks.push(aviso('supabase.leads.recientes', 'No entraron leads en las últimas 24 horas',
            `${ultimos7} en los últimos 7 días. Puede ser falta de tráfico, no necesariamente una falla: `
            + (ultimos7 === 0 ? 'una semana sin leads merece una prueba a mano desde el chat del sitio.' : 'la conexión sí registró leads esta semana.'),
            { ultimas24h: ultimas24, ultimos7dias: ultimos7 }));
    } else {
        checks.push(ok('supabase.leads.recientes', 'Están entrando leads',
            `${ultimas24} en las últimas 24 horas, ${ultimos7} en los últimos 7 días.`,
            { ultimas24h: ultimas24, ultimos7dias: ultimos7 }));
    }

    // Lead guardado hace más de una hora sin aviso por correo = el correo no salió.
    const sinAviso = await contar(url, service, 'leads', `notified_at=is.null&created_at=lt.${haceUnaHora}`);
    if (sinAviso === null) {
        checks.push(aviso('supabase.leads.aviso-correo', 'No se pudo revisar el aviso por correo de los leads',
            'El conteo por notified_at falló. ¿Cambió la columna?'));
    } else if (sinAviso > 0) {
        checks.push(aviso('supabase.leads.aviso-correo', `Hay ${sinAviso} lead(s) sin correo de aviso`,
            'Quedaron guardados hace más de una hora pero el correo nunca salió (notified_at vacío). '
            + 'Revisa Resend y los logs de Vercel, y mira esos leads directo en Supabase.',
            { sinAviso }));
    } else {
        checks.push(ok('supabase.leads.aviso-correo', 'Todos los leads tuvieron su correo de aviso',
            'Ningún lead de hace más de una hora quedó sin notificar.'));
    }

    return checks;
}

async function revisarRls(url, anon, service, tabla, limpiar) {
    const idCheck = `supabase.rls.${tabla}`;
    const res = await pedir(`${url}/rest/v1/${tabla}?select=*&limit=1`, { headers: cabeceras(anon) });
    const cuerpo = res.json();
    const codigo = cuerpo && !Array.isArray(cuerpo) ? cuerpo.code || '' : '';
    const esLeads = tabla === 'leads';
    const titulo = esLeads
        ? 'Un visitante anónimo no puede leer los leads'
        : `Un visitante sin sesión no puede leer ${tabla}`;

    if (res.status === 0) {
        return aviso(idCheck, `Prueba de RLS en ${tabla} sin respuesta`, limpiar(res.error));
    }

    // Error de permiso de la base (42501): RLS o revoke haciendo su trabajo.
    // Un 401 sin ese código es otra cosa: la clave pública fue rechazada.
    if (codigo === '42501' || res.status === 403) {
        return ok(idCheck, titulo, `La clave pública recibe "permiso denegado" (status ${res.status}).`,
            { status: res.status, codigo: codigo || null });
    }

    if (res.status === 401) {
        return aviso(idCheck, `Prueba de RLS en ${tabla} no concluyente`,
            'Supabase rechazó la clave pública (VITE_SUPABASE_ANON_KEY): puede estar vencida o mal copiada. '
            + 'Si es así, el login y el portal de clientes tampoco funcionan.',
            { status: res.status, codigo: codigo || null, mensaje: limpiar(cuerpo?.message || '') || null });
    }

    if (res.status === 404 || codigo === '42P01' || codigo === 'PGRST205') {
        return esLeads
            ? ok(idCheck, titulo, 'La tabla no es visible para la clave pública.', { status: res.status })
            : aviso(idCheck, `La tabla ${tabla} no existe`,
                'No hay fuga posible, pero el Perfil de Gestión 360 la necesita. ¿Se renombró o se borró?',
                { status: res.status, codigo: codigo || null });
    }

    if (res.status === 200 && Array.isArray(cuerpo)) {
        if (cuerpo.length > 0) {
            // No se vuelca el contenido: solo se informa que hay filas visibles.
            return falla(idCheck, esLeads
                ? 'FUGA DE DATOS: cualquiera puede leer los leads'
                : `FUGA DE DATOS: cualquiera puede leer ${tabla}`,
                'La clave pública (que viaja en el JavaScript del sitio) devuelve filas sin iniciar sesión. '
                + `Hay datos personales expuestos. Revisa RLS en public.${tabla} de inmediato.`,
                { status: 200, filasVisibles: cuerpo.length });
        }

        // 0 filas. Si la tabla tiene datos (según la clave de servicio), la prueba es concluyente.
        const real = service ? await contar(url, service, tabla, '') : null;
        const detalle = real > 0
            ? `La tabla tiene ${real} fila(s) y la clave pública no ve ninguna: RLS funciona.`
            : 'La clave pública recibe 0 filas. '
              + (real === 0 ? 'La tabla está vacía, así que la prueba se vuelve concluyente cuando tenga datos.' : '');
        return ok(idCheck, titulo, detalle.trim(), { status: 200, filasVisibles: 0, filasReales: real });
    }

    return aviso(idCheck, `Respuesta inesperada al probar RLS en ${tabla}`,
        `Status ${res.status}.`, { status: res.status, codigo: codigo || null, mensaje: limpiar(cuerpo?.message || '') || null });
}

// ---------------------------------------------------------------------------

function cabeceras(clave) {
    return { apikey: clave, Authorization: `Bearer ${clave}`, Accept: 'application/json' };
}

/** Cuenta filas con HEAD + Prefer: count=exact. Devuelve null si no pudo. */
async function contar(url, clave, tabla, filtro) {
    const consulta = `select=id${filtro ? `&${filtro}` : ''}`;
    const res = await pedir(`${url}/rest/v1/${tabla}?${consulta}`, {
        method: 'HEAD',
        sinCuerpo: true,
        headers: { ...cabeceras(clave), Prefer: 'count=exact', Range: '0-0' },
    });
    if (res.status !== 200 && res.status !== 206) return null;
    const rango = res.headers['content-range'] || '';
    const total = Number(rango.split('/')[1]);
    return Number.isFinite(total) ? total : null;
}

/** Borra cualquier clave de un texto antes de que llegue al informe o a la consola. */
function censor(claves) {
    const reales = claves.filter((c) => c && c.length > 8);
    return (texto) => {
        let limpio = String(texto || '');
        for (const c of reales) limpio = limpio.split(c).join('[clave oculta]');
        return limpio.replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[clave oculta]')
            .replace(/sb_(secret|publishable)_[A-Za-z0-9_-]+/g, '[clave oculta]')
            .slice(0, 300);
    };
}

/**
 * Variables de entorno: primero las del proceso (GitHub Actions las pasa así),
 * y como respaldo .env y .env.local de la raíz del repo. Se leen sin
 * dependencias y nunca se imprimen.
 */
function leerVariables() {
    const nombres = ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
    const archivo = {};
    for (const nombreArchivo of ['.env', '.env.local']) {
        let texto = '';
        try { texto = fs.readFileSync(path.join(RAIZ, nombreArchivo), 'utf8'); } catch { continue; }
        for (const linea of texto.split(/\r?\n/)) {
            const m = linea.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/);
            if (!m || !nombres.includes(m[1])) continue;
            let valor = m[2].trim();
            if (/^(['"]).*\1$/.test(valor)) valor = valor.slice(1, -1);
            if (valor) archivo[m[1]] = valor; // .env.local pisa a .env, como en Vite
        }
    }
    const env = {};
    for (const n of nombres) env[n] = (process.env[n] || '').trim() || archivo[n] || '';
    return env;
}
