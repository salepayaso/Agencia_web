import { supabase } from '../supabase';
import { OFFERS, conIva } from '../data/catalogo';

// Pedidos de dominio, hosting y pack desde el sitio y el portal.
// - En línea (Webpay o Mercado Pago): el pedido lo crea el servidor
//   (api/webpay/crear.js, api/mercadopago/crear.js) y queda "Pago recibido"
//   solo cuando la pasarela confirma el cobro. Requiere cuenta.
// - Transferencia: el pedido no cobra; queda guardado (si la persona tiene
//   cuenta), nos llega por correo y coordinamos el pago.
// Regla vigente: nunca registrar ni activar nada sin el pago recibido.

// Precios al cliente: viven en src/data/catalogo.js junto con lo que incluye cada servicio.
export { OFFERS, conIva };

// Webpay se enciende por ambiente con VITE_PAGO_WEBPAY=si (Vercel), así el sitio
// en línea no lo muestra hasta tener el código de comercio de Transbank.
// En `npm run dev` siempre está encendido (usa el comercio de prueba).
const WEBPAY_ON = import.meta.env.DEV || import.meta.env.VITE_PAGO_WEBPAY === 'si';
// Mercado Pago, igual con VITE_PAGO_MP=si. No hay credenciales públicas de prueba:
// también en `npm run dev` necesita VITE_PAGO_MP=si y MP_ACCESS_TOKEN en .env.
const MP_ON = import.meta.env.VITE_PAGO_MP === 'si';

// active: si el cliente la puede elegir hoy. Para encender o apagar una, cambiar
// a true/false: el pedido, el portal y los textos se ajustan solos.
// online: se paga en la página de la pasarela (site) y requiere cuenta.
export const PAYS = {
    webpay: { label: 'Tarjeta', note: 'Débito o crédito vía Webpay', active: WEBPAY_ON, needsAccount: true, online: true, site: 'Webpay', siteNote: 'Pagas en Webpay, el sitio seguro de Transbank.' },
    mp: { label: 'Mercado Pago', note: 'Tarjeta o saldo de Mercado Pago', active: MP_ON, needsAccount: true, online: true, site: 'Mercado Pago', siteNote: 'Pagas en el sitio seguro de Mercado Pago.' },
    tr: { label: 'Transferencia', note: 'Activamos al confirmar el depósito', active: true },
};

export const ACTIVE_PAYS = Object.entries(PAYS).filter(([, p]) => p.active);
// Transferencia marcada por defecto: no tiene comisión
export const DEFAULT_PAY = PAYS.tr.active ? 'tr' : ACTIVE_PAYS[0][0];

