// Suite 3 — Páginas. Que cada ruta del sitio cargue, que el SPA no rompa al
// refrescar, que el SEO básico esté puesto y que el JS servido no lleve claves.

import { ok, falla, aviso, omitido, esperar } from '../lib/check.mjs';
import { pedir } from '../lib/red.mjs';

export const id = 'paginas';
export const nombre = 'Páginas y navegación';

const MS_LENTO = 2500;

// Rastros de credenciales que jamás deben viajar al navegador.
const RASTROS_DE_CLAVE = [
    [/sk-ant-[a-zA-Z0-9_-]{10,}/, 'clave de la API de Claude'],
    [/\bre_[a-zA-Z0-9]{20,}/, 'clave de Resend'],
    [/service_role/, 'clave service_role de Supabase'],
    [/AIza[0-9A-Za-z_-]{30,}/, 'clave de Google'],
];

export async function run(ctx) {
    const checks = [];
    const rutas = ctx.proyecto.rutas?.length ? ctx.proyecto.rutas : ['/'];

    // --- Cada ruta responde ---
    const lentas = [];
    for (const ruta of rutas) {
        const res = await pedir(ctx.base + ruta);
        const contenido = (res.headers['content-type'] || '').includes('text/html');

        if (res.error) {
            checks.push(falla(`paginas.ruta${ruta}`, `La página ${ruta} no responde`, res.error));
            continue;
        }
        if (res.status !== 200 || !contenido) {
            checks.push(falla(`paginas.ruta${ruta}`, `La página ${ruta} no carga`,
                `Respondió ${res.status} (${res.headers['content-type'] || 'sin tipo'}).`,
                { status: res.status, ms: res.ms }));
            continue;
        }
        if (res.ms > MS_LENTO) lentas.push(`${ruta}: ${res.ms} ms`);
        checks.push(ok(`paginas.ruta${ruta}`, `La página ${ruta} carga bien`, `200 OK en ${res.ms} ms.`));
    }

    if (lentas.length) {
        checks.push(aviso('paginas.velocidad', 'Hay páginas lentas',
            `Sobre ${MS_LENTO} ms de respuesta.`, lentas));
    } else {
        checks.push(ok('paginas.velocidad', 'Tiempos de respuesta correctos', `Todas bajo ${MS_LENTO} ms.`));
    }

    // --- SPA: refrescar una ruta interna no puede dar 404 ---
    const inventada = await pedir(`${ctx.base}/ruta-que-no-existe-${Date.now()}`);
    if (ctx.proyecto.spa === false) {
        checks.push(omitido('paginas.spa', 'Reescritura del SPA', 'Este proyecto no es una SPA.'));
    } else {
        checks.push(esperar(
            inventada.status === 200 && /<div id="root"/.test(inventada.cuerpo),
            'paginas.spa', 'Refrescar cualquier ruta interna funciona',
            'La reescritura del SPA está activa: el cliente puede compartir links directos.',
            `Una ruta desconocida devuelve ${inventada.status}: al refrescar, el visitante ve un error.`,
            { status: inventada.status }));
    }

    // --- Portada: SEO básico ---
    const portada = await pedir(ctx.base + '/');
    const titulo = portada.cuerpo.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || '';
    const descripcion = portada.cuerpo.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
    const og = /property=["']og:(title|image)["']/i.test(portada.cuerpo);

    checks.push(esperar(titulo.length > 10, 'paginas.seo.titulo', 'La portada tiene título',
        `"${titulo}"`, 'La portada no tiene un <title> usable: Google muestra la URL pelada.', titulo));
    checks.push(esperar(descripcion.length > 40, 'paginas.seo.descripcion', 'La portada tiene meta descripción',
        `${descripcion.length} caracteres.`, 'Falta la meta descripción: Google inventa el resumen del resultado.', descripcion));
    checks.push(og
        ? ok('paginas.seo.og', 'Tiene vista previa para redes sociales', 'Al compartir el link sale título e imagen.')
        : aviso('paginas.seo.og', 'Sin vista previa para redes sociales',
            'Al compartir el link por WhatsApp o Instagram sale sin imagen.'));

    // --- robots.txt y sitemap.xml ---
    for (const [archivo, patron] of [['/robots.txt', /user-agent/i], ['/sitemap.xml', /<urlset|<sitemapindex/i]]) {
        const res = await pedir(ctx.base + archivo);
        if (res.status === 200 && patron.test(res.cuerpo)) {
            checks.push(ok(`paginas.seo${archivo}`, `${archivo} publicado`, 'Google puede indexar el sitio correctamente.'));
        } else if (res.status === 200) {
            // Caso típico de SPA: la reescritura devuelve index.html para todo,
            // así que el archivo "responde" pero no existe de verdad.
            checks.push(aviso(`paginas.seo${archivo}`, `Falta ${archivo}`,
                'El servidor devuelve la página del sitio en vez del archivo. Sin esto Google indexa a ciegas.'));
        } else {
            checks.push(aviso(`paginas.seo${archivo}`, `Falta ${archivo}`,
                `Respondió ${res.status}. Sin esto Google indexa a ciegas.`));
        }
    }

    // --- El JavaScript servido no lleva claves ---
    checks.push(...await revisarBundle(ctx, portada.cuerpo));

    return checks;
}

async function revisarBundle(ctx, html) {
    const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
    if (!scripts.length) {
        return [aviso('paginas.bundle', 'No se encontró el JavaScript del sitio',
            'No se pudo revisar si el bundle expone credenciales.')];
    }

    const hallazgos = [];
    let revisados = 0;

    for (const src of scripts.slice(0, 6)) {
        const url = src.startsWith('http') ? src : ctx.base + (src.startsWith('/') ? src : `/${src}`);
        const res = await pedir(url);
        if (res.status !== 200) continue;
        revisados += 1;
        for (const [patron, que] of RASTROS_DE_CLAVE) {
            if (patron.test(res.cuerpo)) hallazgos.push(`${que} en ${src}`);
        }
    }

    if (!revisados) {
        return [aviso('paginas.bundle', 'No se pudo descargar el JavaScript del sitio',
            'Quedó sin revisar si el bundle expone credenciales.')];
    }

    return [esperar(hallazgos.length === 0, 'paginas.bundle',
        'El código que llega al navegador no lleva credenciales',
        `${revisados} archivo(s) de JavaScript revisados, sin rastros de claves.`,
        'Hay credenciales viajando al navegador. Rotarlas de inmediato.',
        hallazgos.length ? hallazgos : null)];
}
