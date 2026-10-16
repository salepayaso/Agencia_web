// Catálogo único de Interfaz 360: qué incluye cada servicio y cada plan.
//
// De aquí leen el sitio (portada, Servicios, portal, pedidos de dominio) y el
// agente IA del chat (api/_lib/prompt.js). Si cambias algo acá, cambia en la
// página y en lo que responde el agente a la vez: nunca se contradicen.
//
// Precios: solo van los que el sitio ya muestra (dominio y hosting). Los de
// planes, tiendas, Google y agentes los da solo el agente del chat: viven en
// AGENT_PROMPT (Vercel), nunca aquí, porque el repositorio es público y este
// archivo termina en el JavaScript del navegador.
//
// Campos:
//   desc, includes, ask ... lo que muestra la página Servicios
//   home ................... texto y pregunta de la portada, si difieren
//   agente ................. detalle que el sitio no muestra pero el agente sí explica
//   noIncluye .............. lo que el agente debe negar (evita que "complete" un plan)
//   soloAgente ............. el servicio aún no aparece en el sitio

export const CORREOS_HOSTING = 5;

// Precios al cliente que el sitio ya muestra (pedidos de dominio y portal).
// Son netos: se cobran + IVA. El total a pagar sale de conIva().
//
// Correos: 1 correo va con el dominio, sin servidor (Cloudflare reenvía a su
// Gmail y responde por Brevo). Desde 2 correos se necesita un plan de correos
// en cPanel. La clave 'hosting' es Correos 5: así se llamaba en los pedidos
// antiguos. Más de 20 correos o más espacio se cotiza con un asesor.
export const OFFERS = {
    dominio: {
        title: 'Dominio .cl',
        years: { 1: { label: '1 año', price: 25000, note: 'Incluye 1 correo · Renovación anual $25.000 + IVA' }, 2: { label: '2 años', price: 45000, note: 'Incluye 1 correo · Ahorras $5.000 + IVA' } },
    },
    hosting: {
        title: 'Correos 5',
        emails: 5,
        storage: '5 GB',
        years: { 1: { label: '1 año', price: 35000, note: 'Renovación anual $35.000 + IVA' } },
    },
    correos10: {
        title: 'Correos 10',
        emails: 10,
        storage: '10 GB',
        years: { 1: { label: '1 año', price: 50000, note: 'Renovación anual $50.000 + IVA' } },
    },
    correos20: {
        title: 'Correos 20',
        emails: 20,
        storage: '20 GB',
        years: { 1: { label: '1 año', price: 75000, note: 'Renovación anual $75.000 + IVA' } },
    },
    pack: {
        title: 'Pack dominio + 5 correos',
        years: { 1: { label: '1 año', price: 55000, note: 'Renovación anual $55.000 + IVA' } },
    },
};

// Planes de correos con servidor, de menor a mayor.
export const CORREO_PLANES = ['hosting', 'correos10', 'correos20'];

export const pesos = (n) => `$${n.toLocaleString('es-CL')}`;
const anual = (kind) => `${pesos(OFFERS[kind].years[1].price)} + IVA al año`;

