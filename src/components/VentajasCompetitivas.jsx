import { motion } from 'framer-motion';
import { Briefcase, MessageCircle, MapPin, BarChart3, ShieldCheck, Code2 } from 'lucide-react';
import FlipCard from './FlipCard';

const WA_ASESORIA = `https://wa.me/56954146176?text=${encodeURIComponent('Hola Interfaz360, vengo desde la web y me gustaría solicitar asesoría para un proyecto digital.')}`;

const tarjetas = [
    {
        icon: Briefcase,
        iconColor: '#378ADD',
        iconBg: '#378ADD1A',
        frontTitle: 'Experiencia real en procesos empresariales',
        frontDesc: 'No solo desarrollamos webs — entendemos cómo funciona un negocio por dentro. Eso hace la diferencia.',
        backTitle: 'Soluciones que se adaptan a tu negocio',
        backDesc: 'Tenemos experiencia directa en logística y procesos empresariales reales. Eso nos permite diseñar soluciones digitales que realmente encajan con cómo opera tu negocio.',
    },
    {
        icon: MessageCircle,
        iconColor: '#1D9E75',
        iconBg: '#1D9E751A',
        frontTitle: 'Respuesta rápida y trato directo',
        frontDesc: 'Hablas directo con el desarrollador. Sin ejecutivos ni intermediarios. Respuesta el mismo día.',
        backTitle: 'Atención real, no un ticket',
        backDesc: 'Soporte por WhatsApp, correo y videollamada. Tiempo de respuesta mismo día hábil. Trato cercano y soluciones concretas sin vueltas.',
        waButton: true,
        waLink: WA_ASESORIA,
    },
    {
        icon: MapPin,
        iconColor: '#D85A30',
        iconBg: '#D85A301A',
        frontTitle: 'Posicionamiento Google en Chile',
        frontDesc: 'SEO local para que aparezcas primero cuando te busquen. Google Business Profile optimizado.',
        backTitle: 'Tu negocio visible en Google',
        backDesc: 'Optimizamos tu Google Business Profile, implementamos estrategia SEO local y te ayudamos a aparecer en los primeros resultados cuando buscan tu rubro en Chile.',
    },
    {
        icon: BarChart3,
        iconColor: '#BA7517',
        iconBg: '#BA75171A',
        frontTitle: 'Ecosistema Google completo',
        frontDesc: 'Analytics, Tag Manager y Google Business para tomar decisiones con datos reales de tu negocio.',
        backTitle: 'Datos que se convierten en clientes',
        backDesc: 'Implementamos Google Analytics 4, Tag Manager y Search Console para que veas de dónde vienen tus clientes, qué buscan y cómo convertirlos. Todo conectado.',
    },
    {
        icon: ShieldCheck,
        iconColor: '#534AB7',
        iconBg: '#534AB71A',
        frontTitle: 'Servidores top + SSL A+',
        frontDesc: 'Infraestructura de alto rendimiento mundial. Certificado SSL A+ y uptime garantizado.',
        backTitle: 'Tu sitio siempre rápido y seguro',
        backDesc: 'Desplegamos en servidores con posicionamiento mundial top tier, certificado SSL A+ verificado y velocidad de carga optimizada. Tu sitio seguro y disponible siempre.',
    },
    {
        icon: Code2,
        iconColor: '#0F6E56',
        iconBg: '#0F6E561A',
        frontTitle: 'Código puro, sin WordPress',
        frontDesc: 'React sin plugins que se rompen. Tu sitio rápido, escalable y actualizable desde GitHub.',
        backTitle: 'Propiedad total de tu sitio',
        backDesc: 'Desarrollamos con React + Vite — sin depender de plugins de terceros que se desactualizan. Tu sitio es tuyo: rápido, seguro y con historial completo de cambios en GitHub.',
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
