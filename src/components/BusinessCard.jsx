
import React from 'react';
import { Download, Globe, Mail, Phone, Share2, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const BusinessCard = () => {
    const contactInfo = {
        name: "Carlos Maturana",
        role: "CEO & Fundador",
        email: "contacto@interfaz360.cl",
        website: "interfaz360.cl",
        fullWebsite: "https://interfaz360.cl",
        vCardData: `BEGIN:VCARD
VERSION:3.0
FN:Carlos Maturana
ORG:Interfaz 360
TITLE:CEO & Fundador
EMAIL:contacto@interfaz360.cl
URL:https://interfaz360.cl
END:VCARD`
    };

    const handleDownloadVCard = () => {
        const blob = new Blob([contactInfo.vCardData], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'carlos-maturana.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Carlos Maturana - Interfaz 360',
                    text: 'Tarjeta Digital de Carlos Maturana',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback for desktop or unsupported browsers
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles!');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-md perspective-1000">
                <div className="glass-card bg-dark-card/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform hover:scale-[1.02] duration-500">

                    {/* Header / Banner */}
                    <div className="h-32 bg-gradient-to-r from-primary-600/20 to-purple-600/20 relative">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-primary-400 to-purple-500 relative group">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-purple-500 blur opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img
                                    src="/logo sin fondo optimizado.png"
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover bg-dark-bg relative z-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-16 pb-8 px-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {contactInfo.name}
                        </h1>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 font-medium mb-6">
                            {contactInfo.role}
                        </p>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <Button
                                onClick={handleDownloadVCard}
                                variant="primary"
                                className="flex items-center justify-center gap-2 py-3 text-sm bg-primary-500/20 border-primary-500/50 hover:bg-primary-500/30"
                            >
                                <Download size={16} />
                                Guardar
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="secondary"
                                className="flex items-center justify-center gap-2 py-3 text-sm border-white/10 hover:bg-white/5"
                            >
                                <Share2 size={16} />
                                Compartir
                            </Button>
                        </div>

                        {/* Info List */}
                        <div className="space-y-4 mb-8 text-left">
                            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 group-hover:text-primary-300 group-hover:scale-110 transition-all">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-gray-200">{contactInfo.email}</p>
                                </div>
                            </a>

                            <a href={contactInfo.fullWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sitio Web</p>
                                    <p className="text-gray-200">{contactInfo.website}</p>
                                </div>
                            </a>
                        </div>

                        {/* Socials */}
                        <div className="flex justify-center gap-6 pt-6 border-t border-white/5">
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] hover:scale-125 transition-all">
                                <Linkedin size={24} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E4405F] hover:scale-125 transition-all">
                                <Instagram size={24} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] hover:scale-125 transition-all">
                                <Facebook size={24} />
                            </a>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="bg-white/5 py-3 text-center">
                        <Link to="/" className="text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center justify-center gap-1">
                            Powered by Interfaz 360
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessCard;
