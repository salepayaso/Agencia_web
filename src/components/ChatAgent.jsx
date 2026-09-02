import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_URL =
    'https://wa.me/56954146176?text=' +
    encodeURIComponent('Hola Interfaz 360, me gustaría cotizar un proyecto para mi negocio.');

const WELCOME =
    '¡Hola! 👋 Soy el asesor virtual de Interfaz360. Te puedo contar sobre nuestros servicios, planes y precios, o coordinar que un asesor te contacte. ¿Qué andas buscando para tu negocio?';

const SUGGESTIONS = [
    '¿Cuánto cuesta una página web?',
    'Quiero un agente IA para mi negocio',
    '¿Qué incluye la Suite Digital 360?',
];

// Mensajes del globo de invitación. Rotan para no repetir siempre lo mismo.
// Sin precios: el agente no los entrega hasta que el visitante deja sus datos,
// así que anunciarlos acá se contradice con el resto del flujo.
const TEASERS = [
    '¿Buscas página web para tu negocio? Conversemos 👋',
    '¿Un agente IA que atienda a tus clientes 24/7? Te cuento cómo 💬',
    '¿Tienes un proyecto en mente? Cuéntame y te oriento',
    '¿Dudas sobre qué plan te conviene? Te ayudo en 1 minuto',
    '¿Quieres que tu negocio aparezca en Google? Pregúntame 🔎',
];

const TEASER_INDEX_KEY = 'if360_teaser_index';
const VISITOR_KEY = 'if360_visitor';
const CHAT_KEY = 'if360_chat';
const BLOCK_KEY = 'if360_blocked';

// Tope de mensajes guardados: el mismo que acepta el backend, así no guardamos
// un historial que después se va a recortar igual.
const MAX_STORED = 24;

// El formulario de datos se ofrece dos veces como máximo. Insistir en cada
// mensaje espanta al cliente; ofrecerlo una segunda vez es normal.
const MAX_IDENTITY_OFFERS = 2;

// Cuánto alcanza a leerse el mensaje de despedida antes de cerrar la ventana.
const CLOSE_DELAY_MS = 6000;

const DECLINE_REPLY =
    'Sin problema 👍 Igual te puedo contar qué incluye cada plan y cómo trabajamos. ' +
    'Y si prefieres los precios directo, escríbenos por WhatsApp al +56 9 5414 6176.';

const readVisitor = () => {
    try {
        return JSON.parse(sessionStorage.getItem(VISITOR_KEY) || 'null');
    } catch {
        return null;
    }
};

// El widget se monta de nuevo en cada página, así que la conversación se guarda
// en el navegador. Sin esto, ir al portafolio y volver dejaba el chat en blanco.
const readChat = () => {
    try {
        const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null');
        if (!saved || !Array.isArray(saved.messages) || !saved.messages.length) return null;

        const messages = saved.messages
            .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
            .slice(-MAX_STORED);

        return messages.length
            ? {
                  messages,
                  isOpen: saved.isOpen === true,
                  showForm: saved.showForm === true,
                  offers: Number(saved.offers) || 0,
              }
            : null;
    } catch {
        return null;
    }
};

// Bloqueo por reincidencia. Se guarda para que no baste con cambiar de página
// para volver a tener el chat disponible.
const readBlock = () => {
    try {
        const until = Number(sessionStorage.getItem(BLOCK_KEY) || 0);
        return until > Date.now() ? until : 0;
    } catch {
        return 0;
    }
};

// El agente responde en Markdown ligero. En vez de arrastrar una librería
// entera, interpretamos solo lo que realmente usa: negritas y viñetas.
const renderInline = (text) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i} className="font-semibold text-white">
                {part.slice(2, -2)}
            </strong>
        ) : (
            part
        ),
    );

const Markdown = ({ text }) => {
    const lines = text.split('\n');

    return lines.map((line, i) => {
        const bullet = line.match(/^\s*[-*]\s+(.*)$/);

        if (bullet) {
            return (
                <span key={i} className="flex gap-2">
                    <span className="text-primary-400 shrink-0">•</span>
                    <span>{renderInline(bullet[1])}</span>
                </span>
            );
        }

        // Una línea vacía es separación entre párrafos, no un renglón más.
        if (!line.trim()) return <span key={i} className="block h-2" />;

        return <span key={i} className="block">{renderInline(line)}</span>;
    });
};

const ChatIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Burbuja de conversación */}
        <path d="M12 2.75c-5.11 0-9.25 3.55-9.25 7.93 0 2.5 1.35 4.72 3.46 6.17v3.65c0 .6.67.96 1.17.63l2.96-1.95c.53.08 1.09.13 1.66.13 5.11 0 9.25-3.55 9.25-7.93S17.11 2.75 12 2.75Z" />
        {/* Destello: marca que es un agente IA, no un chat cualquiera */}
        <path
            d="M15.4 5.1l.42 1.12 1.12.42-1.12.42-.42 1.12-.42-1.12-1.12-.42 1.12-.42.42-1.12Z"
            className="fill-white"
        />
    </svg>
);


const ChatAgent = () => {
    const restored = useRef(readChat()).current;

    const [isOpen, setIsOpen] = useState(restored?.isOpen ?? false);
    const [teaser, setTeaser] = useState(null);
    const [messages, setMessages] = useState(
        restored?.messages ?? [{ role: 'assistant', content: WELCOME }],
    );
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Identificación: el backend retiene los precios hasta tener nombre y correo.
    const [visitor, setVisitor] = useState(readVisitor);
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
    const [formError, setFormError] = useState('');

    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const teaserIndex = useRef(0);
    const hasChatted = messages.length > 1;
    const [showForm, setShowForm] = useState(restored?.showForm ?? false);
    const needsIdentity = showForm && !visitor;

    // El formulario puede cerrarse, así que su estado se lee también desde el
    // stream, donde el valor del render ya puede estar viejo.
    const showFormRef = useRef(restored?.showForm ?? false);
    const offersRef = useRef(restored?.offers ?? 0);

    // Bloqueo por insistir en manipular al agente.
    const [blockedUntil, setBlockedUntil] = useState(readBlock);
    const isBlocked = blockedUntil > Date.now();

    // ---- Globo de invitación --------------------------------------------
    // Aparece en cada página: el widget se monta de nuevo en cada ruta, así que
    // este efecto corre en cada navegación y también al recargar.
    // Solo se calla si el chat está abierto o si la persona ya dejó sus datos:
    // insistirle a alguien que ya es lead solo molesta.
    useEffect(() => {
        if (isOpen || visitor || blockedUntil) return;

        const show = () => {
            setTeaser(TEASERS[teaserIndex.current % TEASERS.length]);
            teaserIndex.current += 1;
        };

        // El mensaje que toca se guarda por sesión, para que vaya rotando entre
        // páginas en vez de mostrar siempre el primero.
        try {
            teaserIndex.current = Number(sessionStorage.getItem(TEASER_INDEX_KEY) || 0);
        } catch {
            // Sin sessionStorage siempre parte del primero. No es grave.
        }

        const first = setTimeout(show, 5000);
        const again = setTimeout(show, 45000);
        return () => {
            clearTimeout(first);
            clearTimeout(again);
            try {
                sessionStorage.setItem(TEASER_INDEX_KEY, String(teaserIndex.current));
            } catch {
                // Ídem.
            }
        };
    }, [isOpen, visitor, blockedUntil]);

    const dismissTeaser = useCallback(() => setTeaser(null), []);

    // ---- Cierre por bloqueo ---------------------------------------------
    // El backend ya cerró la puerta: acá cerramos la ventana para no dejar a
    // la persona escribiendo al vacío contra el mismo mensaje seco.
    useEffect(() => {
        try {
            if (blockedUntil) sessionStorage.setItem(BLOCK_KEY, String(blockedUntil));
            else sessionStorage.removeItem(BLOCK_KEY);
        } catch {
            // Sin sessionStorage el bloqueo dura solo esta página. El backend
            // igual lo mantiene: la puerta de verdad está allá.
        }

        if (!blockedUntil) return;

        const restante = blockedUntil - Date.now();
        if (restante <= 0) {
            setBlockedUntil(0);
            return;
        }

        const cierre = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
        const fin = setTimeout(() => setBlockedUntil(0), restante);
        return () => {
            clearTimeout(cierre);
            clearTimeout(fin);
        };
    }, [blockedUntil]);

    useEffect(() => {
        if (isOpen) {
            dismissTeaser();
            inputRef.current?.focus();
        }
    }, [isOpen, dismissTeaser]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isTyping) return;
        try {
            sessionStorage.setItem(
                CHAT_KEY,
                JSON.stringify({
                    messages: messages.slice(-MAX_STORED),
                    isOpen,
                    showForm,
                    offers: offersRef.current,
                }),
            );
        } catch {
            // Sin sessionStorage el chat sigue funcionando, solo no sobrevive
            // a cambiar de página.
        }
    }, [messages, isOpen, showForm, isTyping]);

    // ---- Formulario de datos ---------------------------------------------
    // Se puede cerrar: nadie está obligado a dejar sus datos para conversar.
    const offerIdentity = () => {
        if (showFormRef.current) return;
        if (offersRef.current >= MAX_IDENTITY_OFFERS) return;

        offersRef.current += 1;
        showFormRef.current = true;
        setShowForm(true);
    };

    const declineIdentity = () => {
        showFormRef.current = false;
        setShowForm(false);
        setFormError('');
        setMessages((prev) => [...prev, { role: 'assistant', content: DECLINE_REPLY }]);
        inputRef.current?.focus();
    };

    // ---- Envío -----------------------------------------------------------
    const send = async (text, visitorOverride = null) => {
        const content = text.trim();
        if (!content || isTyping || isBlocked) return;

        // El saludo inicial no viaja a la API. Se filtra por contenido y no por
        // posición: al restaurar una conversación larga puede no ir primero.
        const history = messages.filter((m) => m.content !== WELCOME);
        setMessages((prev) => [...prev, { role: 'user', content }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    history,
                    visitor: visitorOverride ?? visitor,
                }),
            });

            // Respuestas no-streaming: filtro previo (200) o error (4xx/5xx).
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                setIsTyping(false);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.reply || data.error || 'No pude responder.' },
                ]);

                // Bloqueo por reincidencia: se despide y la ventana se cierra.
                if (data.blockedUntil) {
                    showFormRef.current = false;
                    setShowForm(false);
                    setBlockedUntil(data.blockedUntil);
                }
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let started = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const part of parts) {
                    if (!part.startsWith('data: ')) continue;

                    let event;
                    try {
                        event = JSON.parse(part.slice(6));
                    } catch {
                        continue;
                    }

                    if (event.type === 'delta') {
                        if (!started) {
                            started = true;
                            setIsTyping(false);
                            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
                        }
                        setMessages((prev) => {
                            const next = [...prev];
                            next[next.length - 1] = {
                                role: 'assistant',
                                content: next[next.length - 1].content + event.text,
                            };
                            return next;
                        });
                    }

                    if (event.type === 'identify') {
                        offerIdentity();
                    }

                    if (event.type === 'error') {
                        setIsTyping(false);
                        setMessages((prev) => [...prev, { role: 'assistant', content: event.message }]);
                    }
                }
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'Se me cayó la conexión 😕 Intenta de nuevo, o escríbeme por WhatsApp al +56 9 5414 6176.',
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const submitIdentity = (e) => {
        e.preventDefault();

        const nombre = form.nombre.trim();
        const email = form.email.trim().toLowerCase();

        if (nombre.length < 2) {
            setFormError('Escribe tu nombre.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
            setFormError('Revisa el correo, parece incompleto.');
            return;
        }

        const identity = { nombre, email, telefono: form.telefono.trim() };
        setVisitor(identity);
        setFormError('');
        try {
            sessionStorage.setItem(VISITOR_KEY, JSON.stringify(identity));
        } catch {
            // Sin sessionStorage se pierde al recargar. El chat igual funciona.
        }

        showFormRef.current = false;
        setShowForm(false);

        // El lead se avisa al instante: si se va sin escribir más, igual quedó.
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'identify', visitor: identity }),
        }).catch(() => {
            // Si falla, el lead igual se registra cuando el agente use su herramienta.
        });

        // Retoma la conversación donde quedó, ya con los precios disponibles.
        send('Listo, ya te dejé mis datos ✅', identity);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* ---- Panel de chat ---- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="w-[calc(100vw-3rem)] sm:w-[380px] h-[min(600px,calc(100vh-8rem))] flex flex-col rounded-3xl overflow-hidden bg-dark-card border border-white/10 shadow-2xl shadow-black/50"
                    >
                        {/* Cabecera */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 shrink-0">
                            <div className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                <ChatIcon className="w-6 h-6 fill-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm leading-tight">
                                    Asistente Interfaz360
                                </p>
                                <p className="text-white/70 text-xs leading-tight">
                                    En línea · responde al instante
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Cerrar chat"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-br-md'
                                                : 'bg-white/10 text-slate-100 rounded-bl-md'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            msg.content ? <Markdown text={msg.content} /> : '…'
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                                        {[0, 150, 300].map((delay) => (
                                            <span
                                                key={delay}
                                                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                                                style={{ animationDelay: `${delay}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {needsIdentity && (
                                <motion.form
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={submitIdentity}
                                    className="relative bg-white/[0.07] border border-primary-500/30 rounded-2xl p-4 space-y-2.5"
                                >
                                    <button
                                        type="button"
                                        onClick={declineIdentity}
                                        aria-label="Cerrar el formulario y seguir conversando"
                                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M6 6l12 12M18 6L6 18" />
                                        </svg>
                                    </button>
                                    <p className="text-sm text-white font-medium leading-snug pr-7">
                                        Déjame tus datos y te muestro precios y detalles 👇
                                    </p>
                                    <p className="text-xs text-slate-400 leading-snug -mt-1">
                                        Con tus datos seguimos la conversación acá mismo y te muestro los planes con sus precios.
                                    </p>
                                    <input
                                        value={form.nombre}
                                        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                        placeholder="Tu nombre"
                                        maxLength={80}
                                        autoComplete="name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-500/60 transition-colors"
                                    />
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="tu@correo.cl"
                                        type="email"
                                        maxLength={120}
                                        autoComplete="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-500/60 transition-colors"
                                    />
                                    <input
                                        value={form.telefono}
                                        onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                                        placeholder="WhatsApp (opcional) — +56 9 1234 5678"
                                        type="tel"
                                        maxLength={20}
                                        autoComplete="tel"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-500/60 transition-colors"
                                    />
                                    {formError && <p className="text-xs text-red-400">{formError}</p>}
                                    <button
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                                    >
                                        Empezar a conversar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={declineIdentity}
                                        className="w-full text-xs text-slate-400 hover:text-white py-1 transition-colors"
                                    >
                                        Ahora no, gracias
                                    </button>
                                    <p className="text-[11px] text-slate-500 text-center leading-snug">
                                        Solo los usamos para continuar tu atención y responderte si lo necesitas.
                                    </p>
                                </motion.form>
                            )}

                            {!hasChatted && !isTyping && !needsIdentity && !isBlocked && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => send(suggestion)}
                                            className="px-3 py-1.5 rounded-full text-xs text-primary-100 bg-primary-600/20 border border-primary-500/40 hover:bg-primary-600/40 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Entrada */}
                        <div className="px-3 py-3 border-t border-white/10 bg-dark-bg/60 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    send(input);
                                }}
                                className="flex items-end gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    maxLength={800}
                                    disabled={isBlocked}
                                    placeholder={isBlocked ? 'Chat cerrado por ahora' : 'Escribe tu consulta…'}
                                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-500/60 disabled:opacity-50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping || isBlocked}
                                    aria-label="Enviar mensaje"
                                    className="w-10 h-10 shrink-0 rounded-full bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:hover:bg-primary-600 flex items-center justify-center transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" >
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                </button>
                            </form>
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-[11px] text-slate-500 hover:text-slate-300 mt-2 transition-colors"
                            >
                                ¿Prefieres WhatsApp? Escríbenos al +56 9 5414 6176
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- Globo de invitación ---- */}
            <AnimatePresence>
                {teaser && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.85 }}
                        className="relative max-w-[240px]"
                    >
                        <button
                            onClick={() => setIsOpen(true)}
                            className="block text-left w-full bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 pr-7 rounded-2xl shadow-2xl font-medium text-sm hover:bg-white/15 transition-colors"
                        >
                            <span className="relative z-10 block">{teaser}</span>
                            <span className="relative z-10 block text-[11px] text-primary-300 mt-1">
                                Toca para conversar →
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-2xl blur-sm -z-10" />
                        </button>
                        <button
                            onClick={dismissTeaser}
                            aria-label="Cerrar aviso"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-card border border-white/20 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- Botón flotante ---- */}
            <motion.button
                onClick={() => setIsOpen((prev) => !prev)}
                disabled={isBlocked}
                aria-label={
                    isBlocked
                        ? 'Chat cerrado por ahora'
                        : isOpen
                          ? 'Cerrar chat'
                          : 'Abrir chat con el asistente'
                }
                className="group relative w-16 h-16 flex items-center justify-center disabled:cursor-not-allowed"
                whileHover={isBlocked ? undefined : { scale: 1.05 }}
                whileTap={isBlocked ? undefined : { scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                // La opacidad va acá y no en una clase: framer escribe el estilo
                // en línea y le gana a cualquier `disabled:opacity-*` de Tailwind.
                animate={{ opacity: isBlocked ? 0.4 : 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                {!isOpen && !isBlocked && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-primary-500 opacity-25 animate-ping" />
                        <span className="absolute inset-0 rounded-full bg-primary-500 opacity-10 animate-ping delay-75" />
                    </>
                )}

                <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/40 flex items-center justify-center overflow-hidden border border-white/20 group-hover:shadow-primary-500/60 transition-all duration-300">
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine transition-all" />
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.svg
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                viewBox="0 0 24 24"
                                className="w-7 h-7"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            >
                                <path d="M6 6l12 12M18 6L6 18" />
                            </motion.svg>
                        ) : (
                            <motion.span
                                key="icon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                            >
                                <ChatIcon className="w-8 h-8 fill-white" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.button>
        </div>
    );
};

export default ChatAgent;
