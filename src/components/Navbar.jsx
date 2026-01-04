import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-bg/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                <a href="#" className="text-2xl font-bold text-gradient">WebArchitect</a>

                <div className="hidden md:flex items-center gap-8">
                    <NavLink href="#services">Servicios</NavLink>
                    <NavLink href="#work">Portafolio</NavLink>
                    <NavLink href="#about">Sobre Mí</NavLink>
                    <Button href="#contact" variant="primary" className="!py-2 !px-4 text-sm">Hablemos</Button>
                </div>

                {/* Mobile Menu Button Placeholder */}
                <button className="md:hidden text-white">Menu</button>
            </div>
        </motion.nav>
    );
};

const NavLink = ({ href, children }) => (
    <a href={href} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
        {children}
    </a>
);

export default Navbar;
