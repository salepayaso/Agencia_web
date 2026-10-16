import { useEffect, useId, useRef, useState } from 'react';
import '../styles/robot.css';

// Robot del asesor: la cara del agente IA en el chat (diseño "Pantalla 2.5D").
// Sin voz, solo gestos. Sigue con la mirada al mouse o al dedo y, si nadie lo
// mueve, mira a su alrededor. SVG + CSS, sin librerías.
//
// Reutilizable para los agentes de clientes: cambiar `accent` (antena, orejas,
// extras) y `eye` (ojos) por los colores del negocio.
//
// gesture: 'esperando' | 'saludo' | 'pensando' | 'contento' | 'confundido'
// variant: 'cabecera' (con orejas y pantalla, para ~40 px) | 'boton' (más simple, para ~28 px)

const IDLE_MS = 2500; // sin movimiento por este tiempo, vuelve a mirar a su alrededor
const WANDER_MS = 1700;

const clamp = (v) => Math.max(-1, Math.min(1, v));

// Mirada: x e y entre -1 y 1. Pensando mira hacia arriba, a un lado.
function useGaze(ref, gesture) {
    const [gaze, setGaze] = useState({ x: 0, y: 0, following: false });
    const lastMove = useRef(0);

    useEffect(() => {
        let frame = 0;
        const onMove = (e) => {
            lastMove.current = Date.now();
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const box = ref.current?.getBoundingClientRect();
                if (!box) return;
                const cx = box.left + box.width / 2;
                const cy = box.top + box.height / 2;
                setGaze({
                    x: clamp((e.clientX - cx) / (window.innerWidth * 0.35)),
                    y: clamp((e.clientY - cy) / (window.innerHeight * 0.35)),
                    following: true,
                });
            });
        };
        const wander = setInterval(() => {
            if (Date.now() - lastMove.current < IDLE_MS) return;
            setGaze({ x: Math.random() * 1.2 - 0.6, y: Math.random() * 0.8 - 0.4, following: false });
        }, WANDER_MS);

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            clearInterval(wander);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [ref]);

    return gesture === 'pensando' ? { x: 0.5, y: -0.7, following: false } : gaze;
}

