import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OPEN_CHAT_EVENT } from '../lib/chat';
import RobotAsesor from './RobotAsesor';

const WHATSAPP_URL =
    'https://wa.me/56954146176?text=' +
    encodeURIComponent('Hola Interfaz 360, me gustaría cotizar un proyecto para mi negocio.');

const WELCOME =
    '¡Hola! 👋 Soy el asesor virtual de Interfaz360. Te puedo contar sobre nuestros servicios, planes y precios, o coordinar que un asesor te contacte. ¿Qué andas buscando para tu negocio?';

const SUGGESTIONS = [
    '¿Cuánto cuesta una página web?',
    'Quiero un agente IA para mi negocio',
    '¿Qué incluye el plan Empresa Digital?',
];

// Mensajes del globo de invitación. Rotan para no repetir siempre lo mismo.
const TEASERS = [
    '¿Cuánto cuesta una página web? Te lo digo al tiro 👋',
    '¿Un agente IA que atienda a tus clientes 24/7? Te cuento cómo 💬',
    '¿Tienes un proyecto en mente? Cuéntame y te oriento',
    '¿Dudas sobre qué plan te conviene? Te ayudo en 1 minuto',
    '¿Quieres que tu negocio aparezca en Google? Pregúntame 🔎',
];

const TEASER_INDEX_KEY = 'if360_teaser_index';
const VISITOR_KEY = 'if360_visitor';
const CHAT_KEY = 'if360_chat';
const BLOCK_KEY = 'if360_blocked';
const SESSION_KEY = 'if360_session';

// Tope de mensajes guardados: el mismo que acepta el backend, así no guardamos
// un historial que después se va a recortar igual.
const MAX_STORED = 24;

// El formulario de datos se ofrece dos veces como máximo. Insistir en cada
// mensaje espanta al cliente; ofrecerlo una segunda vez es normal.
const MAX_IDENTITY_OFFERS = 2;

// Cuánto alcanza a leerse el mensaje de despedida antes de cerrar la ventana.
const CLOSE_DELAY_MS = 6000;

const DECLINE_REPLY =
    'Sin problema 👍 Sigamos conversando: pregúntame lo que quieras de los planes y sus precios. ' +
    'Y si prefieres hablar con un asesor, escríbenos por WhatsApp al +56 9 5414 6176.';

// Mismo criterio que cleanPhone en el backend: celular chileno, con o sin +56.
const isChileanMobile = (value) => /^(?:56|0)?9\d{8}$/.test(value.replace(/\D/g, ''));

// Id aleatorio de la conversación: con él se guarda en Supabase aunque el
// visitante no deje sus datos. Dura lo que dura la pestaña.
const readSessionId = () => {
    const fresh = () =>
        crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    try {
        let id = sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = fresh();
            sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        // Sin sessionStorage la conversación se registra solo mientras dure la página.
        return fresh();
    }
};

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
            <strong key={i} className="font-semibold text-ink">
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
                    <span className="text-signal shrink-0">•</span>
                    <span>{renderInline(bullet[1])}</span>
                </span>
            );
        }

        // Una línea vacía es separación entre párrafos, no un renglón más.
        if (!line.trim()) return <span key={i} className="block h-2" />;

        return <span key={i} className="block">{renderInline(line)}</span>;
    });
};

// Cuánto dura un gesto puntual del robot antes de volver a esperar o pensar.
const GESTURE_MS = { saludo: 2600, contento: 3500, confundido: 3000 };


