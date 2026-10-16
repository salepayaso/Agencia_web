import { Link } from 'react-router-dom';
import PageShell, { PageHead, CtaBand } from '../components/PageShell';
import DomainSection from '../components/DomainSection';
import { openChat } from '../lib/chat';
import { SERVICIOS, PLANES as PLANS, EN_TODOS_LOS_PLANES } from '../data/catalogo';

// Servicios y planes salen de src/data/catalogo.js (el mismo que usa el agente).
// "Preguntar" abre el chat con Faz con la pregunta ya escrita.
const SERVICES = SERVICIOS.filter((s) => !s.soloAgente);

const track = (label) =>
    window.dataLayer?.push({ event: 'interest_click', service_name: label, click_url: 'button' });

const Services = () => (
    <PageShell
        title="Planes de página web y agente IA"
        description="Pyme Digital $200.000 o Empresa Digital $350.000. También agente IA, tienda online, software a medida, dominio .cl y correos para tu negocio."
    >
        <PageHead eyebrow="Servicios" title={<>Lo que hacemos<br />por tu <span>negocio</span></>}>
            Desde tu primera página web hasta el sistema que ordena tu operación, con un solo equipo a cargo. ¿Dudas? Faz, nuestro agente IA, te explica qué incluye y cuánto cuesta.
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
                                        Preguntar a Faz →
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
                    <p>El precio depende de lo que necesites. Cuéntale a Faz de qué es tu negocio y te dice cuál te conviene y cuánto cuesta.</p>
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
                    Todos los planes incluyen <Link to="/login" className="textlink">{EN_TODOS_LOS_PLANES}</Link>.
                </p>
            </div>
        </section>

        <DomainSection />

        <CtaBand title="¿Tienes dudas? Conversemos" message="Hola, tengo dudas sobre qué servicio me conviene." />
    </PageShell>
);

export default Services;
