import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Layout, Rocket, Mail, Zap, Code, ArrowRight, MonitorSmartphone, ShoppingBag, Megaphone, Server, CheckCircle2, Activity, BarChart3, MessageSquare, User, Lock, TrendingUp, Search, MapPin, ShieldCheck, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Services = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: MonitorSmartphone,
            gradient: "from-blue-500 to-indigo-600 shadow-blue-500/20",
            title: "Plan Pyme Digital",
            tagline: "Tu Carta de Presentación Digital",
            desc: "Ideal para emprendedores que necesitan una imagen impecable y aparecer en Google de inmediato.",
            benefits: ["Desarrollo Pagina Web", "2 Correos Corporativos", "Dominio & Hosting 1 año GRATIS", "Google Business + SEO Local", "Tecnología React Alta Interactividad", "Certificado SSL de Seguridad"],
            price: "$250.000",
            whatsappMsg: "Hola Interfaz 360, me interesa contratar el Plan Pyme Digital. ¿Me podrían dar más información?",
            badge: "NUEVO",
            trackingLabel: "Contratar: Plan Pyme Digital"
        },
        {
            icon: Rocket,
            gradient: "from-purple-500 to-pink-600 shadow-purple-500/20",
            title: "Ecosistema Google 360",
            tagline: "El Motor Digital de tu Negocio",
            desc: "Para empresas que buscan mayor potencia, gestión de clientes y una infraestructura Google completa.",
            benefits: ["Desarrollo Pagina Web Multi-Sección", "4 Correos Corporativos", "Dominio & Hosting 1 año GRATIS", "Google Business + SEO Local", "GTM, Analytics & Search Console", "Google Looker Studio (Métricas)", "Perfil de Gestión INTERFAZ 360", "Tecnología React Alta Interactividad", "Certificado SSL de Seguridad"],
            price: "$350.000",
            whatsappMsg: "Hola Interfaz 360, me interesa contratar el Ecosistema Google 360. ¿Me podrían dar más información?",
            trackingLabel: "Contratar: Ecosistema Google 360"
        },
        {
            icon: ShoppingBag,
            gradient: "from-violet-500 to-purple-600 shadow-purple-500/20",
            title: "Tiendas Online",
            tagline: "Vende 24/7 sin límites",
            desc: "Creamos tu tienda online para que vendas en internet las 24 horas. Recibe pagos seguros y administra todo desde tu celular.",
            benefits: ["Acepta pagos con tarjeta", "Control total de inventario", "Tus clientes compran fácil y rápido"],
            price: "Por Cotizar",
            trackingLabel: "Cotizar: Tiendas Online"
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333 .533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.24 2.053-2.08 2.667-5.013 2.667-7.467 0-.747-.053-1.467-.16-2.133H12.48z" />
                </svg>
            ),
            gradient: "from-blue-500 via-red-500 to-yellow-500 shadow-blue-500/20",
            title: "Ecosistema Google & Marketing",
            tagline: "Que te encuentren tus clientes",
            desc: "Potencia tu presencia con Google Search Console, Analytics y Google Maps (Business). Te ayudamos a aparecer primero en Google y atraer más clientes.",
            benefits: ["Tu negocio en Google Maps (Business)", "Métricas reales con Google Analytics", "Posicionamiento SEO Técnico"],
            price: "Por Cotizar",
            trackingLabel: "Cotizar: Ecosistema Google & Marketing"
        },
        {
            icon: Server,
            gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
            title: "Dominios, Correos & Hosting",
            tagline: "Tu identidad digital completa",
            desc: "¿Necesitas un dominio nuevo o ya tienes uno? Gestionamos tu infraestructura cPanel y aseguramos que tu web vuele.",
            benefits: ["Gestión Integral de Dominios", "Correos Profesionales Ilimitados", "Hosting Low-Latency Optimizado"],
            price: "Por Cotizar",
            badge: "SOPORTE",
            trackingLabel: "Cotizar: Dominios Correos & Hosting"
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
                        Servicios Digitales <br className="hidden md:block" />
                        <span className="text-gradient">en Santiago y Todo Chile</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Desde tu primera página web hasta sistemas complejos. <br className="hidden md:block" />
                        <span className="text-white font-medium">Todo en un solo lugar, con soporte local garantizado.</span>
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
                            className="glass-card p-8 rounded-3xl border border-white/10 hover:border-primary-500 transition-all duration-300 relative group flex flex-col h-full"
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

                            <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
                                {service.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                {service.price && (
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-2xl font-bold text-white">{service.price}</span>
                                        {service.price !== "Por Cotizar" && <span className="text-xs text-gray-500">pago único CLP</span>}
                                    </div>
                                )}

                                <Button
                                    href={service.price === "Por Cotizar" ? undefined : `https://wa.me/56954146176?text=${encodeURIComponent(service.whatsappMsg)}`}
                                    target={service.price === "Por Cotizar" ? undefined : "_blank"}
                                    variant={service.price === "Por Cotizar" ? "glass" : "primary"}
                                    className="w-full"
                                    trackingLabel={service.trackingLabel}
                                    onClick={(e) => {
                                        if (service.price === "Por Cotizar") {
                                            navigate('/contacto', { state: { subject: service.title } });
                                        }
                                    }}
                                >
                                    {service.price === "Por Cotizar" ? "Cotizar ahora" : "Contratar"}
                                </Button>
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
