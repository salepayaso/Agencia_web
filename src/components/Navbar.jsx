import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { Lock, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Helper to determine if link is active
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-dark-bg/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 relative z-50">
                        <img src="/logo sin fondo optimizado.png" alt="Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" />
                        <img
                            src="/brand-text-v2.png"
                            alt="Interfaz 360"
                            className="h-8 md:h-12 object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Servicios', 'Portafolio', 'Nosotros'].map((item) => {
                            const path = `/${item.toLowerCase().replace(' ', '-')}`;
                            const active = isActive(path);
                            return (
                                <Link
                                    key={item}
                                    to={path}
                                    className={`text-xs uppercase tracking-widest font-semibold transition-all duration-300 relative group ${active ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {item}
                                    <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-primary-400 transform origin-left transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
                                </Link>
                            );
                        })}

                        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

                        <Link to="/login" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-all px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm group">
                            <Lock className="w-3 h-3 text-primary-400 group-hover:text-white transition-colors" />
                            <span>Clientes</span>
                        </Link>

                        <Button href="/contacto" variant="primary" className="!py-2.5 !px-6 text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">Hablemos</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative z-50 p-2 text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Menu"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay - Movido fuera del nav para evitar transform constraints */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-dark-bg/98 backdrop-blur-md z-40 md:hidden flex flex-col justify-center items-center overflow-hidden h-screen"
                    >
                        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm pt-24">
                            {['Inicio', 'Servicios', 'Portafolio', 'Nosotros'].map((item, i) => {
                                const path = item === 'Inicio' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                                const active = isActive(path);
                                return (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="w-full text-center"
                                    >
                                        <Link
                                            to={path}
                                            className={`text-2xl font-bold uppercase tracking-wider block py-2 ${active ? 'text-primary-400' : 'text-gray-400'}`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item}
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="w-full space-y-4 pt-8 border-t border-white/10 mt-4"
                            >
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-300 bg-white/5 border border-white/5 py-4 rounded-xl w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Lock size={16} />
                                    Portal Clientes
                                </Link>
                                <Button
                                    href="/contacto"
                                    variant="primary"
                                    className="w-full justify-center !py-4 !text-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Hablemos
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
