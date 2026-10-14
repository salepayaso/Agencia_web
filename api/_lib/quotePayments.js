// Pagos de cotizaciones (anticipo y saldo): lo común a Webpay, Mercado Pago y la
// transferencia que confirma el admin. Tabla quote_payments (cotizaciones_etapa3_2026_10_12.sql).
//
// El monto NUNCA viene del navegador: sale de la cotización guardada (stageAmount).
// Las pasarelas reconocen estos pagos por su referencia: buy_order "C360-<id>" en
// Webpay (session_id "c<id>") y external_reference "c<id>" en Mercado Pago.

import { rest, rows } from './orderStore.js';
import { sendPaymentReceived, sendPaymentToTeam } from './quoteMail.js';
import { cleanQuote, pendingStage, stageAmount, quoteNumber } from '../../src/data/quote.js';

const validToken = (t) => typeof t === 'string' && /^[a-f0-9]{64}$/.test(t);

export async function getQuote(filter) {
    const [row] = await rows(await rest(`quotes?${filter}&select=*`), 'leer cotización');
    return row || null;
}

export const getQuoteById = (id) => getQuote(`id=eq.${Number(id)}`);

async function getPaymentBy(filter) {
    const [p] = await rows(await rest(`quote_payments?${filter}&select=*`), 'leer pago de cotización');
    return p || null;
}

export const getPayment = (id) => getPaymentBy(`id=eq.${Number(id)}`);
export const getPaymentByToken = (token) => getPaymentBy(`webpay_token=eq.${encodeURIComponent(token)}`);

/** Referencia de Mercado Pago "c12" → 12, o null si no es de una cotización. */
export const paymentIdFromRef = (ref) => (/^c\d+$/.test(String(ref || '')) ? Number(String(ref).slice(1)) : null);

/** Cambia el pago solo si sigue 'pendiente' (el primero que llega gana). */
export async function updatePendingPayment(id, patch) {
    const [p] = await rows(await rest(`quote_payments?id=eq.${Number(id)}&status=eq.pendiente`, {
        method: 'PATCH', body: patch, prefer: 'return=representation',
    }), 'actualizar pago de cotización');
    return p || null;
}

/**
 * Abre un pago en línea desde la página de la cotización.
 * body = { quote: <token>, stage: 'anticipo' | 'saldo' }.
 * Devuelve { row, payment, amount, title } o { status, error }.
 */
export async function startQuotePayment(body, method) {
    const { quote: token, stage } = body || {};
    const row = validToken(token) ? await getQuote(`token=eq.${token}`) : null;
    if (!row || !row.quote) return { status: 404, error: 'La cotización no existe.' };
    if (pendingStage(row) !== stage) return { status: 409, error: 'Este pago ya no está pendiente. Recarga la página.' };

    const doc = cleanQuote(row.quote);
    const amount = stageAmount(doc, stage);
    const [payment] = await rows(await rest('quote_payments', {
        method: 'POST', body: { quote_id: row.id, stage, method, amount }, prefer: 'return=representation',
    }), 'crear pago de cotización');
    const title = `Cotización ${quoteNumber(row)} · ${stage === 'anticipo' ? 'Anticipo' : 'Saldo'} 50 %`;
    return { row, doc, payment, amount, title };
}

/**
 * Deja el pago como pagado, avanza el proyecto y avisa (cliente + equipo).
 * Devuelve la cotización actualizada, o null si otro llamado ya lo había procesado.
 */
export async function settleQuotePayment(payment, { info = null, paidAt = new Date().toISOString(), origin }) {
    const paid = await updatePendingPayment(payment.id, { status: 'pagado', paid_at: paidAt, payment_info: info });
    if (!paid) return null;

    const anticipo = paid.stage === 'anticipo';
    const [row] = await rows(await rest(`quotes?id=eq.${paid.quote_id}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: {
            ...(anticipo ? { deposit_paid_at: paidAt, status: 'en_desarrollo' } : { balance_paid_at: paidAt }),
            updated_at: new Date().toISOString(),
        },
    }), 'avanzar cotización');

    await Promise.all([
        sendPaymentReceived(row, paid.stage, { origin }),
        sendPaymentToTeam(row, paid, { origin }),
    ]);
    return row;
}

/** Lleva al cliente de vuelta a su cotización con el resultado del pago. */
export function volverACotizacion(res, token, estado) {
    res.statusCode = 303;
    res.setHeader('Location', token ? `/cotizacion/${token}?pago=${encodeURIComponent(estado)}` : '/');
    res.end();
}

/**
 * Origen del sitio para los enlaces de los correos. Nunca sale del header Origin:
 * quien llama lo elige, y un correo nuestro con un enlace a otro sitio sería phishing.
 * Producción usa el dominio fijo (igual que reminders.js); la vista previa, el host
 * del despliegue, que Vercel enruta; en local, el servidor de Vite.
 */
export function siteOrigin(req) {
    if (process.env.VERCEL_ENV === 'production') return 'https://interfaz360.cl';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return process.env.VERCEL_ENV ? `https://${host}` : `http://${host}`;
}
