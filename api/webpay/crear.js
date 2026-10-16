// Paso 1 del pago con tarjeta: guarda el pedido y abre la transacción en Webpay.
//
// Recibe del portal: qué compra (kind, domain, years) y el titular. El monto
// sale del catálogo (ver api/_lib/checkout.js).
// Con { quote, stage } paga el anticipo o el saldo de una cotización: el monto
// sale de la cotización guardada (ver api/_lib/quotePayments.js).

import { isAllowedOrigin, checkBriefLimit, getClientIp } from '../_lib/guardrails.js';
import { crearTransaccion } from '../_lib/webpay.js';
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
    const { user, kind, years, total, domain, holder } = pedido;

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
            payment_method: 'webpay',
            holder,
            amount: total,
        });

        // buy_order = lo que el cliente ve en su comprobante (máx. 26 caracteres).
        // session_id = id del pedido: vuelve en el commit y así sabemos cuál es.
        const buyOrder = `I360-${order.id}`;
        const trx = await crearTransaccion({
            buyOrder,
            sessionId: String(order.id),
            amount: total,
            returnUrl: urlDeVuelta(req.headers.origin, '/api/webpay/retorno'),
        });

        await updatePendingOrder(order.id, { buy_order: buyOrder, webpay_token: trx.token });

        return res.status(200).json({ url: trx.url, token: trx.token, order: order.id });
    } catch (error) {
        console.error('[webpay/crear]', error);
        // Si Transbank no abrió la transacción, el pedido no queda colgando
        if (order) {
            await updatePendingOrder(order.id, { status: 'cancelado', admin_note: 'No se pudo abrir el pago con tarjeta. Puedes intentarlo de nuevo.' }).catch(() => {});
        }
        return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo.' });
    }
}

// Anticipo o saldo de una cotización (página /cotizacion/:token, sin cuenta).
async function pagarCotizacion(req, res) {
    const limit = checkBriefLimit(getClientIp(req), 'guardar');
    if (limit) return res.status(429).json({ error: limit });

    const inicio = await startQuotePayment(req.body, 'webpay').catch((error) => {
        console.error('[webpay/crear] cotización', error);
        return { status: 500, error: 'No pudimos iniciar el pago. Intenta de nuevo.' };
    });
    if (inicio.error) return res.status(inicio.status).json({ error: inicio.error });
    const { payment, amount, row } = inicio;

    try {
        // C360 = cotización; I360 = pedido del portal. session_id "c<id>" vuelve en el commit.
        const buyOrder = `C360-${payment.id}`;
        const trx = await crearTransaccion({
            buyOrder,
            sessionId: `c${payment.id}`,
            amount,
            // c = la cotización: si vence el plazo, Transbank vuelve sin token y así sabemos a dónde volver.
            returnUrl: urlDeVuelta(req.headers.origin, `/api/webpay/retorno?c=${row.token}`),
        });
        await updatePendingPayment(payment.id, { buy_order: buyOrder, webpay_token: trx.token });
        return res.status(200).json({ url: trx.url, token: trx.token });
    } catch (error) {
        console.error('[webpay/crear] cotización', error);
        await updatePendingPayment(payment.id, { status: 'cancelado' }).catch(() => {});
        return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo.' });
    }
}
