// Paso 2 del pago con Mercado Pago: el cliente vuelve aquí (GET) desde la página
// de pago. Mercado Pago agrega a la URL, entre otros:
//   payment_id          id del pago ("null" si salió sin pagar)
//   status              approved | rejected | null
//   external_reference  id de nuestro pedido
// No confiamos en esos valores: procesarPago() consulta el pago a Mercado Pago.
// El aviso por webhook hace lo mismo; el que llegue primero deja el pedido pagado.

import { procesarPago } from '../_lib/mercadopago.js';
import { volverAlPortal } from '../_lib/checkout.js';

export default async function handler(req, res) {
    const q = req.query || {};
    const paymentId = String(q.payment_id || q.collection_id || '');
    const pedido = /^\d+$/.test(String(q.external_reference || '')) ? q.external_reference : null;

    // Salió de Mercado Pago sin pagar: no hubo cobro y el pedido sigue pendiente.
    if (!/^\d+$/.test(paymentId)) return volverAlPortal(res, 'anulado', pedido);

    try {
        const { estado, pedido: id } = await procesarPago(paymentId);
        return volverAlPortal(res, estado, id || pedido);
    } catch (error) {
        console.error('[mercadopago/retorno] REVISAR A MANO', { paymentId, pedido, error: String(error) });
        return volverAlPortal(res, 'error', pedido);
    }
}
