import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import About from '../components/About';
import SEO from '../components/SEO';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <SEO
                title="Especialistas en Infraestructura Digital"
                description="Conoce al equipo de Interfaz 360. Expertos en desarrollo web, SEO y ecosistema Google, dedicados a transformar negocios en Chile."
            />
            <Navbar />
            <WhatsAppButton />

            <div className="pt-20">
                <About />
            </div>

            <Footer />
        </div>
    );
};

export default AboutPage;
