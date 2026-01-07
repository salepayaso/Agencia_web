import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Layout, Rocket, Mail, Zap, Code, ArrowRight, MonitorSmartphone, ShoppingBag, Megaphone, Server, CheckCircle2, Activity, BarChart3, MessageSquare, User, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Services = () => {
    const services = [
        {
            icon: MonitorSmartphone,
            gradient: "from-pink-500 to-rose-600 shadow-pink-500/20",
            title: "Páginas Web Profesionales",
            tagline: "Tu negocio merece destacar",
            desc: "Diseñamos sitios web únicos que atraen clientes y generan ventas. Rápidos, seguros y fáciles de administrar.",
            benefits: ["Diseño único para tu marca", "Se ve perfecto en móvil y computadora", "Fácil de actualizar"],
        },
        {
            icon: ShoppingBag,
            gradient: "from-violet-500 to-purple-600 shadow-purple-500/20",
            title: "Tiendas Online",
            tagline: "Vende 24/7 sin límites",
            desc: "Creamos tu tienda online para que vendas en internet las 24 horas. Recibe pagos seguros y administra todo desde tu celular.",
            benefits: ["Acepta pagos con tarjeta", "Control total de inventario", "Tus clientes compran fácil y rápido"],
        },
        {
            icon: Megaphone,
            gradient: "from-amber-500 to-orange-600 shadow-orange-500/20",
            title: "Marketing Digital",
            tagline: "Que te encuentren tus clientes",
            desc: "Te ayudamos a aparecer primero en Google y atraer más clientes con publicidad en redes sociales.",
            benefits: ["Tu negocio en Google Maps", "Campañas de Facebook e Instagram", "Más visitas, más ventas"],
        },
        {
            icon: Server,
            gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
            title: "Dominios, Correos & Hosting",
            tagline: "Tu identidad digital completa",
            desc: "¿Necesitas un dominio nuevo o ya tienes uno? Te ayudamos con todo: desde crear tu dominio hasta correos profesionales y hosting seguro.",
            benefits: ["Creamos o transferimos tu dominio", "Correos profesionales (@tunegocio.com)", "Tu web siempre disponible y rápida"],
            badge: "NUEVO"
        }
    ];

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section */}
            <Section className="pt-32 pb-20">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 mb-6">
                        <span className="font-semibold">¿Qué Hacemos?</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Llevamos tu Negocio <br className="hidden md:block" />
                        <span className="text-gradient">al Mundo Digital</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Desde tu primera página web hasta sistemas completos. <br className="hidden md:block" />
                        <span className="text-white font-medium">Todo en un solo lugar, explicado de forma simple.</span>
                    </p>
                </div>
            </Section>

            {/* Services Grid - Visual & Simple */}
            <Section className="py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 rounded-3xl border border-white/10 hover:border-primary-500 transition-all duration-300 relative group cursor-pointer"
                        >
                            {service.badge && (
                                <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    {service.badge}
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <service.icon className="w-full h-full text-white" />
                            </div>

                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                {service.title}
                            </h3>

                            <p className="text-primary-400 text-sm font-semibold mb-4">
                                {service.tagline}
                            </p>

                            <p className="text-gray-300 mb-6 leading-relaxed">
                                {service.desc}
                            </p>

                            <div className="space-y-2 pt-4 border-t border-white/10">
                                {service.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 mb-4">
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

            {/* Simple CTA */}
            <Section className="py-20 bg-gradient-to-br from-primary-950/20 via-purple-950/20 to-primary-950/20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        ¿Tienes dudas?<br />
                        <span className="text-gradient">Hablemos sin compromiso</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Te explicamos todo de forma clara y te damos una cotización personalizada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/contacto" variant="primary" icon={ArrowRight} className="!py-4 !px-8 text-lg">
                            Solicita tu Cotización Gratis
                        </Button>
                        <Button href="/portafolio" variant="glass" className="!py-4 !px-8 text-lg">
                            Ver Trabajos Realizados
                        </Button>
                    </div>
                </div>
            </Section>

            <Footer />
        </div>
    );
};

export default Services;
