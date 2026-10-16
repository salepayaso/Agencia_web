import { useCallback, useEffect, useRef, useState } from 'react';
import { openChat } from '../lib/chat';
import RobotAsesor from './RobotAsesor';
import '../styles/hero-visuals.css';

// Carrusel del hero: tres paneles que se pueden tocar (Faz, Tu web y En Google).
// Cambian solos cada EVERY ms; se pausan con el mouse encima y quedan fijos
// cuando la persona elige una pestaña, desliza o usa algo dentro de un panel.
// Todo usa un negocio genérico ("Tu Negocio"), nunca datos de clientes reales.
const TABS = [
    { id: 'faz', label: 'Conoce a Faz' },
    { id: 'web', label: 'Tu web' },
    { id: 'google', label: 'En Google' },
];
const EVERY = 11000;

const track = (label) =>
    window.dataLayer?.push({ event: 'interest_click', service_name: label, click_url: 'button' });

const ICONS = {
    pasteleria: <path d="M4 20h16v-7H4zM4 15.5c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 4 0M12 13V9.5M12 7c.9-.9.9-2.2 0-3.2-.9 1-.9 2.3 0 3.2z" />,
    taller: <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z" />,
    estetica: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
    restaurante: <><circle cx="13" cy="12" r="6.5" /><circle cx="13" cy="12" r="3" /><path d="M3 4v5a2 2 0 0 0 2 2v9M5 4v5M21 4v16" /></>,
    veterinaria: <><circle cx="6.5" cy="10" r="1.8" /><circle cx="10" cy="6" r="1.8" /><circle cx="14" cy="6" r="1.8" /><circle cx="17.5" cy="10" r="1.8" /><path d="M12 11c-3 0-6 4-6 6.5 0 2 2 2.5 3 2s2-.8 3-.8 2 .3 3 .8 3 0 3-2C18 15 15 11 12 11z" /></>,
    ferreteria: <path d="M13 4l7 7-2.5 2.5-2-2L7 20l-3-3 8.5-8.5-2-2z" />,
    monitor: <><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M9 20h6M12 16v4" /></>,
    celular: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></>,
};
const Icon = ({ k }) => <svg className="hv-ico" viewBox="0 0 24 24" aria-hidden="true">{ICONS[k]}</svg>;

// Rubros de ejemplo: colores y textos de la mini web, y la búsqueda en Google.
const RUBROS = {
    pasteleria: { n: 'Pastelería', c: '#c2416b', bg: '#fbeef2', h: 'Tortas por encargo para cada celebración', p: 'Pide en línea y retira o recibe en tu casa.', cta: 'Haz tu pedido', l2: 'Tortas', s: ['Tortas', 'Cupcakes', 'Mesas dulces'], say: '¿Para cuántas personas necesitas la torta?', gq: 'torta por encargo', ask: '¿Hacen tortas para 20 personas?', ans: 'Sí, de 15 a 40 personas. ¿Para qué día la necesitas?' },
    taller: { n: 'Taller', c: '#1f5fbf', bg: '#eaf1fb', h: 'Tu auto en buenas manos', p: 'Mantención, frenos y diagnóstico con hora agendada.', cta: 'Agenda tu hora', l2: 'Servicios', s: ['Mantención', 'Frenos', 'Diagnóstico'], say: '¿Qué le está pasando a tu auto?', gq: 'taller mecánico', ask: '¿Tienen hora para mañana?', ans: 'Sí, a las 10:00 o a las 15:30. ¿Cuál te acomoda?' },
    estetica: { n: 'Estética', c: '#7a4fc4', bg: '#f2edfb', h: 'Tratamientos que te hacen sentir bien', p: 'Faciales, corporales y depilación. Reserva en línea.', cta: 'Reserva tu hora', l2: 'Tratamientos', s: ['Limpieza facial', 'Masajes', 'Depilación'], say: '¿Qué tratamiento te interesa?', gq: 'limpieza facial', ask: '¿Cuánto dura una limpieza facial?', ans: 'Una hora. Tengo cupo el jueves en la tarde, ¿te reservo?' },
    restaurante: { n: 'Restaurante', c: '#c7621a', bg: '#fdf1e6', h: 'Almuerzos caseros con despacho', p: 'Pide antes de las 12:00 y llega a tu oficina.', cta: 'Ver la carta', l2: 'Carta', s: ['Menú del día', 'Despacho', 'Eventos'], say: '¿Te tomo el pedido de hoy?', gq: 'almuerzo con despacho', ask: '¿Cuál es el menú de hoy?', ans: 'Pastel de choclo o pollo arvejado. ¿Cuántos te mando?' },
    veterinaria: { n: 'Veterinaria', c: '#1f8a6a', bg: '#e8f6f0', h: 'Cuidamos a tu mascota como a la nuestra', p: 'Consultas, vacunas y peluquería con hora agendada.', cta: 'Agenda una consulta', l2: 'Servicios', s: ['Consultas', 'Vacunas', 'Peluquería'], say: '¿Cómo se llama tu mascota?', gq: 'veterinaria', ask: '¿Atienden gatos?', ans: 'Sí, perros y gatos. ¿Te agendo una consulta?' },
    ferreteria: { n: 'Ferretería', c: '#a86b00', bg: '#fbf3e2', h: 'Todo para tu obra, con despacho', p: 'Materiales, herramientas y cotizaciones rápidas.', cta: 'Pide tu cotización', l2: 'Productos', s: ['Materiales', 'Herramientas', 'Despacho'], say: '¿Qué materiales necesitas cotizar?', gq: 'ferretería', ask: '¿Tienen cemento con despacho?', ans: 'Sí, despachamos en el día. ¿Cuántos sacos necesitas?' },
};
const KEYS = Object.keys(RUBROS);
const COMUNAS = ['Ñuñoa', 'Providencia', 'Maipú', 'La Florida', 'Puente Alto', 'Las Condes'];

