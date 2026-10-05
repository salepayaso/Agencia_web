// Pedidos pagados con Webpay: acceso a Supabase con la service role (REST, sin SDK,
// igual que leadStore.js) y el aviso por correo cuando entra un pago.
// La service role salta RLS y el trigger de límite diario, así que las reglas
// que en el portal pone la base (dueño del pedido, 5 pedidos al día) se
// revisan aquí.

import { supabaseConfig } from './leadStore.js';
import { escapeHtml, avisosFrom } from './leads.js';

function rest(path, { method = 'GET', body, prefer } = {}) {
    const config = supabaseConfig();
    if (!config) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL');
    return fetch(`${config.url}/rest/v1/${path}`, {
        method,
        headers: {
            apikey: config.key,
            Authorization: `Bearer ${config.key}`,
            'Content-Type': 'application/json',
            ...(prefer ? { Prefer: prefer } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

async function rows(res, label) {
    if (!res.ok) {
        console.error(`[orders] ${label}:`, res.status, await res.text());
        throw new Error(`Supabase ${label} ${res.status}`);
    }
    return res.json();
}

/** Usuario dueño del token de sesión (validado contra Supabase Auth), o null. */
export async function userFromToken(token) {
    const config = supabaseConfig();
    if (!config || !token) return null;
    const res = await fetch(`${config.url}/auth/v1/user`, {
        headers: { apikey: config.key, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? user : null;
}

export async function ordersToday(userId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const list = await rows(await rest(`orders?select=id&user_id=eq.${userId}&created_at=gt.${since}`), 'contar');
    return list.length;
}

export async function insertOrder(row) {
    const [order] = await rows(await rest('orders', { method: 'POST', body: row, prefer: 'return=representation' }), 'crear');
    return order;
}

export async function getOrder(id) {
    const [order] = await rows(await rest(`orders?id=eq.${Number(id)}&select=*`), 'leer');
    return order || null;
}

export async function getOrderByToken(token) {
    const [order] = await rows(await rest(`orders?webpay_token=eq.${encodeURIComponent(token)}&select=*`), 'leer');
    return order || null;
}

/**
 * Cambia el pedido solo si sigue 'pendiente'. Devuelve el pedido actualizado,
 * o null si ya lo había procesado otro retorno (doble clic, recarga).
 */
export async function updatePendingOrder(id, patch) {
    const [order] = await rows(await rest(`orders?id=eq.${Number(id)}&status=eq.pendiente`, {
        method: 'PATCH', body: patch, prefer: 'return=representation',
    }), 'actualizar');
    return order || null;
}

const clp = (n) => `$${Number(n).toLocaleString('es-CL')}`;

/** Aviso al equipo de un pago aprobado. Si falla, el pago igual queda registrado. */
export async function sendPaymentNotice(order, { title, email }) {
    const apiKey = process.env.RESEND_API_KEY;
    const destino = process.env.AVISOS_EMAIL;
    if (!apiKey || !destino) {
        console.error('[orders] aviso sin enviar: falta RESEND_API_KEY o AVISOS_EMAIL');
        return;
    }
    const h = order.holder || {};
    const info = order.payment_info || {};
    const fila = (k, v) => (v ? `<tr><td style="padding:6px 0;color:#666;width:150px;"><strong>${k}:</strong></td><td style="padding:6px 0;">${escapeHtml(String(v))}</td></tr>` : '');

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: avisosFrom(),
                to: [destino],
                ...(email ? { reply_to: email } : {}),
                subject: `💳 Pago Webpay recibido — pedido N.º ${order.id} · ${clp(order.amount)}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color:#e8471c;margin-bottom:4px;">Pago con Webpay aprobado</h2>
                        <p style="color:#666;margin-top:0;">Queda como "Pago recibido" en /admin. Falta activarlo.</p>
                        <table style="width:100%;border-collapse:collapse;">
                            ${fila('Pedido', `N.º ${order.id} · ${title}${order.domain ? ` · ${order.domain}` : ''}`)}
                            ${fila('Plan', `${order.years} año${order.years > 1 ? 's' : ''}`)}
                            ${fila('Monto', clp(order.amount))}
                            ${fila('Orden de compra', order.buy_order)}
                            ${fila('Autorización', info.authorization_code)}
                            ${fila('Tarjeta', info.card_last4 ? `**** ${info.card_last4} (${info.payment_type_code || ''})` : '')}
                            ${fila('Cuenta', email)}
                            ${fila('Titular', h.holder_name ? `${h.holder_name} (${h.holder_kind || ''})` : '')}
                            ${fila('RUT', h.rut)}
                            ${fila('Teléfono', h.phone)}
                            ${fila('Dirección', h.address)}
                        </table>
                    </div>
                `,
            }),
        });
        if (!res.ok) console.error('[orders] Resend:', await res.text());
    } catch (error) {
        console.error('[orders] aviso:', error);
    }
}