export const SERVICIOS = [
    {
        id: 'agente',
        title: 'Agente IA 24/7',
        kicker: 'Nuevo',
        desc: 'Configuramos un agente IA con la información de tu negocio: atiende en tu web a cualquier hora, responde dudas, deriva a tu WhatsApp y te envía los datos de cada interesado. 3 meses gratis con tu página.',
        includes: [
            'Chat en tu sitio web, disponible las 24 horas',
            'Entrenado con tus productos, precios, horarios y zonas de despacho',
            'Deriva a tu WhatsApp y te avisa por correo de cada interesado',
            '3 meses gratis con el Plan Pyme Digital o Empresa Digital',
        ],
        ask: 'Hola, me interesa un agente IA para mi negocio. ¿Cómo funciona?',
        home: {
            desc: 'Configuramos un agente IA con la información de tu negocio: atiende en tu web a cualquier hora, responde dudas, deriva a tu WhatsApp y te envía los datos de cada interesado. Viene 3 meses gratis con tu página.',
            ask: '¿Qué hace un agente IA y cómo funcionaría en mi negocio?',
        },
        agente: [
            'Viene 3 meses GRATIS con el Plan Pyme Digital y con Empresa Digital, instalado y configurado. Al terminar los 3 meses se apaga solo: sigue funcionando solo si el cliente decide contratarlo, nunca se cobra sin que lo acepte. Si no lo contrata, su sitio sigue con el botón de WhatsApp, que traen todos los planes.',
            'El agente funciona con la conexión de Interfaz360: por eso tiene una mensualidad. Cada plan tiene un tope de respuestas al mes; si se llega al tope, el chat deriva a los visitantes al WhatsApp del negocio hasta el mes siguiente, sin cobros extra ni sorpresas.',
            'Qué puede hacer: responder preguntas frecuentes, horarios, productos y precios del negocio; decir si atienden o despachan en una comuna o zona; derivar al WhatsApp del negocio; y enviar por correo los datos de cada interesado.',
            '- Nivel 1, agente web: chat IA en el sitio web del cliente, atención 24/7 configurada con la información del negocio. Dos planes según el uso: hasta 1.500 respuestas al mes, o hasta 5.000 respuestas al mes para negocios con más visitas. Derivar al WhatsApp del negocio (botón o enlace) SÍ está incluido.',
            '- Nivel 2, integrado en software: todo lo del Nivel 1 más integración dentro de una aplicación, consulta a base de datos, registro de información y reportes.',
            '- Add-on Integración Google: el agente puede leer y responder correos, agendar en Google Calendar y consultar catálogos en Drive.',
            '- Nivel 3, asistente IA privado y local: NO es un agente de atención al cliente ni atiende 24/7 a público. Es un asistente interno para el equipo del cliente, que corre en un computador del propio negocio, sin nube y sin API externa, con los datos 100% locales. Pensado para datos sensibles: contabilidad, salud o inventario. Exige un equipo con hardware mínimo que evalúa un asesor. Se cotiza caso a caso: siempre deriva a un asesor.',
            '',
            'Interfaz360 no ofrece agentes que respondan dentro de WhatsApp ni de Instagram. En todos los planes, WhatsApp es solo un acceso directo: un botón o enlace para que el visitante le escriba al negocio, donde lo atiende una persona.',
            'Si te preguntan qué agente es el del sitio web: es exactamente el Nivel 1, la misma tecnología que un cliente contrataría.',
        ],
    },
    {
        id: 'web',
        title: 'Página web',
        kicker: 'Tu carta de presentación',
        desc: 'Diseñamos y programamos tu página: secciones, textos, fotos, formulario de contacto y botón de WhatsApp, lista para aparecer en Google.',
        includes: [
            'Diseño a medida, rápido en el celular',
            'Formulario de contacto y botón de WhatsApp',
            'Dominio y correo con tu nombre el primer año',
            'Certificado de seguridad (https)',
        ],
        ask: '¿Cuánto cuesta una página web?',
        home: {
            desc: 'Diseñamos y programamos tu página: secciones, textos, fotos, formulario de contacto y botón de WhatsApp, lista para aparecer en Google. Incluye dominio y correo el primer año.',
        },
        agente: ['Se vende como Plan Pyme Digital (landing page) o Empresa Digital (ver los planes).'],
    },
    {
        id: 'tienda',
        title: 'Tienda online',
        kicker: 'Vende las 24 horas',
        desc: 'Armamos tu tienda con catálogo, carrito y el medio de pago que elijas (Webpay, Mercado Pago u otro), más un panel para manejar productos, stock y pedidos desde el celular.',
        includes: [
            'Catálogo con fotos, variantes y precios',
            'Pago en línea con el medio que elijas',
            'Control de stock y pedidos',
            'Aviso por correo de cada venta',
        ],
        ask: 'Quiero vender online, ¿cómo sería una tienda?',
        agente: ['El cliente tramita su propia cuenta Transbank; Transbank le cobra una comisión aproximada de 1,5% + IVA por venta. El precio depende de la cantidad de productos.'],
    },
    {
        id: 'google',
        title: 'Ecosistema Google',
        kicker: 'Que te encuentren',
        desc: 'Configuramos las herramientas de Google para tu negocio: perfil en Google y Maps, Analytics, Tag Manager, Search Console y todo listo para Google Ads.',
        includes: [
            'Perfil de empresa en Google y Maps',
            'Google Analytics y Tag Manager',
            'Search Console y SEO técnico',
            'Medición de contactos, lista para Google Ads',
        ],
        ask: '¿Qué incluye el Ecosistema Google?',
        agente: ['Tres niveles. El básico es Google Business Profile + Google Maps. El estándar suma Analytics y Search Console. El completo suma Tag Manager configurado y la base lista para Google Ads. En Google Ads, Interfaz360 deja la base técnica lista; el presupuesto de la pauta lo maneja el cliente.'],
        noIncluye: ['Google Workspace'],
    },
    {
        id: 'software',
        title: 'Software a medida',
        kicker: 'Tu operación, ordenada',
        desc: 'Desarrollamos el sistema que tu operación necesita, a partir de cómo trabajas hoy: pedidos, inventario, reparto, cobros y reportes.',
        includes: [
            'Levantamiento de cómo trabajas hoy',
            'Paneles y reportes para tu equipo',
            'Conexión con las herramientas que ya usas',
            'Acceso desde el computador y el celular',
        ],
        ask: 'Necesito un sistema a medida para mi negocio, ¿cómo trabajan?',
        agente: ['El precio depende de la complejidad, las integraciones y si funciona en red local o en internet. Siempre deriva a un asesor para cotizar: no cierres un precio tú.'],
    },
    {
        id: 'dominio',
        title: 'Dominio y correos',
        kicker: 'Tu identidad digital',
        desc: 'Registramos tu dominio .cl a tu nombre con 1 correo de tu empresa incluido. Si tu equipo necesita más, sumas un plan de 5, 10 o 20 correos. Nos encargamos de renovarlos a tiempo.',
        includes: [
            'Dominio .cl registrado a tu nombre',
            '1 correo con el nombre de tu empresa, incluido con el dominio',
            'Planes de 5, 10 o 20 correos para tu equipo',
            'Aviso antes de cada vencimiento',
        ],
        anchor: '#dominio',
        agente: [
            'El dominio .cl se contrata por 1 o 2 años, con renovación anual, y queda legalmente a nombre del cliente. El sitio tiene un buscador de dominios .cl. Buscar un dominio NO lo reserva, así que si está libre conviene cerrarlo rápido.',
            'Correos: 1 correo viene incluido con el dominio y sigue funcionando mientras el dominio esté al día. Llega a la casilla de Gmail del cliente y responde desde ahí con la dirección de su empresa, sin servidor. Desde 2 correos se necesita un servidor de correos: planes de 5 correos (5 GB), 10 correos (10 GB) o 20 correos (20 GB). Más de 20 correos o más espacio se cotiza con un asesor.',
        ],
    },
    {
        id: 'pos',
        title: 'Sistema Punto de Venta (POS) con hardware',
        soloAgente: true,
        desc: 'Próximo lanzamiento. Software de ventas integrado con impresora térmica, lector de código de barras, gaveta de dinero y pantalla touch. Precio a cotizar según el hardware que necesite el comercio.',
        includes: [],
    },
];

