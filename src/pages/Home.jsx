import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAgent from '../components/ChatAgent';
import SEO from '../components/SEO';
import HeroVisuals from '../components/HeroVisuals';
import TechBand from '../components/TechBand';
import DomainSection from '../components/DomainSection';
import { openChat } from '../lib/chat';
import { SERVICIOS } from '../data/catalogo';

// Cada servicio abre el asesor con una pregunta ya escrita,
// así responde al tiro sobre lo que le interesó a la persona.
// Textos en src/data/catalogo.js; la portada usa su versión corta si la hay.
const SERVICES = SERVICIOS.filter((s) => !s.soloAgente).map((s) => ({
    title: s.title,
    tag: s.id === 'agente' ? s.kicker : undefined,
    desc: s.home?.desc || s.desc,
    ask: s.home?.ask || s.ask,
    anchor: s.anchor,
}));

const STEPS = [
    { title: 'Conversamos', desc: 'Nos cuentas cómo funciona tu negocio y qué quieres resolver.' },
    { title: 'Propuesta', desc: 'Concreta y con precio claro, antes de pagar nada.' },
    { title: 'Construimos', desc: 'Te mostramos avances reales durante el proceso.' },
    { title: 'Te acompañamos', desc: 'Monitoreamos que todo funcione después de la entrega.' },
];

const ACCOUNT = [
    { dt: 'Dominio', b: 'tunegocio.cl', small: 'Vence el 14 mar 2027 · quedan 172 días', st: 'Vigente' },
    { dt: 'Plan', b: 'Empresa Digital · anual', small: 'Próximo pago 05 oct 2026 · Tarjeta •••• 4821', st: 'Al día' },
    { dt: 'Correos', b: '3 de 5 activos', small: 'contacto@ · ventas@ · pedidos@', st: '+ 2 libres', kind: 'ghost' },
    { dt: 'Sitio web', b: 'En línea', small: 'Certificado de seguridad vigente', st: 'OK' },
    { dt: 'Documentos', b: 'Contrato · Factura septiembre', small: '2 archivos nuevos', st: 'Descargar', kind: 'ghost' },
    { dt: 'Soporte', b: 'Cambiar foto de portada', small: 'En curso · respondido hace 3 h', st: '1 abierta', kind: 'hot' },
];

const track = (label) =>
    window.dataLayer?.push({ event: 'interest_click', service_name: label, click_url: 'button' });

const Home = () => (
    <div className="tc-page">
        <SEO
            title="Interfaz360 — Agencia Digital IA en Chile | Web, Software y Agentes IA para Pymes"
            description="Agencia digital en Chile para pymes. Sitios web, ecosistema Google, software a medida y agentes IA que atienden a tus clientes las 24 horas."
        />
        <Navbar />
        <ChatAgent />

        <main className="tc" id="top">
            {/* Hero */}
            <section className="hero gutter">
                <div className="max">
                    <div>
                        <span className="eyebrow">Web · Google · Software · Agentes IA</span>
                        <h1 className="display">Tu negocio,<br />atendido <span>24/7</span>.</h1>
                        <p className="lede">
                            Desarrollamos tu presencia digital completa: sitio web, posicionamiento en Google y un asistente con IA que atiende a tus clientes las 24 horas.
                        </p>
                        <div className="ctas">
                            <button type="button" className="btn signal" onClick={() => { track('Hero: Preguntale al asesor'); openChat(); }}>
                                Pregúntale al asesor →
                            </button>
                            <a className="btn" href="#servicios">Ver servicios</a>
                        </div>
                        <div className="proof">
                            <span><b>Dominio, hosting y correos</b> incluidos</span>
                            <span><b>Asesor IA</b> 24/7</span>
                            <span><b>Portal</b> para tu cuenta</span>
                        </div>
                    </div>
                    <HeroVisuals />
                </div>
            </section>

            <TechBand />

            {/* Servicios */}
            <section className="s gutter" id="servicios">
                <div className="max">
                    <div className="s-head">
                        <h2 className="display">Lo que<br />hacemos</h2>
                        <p>
                            Soluciones para vender más y administrar mejor tu negocio, con un solo equipo a cargo. ¿Tienes dudas sobre algún servicio? Consulta a nuestro asesor: te explica qué incluye y cuánto cuesta.
                        </p>
                    </div>
                    <ul className="svc">
                        {SERVICES.map((s) => (
                            <li key={s.title}>
                                <h3>{s.title}{s.tag && <span className="tag">{s.tag}</span>}</h3>
                                <p>{s.desc}</p>
                                <span className="go">
                                    {s.anchor ? (
                                        <a className="ask" href={s.anchor}>Buscar dominio →</a>
                                    ) : (
                                        <button type="button" className="ask" onClick={() => { track(`Servicio: ${s.title}`); openChat(s.ask); }}>
                                            Preguntar →
                                        </button>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Portal de clientes */}
            <section className="s gutter" id="portal" style={{ paddingTop: 0 }}>
                <div className="max panel-wrap">
                    <div>
                        <span className="eyebrow">Portal de clientes · Incluido en tu plan</span>
                        <h2 className="display">Tu cuenta,<br />en orden</h2>
                        <ul>
                            <li><b>Tu dominio</b> y la fecha en que vence.</li>
                            <li><b>Tu plan y tus pagos</b>: próximo cobro y método de pago.</li>
                            <li><b>Tus correos</b> activos con el nombre de tu empresa.</li>
                            <li><b>Tus documentos</b>: contrato, facturas y manuales.</li>
                            <li><b>Soporte</b>: pide ayuda y sigue tu solicitud en el mismo lugar.</li>
                        </ul>
                        <Link to="/login" className="btn">Entrar a mi portal →</Link>
                    </div>
                    <div className="acct" aria-label="Ejemplo del portal de clientes">
                        <div className="top"><b>Mi cuenta · Tu Negocio</b><span>● Todo al día</span></div>
                        <dl>
                            {ACCOUNT.map((r) => (
                                <div className="row" key={r.dt}>
                                    <dt>{r.dt}</dt>
                                    <dd><b>{r.b}</b><small>{r.small}</small></dd>
                                    <span className={`st${r.kind ? ` ${r.kind}` : ''}`}>{r.st}</span>
                                </div>
                            ))}
                        </dl>
                        <div className="foot">Datos de ejemplo</div>
                    </div>
                </div>
            </section>

            {/* Cómo trabajamos */}
            <section className="s gutter" id="como" style={{ paddingTop: 0 }}>
                <div className="max">
                    <div className="s-head">
                        <h2 className="display">Cómo<br />trabajamos</h2>
                        <p>Primero entendemos cómo funciona tu negocio. Después lo construimos contigo, paso a paso.</p>
                    </div>
                    <ol className="steps">
                        {STEPS.map((s, i) => (
                            <li key={s.title}>
                                <span className="n">PASO {i + 1}</span>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <DomainSection />

            {/* Llamado final */}
            <section className="cta gutter">
                <div className="max">
                    <h2 className="display">¿Conversamos sobre tu negocio?</h2>
                    <button type="button" className="btn" onClick={() => { track('CTA final: Hablar con el asesor'); openChat(); }}>
                        Hablar con el asesor →
                    </button>
                </div>
            </section>
        </main>

        <Footer />
    </div>
);

export default Home;
