// Suite 6 — Botones y enlaces. Lee el código fuente del sitio, junta todos los
// destinos (href, navigate, Link to) y verifica que cada uno lleve a alguna
// parte: rutas que existen, enlaces externos vivos, WhatsApp y correos correctos.

import fs from 'node:fs/promises';
import path from 'node:path';
import { ok, falla, aviso, omitido, esperar } from '../lib/check.mjs';
import { pedir } from '../lib/red.mjs';

export const id = 'enlaces';
export const nombre = 'Botones y enlaces';

export async function run(ctx) {
    if (!ctx.repo) {
        return [omitido('enlaces.sin-repo', 'Sin repositorio local', 'Este proyecto se monitorea solo por red.')];
    }

    const checks = [];
    const raiz = path.join(ctx.repo, 'src');
    const archivos = await listarJsx(raiz);

    if (!archivos.length) {
        return [falla('enlaces.fuente', 'No se encontró el código fuente', `No hay archivos .jsx en ${raiz}.`)];
    }

    const rutasDefinidas = await leerRutas(ctx.repo);
    const destinos = [];
    const fuentes = [];

    for (const archivo of archivos) {
        const codigo = await fs.readFile(archivo, 'utf8');
        const relativo = path.relative(ctx.repo, archivo).replace(/\\/g, '/');
        fuentes.push({ archivo: relativo, codigo });
        destinos.push(...extraerDestinos(codigo, relativo));
    }

    checks.push(ok('enlaces.inventario', 'Inventario de destinos del sitio',
        `${destinos.length} enlaces y botones encontrados en ${archivos.length} componentes.`));

    checks.push(...revisarRutasInternas(destinos, rutasDefinidas));
    checks.push(...revisarWhatsapp(fuentes, ctx));
    checks.push(...revisarCorreos(destinos, ctx));
    checks.push(...revisarPestanaNueva(fuentes));
    checks.push(...await revisarExternos(destinos));

    return checks;
}

async function listarJsx(dir) {
    const salida = [];
    let entradas;
    try {
        entradas = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return salida;
    }
    for (const entrada of entradas) {
        const completo = path.join(dir, entrada.name);
        if (entrada.isDirectory()) salida.push(...await listarJsx(completo));
        else if (/\.jsx?$/.test(entrada.name)) salida.push(completo);
    }
    return salida;
}

async function leerRutas(repo) {
    const codigo = await fs.readFile(path.join(repo, 'src', 'App.jsx'), 'utf8');
    return [...codigo.matchAll(/<Route\s+[^>]*path=["']([^"']+)["']/g)].map((m) => m[1]);
}

