import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Contact from '../components/Contact';
import SEO from '../components/SEO';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <SEO
                title="Contacto y Consultoría"
                description="Contáctanos hoy mismo para una consultoría gratuita de 30 minutos y transforma tu presencia digital con tecnología de punta."
            />
            <Navbar />
            <WhatsAppButton />

            <div className="pt-20">
                <Contact />
            </div>

            <Footer />
        </div>
    );
};

export default ContactPage;
