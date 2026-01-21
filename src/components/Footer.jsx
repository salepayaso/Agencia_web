import { Facebook, Instagram, Linkedin } from 'lucide-react';

import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="relative bg-dark-bg border-t border-white/5 py-16 px-4 md:px-8 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                                <img src="/logo sin fondo optimizado.png" alt="Logo" className="h-14 w-14 rounded-full object-cover relative z-10 border border-white/10" />
                            </div>
                            <img
                                src="/brand-text-v2.png"
                                alt="Interfaz 360"
                                className="h-10 object-contain"
                            />
                        </div>
                        <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                            Transformando marcas con experiencias digitales <span className="text-primary-400 font-medium">premium</span>.
                            Potenciamos tu negocio con tecnología de vanguardia y diseño estratégico.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Navegación
                        </h4>
                        <ul className="space-y-4 text-gray-400">
                            <li>
                                <Link to="/" className="flex items-center gap-2 hover:text-primary-400 transition-colors group">
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-primary-400 transition-all"></span>
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/servicios" className="flex items-center gap-2 hover:text-primary-400 transition-colors group">
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-primary-400 transition-all"></span>
                                    Servicios
                                </Link>
                            </li>
                            <li>
                                <Link to="/portafolio" className="flex items-center gap-2 hover:text-primary-400 transition-colors group">
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-primary-400 transition-all"></span>
                                    Portafolio
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            Conectar
                        </h4>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:text-[#1877F2] transition-all duration-300"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#E4405F]/10 hover:border-[#E4405F]/50 hover:text-[#E4405F] transition-all duration-300"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50 hover:text-[#0A66C2] transition-all duration-300"
                            >
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Interfaz 360. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
