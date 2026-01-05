import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import About from '../components/About';
import Contact from '../components/Contact';
import WhatsAppButton from '../components/WhatsAppButton';
import Brands from '../components/Brands';
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
        {
            title: "SupplyTech Inventarios",
            category: "SaaS / Sistema a Medida",
            type: "app",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["React", "Supabase", "Stock Control"]
        },
        {
            title: "Portal Clientes Interfaz 360",
            category: "CRM & Dashboard",
            type: "app",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["React", "Auth", "Security"]
        },
        {
            title: "Contabilidad CMP",
            category: "Web Corporativa",
            type: "web",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["SEO", "Conversion", "Design"]
        },
        {
            title: "E-Commerce Luxury",
            category: "Tienda Online",
            type: "web",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["Stripe", "Next.js", "Sales"]
        },
        {
            title: "Campañas Google Ads",
            category: "Marketing & Performance",
            type: "web",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["ROAS", "Leads", "Analytics"]
        },
        {
            title: "SEO Local & Maps",
            category: "Google Business",
            type: "web",
            image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tags: ["Maps", "Reviews", "Growth"]
        },
    ];

    const filteredProjects = activeCategory === 'all'
        ? projects
        : projects.filter(p => p.type === activeCategory);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section - Unchanged */}
            <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden min-h-screen flex items-center">
                {/* Background Gradients... */}
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
                        {/* Abstract Visual Placeholder - Unchanged */}
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

            <Brands />

            {/* Services Section - Unchanged */}
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

            {/* Projects Section - REDESIGNED */}
            <Section id="work">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <span className="h-px w-8 bg-primary-400"></span>
                            <span className="text-xs uppercase tracking-widest font-bold">Portafolio</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Casos de Éxito</h2>
                        <p className="text-gray-400 max-w-md">Descubre cómo potenciamos empresas con tecnología de punta.</p>
                    </div>

                    {/* Elegant Filter Pills */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-full backdrop-blur-sm border border-white/5">
                        {['all', 'web', 'app'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat === 'all' ? 'Todo' : cat === 'web' ? 'Web' : 'Apps'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredProjects.map((p, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                key={p.title}
                                className="group cursor-pointer"
                            >
                                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-5 border border-white/5 bg-gray-900 shadow-2xl">
                                    {/* Image with subtle zoom on hover */}
                                    <div className="absolute inset-0 bg-gray-900">
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                        />
                                    </div>

                                    {/* Dark Gradient Overlay - Always visible for readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 transition-opacity"></div>

                                    {/* Floating Tags */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                                        {p.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Content inside image (bottom) */}
                                    <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-2 opacity-80">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{p.category}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-primary-300 transition-colors leading-tight">
                                            {p.title}
                                        </h3>
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
