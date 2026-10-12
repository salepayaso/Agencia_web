// Paso 2 del pago con tarjeta: Webpay devuelve al cliente aquí y recién aquí
// se cursa el cobro (commit). Webpay no tiene webhook: si no hacemos el commit,
// Transbank reversa la transacción sola.
//
// Transbank llega por POST (o GET) con uno de tres formatos:
//   token_ws                → terminó de pagar → commit
//   TBK_TOKEN (+ orden)     → apretó "Anular compra"
//   token_ws + TBK_TOKEN    → se le venció el plazo del formulario
// Después mandamos al cliente a su portal con el resultado.
//
// La seguridad no está en quién llama sino en el commit: lo firma Transbank con
// NUESTRO código de comercio, así que un token inventado nunca vuelve aprobado.

import { OFFERS } from '../../src/data/catalogo.js';
import { confirmarTransaccion, estaAprobada } from '../_lib/webpay.js';
import { getOrder, getOrderByToken, updatePendingOrder, sendPaymentNotice, emailDe } from '../_lib/orderStore.js';
import { volverAlPortal } from '../_lib/checkout.js';

const volver = volverAlPortal;

// Vercel ya parsea el formulario en req.body; el querystring cubre la llegada por GET.
const campos = (req) => ({ ...(req.query || {}), ...(typeof req.body === 'object' && req.body ? req.body : {}) });

export default async function handler(req, res) {
    const { token_ws: tokenWs, TBK_TOKEN: tbkToken } = campos(req);

    try {
        // Anuló o se le venció el plazo: nunca se cobró, solo se cierra el pedido.
        if (tbkToken) {
            const order = await getOrderByToken(tbkToken);
            if (order) {
                await updatePendingOrder(order.id, {
                    status: 'cancelado',
                    admin_note: tokenWs
                        ? 'Se venció el plazo para pagar en Webpay. No se hizo ningún cobro.'
                        : 'Anulaste el pago en Webpay. No se hizo ningún cobro.',
                });
            }
            return volver(res, 'anulado', order?.id);
        }

        if (!tokenWs) {
            console.error('[webpay/retorno] llegada sin token');
            return volver(res, 'error');
        }

        // Recarga de esta página: el commit ya se hizo y repetirlo da error en Transbank.
        const previo = await getOrderByToken(tokenWs);
        if (previo && previo.status !== 'pendiente') {
            return volver(res, previo.status === 'cancelado' ? 'rechazado' : 'ok', previo.id);
        }

        const pago = await confirmarTransaccion(tokenWs);
        const order = await getOrder(pago.session_id);

        if (!order || order.webpay_token !== tokenWs) {
            console.error('[webpay/retorno] REVISAR A MANO — pago sin pedido que calce:', { tokenWs, session: pago.session_id, buy: pago.buy_order });
            return volver(res, 'error');
        }

        // Ya procesado (recarga o doble llegada): mostrar el estado que quedó.
        if (order.status !== 'pendiente') {
            return volver(res, order.status === 'cancelado' ? 'rechazado' : 'ok', order.id);
        }

        const info = {
            authorization_code: pago.authorization_code || null,
            payment_type_code: pago.payment_type_code || null,
            installments_number: pago.installments_number ?? null,
            card_last4: pago.card_detail?.card_number || null,
            response_code: pago.response_code ?? null,
            status: pago.status || null,
            transaction_date: pago.transaction_date || null,
        };

        if (!estaAprobada(pago)) {
            await updatePendingOrder(order.id, {
                status: 'cancelado',
                payment_info: info,
                admin_note: 'El pago con tarjeta fue rechazado. No se hizo ningún cobro; puedes intentarlo de nuevo.',
            });
            return volver(res, 'rechazado', order.id);
        }

        // Cobrado pero el monto no es el del pedido: no activar sin revisar.
        if (Math.round(Number(pago.amount)) !== order.amount) {
            console.error('[webpay/retorno] MONTO NO CALZA — revisar antes de activar:', { pedido: order.id, cobrado: pago.amount, esperado: order.amount });
            await updatePendingOrder(order.id, { payment_info: { ...info, monto_cobrado: pago.amount, revisar: true } });
            return volver(res, 'error', order.id);
        }

        const paid = await updatePendingOrder(order.id, {
            status: 'pagado',
            paid_at: new Date().toISOString(),
            payment_info: info,
        });
        if (paid) {
            await sendPaymentNotice(paid, { title: OFFERS[paid.kind]?.title || paid.kind, email: await emailDe(paid.user_id) });
        }
        return volver(res, 'ok', order.id);
    } catch (error) {
        // El commit pudo haberse cursado: queda el rastro en el log de Vercel.
        console.error('[webpay/retorno] REVISAR A MANO', { tokenWs, error: String(error) });
        return volver(res, 'error');
    }
}
