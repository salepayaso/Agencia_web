import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Contact from '../components/Contact';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
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
