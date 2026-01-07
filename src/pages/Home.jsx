import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Brands from '../components/Brands';

import Button from '../components/ui/Button';
import { Rocket, ArrowRight, Zap, ShieldCheck, Headphones, TrendingUp, MonitorSmartphone, ShoppingBag, Globe, Activity, BarChart3, Mail, MessageSquare, User, Lock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30" style={{ scrollBehavior: 'smooth' }}>
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden min-h-screen flex items-center">
                {/* Background Gradients with Parallax */}
                <motion.div
                    className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"
                    style={{ y }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"
                    style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
                ></motion.div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 mb-6">
                            <Rocket className="w-4 h-4" />
                            <span>Potenciado con Tecnología React & IA</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Webs de Alta Tecnología <br /><span className="text-gradient">para Negocios Modernos.</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-lg">
                            Desarrollamos sitios web a medida, rápidos y seguros. Deja atrás lo obsoleto y destaca frente a tu competencia con tecnología de punta.
                        </p>
                        <div className="flex gap-4">
                            <Button href="/contacto" variant="primary" icon={ArrowRight}>Consultoría Gratuita</Button>
                            <Button href="/portafolio" variant="glass">Ver Casos de Estudio</Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden md:block"
                    >
                        {/* Modern Tech Visual */}
                        <div className="relative z-10 glass-card p-4 rounded-3xl border-t border-l border-white/20 overflow-hidden group">
                            <div className="h-80 rounded-2xl overflow-hidden relative">
                                <img
                                    src="/hero_tech_visual.png"
                                    alt="Modern Technology Visualization"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                        <span className="text-green-400 text-sm font-medium">System Active</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-xs text-primary-300 backdrop-blur-sm">React</div>
                                        <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 backdrop-blur-sm">Next.js</div>
                                        <div className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 backdrop-blur-sm">TypeScript</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-40"></div>
                    </motion.div>
                </div>
            </section>

            <Brands />


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
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            No somos una agencia más. Somos tu socio tecnológico con resultados comprobados.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                gradient: "from-amber-500 to-orange-600 shadow-orange-500/20",
                                title: "Velocidad Real",
                                desc: "Nuestros sitios cargan en menos de 1 segundo (vs 3-5s de WordPress)."
                            },
                            {
                                icon: ShieldCheck,
                                gradient: "from-blue-500 to-cyan-600 shadow-cyan-500/20",
                                title: "Seguridad Garantizada",
                                desc: "Arquitectura moderna sin plugins vulnerables ni actualizaciones constantes."
                            },
                            {
                                icon: Headphones,
                                gradient: "from-purple-500 to-pink-600 shadow-purple-500/20",
                                title: "Soporte 24/7",
                                desc: "No te dejamos solo después de entregar. Estamos cuando nos necesites."
                            },
                            {
                                icon: TrendingUp,
                                gradient: "from-emerald-500 to-green-600 shadow-emerald-500/20",
                                title: "ROI Comprobado",
                                desc: "En promedio, nuestros clientes ven +40% más conversiones."
                            }
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary-500/50 transition-all duration-300 group"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <benefit.icon className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
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
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                            Desde tu primera web hasta sistemas empresariales complejos. Todo bajo un mismo techo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[
                            {
                                icon: MonitorSmartphone,
                                gradient: "from-pink-500 to-rose-600 shadow-pink-500/20",
                                title: "Diseño Web Profesional",
                                desc: "Sitios únicos que venden, no plantillas genéricas.",
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
                                desc: "Tu identidad digital completa. Dominios, correos profesionales y hosting seguro.",
                                link: "/servicios"
                            }
                        ].map((service, i) => (
                            <motion.a
                                key={i}
                                href={service.link}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary-500 transition-all duration-300 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <service.icon className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
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

            {/* Client Panel Preview Section */}
            <section className="py-16 px-4 md:px-8 bg-dark-bg/50 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 mb-6">
                                <Lock className="w-3 h-3" />
                                <span className="font-semibold uppercase tracking-wider">Exclusivo para Nuestros Clientes</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                Tu Panel de <br />
                                <span className="text-gradient">Control Personal</span>
                            </h2>
                            <p className="text-gray-400 text-base mb-6 leading-relaxed">
                                Todos nuestros clientes tienen acceso a un panel exclusivo donde pueden ver y gestionar sus servicios activos las 24 horas. Transparencia total.
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
                                <Button href="/login" variant="primary" icon={ArrowRight} className="!py-3 !px-6 text-sm">
                                    Acceso Clientes
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                                {/* Mock Header */}
                                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Panel de Cliente</h3>
                                        <p className="text-xs text-green-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            Acceso 24/7
                                        </p>
                                    </div>
                                </div>

                                {/* Mock Cards */}
                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Sitio Web</p>
                                            <p className="font-semibold text-white">www.tunegocio.com</p>
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide">Activo</span>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Correos</p>
                                            <p className="font-semibold text-white">5 cuentas configuradas</p>
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide">Activo</span>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs text-blue-300">Visitas este mes</p>
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <h4 className="text-3xl font-bold text-white">1,247</h4>
                                            <span className="text-xs text-green-400 font-medium">+24%</span>
                                        </div>
                                    </div>
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
                            <Button href="/contacto" variant="primary" icon={ArrowRight} className="!py-4 !px-8 text-lg">
                                Agenda tu Consultoría Gratis
                            </Button>
                            <Button href="/portafolio" variant="glass" className="!py-4 !px-8 text-lg">
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