// "tarjeta o transferencia" / "transferencia"
export const payMethodsText = () => {
    const names = ACTIVE_PAYS.map(([, p]) => p.label.toLowerCase());
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} o ${names.at(-1)}` : names[0];
};

export const ORDER_STATUS = {
    pendiente: { label: 'Esperando pago', cls: 'hot' },
    pagado: { label: 'Pago recibido', cls: '' },
    activo: { label: 'Activo', cls: 'ok' },
    cancelado: { label: 'Cancelado', cls: '' },
};

// Pedido pagado en línea: Webpay, o Mercado Pago creado por el servidor (trae
// monto). Los de Mercado Pago sin monto son del link de pago manual (antiguos).
export const isOnlineOrder = (o) => o.payment_method === 'webpay' || (o.payment_method === 'mp' && o.amount != null);

// Pedido en línea que nunca se pagó (cerró la pestaña, se cortó o rechazaron
// la tarjeta): no hubo cobro. No cuenta como pedido en curso ni se confirma a mano.
export const isUnpaidCard = (o) => o.status === 'pendiente' && isOnlineOrder(o);
export const isOpenOrder = (o) => o.status === 'pagado' || (o.status === 'pendiente' && !isUnpaidCard(o));
export const orderStatus = (o) => (isUnpaidCard(o)
    ? { label: 'Pago sin completar', cls: '' }
    : ORDER_STATUS[o.status] || { label: o.status, cls: '' });

export const clp = (n) => `$${n.toLocaleString('es-CL')}`;

// Dígito verificador del RUT (módulo 11)
export const rutOk = (value) => {
    const r = String(value || '').replace(/[^0-9kK]/g, '').toUpperCase();
    if (r.length < 8) return false;
    const body = r.slice(0, -1);
    const dv = r.slice(-1);
    let sum = 0, m = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * m;
        m = m === 7 ? 2 : m + 1;
    }
    const calc = 11 - (sum % 11);
    return (calc === 11 ? '0' : calc === 10 ? 'K' : String(calc)) === dv;
};

// Sesión y ficha, si la persona entró a su cuenta. Sin sesión devuelve nulls.
export const loadAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { user: null, profile: null };
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    return { user: session.user, profile: profile || null };
};

// Datos del titular guardados en la ficha → formulario
export const holderFromProfile = (profile, user) => ({
    kind: profile?.holder_kind === 'empresa' ? 'e' : 'p',
    name: profile?.holder_name || profile?.client_name || '',
    rut: profile?.rut || '',
    email: profile?.contact_email || profile?.email || user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
});

/**
 * Guarda y avisa un pedido.
 * - Con cuenta: lo guarda en orders y actualiza los datos del titular en la ficha.
 *   Si esas tablas/columnas aún no existen (SQL sin correr), sigue igual con el aviso.
 * - Siempre: nos avisa por correo con /api/contact.
 * - renewal: renovación del dominio que ya está en la ficha. Es un pedido de
 *   'dominio' normal; al activarlo, la base extiende el vencimiento (trigger
 *   order_activated en admin_panel_2026_09_30.sql).
 * Lanza error si la cuenta llegó al tope diario de pedidos ('limite_diario'),
 * si la sesión se cerró mientras la página seguía abierta ('sin_sesion'),
 * o si el aviso por correo falla y tampoco se pudo guardar.
 */
export const placeOrder = async ({ user, kind, domain, years = 1, pay, holder, renewal = false }) => {
    const offer = OFFERS[kind];
    const plan = offer.years[years];
    let saved = false;

    if (user) {
        // La página puede seguir mostrando la cuenta aunque la sesión se cerró en otra
        // pestaña: sin sesión la base rechaza el pedido, así que no avisamos uno fantasma
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('sin_sesion');
        const holderRow = holder && {
            holder_kind: holder.kind === 'e' ? 'empresa' : 'persona',
            holder_name: holder.name.trim(),
            rut: holder.rut.trim(),
            phone: holder.phone.trim(),
            address: holder.address.trim(),
        };
        const { error } = await supabase.from('orders').insert([{
            kind,
            domain: domain || null,
            years: Number(years),
            payment_method: pay,
            holder: holderRow || null,
        }]);
        // Tope diario de pedidos por cuenta (trigger en la base): no seguimos ni avisamos
        if (error && /limite_diario/.test(error.message || '')) throw new Error('limite_diario');
        saved = !error;
        if (holderRow) {
            await supabase.from('profiles').update(holderRow).eq('id', user.id);
        }
    }

    const lines = [
        `${renewal ? 'RENOVACIÓN' : 'PEDIDO'}: ${offer.title}${domain ? ` · ${domain}` : ''}`,
        `Plan: ${plan.label} · ${clp(plan.price)} + IVA = ${clp(conIva(plan.price))}`,
        `Forma de pago elegida: ${PAYS[pay].label}`,
        `Cuenta de cliente: ${user ? `sí (${user.email})${saved ? ', pedido guardado en el portal' : ' — OJO: el pedido NO quedó guardado en el portal'}` : 'no'}`,
    ];
    if (holder) {
        lines.push(
            '',
            `Titular (${holder.kind === 'e' ? 'empresa' : 'persona'}): ${holder.name.trim()}`,
            `RUT: ${holder.rut.trim()}`,
            `Correo: ${holder.email.trim()}`,
            `Teléfono: ${holder.phone.trim() || '—'}`,
            `Dirección: ${holder.address.trim()}`,
        );
        if (!user) lines.push(`Crear cuenta de cliente: ${holder.account ? 'sí' : 'no'}`);
    }

    const contactName = holder?.name.trim() || user?.email || 'Cliente';
    const contactEmail = holder?.email.trim() || user?.email;
    let mailed = false;
    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: contactName,
                email: contactEmail,
                phone: holder?.phone.trim() || '',
                services: ['Dominio y correos'],
                message: lines.join('\n'),
            }),
        });
        mailed = res.ok;
    } catch {
        mailed = false;
    }

    if (!mailed && !saved) throw new Error('order_failed');
    window.dataLayer?.push({ event: renewal ? 'renewal_placed' : 'order_placed', order_kind: kind, domain_name: domain, plan_years: years, payment: pay });
    return { saved, mailed };
};

// Abre el pago en línea: el servidor guarda el pedido con el precio del catálogo y
// devuelve a dónde ir. Lanza 'limite_diario', 'sin_sesion' u 'order_failed'.
const startOnline = async ({ user, kind, domain, years = 1, holder }, endpoint, payment) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('sin_sesion');

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ kind, domain, years: Number(years), holder: holder || null }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 429 && json.error === 'limite_diario') throw new Error('limite_diario');
    if (res.status === 401) throw new Error('sin_sesion');
    if (!res.ok || !json.url) throw new Error('order_failed');

    // Los datos del titular quedan en la ficha para la próxima compra
    if (holder && user) {
        await supabase.from('profiles').update({
            holder_kind: holder.kind === 'e' ? 'empresa' : 'persona',
            holder_name: holder.name.trim(),
            rut: holder.rut.trim(),
            phone: holder.phone.trim(),
            address: holder.address.trim(),
        }).eq('id', user.id);
    }

    window.dataLayer?.push({ event: 'begin_checkout', order_kind: kind, domain_name: domain, plan_years: years, payment });
    return json;
};

/**
 * Paga con tarjeta en Webpay: el navegador va a Transbank con un POST (token_ws).
 * Al terminar, Transbank vuelve a /api/webpay/retorno y de ahí a /dashboard?pago=…
 */
export const payWithWebpay = async (args) => {
    const json = await startOnline(args, '/api/webpay/crear', 'webpay');
    if (!json.token) throw new Error('order_failed');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = json.url;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = json.token;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    // La página se va a Webpay: esta promesa no necesita resolverse antes
    return new Promise(() => {});
};

/**
 * Paga en Mercado Pago (Checkout Pro): el navegador va a su página de pago.
 * Al terminar vuelve a /api/mercadopago/retorno y de ahí a /dashboard?pago=…
 */
export const payWithMercadoPago = async (args) => {
    const json = await startOnline(args, '/api/mercadopago/crear', 'mp');
    window.location.assign(json.url);
    return new Promise(() => {});
};

/** Pedido con la forma de pago elegida: en línea va a la pasarela, lo demás por correo. */
export const submitOrder = (args) => (
    args.pay === 'webpay' ? payWithWebpay(args)
        : args.pay === 'mp' ? payWithMercadoPago(args)
            : placeOrder(args)
);
