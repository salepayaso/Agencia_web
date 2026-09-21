// Utilidades de red: fetch con timeout, medición de tiempo, certificado SSL y DNS.

import tls from 'node:tls';
import dns from 'node:dns/promises';

const TIMEOUT_MS = 15_000;

/**
 * fetch con timeout y medición. Nunca lanza por status: devuelve el resultado
 * para que cada chequeo decida. Si la red falla, devuelve { error }.
 */
export async function pedir(url, opciones = {}) {
    const control = new AbortController();
    const timer = setTimeout(() => control.abort(), opciones.timeoutMs || TIMEOUT_MS);
    const inicio = Date.now();

    try {
        const res = await fetch(url, {
            redirect: opciones.redirect || 'follow',
            ...opciones,
            signal: control.signal,
            headers: {
                'User-Agent': 'Interfaz360-Checkup/1.0 (+https://www.interfaz360.cl)',
                ...(opciones.headers || {}),
            },
        });
        const cuerpo = opciones.sinCuerpo ? '' : await res.text();
        return {
            url,
            status: res.status,
            ms: Date.now() - inicio,
            headers: Object.fromEntries(res.headers.entries()),
            cuerpo,
            json: () => { try { return JSON.parse(cuerpo); } catch { return null; } },
        };
    } catch (error) {
        return { url, status: 0, ms: Date.now() - inicio, headers: {}, cuerpo: '', error: String(error?.message || error), json: () => null };
    } finally {
        clearTimeout(timer);
    }
}

/** POST JSON simulando el navegador del sitio (manda Origin, como haría el front). */
export function postJson(url, cuerpo, origen) {
    return pedir(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(origen ? { Origin: origen, Referer: `${origen}/` } : {}),
        },
        body: JSON.stringify(cuerpo),
    });
}

/** Días que le quedan al certificado SSL, o null si no se pudo leer. */
export function certificadoSsl(hostname, puerto = 443) {
    return new Promise((resolve) => {
        const socket = tls.connect({ host: hostname, port: puerto, servername: hostname, timeout: 10_000 }, () => {
            const cert = socket.getPeerCertificate();
            socket.end();
            if (!cert || !cert.valid_to) return resolve(null);
            const vence = new Date(cert.valid_to);
            resolve({
                emisor: cert.issuer?.O || cert.issuer?.CN || 'desconocido',
                vence,
                diasRestantes: Math.floor((vence - Date.now()) / 86_400_000),
            });
        });
        socket.on('error', () => resolve(null));
        socket.on('timeout', () => { socket.destroy(); resolve(null); });
    });
}

/** Resuelve A/AAAA del host. Devuelve [] si no resuelve. */
export async function resolverDns(hostname) {
    try {
        const registros = await dns.lookup(hostname, { all: true });
        return registros.map((r) => r.address);
    } catch {
        return [];
    }
}