export const PLANES = [
    {
        id: 'pyme',
        name: 'Plan Pyme Digital',
        precio: 200000, // neto, pago único; el agente lo toma de agent_prompt (pricing)
        sub: 'Tu landing page: una sola página con la identidad de tu negocio, para aparecer en Google.',
        items: [
            'Landing page: una página a medida, rápida en el celular',
            'Dominio .cl y 1 correo con el nombre de tu empresa el primer año',
            'Perfil en Google y Maps + SEO local',
            'Botón de WhatsApp',
            'Agente IA 3 meses gratis',
            'Políticas de privacidad y aviso de IA (Ley 21.719)',
            'Portal de clientes para tu cuenta',
            'Certificado de seguridad',
        ],
        ask: 'Hola, me interesa el Plan Pyme Digital (landing page). ¿Qué incluye y cuánto cuesta?',
        agente: [
            'Es una landing page: una sola página, hecha en React, que muestra la identidad del negocio de un vistazo (servicios, fotos, ubicación y contacto). Ideal para emprendedores y negocios que parten.',
            'El correo llega a la casilla de Gmail del cliente y responde desde ahí con la dirección de su empresa. Si necesita 2 correos o más, se suma un plan de correos (ver Dominios y Correos).',
            `Desde el segundo año paga solo la renovación del dominio (${anual('dominio')}): su página sigue publicada y su correo sigue funcionando.`,
            'Si después quiere crecer a Empresa Digital, hay un descuento por subir de plan que aplica un asesor en la cotización.',
        ],
        noIncluye: ['más de 1 correo', 'tienda online', 'Analytics, Tag Manager ni Search Console', 'campañas de Google Ads', 'Google Workspace'],
    },
    {
        id: 'suite',
        name: 'Empresa Digital',
        precio: 350000,
        sub: 'Web completa para empresas que quieren mostrar toda su identidad, medir sus visitas y quedar listas para Google Ads.',
        badge: 'Más completo',
        hot: true,
        items: [
            'Página web con varias secciones',
            `${CORREOS_HOSTING} correos con el nombre de tu empresa`,
            'Dominio y hosting el primer año',
            'Perfil en Google y Maps + SEO local',
            'Analytics, Tag Manager y Search Console, listo para Google Ads',
            'Botón de WhatsApp',
            'Agente IA 3 meses gratis',
            'Políticas de privacidad y aviso de IA (Ley 21.719)',
            'Portal de clientes para tu cuenta',
            'Certificado de seguridad',
        ],
        ask: 'Hola, me interesa el plan Empresa Digital. ¿Qué incluye y cuánto cuesta?',
        agente: [
            'Sitio completo con varias secciones, hecho en React. Para empresas que quieren mostrar toda su identidad. Diferencia con el Plan Pyme Digital: varias secciones en vez de una sola página, 5 correos en vez de 1, y medición de visitas (Analytics, Tag Manager, Search Console) con la base técnica lista para Google Ads.',
            'Google Ads: dejamos todo listo para que el cliente pueda anunciar; la pauta la maneja y la paga el cliente. Crear o administrar campañas es un servicio aparte que cotiza un asesor.',
            `Desde el segundo año: el pack dominio + 5 correos (${anual('pack')}). Si ya no necesita los 5 correos, renueva solo el dominio (${anual('dominio')}) y se queda con 1 correo.`,
        ],
        noIncluye: ['tienda online', 'creación ni administración de campañas de Google Ads (servicio aparte)', 'Google Workspace'],
    },
];

