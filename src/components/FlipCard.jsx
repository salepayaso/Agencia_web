import { useState, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { openChat } from '../lib/chat';

const FlipCard = ({ icon: Icon, iconColor, iconBg, frontTitle, frontDesc, backTitle, backDesc, chatButton = false, chatMessage = '' }) => {
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
                            {chatButton && (
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); openChat(chatMessage); }}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-primary-900/30 bg-primary-600 hover:bg-primary-500"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Hablar con el asesor
                                </button>
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
