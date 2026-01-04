import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-card border-t border-white/5 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-2xl font-bold text-gradient mb-4">Agencia.</h2>
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
                        <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Agencia Web. Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