// Nota bajo los planes en la página Servicios. No va al agente: "acompañamiento"
// se confunde con mantención, que el agente deriva a un asesor.
export const EN_TODOS_LOS_PLANES = 'el portal de clientes, botón de WhatsApp, políticas de privacidad (Ley 21.719) y acompañamiento después de la entrega';

export const IVA = 0.19;
export const conIva = (neto) => Math.round(neto * (1 + IVA));

const lista = (items) => items.join('; ');

// Texto para el agente IA: reemplaza {{CATALOGO}} en el bloque base del prompt.
// Debe ser estable (sin fechas ni datos variables): se cachea en la API.
export function catalogoParaAgente() {
    const planes = PLANES.map((p) => [
        `## ${p.name}`,
        `${p.sub} Incluye: ${lista(p.items)}.`,
        ...(p.agente || []),
        p.noIncluye ? `NO incluye: ${lista(p.noIncluye)}.` : '',
    ].filter(Boolean).join('\n'));

    const servicios = SERVICIOS.map((s) => [
        `## ${s.title}`,
        s.desc,
        ...(s.includes.length ? [`Incluye: ${lista(s.includes)}.`] : []),
        ...(s.agente || []),
        ...(s.noIncluye ? [`NO incluye: ${lista(s.noIncluye)}.`] : []),
    ].join('\n'));

    return [...planes, ...servicios].join('\n\n');
}

// Precios públicos para el agente: reemplaza {{PRECIOS_PUBLICOS}} en el bloque de precios.
export function preciosPublicosParaAgente() {
    const { dominio } = OFFERS;
    const correos = CORREO_PLANES.map((k) => `${OFFERS[k].emails} correos (${OFFERS[k].storage}) ${pesos(OFFERS[k].years[1].price)}`);
    return [
        '## Dominios y Correos (anual)',
        `- Dominio .cl con 1 correo incluido: 1 año ${pesos(dominio.years[1].price)}, 2 años ${pesos(dominio.years[2].price)}, renovación anual ${pesos(dominio.years[1].price)}, todo + IVA. El correo no necesita servidor y sigue funcionando mientras el dominio esté al día.`,
        `- Desde 2 correos se necesita un plan de correos con servidor: ${correos.join(', ')}, todo + IVA al año.`,
        `- Pack dominio + 5 correos: ${anual('pack')}.`,
        '- Más de 20 correos o más espacio: a cotizar con un asesor. No des precio ni rango.',
        '- La página del cliente sigue publicada sin costo mientras su dominio esté al día. Si su negocio crece mucho en visitas, un asesor puede recomendarle un servidor mensual: eso se evalúa caso a caso, no des precio.',
    ].join('\n');
}
