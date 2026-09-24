import { useRef, useState } from 'react';

// Buscador de dominios .cl con compra en 3 pasos: datos del titular → plan y
// forma de pago → listo.
// Mientras no esté conectada la pasarela (Webpay), el paso 2 no cobra: envía el
// pedido por /api/contact y coordinamos el pago por correo o WhatsApp.
// Regla vigente: nunca registrar un dominio sin el pago recibido.

const PLANS = {
    1: { label: '1 año', price: 25000, note: 'Renovación anual $25.000' },
    2: { label: '2 años', price: 45000, note: 'Ahorras $5.000' },
};
const PAYS = {
    webpay: { label: 'Tarjeta', note: 'Débito o crédito vía Webpay' },
    mp: { label: 'Mercado Pago', note: 'Saldo o tarjetas guardadas' },
    tr: { label: 'Transferencia', note: 'Registramos al confirmar el depósito' },
};
const WHATSAPP = 'https://wa.me/56954146176';

const clp = (n) => `$${n.toLocaleString('es-CL')}`;

const cleanDomain = (v) => v.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\.cl$/, '');
const validDomain = (d) => d.length >= 2 && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(d);

// Dígito verificador del RUT (módulo 11)
const rutOk = (value) => {
    const r = value.replace(/[^0-9kK]/g, '').toUpperCase();
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

const track = (event, data) => window.dataLayer?.push({ event, ...data });

const EMPTY = { kind: 'p', name: '', rut: '', email: '', phone: '', address: '', account: true };

const DomainSection = () => {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | available | taken | error
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    const [step, setStep] = useState(0); // 0 cerrado, 1 datos, 2 pago, 3 listo
    const [data, setData] = useState(EMPTY);
    const [bad, setBad] = useState({});
    const [formError, setFormError] = useState('');
    const [years, setYears] = useState('1');
    const [pay, setPay] = useState('webpay');
    const [sending, setSending] = useState(false);
    const nameRef = useRef(null);

    const q = cleanDomain(query);
    const qValid = validDomain(q);
    const plan = PLANS[years];

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
        track('domain_buy_start', { domain_name: domain });
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

        const message = [
            `PEDIDO DE DOMINIO: ${domain}`,
            `Plan: ${plan.label} · ${clp(plan.price)}`,
            `Forma de pago elegida: ${PAYS[pay].label}`,
            '',
            `Titular (${data.kind === 'e' ? 'empresa' : 'persona'}): ${data.name.trim()}`,
            `RUT: ${data.rut.trim()}`,
            `Correo: ${data.email.trim()}`,
            `Teléfono: ${data.phone.trim() || '—'}`,
            `Dirección: ${data.address.trim()}`,
            `Crear cuenta de cliente: ${data.account ? 'sí' : 'no'}`,
        ].join('\n');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name.trim(),
                    email: data.email.trim(),
                    phone: data.phone.trim(),
                    services: ['Dominio y correos'],
                    message,
                }),
            });
            if (!res.ok) throw new Error();
            track('domain_order', { domain_name: domain, plan_years: years, payment: pay });
            setStep(3);
        } catch {
            setFormError('No pudimos enviar el pedido. Intenta de nuevo o escríbenos por WhatsApp.');
        } finally {
            setSending(false);
        }
    };

    const cancel = () => {
        setStep(0);
        setFormError('');
        setBad({});
    };

    const stepClass = (n) => (n === step ? 'on' : n < step ? 'past' : undefined);
    const firstName = data.name.trim();

    return (
        <section className="s domain gutter" id="dominio">
            <div className="max">
                <div>
                    <h2 className="display">¿Tu nombre<br />está <span>libre</span>?</h2>
                    <p>Busca tu dominio .cl. Si está libre, lo pides aquí mismo: dejas tus datos, pagas y lo registramos a tu nombre.</p>
                    <ol className="dsteps-info">
                        <li><span><b>Tus datos</b> como titular del dominio.</span></li>
                        <li><span><b>Pagas</b> con tarjeta, Mercado Pago o transferencia.</span></li>
                        <li><span><b>Lo ves en tu portal</b> con su fecha de vencimiento.</span></li>
                    </ol>
                </div>

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
                                    <small>Desde {clp(PLANS[1].price)} al año · buscar no lo reserva: se asegura al pagar</small>
                                </div>
                                {step === 0 && (
                                    <button className="btn signal" type="button" onClick={startBuy}>Comprar este dominio →</button>
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
                                    <label className="chk">
                                        <input type="checkbox" checked={data.account} onChange={set('account')} />
                                        <span><b>Crear mi cuenta de cliente.</b> Te enviamos un enlace al correo para entrar a tu portal, donde verás el dominio y cuándo vence.</span>
                                    </label>
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
                                        {Object.entries(PLANS).map(([id, p]) => (
                                            <label key={id}>
                                                <input type="radio" name="plan" value={id} checked={years === id} onChange={(e) => setYears(e.target.value)} />
                                                <span><b>{p.label}</b><small>{p.note}</small></span>
                                                <strong>{clp(p.price)}</strong>
                                            </label>
                                        ))}
                                    </fieldset>
                                    <div className="sum">
                                        <span><b>{domain}</b> · {plan.label}</span>
                                        <span>Total <b>{clp(plan.price)}</b></span>
                                    </div>
                                    <fieldset className="pay">
                                        <legend>¿Cómo quieres pagar?</legend>
                                        {Object.entries(PAYS).map(([id, p]) => (
                                            <label key={id}>
                                                <input type="radio" name="pay" value={id} checked={pay === id} onChange={(e) => setPay(e.target.value)} />
                                                <span><b>{p.label}</b><small>{p.note}</small></span>
                                            </label>
                                        ))}
                                    </fieldset>
                                    {formError && <p className="err" role="alert">{formError}</p>}
                                    <div className="bnav">
                                        <button className="btn signal" type="submit" disabled={sending}>
                                            {sending ? 'Enviando…' : `Confirmar pedido · ${clp(plan.price)} →`}
                                        </button>
                                        <button className="link" type="button" onClick={() => setStep(1)}>← Volver</button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <div className="bpane">
                                    <p className="done">
                                        Recibimos tu pedido de <b>{domain}</b> a nombre de <b>{firstName}</b>.
                                    </p>
                                    <ol className="track">
                                        <li className="ok">Pedido recibido</li>
                                        <li className="now">Pago</li>
                                        <li>Registro y activo en tu portal</li>
                                    </ol>
                                    <p className="note2">
                                        Te escribimos a {data.email.trim()} con {pay === 'tr' ? 'los datos para la transferencia' : 'el enlace de pago'}.
                                        Apenas se confirme, registramos el dominio a tu nombre
                                        {data.account ? ' y te enviamos el acceso a tu portal.' : '.'}
                                    </p>
                                    <div className="bnav">
                                        <button className="link" type="button" onClick={() => { cancel(); setData(EMPTY); setQuery(''); setStatus('idle'); }}>
                                            Buscar otro dominio
                                        </button>
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
            </div>
        </section>
    );
};

export default DomainSection;
