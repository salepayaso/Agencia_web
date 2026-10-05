import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { OFFERS, PAYS, ACTIVE_PAYS, DEFAULT_PAY, payMethodsText, clp, rutOk, loadAccount, holderFromProfile, submitOrder as sendOrder } from '../lib/orders';

// Buscador de dominios .cl con compra en 3 pasos: datos del titular → plan y
// forma de pago → listo.
// - En la portada y en Servicios va como sección completa.
// - En el portal va "embedded" (sin la columna de texto), para comprar un
//   dominio solo o el pack hosting + dominio (kind="pack").
// Si la persona entró a su cuenta, los datos del titular vienen de su ficha
// y el pedido queda guardado en su portal (src/lib/orders.js).

const WHATSAPP = 'https://wa.me/56954146176';

const cleanDomain = (v) => v.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\.cl$/, '');
const validDomain = (d) => d.length >= 2 && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(d);

const track = (event, data) => window.dataLayer?.push({ event, ...data });

const EMPTY = { kind: 'p', name: '', rut: '', email: '', phone: '', address: '', account: true };

const DomainSection = ({ embedded = false, kind = 'dominio', onOrdered, onCancel }) => {
    const offer = OFFERS[kind];
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | available | taken | error
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    const [account, setAccount] = useState({ user: null, profile: null });
    const [step, setStep] = useState(0); // 0 cerrado, 1 datos, 2 pago, 3 listo
    const [data, setData] = useState(EMPTY);
    const [bad, setBad] = useState({});
    const [formError, setFormError] = useState('');
    const [years, setYears] = useState('1');
    const [pay, setPay] = useState(DEFAULT_PAY);
    const [sending, setSending] = useState(false);
    const nameRef = useRef(null);

    // Con sesión, el titular viene prellenado desde la ficha
    useEffect(() => {
        let alive = true;
        loadAccount().then((acc) => {
            if (!alive || !acc.user) return;
            setAccount(acc);
            setData((d) => ({ ...d, ...holderFromProfile(acc.profile, acc.user) }));
        }).catch(() => {});
        return () => { alive = false; };
    }, []);

    const loggedIn = !!account.user;
    const q = cleanDomain(query);
    const qValid = validDomain(q);
    const plan = offer.years[years] || offer.years[1];
    const fromPrice = offer.years[1].price;

    const search = async (name) => {
        if (!validDomain(name) || status === 'loading') return;
        setStatus('loading');
        setStep(0);
        try {
            const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(name)}`);
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.error || 'No pudimos hacer la consulta. Intenta de nuevo.');
                setStatus('error');
                return;
            }
            setDomain(json.domain || `${name}.cl`);
            setStatus(json.available ? 'available' : 'taken');
            track('domain_search', { domain_name: json.domain, domain_available: json.available });
        } catch {
            setError('No pudimos hacer la consulta. Intenta de nuevo.');
            setStatus('error');
        }
    };

    const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const startBuy = () => {
        setStep(1);
        track('domain_buy_start', { domain_name: domain, order_kind: kind });
        setTimeout(() => nameRef.current?.focus(), 0);
    };

    const submitData = (e) => {
        e.preventDefault();
        const b = {};
        const msg = [];
        if (data.name.trim().length < 3) { b.name = true; msg.push('escribe el nombre del titular'); }
        if (!rutOk(data.rut)) { b.rut = true; msg.push('revisa el RUT, el dígito verificador no calza'); }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) { b.email = true; msg.push('escribe un correo válido'); }
        if (data.address.trim().length < 6) { b.address = true; msg.push('escribe la dirección del titular'); }
        setBad(b);
        if (msg.length) {
            setFormError(`Falta: ${msg.join(', ')}.`);
            return;
        }
        setFormError('');
        setStep(2);
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        setFormError('');
        try {
            await sendOrder({ user: account.user, kind, domain, years: Number(years), pay, holder: data });
            setStep(3);
            onOrdered?.();
        } catch (err) {
            setFormError(err?.message === 'limite_diario'
                ? 'Llegaste al máximo de pedidos por hoy. Si necesitas algo más, escríbenos por WhatsApp.'
                : err?.message === 'sin_sesion'
                    ? 'Tu sesión se cerró. Entra de nuevo a tu cuenta para pagar con tarjeta.'
                    : pay === 'webpay'
                        ? 'No pudimos abrir el pago con tarjeta. Intenta de nuevo o elige transferencia.'
                        : 'No pudimos enviar el pedido. Intenta de nuevo o escríbenos por WhatsApp.');
        } finally {
            setSending(false);
        }
    };

    const cancel = () => {
        setStep(0);
        setFormError('');
        setBad({});
    };

    const restart = () => {
        cancel();
        if (!loggedIn) setData(EMPTY);
        setQuery('');
        setStatus('idle');
    };

    const stepClass = (n) => (n === step ? 'on' : n < step ? 'past' : undefined);
    const holderName = data.name.trim();
    const what = kind === 'pack' ? `el pack hosting + ${domain}` : domain;

    const buyer = (
        <div>
            <form className="dbox" onSubmit={(e) => { e.preventDefault(); search(q); }}>
                <label>
                    <span className="sr-only">Nombre del dominio</span>
                    <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); if (status !== 'loading') setStatus('idle'); }}
                        placeholder="tunegocio"
                        maxLength={70}
                        autoComplete="off"
                        spellCheck={false}
                        autoCapitalize="none"
                    />
                    <span className="tld" aria-hidden="true">.cl</span>
                </label>
                <button type="submit" disabled={!qValid || status === 'loading'}>
                    {status === 'loading' ? 'Buscando…' : 'Buscar .cl'}
                </button>
            </form>
            {query && !qValid && (
                <p className="dhint">Usa solo letras, números y guiones (mínimo 2 caracteres, sin espacios).</p>
            )}

            <div aria-live="polite">
                {status === 'available' && (
                    <div className="dres">
                        <div>
                            <span className="ok">✓ {domain} está disponible</span>
                            <small>
                                {kind === 'pack' ? `Pack hosting + dominio ${clp(fromPrice)} al año` : `Desde ${clp(fromPrice)} al año`}
                                {' · '}buscar no lo reserva: se asegura al pagar
                            </small>
                        </div>
                        {step === 0 && (
                            <button className="btn signal" type="button" onClick={startBuy}>
                                {kind === 'pack' ? 'Contratar pack →' : 'Comprar este dominio →'}
                            </button>
                        )}
                    </div>
                )}
                {status === 'taken' && (
                    <div className="dres">
                        <div>
                            <span className="no">✕ {domain} ya tiene dueño</span>
                            <small>Prueba con una variación:</small>
                            <div className="alts">
                                {[`${q}chile`, `${q}web`, `${q}spa`].map((alt) => (
                                    <button key={alt} type="button" onClick={() => { setQuery(alt); search(alt); }}>
                                        {alt}.cl
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {status === 'error' && (
                    <div className="dres"><span className="no">{error}</span></div>
                )}
            </div>

            {step > 0 && (
                <div className="buy">
                    <ol className="bsteps" aria-label="Pasos de la compra">
                        <li className={stepClass(1)}>1 · Tus datos</li>
                        <li className={stepClass(2)}>2 · Pago</li>
                        <li className={stepClass(3)}>3 · Listo</li>
                    </ol>

                    {step === 1 && (
                        <form className="bpane" onSubmit={submitData} noValidate>
                            {loggedIn && (
                                <p className="note2">Usamos los datos de tu cuenta. Revísalos y corrige lo que haga falta: los guardamos para tus próximos pedidos.</p>
                            )}
                            <fieldset className="kind">
                                <legend>¿A nombre de quién?</legend>
                                <label><input type="radio" name="kind" value="p" checked={data.kind === 'p'} onChange={set('kind')} /> Persona</label>
                                <label><input type="radio" name="kind" value="e" checked={data.kind === 'e'} onChange={set('kind')} /> Empresa</label>
                            </fieldset>
                            <div className="grid2">
                                <label className="f">
                                    <span>{data.kind === 'e' ? 'Razón social' : 'Nombre completo'}</span>
                                    <input ref={nameRef} value={data.name} onChange={set('name')} autoComplete={data.kind === 'e' ? 'organization' : 'name'} maxLength={100} aria-invalid={bad.name || undefined} />
                                </label>
                                <label className="f">
                                    <span>RUT</span>
                                    <input value={data.rut} onChange={set('rut')} placeholder="12.345.678-9" maxLength={14} aria-invalid={bad.rut || undefined} />
                                </label>
                                <label className="f">
                                    <span>Correo</span>
                                    <input type="email" value={data.email} onChange={set('email')} autoComplete="email" maxLength={254} aria-invalid={bad.email || undefined} />
                                </label>
                                <label className="f">
                                    <span>Teléfono</span>
                                    <input type="tel" value={data.phone} onChange={set('phone')} autoComplete="tel" placeholder="+56 9 1234 5678" maxLength={30} />
                                </label>
                                <label className="f wide">
                                    <span>Dirección</span>
                                    <input value={data.address} onChange={set('address')} autoComplete="street-address" maxLength={200} aria-invalid={bad.address || undefined} />
                                </label>
                            </div>
                            {!loggedIn && (
                                <label className="chk">
                                    <input type="checkbox" checked={data.account} onChange={set('account')} />
                                    <span><b>Crear mi cuenta de cliente.</b> Te enviamos un enlace al correo para entrar a tu portal, donde verás el dominio y cuándo vence.</span>
                                </label>
                            )}
                            {formError && <p className="err" role="alert">{formError}</p>}
                            <div className="bnav">
                                <button className="btn signal" type="submit">Continuar al pago →</button>
                                <button className="link" type="button" onClick={cancel}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form className="bpane" onSubmit={submitOrder}>
                            <fieldset className="plan">
                                <legend>¿Por cuánto tiempo?</legend>
                                {Object.entries(offer.years).map(([id, p]) => (
                                    <label key={id}>
                                        <input type="radio" name="plan" value={id} checked={years === id} onChange={(e) => setYears(e.target.value)} />
                                        <span><b>{p.label}</b><small>{p.note}</small></span>
                                        <strong>{clp(p.price)}</strong>
                                    </label>
                                ))}
                            </fieldset>
                            <div className="sum">
                                <span><b>{kind === 'pack' ? `Hosting + ${domain}` : domain}</b> · {plan.label}</span>
                                <span>Total <b>{clp(plan.price)}</b></span>
                            </div>
                            <fieldset className="pay">
                                <legend>¿Cómo quieres pagar?</legend>
                                {ACTIVE_PAYS.map(([id, p]) => {
                                    // Tarjeta pide cuenta: el pedido pagado queda en el portal
                                    const locked = p.needsAccount && !loggedIn;
                                    return (
                                        <label key={id} aria-disabled={locked || undefined} style={locked ? { opacity: 0.6 } : undefined}>
                                            <input type="radio" name="pay" value={id} checked={pay === id} disabled={locked} onChange={(e) => setPay(e.target.value)} />
                                            <span>
                                                <b>{p.label}</b>
                                                <small>{locked ? <><Link to="/login">Entra o crea tu cuenta</Link> para pagar con tarjeta</> : p.note}</small>
                                            </span>
                                        </label>
                                    );
                                })}
                            </fieldset>
                            {formError && <p className="err" role="alert">{formError}</p>}
                            <div className="bnav">
                                <button className="btn signal" type="submit" disabled={sending}>
                                    {pay === 'webpay'
                                        ? (sending ? 'Abriendo Webpay…' : `Pagar con Webpay · ${clp(plan.price)} →`)
                                        : (sending ? 'Enviando…' : `Confirmar pedido · ${clp(plan.price)} →`)}
                                </button>
                                <button className="link" type="button" onClick={() => setStep(1)}>← Volver</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="bpane">
                            <p className="done">
                                Recibimos tu pedido de <b>{what}</b> a nombre de <b>{holderName}</b>.
                            </p>
                            <ol className="track">
                                <li className="ok">Pedido recibido</li>
                                <li className="now">Pago</li>
                                <li>{kind === 'pack' ? 'Activo y accesos por correo' : 'Registro y activo en tu portal'}</li>
                            </ol>
                            <p className="note2">
                                Te escribimos a {data.email.trim()} con {pay === 'tr' ? 'los datos para la transferencia' : 'el enlace de pago'}.
                                {kind === 'pack'
                                    ? ' Apenas se confirme, registramos el dominio a tu nombre y te enviamos los accesos de tu hosting (cPanel) por correo.'
                                    : ' Apenas se confirme, registramos el dominio a tu nombre.'}
                                {loggedIn
                                    ? ' Puedes seguir el pedido en tu portal.'
                                    : data.account ? ' También te enviamos el acceso a tu portal.' : ''}
                            </p>
                            <div className="bnav">
                                {loggedIn && !embedded && <Link className="btn" to="/dashboard">Ver mi portal →</Link>}
                                <button className="link" type="button" onClick={restart}>Buscar otro dominio</button>
                            </div>
                        </div>
                    )}

                    <p className="help">
                        ¿Dudas antes de comprar?{' '}
                        <a href={`${WHATSAPP}?text=${encodeURIComponent(`Hola, tengo una duda sobre el dominio ${domain}`)}`} target="_blank" rel="noopener noreferrer">
                            Escríbenos por WhatsApp
                        </a>
                    </p>
                </div>
            )}
        </div>
    );

    if (embedded) {
        return (
            <div className="domain embedded">
                <div className="emb-head">
                    <div>
                        <b>{kind === 'pack' ? 'Pack hosting + dominio' : 'Comprar un dominio .cl'}</b>
                        <span>{kind === 'pack' ? 'Busca el nombre para tu sitio y tus correos.' : 'Busca el nombre y lo registramos a tu nombre.'}</span>
                    </div>
                    {onCancel && <button type="button" className="link" onClick={onCancel}>Cerrar</button>}
                </div>
                {buyer}
            </div>
        );
    }

    return (
        <section className="s domain gutter" id="dominio">
            <div className="max">
                <div>
                    <h2 className="display">¿Tu nombre<br />está <span>libre</span>?</h2>
                    <p>Busca tu dominio .cl. Si está libre, lo pides aquí mismo: dejas tus datos, pagas y lo registramos a tu nombre.</p>
                    <ol className="dsteps-info">
                        <li><span><b>Tus datos</b> como titular del dominio.</span></li>
                        <li><span><b>Pagas</b> {ACTIVE_PAYS.length === 1 ? 'por' : 'con'} {payMethodsText()}.</span></li>
                        <li><span><b>Lo ves en tu portal</b> con su fecha de vencimiento.</span></li>
                    </ol>
                </div>
                {buyer}
            </div>
        </section>
    );
};

export default DomainSection;
