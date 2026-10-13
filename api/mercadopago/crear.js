// Paso 1 del pago con Mercado Pago: guarda el pedido y crea la preferencia.
// Devuelve la URL de la página de pago de Mercado Pago (init_point).
//
// Recibe del portal: qué compra (kind, domain, years) y el titular. El monto
// sale del catálogo (ver api/_lib/checkout.js).
// Con { quote, stage } paga el anticipo o el saldo de una cotización (ver
// api/_lib/quotePayments.js); su referencia en Mercado Pago es "c<id del pago>".

import { isAllowedOrigin, checkBriefLimit, getClientIp } from '../_lib/guardrails.js';
import { crearPreferencia } from '../_lib/mercadopago.js';
import { leerPedido, urlDeVuelta } from '../_lib/checkout.js';
import { ordersToday, insertOrder, updatePendingOrder } from '../_lib/orderStore.js';
import { startQuotePayment, updatePendingPayment } from '../_lib/quotePayments.js';

const MAX_PEDIDOS_DIA = 5; // el mismo tope que el trigger orders_limit_per_day

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });
    if (req.body?.quote) return pagarCotizacion(req, res);

    const pedido = await leerPedido(req);
    if (pedido.error) return res.status(pedido.status).json({ error: pedido.error });
    const { user, kind, years, plan, total, title, domain, holder } = pedido;

    let order = null;
    try {
        if (await ordersToday(user.id) >= MAX_PEDIDOS_DIA) {
            return res.status(429).json({ error: 'limite_diario' });
        }

        order = await insertOrder({
            user_id: user.id,
            kind,
            domain,
            years,
            payment_method: 'mp',
            holder,
            amount: total,
        });

        const pref = await crearPreferencia({
            order,
            title: `${title} · ${plan.label}`,
            email: user.email,
            returnUrl: urlDeVuelta(req.headers.origin, '/api/mercadopago/retorno'),
            notificationUrl: urlDeVuelta(req.headers.origin, '/api/mercadopago/webhook'),
        });

        // buy_order = la referencia que ve el cliente y la que buscamos en Mercado Pago.
        await updatePendingOrder(order.id, { buy_order: `I360-${order.id}`, payment_info: { mp_preference_id: pref.id } });

        return res.status(200).json({ url: pref.init_point, order: order.id });
    } catch (error) {
        console.error('[mercadopago/crear]', error);
        // Si Mercado Pago no creó la preferencia, el pedido no queda colgando
        if (order) {
            await updatePendingOrder(order.id, { status: 'cancelado', admin_note: 'No se pudo abrir el pago con Mercado Pago. Puedes intentarlo de nuevo.' }).catch(() => {});
        }
        return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo.' });
    }
}

// Anticipo o saldo de una cotización (página /cotizacion/:token, sin cuenta).
async function pagarCotizacion(req, res) {
    const limit = checkBriefLimit(getClientIp(req), 'guardar');
    if (limit) return res.status(429).json({ error: limit });

    const inicio = await startQuotePayment(req.body, 'mp').catch((error) => {
        console.error('[mercadopago/crear] cotización', error);
        return { status: 500, error: 'No pudimos iniciar el pago. Intenta de nuevo.' };
    });
    if (inicio.error) return res.status(inicio.status).json({ error: inicio.error });
    const { payment, amount, title, doc } = inicio;

    try {
        const ref = `c${payment.id}`;
        const pref = await crearPreferencia({
            order: { id: ref, kind: 'cotizacion', amount },
            title,
            email: doc.client.email,
            returnUrl: urlDeVuelta(req.headers.origin, '/api/mercadopago/retorno'),
            notificationUrl: urlDeVuelta(req.headers.origin, '/api/mercadopago/webhook'),
        });
        await updatePendingPayment(payment.id, { buy_order: ref, payment_info: { mp_preference_id: pref.id } });
        return res.status(200).json({ url: pref.init_point });
    } catch (error) {
        console.error('[mercadopago/crear] cotización', error);
        await updatePendingPayment(payment.id, { status: 'cancelado' }).catch(() => {});
        return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo.' });
    }
}
