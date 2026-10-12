// Paso 1 del pago con tarjeta: guarda el pedido y abre la transacción en Webpay.
//
// Recibe del portal: qué compra (kind, domain, years) y el titular. El monto
// sale del catálogo (ver api/_lib/checkout.js).

import { isAllowedOrigin } from '../_lib/guardrails.js';
import { crearTransaccion } from '../_lib/webpay.js';
import { leerPedido, urlDeVuelta } from '../_lib/checkout.js';
import { ordersToday, insertOrder, updatePendingOrder } from '../_lib/orderStore.js';

const MAX_PEDIDOS_DIA = 5; // el mismo tope que el trigger orders_limit_per_day

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });

    const pedido = await leerPedido(req);
    if (pedido.error) return res.status(pedido.status).json({ error: pedido.error });
    const { user, kind, years, plan, domain, holder } = pedido;

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
            amount: plan.price,
        });

        // buy_order = lo que el cliente ve en su comprobante (máx. 26 caracteres).
        // session_id = id del pedido: vuelve en el commit y así sabemos cuál es.
        const buyOrder = `I360-${order.id}`;
        const trx = await crearTransaccion({
            buyOrder,
            sessionId: String(order.id),
            amount: plan.price,
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
