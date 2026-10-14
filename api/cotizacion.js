// Cotización formal.
//
// GET  /api/cotizacion?t=<token>              → la cotización enviada, para el cliente
// POST /api/cotizacion { t, action: 'accept' } → el cliente la acepta
// Acciones del admin (sesión de admin en Authorization: Bearer <token de Supabase>):
// POST /api/cotizacion { id, action: 'send' }                       → la envía al cliente
// POST /api/cotizacion { id, action: 'confirm_payment', stage }     → confirma una transferencia
// POST /api/cotizacion { id, action: 'request_balance' }            → pide el saldo (sitio listo)
// POST /api/cotizacion { id, action: 'publish', site }              → marca publicado y avisa
//
// Los pagos en línea del anticipo y el saldo van por /api/webpay y /api/mercadopago.
//
// El borrador lo guarda el admin directo en la base (admin_save_quote). Enviar pasa
// por aquí porque además fija las fechas y manda el correo.

import { checkBriefLimit, getClientIp, isAllowedOrigin } from './_lib/guardrails.js';
import { rest, rows, userFromToken } from './_lib/orderStore.js';
import { sendQuoteToClient, sendAcceptToTeam, sendAcceptReceipt, sendBalanceRequest, sendPublished } from './_lib/quoteMail.js';
import { settleQuotePayment, siteOrigin } from './_lib/quotePayments.js';
import {
    cleanQuote, quoteError, quoteNumber, QUOTE_VISIBLE, VALID_DAYS, isExpired, pendingStage, stageAmount,
} from '../src/data/quote.js';

const validToken = (t) => typeof t === 'string' && /^[a-f0-9]{64}$/.test(t);

async function findBy(filter) {
    const [row] = await rows(await rest(`quotes?${filter}&select=*`), 'leer cotización');
    return row || null;
}

async function isAdmin(userId) {
    const list = await rows(await rest(`admins?user_id=eq.${userId}&select=user_id`), 'admin');
    return list.length > 0;
}

async function patch(id, onlyIf, body) {
    const [row] = await rows(await rest(`quotes?id=eq.${Number(id)}&status=in.(${onlyIf.join(',')})`, {
        method: 'PATCH', body: { ...body, updated_at: new Date().toISOString() }, prefer: 'return=representation',
    }), 'actualizar cotización');
    return row || null;
}

