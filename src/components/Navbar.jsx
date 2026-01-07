import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { Lock } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper to determine if link is active
    const isActive = (path) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-bg/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                    <img
                        src="/brand-text-v2.png"
                        alt="Interfaz 360"
                        className="h-10 md:h-12 object-contain"
                    />
                </Link>

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

                {/* Mobile Menu Button Placeholder */}
                <button className="md:hidden text-white">Menu</button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
