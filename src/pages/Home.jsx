import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Brands from '../components/Brands';
import SEO from '../components/SEO';

import Button from '../components/ui/Button';
import { Rocket, ArrowRight, Zap, ShieldCheck, Headphones, TrendingUp, MonitorSmartphone, ShoppingBag, Globe, Activity, BarChart3, Mail, MessageSquare, User, Lock, Server, Search, MapPin, PieChart, Instagram } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30" style={{ scrollBehavior: 'smooth' }}>
            <SEO
                title="Agencia de Diseño Web & SEO en Santiago"
                description="Desarrollamos sitios web a medida, rápidos y seguros. Expertos en Ecosistema Google para potenciar tu visibilidad digital en Chile."
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
                            <span>Agencia de Diseño Web & Software en Chile</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            ¿Tu negocio no aparece <br /><span className="text-gradient">primero en Google?</span>
                        </h1>
                        <p className="text-gray-300 text-lg mb-8 max-w-lg">
                            Somos expertos en <strong>infraestructuras digitales</strong> que impulsan el crecimiento de tu negocio mediante estrategias SEO locales de alto impacto.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, vengo desde la web y me gustaría profesionalizar mi negocio. Necesito asesoría para mi proyecto digital.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="primary"
                                icon={ArrowRight}
                                trackingLabel="Hero: Habla con nosotros"
                            >
                                Habla con nosotros
                            </Button>
                            <Button href="/portafolio" variant="glass" trackingLabel="Hero: Ver Portafolio">Ver portafolio</Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden md:block"
                    >
                        {/* Modern Tech Visual */}
                        <div className="relative z-10 glass-card p-2 rounded-3xl border-t border-l border-white/20 overflow-hidden group shadow-2xl">
                            <div className="h-80 md:h-[480px] rounded-2xl overflow-hidden relative flex items-center justify-center bg-black/20">
                                <img
                                    src="/hero_clean.jpg"
                                    alt="Google Security & Tech Ecosystem"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    fetchpriority="high"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                        <span className="text-green-400 text-sm font-medium">Google Certified</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 backdrop-blur-sm">Secure SSL</div>
                                        <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs text-orange-300 backdrop-blur-sm">Google Cloud</div>
                                        <div className="px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-xs text-yellow-300 backdrop-blur-sm">Analytics</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-40"></div>
                    </motion.div>
                </div>
            </section>

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


            {/* Benefits Section - Por Qué Elegirnos */}
            <section className="py-20 px-4 md:px-8 bg-dark-bg relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary-400 mb-4">
                            <span className="font-semibold uppercase tracking-wider">Ventajas Competitivas</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            ¿Por Qué <span className="text-gradient">Elegirnos?</span>
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            No somos una agencia más. Somos tu socio tecnológico integral.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: MonitorSmartphone,
                                gradient: "from-amber-500 to-orange-600 shadow-orange-500/20",
                                title: "Estudio de Visibilidad & Web",
                                desc: "Análisis de métricas y sitios de última generación con React. Sin plantillas, pura estrategia digital."
                            },
                            {
                                icon: Lock,
                                gradient: "from-blue-500 to-cyan-600 shadow-cyan-500/20",
                                title: "Servidor & SSL Google",
                                desc: "Incluye hosting, dominios y Certificado SSL (candado seguro) de Google."
                            },
                            {
                                icon: () => (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333 .533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.24 2.053-2.08 2.667-5.013 2.667-7.467 0-.747-.053-1.467-.16-2.133H12.48z" />
                                    </svg>
                                ),
                                gradient: "from-blue-500 via-red-500 to-yellow-500 shadow-blue-500/20",
                                title: "Ecosistema Google",
                                desc: "Potencia tu presencia con Google Search Console, Analytics y Google Maps (Business). Te ayudamos a aparecer primero."
                            },
                            {
                                icon: Headphones,
                                gradient: "from-emerald-500 to-green-600 shadow-emerald-500/20",
                                title: "Soporte Dedicado",
                                desc: "Equipo real para ayudarte con correos, claves y dudas técnicas."
                            }
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    duration: typeof window !== 'undefined' && window.innerWidth > 768 ? 0.8 : 0.4,
                                    delay: typeof window !== 'undefined' && window.innerWidth > 768 ? i * 0.15 : 0,
                                    ease: [0.21, 0.47, 0.32, 0.98]
                                }}
                                whileHover={{
                                    y: -8,
                                    transition: { duration: 0.3 }
                                }}
                                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary-500/50 transition-all duration-300 group perspective-1000"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <benefit.icon className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Teaser Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-black/20 to-dark-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Soluciones <span className="text-gradient">Integrales</span>
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                            Desde tu primera web hasta sistemas empresariales complejos. Todo bajo un mismo techo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[
                            {
                                icon: MonitorSmartphone,
                                gradient: "from-pink-500 to-rose-600 shadow-pink-500/20",
                                title: "Ecosistema Google 360",
                                desc: "Infraestructura completa: Maps, Search Console y Analytics 4.",
                                link: "/servicios"
                            },
                            {
                                icon: ShoppingBag,
                                gradient: "from-violet-500 to-purple-600 shadow-purple-500/20",
                                title: "E-Commerce",
                                desc: "Tiendas online rápidas y seguras. Vende 24/7.",
                                link: "/servicios"
                            },
                            {
                                icon: Globe,
                                gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
                                title: "Dominios, Correos & Hosting",
                                desc: "Tu identidad digital completa. Dominios, correos corporativos y hosting seguro.",
                                link: "/servicios"
                            }
                        ].map((service, i) => (
                            <motion.a
                                key={i}
                                href={service.link}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    duration: typeof window !== 'undefined' && window.innerWidth > 768 ? 0.8 : 0.4,
                                    delay: typeof window !== 'undefined' && window.innerWidth > 768 ? i * 0.1 : 0,
                                    ease: [0.21, 0.47, 0.32, 0.98]
                                }}
                                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary-500 transition-all duration-300 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <service.icon className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    {service.desc}
                                </p>
                                <span className="text-primary-400 text-sm font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Ver más <ArrowRight className="w-4 h-4" />
                                </span>
                            </motion.a>
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
                {/* Simple Visible Particles - Ocultas en móvil para mejorar INP */}
                <div className="absolute inset-0 pointer-events-none hidden md:block overflow-hidden">
                    {/* Large visible particles */}
                    <div className="absolute top-10 left-20 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                    <div className="absolute top-32 right-32 w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(168,85,247,1)]"></div>
                    <div className="absolute bottom-40 left-40 w-4 h-4 bg-white rounded-full animate-ping shadow-[0_0_15px_white]"></div>
                    <div className="absolute top-60 right-20 w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(96,165,250,1)]" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-20 right-60 w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(192,132,252,1)]" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-24 left-60 w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_15px_white]" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-60 left-24 w-2 h-2 bg-blue-300 rounded-full animate-ping shadow-[0_0_10px_rgba(147,197,253,1)]"></div>
                    <div className="absolute top-48 right-48 w-2 h-2 bg-purple-300 rounded-full animate-bounce shadow-[0_0_10px_rgba(216,180,254,1)]" style={{ animationDelay: '0.7s' }}></div>
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
                            className="glass-card rounded-3xl border border-blue-500/20 p-8 md:p-10 relative overflow-hidden group hover:border-blue-500 transition-all duration-500 flex flex-col bg-gradient-to-b from-blue-900/10 to-transparent h-full"
                        >
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full font-bold text-[10px] tracking-widest shadow-lg uppercase">
                                NUEVO
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
                                    { text: "2 Correos Corporativos", bold: true },
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
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-4xl font-extrabold text-white">$250.000</span>
                                    <span className="text-gray-300 text-xs">pago único CLP</span>
                                </div>
                                <Button
                                    href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, me interesa contratar el Plan Pyme Digital. ¿Me podrían dar más información?")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="glass"
                                    className="w-full !py-4 hover:bg-blue-600/20"
                                    trackingLabel="Contratar: Plan Pyme Digital"
                                >
                                    Empezar Hoy
                                </Button>
                            </div>
                        </motion.div>

                        {/* Plan Ecosistema 360 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="glass-card rounded-3xl border-2 border-purple-500 p-8 md:p-10 relative overflow-hidden group shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col bg-gradient-to-b from-purple-900/20 to-transparent"
                        >
                            <div className="mb-8 relative z-20">
                                <h3 className="text-2xl font-bold mb-2">Ecosistema Google 360</h3>
                                <div className="text-purple-400 text-sm font-medium mb-6">El Motor Digital de tu Negocio</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                    Para empresas que buscan mayor potencia, gestión de clientes y una infraestructura Google completa.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {[
                                    { text: "Desarrollo Pagina Web Multi-Sección", bold: true },
                                    { text: "4 Correos Corporativos", bold: true },
                                    { text: "Dominio & Hosting 1 año GRATIS", bold: true },
                                    { text: "Google Business + SEO Local", bold: true },
                                    { text: "GTM, Analytics & Search Console", bold: true },
                                    { text: "Google Looker Studio (Métricas)", bold: true },
                                    { text: "Perfil de Gestión INTERFAZ 360", bold: true },
                                    { text: "Tecnología React Alta Interactividad", bold: true },
                                    { text: "Certificado SSL de Seguridad", bold: true }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                        <span className={`${item.bold ? 'text-white' : 'text-gray-300'} text-sm`}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-4xl font-extrabold text-white">$350.000</span>
                                    <span className="text-gray-300 text-xs">pago único CLP</span>
                                </div>
                                <Button
                                    href={`https://wa.me/56954146176?text=${encodeURIComponent("Hola Interfaz 360, me interesa contratar el Ecosistema Google 360. ¿Me podrían dar más información?")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="primary"
                                    className="w-full !py-4 shadow-lg bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 border-none relative z-20"
                                    trackingLabel="Contratar: Ecosistema Google 360"
                                >
                                    Activar Mi Ecosistema 360
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
                                Nuestros clientes con Ecosistema Google 360 tienen acceso a un panel exclusivo donde pueden ver y gestionar sus servicios activos las 24 horas. Transparencia total.
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
