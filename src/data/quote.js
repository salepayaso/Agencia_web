// Cotización formal: totales, textos fijos y el borrador que se arma desde el brief.
// La usan el editor de /admin, la página del cliente (/cotizacion/:token) y el
// servidor (api/cotizacion.js), que limpia lo que se guarda con cleanQuote().
//
// Los precios base NO están aquí (el repo es público): vienen de la tabla
// quote_templates, que solo lee el admin. La cotización guardada lleva sus montos.

import { IVA, OFFERS } from './catalogo.js';

export const VALID_DAYS = 15;

// "COT-26-0007": mismo id y año que el brief B-26-0007.
export const quoteNumber = (q) => `COT-${String(new Date(q.created_at).getFullYear()).slice(2)}-${String(q.id).padStart(4, '0')}`;

// Estados en que el cliente puede ver su cotización.
export const QUOTE_VISIBLE = ['cotizacion_enviada', 'aceptada', 'en_desarrollo', 'publicado'];

export const clp = (n) => `${n < 0 ? '−' : ''}$${Math.abs(Math.round(n)).toLocaleString('es-CL')}`;

/** Neto, IVA, total y los dos pagos del 50 %. Los montos de los ítems son netos. */
export function quoteTotals(items = []) {
    const subtotal = items.filter((i) => i.amount > 0).reduce((s, i) => s + i.amount, 0);
    const discount = items.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0);
    const neto = subtotal + discount;
    const iva = Math.round(neto * IVA);
    const total = neto + iva;
    const anticipo = Math.round(total / 2);
    return { subtotal, discount, neto, iva, total, anticipo, saldo: total - anticipo };
}

// Lo que incluye y no incluye todo proyecto web (página 2 de la cotización).
export const ALWAYS_INCLUDED = [
    'Diseño a medida, adaptado a celular y computador',
    '2 rondas de ajustes sobre la primera versión',
    'Publicación y conexión de tu dominio',
    'Ayuda para configurar tus correos en celular y computador',
    'Si no tienes logo, fotos o textos, te ayudamos a crearlos',
    'Portal de cliente para pedir cambios y ver tus servicios',
];
export const NOT_INCLUDED = [
    'Reparar o modificar sitios hechos por terceros (WordPress, Wix u otros)',
    'Presupuesto de publicidad en Google Ads',
    'Lo que no aparece en el detalle de esta cotización',
    'Renovaciones desde el segundo año',
];

export const CONDITIONS = [
    `Esta cotización es válida por ${VALID_DAYS} días desde su emisión.`,
    'El plazo corre desde el pago del anticipo y la entrega del material.',
    'La primera versión se entrega en 10 días hábiles.',
    'Incluye 2 rondas de ajustes; desde la tercera, los ajustes se cobran aparte.',
    '30 días de garantía desde la publicación: corregimos sin costo los errores del sitio entregado. No incluye funciones nuevas ni cambios hechos por terceros.',
    'Los cambios fuera de lo cotizado se presupuestan aparte antes de hacerlos.',
];

export const RENEWALS = {
    dominio: OFFERS.dominio.years[1].price,
    hosting: OFFERS.hosting.years[1].price,
    pack: OFFERS.pack.years[1].price,
};

// Plantilla que corresponde a lo que pidió en el brief.
const templateFor = (b) => (b.tipo === 'landing' ? 'pyme'
    : b.tipo === 'multi' ? 'suite'
        : b.tipo === 'sistema' ? 'sistema'
            : b.productos === '50' ? 'tienda_50' : b.productos === 'mas' ? 'tienda_mas' : 'tienda_20');

const itemFrom = (t) => ({ title: t.title, sub: t.sub || '', includes: t.includes || [], amount: t.amount });

/** Borrador a partir del brief y de los ítems base (quote_templates). */
export function draftQuote(row, b, templates) {
    const byId = Object.fromEntries(templates.map((t) => [t.id, t]));
    const main = byId[templateFor(b)];
    const items = main ? [itemFrom(main)] : [];
    if (b.dominio === 'si' && byId.dominio_propio) {
        items.push({ ...itemFrom(byId.dominio_propio), sub: `Ya tienes ${b.dominio_nombre || 'tu dominio'}, así que no incluimos su registro` });
    }
    const negocio = b.negocio || row.client_name;
    const tipo = { landing: 'Una página de presentación', multi: 'Un sitio con varias secciones', tienda: 'Una tienda online', sistema: 'Un sistema a medida' }[b.tipo];
    const dominio = b.dominio === 'si' && b.dominio_nombre ? ` Lo publicamos con tu dominio ${b.dominio_nombre}, que ya tienes.` : '';
    return {
        client: {
            name: b.razon || negocio,
            rut: b.rut,
            rubro: b.rubro,
            contact: b.nombre || row.client_name,
            email: b.correo || row.client_email || '',
            phone: b.telefono || row.client_phone || '',
        },
        summary: `${tipo} para ${negocio}.${dominio}`,
        items,
    };
}

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = (v) => Math.max(-100_000_000, Math.min(100_000_000, Math.round(Number(v) || 0)));

/** Deja solo los campos conocidos de la cotización, con su largo máximo. */
export function cleanQuote(raw = {}) {
    const q = raw && typeof raw === 'object' ? raw : {};
    const c = q.client && typeof q.client === 'object' ? q.client : {};
    return {
        client: {
            name: text(c.name, 150),
            rut: text(c.rut, 20),
            rubro: text(c.rubro, 120),
            contact: text(c.contact, 100),
            email: text(c.email, 254).toLowerCase(),
            phone: text(c.phone, 30),
        },
        summary: text(q.summary, 1500),
        items: (Array.isArray(q.items) ? q.items : []).slice(0, 20).map((i) => ({
            title: text(i?.title, 150),
            sub: text(i?.sub, 300),
            includes: (Array.isArray(i?.includes) ? i.includes : []).map((x) => text(x, 150)).filter(Boolean).slice(0, 15),
            amount: money(i?.amount),
        })).filter((i) => i.title),
        // Los fija el servidor al enviarla
        ...(q.issued_at ? { issued_at: text(q.issued_at, 40) } : {}),
        ...(q.valid_until ? { valid_until: text(q.valid_until, 40) } : {}),
    };
}

/** Qué falta para poder enviarla, o ''. */
export function quoteError(q) {
    if (!q.items.length) return 'Agrega al menos un ítem.';
    if (q.items.some((i) => !i.amount)) return 'Hay un ítem sin monto.';
    if (quoteTotals(q.items).neto <= 0) return 'El total tiene que ser mayor que cero.';
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(q.client.email)) return 'Falta el correo del cliente (pestaña Cliente).';
    if (!q.summary) return 'Escribe "Qué vamos a hacer".';
    return '';
}

/** ¿Venció? (solo importa mientras espera respuesta) */
export const isExpired = (row) => row.status === 'cotizacion_enviada' && !!row.quote?.valid_until
    && new Date(row.quote.valid_until) < new Date();
