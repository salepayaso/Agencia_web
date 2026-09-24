import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAgent from '../components/ChatAgent';
import SEO from '../components/SEO';

const PrivacyPage = () => {
    return (
        <div className="tc-page">
            <SEO
                title="Política de Privacidad"
                description="Cómo Interfaz 360 recolecta, usa y protege tus datos personales."
            />
            <Navbar />
            <ChatAgent />

            <main className="tc">
            <div className="page-head gutter" style={{ paddingBottom: 40 }}>
                <div className="max" style={{ display: 'block' }}>
                    <span className="eyebrow">Legal</span>
                    <h1 className="display" style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}>Política de Privacidad</h1>
                    <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>Última actualización: junio de 2026</p>

                    </div>
            </div>
            <div className="s gutter" style={{ paddingTop: 48 }}>
                <div className="max">
                    <div className="legal-text">
                        <section>
                            <h2>¿Quién recibe tus datos?</h2>
                            <p>
                                Interfaz 360 es un estudio freelance independiente que presta servicios de
                                desarrollo web, gestión de Google y automatización con IA en Chile.
                                No existen terceros ni equipos externos: los datos que nos compartes los
                                recibimos y administramos directamente nosotros.
                            </p>
                        </section>

                        <section>
                            <h2>Qué información recolectamos</h2>
                            <p>
                                Solo recolectamos los datos que tú decides entregarnos voluntariamente, por ejemplo
                                a través del formulario de contacto o por WhatsApp: tu nombre, correo electrónico,
                                teléfono y el mensaje o consulta que nos envías.
                            </p>
                        </section>

                        <section>
                            <h2>Para qué usamos tus datos</h2>
                            <p>
                                Usamos esta información exclusivamente para responder tu consulta, preparar una
                                cotización o coordinar un proyecto contigo. No utilizamos tus datos con fines
                                publicitarios ni los cedemos, vendemos o compartimos con terceros.
                            </p>
                        </section>

                        <section>
                            <h2>Cómo protegemos tu información</h2>
                            <p>
                                Tus datos se almacenan en plataformas con estándares de seguridad reconocidos
                                (como Supabase) y solo son accesibles por nuestro equipo. No se guardan datos
                                sensibles ni de pago en este sitio web.
                            </p>
                        </section>

                        <section>
                            <h2>Tus derechos</h2>
                            <p>
                                De acuerdo con la Ley N.º 19.628 sobre Protección de la Vida Privada, puedes
                                solicitar en cualquier momento que actualicemos o eliminemos tus datos personales.
                                Para ejercer este derecho, escríbenos a{' '}
                                <a href="mailto:contacto@interfaz360.cl">
                                    contacto@interfaz360.cl
                                </a>.
                            </p>
                        </section>

                        <section>
                            <h2>Cambios a esta política</h2>
                            <p>
                                Esta política puede actualizarse a medida que el sitio o los servicios evolucionen.
                                Cualquier cambio relevante será publicado en esta misma página.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;