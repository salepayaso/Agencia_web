import { useState, useRef } from 'react';

const FlipCard = ({ icon: Icon, iconColor, iconBg, frontTitle, frontDesc, backTitle, backDesc, waButton = false, waLink = '' }) => {
    const [flipped, setFlipped] = useState(false);
    const [pos, setPos] = useState({ x: -999, y: -999 });
    const [hovered, setHovered] = useState(false);
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={cardRef}
            onClick={() => setFlipped(f => !f)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPos({ x: -999, y: -999 }); }}
            style={{ perspective: '1200px', height: '310px', cursor: 'pointer' }}
            className="w-full select-none"
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.8s cubic-bezier(.16,1,.3,1)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* CARA FRONTAL */}
                <div
                    style={{ 
                        backfaceVisibility: 'hidden', 
                        WebkitBackfaceVisibility: 'hidden',
                        border: hovered ? `1px solid ${iconColor}55` : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: hovered ? `0 15px 40px -10px ${iconColor}22` : '0 10px 30px -10px rgba(0,0,0,0.5)',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                    }}
                    className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between overflow-hidden group ${hovered ? '-translate-y-1' : ''}`}
                >
                    {/* Spotlight radial gradient que sigue el mouse */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{
                            opacity: hovered ? 1 : 0,
                            background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, ${iconColor}1a, transparent 70%)`,
                        }}
                    />

                    {/* Interactive corner indicator */}
                    <div className="absolute top-4 right-4 text-gray-500 group-hover:text-white transition-colors duration-300">
                        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center">
                            {/* Icon Container with Glassmorphism */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                                style={{ 
                                    background: `linear-gradient(135deg, ${iconColor}22, ${iconColor}08)`,
                                    border: `1px solid ${iconColor}30`,
                                    boxShadow: hovered ? `0 0 25px ${iconColor}30` : 'none',
                                }}
                            >
                                <Icon style={{ color: iconColor, width: '28px', height: '28px' }} />
                            </div>
                            
                            <h3 className="text-white font-extrabold text-xl leading-tight mb-3 tracking-tight group-hover:text-white transition-colors text-center">
                                {frontTitle}
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed text-center">
                                {frontDesc}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mt-4 transition-colors duration-300" style={{ color: iconColor }}>
                            <span>Toca para ver más</span>
                            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* CARA TRASERA */}
                <div
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        border: `1px solid ${iconColor}33`,
                        background: 'linear-gradient(135deg, rgba(20,20,35,0.96) 0%, rgba(8,8,16,0.99) 100%)',
                        boxShadow: `0 15px 40px -10px rgba(0,0,0,0.6)`
                    }}
                    className="absolute inset-0 rounded-3xl p-7 flex flex-col justify-between overflow-hidden"
                >
                    {/* Spotlight backface */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{
                            opacity: hovered ? 1 : 0,
                            background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, ${iconColor}15, transparent 70%)`,
                        }}
                    />

                    {/* Interactive corner indicator (back) */}
                    <div className="absolute top-4 right-4 text-gray-500 opacity-60">
                        <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-1.5 rounded-full mb-4" style={{ backgroundColor: iconColor }} />
                            <h3 className="text-white font-extrabold text-lg leading-tight mb-2.5 tracking-tight text-center">
                                {backTitle}
                            </h3>
                            <p className="text-slate-200 text-sm leading-relaxed text-center">
                                {backDesc}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            {waButton && (
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-emerald-900/30"
                                    style={{ background: 'linear-gradient(135deg, #128c7e 0%, #25d366 100%)' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Hablar por WhatsApp
                                </a>
                            )}
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2 font-medium">
                                <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                <span>Toca para volver</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipCard;
