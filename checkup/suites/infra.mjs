// Suite 2 — Infraestructura. Lo que hace que el sitio exista antes de tener
// contenido: DNS, certificado SSL, redirección a https y cabeceras de seguridad.
// Aplica a cualquier proyecto con dominio, tenga repo o no.

import { ok, falla, aviso, omitido, esperar } from '../lib/check.mjs';
import { pedir, certificadoSsl, resolverDns } from '../lib/red.mjs';

export const id = 'infra';
export const nombre = 'Infraestructura (DNS, SSL, cabeceras)';

// Cabeceras que el sitio debe mandar sí o sí. El valor es una comprobación:
// o el texto exacto, o una expresión regular.
const CABECERAS_ESPERADAS = [
    ['strict-transport-security', /max-age=\d+/i, 'HSTS: el navegador fuerza https'],
    ['x-frame-options', /^deny$/i, 'Nadie puede meter tu sitio dentro de un iframe'],
    ['x-content-type-options', /^nosniff$/i, 'El navegador no adivina tipos de archivo'],
    ['referrer-policy', /strict-origin/i, 'No se filtra la URL completa al salir del sitio'],
    ['content-security-policy', /default-src/i, 'Solo se ejecuta código de orígenes autorizados'],
];

const DIAS_AVISO_SSL = 21;

export async function run(ctx) {
    const checks = [];
    const url = new URL(ctx.base);
    const host = url.hostname;
    const esLocal = host === 'localhost' || host === '127.0.0.1';

    // --- DNS ---
    if (esLocal) {
        checks.push(omitido('infra.dns', 'Resolución DNS', 'El objetivo es local.'));
    } else {
        const ips = await resolverDns(host);
        checks.push(esperar(ips.length > 0, 'infra.dns', `El dominio ${host} resuelve`,
            `Apunta a ${ips.join(', ')}.`,
            'El dominio no está resolviendo: el sitio no carga para nadie.', ips));
    }

    // --- SSL ---
    if (esLocal || url.protocol !== 'https:') {
        checks.push(omitido('infra.ssl', 'Certificado SSL', 'Solo se revisa en dominios https.'));
    } else {
        const cert = await certificadoSsl(host);
        if (!cert) {
            checks.push(falla('infra.ssl', 'Certificado SSL', 'No se pudo leer el certificado del sitio.'));
        } else if (cert.diasRestantes < 0) {
            checks.push(falla('infra.ssl', 'Certificado SSL vencido',
                `Venció el ${cert.vence.toLocaleDateString('es-CL')}. El navegador muestra alerta de sitio inseguro.`, cert));
        } else if (cert.diasRestantes <= DIAS_AVISO_SSL) {
            checks.push(aviso('infra.ssl', 'El certificado SSL vence pronto',
                `Le quedan ${cert.diasRestantes} días (${cert.vence.toLocaleDateString('es-CL')}).`, cert));
        } else {
            checks.push(ok('infra.ssl', 'Certificado SSL vigente',
                `Válido ${cert.diasRestantes} días más, emitido por ${cert.emisor}.`, cert));
        }
    }

    // --- Redirección a https ---
    if (esLocal || url.protocol !== 'https:') {
        checks.push(omitido('infra.https', 'Redirección a https', 'Solo se revisa en dominios https.'));
    } else {
        const plano = await pedir(`http://${host}/`, { redirect: 'manual', sinCuerpo: true });
        const destino = plano.headers?.location || '';
        checks.push(esperar(
            [301, 302, 307, 308].includes(plano.status) && destino.startsWith('https://'),
            'infra.https', 'Quien entra por http termina en https',
            `Responde ${plano.status} hacia ${destino}.`,
            `No hay redirección a https (status ${plano.status}).`, { status: plano.status, destino }));
    }

    // --- Cabeceras de seguridad ---
    const portada = await pedir(ctx.base + '/');
    if (portada.error) {
        checks.push(falla('infra.cabeceras', 'Cabeceras de seguridad', `El sitio no respondió: ${portada.error}`));
        return checks;
    }

    for (const [nombreCabecera, patron, paraQueSirve] of CABECERAS_ESPERADAS) {
        const valor = portada.headers[nombreCabecera];
        const cumple = typeof valor === 'string' && patron.test(valor);
        // HSTS lo pone la plataforma, no el repo: si falta es aviso, no falla.
        const esCritica = nombreCabecera !== 'strict-transport-security';

        if (cumple) {
            checks.push(ok(`infra.cabecera.${nombreCabecera}`, `Cabecera ${nombreCabecera}`, paraQueSirve, valor));
        } else if (esCritica) {
            checks.push(falla(`infra.cabecera.${nombreCabecera}`, `Falta la cabecera ${nombreCabecera}`,
                `${paraQueSirve}. Valor actual: ${valor || '(ausente)'}.`, valor || null));
        } else {
            checks.push(aviso(`infra.cabecera.${nombreCabecera}`, `Falta la cabecera ${nombreCabecera}`,
                `${paraQueSirve}. La pone la plataforma de hosting, no el código.`, valor || null));
        }
    }

    // El CSP no debe permitir 'unsafe-eval': es la puerta clásica de un script inyectado.
    const csp = portada.headers['content-security-policy'] || '';
    if (csp) {
        checks.push(esperar(!/unsafe-eval/i.test(csp), 'infra.csp.eval',
            'El CSP no permite ejecutar código generado al vuelo',
            "Sin 'unsafe-eval': un script inyectado no puede ejecutarse.",
            "El CSP incluye 'unsafe-eval', lo que abre la puerta a código inyectado.", csp));
    }

    return checks;
}
