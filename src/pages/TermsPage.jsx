import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAgent from '../components/ChatAgent';
import SEO from '../components/SEO';
import { EMPRESA, LEGAL_ACTUALIZADO, pendiente } from '../data/empresa';

const Correo = () => <a href={`mailto:${EMPRESA.correoDatos}`}>{EMPRESA.correoDatos}</a>;

const TermsPage = () => {
    return (
        <div className="tc-page">
            <SEO
                title="Términos y Condiciones"
                description="Condiciones de uso del sitio y de los servicios de Interfaz 360: cotizaciones, pagos, dominios, hosting, propiedad del trabajo, garantía y soporte."
            />
            <Navbar />
            <ChatAgent />

            <main className="tc">
            <div className="page-head gutter" style={{ paddingBottom: 40 }}>
                <div className="max" style={{ display: 'block' }}>
                    <span className="eyebrow">Legal</span>
                    <h1 className="display" style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}>Términos y Condiciones</h1>
                    <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>Última actualización: {LEGAL_ACTUALIZADO}</p>

                    </div>
            </div>
            <div className="s gutter" style={{ paddingTop: 48 }}>
                <div className="max">
                    <div className="legal-text">
                        <section>
                            <h2>Quiénes somos</h2>
                            <p>
                                {EMPRESA.marca} es la marca de {pendiente(EMPRESA.razonSocial, 'Razón social')},
                                RUT {pendiente(EMPRESA.rut, 'RUT')}, con domicilio en {pendiente(EMPRESA.domicilio, 'Domicilio')}.
                                Somos un equipo chileno que ofrece desarrollo web, gestión de Google, hosting, correos,
                                dominios y automatización con inteligencia artificial. Al usar este sitio o contratar
                                nuestros servicios aceptas estas condiciones.
                            </p>
                        </section>

                        <section>
                            <h2>Uso del sitio</h2>
                            <p>
                                Los textos, imágenes, diseño y código de este sitio son nuestros, salvo que se indique
                                lo contrario. Puedes navegarlo y compartirlo, pero no copiar ni reutilizar su contenido con
                                fines comerciales sin autorización. No está permitido usar el sitio, el chat o los formularios
                                para enviar spam, intentar vulnerarlos o sobrecargarlos.
                            </p>
                        </section>

                        <section>
                            <h2>Precios y cotizaciones</h2>
                            <ul>
                                <li>Los precios están en pesos chilenos y son netos: se les suma el IVA (19 %).</li>
                                <li>
                                    Los <strong>dominios, el hosting y el pack</strong> tienen precio fijo publicado y se
                                    contratan directamente desde el sitio o el portal.
                                </li>
                                <li>
                                    Los <strong>sitios web, tiendas, sistemas y asistentes de IA</strong> se cotizan. La
                                    cotización indica el alcance, los plazos, las rondas de ajustes, la garantía y su validez.
                                    Lo que no está en la cotización se cotiza aparte.
                                </li>
                                <li>
                                    Los valores publicados en el sitio son referenciales hasta que se confirma la cotización
                                    o el pedido. Lo que digan el chat o sus respuestas automáticas también es referencial:
                                    rige lo que confirmemos por escrito.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>Pagos</h2>
                            <ul>
                                <li>
                                    <strong>Proyectos cotizados:</strong> 50 % al aceptar la cotización y 50 % al
                                    publicar, salvo que la cotización diga otra cosa.
                                </li>
                                <li>
                                    <strong>Dominios, hosting y pack:</strong> se pagan por adelantado y se activan cuando
                                    el pago está confirmado. Nunca registramos un dominio sin pago recibido.
                                </li>
                                <li>
                                    <strong>Mensualidades</strong> (por ejemplo, asistentes de IA): se pagan por período
                                    adelantado.
                                </li>
                                <li>Medios disponibles: transferencia bancaria y tarjeta de débito o crédito vía Webpay (Transbank) y Mercado Pago, según se muestre al pagar.</li>
                                <li>
                                    Si el dominio no se renueva y paga en su fecha de vencimiento, se suspende ese mismo día.
                                    Puedes reactivarlo desde tu portal (o escribiéndonos) pagando la renovación.
                                </li>
                                <li>
                                    Si otro servicio recurrente queda impago, te avisaremos y, pasados 15 días desde el aviso,
                                    podremos suspenderlo hasta regularizarlo. No borramos nada por atraso sin avisarte antes.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>Derecho de retracto</h2>
                            <p>
                                De acuerdo con el artículo 3 bis de la Ley N.º 19.496, no aplica el derecho de retracto a
                                los servicios hechos a la medida del cliente (diseño y desarrollo según su cotización) ni a
                                los dominios una vez registrados, porque el registro no se puede deshacer. Si pagaste un
                                servicio que aún no empezamos, escríbenos y lo resolvemos.
                            </p>
                        </section>

                        <section>
                            <h2>Cómo trabajamos un proyecto</h2>
                            <ul>
                                <li>
                                    Para cumplir los plazos necesitamos que nos entregues a tiempo la información, accesos y
                                    aprobaciones que pidamos. Si no tienes logo, fotos o textos, te ayudamos a crearlos según
                                    lo indicado en la cotización.
                                </li>
                                <li>
                                    Las rondas de ajustes incluidas están en la cotización. Cambios de alcance después de
                                    aprobado el diseño se cotizan aparte.
                                </li>
                                <li>
                                    Sabemos que tu tiempo es limitado. Si el proyecto se detiene porque necesitamos algo de
                                    tu parte, lo dejamos en pausa y lo retomamos cuando puedas; los plazos se cuentan desde
                                    que recibimos lo que falta.
                                </li>
                                <li>
                                    No reparamos ni modificamos sitios hechos por terceros. En esos casos te ofrecemos un
                                    sitio nuevo.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>Propiedad del trabajo</h2>
                            <p>
                                Una vez pagado el total, el contenido, el diseño y el código hecho para tu proyecto son
                                tuyos. Conservamos el derecho de reutilizar nuestras herramientas, componentes y
                                conocimientos generales en otros proyectos, y de mostrar el trabajo en nuestro portafolio,
                                salvo que nos pidas lo contrario. Tú respondes por los textos, imágenes y marcas que nos
                                entregues: deben ser tuyos o tener permiso para usarlos.
                            </p>
                        </section>

                        <section>
                            <h2>Dominios</h2>
                            <ul>
                                <li>
                                    <strong>Dominio comprado por el sitio o el portal:</strong> se registra ante NIC Chile a
                                    nombre del cliente como titular, con los datos que nos entregue. El cliente responde por
                                    que esos datos sean correctos. Los cambios de DNS los hacemos sin costo cuando los pides
                                    con un ticket de soporte desde el portal.
                                </li>
                                <li>
                                    <strong>Dominio incluido gratis por 1 año en un plan de sitio web:</strong> queda
                                    registrado a nombre de {EMPRESA.marca} y lo administramos nosotros mientras dure el
                                    servicio.
                                </li>
                                <li>
                                    Te avisaremos antes del vencimiento. La renovación se hace cuando el pago está confirmado;
                                    si no se renueva a tiempo, el dominio se suspende y puede llegar a quedar disponible para
                                    terceros.
                                </li>
                                <li>
                                    Si decides llevarte tu dominio a otro proveedor, te ayudamos con el traspaso según la
                                    tarifa vigente que te informemos antes.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>Hosting y correos</h2>
                            <ul>
                                <li>
                                    El hosting incluye las características del plan contratado (espacio, cuentas de correo,
                                    bases de datos). Lo presta un proveedor externo que nosotros administramos.
                                </li>
                                <li>
                                    Recibes acceso completo a tu panel. Los cambios que hagas directamente ahí son de tu
                                    responsabilidad.
                                </li>
                                <li>
                                    No está permitido usar el hosting o los correos para spam, phishing, malware, contenido
                                    ilegal o que infrinja derechos de terceros. Si ocurre, podemos suspender el servicio de
                                    inmediato para proteger a los demás clientes.
                                </li>
                                <li>
                                    El proveedor realiza respaldos, pero te recomendamos mantener tus propias copias de la
                                    información importante.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>Asistentes de inteligencia artificial</h2>
                            <p>
                                Los asistentes de IA que instalamos responden a partir de la información que nos entregas y
                                pueden equivocarse. Te recomendamos revisar periódicamente sus conversaciones y avisarnos para
                                corregir lo que haga falta. El asistente no debe usarse para decisiones que requieran a un
                                profesional (salud, legal, financiero) sin supervisión humana.
                            </p>
                        </section>

                        <section>
                            <h2>Garantía y soporte</h2>
                            <p>
                                Cada proyecto tiene la garantía indicada en su cotización, que cubre errores de lo que
                                desarrollamos. No cubre cambios hechos por el cliente o por terceros, ni fallas de servicios
                                externos. El soporte se solicita desde el portal de clientes, por correo o por WhatsApp.
                            </p>
                        </section>

                        <section>
                            <h2>Disponibilidad y responsabilidad</h2>
                            <p>
                                Trabajamos para que los sitios y servicios estén disponibles siempre, pero ningún servicio en
                                internet funciona el 100 % del tiempo. No respondemos por interrupciones de proveedores
                                externos (hosting, NIC Chile, Google, medios de pago, servicios de IA) ni por pérdidas
                                indirectas, como lucro cesante. En la medida que la ley lo permita, nuestra responsabilidad
                                total por un servicio se limita a lo que pagaste por él en los últimos 12 meses. Nada de esto
                                limita los derechos que te otorga la Ley de Protección de los Derechos de los Consumidores.
                            </p>
                        </section>

                        <section>
                            <h2>Datos personales</h2>
                            <p>
                                Cómo tratamos tus datos está en la <Link to="/privacidad">Política de Privacidad</Link>.
                                Cuando alojamos tu sitio o administramos sistemas con datos de tus propios clientes, los
                                tratamos por encargo tuyo y solo para prestarte el servicio. Si lo necesitas, firmamos
                                contigo un contrato de encargo de tratamiento de datos.
                            </p>
                        </section>

                        <section>
                            <h2>Término del servicio</h2>
                            <p>
                                Puedes dejar de renovar cualquier servicio recurrente avisando antes del siguiente período.
                                Al terminar, te entregamos lo que es tuyo (archivos del sitio, contenido y el traspaso del
                                dominio) y eliminamos tus datos según los plazos de la Política de Privacidad.
                            </p>
                        </section>

                        <section>
                            <h2>Cambios, ley aplicable y contacto</h2>
                            <p>
                                Podemos actualizar estos términos. Los cambios no afectan los servicios ya contratados
                                durante el período pagado, salvo que lo aceptes. Estos términos se rigen por la ley chilena.
                                Lo acordado por escrito en una cotización o contrato prevalece sobre lo que dice esta página.
                                Dudas: <Correo />.
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

export default TermsPage;
