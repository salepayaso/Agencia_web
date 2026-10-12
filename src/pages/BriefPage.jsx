import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import Wordmark from '../components/Wordmark';
import { PortalLoading } from '../components/ProtectedRoute';
import {
    METAS, MATERIAL, SITIO_ACTUAL, TIPOS, PRODUCTOS, DOMINIO, PLAZOS, VIAS,
    briefError, briefRows,
} from '../data/brief';
import { QUOTE_VISIBLE } from '../data/quote';

// Brief por enlace personal (/brief/:token). Lo crea el equipo en /admin después
// de conversar con el cliente; el cliente lo llena sin cuenta, puede guardar y
// volver con el mismo enlace, y al enviarlo nos llega el resumen por correo.
// El servidor (api/brief.js) valida el token y limpia lo que se guarda.

const STEPS = ['Tu negocio', 'Tu sitio', 'Material', 'Contacto'];
const WHATSAPP = '+56 9 5414 6176';

const BriefPage = () => {
    const { token } = useParams();
    const [state, setState] = useState('loading'); // loading | missing | error | ready
    const [info, setInfo] = useState(null);
    const [b, setB] = useState(null);
    const [step, setStep] = useState(0);
    const [editing, setEditing] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState('');

    // Enlace personal: que no aparezca en buscadores.
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
        return () => meta.remove();
    }, []);

    useEffect(() => {
        let alive = true;
        fetch(`/api/brief?t=${encodeURIComponent(token)}`)
            .then(async (res) => {
                if (!alive) return;
                if (res.status === 404) return setState('missing');
                const json = await res.json().catch(() => ({}));
                if (!res.ok) { setError(json.error || ''); return setState('error'); }
                setInfo(json);
                setB(json.brief);
                setEditing(json.editable && !json.sent);
                setState('ready');
            })
            .catch(() => alive && setState('error'));
        return () => { alive = false; };
    }, [token]);

    if (state === 'loading') return <PortalLoading />;

    const set = (k) => (v) => { setB((x) => ({ ...x, [k]: v })); setSaved(''); };
    const toggle = (k, item) => set(k)(b[k].includes(item) ? b[k].filter((x) => x !== item) : [...b[k], item]);

    const save = async (send = false) => {
        if (send) {
            const err = briefError(b);
            if (err) return setError(err);
        }
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/brief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ t: token, brief: b, send }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) return setError(json.error || 'No pudimos guardar. Intenta de nuevo en un momento.');
            setInfo(json);
            if (send) {
                setEditing(false);
                window.scrollTo({ top: 0 });
            } else {
                setSaved(`Guardado a las ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}. Puedes volver con este mismo enlace.`);
            }
        } catch {
            setError('No pudimos guardar. Revisa tu conexión e intenta de nuevo.');
        } finally {
            setBusy(false);
        }
    };

    const next = (e) => {
        e.preventDefault();
        if (step < STEPS.length - 1) {
            setStep(step + 1);
            setError('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            save(true);
        }
    };

    const first = (b?.nombre || '').split(' ')[0];

    return (
        <div className="tc-page">
            <SEO title="Tu proyecto" description="Cuéntanos de tu proyecto para preparar tu cotización." />
            <div className="tc">
                <header className="portal-bar gutter">
                    <div className="max">
                        <Link to="/" className="brand" aria-label="Interfaz 360, ir al sitio">
                            <Wordmark className="text-[20px]" />
                            <small>{info ? `Brief ${info.number}` : 'Brief'}</small>
                        </Link>
                    </div>
                </header>

                <main className="gutter">
                    <div className="max" style={{ paddingBottom: 80 }}>
                        {state === 'missing' && (
                            <Message title="Este enlace no existe">
                                Puede que esté incompleto o que lo hayamos cerrado. Escríbenos por WhatsApp al {WHATSAPP} y te mandamos uno nuevo.
                            </Message>
                        )}
                        {state === 'error' && (
                            <Message title="No pudimos abrir tu formulario">
                                {error || 'Intenta de nuevo en un momento.'} Si sigue fallando, escríbenos por WhatsApp al {WHATSAPP}.
                            </Message>
                        )}

                        {state === 'ready' && !info.editable && (
                            <>
                                {QUOTE_VISIBLE.includes(info.status) ? (
                                    <Message title="Tu cotización está lista">
                                        Ya te la enviamos por correo. También la puedes ver, descargar y aceptar aquí:{' '}
                                        <Link to={`/cotizacion/${token}`} className="textlink">Ver mi cotización →</Link>
                                    </Message>
                                ) : (
                                    <Message title="Ya estamos con tu cotización">
                                        Recibimos tu información y estamos preparando tu cotización, así que el formulario ya no se puede cambiar.
                                        Si necesitas agregar algo, escríbenos por WhatsApp al {WHATSAPP}.
                                    </Message>
                                )}
                                <Summary b={b} />
                            </>
                        )}

                        {state === 'ready' && info.editable && !editing && (
                            <>
                                <div className="portal-head">
                                    <div>
                                        <span className="eyebrow">Brief {info.number}</span>
                                        <h1 className="display" style={{ marginTop: 14 }}>¡Listo, <span>recibido!</span></h1>
                                        <p className="portal-lede">
                                            Gracias{first ? `, ${first}` : ''}. Con esto preparamos tu cotización y {{
                                                correo: `te la enviamos a ${b.correo}`,
                                                whatsapp: 'te la mandamos por WhatsApp',
                                                reunion: 'te escribimos para coordinar la reunión por Meet',
                                            }[b.via]}. Te llegó una copia de este enlace a tu correo.
                                        </p>
                                    </div>
                                </div>
                                <div className="brief-grid">
                                    <Summary b={b} />
                                    <Side />
                                </div>
                                <div className="admin-actions" style={{ marginTop: 24 }}>
                                    <button type="button" className="btn" onClick={() => { setEditing(true); setStep(0); }}>Cambiar mis respuestas</button>
                                </div>
                            </>
                        )}

                        {state === 'ready' && info.editable && editing && (
                            <>
                                <div className="portal-head">
                                    <div>
                                        <span className="eyebrow">Brief {info.number}</span>
                                        <h1 className="display" style={{ marginTop: 14 }}>Cuéntanos de <span>tu proyecto</span></h1>
                                        <p className="portal-lede">
                                            Hola{first ? ` ${first}` : ''}. Con lo que conversamos, completa estos 4 pasos.
                                            Puedes guardar y volver cuando quieras con este mismo enlace.
                                        </p>
                                    </div>
                                </div>

                                <div className="brief-grid">
                                    <section className="panel">
                                        <ol className="brief-steps">
                                            {STEPS.map((s, i) => (
                                                <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
                                                    <button type="button" onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
                                                        <i>{i + 1}</i><span>{s}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ol>

                                        <form className="box-body brief-form" onSubmit={next} noValidate>
                                            {step === 0 && (
                                                <>
                                                    <div className="form-grid">
                                                        <label className="field">Nombre del negocio
                                                            <input value={b.negocio} onChange={(e) => set('negocio')(e.target.value)} maxLength={120} placeholder="Tu Negocio" />
                                                        </label>
                                                        <label className="field">Rubro
                                                            <input value={b.rubro} onChange={(e) => set('rubro')(e.target.value)} maxLength={120} placeholder="Ferretería, pastelería, consulta dental…" />
                                                        </label>
                                                    </div>
                                                    <Question label="¿Qué quieres lograr con el sitio?" hint="Marca todo lo que aplique.">
                                                        <div className="toggles">
                                                            {METAS.map((m) => (
                                                                <button key={m} type="button" aria-pressed={b.metas.includes(m)} onClick={() => toggle('metas', m)}>{m}</button>
                                                            ))}
                                                        </div>
                                                    </Question>
                                                    <Question label="¿Ya tienes un sitio web?">
                                                        <Choices options={SITIO_ACTUAL} value={b.sitio_actual} onChange={set('sitio_actual')} cols={3} />
                                                        {b.sitio_actual === 'arreglar' && (
                                                            <p className="alert">No reparamos sitios hechos por otros. Te hacemos uno nuevo y lo dejamos funcionando con tu dominio: sigue con el formulario y lo cotizamos así.</p>
                                                        )}
                                                        {b.sitio_actual !== 'no' && (
                                                            <label className="field">¿Cuál es? (opcional)
                                                                <input value={b.sitio_url} onChange={(e) => set('sitio_url')(e.target.value)} maxLength={200} placeholder="www.tunegocio.cl" autoCapitalize="none" />
                                                            </label>
                                                        )}
                                                    </Question>
                                                </>
                                            )}

                                            {step === 1 && (
                                                <>
                                                    <Question label="¿Qué tipo de sitio necesitas?">
                                                        <Choices options={TIPOS} value={b.tipo} onChange={set('tipo')} cols={2} />
                                                    </Question>
                                                    {b.tipo === 'tienda' && (
                                                        <Question label="¿Cuántos productos vas a vender?" hint="Tu catálogo va a cambiar con el tiempo y eso está bien. Partimos con lo que tengas y te ayudamos a armarlo.">
                                                            <div className="toggles">
                                                                {Object.entries(PRODUCTOS).map(([id, label]) => (
                                                                    <button key={id} type="button" aria-pressed={b.productos === id} onClick={() => set('productos')(id)}>{label}</button>
                                                                ))}
                                                            </div>
                                                        </Question>
                                                    )}
                                                    {b.tipo === 'sistema' && (
                                                        <label className="field">¿Qué debería hacer el sistema?
                                                            <textarea value={b.sistema_desc} onChange={(e) => set('sistema_desc')(e.target.value)} maxLength={2000} rows={4} placeholder="Por ejemplo: controlar el stock de 3 bodegas y avisarme cuando algo se acaba" />
                                                        </label>
                                                    )}
                                                    <Question label="¿Ya tienes dominio (tunegocio.cl)?">
                                                        <Choices options={DOMINIO} value={b.dominio} onChange={set('dominio')} cols={3} />
                                                        {b.dominio === 'si' && (
                                                            <label className="field">¿Cuál es?
                                                                <input value={b.dominio_nombre} onChange={(e) => set('dominio_nombre')(e.target.value)} maxLength={80} placeholder="tunegocio.cl" autoCapitalize="none" />
                                                            </label>
                                                        )}
                                                    </Question>
                                                    <label className="brief-check">
                                                        <input type="checkbox" checked={b.asistente_ia} onChange={(e) => set('asistente_ia')(e.target.checked)} />
                                                        <span>Me interesa un <b>asistente IA</b> que atienda a mis clientes en el sitio a cualquier hora. Se cotiza aparte.</span>
                                                    </label>
                                                </>
                                            )}

                                            {step === 2 && (
                                                <>
                                                    <Question label="¿Qué material tienes listo?" hint="¿No tienes logo, fotos ni textos? Te ayudamos a crearlos y no retrasa el proyecto.">
                                                        <div className="toggles">
                                                            {MATERIAL.map((m) => (
                                                                <button key={m} type="button" aria-pressed={b.material.includes(m)} onClick={() => toggle('material', m)}>{m}</button>
                                                            ))}
                                                        </div>
                                                    </Question>
                                                    <label className="field">Sitios que te gusten <em>(opcional)</em>
                                                        <textarea value={b.referencias} onChange={(e) => set('referencias')(e.target.value)} maxLength={2000} rows={3} placeholder="Pega enlaces o cuéntanos qué te gusta de ellos" />
                                                    </label>
                                                    <Question label="¿Para cuándo lo necesitas?">
                                                        <div className="toggles">
                                                            {PLAZOS.map((p) => (
                                                                <button key={p} type="button" aria-pressed={b.plazo === p} onClick={() => set('plazo')(p)}>{p}</button>
                                                            ))}
                                                        </div>
                                                    </Question>
                                                </>
                                            )}

                                            {step === 3 && (
                                                <>
                                                    <p className="muted" style={{ margin: 0, fontSize: 15 }}>Estos datos los cargamos nosotros al crear tu enlace. Corrígelos si algo cambió.</p>
                                                    <div className="form-grid">
                                                        <label className="field">Tu nombre
                                                            <input value={b.nombre} onChange={(e) => set('nombre')(e.target.value)} maxLength={100} autoComplete="name" />
                                                        </label>
                                                        <label className="field">WhatsApp
                                                            <input type="tel" value={b.telefono} onChange={(e) => set('telefono')(e.target.value)} maxLength={30} autoComplete="tel" placeholder="+56 9 1234 5678" />
                                                        </label>
                                                        <label className="field wide">Correo
                                                            <input type="email" value={b.correo} onChange={(e) => set('correo')(e.target.value)} maxLength={254} autoComplete="email" autoCapitalize="none" />
                                                        </label>
                                                        <label className="field">RUT <em>(opcional, para la cotización)</em>
                                                            <input value={b.rut} onChange={(e) => set('rut')(e.target.value)} maxLength={20} placeholder="76.123.456-7" />
                                                        </label>
                                                        <label className="field">Razón social <em>(opcional, si necesitas factura)</em>
                                                            <input value={b.razon} onChange={(e) => set('razon')(e.target.value)} maxLength={150} />
                                                        </label>
                                                    </div>
                                                    <Question label="¿Cómo prefieres recibir la cotización?">
                                                        <Choices options={VIAS} value={b.via} onChange={set('via')} cols={3} />
                                                        {b.via === 'reunion' && (
                                                            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Reuniones por Google Meet los martes, jueves y sábado, de 18:00 a 21:00. Te escribimos para coordinar la hora.</p>
                                                        )}
                                                    </Question>
                                                    <label className="field">¿Algo más que debamos saber? <em>(opcional)</em>
                                                        <textarea value={b.comentarios} onChange={(e) => set('comentarios')(e.target.value)} maxLength={2000} rows={3} />
                                                    </label>
                                                </>
                                            )}

                                            {error && <p className="alert" role="alert">{error}</p>}
                                            {saved && <p className="alert ok" role="status">{saved}</p>}

                                            <div className="brief-nav">
                                                {step > 0
                                                    ? <button type="button" className="textlink" onClick={() => setStep(step - 1)}>← Atrás</button>
                                                    : <span />}
                                                <div className="admin-actions">
                                                    <button type="button" className="btn" disabled={busy} onClick={() => save(false)}>{busy ? 'Guardando…' : 'Guardar'}</button>
                                                    <button type="submit" className="btn signal" disabled={busy}>
                                                        {step < STEPS.length - 1 ? 'Siguiente →' : busy ? 'Enviando…' : 'Guardar y enviar →'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </section>
                                    <Side />
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const Message = ({ title, children }) => (
    <div className="portal-head">
        <div>
            <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>{title}</h1>
            <p className="portal-lede">{children}</p>
        </div>
    </div>
);

const Question = ({ label, hint, children }) => (
    <fieldset className="brief-q">
        <legend>{label}</legend>
        {hint && <p className="muted">{hint}</p>}
        {children}
    </fieldset>
);

// Opciones con título y bajada; una sola elegida.
const Choices = ({ options, value, onChange, cols }) => (
    <div className={`brief-choices c${cols}`} role="radiogroup">
        {Object.entries(options).map(([id, o]) => (
            <button key={id} type="button" role="radio" aria-checked={value === id} aria-pressed={value === id} onClick={() => onChange(id)}>
                <b>{o.label}</b>
                <small>{o.sub}</small>
            </button>
        ))}
    </div>
);

const Summary = ({ b }) => (
    <section className="panel">
        <div className="box-title"><b>Tus respuestas</b></div>
        <dl className="brief-summary">
            {briefRows(b).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
        </dl>
    </section>
);

const Side = () => (
    <aside className="brief-side">
        <span className="eyebrow">Cómo sigue</span>
        <ol>
            <li><b>Envías este formulario.</b> Nos llega tu información al tiro.</li>
            <li><b>Preparamos tu cotización</b> con lo que necesitas y te la enviamos.</li>
            <li><b>La aceptas</b> y pagas el 50 % para partir.</li>
            <li><b>Trabajamos tu sitio</b> y te mostramos avances.</li>
            <li><b>Lo apruebas</b>, pagas el 50 % restante y lo publicamos.</li>
        </ol>
        <p>¿Dudas? WhatsApp {WHATSAPP} · contacto@interfaz360.cl</p>
    </aside>
);

export default BriefPage;
