// Paso 1 del pago con tarjeta: guarda el pedido y abre la transacción en Webpay.
//
// Recibe del portal: qué compra (kind, domain, years) y el titular.
// NO recibe el monto: sale de OFFERS (src/data/catalogo.js), el mismo catálogo
// que muestra la página. Editar el navegador solo cambia QUÉ compra, nunca el precio.
// Requiere sesión: el pedido queda a nombre de la cuenta validada contra Supabase Auth.

import { OFFERS } from '../../src/data/catalogo.js';
import { isAllowedOrigin } from '../_lib/guardrails.js';
import { crearTransaccion } from '../_lib/webpay.js';
import { userFromToken, ordersToday, insertOrder, updatePendingOrder } from '../_lib/orderStore.js';

const MAX_PEDIDOS_DIA = 5; // el mismo tope que el trigger orders_limit_per_day

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const cleanDomain = (v) => texto(v, 80).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

// A dónde vuelve Transbank: al mismo sitio desde donde se pagó (producción,
// vista previa o localhost). El Origin ya pasó por isAllowedOrigin.
function returnUrl(origin) {
    const url = new URL('/api/webpay/retorno', origin);
    // La vista previa está protegida con el login de Vercel y la vuelta desde
    // Transbank es un POST entre sitios: la cookie de Vercel no viaja. Con
    // "Protection Bypass for Automation" activo, Vercel entrega este secreto.
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (process.env.VERCEL_ENV === 'preview' && bypass) {
        url.searchParams.set('x-vercel-protection-bypass', bypass);
        url.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone');
    }
    return url.toString();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const user = await userFromToken(token);
    if (!user) return res.status(401).json({ error: 'Entra a tu cuenta para pagar con tarjeta.' });

    const { kind, years: rawYears, domain: rawDomain, holder } = req.body || {};
    const offer = OFFERS[kind];
    const years = Number(rawYears) || 1;
    const plan = offer?.years[years];
    if (!plan) return res.status(400).json({ error: 'El plan no es válido.' });

    const domain = cleanDomain(rawDomain);
    const domainOk = kind === 'hosting'
        ? /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)
        : /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.cl$/.test(domain);
    if (!domainOk) return res.status(400).json({ error: 'El dominio no es válido.' });

    const holderRow = holder && typeof holder === 'object' ? {
        holder_kind: holder.kind === 'e' ? 'empresa' : 'persona',
        holder_name: texto(holder.name, 120),
        rut: texto(holder.rut, 20),
        phone: texto(holder.phone, 30),
        address: texto(holder.address, 200),
    } : null;

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
            holder: holderRow,
            amount: plan.price,
        });

        // buy_order = lo que el cliente ve en su comprobante (máx. 26 caracteres).
        // session_id = id del pedido: vuelve en el commit y así sabemos cuál es.
        const buyOrder = `I360-${order.id}`;
        const trx = await crearTransaccion({
            buyOrder,
            sessionId: String(order.id),
            amount: plan.price,
            returnUrl: returnUrl(req.headers.origin),
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
