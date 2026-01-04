import { useState } from 'react';
import Section from './ui/Section';
import Button from './ui/Button';
import { Send, CheckCircle } from 'lucide-react';

const Contact = () => {
    const [formState, setFormState] = useState('idle'); // idle, submitting, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormState('submitting');
        // Simulate network request
        setTimeout(() => {
            setFormState('success');
        }, 1500);
    };

    return (
        <Section id="contact" className="pb-24">
            <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Hablemos de negocios.</h2>
                        <p className="text-gray-400 mb-8">
                            Completa el formulario y nos pondremos en contacto contigo dentro de 24 horas.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary-500">@</div>
                                <span>contacto@webarchitect.cl</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary-500">#</div>
                                <span>+56 9 5414 6176</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {formState === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">¡Mensaje Enviado!</h3>
                                <p className="text-gray-400">Estaremos en contacto pronto.</p>
                                <button
                                    onClick={() => setFormState('idle')}
                                    className="mt-6 text-primary-400 text-sm hover:text-white transition-colors"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                                    <input required type="text" className="w-full bg-dark-bg/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors" placeholder="Juan Pérez" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input required type="email" className="w-full bg-dark-bg/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors" placeholder="juan@ejemplo.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Mensaje</label>
                                    <textarea required rows="4" className="w-full bg-dark-bg/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors" placeholder="Cuéntanos sobre tu proyecto..."></textarea>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={formState === 'submitting'}
                                    icon={formState === 'submitting' ? null : Send}
                                >
                                    {formState === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Contact;
