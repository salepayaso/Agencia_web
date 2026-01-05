import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import About from '../components/About';
import Contact from '../components/Contact';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Monitor, Smartphone, Rocket, ArrowRight, Code, Zap, Database, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const LandingPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const services = [
        { icon: Layout, title: "Arquitectura UX/UI", desc: "Diseño premium que convierte. No usamos plantillas, creamos activos digitales únicos." },
        { icon: Database, title: "Sistemas & Apps", desc: "Desarrollo de software a medida: Inventarios, CRMs y Dashboards inteligentes." },
        { icon: Zap, title: "Marketing & Presencia 360", desc: "Google Ads, Meta, Redes Sociales y posicionamiento local en Google Maps (SEO)." },
        { icon: Rocket, title: "E-Commerce", desc: "Tiendas online rápidas y seguras. Vende 24/7 con pagos automatizados." },
    ];

    const projects = [
        { title: "Plataforma Contable CMP", category: "App", type: "app", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["React", "Node.js", "SQL"] },
        { title: "E-Commerce de Lujo", category: "Web Corporativa", type: "web", image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["Next.js", "Stripe"] },
        { title: "Dashboard Financiero", category: "SaaS", type: "app", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["Vue", "Firebase"] },
        { title: "Portal Inmobiliario", category: "Web Corporativa", type: "web", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["React", "Google Maps"] },
        { title: "App de Delivery", category: "App Móvil", type: "app", image: "https://images.unsplash.com/photo-1526304640152-d4619684e484?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["React Native", "AWS"] },
        { title: "Consultora Legal", category: "Web Corporativa", type: "web", image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tags: ["Astro", "Tailwind"] },
    ];

    const filteredProjects = activeCategory === 'all'
        ? projects
        : projects.filter(p => p.type === activeCategory);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden min-h-screen flex items-center">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 mb-6">
                            <Rocket className="w-4 h-4" />
                            <span>Agencia Digital & Software</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Interfaz 360 <br /><span className="text-gradient">Visión Digital.</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-lg">
                            Transformo ideas complejas en ecosistemas digitales robustos. Desde sitios corporativos hasta aplicaciones de software a medida.
                        </p>
                        <div className="flex gap-4">
                            <Button href="#contact" variant="primary" icon={ArrowRight}>Consultoría Gratuita</Button>
                            <Button href="#work" variant="glass">Ver Casos de Estudio</Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden md:block"
                    >
                        {/* Abstract Visual Placeholder */}
                        <div className="relative z-10 glass-card p-6 rounded-3xl transform rotate-6 hover:rotate-0 transition-transform duration-500 border-t border-l border-white/20">
                            <div className="h-64 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                <div className="relative z-10 bg-black/60 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-green-400 font-mono text-sm">git commit -m "feat: new architecture"</span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">React</div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">Node</div>
                                </div>
                                <div className="text-primary-400 text-xs">System ready</div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500 rounded-full blur-2xl opacity-40"></div>
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <Section id="services" className="bg-dark-bg/50">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Servicios Profesionales</h2>
                    <p className="text-gray-400">Soluciones de ingeniería de software y diseño estratégico.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((s, i) => (
                        <Card key={i} hover className="border-t border-white/10">
                            <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-500 mb-6">
                                <s.icon />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* Projects Section */}
            <Section id="work">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Portafolio Selecto</h2>
                        <p className="text-gray-400">Webs corporativas y sistemas complejos de alto impacto.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-lg backdrop-blur-sm">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeCategory === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveCategory('web')}
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeCategory === 'web' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Webs
                        </button>
                        <button
                            onClick={() => setActiveCategory('app')}
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeCategory === 'app' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Apps
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredProjects.map((p, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={p.title}
                                className="group cursor-pointer relative"
                            >
                                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
                                    <div className="absolute inset-0 bg-primary-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />

                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        {p.tags.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase font-bold bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className="text-primary-400 text-xs font-bold uppercase tracking-wider mb-1 inline-block">{p.category}</span>
                                        <h3 className="text-xl font-bold group-hover:text-primary-400 transition-colors">{p.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </Section>

            {/* About Section */}
            <About />

            {/* Contact Section */}
            <Contact />

            <Footer />
        </div>
    );
};

export default LandingPage;
