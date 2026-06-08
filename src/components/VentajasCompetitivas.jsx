import { motion } from 'framer-motion';
import { Search, Users, BarChart3 } from 'lucide-react';
import FlipCard from './FlipCard';

const WA_ASESORIA = `https://wa.me/56954146176?text=${encodeURIComponent('Hola Interfaz360, vengo desde la web y me gustaría solicitar asesoría para un proyecto digital.')}`;

const tarjetas = [
    {
        icon: Search,
        iconColor: '#378ADD',
        iconBg: '#378ADD1A',
        frontTitle: 'Más clientes te encuentran online',
        frontDesc: 'Posicionamos tu negocio en Google y optimizamos tu Google Business Profile para que aparezcas primero cuando alguien busca lo que ofreces.',
        backTitle: 'Tu negocio, visible donde importa',
        backDesc: 'Estrategia SEO local + Google Business Profile optimizado, para que estés entre los primeros resultados cuando alguien busca tu rubro en Chile.',
    },
    {
        icon: Users,
        iconColor: '#1D9E75',
        iconBg: '#1D9E751A',
        frontTitle: 'Entendemos tu negocio, no solo el código',
        frontDesc: 'No llegamos a vender una web — llegamos a entender cómo opera tu negocio, para construir algo que realmente te sirva en el día a día.',
        backTitle: 'Trato directo, sin intermediarios',
        backDesc: 'Hablas con quien construye tu proyecto. Escríbenos por WhatsApp y conversemos sobre tu idea, sin formularios ni intermediarios de por medio.',
        waButton: true,
        waLink: WA_ASESORIA,
    },
    {
        icon: BarChart3,
        iconColor: '#BA7517',
        iconBg: '#BA75171A',
        frontTitle: 'Decisiones con datos reales, no intuición',
        frontDesc: 'Te dejamos viendo qué funciona y qué no — visitas, conversiones, comportamiento — para que tu negocio mejore con información, no con suposiciones.',
        backTitle: 'Tu negocio, medido y entendido',
        backDesc: 'Implementamos Google Analytics 4, Tag Manager y Search Console conectados, para que sepas de dónde vienen tus clientes y cómo convertirlos.',
    },
];

const VentajasCompetitivas = () => {
    return (
        <section className="py-20 px-4 md:px-8 bg-dark-bg relative overflow-hidden">
            <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary-400 mb-4">
                        <span className="font-semibold uppercase tracking-wider">Ventajas Competitivas</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        ¿Por Qué <span className="text-gradient">Elegirnos?</span>
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        No somos una agencia más. Somos tu socio tecnológico integral.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {tarjetas.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <FlipCard {...card} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VentajasCompetitivas;
