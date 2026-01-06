import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Brands from '../components/Brands';
import Button from '../components/ui/Button';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
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
                        {/* Visual Placeholder */}
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

            {/* Quick Teasers using existing components or simple sections could go here, 
                but for now we'll stick to a clean entry point. */}

            <Footer />
        </div>
    );
};

export default Home;
