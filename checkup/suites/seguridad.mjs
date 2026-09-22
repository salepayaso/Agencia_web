// Suite 7 — Seguridad del código. Responde a la pregunta "¿alguien metió mano
// donde no debía?": archivos cambiados sin visto bueno, credenciales filtradas
// al repositorio público, dependencias con vulnerabilidades conocidas y
// configuración de seguridad que se haya aflojado.

import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ok, falla, aviso, omitido, esperar } from '../lib/check.mjs';
import { huellaProyecto, leerBaseline, comparar } from '../lib/integridad.mjs';

const correr = promisify(execFile);
const correrEnConsola = promisify(exec);

export const id = 'seguridad';
export const nombre = 'Seguridad del código';

// Rastros de credenciales reales. Se buscan solo en archivos versionados:
// lo que está en .gitignore no viaja a GitHub.
const RASTROS = [
    [/sk-ant-[a-zA-Z0-9_-]{20,}/, 'clave de la API de Claude'],
    [/\bre_[a-zA-Z0-9]{24,}/, 'clave de Resend'],
    [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'token JWT (clave de Supabase)'],
    [/AIza[0-9A-Za-z_-]{33}/, 'clave de Google'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'llave privada'],
];

// Archivos que jamás pueden quedar versionados en un repositorio público.
const NUNCA_VERSIONADOS = ['.env', '.env.local', 'agent_prompt.json', 'agent_prompt.txt', 'agent_guardrails.json'];

// Variables que el sitio necesita para funcionar completo en producción.
const VARIABLES_REQUERIDAS = [
    ['ANTHROPIC_API_KEY', 'el agente IA no responde'],
    ['AGENT_GUARDRAILS', 'el chat se apaga entero por seguridad'],
    ['RESEND_API_KEY', 'no llegan los correos de contacto ni los leads'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'los leads del chat no se guardan en la base'],
    ['VITE_SUPABASE_URL', 'no hay conexión con Supabase'],
    ['VITE_SUPABASE_ANON_KEY', 'no hay conexión con Supabase'],
    ['CRON_SECRET', 'el cron que mantiene viva la base queda sin protección'],
];

async function git(repo, args) {
    try {
        const { stdout } = await correr('git', args, { cwd: repo, maxBuffer: 20 * 1024 * 1024 });
        return stdout;
    } catch {
        return null;
    }
}

export async function run(ctx) {
    if (!ctx.repo) {
        return [omitido('seguridad.sin-repo', 'Sin repositorio local', 'Este proyecto se monitorea solo por red.')];
    }

    const checks = [];
    checks.push(...await revisarIntegridad(ctx));
    checks.push(...await revisarArchivosProhibidos(ctx));
    checks.push(...await revisarSecretos(ctx));
    checks.push(...await revisarSinVersionar(ctx));
    checks.push(...await revisarDependencias(ctx));
    checks.push(...await revisarConfiguracion(ctx));
    checks.push(...await revisarVariables(ctx));
    return checks;
}

async function revisarIntegridad(ctx) {
    const baseline = await leerBaseline(ctx.repo);
    const actual = await huellaProyecto(ctx.repo);

    if (!baseline) {
        return [aviso('seguridad.integridad', 'Todavía no hay huella de referencia',
            `Se vigilan ${Object.keys(actual).length} archivos. Corre "npm run checkup:baseline" cuando el código esté como quieres dejarlo.`)];
    }

    const diff = comparar(baseline, actual);
    const cambios = diff.modificados.length + diff.nuevos.length + diff.eliminados.length;
    const desde = new Date(baseline.generado).toLocaleString('es-CL');

    if (!cambios) {
        return [ok('seguridad.integridad', 'El código está idéntico al último visto bueno',
            `${diff.total} archivos vigilados, sin un solo cambio desde el ${desde}.`)];
    }

    // No es una falla: tú mismo cambias código todos los días. Es un aviso para
    // que ningún cambio pase sin que alguien lo haya mirado.
    return [aviso('seguridad.integridad', 'Hay archivos que cambiaron desde el último visto bueno',
        `${cambios} cambios sobre ${diff.total} archivos vigilados (referencia del ${desde}). Si son tuyos, renueva la huella; si no reconoces alguno, revísalo.`,
        {
            modificados: diff.modificados,
            nuevos: diff.nuevos,
            eliminados: diff.eliminados,
        })];
}

