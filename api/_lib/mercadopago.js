// Mercado Pago Checkout Pro, por REST y sin SDK (mismo enfoque que webpay.js).
// Documentación: https://www.mercadopago.cl/developers/es/docs/checkout-pro
//
// Cómo funciona:
//   1. crear.js arma una "preferencia" (qué se cobra y a dónde volver) y el
//      navegador va a su init_point, la página de pago de Mercado Pago.
//   2. Al terminar, Mercado Pago devuelve al cliente a retorno.js y, por
//      separado, nos avisa por webhook.js. Los dos llaman a procesarPago(),
//      que consulta el pago a Mercado Pago con NUESTRA credencial: nunca se
//      confía en lo que viene en la URL o en el aviso.
//
// Variables de entorno (Vercel):
//   MP_ACCESS_TOKEN     Access Token. En pruebas empieza con TEST- (o es el de
//                       un usuario vendedor de prueba). En producción, el de la
//                       cuenta de Interfaz 360 SpA.
//   MP_WEBHOOK_SECRET   Clave secreta de las notificaciones (Tus integraciones →
//                       Webhooks). Opcional: si está, se rechazan avisos con firma inválida.

import crypto from 'node:crypto';
import { OFFERS } from '../../src/data/catalogo.js';
import { getOrder, updatePendingOrder, sendPaymentNotice, emailDe } from './orderStore.js';

const API = 'https://api.mercadopago.com';

function accessToken() {
    const token = process.env.MP_ACCESS_TOKEN || '';
    if (!token) throw new Error('Falta MP_ACCESS_TOKEN.');
    // El sitio en línea nunca cobra con credenciales de prueba: el "pago" se
    // vería aprobado pero no abona nada.
    if (process.env.VERCEL_ENV === 'production' && token.startsWith('TEST-')) {
        throw new Error('Mercado Pago con credenciales de prueba dentro de producción.');
    }
    return token;
}

async function llamar(metodo, ruta, cuerpo, idempotencia) {
    const res = await fetch(API + ruta, {
        method: metodo,
        headers: {
            Authorization: `Bearer ${accessToken()}`,
            'Content-Type': 'application/json',
            ...(idempotencia ? { 'X-Idempotency-Key': idempotencia } : {}),
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const texto = await res.text();
    if (!res.ok) {
        // El detalle queda en el log de Vercel, no se devuelve al navegador.
        console.error('[mercadopago] %s %s → %s %s', metodo, ruta, res.status, texto);
        throw new Error(`Mercado Pago respondió ${res.status}`);
    }
    return texto ? JSON.parse(texto) : {};
}

/**
 * Crea la preferencia de pago. Devuelve { id, init_point }.
 * returnUrl y notificationUrl ya traen el bypass de la vista previa si corresponde.
 */
export function crearPreferencia({ order, title, email, returnUrl, notificationUrl }) {
    const https = returnUrl.startsWith('https://');
    return llamar('POST', '/checkout/preferences', {
        items: [{
            id: order.kind,
            title: `${title}${order.domain ? ` · ${order.domain}` : ''}`,
            quantity: 1,
            currency_id: 'CLP',
            unit_price: order.amount,
        }],
        ...(email ? { payer: { email } } : {}),
        external_reference: String(order.id),
        statement_descriptor: 'INTERFAZ360',
        // Solo aprobado o rechazado: sin pagos "pendientes" que queden días en el aire.
        binary_mode: true,
        // Sin pagos en efectivo (cupón): se pagan días después y el pedido quedaría colgando.
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }] },
        back_urls: { success: returnUrl, failure: returnUrl, pending: returnUrl },
        // auto_return y el aviso solo funcionan con URLs públicas https (no en localhost).
        ...(https ? { auto_return: 'approved', notification_url: notificationUrl } : {}),
        metadata: { pedido: order.id },
    }, `pref-${order.id}`);
}

export const leerPago = (id) => llamar('GET', `/v1/payments/${encodeURIComponent(id)}`);