const slug = (s) =>
    (s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'tunegocio') + '.cl';

// Escribe el texto letra a letra. Se reinicia al cambiar su `key`; si el texto
// cambia después de terminar (por ejemplo, al escribir el nombre), lo muestra completo.
const Typed = ({ text, speed = 28, still, onDone }) => {
    const [n, setN] = useState(0);
    const [done, setDone] = useState(still);
    const doneRef = useRef(onDone);
    useEffect(() => { doneRef.current = onDone; });
    useEffect(() => {
        if (still) { doneRef.current?.(); return undefined; }
        let i = 0;
        const t = setInterval(() => {
            i += 1;
            setN(i);
            if (i >= text.length) { clearInterval(t); setDone(true); doneRef.current?.(); }
        }, speed);
        return () => clearInterval(t);
        // Solo al montar: para reiniciar se cambia la key.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return done ? text : text.slice(0, n);
};

// Temporizadores que se limpian solos al desmontar.
function useTimers() {
    const list = useRef([]);
    const clear = useCallback(() => { list.current.forEach(clearTimeout); list.current = []; }, []);
    const later = useCallback((ms, fn) => { list.current.push(setTimeout(fn, ms)); }, []);
    useEffect(() => clear, [clear]);
    return { later, clear };
}

/* ---------- Panel 1 · Faz ---------- */
const INTRO = [
    { t: '¡Hola! Soy Faz. Atiendo a tus clientes cuando tú no puedes.', g: 'saludo' },
    { t: '¿Una consulta a las 3 de la mañana? Yo la respondo.', g: 'esperando' },
    { t: 'Y te dejo los datos del cliente en tu panel, listos para cerrar la venta.', g: 'contento' },
];
const ASK = [
    { q: '¿Qué haces?', t: 'Respondo preguntas, tomo pedidos y agendo horas. Todo el día, todos los días.', g: 'contento' },
    { q: '¿Cuánto cuestas?', t: 'Vengo gratis 3 meses con tu web. Después, $15.000 + IVA al mes.', g: 'contento' },
    { q: '¿Duermes?', t: 'Nunca. Para eso estoy.', g: 'saludo' },
];
const POKE = { t: '¡Ey! Eso da cosquillas. ¿Te ayudo con algo?', g: 'confundido' };

const FazPanel = ({ active, still }) => {
    const [line, setLine] = useState({ ...INTRO[0], n: 0 });
    const [gesture, setGesture] = useState('saludo');
    const [thinking, setThinking] = useState(false);
    const [asked, setAsked] = useState(null); // última pregunta elegida
    const { later, clear } = useTimers();

    // Faz no tiene boca: piensa un momento, responde con su gesto y vuelve a esperar.
    const say = useCallback((l) => {
        clear();
        if (still) { setGesture(l.g); setLine((p) => ({ ...l, n: p.n + 1 })); return; }
        setThinking(true);
        setGesture('pensando');
        later(900, () => { setThinking(false); setGesture(l.g); setLine((p) => ({ ...l, n: p.n + 1 })); });
    }, [clear, later, still]);
    const onDone = () => { if (!still) later(2200, () => setGesture('esperando')); };

    // Mientras nadie pregunte, Faz se presenta en tres frases.
    useEffect(() => {
        if (!active || asked || still) return undefined;
        let i = 0;
        const t = setInterval(() => { i = (i + 1) % INTRO.length; say(INTRO[i]); }, 5500);
        return () => clearInterval(t);
    }, [active, asked, still, say]);

    const ask = (a) => { setAsked(a.q); say(a); };

    return (
        <div className="hv-box hv-faz">
            <div className="hv-fazstage">
                <button
                    type="button"
                    className="hv-robot"
                    aria-label="Faz, el agente IA. Tócalo para que reaccione."
                    onClick={() => { setAsked((q) => q || 'poke'); say(POKE); }}
                >
                    <RobotAsesor gesture={gesture} size={170} />
                </button>
            </div>
            <div className="hv-say">
                <p className="hv-name"><b>Faz</b><span>● Agente IA · en línea</span></p>
                <p className="hv-bubble" aria-live="polite">
                    {thinking
                        ? <span className="hv-dots" aria-label="Faz está escribiendo"><i /><i /><i /></span>
                        : <><Typed key={line.n} text={line.t} still={still} onDone={onDone} /><span className="hv-cur" /></>}
                </p>
                <div className="hv-chips">
                    {ASK.map((a) => (
                        <button key={a.q} type="button" className="hv-chip" aria-pressed={asked === a.q} onClick={() => ask(a)}>
                            {a.q}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    className="hv-link"
                    onClick={() => {
                        track('Hero: Conversar con Faz');
                        openChat(asked && asked !== 'poke' ? asked : '');
                    }}
                >
                    Conversar con Faz en el chat →
                </button>
            </div>
        </div>
    );
};

/* ---------- Panel 2 · Tu web ---------- */
const WebPanel = ({ active, still }) => {
    const [name, setName] = useState('Tu Negocio');
    const [k, setK] = useState('pasteleria');
    const [mobile, setMobile] = useState(false);
    const [touched, setTouched] = useState(false);

    // Mientras nadie la toque, va mostrando rubros distintos.
    useEffect(() => {
        if (!active || touched || still) return undefined;
        const t = setInterval(() => setK((c) => KEYS[(KEYS.indexOf(c) + 1) % KEYS.length]), 3200);
        return () => clearInterval(t);
    }, [active, touched, still]);

    const r = RUBROS[k];
    const shown = name.trim() || 'Tu Negocio';

    return (
        <div className="hv-web">
            <div className="hv-ctrl">
                <label className="hv-field">
                    <span className="hv-lbl">Escribe el nombre de tu negocio</span>
                    <input
                        value={name}
                        maxLength={26}
                        autoComplete="off"
                        onChange={(e) => { setTouched(true); setName(e.target.value); }}
                        onFocus={() => setTouched(true)}
                    />
                </label>
                <div className="hv-chips" role="group" aria-label="Rubro">
                    {KEYS.map((key) => (
                        <button key={key} type="button" className="hv-chip sm" aria-pressed={k === key} onClick={() => { setTouched(true); setK(key); }}>
                            <Icon k={key} />{RUBROS[key].n}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`hv-browser${mobile ? ' is-mobile' : ''}`} style={{ '--c': r.c, '--bg': r.bg }}>
                <div className="hv-bar">
                    <i /><i /><i />
                    <span className="hv-url">{slug(shown)}</span>
                    <span className="hv-dev" role="group" aria-label="Ver en">
                        <button type="button" aria-pressed={!mobile} aria-label="Ver en computador" onClick={() => { setTouched(true); setMobile(false); }}><Icon k="monitor" /></button>
                        <button type="button" aria-pressed={mobile} aria-label="Ver en celular" onClick={() => { setTouched(true); setMobile(true); }}><Icon k="celular" /></button>
                    </span>
                </div>
                <div className="hv-site">
                    <div className="hv-snav">
                        <span className="hv-brand"><i><Icon k={k} /></i><b>{shown}</b></span>
                        <span className="hv-links"><span>Inicio</span><span>{r.l2}</span><span>Contacto</span></span>
                        <span className="hv-burger" />
                    </div>
                    <div className="hv-shero">
                        <div>
                            <h3>{r.h}</h3>
                            <p>{r.p}</p>
                            <span className="hv-ctas"><span className="hv-cta">{r.cta}</span><span className="hv-cta alt">Escríbenos</span></span>
                        </div>
                        <div className="hv-art"><Icon k={k} /></div>
                    </div>
                    <div className="hv-svc">{r.s.map((s) => <span key={s}>{s}</span>)}</div>
                    <div className="hv-sbub">
                        <span className="hv-sbh">Agente IA de {shown}<em>● en línea</em></span>
                        <span className="hv-sbt">
                            <Typed key={k} text={`Hola, soy el asistente de ${shown}. ${r.say}`} speed={24} still={still} />
                        </span>
                    </div>
                </div>
            </div>

            <div className="hv-foot">
                <button
                    type="button"
                    className="hv-go"
                    onClick={() => {
                        track('Hero: Quiero mi web así');
                        openChat(`Hola, quiero una web para mi negocio "${shown}" (${r.n.toLowerCase()}). ¿Me pueden mostrar una demo?`);
                    }}
                >
                    Quiero mi web así →
                </button>
                <span className="hv-note">Ejemplo. Tu web se diseña a la medida de tu negocio.</span>
            </div>
        </div>
    );
};

/* ---------- Panel 3 · En Google ---------- */
const GooglePanel = ({ active, still }) => {
    const [k, setK] = useState('pasteleria');
    const [com, setCom] = useState(COMUNAS[0]);
    const [web, setWeb] = useState(true);
    const [step, setStep] = useState({ key: '', res: false, reply: false });
    const { later, clear } = useTimers();

    const r = RUBROS[k];
    const q = `${r.gq} ${com.toLowerCase()}`;
    // La búsqueda se vuelve a escribir al entrar al panel o al cambiar algo.
    const runKey = `${q}|${web}|${active}`;
    const res = step.key === runKey && step.res;
    const reply = step.key === runKey && step.reply;

    const onTyped = () => {
        clear();
        if (still) { setStep({ key: runKey, res: true, reply: true }); return; }
        later(300, () => setStep({ key: runKey, res: true, reply: false }));
        later(1500, () => setStep({ key: runKey, res: true, reply: true }));
    };

    return (
        <div className="hv-g">
            <div className="hv-gctrl">
                <span className="hv-seg" role="group" aria-label="Comparar">
                    <button type="button" className="off" aria-pressed={!web} onClick={() => setWeb(false)}>Sin web</button>
                    <button type="button" className="on" aria-pressed={web} onClick={() => setWeb(true)}>Con Interfaz 360</button>
                </span>
                <select aria-label="Rubro" value={k} onChange={(e) => setK(e.target.value)}>
                    {KEYS.map((key) => <option key={key} value={key}>{RUBROS[key].n}</option>)}
                </select>
                <select aria-label="Comuna" value={com} onChange={(e) => setCom(e.target.value)}>
                    {COMUNAS.map((c) => <option key={c}>{c}</option>)}
                </select>
            </div>

            <div className={`hv-box hv-serp${web ? '' : ' is-noweb'}`}>
                <div className="hv-q">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M15 15l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                    <span><Typed key={runKey} text={q} speed={45} still={still} onDone={onTyped} /><span className="hv-cur" /></span>
                </div>
                <div className={`hv-res${res ? '' : ' is-hidden'}`}>
                    <span className="hv-meta">Lugares cerca de {com}</span>
                    <div className="hv-map">
                        <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                            <rect width="400" height="120" fill="#eceae3" />
                            <rect x="150" y="8" width="70" height="36" fill="#d6e4cf" /><rect x="300" y="78" width="60" height="34" fill="#d6e4cf" />
                            <path d="M0 32 L400 56 M0 92 L400 78 M80 0 L120 120 M250 0 L230 120 M340 0 L360 120" stroke="#fff" strokeWidth="10" fill="none" />
                            <path d="M0 32 L400 56 M0 92 L400 78 M80 0 L120 120 M250 0 L230 120 M340 0 L360 120" stroke="#c9c6bb" strokeWidth="1" fill="none" />
                        </svg>
                        <span className="hv-pin" style={{ left: '22%', top: '72%' }}><i /></span>
                        <span className="hv-pin" style={{ left: '80%', top: '44%' }}><i /></span>
                        {web && <span className="hv-pin me" style={{ left: '52%', top: '62%' }}><span>Tu Negocio</span><i /></span>}
                    </div>
                    <div className="hv-places">
                        {web ? (
                            <div className="hv-place me">
                                <b>Tu Negocio</b>
                                <span className="hv-st"><em>4,8 ★★★★★</em> (126) · {r.n} · <span className="open">Abierto</span></span>
                                <span className="hv-acts"><span>Sitio web</span><span>Cómo llegar</span><span>Llamar</span><span className="ai">Chatear ahora</span></span>
                            </div>
                        ) : (
                            <div className="hv-missing"><b>Tu negocio no aparece.</b> Quien busca esto en {com} solo ve a la competencia.</div>
                        )}
                        <div className="hv-place dim"><b>Otro negocio</b><span className="hv-st"><em>4,1 ★★★★</em> (38) · cierra 18:00</span></div>
                        <div className="hv-place dim"><b>Otro negocio más</b><span className="hv-st"><em>3,9 ★★★★</em> (12) · cerrado</span></div>
                    </div>
                </div>
                {web && (
                    <div className={`hv-reply${reply ? '' : ' is-hidden'}`}>
                        <span className="hv-rh">Agente IA · Tu Negocio<em>respondió en 3 s</em></span>
                        <span className="hv-m me">{r.ask}</span>
                        <span className="hv-m">{r.ans}</span>
                    </div>
                )}
            </div>
            <p className="hv-note">Ejemplo ilustrativo. El orden en Google depende de cada búsqueda.</p>
        </div>
    );
};

const PANELS = { faz: FazPanel, web: WebPanel, google: GooglePanel };

const HeroVisuals = () => {
    const [cur, setCur] = useState(0);
    const [back, setBack] = useState(false); // entra desde la izquierda
    const [chosen, setChosen] = useState(false); // la persona eligió o usó un panel: queda fijo
    const [hold, setHold] = useState(false); // mouse encima: pausa
    const [round, setRound] = useState(0); // al cambiar, la barra naranja parte de cero
    const [still] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    const touch = useRef(null);

    useEffect(() => {
        if (still || chosen || hold) return undefined;
        const t = setTimeout(() => { setBack(false); setCur((i) => (i + 1) % TABS.length); }, EVERY);
        return () => clearTimeout(t);
    }, [cur, still, chosen, hold, round]);

    const go = (i) => {
        const next = (i + TABS.length) % TABS.length;
        setBack(next < cur);
        setCur(next);
        setChosen(true);
    };

    const tabsClass = ['vis-tabs', still && 'static', chosen && 'paused', hold && !chosen && 'hold']
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className="hv"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => {
                setHold(false);
                setRound((r) => r + 1);
            }}
        >
            <div key={round} className={tabsClass} role="tablist" aria-label="Qué hace Interfaz 360" style={{ '--every': `${EVERY}ms` }}>
                {TABS.map((t, i) => (
                    <button
                        key={t.id}
                        id={`hv-tab-${t.id}`}
                        type="button"
                        role="tab"
                        aria-selected={i === cur}
                        aria-controls={`hv-panel-${t.id}`}
                        onClick={() => go(i)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div
                className="hv-stage"
                onPointerDown={() => setChosen(true)}
                onKeyDown={() => setChosen(true)}
                onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                onTouchEnd={(e) => {
                    const s = touch.current;
                    touch.current = null;
                    if (!s || e.target.closest('input, select')) return;
                    const dx = e.changedTouches[0].clientX - s.x;
                    const dy = e.changedTouches[0].clientY - s.y;
                    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
                }}
            >
                {TABS.map((t, i) => {
                    const Panel = PANELS[t.id];
                    const on = i === cur;
                    return (
                        <div
                            key={t.id}
                            id={`hv-panel-${t.id}`}
                            role="tabpanel"
                            aria-labelledby={`hv-tab-${t.id}`}
                            aria-hidden={!on}
                            inert={!on}
                            className={`hv-slide${on ? ' is-on' : ''}${on && back ? ' from-left' : ''}`}
                        >
                            <Panel active={on} still={still} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HeroVisuals;