// Lo que ve el cliente: nunca la nota interna ni el brief.
const forClient = (row) => ({
    id: row.id,
    created_at: row.created_at,
    number: quoteNumber(row),
    status: row.status,
    accepted: !!row.accepted_at,
    expired: isExpired(row),
    quote: cleanQuote(row.quote),
    // Pagos: qué falta pagar ahora (anticipo | saldo | null) y las fechas de cada paso
    due: pendingStage(row),
    depositPaidAt: row.deposit_paid_at,
    balancePaidAt: row.balance_paid_at,
    publishedAt: row.published_at,
});

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const ip = getClientIp(req);

    try {
        if (req.method === 'GET') {
            const limit = checkBriefLimit(ip, 'leer');
            if (limit) return res.status(429).json({ error: limit });
            const token = String(req.query?.t || '');
            const row = validToken(token) ? await findBy(`token=eq.${token}`) : null;
            if (!row || !row.quote || !QUOTE_VISIBLE.includes(row.status)) return res.status(404).json({ error: 'no_existe' });
            return res.status(200).json(forClient(row));
        }

        if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });
        const { action, t, id } = req.body || {};
        const origin = siteOrigin(req);

        // Acciones del admin -----------------------------------------------------------
        const ADMIN_ACTIONS = ['send', 'confirm_payment', 'request_balance', 'publish'];
        let row = null;
        if (ADMIN_ACTIONS.includes(action)) {
            const session = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
            const user = await userFromToken(session);
            if (!user || !(await isAdmin(user.id))) return res.status(403).json({ error: 'Tu cuenta no tiene permiso de administrador.' });
            row = await findBy(`id=eq.${Number(id)}`);
            if (!row) return res.status(404).json({ error: 'La cotización no existe.' });
        }

        // Transferencia recibida: mismo efecto que un pago en línea (correo incluido).
        if (action === 'confirm_payment') {
            const { stage } = req.body;
            if (pendingStage(row) !== stage) return res.status(409).json({ error: 'Ese pago no está pendiente.' });
            const [payment] = await rows(await rest('quote_payments', {
                method: 'POST',
                body: { quote_id: row.id, stage, method: 'tr', amount: stageAmount(cleanQuote(row.quote), stage) },
                prefer: 'return=representation',
            }), 'registrar transferencia');
            const updated = await settleQuotePayment(payment, { origin });
            return res.status(200).json({ ok: !!updated });
        }

        // Sitio listo: se le pide el saldo al cliente.
        if (action === 'request_balance') {
            if (!row.deposit_paid_at || row.balance_paid_at) return res.status(409).json({ error: 'Primero tiene que estar pagado el anticipo.' });
            // Con el anticipo pagado el proyecto está en desarrollo (también corrige uno que quedó en "Aceptada").
            const updated = await patch(row.id, ['aceptada', 'en_desarrollo'], { balance_requested_at: new Date().toISOString(), status: 'en_desarrollo' });
            if (!updated) return res.status(409).json({ error: 'El proyecto no está en desarrollo.' });
            const mailed = await sendBalanceRequest(updated, { origin });
            return res.status(200).json({ ok: true, mailed });
        }

        // Publicado: cierra el proyecto y avisa al cliente.
        if (action === 'publish') {
            if (!row.balance_paid_at) return res.status(409).json({ error: 'Falta el pago del saldo.' });
            const site = String(req.body.site || '').trim().slice(0, 200);
            const updated = await patch(row.id, ['aceptada', 'en_desarrollo'], { status: 'publicado', published_at: new Date().toISOString() });
            if (!updated) return res.status(409).json({ error: 'El proyecto no está en desarrollo.' });
            const mailed = await sendPublished(updated, { site, origin });
            return res.status(200).json({ ok: true, mailed });
        }

        // El admin envía la cotización ----------------------------------------------
        if (action === 'send') {
            const doc = cleanQuote(row.quote);
            const error = quoteError(doc);
            if (error) return res.status(400).json({ error });

            const now = new Date();
            const until = new Date(now.getTime() + VALID_DAYS * 86_400_000);
            const sent = await patch(row.id, ['brief_recibido', 'en_preparacion', 'cotizacion_enviada'], {
                quote: { ...doc, issued_at: now.toISOString(), valid_until: until.toISOString() },
                status: 'cotizacion_enviada',
                quote_sent_at: now.toISOString(),
            });
            if (!sent) return res.status(409).json({ error: 'Esta cotización ya fue aceptada: no se puede volver a enviar.' });
            const mailed = await sendQuoteToClient(sent, { origin });
            return res.status(200).json({ ok: true, mailed });
        }

        // El cliente la acepta --------------------------------------------------------
        if (action === 'accept') {
            const limit = checkBriefLimit(ip, 'enviar');
            if (limit) return res.status(429).json({ error: limit });
            const row = validToken(t) ? await findBy(`token=eq.${t}`) : null;
            if (!row || !row.quote || !QUOTE_VISIBLE.includes(row.status)) return res.status(404).json({ error: 'no_existe' });
            if (row.accepted_at) return res.status(200).json(forClient(row));
            if (isExpired(row)) return res.status(409).json({ error: 'Esta cotización venció. Escríbenos por WhatsApp al +56 9 5414 6176 y te enviamos una actualizada.' });

            const accepted = await patch(row.id, ['cotizacion_enviada'], { status: 'aceptada', accepted_at: new Date().toISOString() });
            if (!accepted) return res.status(409).json({ error: 'No pudimos registrar tu aceptación. Escríbenos por WhatsApp al +56 9 5414 6176.' });
            await Promise.all([sendAcceptToTeam(accepted, { origin }), sendAcceptReceipt(accepted, { origin })]);
            return res.status(200).json(forClient(accepted));
        }

        return res.status(400).json({ error: 'Acción no válida.' });
    } catch (error) {
        console.error('[cotizacion]', error);
        return res.status(500).json({ error: 'Algo falló. Intenta de nuevo en un momento.' });
    }
}
