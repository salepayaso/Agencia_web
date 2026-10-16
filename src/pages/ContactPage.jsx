import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell, { PageHead } from '../components/PageShell';
import { openChat } from '../lib/chat';

// Lo que la persona puede marcar. El backend (api/contact.js) solo acepta estos valores.
const SERVICIOS = [
    'Página web',
    'Tienda online',
    'Ecosistema Google',
    'Agente IA',
    'Software a medida',
    'Dominio y correos',
];

const EMPTY = { name: '', email: '', phone: '', message: '', website: '' };

const ContactPage = () => {
    const [status, setStatus] = useState('idle'); // idle | sending | sent
    const [error, setError] = useState('');
    const [servicios, setServicios] = useState([]);
    const [form, setForm] = useState(EMPTY);

    const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const toggle = (s) => setServicios((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

    const reset = () => {
        setForm(EMPTY);
        setServicios([]);
        setError('');
        setStatus('idle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.name.trim().length < 2) return setError('Escribe tu nombre.');
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email.trim())) return setError('Revisa el correo, parece incompleto.');
        if (form.message.trim().length < 5) return setError('Cuéntanos un poco de tu proyecto.');

        setStatus('sending');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, services: servicios }),
            });

            if (response.ok) {
                window.dataLayer?.push({ event: 'contact_form_sent', services: servicios.join(', ') });
                setStatus('sent');
                return;
            }
            const { error: apiError } = await response.json().catch(() => ({}));
            setError(response.status === 429 && apiError
                ? apiError
                : 'No pudimos enviar el mensaje. Intenta de nuevo en un momento.');
        } catch {
            setError('No pudimos enviar el mensaje. Revisa tu conexión e intenta de nuevo.');
        }
        setStatus('idle');
    };

    return (
        <PageShell
            title="Cotiza tu página web o agente IA"
            description="Cuéntanos de tu negocio por WhatsApp, chat o formulario. Te respondemos en un día hábil con una propuesta y un precio cerrado, sin compromiso."
        >
            <PageHead eyebrow="Contacto" title={<>Cotiza tu<br />página <span>web</span></>}>
                Página web, agente IA, tienda o software: te respondemos con una propuesta concreta, no con un folleto. Sin compromiso.
            </PageHead>

            <section className="s gutter">
                <div className="max contact-wrap">
                    <div>
                        <ul className="info">
                            <li>Respuesta dentro de un día hábil</li>
                            <li>Santiago presencial · todo Chile remoto</li>
                            <li>
                                <a href="https://www.instagram.com/interfaz360/" target="_blank" rel="noopener noreferrer">Instagram @interfaz360</a>
                            </li>
                            <li><a href="mailto:contacto@interfaz360.cl">contacto@interfaz360.cl</a></li>
                        </ul>
                        <div className="feed" role="button" tabIndex={0} onClick={() => openChat()}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } }}
                            aria-label="Abrir el chat con Faz">
                            <span className="top"><b>¿Prefieres una respuesta ya?</b><span>● Faz en línea</span></span>
                            <span className="foot"><span>Faz, nuestro agente IA, te atiende ahora mismo.</span><b>Abrir chat →</b></span>
                        </div>
                    </div>

                    <div className="panel">
                        {status === 'sent' ? (
                            <div className="form" aria-live="polite">
                                <h2 className="display" style={{ fontSize: 48 }}>¡Listo, {form.name.trim().split(' ')[0]}!</h2>
                                <p className="muted" style={{ margin: 0 }}>
                                    Recibimos tu mensaje. Te escribimos a <b style={{ color: 'var(--ink)' }}>{form.email.trim()}</b> dentro de un día hábil.
                                </p>
                                <div><button type="button" className="textlink" onClick={reset}>Enviar otro mensaje</button></div>
                            </div>
                        ) : (
                            <form className="form" onSubmit={handleSubmit} noValidate>
                                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                                    <legend className="legend">¿Qué necesitas? <span className="muted" style={{ fontWeight: 500 }}>Marca todo lo que aplique</span></legend>
                                    <div className="toggles">
                                        {SERVICIOS.map((s) => (
                                            <button key={s} type="button" aria-pressed={servicios.includes(s)} onClick={() => toggle(s)}>
                                                {servicios.includes(s) ? '✓ ' : ''}{s}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="form-grid">
                                    <label className="field">Tu nombre
                                        <input name="name" autoComplete="name" maxLength={100} value={form.name} onChange={update} />
                                    </label>
                                    <label className="field">Correo
                                        <input name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update} />
                                    </label>
                                    <label className="field wide"><span>WhatsApp <em>· opcional</em></span>
                                        <input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="+56 9 1234 5678" value={form.phone} onChange={update} />
                                    </label>
                                    <label className="field wide">Cuéntanos de tu negocio y tu idea
                                        <textarea name="message" rows={5} maxLength={3000} value={form.message} onChange={update} />
                                    </label>
                                </div>

                                {/* Trampa para bots: invisible para personas. */}
                                <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                                    <label htmlFor="website">No completar</label>
                                    <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
                                </div>

                                {error && <p role="alert" className="alert">{error}</p>}

                                <div className="row-between" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="muted" style={{ fontSize: 13, maxWidth: '32ch' }}>
                                        Usamos tus datos solo para responderte. <Link to="/privacidad" className="textlink" style={{ fontSize: 13 }}>Privacidad</Link>
                                    </span>
                                    <button type="submit" className="btn signal" disabled={status === 'sending'}>
                                        {status === 'sending' ? 'Enviando…' : 'Enviar mensaje →'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </PageShell>
    );
};

export default ContactPage;