async function revisarArchivosProhibidos(ctx) {
    const listado = await git(ctx.repo, ['ls-files']);
    if (listado === null) {
        return [aviso('seguridad.versionados', 'No se pudo leer el repositorio', 'El comando git no respondió.')];
    }

    const versionados = listado.split('\n').map((l) => l.trim()).filter(Boolean);
    const filtrados = NUNCA_VERSIONADOS.filter((archivo) => versionados.includes(archivo));

    return [esperar(filtrados.length === 0, 'seguridad.versionados',
        'Los archivos con credenciales no están en el repositorio',
        'Ni .env ni el prompt del agente viajan a GitHub, que es público.',
        'Hay archivos con credenciales versionados en un repositorio público. Rotar esas claves ahora.',
        filtrados.length ? filtrados : null)];
}

async function revisarSecretos(ctx) {
    const listado = await git(ctx.repo, ['ls-files']);
    if (listado === null) return [];

    const archivos = listado.split('\n').map((l) => l.trim()).filter(Boolean)
        .filter((f) => /\.(js|jsx|mjs|cjs|ts|tsx|json|html|css|md|yml|yaml|sql|txt)$/i.test(f))
        .filter((f) => !f.startsWith('package-lock.json'));

    const hallazgos = [];
    for (const archivo of archivos) {
        let contenido;
        try {
            contenido = await fs.readFile(path.join(ctx.repo, archivo), 'utf8');
        } catch {
            continue;
        }
        for (const [patron, que] of RASTROS) {
            const m = contenido.match(patron);
            // La clave anónima de Supabase es pública por diseño: va en el front.
            if (m && !(que.includes('Supabase') && /anon/i.test(contenido.slice(Math.max(0, m.index - 80), m.index)))) {
                hallazgos.push(`${que} en ${archivo}`);
            }
        }
    }

    return [esperar(hallazgos.length === 0, 'seguridad.secretos',
        'No hay credenciales escritas en el código',
        `${archivos.length} archivos versionados revisados, sin rastros de claves.`,
        'Hay credenciales dentro del código versionado. Rotarlas y sacarlas del repositorio.',
        hallazgos.length ? hallazgos : null)];
}

