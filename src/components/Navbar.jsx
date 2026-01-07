import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

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
                    <img src="/logo.png" alt="Logo" className="h-16 w-16 rounded-full object-cover" />
                    <img
                        src="/brand-text-v2.png"
                        alt="Interfaz 360"
                        className="h-10 md:h-12 object-contain"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="/servicios" className={`text-sm font-medium transition-colors ${isActive('/servicios') ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}>Servicios</Link>
                    <Link to="/portafolio" className={`text-sm font-medium transition-colors ${isActive('/portafolio') ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}>Portafolio</Link>
                    <Link to="/nosotros" className={`text-sm font-medium transition-colors ${isActive('/nosotros') ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}>Sobre Mí</Link>
                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Acceso Clientes</Link>
                    <Button href="/contacto" variant="primary" className="!py-2 !px-4 text-sm">Hablemos</Button>
                </div>

                {/* Mobile Menu Button Placeholder */}
                <button className="md:hidden text-white">Menu</button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
