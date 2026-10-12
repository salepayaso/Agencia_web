// Brief por enlace personal (/brief/:token). El cliente no tiene cuenta: el token
// de 64 caracteres que creó el admin es la llave, y se valida aquí con la service role.
//
// GET  /api/brief?t=<token>               → el brief guardado y si todavía se puede editar
// POST /api/brief { t, brief, send }      → guarda; con send = true además lo envía
//                                           (resumen al equipo + confirmación al cliente)

import { checkBriefLimit, getClientIp, isAllowedOrigin } from './_lib/guardrails.js';
import { rest, rows } from './_lib/orderStore.js';
import { sendBriefToTeam, sendBriefReceipt } from './_lib/briefMail.js';
import { cleanBrief, briefError, emptyBrief, briefNumber, BRIEF_EDITABLE } from '../src/data/brief.js';

const validToken = (t) => typeof t === 'string' && /^[a-f0-9]{64}$/.test(t);

async function findQuote(token) {
    const [quote] = await rows(await rest(`quotes?token=eq.${token}&select=*`), 'leer brief');
    return quote || null;
}

// Lo que ve el cliente: nunca la nota interna ni la cotización en preparación.
const forClient = (q) => ({
    number: briefNumber(q),
    status: q.status,
    editable: BRIEF_EDITABLE.includes(q.status),
    sent: !!q.brief_sent_at,
    savedAt: q.brief_saved_at,
    brief: q.brief && Object.keys(q.brief).length
        ? cleanBrief(q.brief)
        : emptyBrief({ name: q.client_name, email: q.client_email, phone: q.client_phone }),
});

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const ip = getClientIp(req);

    try {
        if (req.method === 'GET') {
            const limit = checkBriefLimit(ip, 'leer');
            if (limit) return res.status(429).json({ error: limit });
            const token = String(req.query?.t || '');
            const quote = validToken(token) ? await findQuote(token) : null;
            if (!quote || quote.status === 'cancelada') return res.status(404).json({ error: 'no_existe' });
            return res.status(200).json(forClient(quote));
        }

        if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });
        const { t, brief: raw, send } = req.body || {};
        const limit = checkBriefLimit(ip, send ? 'enviar' : 'guardar');
        if (limit) return res.status(429).json({ error: limit });

        const quote = validToken(t) ? await findQuote(t) : null;
        if (!quote || quote.status === 'cancelada') return res.status(404).json({ error: 'no_existe' });
        if (!BRIEF_EDITABLE.includes(quote.status)) {
            return res.status(409).json({ error: 'Ya estamos preparando tu cotización, así que el formulario no se puede cambiar. Si necesitas agregar algo, escríbenos por WhatsApp al +56 9 5414 6176.' });
        }

        const brief = cleanBrief(raw);
        if (send) {
            const error = briefError(brief);
            if (error) return res.status(400).json({ error });
        }

        const now = new Date().toISOString();
        const again = !!quote.brief_sent_at;
        const patch = {
            brief,
            brief_saved_at: now,
            updated_at: now,
            ...(send ? { status: 'brief_recibido', brief_sent_at: now } : {}),
        };
        const [saved] = await rows(await rest(`quotes?id=eq.${quote.id}&status=in.(${BRIEF_EDITABLE.join(',')})`, {
            method: 'PATCH', body: patch, prefer: 'return=representation',
        }), 'guardar brief');
        if (!saved) return res.status(409).json({ error: 'El formulario ya no se puede cambiar. Escríbenos por WhatsApp al +56 9 5414 6176.' });

        if (send) {
            const origin = req.headers.origin;
            await Promise.all([
                sendBriefToTeam(saved, brief, { origin, again }),
                sendBriefReceipt(saved, brief, { origin }),
            ]);
        }

        return res.status(200).json(forClient(saved));
    } catch (error) {
        console.error('[brief]', error);
        return res.status(500).json({ error: 'No pudimos guardar. Intenta de nuevo en un momento.' });
    }
}