async function revisarSinVersionar(ctx) {
    const estado = await git(ctx.repo, ['status', '--porcelain']);
    if (estado === null) return [];

    // Archivos nuevos, sin seguimiento, dentro del código que se publica.
    const nuevos = estado.split('\n')
        .filter((l) => l.startsWith('??'))
        .map((l) => l.slice(3).trim())
        .filter((f) => /^(api|src|public)\//.test(f));

    if (!nuevos.length) {
        return [ok('seguridad.sin-seguimiento', 'No hay archivos desconocidos en el código publicado',
            'Todo lo que está en api/, src/ y public/ es código conocido.')];
    }

    return [aviso('seguridad.sin-seguimiento', 'Hay archivos nuevos sin versionar en el código publicado',
        'Si son tuyos, confírmalos con un commit. Si no los reconoces, bórralos antes de desplegar.', nuevos)];
}

async function revisarDependencias(ctx) {
    const checks = [];

    // npm audit sobre lo que llega a producción.
    let auditoria = null;
    try {
        // Con shell, porque en Windows npm es un .cmd y no se puede invocar directo.
        const { stdout } = await correrEnConsola('npm audit --omit=dev --json', {
            cwd: ctx.repo, maxBuffer: 20 * 1024 * 1024,
        });
        auditoria = JSON.parse(stdout);
    } catch (error) {
        // npm audit sale con código distinto de 0 cuando encuentra algo:
        // el JSON igual viene en stdout.
        try { auditoria = JSON.parse(error.stdout || ''); } catch { auditoria = null; }
    }

    if (!auditoria?.metadata?.vulnerabilities) {
        checks.push(aviso('seguridad.dependencias', 'No se pudo auditar las dependencias',
            'npm audit no entregó resultado (¿sin conexión?).'));
    } else {
        const v = auditoria.metadata.vulnerabilities;
        const graves = (v.critical || 0) + (v.high || 0);
        const menores = (v.moderate || 0) + (v.low || 0);
        const detalle = `crítica: ${v.critical || 0}, alta: ${v.high || 0}, media: ${v.moderate || 0}, baja: ${v.low || 0}.`;

        if (graves > 0) {
            checks.push(falla('seguridad.dependencias', 'Hay dependencias con vulnerabilidades graves',
                `${detalle} Corre "npm audit fix" y vuelve a desplegar.`, v));
        } else if (menores > 0) {
            checks.push(aviso('seguridad.dependencias', 'Hay dependencias con vulnerabilidades menores', detalle, v));
        } else {
            checks.push(ok('seguridad.dependencias', 'Las dependencias del sitio están limpias',
                'npm audit no encontró vulnerabilidades conocidas en producción.'));
        }
    }

    // Scripts que corren solos al instalar: la vía clásica de un paquete malicioso.
    try {
        const pkg = JSON.parse(await fs.readFile(path.join(ctx.repo, 'package.json'), 'utf8'));
        const automaticos = ['preinstall', 'install', 'postinstall'].filter((s) => pkg.scripts?.[s]);
        checks.push(esperar(automaticos.length === 0, 'seguridad.scripts',
            'El proyecto no ejecuta scripts automáticos al instalar',
            'No hay preinstall/install/postinstall, que es por donde entra un paquete malicioso.',
            'El proyecto ejecuta scripts al instalar. Revisar qué hacen.', automaticos));
    } catch {
        checks.push(aviso('seguridad.scripts', 'No se pudo leer package.json', 'Quedó sin revisar.'));
    }

    return checks;
}

async function revisarConfiguracion(ctx) {
    let vercel;
    try {
        vercel = JSON.parse(await fs.readFile(path.join(ctx.repo, 'vercel.json'), 'utf8'));
    } catch {
        return [aviso('seguridad.vercel', 'No hay vercel.json', 'Las cabeceras de seguridad no están definidas en el repositorio.')];
    }

    const cabeceras = (vercel.headers || []).flatMap((h) => h.headers || []);
    const nombres = cabeceras.map((h) => String(h.key).toLowerCase());
    const csp = cabeceras.find((h) => String(h.key).toLowerCase() === 'content-security-policy')?.value || '';
    const faltantes = ['x-frame-options', 'x-content-type-options', 'referrer-policy', 'content-security-policy']
        .filter((c) => !nombres.includes(c));

    const checks = [esperar(faltantes.length === 0, 'seguridad.vercel',
        'La configuración de despliegue define las cabeceras de seguridad',
        `${nombres.length} cabeceras declaradas en vercel.json.`,
        'Faltan cabeceras de seguridad en vercel.json.', faltantes.length ? faltantes : null)];

    if (csp) {
        const flojo = [];
        if (/unsafe-eval/i.test(csp)) flojo.push("script-src permite 'unsafe-eval'");
        if (/script-src[^;]*\*/.test(csp)) flojo.push('script-src acepta cualquier dominio');
        checks.push(esperar(flojo.length === 0, 'seguridad.csp',
            'La política de contenido no tiene agujeros evidentes',
            'No se permite código generado al vuelo ni scripts de cualquier origen.',
            'La política de contenido está floja y permite ejecutar código externo.',
            flojo.length ? flojo : null));
    }

    return checks;
}

async function revisarVariables(ctx) {
    let env = '';
    try {
        env = await fs.readFile(path.join(ctx.repo, '.env'), 'utf8');
    } catch {
        return [omitido('seguridad.variables', 'Variables de entorno',
            'No hay .env local. En Vercel se revisan desde el panel del proyecto.')];
    }

    // Solo se mira si el nombre está definido y tiene algo: nunca el valor.
    const definidas = new Set(
        env.split('\n')
            .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/))
            .filter((m) => m && m[2].trim() && m[2].trim() !== '""')
            .map((m) => m[1]),
    );

    const faltantes = VARIABLES_REQUERIDAS.filter(([nombre]) => !definidas.has(nombre));

    if (!faltantes.length) {
        return [ok('seguridad.variables', 'Están todas las variables que el sitio necesita',
            `${VARIABLES_REQUERIDAS.length} variables configuradas (solo se revisan los nombres, nunca los valores).`)];
    }

    // Faltar en el .env local es normal: varias solo viven en Vercel. Por eso
    // es aviso y no falla — lo que importa es que estén arriba, y eso lo
    // comprueban las suites que llaman a los endpoints en producción.
    return [aviso('seguridad.variables', 'Hay variables que no están en tu .env local',
        'Si solo las tienes en Vercel, el sitio publicado funciona igual, pero en local esas funciones no corren.',
        faltantes.map(([n, consecuencia]) => `${n}: sin esto, ${consecuencia}`))];
}
