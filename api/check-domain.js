import { normalizeDomain, queryWhoisClWithRetry, parseWhoisResponse } from './_lib/whois.js';

// Rate limit en memoria por instancia: suficiente para frenar abuso básico
// sin infraestructura extra.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);

    if (hits.size > 500) {
        for (const [key, times] of hits) {
            if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
        }
    }

    return recent.length > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const forwarded = String(req.headers['x-forwarded-for'] || '');
    const ip = forwarded.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Demasiadas consultas. Intenta de nuevo en un minuto.' });
    }

    const name = normalizeDomain(req.query?.domain);
    if (!name) {
        return res.status(400).json({ error: 'Dominio inválido. Usa solo letras, números y guiones.' });
    }

    try {
        const domain = `${name}.cl`;
        const raw = await queryWhoisClWithRetry(domain);
        return res.status(200).json(parseWhoisResponse(domain, raw));
    } catch (error) {
        console.error('WHOIS error:', error);
        return res.status(502).json({ error: 'No pudimos completar la consulta. Intenta de nuevo en unos segundos.' });
    }
}
