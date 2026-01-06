import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Portfolio = () => {
    const [activeCategory, setActiveCategory] = useState('all');

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

            <Section className="pt-32 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4 md:px-0">
                    <div>
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <span className="h-px w-8 bg-primary-400"></span>
                            <span className="text-xs uppercase tracking-widest font-bold">Portafolio</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">Casos de Éxito</h1>
                        <p className="text-gray-400 max-w-md">Descubre cómo potenciamos empresas con tecnología de punta.</p>
                    </div>

                    {/* Filter Pills */}
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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
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
                                    <div className="absolute inset-0 bg-gray-900">
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 transition-opacity"></div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                                        {p.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
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

            <Footer />
        </div>
    );
};

export default Portfolio;
