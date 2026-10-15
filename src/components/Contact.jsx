import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Clock, Instagram, Loader2, MapPin, MessageCircle, RotateCcw } from 'lucide-react';
import Section from './ui/Section';
import { openChat } from '../lib/chat';

// Lo que la persona puede marcar. El backend solo acepta estos valores.
const SERVICIOS = [
    'Página web',
    'Tienda online',
    'Google y Maps',
    'Agente IA',
    'Software a medida',
    'Dominio y correos',
];

const EMPTY = { name: '', email: '', phone: '', message: '', website: '' };

const inputBase =
    'peer w-full bg-transparent border-0 border-b border-white/15 px-0 pt-6 pb-2 text-white text-base placeholder-transparent focus:outline-none focus:ring-0 focus:border-primary-400 transition-colors';
const labelBase =
    'absolute left-0 top-1.5 text-xs font-medium text-gray-400 transition-all pointer-events-none peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary-400';

const Field = ({ id, label, optional, textarea, ...props }) => {
    const Tag = textarea ? 'textarea' : 'input';
    return (
        <div className="relative">
            <Tag id={id} name={id} placeholder={label} className={`${inputBase} ${textarea ? 'resize-none' : ''}`} {...props} />
            <label htmlFor={id} className={labelBase}>
                {label}
                {optional && <span className="text-gray-600 font-normal"> · opcional</span>}
            </label>
        </div>
    );
};

const Contact = () => {
    const [status, setStatus] = useState('idle'); // idle | sending | sent
    const [error, setError] = useState('');
    const [servicios, setServicios] = useState([]);
    const [form, setForm] = useState(EMPTY);

    const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const toggle = (s) =>
        setServicios((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

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
        <Section id="contact" className="pb-24">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
                {/* ---- Columna izquierda ---- */}
                <div className="lg:sticky lg:top-32">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400 mb-5">Contacto</p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-6 text-balance">
                        Cuéntanos qué quieres construir.
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-md">
                        Te respondemos con una propuesta concreta, no con un folleto. Sin compromiso.
                    </p>

                    <ul className="space-y-4 text-gray-300 mb-10">
                        <li className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary-400 shrink-0" />
                            Respuesta en menos de 24 horas hábiles
                        </li>
                        <li className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary-400 shrink-0" />
                            Santiago presencial · todo Chile remoto
                        </li>
                        <li className="flex items-center gap-3">
                            <Instagram className="w-5 h-5 text-primary-400 shrink-0" />
                            <a href="https://www.instagram.com/interfaz360/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-4 hover:underline">
                                @interfaz360
                            </a>
                        </li>
                    </ul>

                    <button
                        type="button"
                        onClick={() => openChat()}
                        className="group w-full max-w-md flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary-400/50 hover:bg-white/[0.06] transition-colors text-left"
                    >
                        <span className="relative flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                            <MessageCircle className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-dark-bg" />
                        </span>
                        <span className="flex-1">
                            <span className="block font-semibold text-white">¿Prefieres una respuesta ya?</span>
                            <span className="block text-sm text-gray-400">Faz, nuestro agente IA, te atiende ahora mismo</span>
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                {/* ---- Formulario ---- */}
                <div className="rounded-3xl border border-white/10 bg-dark-card/60 p-6 sm:p-10">
                    <AnimatePresence mode="wait">
                        {status === 'sent' ? (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="py-16 text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center">
                                    <Check className="w-8 h-8" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-3xl font-bold mb-3">¡Listo, {form.name.trim().split(' ')[0]}!</h2>
                                <p className="text-gray-300 max-w-sm mx-auto">
                                    Recibimos tu mensaje. Te escribimos a <span className="text-white">{form.email.trim()}</span> dentro de 24 horas hábiles.
                                </p>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="mt-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" /> Enviar otro mensaje
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-8"
                            >
                                <fieldset>
                                    <legend className="text-sm font-semibold text-white mb-4">
                                        ¿Qué necesitas? <span className="text-gray-500 font-normal">Marca todo lo que aplique</span>
                                    </legend>
                                    <div className="flex flex-wrap gap-2">
                                        {SERVICIOS.map((s) => {
                                            const on = servicios.includes(s);
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    aria-pressed={on}
                                                    onClick={() => toggle(s)}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${on
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-white/15 text-gray-300 hover:border-white/40 hover:text-white'}`}
                                                >
                                                    {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <Field id="name" label="Tu nombre" autoComplete="name" maxLength={100} value={form.name} onChange={update} />
                                    <Field id="email" label="Correo" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update} />
                                    <div className="sm:col-span-2">
                                        <Field id="phone" label="WhatsApp" optional type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={update} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Field id="message" label="Cuéntanos de tu negocio y tu idea" textarea rows={4} maxLength={3000} value={form.message} onChange={update} />
                                    </div>
                                </div>

                                {/* Trampa para bots: invisible para personas. */}
                                <div className="absolute -left-[9999px]" aria-hidden="true">
                                    <label htmlFor="website">No completar</label>
                                    <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
                                </div>

                                {error && (
                                    <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                                    <p className="text-xs text-gray-500 max-w-xs">
                                        Usamos tus datos solo para responderte. <a href="/privacidad" className="underline hover:text-gray-300">Privacidad</a>
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white text-dark-bg font-semibold hover:bg-primary-400 disabled:opacity-60 transition-colors"
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                                        ) : (
                                            <>Enviar mensaje <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Section>
    );
};

export default Contact;
