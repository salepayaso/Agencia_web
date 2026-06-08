import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Star, MapPin, CheckCheck, TrendingUp, MessageSquare, Bot, Sparkles } from 'lucide-react';

const HeroVisual = () => {
    // Parallax mouse position
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };

    // Chat Simulation States
    // 0: Initial
    // 1: User message appears
    // 2: Bot is typing
    // 3: Bot message appears
    // 4: Bot second message appears
    const [chatStep, setChatStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setChatStep((prev) => (prev + 1) % 5);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="relative w-full h-[500px] flex items-center justify-center p-4 select-none cursor-default"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

            {/* Layer 1: Web Design Mockup (Bottom Layer, tilt left) */}
            <motion.div
                className="absolute w-[340px] md:w-[380px] bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
                animate={{
                    x: mousePos.x * -15 - 40,
                    y: mousePos.y * -15 - 50,
                    rotateX: mousePos.y * -10,
                    rotateY: mousePos.x * 10 - 5,
                    z: -10
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 px-4 py-1 rounded-lg text-[10px] text-gray-400 font-mono w-44 justify-center">
                        <Globe className="w-3 h-3 text-primary-400" />
                        <span>interfaz360.cl</span>
                    </div>
                    <div className="w-10" />
                </div>
                {/* Browser Content */}
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold tracking-wider text-white">INTERFAZ<span className="text-primary-400">360</span></div>
                        <div className="w-12 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="space-y-2 py-4">
                        <div className="h-4 w-4/5 rounded bg-gradient-to-r from-primary-400 to-purple-400" />
                        <div className="h-2.5 w-full rounded bg-white/5" />
                        <div className="h-2.5 w-11/12 rounded bg-white/5" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <div className="h-7 w-24 rounded bg-primary-500 flex items-center justify-center text-[10px] font-bold">Ver Demo</div>
                        <div className="h-7 w-20 rounded border border-white/10 flex items-center justify-center text-[10px]">Servicios</div>
                    </div>
                </div>
            </motion.div>

            {/* Layer 2: Google Local SEO (Middle Layer, tilt right/down) */}
            <motion.div
                className="absolute w-[280px] bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl"
                animate={{
                    x: mousePos.x * 20 + 80,
                    y: mousePos.y * 20 + 100,
                    rotateX: mousePos.y * -5,
                    rotateY: mousePos.x * 12 + 5,
                    z: 10
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Search className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400">Google Maps</span>
                    </div>
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">#1 Lugar</span>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                            Tu Pyme Local
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[9px] text-gray-400 ml-1">(5.0) · Verificado</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-300 bg-white/5 p-2 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">Santiago, Chile</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div>
                            <div className="text-[9px] text-gray-500">Llamadas/Visitas</div>
                            <div className="text-sm font-bold text-green-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +142% este mes
                            </div>
                        </div>
                        <div className="h-6 w-14 rounded bg-white/10 flex items-center justify-center text-[9px] text-white">Ver Mapa</div>
                    </div>
                </div>
            </motion.div>

            {/* Layer 3: WhatsApp Bot AI Agent (Top Layer, floating center-top) */}
            <motion.div
                className="absolute w-[300px] md:w-[320px] bg-slate-900 border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(8,145,178,0.2)] overflow-hidden"
                animate={{
                    x: mousePos.x * 35 + 20,
                    y: mousePos.y * 35 - 90,
                    rotateX: mousePos.y * 8,
                    rotateY: mousePos.x * -8,
                    z: 30
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* WhatsApp Chat Header */}
                <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border border-emerald-600 animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                Agente IA Interfaz360
                                <Sparkles className="w-3 h-3 text-cyan-300" />
                            </div>
                            <div className="text-[9px] text-emerald-100">Activo 24/7</div>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                </div>

                {/* WhatsApp Chat Content */}
                <div className="p-4 space-y-3 bg-[#0b141a]/95 min-h-[160px] flex flex-col justify-end">
                    
                    {/* User message (always visible after step 0) */}
                    {chatStep >= 1 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-950/80 border border-emerald-500/20 text-white rounded-lg p-2.5 text-xs max-w-[85%] self-end"
                        >
                            <div className="text-gray-400 text-[8px] mb-0.5">Cliente</div>
                            Hola, ¿tienen disponibilidad para crear una página web y un bot?
                        </motion.div>
                    )}

                    {/* Bot Typing Indicator */}
                    {chatStep === 2 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 text-gray-300 rounded-lg p-2 text-xs max-w-[80%] self-start flex items-center gap-1"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                        </motion.div>
                    )}

                    {/* Bot response 1 */}
                    {chatStep >= 3 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 text-white rounded-lg p-2.5 text-xs max-w-[85%] self-start"
                        >
                            <div className="text-cyan-400 text-[8px] mb-0.5 flex items-center gap-1 font-semibold">
                                <Bot className="w-2.5 h-2.5" /> AGENTE IA
                            </div>
                            ¡Hola! Sí, por supuesto. Desarrollamos webs profesionales en React y bots de WhatsApp automáticos.
                        </motion.div>
                    )}

                    {/* Bot response 2 */}
                    {chatStep >= 4 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 text-white rounded-lg p-2.5 text-xs max-w-[85%] self-start flex flex-col gap-1"
                        >
                            <span>¿De qué rubro es tu negocio para asesorarte mejor? 🚀</span>
                            <div className="flex items-center justify-end gap-0.5 text-[8px] text-cyan-300 mt-1">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Entregado</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Default state / empty starter */}
                    {chatStep === 0 && (
                        <div className="text-center text-gray-500 text-[10px] my-auto italic flex flex-col items-center gap-1">
                            <MessageSquare className="w-5 h-5 text-gray-600 animate-pulse" />
                            <span>Simulación de atención 24/7</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default HeroVisual;
