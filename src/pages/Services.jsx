import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Layout, Rocket, Mail, Zap, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Services = () => {
    const services = [
        {
            icon: Layout,
            emoji: "🎨",
            title: "Páginas Web Profesionales",
            tagline: "Tu negocio merece destacar",
            desc: "Diseñamos sitios web únicos que atraen clientes y generan ventas. Rápidos, seguros y fáciles de administrar.",
            benefits: ["Diseño único para tu marca", "Se ve perfecto en móvil y computadora", "Fácil de actualizar"],
        },
        {
            icon: Rocket,
            emoji: "🛒",
            title: "Tiendas Online",
            tagline: "Vende 24/7 sin límites",
            desc: "Creamos tu tienda online para que vendas en internet las 24 horas. Recibe pagos seguros y administra todo desde tu celular.",
            benefits: ["Acepta pagos con tarjeta", "Control total de inventario", "Tus clientes compran fácil y rápido"],
        },
        {
            icon: Zap,
            emoji: "📢",
            title: "Marketing Digital",
            tagline: "Que te encuentren tus clientes",
            desc: "Te ayudamos a aparecer primero en Google y atraer más clientes con publicidad en redes sociales.",
            benefits: ["Tu negocio en Google Maps", "Campañas de Facebook e Instagram", "Más visitas, más ventas"],
        },
        {
            icon: Mail,
            emoji: "🌐",
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

                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                {service.emoji}
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

            {/* Client Dashboard Section */}
            <Section className="py-20 bg-gradient-to-b from-primary-950/10 to-dark-bg border-y border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm text-primary-400 mb-6">
                                <span className="font-semibold">Exclusivo para Nuestros Clientes</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Tu Panel de <span className="text-gradient">Control Personal</span>
                            </h2>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                Todos nuestros clientes tienen acceso a un panel exclusivo donde pueden ver y gestionar sus servicios activos las 24 horas.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "📊 Estado de tus servicios en tiempo real",
                                    "📈 Métricas de visitas y rendimiento de tu web",
                                    "📧 Gestión de correos corporativos",
                                    "🎫 Soporte técnico directo desde el panel"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-gray-300">
                                        <div className="text-xl">{feature.split(' ')[0]}</div>
                                        <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Button href="/login" variant="glass" className="!py-3 !px-6">
                                    Acceso Clientes
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="glass-card p-6 rounded-3xl border border-white/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                                            <span className="text-2xl">👤</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Panel de Cliente</p>
                                            <p className="text-sm text-gray-400">Acceso 24/7</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-dark-bg/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-400">Sitio Web</span>
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>
                                            </div>
                                            <p className="font-semibold">www.tunegocio.com</p>
                                        </div>

                                        <div className="bg-dark-bg/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-400">Correos</span>
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>
                                            </div>
                                            <p className="font-semibold">5 cuentas configuradas</p>
                                        </div>

                                        <div className="bg-dark-bg/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-400">Visitas este mes</span>
                                                <span className="text-primary-400 font-bold">↗ +24%</span>
                                            </div>
                                            <p className="font-semibold">1,247 visitantes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                        </motion.div>
                    </div>
                </div>
            </Section>

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