/**
 * Valida la firma x-signature de un aviso. Si no hay clave configurada, el aviso
 * igual es seguro de procesar: procesarPago() consulta el pago a Mercado Pago.
 * https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export function firmaValida(req, dataId) {
    const secreto = process.env.MP_WEBHOOK_SECRET;
    if (!secreto) return true;
    const partes = Object.fromEntries(String(req.headers['x-signature'] || '')
        .split(',').map((p) => p.trim().split('=')));
    if (!partes.ts || !partes.v1) return false;
    const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
    const plantilla = `id:${id};request-id:${req.headers['x-request-id'] || ''};ts:${partes.ts};`;
    const esperado = crypto.createHmac('sha256', secreto).update(plantilla).digest('hex');
    const a = Buffer.from(esperado);
    const b = Buffer.from(String(partes.v1));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Consulta el pago a Mercado Pago y actualiza el pedido. Lo llaman el retorno y
 * el aviso, en cualquier orden y las veces que sea: solo el primero que ve el
 * pago aprobado lo marca "pagado" y manda el correo (updatePendingOrder).
 * Devuelve { estado, pedido } con estado = ok | rechazado | proceso | error.
 */
export async function procesarPago(paymentId) {
    const pago = await leerPago(paymentId);
    const order = await getOrder(pago.external_reference);

    if (!order || order.payment_method !== 'mp') {
        console.error('[mercadopago] REVISAR A MANO — pago sin pedido que calce:', { pago: pago.id, ref: pago.external_reference, estado: pago.status });
        return { estado: 'error' };
    }

    const info = {
        mp_preference_id: order.payment_info?.mp_preference_id || null,
        mp_payment_id: pago.id,
        status: pago.status,
        status_detail: pago.status_detail || null,
        payment_type_code: pago.payment_method_id || null,
        installments_number: pago.installments ?? null,
        card_last4: pago.card?.last_four_digits || null,
        authorization_code: pago.authorization_code || null,
        transaction_date: pago.date_approved || pago.date_created || null,
    };

    if (pago.status !== 'approved') {
        // Un pago devuelto o desconocido sobre un pedido ya pagado: avisar en el log.
        if (order.status !== 'pendiente' && ['refunded', 'charged_back', 'cancelled'].includes(pago.status)) {
            console.error('[mercadopago] REVISAR A MANO — pago revertido en un pedido ya pagado:', { pedido: order.id, pago: pago.id, estado: pago.status });
        }
        // El pedido sigue pendiente: en la misma página de Mercado Pago el
        // cliente puede probar con otra tarjeta. En el portal se ve como
        // "Pago sin completar" si no vuelve a intentarlo.
        if (order.status === 'pendiente') await updatePendingOrder(order.id, { payment_info: info });
        const enProceso = ['in_process', 'pending', 'authorized'].includes(pago.status);
        return { estado: enProceso ? 'proceso' : 'rechazado', pedido: order.id };
    }

    if (order.status === 'cancelado') {
        console.error('[mercadopago] REVISAR A MANO — pago aprobado en un pedido cancelado:', { pedido: order.id, pago: pago.id });
        return { estado: 'error', pedido: order.id };
    }
    if (order.status !== 'pendiente') return { estado: 'ok', pedido: order.id };

    // Cobrado pero el monto no es el del pedido: no activar sin revisar.
    if (pago.currency_id !== 'CLP' || Math.round(Number(pago.transaction_amount)) !== order.amount) {
        console.error('[mercadopago] MONTO NO CALZA — revisar antes de activar:', { pedido: order.id, cobrado: pago.transaction_amount, moneda: pago.currency_id, esperado: order.amount });
        await updatePendingOrder(order.id, { payment_info: { ...info, monto_cobrado: pago.transaction_amount, revisar: true } });
        return { estado: 'error', pedido: order.id };
    }

    const paid = await updatePendingOrder(order.id, {
        status: 'pagado',
        paid_at: pago.date_approved || new Date().toISOString(),
        payment_info: info,
    });
    if (paid) {
        await sendPaymentNotice(paid, { title: OFFERS[paid.kind]?.title || paid.kind, email: await emailDe(paid.user_id) });
    }
    return { estado: 'ok', pedido: order.id };
}
