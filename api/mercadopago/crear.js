// Paso 1 del pago con Mercado Pago: guarda el pedido y crea la preferencia.
// Devuelve la URL de la página de pago de Mercado Pago (init_point).
//
// Recibe del portal: qué compra (kind, domain, years) y el titular. El monto
// sale del catálogo (ver api/_lib/checkout.js).

import { isAllowedOrigin } from '../_lib/guardrails.js';
import { crearPreferencia } from '../_lib/mercadopago.js';
import { leerPedido, urlDeVuelta } from '../_lib/checkout.js';
import { ordersToday, insertOrder, updatePendingOrder } from '../_lib/orderStore.js';

const MAX_PEDIDOS_DIA = 5; // el mismo tope que el trigger orders_limit_per_day

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });

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
