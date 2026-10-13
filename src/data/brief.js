// Brief del sitio web: las preguntas, sus opciones y los estados del proyecto.
// Lo usan la página del enlace (/brief/:token), el panel /admin y el servidor
// (api/brief.js), que limpia lo que llega con cleanBrief(): solo se guardan
// estos campos, con estas opciones y estos largos.
//
// El brief no muestra precios: la cotización la arma el equipo en /admin.

export const METAS = [
    'Que me encuentren en Google',
    'Recibir consultas por WhatsApp',
    'Mostrar productos o servicios',
    'Vender en línea',
    'Agendar citas o reservas',
    'Verme más profesional',
];

export const MATERIAL = ['Logo', 'Fotos', 'Textos', 'Colores de marca', 'Aún no tengo nada'];

export const SITIO_ACTUAL = {
    no: { label: 'No', sub: 'Parto de cero', resumen: 'No tiene' },
    nuevo: { label: 'Sí, quiero uno nuevo', sub: 'Lo reemplazamos', resumen: 'Tiene, quiere uno nuevo' },
    arreglar: { label: 'Sí, quiero arreglarlo', sub: 'WordPress, Wix u otro', resumen: 'Quería arreglarlo (se le ofreció uno nuevo)' },
};

export const TIPOS = {
    landing: { label: 'Landing page', sub: 'Una sola página con servicios, fotos, ubicación y contacto', resumen: 'Landing page (Plan Pyme Digital)' },
    multi: { label: 'Sitio con varias secciones', sub: 'Inicio, servicios, nosotros, contacto y más, con medición de visitas', resumen: 'Sitio con varias secciones (Empresa Digital)' },
    tienda: { label: 'Tienda online', sub: 'Catálogo, carro y pago en línea', resumen: 'Tienda online' },
    sistema: { label: 'Sistema a medida', sub: 'Inventario, reservas o gestión interna', resumen: 'Sistema a medida' },
};

export const PRODUCTOS = { '20': 'Hasta 20', '50': 'Hasta 50', mas: 'Más de 50', nose: 'Aún no sé' };

export const DOMINIO = {
    si: { label: 'Sí, ya tengo', sub: 'Lo consideramos en tu cotización' },
    no: { label: 'No', sub: 'Te lo registramos a tu nombre' },
    nose: { label: 'No estoy seguro', sub: 'Lo revisamos contigo' },
};

export const PLAZOS = ['Lo antes posible', 'Dentro de un mes', 'Sin apuro'];

export const VIAS = {
    correo: { label: 'Por correo', sub: 'Con el PDF y el enlace para aceptarla', resumen: 'Correo' },
    whatsapp: { label: 'Por WhatsApp', sub: 'Te la mandamos y vemos detalles', resumen: 'WhatsApp' },
    reunion: { label: 'Reunión por Meet', sub: 'Para revisarla juntos', resumen: 'Reunión por Meet' },
};

// Estados del proyecto, de la creación del enlace a la publicación.
// cls: el color de la pastilla en el panel (hot = requiere acción).
export const QUOTE_STATUS = {
    brief_pendiente: { label: 'Esperando brief', cls: '' },
    brief_recibido: { label: 'Brief recibido', cls: 'hot' },
    en_preparacion: { label: 'Cotización en preparación', cls: 'hot' },
    cotizacion_enviada: { label: 'Cotización enviada', cls: '' },
    aceptada: { label: 'Aceptada', cls: 'hot' },
    en_desarrollo: { label: 'En desarrollo', cls: 'ok' },
    publicado: { label: 'Publicado', cls: 'ok' },
    cancelada: { label: 'Cancelada', cls: '' },
};

// El cliente puede editar el brief hasta que empezamos a preparar la cotización.
export const BRIEF_EDITABLE = ['brief_pendiente', 'brief_recibido'];

// "B-26-0007": número que ve el cliente, armado con el id y el año de creación.
export const briefNumber = (q) => `B-${String(new Date(q.created_at).getFullYear()).slice(2)}-${String(q.id).padStart(4, '0')}`;

