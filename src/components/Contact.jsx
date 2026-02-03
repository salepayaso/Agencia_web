import { useState, useEffect } from 'react';
import Section from './ui/Section';
import Button from './ui/Button';
import { Send, CheckCircle, Instagram, Facebook, Linkedin } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Contact = () => {
    const [formState, setFormState] = useState('idle'); // idle, submitting, success
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.subject) {
            setMessage(`Hola, estoy interesado en contratar el servicio de ${location.state.subject}.\n\nMe gustaría saber más detalles y cotizar este servicio.`);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('submitting');

        const formData = new FormData(e.target);

        try {
            const response = await fetch("https://formspree.io/f/mojvoerb", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setFormState('success');
                e.target.reset();
                setMessage(''); // Reset message state too
            } else {
                console.error("Form error:", response);
                alert("Hubo un error al enviar el mensaje. Por favor intenta nuevamente.");
                setFormState('idle');
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Hubo un error al enviar el mensaje. Por favor revisa tu conexión.");
            setFormState('idle');
        }
    };

    return (
        <Section id="contact" className="pb-24">
            <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <div className="glass-card rounded-3xl p-8 md:p-12 overflow-hidden relative border border-white/5 bg-dark-card/80 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    Hablemos de negocios.
                                </h2>
                                <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                                    Completa el formulario y nos pondremos en contacto contigo dentro de 24 horas.
                                </p>

                                <div className="space-y-8">
                                    <blockquote className="text-2xl font-light italic text-gray-300 border-l-4 border-primary-500 pl-6 py-2">
                                        "La innovación distingue a los líderes de los seguidores. Transformemos hoy tu visión en una realidad digital."
                                    </blockquote>

                                    <div className="flex items-center gap-3 text-primary-400">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="text-sm font-medium tracking-wide uppercase">Sistema de Atención Activo 24/7</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Síguenos en redes</h4>
                                <div className="flex gap-4">
                                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white hover:scale-110 hover:-rotate-3 transition-all duration-300 group/social">
                                        <Instagram className="text-gray-300 group-hover/social:text-white" size={24} />
                                    </a>
                                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-[#1877F2] hover:text-white hover:scale-110 hover:-rotate-3 transition-all duration-300 group/social">
                                        <Facebook className="text-gray-300 group-hover/social:text-white" size={24} />
                                    </a>
                                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-[#0A66C2] hover:text-white hover:scale-110 hover:-rotate-3 transition-all duration-300 group/social">
                                        <Linkedin className="text-gray-300 group-hover/social:text-white" size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="relative bg-white/5 rounded-2xl p-6 md:p-8 border border-white/5">
                            {formState === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
                                    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3 text-white">¡Mensaje Enviado!</h3>
                                    <p className="text-gray-300 text-lg">Estaremos en contacto pronto.</p>
                                    <button
                                        onClick={() => setFormState('idle')}
                                        className="mt-8 px-6 py-2 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                                    >
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Nombre</label>
                                        <input
                                            required
                                            name="name"
                                            type="text"
                                            className="w-full bg-dark-bg/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Email</label>
                                        <input
                                            required
                                            name="email"
                                            type="email"
                                            className="w-full bg-dark-bg/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                                            placeholder="juan@ejemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Mensaje</label>
                                        <textarea
                                            required
                                            name="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows="4"
                                            className="w-full bg-dark-bg/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 resize-none"
                                            placeholder="Cuéntanos sobre tu proyecto..."
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-dark-bg/30 rounded-xl border border-white/5">
                                        <input
                                            type="checkbox"
                                            required
                                            id="bot-check"
                                            className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500/50 bg-dark-bg"
                                        />
                                        <label htmlFor="bot-check" className="text-sm text-gray-300 cursor-pointer select-none">
                                            Soy humano (Verificación de seguridad)
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-4 text-lg font-medium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1"
                                        disabled={formState === 'submitting'}
                                        icon={formState === 'submitting' ? null : Send}
                                    >
                                        {formState === 'submitting' ? 'Enviando...' : 'Quiero mi asesoría gratuita'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Contact;
