// Lo común a los pagos en línea (Webpay y Mercado Pago): validar la compra que
// manda el portal y armar las URLs a las que vuelve la pasarela.
//
// El monto NUNCA viene del navegador: sale de OFFERS (src/data/catalogo.js), el
// mismo catálogo que muestra la página. Editar el navegador solo cambia QUÉ compra.

import { OFFERS, CORREO_PLANES, conIva } from '../../src/data/catalogo.js';
import { userFromToken } from './orderStore.js';

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const cleanDomain = (v) => texto(v, 80).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

/**
 * Lee y valida el pedido. Devuelve { error, status } si algo no cuadra, o
 * { user, kind, years, plan, total, domain, holder } listo para guardar.
 * total = lo que se cobra: el precio neto del catálogo + IVA.
 * Requiere sesión: el pedido queda a nombre de la cuenta validada contra Supabase Auth.
 */
export async function leerPedido(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const user = await userFromToken(token);
    if (!user) return { status: 401, error: 'Entra a tu cuenta para pagar en línea.' };

    const { kind, years: rawYears, domain: rawDomain, holder } = req.body || {};
    const offer = OFFERS[kind];
    const years = Number(rawYears) || 1;
    const plan = offer?.years[years];
    if (!plan) return { status: 400, error: 'El plan no es válido.' };

    const domain = cleanDomain(rawDomain);
    // Los correos van sobre un dominio que ya existe (puede no ser .cl).
    const domainOk = CORREO_PLANES.includes(kind)
        ? /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)
        : /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.cl$/.test(domain);
    if (!domainOk) return { status: 400, error: 'El dominio no es válido.' };

    const holderRow = holder && typeof holder === 'object' ? {
        holder_kind: holder.kind === 'e' ? 'empresa' : 'persona',
        holder_name: texto(holder.name, 120),
        rut: texto(holder.rut, 20),
        phone: texto(holder.phone, 30),
        address: texto(holder.address, 200),
    } : null;

    return { user, kind, years, plan, total: conIva(plan.price), title: offer.title, domain, holder: holderRow };
}

/**
 * URL de nuestro sitio a la que vuelve la pasarela: el mismo sitio desde donde
 * se pagó (producción, vista previa o localhost). El Origin ya pasó por isAllowedOrigin.
 */
export function urlDeVuelta(origin, ruta) {
    const url = new URL(ruta, origin);
    // La vista previa está protegida con el login de Vercel y la vuelta desde la
    // pasarela llega sin esa cookie. Con "Protection Bypass for Automation"
    // activo, Vercel entrega este secreto.
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (process.env.VERCEL_ENV === 'preview' && bypass) {
        url.searchParams.set('x-vercel-protection-bypass', bypass);
        url.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone');
    }
    return url.toString();
}

/** Lleva al cliente a su portal con el resultado: /dashboard?pago=<estado>&pedido=<id> */
export function volverAlPortal(res, estado, pedido) {
    const qs = new URLSearchParams({ pago: estado, ...(pedido ? { pedido: String(pedido) } : {}) });
    res.statusCode = 303;
    res.setHeader('Location', `/dashboard?${qs}`);
    res.end();
}
