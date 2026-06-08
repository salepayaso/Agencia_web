import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import SEO from '../components/SEO';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary-500/30">
            <SEO
                title="Términos y Condiciones"
                description="Condiciones de uso del sitio y de los servicios ofrecidos por Interfaz 360."
            />
            <Navbar />
            <WhatsAppButton />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Términos y Condiciones</h1>
                    <p className="text-gray-500 text-sm mb-10">Última actualización: junio de 2026</p>

                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Sobre Interfaz 360</h2>
                            <p>
                                Interfaz 360 es un estudio freelance independiente con base en Santiago de Chile,
                                que ofrece servicios de desarrollo web, gestión de Google y automatización con
                                inteligencia artificial. Al navegar este sitio o contratar nuestros servicios,
                                aceptas las condiciones descritas a continuación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Uso del sitio</h2>
                            <p>
                                El contenido de este sitio (textos, imágenes, diseño y código) es propiedad de
                                Interfaz 360, salvo que se indique lo contrario. Puedes navegar y compartir
                                el sitio libremente, pero no está permitido copiar o reutilizar su contenido
                                con fines comerciales sin autorización previa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Sobre los planes y precios</h2>
                            <p>
                                Los planes, servicios y valores publicados en este sitio son referenciales.
                                El alcance final, los plazos y el precio de cada proyecto se definen en una
                                cotización personalizada según las necesidades de cada cliente, y se formalizan
                                antes de iniciar cualquier trabajo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Responsabilidad</h2>
                            <p>
                                Interfaz 360 pone a disposición este sitio y la información que contiene de buena
                                fe y con la mejor intención de orientarte. Sin embargo, no nos hacemos responsables
                                por decisiones tomadas únicamente en base al contenido publicado aquí, ni por
                                fallas ajenas a nuestro control (como interrupciones de hosting, dominios o
                                servicios de terceros).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Servicios contratados</h2>
                            <p>
                                Cada proyecto contratado con Interfaz 360 se rige además por las condiciones
                                específicas acordadas directamente con el cliente (alcance, plazos, garantía y
                                forma de pago), las que prevalecen sobre lo descrito en este sitio en caso de
                                cualquier diferencia.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-2">Contacto</h2>
                            <p>
                                Si tienes dudas sobre estos términos, puedes escribirnos a{' '}
                                <a href="mailto:contacto@interfaz360.cl" className="text-primary-400 hover:underline">
                                    contacto@interfaz360.cl
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsPage;