import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAgent from '../components/ChatAgent';
import About from '../components/About';
import SEO from '../components/SEO';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <SEO
                title="Nosotros"
                description="Conoce Interfaz 360: primero entendemos tu negocio y después lo construimos. Trato directo, propuesta con precio cerrado y acompañamiento después de la entrega."
            />
            <Navbar />
            <ChatAgent />

            <div className="pt-20">
                <About />
            </div>

            <Footer />
        </div>
    );
};

export default AboutPage;