const RobotAsesor = ({ gesture = 'esperando', variant = 'cabecera', size = 40, accent = '#e8471c', eye = '#8fe0a8', className = '' }) => {
    const ref = useRef(null);
    const id = useId().replace(/:/g, '');
    const { x, y, following } = useGaze(ref, gesture);
    const t = (transform) => ({ transform });
    const mini = variant === 'boton';

    return (
        <svg
            ref={ref}
            viewBox="0 0 200 200"
            width={size}
            height={size}
            aria-hidden="true"
            className={`robot g-${gesture}${mini ? ' robot-mini' : ''}${following ? ' is-following' : ''} ${className}`}
        >
            <defs>
                <linearGradient id={`${id}-hg`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#34476b" />
                    <stop offset=".45" stopColor="#16233b" />
                    <stop offset="1" stopColor="#070d19" />
                </linearGradient>
                <radialGradient id={`${id}-sg`} cx=".45" cy=".35" r=".8">
                    <stop offset="0" stopColor="#2a3e63" />
                    <stop offset="1" stopColor="#0b1426" />
                </radialGradient>
            </defs>

            <g className="r-body">
                <g className="r-move" style={t(`translate(${x * 5}px, ${y * 4}px) rotate(${x * 3}deg)`)}>
                    {mini ? (
                        <>
                            <circle cx="100" cy="20" r="12" fill={accent} />
                            <rect x="24" y="40" width="152" height="128" rx="32" fill={`url(#${id}-hg)`} />
                        </>
                    ) : (
                        <>
                            <circle cx="100" cy="20" r="11" fill={accent} />
                            <rect x="16" y="84" width="18" height="36" rx="9" fill={accent} />
                            <rect x="166" y="84" width="18" height="36" rx="9" fill={accent} />
                            <rect x="28" y="40" width="144" height="122" rx="30" fill={`url(#${id}-hg)`} />
                            <rect x="42" y="56" width="116" height="92" rx="20" fill={`url(#${id}-sg)`} />
                        </>
                    )}

                    <g className="r-move" style={t(`translate(${x * 9}px, ${y * 8}px)`)}>
                        {mini ? (
                            <>
                                <g className="r-eyes e-normal" fill={eye}>
                                    <rect className="r-blink" x="60" y="76" width="28" height="44" rx="14" />
                                    <rect className="r-blink" x="112" y="76" width="28" height="44" rx="14" />
                                </g>
                                <g className="r-eyes e-pensando" fill={eye}>
                                    <rect x="74" y="66" width="26" height="36" rx="13" />
                                    <rect x="120" y="66" width="26" height="36" rx="13" />
                                </g>
                                <g className="r-eyes e-feliz" fill="none" stroke={eye} strokeWidth="15" strokeLinecap="round">
                                    <path d="M58 114 Q74 86 90 114" />
                                    <path d="M110 114 Q126 86 142 114" />
                                </g>
                                <g className="r-eyes e-confundido" fill={eye}>
                                    <rect x="60" y="76" width="28" height="44" rx="14" />
                                    <rect x="106" y="94" width="36" height="13" rx="6.5" />
                                </g>
                            </>
                        ) : (
                            <>
                                <g className="r-eyes e-normal" fill={eye}>
                                    <rect className="r-blink" x="64" y="80" width="24" height="38" rx="12" />
                                    <rect className="r-blink" x="112" y="80" width="24" height="38" rx="12" />
                                </g>
                                <g className="r-eyes e-pensando" fill={eye}>
                                    <rect x="76" y="70" width="22" height="30" rx="11" />
                                    <rect x="120" y="70" width="22" height="30" rx="11" />
                                </g>
                                <g className="r-eyes e-feliz" fill="none" stroke={eye} strokeWidth="12" strokeLinecap="round">
                                    <path d="M62 110 Q76 86 90 110" />
                                    <path d="M110 110 Q124 86 138 110" />
                                </g>
                                <g className="r-eyes e-confundido" fill={eye}>
                                    <rect x="64" y="80" width="24" height="38" rx="12" />
                                    <rect x="108" y="96" width="32" height="11" rx="5.5" />
                                </g>
                            </>
                        )}
                    </g>
                </g>

                {/* Extras de cada gesto: mano que saluda, puntos de pensar, brillos y signo de duda. */}
                {mini ? (
                    // En el botón la mano es más grande y lleva contorno oscuro:
                    // sin él se pierde contra el borde naranja del círculo.
                    <g className="r-extra x-mano" fill={accent} stroke="#0f1a2e" strokeWidth="8">
                        <rect x="166" y="74" width="26" height="58" rx="13" />
                        <circle cx="179" cy="62" r="22" />
                    </g>
                ) : (
                    <g className="r-extra x-mano">
                        <rect x="182" y="98" width="14" height="36" rx="7" fill={accent} />
                        <circle cx="189" cy="94" r="10" fill={accent} />
                    </g>
                )}
                <g className="r-extra x-puntos" fill="currentColor">
                    <circle cx="150" cy="30" r="7" />
                    <circle cx="168" cy="18" r="8" />
                    <circle cx="188" cy="6" r="9" />
                </g>
                <g className="r-extra x-brillo" fill={accent}>
                    <path d="M36 22 L39 31 L48 34 L39 37 L36 46 L33 37 L24 34 L33 31Z" />
                    <path d="M170 26 L172 35 L181 38 L172 41 L170 50 L168 41 L159 38 L168 35Z" />
                </g>
                <g className="r-extra x-duda">
                    <text x="156" y="40" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="48" fill={accent}>?</text>
                </g>
            </g>
        </svg>
    );
};

export default RobotAsesor;
