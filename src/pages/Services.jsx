import { Link } from 'react-router-dom';
import PageShell, { PageHead, CtaBand } from '../components/PageShell';
import DomainSection from '../components/DomainSection';
import { openChat } from '../lib/chat';
import { SERVICIOS, PLANES as PLANS, EN_TODOS_LOS_PLANES, pesos } from '../data/catalogo';

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
        <PageHead eyebrow="Planes y servicios" title={<>Páginas web<br />para <span>pymes</span></>}>
            Dos planes para tener tu página web con agente IA y aparecer en Google, con un solo equipo a cargo. Y si necesitas más, también hacemos tiendas online y software a medida.
        </PageHead>

        <section className="s gutter" id="planes">
            <div className="max">
                <div className="s-head">
                    <h2 className="display">Elige tu<br />plan</h2>
                    <p>Los dos incluyen dominio, correo con el nombre de tu empresa y el agente IA 3 meses gratis. ¿No sabes cuál te conviene? Pregúntale a Faz.</p>
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
                            <div className="price"><b>{pesos(p.precio)}</b><small>Pago único · valor neto</small></div>
                            <div className="body">
                                <ul className="ticks">
                                    {p.items.map((i) => <li key={i}>{i}</li>)}
                                </ul>
                            </div>
                            <footer>
                                <button type="button" className={`btn ${p.hot ? 'signal' : 'solid'}`} onClick={() => { track(`Plan: ${p.name}`); openChat(p.ask); }}>
                                    Preguntar a Faz →
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

        <section className="s gutter" style={{ paddingTop: 0 }}>
            <div className="max">
                <div className="s-head">
                    <h2 className="display">Todo lo que<br />hacemos</h2>
                    <p>Si tu negocio necesita más que un plan: tienda online, ecosistema Google, software a medida, dominio y correos.</p>
                </div>
                <ul className="svc-detail">
                    {SERVICES.map((s) => (
                        <li key={s.title}>
                            <div>
                                <h3>{s.title}</h3>
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

        <DomainSection />

        <CtaBand title="¿Tienes dudas? Conversemos" message="Hola, tengo dudas sobre qué servicio me conviene." />
    </PageShell>
);

export default Services;