// Junta href="...", to="..." de react-router y navigate('...') de los botones.
// También los href={`...`} con plantilla, que es como se arman los enlaces de
// WhatsApp del sitio. Los que traen ${...} quedan marcados como dinámicos:
// no se pueden verificar como URL, pero igual se revisa el número o el correo.
function extraerDestinos(codigo, archivo) {
    const destinos = [];
    const patrones = [
        [/href=["']([^"'{]+)["']/g, 'href'],
        [/href=\{`([^`]*)`\}/g, 'href'],
        [/\bto=["']([^"'{]+)["']/g, 'Link'],
        [/\bto=\{`([^`]*)`\}/g, 'Link'],
        [/navigate\(\s*["'`]([^"'`]+)["'`]/g, 'navigate'],
        [/window\.open\(\s*["'`]([^"'`]+)["'`]/g, 'window.open'],
    ];
    for (const [patron, tipo] of patrones) {
        for (const m of codigo.matchAll(patron)) {
            const valor = m[1].trim();
            destinos.push({ valor, tipo, archivo, dinamico: valor.includes('${') });
        }
    }
    return destinos;
}

function revisarRutasInternas(destinos, rutasDefinidas) {
    const internas = destinos.filter((d) => d.valor.startsWith('/') && !d.valor.startsWith('//') && !d.dinamico);
    const rotas = [];

    for (const destino of internas) {
        const ruta = destino.valor.split(/[?#]/)[0].replace(/\/$/, '') || '/';
        // Archivos estáticos servidos desde /public: no son rutas del router.
        if (/\.[a-z0-9]{2,4}$/i.test(ruta)) continue;
        if (!rutasDefinidas.includes(ruta)) rotas.push(`${ruta} (${destino.archivo}, ${destino.tipo})`);
    }

    return [esperar(rotas.length === 0, 'enlaces.rutas-internas',
        'Todos los botones internos llevan a una página que existe',
        `${internas.length} destinos internos, todos con ruta definida en App.jsx.`,
        'Hay botones que apuntan a páginas que no existen: el visitante queda en blanco.',
        rotas.length ? rotas : null)];
}

function revisarWhatsapp(fuentes, ctx) {
    const esperado = (ctx.proyecto.whatsapp || '').replace(/\D/g, '');

    // Los enlaces de WhatsApp se arman con plantillas y mensajes precargados,
    // así que se busca el número directo en el código, no el href completo.
    const numeros = [];
    for (const { archivo, codigo } of fuentes) {
        for (const m of codigo.matchAll(/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?(\d+)/g)) {
            numeros.push({ numero: m[1], archivo });
        }
    }

    if (!numeros.length) {
        return [aviso('enlaces.whatsapp', 'No hay enlaces de WhatsApp en el sitio',
            'El canal de contacto principal no aparece en el código.')];
    }
    if (!esperado) {
        return [ok('enlaces.whatsapp', 'Enlaces de WhatsApp presentes', `${numeros.length} enlaces encontrados.`)];
    }

    const malos = [...new Set(
        numeros.filter((n) => n.numero !== esperado).map((n) => `${n.numero} en ${n.archivo}`),
    )];

    return [esperar(malos.length === 0, 'enlaces.whatsapp',
        'Todos los botones de WhatsApp llevan al número correcto',
        `${numeros.length} botones repartidos en el sitio, todos al +${esperado}.`,
        'Hay botones de WhatsApp con otro número: esos mensajes no te llegan.',
        malos.length ? malos : null)];
}

function revisarCorreos(destinos, ctx) {
    const permitidos = ctx.proyecto.correos || [];
    // Los mailto armados con plantilla (mailto:${...}) no se pueden verificar
    // como texto: el correo sale de una constante del componente.
    const enlaces = destinos.filter((d) => d.valor.startsWith('mailto:') && !d.dinamico);

    if (!enlaces.length) {
        return [omitido('enlaces.correo', 'Enlaces de correo', 'El sitio no publica enlaces mailto.')];
    }
    if (!permitidos.length) {
        return [ok('enlaces.correo', 'Enlaces de correo presentes', `${enlaces.length} enlaces mailto.`)];
    }

    const malos = enlaces
        .map((d) => ({ correo: d.valor.replace('mailto:', '').split('?')[0].toLowerCase(), archivo: d.archivo }))
        .filter((d) => !permitidos.includes(d.correo))
        .map((d) => `${d.correo} (${d.archivo})`);

    return [esperar(malos.length === 0, 'enlaces.correo',
        'Los enlaces de correo apuntan a tus casillas',
        `${enlaces.length} enlaces, todos a ${permitidos.join(' o ')}.`,
        'Hay enlaces mailto a una casilla que no es tuya.', malos.length ? malos : null)];
}

function revisarPestanaNueva(fuentes) {
    // Un enlace con target="_blank" sin rel="noopener" deja que la página de
    // destino manipule la pestaña original. Se busca el tag <a> completo,
    // porque los atributos pueden venir en cualquier orden.
    const desprotegidos = [];
    let total = 0;

    for (const { archivo, codigo } of fuentes) {
        for (const m of codigo.matchAll(/<a\b[^>]*>/g)) {
            const tag = m[0];
            if (!/target=["']_blank["']/.test(tag)) continue;
            total += 1;
            // rel="noreferrer" ya implica noopener en los navegadores actuales.
            if (!/rel=["'][^"']*(noopener|noreferrer)/.test(tag)) {
                desprotegidos.push(`${archivo}: ${tag.replace(/\s+/g, ' ').slice(0, 120)}`);
            }
        }
    }

    if (!total) {
        return [omitido('enlaces.pestana-nueva', 'Enlaces en pestaña nueva', 'El sitio no abre enlaces en otra pestaña.')];
    }

    return [esperar(desprotegidos.length === 0, 'enlaces.pestana-nueva',
        'Los enlaces que abren otra pestaña están protegidos',
        `${total} enlaces con target="_blank", todos con rel="noopener" o "noreferrer".`,
        'Hay enlaces que abren otra pestaña sin rel="noopener" ni "noreferrer": el sitio de destino puede manipular tu pestaña.',
        desprotegidos.length ? desprotegidos : null)];
}

async function revisarExternos(destinos) {
    const externos = [...new Set(
        destinos
            .filter((d) => /^https?:\/\//.test(d.valor) && !d.dinamico)
            .map((d) => d.valor.split('#')[0]),
    )].slice(0, 15);

    if (!externos.length) {
        return [omitido('enlaces.externos', 'Enlaces externos', 'El sitio no enlaza a otros dominios.')];
    }

    const caidos = [];
    for (const url of externos) {
        const res = await pedir(url, { sinCuerpo: true, timeoutMs: 10_000 });
        // 405 y 403 son comunes en redes sociales ante un bot: no son caídas.
        const vivo = res.status > 0 && res.status < 500 && res.status !== 404;
        if (!vivo) caidos.push(`${url} → ${res.error || res.status}`);
    }

    return [esperar(caidos.length === 0, 'enlaces.externos',
        'Los enlaces a sitios externos están vivos',
        `${externos.length} destinos externos revisados (redes, WhatsApp, clientes).`,
        'Hay enlaces externos caídos o que devuelven 404.', caidos.length ? caidos : null)];
}