// Brief vacío, con los datos de contacto que cargamos al crear el enlace.
export const emptyBrief = (client = {}) => ({
    negocio: '',
    rubro: '',
    metas: [],
    sitio_actual: 'no',
    sitio_url: '',
    tipo: 'landing',
    productos: '20',
    sistema_desc: '',
    dominio: 'no',
    dominio_nombre: '',
    asistente_ia: false,
    material: [],
    referencias: '',
    plazo: 'Dentro de un mes',
    nombre: client.name || '',
    telefono: client.phone || '',
    correo: client.email || '',
    rut: '',
    razon: '',
    via: 'correo',
    comentarios: '',
});

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v, options, fallback) => (Object.hasOwn(options, v) ? v : fallback);
const pickList = (v, list) => (Array.isArray(v) ? list.filter((x) => v.includes(x)) : []);

/** Deja solo los campos y opciones conocidos, con su largo máximo. */
export function cleanBrief(raw = {}) {
    const b = raw && typeof raw === 'object' ? raw : {};
    return {
        negocio: text(b.negocio, 120),
        rubro: text(b.rubro, 120),
        metas: pickList(b.metas, METAS),
        sitio_actual: pick(b.sitio_actual, SITIO_ACTUAL, 'no'),
        sitio_url: text(b.sitio_url, 200),
        tipo: pick(b.tipo, TIPOS, 'landing'),
        productos: pick(b.productos, PRODUCTOS, '20'),
        sistema_desc: text(b.sistema_desc, 2000),
        dominio: pick(b.dominio, DOMINIO, 'no'),
        dominio_nombre: text(b.dominio_nombre, 80).toLowerCase(),
        asistente_ia: b.asistente_ia === true,
        material: pickList(b.material, MATERIAL),
        referencias: text(b.referencias, 2000),
        plazo: PLAZOS.includes(b.plazo) ? b.plazo : PLAZOS[1],
        nombre: text(b.nombre, 100),
        telefono: text(b.telefono, 30),
        correo: text(b.correo, 254).toLowerCase(),
        rut: text(b.rut, 20),
        razon: text(b.razon, 150),
        via: pick(b.via, VIAS, 'correo'),
        comentarios: text(b.comentarios, 2000),
    };
}

/** Qué falta para poder enviar el brief, o '' si está completo. */
export function briefError(b) {
    if (b.negocio.length < 2) return 'Escribe el nombre de tu negocio (paso 1).';
    if (b.nombre.length < 2) return 'Escribe tu nombre para saber a quién dirigir la cotización.';
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(b.correo)) return 'Revisa el correo: ahí te llega la cotización.';
    return '';
}

/** El brief como filas [pregunta, respuesta]. team = true agrega notas internas (correo al equipo y panel). */
export function briefRows(b, { team = false } = {}) {
    return [
        ['Negocio', [b.negocio, b.rubro].filter(Boolean).join(' · ') || '—'],
        ['Quiere', b.metas.join(', ') || 'Sin indicar'],
        ['Sitio actual', SITIO_ACTUAL[b.sitio_actual].resumen + (b.sitio_url ? ` (${b.sitio_url})` : '')],
        ['Tipo', TIPOS[b.tipo].resumen + (b.tipo === 'tienda' ? ` (${PRODUCTOS[b.productos].toLowerCase()} productos)` : '')],
        ...(b.tipo === 'sistema' && b.sistema_desc ? [['Qué debe hacer', b.sistema_desc]] : []),
        ['Dominio', b.dominio === 'si' ? `Tiene: ${b.dominio_nombre || 'sin indicar cuál'}${team ? ' (aplica descuento de $10.000)' : ''}` : b.dominio === 'no' ? 'No tiene' : 'No sabe'],
        ['Asistente IA', b.asistente_ia ? 'Le interesa' : 'No'],
        ['Material', b.material.join(', ') || 'Nada aún'],
        ...(b.referencias ? [['Referencias', b.referencias]] : []),
        ['Plazo', b.plazo],
        ['Contacto', [b.nombre, b.correo, b.telefono].filter(Boolean).join(' · ')],
        ['Facturación', [b.razon, b.rut].filter(Boolean).join(' · ') || 'Sin datos'],
        ['Prefiere', VIAS[b.via].resumen],
        ...(b.comentarios ? [['Comentarios', b.comentarios]] : []),
    ];
}
