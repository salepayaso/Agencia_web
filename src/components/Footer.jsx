import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-card border-t border-white/5 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/logo.png" alt="Logo" className="h-16 w-16 rounded-full object-cover" />
                        <h2 className="text-2xl font-bold text-gradient">Interfaz 360</h2>
                    </div>
                    <p className="text-gray-400 max-w-xs">
                        Transformando marcas con experiencias digitales premium.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Enlaces</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-primary-500 transition-colors">Inicio</a></li>
                        <li><a href="#services" className="hover:text-primary-500 transition-colors">Servicios</a></li>
                        <li><a href="#work" className="hover:text-primary-500 transition-colors">Portafolio</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Conectar</h4>
                    <div className="flex gap-4 text-gray-400">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors"><Facebook size={24} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors"><Instagram size={24} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors"><Linkedin size={24} /></a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Interfaz 360. Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
