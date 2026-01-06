import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import { Monitor, Smartphone, Rocket, Code, Zap, Database, Layout } from 'lucide-react';

const Services = () => {
    const services = [
        { icon: Layout, title: "Diseño de Páginas Web", desc: "Diseño profesional y único. Tu negocio merece una web que venda, no una plantilla genérica." },
        { icon: Database, title: "Sistemas & Apps", desc: "Desarrollo de software a medida: Inventarios, CRMs y Dashboards inteligentes." },
        { icon: Zap, title: "Marketing & Presencia 360", desc: "Google Ads, Meta, Redes Sociales y posicionamiento local en Google Maps (SEO)." },
        { icon: Rocket, title: "E-Commerce", desc: "Tiendas online rápidas y seguras. Vende 24/7 con pagos automatizados." },
    ];

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <Navbar />
            <WhatsAppButton />

            <Section className="pt-32 pb-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Nuestros Servicios</h1>
                    <p className="text-xl text-gray-400">Soluciones integrales de ingeniería de software y diseño estratégico para llevar tu negocio al siguiente nivel.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {services.map((s, i) => (
                        <Card key={i} hover className="border border-white/10 p-8">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 mb-6">
                                <s.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            <Footer />
        </div>
    );
};

export default Services;
