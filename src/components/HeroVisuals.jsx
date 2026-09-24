import { useEffect, useState } from 'react';
import { openChat } from '../lib/chat';

// Tres visuales que rotan cada 7 segundos. Se detienen al pasar el mouse
// y quedan fijos si la persona elige uno. Todos muestran un negocio genérico
// ("Tu Negocio"), nunca datos de clientes reales.
const TABS = [
    { id: 'noche', label: 'Mientras duermes' },
    { id: 'web', label: 'Tu web' },
    { id: 'google', label: 'En Google' },
];
const EVERY = 7000;

// Todo el visual abre el asesor, también con teclado.
const opener = {
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Abrir el asesor',
    onClick: () => openChat(),
    onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openChat();
        }
    },
};

const Night = () => (
    <>
        <div className="feed" {...opener}>
            <span className="top"><b>Consultas atendidas anoche</b><span>● Asesor activo</span></span>
            <ol>
                <li><time>23:14</time><span className="who">Marcela · pastelería</span><span className="what">Quiere vender tortas por encargo con pago online.</span><span className="st hot">Pidió precio</span></li>
                <li><time>01:52</time><span className="who">Jorge · taller mecánico</span><span className="what">Preguntó cómo aparecer en Google Maps.</span><span className="st">Dejó correo</span></li>
                <li><time>06:40</time><span className="who">Paula · centro de estética</span><span className="what">Necesita agenda de horas en su web.</span><span className="st">Dejó teléfono</span></li>
            </ol>
            <span className="foot"><span>Ejemplo · así te llegan a tu panel</span><b>3 clientes mientras dormías</b></span>
        </div>
        <p className="vis-note">Así atiende el asesor mientras duermes. <button type="button" onClick={() => openChat()}>Pruébalo tú →</button></p>
    </>
);

const Phone = () => (
    <>
        <div className="phone-wrap" {...opener}>
            <span className="phone"><span className="screen">
                <span className="sbar"><i /></span>
                <span className="shead"><span>TU NEGOCIO</span><span aria-hidden="true">☰</span></span>
                <span className="shero"><b>Tu producto<br />estrella</b></span>
                <span className="slines"><i style={{ width: '80%' }} /><i style={{ width: '64%' }} /><i style={{ width: '72%' }} /></span>
                <span className="bubble">
                    <span className="bh">Asesor <small>● en línea</small></span>
                    <span className="l">
                        <span className="m bot">¡Hola! ¿Quieres hacer un pedido para mañana?</span>
                        <span className="m me">Sí, una torta para 20 personas</span>
                        <span className="m bot">Perfecto. ¿Para qué día la necesitas?</span>
                    </span>
                </span>
            </span></span>
        </div>
        <p className="vis-note">Tu web en el celular, con el asesor tomando pedidos. <button type="button" onClick={() => openChat()}>Pruébalo tú →</button></p>
    </>
);

const Google = () => (
    <>
        <div className="collage" {...opener}>
            <span className="card gres">
                <span className="url">tunegocio.cl</span>
                <span className="h4">Tu Negocio · Lo que vendes, en Google</span>
                <span className="meta"><b>★ 4,8</b> (126 reseñas) · Abierto, cierra 20:00</span>
            </span>
            <span className="card gmap">
                <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <rect width="300" height="150" fill="#eceae3" />
                    <path d="M0 40 L300 70 M0 110 L300 95 M70 0 L110 150 M200 0 L180 150" stroke="#ffffff" strokeWidth="10" fill="none" />
                    <path d="M0 40 L300 70 M0 110 L300 95 M70 0 L110 150 M200 0 L180 150" stroke="#c9c6bb" strokeWidth="1" fill="none" />
                    <rect x="120" y="10" width="46" height="40" fill="#d6e4cf" />
                    <path d="M150 58c-9 0-15 7-15 15 0 11 15 25 15 25s15-14 15-25c0-8-6-15-15-15z" fill="#e8471c" />
                    <circle cx="150" cy="73" r="5" fill="#ffffff" />
                </svg>
                <span className="lbl"><b>Cómo llegar</b><span>A 600 m</span></span>
            </span>
            <span className="card gchat">
                <small>Asesor · 23:14</small>
                <span className="q">¿Hacen despacho a Ñuñoa?</span>
                <span>Sí, de lunes a sábado. ¿Te tomo el pedido?</span>
            </span>
        </div>
        <p className="vis-note">Te encuentran en Google y Maps, y el asesor responde. <button type="button" onClick={() => openChat()}>Pruébalo tú →</button></p>
    </>
);

const VIEWS = { noche: Night, web: Phone, google: Google };

const HeroVisuals = () => {
    const [cur, setCur] = useState(0);
    const [chosen, setChosen] = useState(false); // la persona eligió uno: queda fijo
    const [hold, setHold] = useState(false); // mouse encima: pausa
    const [round, setRound] = useState(0); // al cambiar, la barra naranja parte de cero
    const [still] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    useEffect(() => {
        if (still || chosen || hold) return;
        const t = setTimeout(() => setCur((i) => (i + 1) % TABS.length), EVERY);
        return () => clearTimeout(t);
    }, [cur, still, chosen, hold, round]);

    const tabsClass = ['vis-tabs', still && 'static', chosen && 'paused', hold && !chosen && 'hold']
        .filter(Boolean)
        .join(' ');
    const View = VIEWS[TABS[cur].id];

    return (
        <div
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => {
                setHold(false);
                setRound((r) => r + 1);
            }}
        >
            <div key={round} className={tabsClass} role="tablist" aria-label="Qué hace Interfaz 360">
                {TABS.map((t, i) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={i === cur}
                        onClick={() => { setCur(i); setChosen(true); }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="vis" key={TABS[cur].id} role="tabpanel">
                <View />
            </div>
        </div>
    );
};

export default HeroVisuals;
