import { Link } from 'react-router-dom';
import PageShell, { PageHead, CtaBand } from '../components/PageShell';
import DomainSection from '../components/DomainSection';
import { openChat } from '../lib/chat';

// Cada servicio dice qué entregamos, no frases genéricas.
// "Preguntar" abre el asesor con la pregunta ya escrita.
const SERVICES = [
    {
        title: 'Agente IA 24/7',
        kicker: 'Nuevo',
        desc: 'Configuramos un asistente con la información de tu negocio: atiende en tu web a cualquier hora, cotiza y te envía los datos de cada interesado.',
        includes: [
            'Chat en tu sitio web, disponible las 24 horas',
            'Entrenado con tus productos, precios y preguntas frecuentes',
            'Te avisa por correo con los datos de cada interesado',
            'Opcional: WhatsApp Business y conexión con tu sistema',
        ],
        ask: 'Hola, me interesa un agente IA para mi negocio. ¿Cómo funciona?',
    },
    {
        title: 'Página web',
        kicker: 'Tu carta de presentación',
        desc: 'Diseñamos y programamos tu página: secciones, textos, fotos, formulario de contacto y botón de WhatsApp, lista para aparecer en Google.',
        includes: [
            'Diseño a medida, rápido en el celular',
            'Formulario de contacto y botón de WhatsApp',
            'Dominio, hosting y correos el primer año',
            'Certificado de seguridad (https)',
        ],
        ask: '¿Cuánto cuesta una página web?',
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
        title: 'Dominio y correos',
        kicker: 'Tu identidad digital',
        desc: 'Registramos tu dominio .cl a tu nombre, creamos tus correos con el nombre de tu empresa y nos encargamos de renovarlos a tiempo.',
        includes: [
            'Dominio .cl registrado a tu nombre',
            'Correos con el nombre de tu empresa',
            'Hosting con certificado de seguridad',
            'Aviso antes de cada vencimiento',
        ],
        anchor: '#dominio',
    },
];

const PLANS = [
    {
        name: 'Plan Pyme Digital',
        sub: 'Para aparecer en Google con una imagen profesional.',
        items: [
            'Página web de una sección (landing)',
            '5 correos con el nombre de tu empresa',
            'Dominio y hosting el primer año',
            'Perfil en Google y Maps + SEO local',
            'Certificado de seguridad',
        ],
        ask: 'Hola, me interesa el Plan Pyme Digital. ¿Qué incluye y cuánto cuesta?',
    },
    {
        name: 'Suite Digital 360',
        sub: 'Para crecer con web completa, Google y portal de clientes.',
        badge: 'Más completo',
        hot: true,
        items: [
            'Página web con varias secciones',
            '5 correos con el nombre de tu empresa',
            'Dominio y hosting el primer año',
            'Perfil en Google y Maps + SEO local',
            'Analytics, Tag Manager y Search Console',
            'Portal de clientes para tu cuenta',
            'Certificado de seguridad',
        ],
        ask: 'Hola, me interesa la Suite Digital 360. ¿Qué incluye y cuánto cuesta?',
    },
];

const track = (label) =>
    window.dataLayer?.push({ event: 'interest_click', service_name: label, click_url: 'button' });

const Services = () => (
    <PageShell
        title="Servicios y Planes Digitales"
        description="Página web, tienda online, agente IA, ecosistema Google, software a medida, dominio y correos para pymes en Chile."
    >
        <PageHead eyebrow="Servicios" title={<>Lo que hacemos<br />por tu <span>negocio</span></>}>
            Desde tu primera página web hasta el sistema que ordena tu operación, con un solo equipo a cargo. ¿Dudas? El asesor te explica qué incluye y cuánto cuesta.
        </PageHead>

        <section className="s gutter" style={{ paddingTop: 0 }}>
            <div className="max">
                <ul className="svc-detail">
                    {SERVICES.map((s) => (
                        <li key={s.title}>
                            <div>
                                <h2>{s.title}</h2>
                                <span className="kicker">{s.kicker}</span>
                            </div>
                            <div>
                                <p>{s.desc}</p>
                                <ul className="ticks">
                                    {s.includes.map((i) => <li key={i}>{i}</li>)}
                                </ul>
                            </div>
                            <div className="go">
                                {s.anchor ? (
                                    <a className="btn" href={s.anchor}>Buscar dominio →</a>
                                ) : (
                                    <button type="button" className="btn" onClick={() => { track(`Servicios: ${s.title}`); openChat(s.ask); }}>
                                        Preguntar al asesor →
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        <section className="s gutter" id="planes" style={{ paddingTop: 0 }}>
            <div className="max">
                <div className="s-head">
                    <h2 className="display">Planes<br />para pymes</h2>
                    <p>El precio depende de lo que necesites. Cuéntale al asesor de qué es tu negocio y te dice cuál te conviene y cuánto cuesta.</p>
                </div>
                <div className="plans">
                    {PLANS.map((p) => (
                        <article key={p.name} className={`plan-card${p.hot ? ' hot' : ''}`}>
                            <header>
                                <div>
                                    <h3>{p.name}</h3>
                                    <small>{p.sub}</small>
                                </div>
                                {p.badge && <span className="badge">{p.badge}</span>}
                            </header>
                            <div className="body">
                                <ul className="ticks">
                                    {p.items.map((i) => <li key={i}>{i}</li>)}
                                </ul>
                            </div>
                            <footer>
                                <button type="button" className={`btn ${p.hot ? 'signal' : 'solid'}`} onClick={() => { track(`Plan: ${p.name}`); openChat(p.ask); }}>
                                    Consultar precio →
                                </button>
                            </footer>
                        </article>
                    ))}
                </div>
                <p className="muted" style={{ marginTop: 28, fontSize: 15 }}>
                    La Suite Digital 360 incluye el <Link to="/login" className="textlink">portal de clientes</Link>. Todos los planes incluyen acompañamiento después de la entrega.
                </p>
            </div>
        </section>

        <DomainSection />

        <CtaBand title="¿Tienes dudas? Conversemos" message="Hola, tengo dudas sobre qué servicio me conviene." />
    </PageShell>
);

export default Services;
