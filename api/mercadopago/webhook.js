// Aviso de Mercado Pago (webhook): llega aunque el cliente cierre la pestaña
// antes de volver al sitio, así ningún pago aprobado queda sin registrar.
//
// Formato: POST ?data.id=<pago>&type=payment con cuerpo { type, data: { id } }.
// También pueden llegar avisos del formato antiguo (?topic=...&id=...) o de
// otros tipos (merchant_order): esos se responden 200 y se ignoran.
// Mercado Pago reintenta si no respondemos 200/201, así que un error de nuestro
// lado responde 500 para que lo vuelva a mandar.

import { procesarPago, firmaValida } from '../_lib/mercadopago.js';
import { siteOrigin } from '../_lib/quotePayments.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const q = req.query || {};
    const body = typeof req.body === 'object' && req.body ? req.body : {};
    const tipo = q.type || body.type || q.topic;
    const id = String(q['data.id'] || body.data?.id || (q.topic === 'payment' ? q.id : '') || '');

    if (tipo !== 'payment' || !/^\d+$/.test(id)) return res.status(200).json({ ok: true, ignorado: true });
    if (!firmaValida(req, id)) {
        console.error('[mercadopago/webhook] firma inválida', { id });
        return res.status(401).json({ error: 'Firma inválida.' });
    }

    try {
        const { estado } = await procesarPago(id, siteOrigin(req));
        return res.status(200).json({ ok: true, estado });
    } catch (error) {
        console.error('[mercadopago/webhook]', { id, error: String(error) });
        return res.status(500).json({ error: 'No se pudo procesar.' });
    }
}
