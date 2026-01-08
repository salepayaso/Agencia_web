import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowUpRight, Code, Layout, ShoppingBag, BarChart3, Search, Database } from 'lucide-react';

const Portfolio = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    // Mapped Dedicated Images
    const projects = [
        {
            title: "Sistema de Inventarios",
            category: "SaaS / Sistema a Medida",
            type: "app",
            image: "/portfolio_supplytech_inventory.png",
            tags: ["React", "Supabase", "Stock Control"],
            icon: Database
        },
        {
            title: "Portal de Clientes",
            category: "CRM & Dashboard",
            type: "app",
            image: "/portfolio_interfaz360_crm.png",
            tags: ["React", "Auth", "Security"],
            icon: Layout
        },
        {
            title: "Contabilidad CMP",
            category: "Web Corporativa",
            type: "web",
            image: "/portfolio_cmp_accounting.png",
            tags: ["SEO", "Conversion", "Design"],
            icon: BarChart3
        },
        {
            title: "E-Commerce Luxury",
            category: "Tienda Online",
            type: "web",
            image: "/portfolio_ecommerce_luxury_human.png",
            tags: ["Stripe", "Next.js", "Sales"],
            icon: ShoppingBag
        },
        {
            title: "Campañas Google Ads",
            category: "Marketing & Performance",
            type: "web",
            image: "/portfolio_google_ads.png",
            tags: ["ROAS", "Leads", "Analytics"],
            icon: BarChart3
        },
        {
            title: "SEO Local & Maps",
            category: "Google Business",
            type: "web",
            image: "/portfolio_seo_maps_human.png",
            tags: ["Maps", "Reviews", "Growth"],
            icon: Search
        },
    ];

    const filteredProjects = activeCategory === 'all'
        ? projects
        : projects.filter(p => p.type === activeCategory);

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <Navbar />
            <WhatsAppButton />

            <Section className="pt-32 pb-20 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4 md:px-0">
                    <div>
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <span className="h-px w-8 bg-primary-400"></span>
                            <span className="text-xs uppercase tracking-widest font-bold">Portafolio</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Casos de Éxito</span>
                        </h1>
                        <p className="text-gray-400 max-w-md">Descubre cómo potenciamos empresas con tecnología de punta y diseño de vanguardia.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="p-1.5 bg-white/5 rounded-full backdrop-blur-md border border-white/10 flex gap-1">
                        {['all', 'web', 'app'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden ${activeCategory === cat
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {activeCategory === cat && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{cat === 'all' ? 'Ver Todo' : cat === 'web' ? 'Websites' : 'Apps & Sistemas'}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
                    <AnimatePresence mode='popLayout'>
                        {filteredProjects.map((p, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                key={p.title}
                                className="group relative"
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-dark-card shadow-2xl transition-all duration-700 hover:shadow-primary-500/20 hover:border-primary-500/50">
                                    {/* Image with Overlay */}
                                    <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                                        />
                                    </div>

                                    {/* Gradient Overlay - Slower transition */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>

                                    {/* Content - Slower transitions */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-500">
                                                    <p.icon size={20} />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {p.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-500">
                                                {p.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-6 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-700 delay-100 ease-out">
                                                Solución digital enfocada en {p.category.toLowerCase()}.
                                            </p>

                                            <button className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 hover:text-primary-400">
                                                Ver Proyecto <ArrowUpRight size={16} />
                                            </button>
                                        </div>
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
