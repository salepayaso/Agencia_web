import { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const SpotlightCard = ({ icon: Icon, iconColor, glowColor, title, desc, tag, link }) => {
    const [pos, setPos] = useState({ x: -999, y: -999 });
    const [hovered, setHovered] = useState(false);
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <a
            href={link}
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPos({ x: -999, y: -999 }); }}
            className="relative rounded-2xl overflow-hidden block group cursor-pointer"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? glowColor + '55' : 'rgba(255,255,255,0.08)'}`,
                transition: 'border-color 0.3s ease',
            }}
        >
            {/* Spotlight radial gradient que sigue el mouse */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                    opacity: hovered ? 1 : 0,
                    background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${glowColor}18, transparent 60%)`,
                }}
            />

            {/* Borde glow animado en hover */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                    opacity: hovered ? 1 : 0,
                    boxShadow: `inset 0 0 0 1px ${glowColor}33`,
                }}
            />

            <div className="relative z-10 p-8">
                {/* Tag */}
                <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
                    style={{ backgroundColor: glowColor + '15', color: glowColor, border: `1px solid ${glowColor}30` }}
                >
                    {tag}
                </div>

                {/* Ícono grande */}
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{
                        background: `linear-gradient(135deg, ${glowColor}20, ${glowColor}08)`,
                        border: `1px solid ${glowColor}25`,
                        boxShadow: hovered ? `0 0 30px ${glowColor}25` : 'none',
                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    }}
                >
                    <Icon style={{ color: glowColor, width: '30px', height: '30px' }} />
                </div>

                {/* Título */}
                <h3
                    className="text-2xl font-bold mb-3 transition-colors duration-300"
                    style={{ color: hovered ? '#fff' : '#e5e7eb' }}
                >
                    {title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {desc}
                </p>

                {/* CTA */}
                <span
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300"
                    style={{ color: glowColor }}
                >
                    Ver más
                    <ArrowRight
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </div>
        </a>
    );
};

export default SpotlightCard;
