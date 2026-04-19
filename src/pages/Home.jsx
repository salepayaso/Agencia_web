import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Brands from '../components/Brands';
import VentajasCompetitivas from '../components/VentajasCompetitivas';
import SEO from '../components/SEO';

import Button from '../components/ui/Button';
import SpotlightCard from '../components/SpotlightCard';
import { Rocket, ArrowRight, Zap, ShieldCheck, Headphones, TrendingUp, MonitorSmartphone, Activity, BarChart3, Mail, MessageSquare, User, Lock, Search, MapPin, PieChart, Instagram, Bot, Code2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30" style={{ scrollBehavior: 'smooth' }}>
            <SEO
                title="Interfaz360 — Agencia Digital IA en Chile | Web, Software y Agentes IA para Pymes"
                description="Agencia digital en Chile para pymes. Sitios web, ecosistemas Google, software a medida y agentes IA por WhatsApp o web. Tecnología de grandes empresas al alcance de tu negocio."
            />
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden min-h-screen flex items-center">
                {/* Background Gradients with Parallax - Solo en Desktop para reducir INP */}
                <motion.div
                    className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[60px] md:blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"
                    animate={typeof window !== 'undefined' && window.innerWidth > 768 ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    } : {}}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ y: typeof window !== 'undefined' && window.innerWidth > 768 ? y : 0 }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[50px] md:blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"
                    animate={typeof window !== 'undefined' && window.innerWidth > 768 ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    } : {}}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    style={{ y: typeof window !== 'undefined' && window.innerWidth > 768 ? useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) : 0 }}
                ></motion.div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 mb-6 font-medium">
                            <Rocket className="w-4 h-4" />
                            <span>✦ Web · Google · Software · Agentes IA</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Potencia tu negocio con <span className="text-gradient">Inteligencia Artificial.</span>
                        </h1>
                        <p className="text-gray-300 text-lg mb-8 max-w-lg">
                            No solo creamos sitios web; construimos ecosistemas inteligentes. Automatizamos tu atención al cliente con agentes IA y optimizamos tu presencia en Google para que tu negocio crezca sin límites. Soluciones de vanguardia para tu negocio.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, vengo desde la web y me gustaría profesionalizar mi negocio. Necesito asesoría para mi proyecto digital.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="primary"
                                trackingLabel="Hero: Habla con nosotros"
                            >
                                Habla con nosotros
                            </Button>
                            <Button href="/servicios" variant="glass" trackingLabel="Hero: Ver Servicios">Ver servicios</Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden md:block"
                    >
                        {/* Modern Tech Visual */}
                        <div className="relative z-10 glass-card rounded-3xl border border-white/20 overflow-hidden group shadow-2xl" style={{ boxShadow: '0 0 40px rgba(255,255,255,0.25), 0 0 80px rgba(200,200,255,0.15), 0 0 140px rgba(150,150,255,0.1), 0 30px 60px rgba(0,0,0,0.6)' }}>
                            <div className="h-80 md:h-[480px] overflow-hidden relative flex items-center justify-center">
                                <img
                                    src="/hero-ai-tech.png"
                                    alt="Potencia tu Pyme con Agentes IA — Interfaz360"
                                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                                    width={512}
                                    height={512}
                                    fetchpriority="high"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                        </span>
                                        <span className="text-cyan-300 text-sm font-semibold tracking-wide">IA Activa 24/7</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 backdrop-blur-sm font-medium">Agentes IA</div>
                                        <div className="px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs text-violet-300 backdrop-blur-sm font-medium">Chat Web</div>
                                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 backdrop-blur-sm font-medium">WhatsApp Bot</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-40"></div>
                    </motion.div>
                </div>
            </section>

            <VentajasCompetitivas />

            <Brands />

            {/* Community / Instagram Proof */}
            <div className="flex justify-center -mt-6 mb-12 px-4 relative z-30">
                <motion.a
                    href="https://www.instagram.com/interfaz360/"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="glass-card px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 group hover:border-[#E4405F]/50 transition-all shadow-[0_0_80px_rgba(228,64,95,0.1)] bg-gray-900/50 backdrop-blur-xl"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-lg shadow-[#ee2a7b]/20">
                        <div className="w-full h-full rounded-[14px] bg-gray-900 flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    <div>
                        <div className="text-white font-bold text-base flex items-center gap-2">
                            @interfaz360
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                        <div className="text-gray-300 text-sm">Comunidad de <strong>+1,100 seguidores</strong></div>
                    </div>
                    <div className="ml-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E4405F]/20 transition-colors">
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                    </div>
                </motion.a>
            </div>



            {/* Services Teaser Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-black/20 to-dark-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary-400 mb-4">
                            <span className="font-semibold uppercase tracking-wider">Lo que hacemos</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tecnología que <span className="text-gradient">trabaja por ti</span>
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                            Automatizamos, desarrollamos y posicionamos tu negocio en el mundo digital. Sin complicaciones.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {[
                            {
                                icon: Bot,
                                iconColor: '#38BDF8',
                                glowColor: '#38BDF8',
                                tag: 'Nuevo',
                                title: 'Agentes IA',
                                desc: 'Automatizamos la atención de tu negocio con inteligencia artificial. Responden mensajes en WhatsApp, Instagram y tu sitio web las 24 horas, sin que tengas que estar presente.',
                                link: '/servicios'
                            },
                            {
                                icon: Code2,
                                iconColor: '#A78BFA',
                                glowColor: '#A78BFA',
                                tag: 'Popular',
                                title: 'Software a Medida',
                                desc: 'Sistemas digitales hechos para tu operación: paneles de control, automatizaciones e integraciones con tus herramientas actuales. Sin plantillas, sin límites.',
                                link: '/servicios'
                            },
                            {
                                icon: MonitorSmartphone,
                                iconColor: '#34D399',
                                glowColor: '#34D399',
                                tag: 'Esencial',
                                title: 'Diseño Web',
                                desc: 'Sitios web en React que cargan rápido, se ven increíbles y convierten visitantes en clientes. Sin WordPress, sin plugins que se rompen. Tu sitio, tuyo para siempre.',
                                link: '/servicios'
                            }
                        ].map((service, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <SpotlightCard {...service} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button href="/servicios" variant="glass">
                            Ver Todos los Servicios
                        </Button>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 px-4 md:px-8 bg-dark-bg relative overflow-hidden">
                {/* Gradientes suaves cerca de las tarjetas */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-400 mb-4">
                            <span className="font-semibold uppercase tracking-wider">Nuestras ofertas</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Planes <span className="text-gradient">Hechos para PYMES</span>
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg text-balance">
                            Desde tu primera presencia digital hasta el motor completo de tu empresa.
                            Tecnología de punta aplicada a tu crecimiento.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Plan Pyme Digital */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="glass-card rounded-3xl border-2 border-blue-500 p-8 md:p-10 relative overflow-hidden group flex flex-col bg-gradient-to-b from-blue-900/20 to-transparent h-full" style={{boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(59,130,246,0.3), 0 20px 60px rgba(0,0,0,0.4)'}}
                        >
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full font-bold text-[10px] tracking-widest shadow-lg uppercase">
                                MÁS POPULAR
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Plan Pyme Digital</h3>
                                <div className="text-blue-400 text-sm font-medium mb-6">Tu Carta de Presentación Digital</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                    Ideal para emprendedores que necesitan una imagen impecable y aparecer en Google de inmediato.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {[
                                    { text: "Landing Page Profesional", bold: true },
                                    { text: "5 Correos Corporativos", bold: true },
                                    { text: "Dominio & Hosting 1 año GRATIS", bold: true },
                                    { text: "Google Business + SEO Local", bold: true },
                                    { text: "Tecnología React Alta Interactividad", bold: true },
                                    { text: "Certificado SSL de Seguridad", bold: true }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span className={`${item.bold ? 'text-white' : 'text-gray-300'} text-sm`}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Button
                                    href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, me interesa contratar el Plan Pyme Digital. ¿Me podrían dar más información?")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="primary"
                                    className="w-full !py-4"
                                    trackingLabel="Contratar: Plan Pyme Digital"
                                >
                                    Solicitar Asesoría
                                </Button>
                            </div>
                        </motion.div>

                        {/* Plan Ecosistema 360 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="glass-card rounded-3xl border-2 border-purple-500 p-8 md:p-10 relative overflow-hidden group flex flex-col bg-gradient-to-b from-purple-900/20 to-transparent" style={{boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(168,85,247,0.3), 0 20px 60px rgba(0,0,0,0.4)'}}
                        >
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full font-bold text-[10px] tracking-widest shadow-lg uppercase">
                                NUEVO
                            </div>
                            <div className="mb-8 relative z-20">
                                <h3 className="text-2xl font-bold mb-2">Agente IA 24/7</h3>
                                <div className="text-purple-400 text-sm font-medium mb-6">Tu negocio nunca deja de atender</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                    Automatiza la atención de tu negocio con inteligencia artificial. Responde clientes por WhatsApp o tu sitio web — incluso mientras duermes.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {[
                                    "Agente IA para WhatsApp Business",
                                    "Chat IA integrado en tu sitio web",
                                    "Respuestas automáticas 24/7",
                                    "Configurado con la info de tu negocio",
                                    "Sin costo fijo elevado de personal",
                                    "Cotización a medida según tu rubro"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                        <span className="text-white text-sm">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <p className="text-purple-300 text-sm font-medium mb-4">Precio según tu negocio y necesidades</p>
                                <Button
                                    href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, me interesa un Agente IA para mi negocio. ¿Me podrían dar más información?")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="primary"
                                    className="w-full !py-4 shadow-lg bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 border-none relative z-20"
                                    trackingLabel="Contratar: Agente IA 24/7"
                                >
                                    Quiero mi Agente IA
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-12 italic">
                        * Precios en pesos chilenos (CLP). Entrega en tiempo récord.
                    </p>
                </div>
            </section>

            {/* Client Panel Preview Section */}
            <section className="py-16 px-4 md:px-8 bg-dark-bg/50 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 mb-6">
                                <Lock className="w-3 h-3" />
                                <span className="font-semibold uppercase tracking-wider">Exclusivo para Nuestros Clientes</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                Tu Perfil de <br />
                                <span className="text-gradient">Gestión 360</span>
                            </h2>
                            <p className="text-gray-300 text-base mb-6 leading-relaxed">
                                Nuestros clientes con Suite Digital 360 tienen acceso a un panel exclusivo donde pueden ver y gestionar sus servicios activos las 24 horas. Transparencia total.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", text: "Estado de tus servicios en tiempo real" },
                                    { icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", text: "Métricas de visitas y rendimiento de tu web" },
                                    { icon: Mail, color: "text-purple-400", bg: "bg-purple-500/10", text: "Gestión de correos corporativos" },
                                    { icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10", text: "Soporte técnico directo desde el panel" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <div className={`p-1.5 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Button href="/login" variant="primary" icon={ArrowRight} className="!py-3 !px-6 text-sm" trackingLabel="Acceso Clientes: Seccion Info">
                                    Acceso Clientes
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                                {/* Mock Header */}
                                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Perfil de Gestión</h3>
                                        <p className="text-xs text-green-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            Acceso 24/7
                                        </p>
                                    </div>
                                </div>

                                {/* Mock Dashboard Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-primary-400">
                                            <Search className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Search Console</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">4.2k</p>
                                        <p className="text-[10px] text-gray-500">Impresiones/mes</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Google Business</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">85</p>
                                        <p className="text-[10px] text-gray-500">Interacciones Maps</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Infraestructura</span>
                                        </div>
                                        <p className="text-xs font-semibold text-green-400">SSL Activo</p>
                                        <p className="text-[10px] text-gray-500">cPanel & Hosting</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-pink-400">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Correos Admin</span>
                                        </div>
                                        <p className="text-xs font-semibold text-white truncate">contacto@tuweb.cl</p>
                                        <p className="text-[10px] text-gray-500">Gestionar Cuentas</p>
                                    </div>
                                </div>

                                {/* Looker Studio / Analytics Highlight */}
                                <div className="bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent border border-white/10 rounded-xl p-6 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <PieChart className="w-4 h-4 text-primary-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Google Looker Studio</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Informe de Métricas 360</h4>
                                            </div>
                                            <div className="px-2 py-1 bg-primary-500/20 rounded text-[10px] font-bold text-primary-400 uppercase tracking-wide">Actualizado</div>
                                        </div>

                                        <div className="flex items-end gap-4">
                                            <div>
                                                <p className="text-2xl font-bold text-white">1,247</p>
                                                <p className="text-[10px] text-gray-500">Visitas únicas / mes</p>
                                            </div>
                                            <div className="h-10 flex-grow flex items-end gap-1 pb-1">
                                                {[30, 45, 35, 60, 55, 80, 70].map((h, i) => (
                                                    <div key={i} className="flex-grow bg-primary-500/30 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                                        </div>
                                    </div>
                                    {/* Abstract glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Final Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary-950/20 via-purple-950/20 to-primary-950/20 border-y border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80')] bg-cover bg-center opacity-5"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm text-primary-400 mb-6">
                            <Rocket className="w-4 h-4" />
                            <span className="font-semibold">Comencemos Hoy</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            ¿Listo para llevar tu negocio <br className="hidden md:block" />
                            <span className="text-gradient">al siguiente nivel?</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                            Agenda una consultoría gratuita de 30 minutos y descubre cómo podemos
                            transformar tu presencia digital con tecnología de punta.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button href="/contacto" variant="primary" icon={ArrowRight} className="!py-4 !px-8 text-lg" trackingLabel="CTA Final: Agenda Consultoria">
                                Agenda tu Consultoría Gratis
                            </Button>
                            <Button href="/portafolio" variant="glass" className="!py-4 !px-8 text-lg" trackingLabel="CTA Final: Ver Casos Exito">
                                Ver Casos de Éxito
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>


            <Footer />
        </div>
    );
};

export default Home;