const ChatAgent = () => {
    const restored = useRef(readChat()).current;

    const [isOpen, setIsOpen] = useState(restored?.isOpen ?? false);
    const [teaser, setTeaser] = useState(null);
    const [messages, setMessages] = useState(
        restored?.messages ?? [{ role: 'assistant', content: WELCOME }],
    );
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Identificación: nombre y WhatsApp, a cambio de la demo o de que lo contacten.
    const [visitor, setVisitor] = useState(readVisitor);
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
    const [formError, setFormError] = useState('');

    const [sessionId] = useState(readSessionId);
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
    // Lo que pidió el visitante cuando el agente abrió el formulario: va en el aviso al equipo.
    const motivoRef = useRef('');

    // Bloqueo por insistir en manipular al agente.
    const [blockedUntil, setBlockedUntil] = useState(readBlock);
    const isBlocked = blockedUntil > Date.now();

    // ---- Gestos del robot -------------------------------------------------
    // Puntuales (saludo, contento, confundido) duran unos segundos; el resto
    // sale del estado: pensando mientras carga la respuesta, si no, esperando.
    const [flash, setFlash] = useState(null);
    const flashTimer = useRef(null);
    const gesture = useCallback((name) => {
        clearTimeout(flashTimer.current);
        setFlash(name);
        flashTimer.current = setTimeout(() => setFlash(null), GESTURE_MS[name]);
    }, []);
    useEffect(() => () => clearTimeout(flashTimer.current), []);

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
            gesture('saludo');
            inputRef.current?.focus();
        }
    }, [isOpen, dismissTeaser, gesture]);

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
                    sessionId,
                }),
            });

            // Respuestas no-streaming: filtro previo (200) o error (4xx/5xx).
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                setIsTyping(false);
                if (!data.reply) gesture('confundido');
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
                        motivoRef.current = typeof event.motivo === 'string' ? event.motivo : '';
                        offerIdentity();
                    }

                    if (event.type === 'lead' && event.ok) {
                        gesture('contento');
                    }

                    if (event.type === 'error') {
                        gesture('confundido');
                        setIsTyping(false);
                        setMessages((prev) => [...prev, { role: 'assistant', content: event.message }]);
                    }
                }
            }
        } catch {
            gesture('confundido');
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

    // ---- Apertura desde los botones del sitio ----------------------------
    // El listener se registra una vez; el ref le entrega siempre el send y el
    // estado del render actual.
    const openRef = useRef(null);
    useEffect(() => {
        openRef.current = (message) => {
            setIsOpen(true);
            if (!message || isBlocked) return;
            if (isTyping || needsIdentity) {
                setInput(message);
                return;
            }
            send(message);
        };
    });

    useEffect(() => {
        const onOpen = (e) => openRef.current?.(e.detail?.message);
        window.addEventListener(OPEN_CHAT_EVENT, onOpen);
        return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
    }, []);

    const submitIdentity = (e) => {
        e.preventDefault();

        const nombre = form.nombre.trim();
        const email = form.email.trim().toLowerCase();
        const telefono = form.telefono.trim();

        if (nombre.length < 2) {
            setFormError('Escribe tu nombre.');
            return;
        }
        if (!isChileanMobile(telefono)) {
            setFormError('Revisa el WhatsApp: un celular chileno, como +56 9 1234 5678.');
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
            setFormError('Revisa el correo, parece incompleto. Si prefieres, déjalo en blanco.');
            return;
        }

        const identity = { nombre, email, telefono };
        setVisitor(identity);
        setFormError('');
        try {
            sessionStorage.setItem(VISITOR_KEY, JSON.stringify(identity));
        } catch {
            // Sin sessionStorage se pierde al recargar. El chat igual funciona.
        }

        showFormRef.current = false;
        setShowForm(false);
        gesture('contento');

        // El lead se avisa al instante: si se va sin escribir más, igual quedó.
        // Va con la conversación, para que el equipo sepa de qué negocio se trata.
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'identify',
                visitor: identity,
                motivo: motivoRef.current,
                history: messages.filter((m) => m.content !== WELCOME),
            }),
        }).catch(() => {
            // Si falla, el lead igual se registra cuando el agente use su herramienta.
        });

        // Retoma la conversación: el agente confirma lo que pidió y lo registra.
        send('Listo, ya te dejé mis datos ✅', identity);
    };

    return (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col items-end gap-4 font-body">
            {/* ---- Panel de chat ---- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="w-[calc(100vw-2rem)] sm:w-[380px] h-[min(600px,calc(100vh-8rem))] flex flex-col overflow-hidden bg-white text-ink border-[1.5px] border-ink shadow-[10px_10px_0_#0f1a2e]"
                    >
                        {/* Cabecera */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-ink text-paper shrink-0">
                            <span className="w-10 h-10 rounded-full bg-paper text-ink flex items-center justify-center shrink-0">
                                <RobotAsesor
                                    size={34}
                                    gesture={isBlocked ? 'confundido' : flash || (isTyping ? 'pensando' : 'esperando')}
                                />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[15px] leading-tight">
                                    Asesor Interfaz 360
                                </p>
                                <p className="text-[#8fe0a8] text-xs font-semibold leading-tight">
                                    ● En línea · responde al instante
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Cerrar chat"
                                className="w-8 h-8 flex items-center justify-center text-paper/80 hover:text-white hover:bg-white/15 transition-colors"
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
                                        className={`max-w-[86%] px-[13px] py-2.5 text-[15px] leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-signal text-white'
                                                : 'bg-paper-2 text-ink'
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
                                    <div className="bg-paper-2 px-4 py-3 flex gap-1.5">
                                        {[0, 150, 300].map((delay) => (
                                            <span
                                                key={delay}
                                                className="w-2 h-2 rounded-full bg-ink-2 animate-bounce"
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
                                    className="relative bg-paper border-[1.5px] border-ink p-4 space-y-2.5"
                                >
                                    <button
                                        type="button"
                                        onClick={declineIdentity}
                                        aria-label="Cerrar el formulario y seguir conversando"
                                        className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M6 6l12 12M18 6L6 18" />
                                        </svg>
                                    </button>
                                    <p className="text-sm text-ink font-bold leading-snug pr-7">
                                        Déjanos tu nombre y WhatsApp 👇
                                    </p>
                                    <p className="text-xs text-ink-2 leading-snug -mt-1">
                                        Un asesor te escribe por WhatsApp con tu demo o tu cotización, sin costo ni compromiso.
                                    </p>
                                    <input
                                        value={form.nombre}
                                        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                        placeholder="Tu nombre"
                                        maxLength={80}
                                        autoComplete="name"
                                        className="w-full bg-white border-[1.5px] border-rule px-3 py-2 text-sm text-ink placeholder:text-ink-2/70 outline-none focus:border-ink transition-colors"
                                    />
                                    <input
                                        value={form.telefono}
                                        onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                                        placeholder="WhatsApp — +56 9 1234 5678"
                                        type="tel"
                                        maxLength={20}
                                        autoComplete="tel"
                                        className="w-full bg-white border-[1.5px] border-rule px-3 py-2 text-sm text-ink placeholder:text-ink-2/70 outline-none focus:border-ink transition-colors"
                                    />
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="Correo (opcional)"
                                        type="email"
                                        maxLength={120}
                                        autoComplete="email"
                                        className="w-full bg-white border-[1.5px] border-rule px-3 py-2 text-sm text-ink placeholder:text-ink-2/70 outline-none focus:border-ink transition-colors"
                                    />
                                    {formError && <p className="text-xs text-signal font-semibold">{formError}</p>}
                                    <button
                                        type="submit"
                                        className="w-full bg-signal hover:bg-ink text-white text-sm font-bold py-2.5 transition-colors"
                                    >
                                        Enviar mis datos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={declineIdentity}
                                        className="w-full text-xs text-ink-2 hover:text-ink py-1 transition-colors"
                                    >
                                        Ahora no, gracias
                                    </button>
                                    <p className="text-[11px] text-ink-2 text-center leading-snug">
                                        Te responde un asistente de IA y guardamos la conversación para darte seguimiento.{' '}
                                        <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacidad</a>
                                    </p>
                                </motion.form>
                            )}

                            {!hasChatted && !isTyping && !needsIdentity && !isBlocked && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => send(suggestion)}
                                            className="px-[11px] py-[7px] text-[13px] font-semibold text-ink bg-white border-[1.5px] border-ink hover:bg-ink hover:text-paper transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Entrada */}
                        <div className="px-3 py-3 border-t-[1.5px] border-ink bg-white shrink-0">
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
                                    className="flex-1 min-w-0 bg-paper border-[1.5px] border-rule px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-2/70 outline-none focus:border-ink disabled:opacity-50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping || isBlocked}
                                    aria-label="Enviar mensaje"
                                    className="w-11 h-11 shrink-0 bg-ink hover:bg-signal disabled:opacity-40 disabled:hover:bg-ink flex items-center justify-center transition-colors"
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
                                className="block text-center text-[11px] text-ink-2 hover:text-ink mt-2 transition-colors"
                            >
                                ¿Prefieres WhatsApp? Escríbenos al +56 9 5414 6176
                            </a>
                            <p className="text-center text-[10px] text-ink-2/80 mt-1">
                                Asistente de IA · la conversación se guarda ·{' '}
                                <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacidad</a>
                            </p>
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
                            className="block text-left w-full bg-white border-[1.5px] border-ink text-ink px-4 py-3 pr-7 shadow-[6px_6px_0_#0f1a2e] font-semibold text-sm hover:shadow-[6px_6px_0_#e8471c] transition-shadow"
                        >
                            <span className="relative z-10 block">{teaser}</span>
                            <span className="relative z-10 block text-[12px] font-bold text-signal mt-1">
                                Toca para conversar →
                            </span>
                        </button>
                        <button
                            onClick={dismissTeaser}
                            aria-label="Cerrar aviso"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white flex items-center justify-center text-xs"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- Botón flotante: el sello que habla ---- */}
            <motion.button
                onClick={() => setIsOpen((prev) => !prev)}
                disabled={isBlocked}
                aria-label={
                    isBlocked
                        ? 'Chat cerrado por ahora'
                        : isOpen
                          ? 'Cerrar chat'
                          : 'Abrir el asesor'
                }
                className="flex items-center gap-2.5 bg-ink text-white border-[1.5px] border-ink shadow-[5px_5px_0_#e8471c] hover:shadow-[5px_5px_0_#0f1a2e] hover:bg-[#1d2b45] p-3 sm:py-2.5 sm:pl-3 sm:pr-4 font-bold text-[15px] transition-shadow disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 12 }}
                // La opacidad va acá y no en una clase: framer escribe el estilo
                // en línea y le gana a cualquier `disabled:opacity-*` de Tailwind.
                animate={{ opacity: isBlocked ? 0.4 : 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                ) : (
                    // Saluda cuando aparece el globo de invitación.
                    <span className="w-8 h-8 rounded-full bg-paper text-ink flex items-center justify-center">
                        <RobotAsesor
                            variant="boton"
                            size={28}
                            gesture={isBlocked ? 'confundido' : teaser ? 'saludo' : 'esperando'}
                        />
                    </span>
                )}
                <span className="hidden sm:inline">{isOpen ? 'Cerrar' : 'Asesor'}</span>
                {!isOpen && !isBlocked && (
                    <span className="hidden sm:block w-2 h-2 rounded-full bg-[#8fe0a8] shadow-[0_0_0_3px_rgba(143,224,168,.25)]" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatAgent;
