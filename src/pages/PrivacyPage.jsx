import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAgent from '../components/ChatAgent';
import SEO from '../components/SEO';
import { EMPRESA, LEGAL_ACTUALIZADO, pendiente } from '../data/empresa';

const Correo = () => <a href={`mailto:${EMPRESA.correoDatos}`}>{EMPRESA.correoDatos}</a>;

const PrivacyPage = () => {
    return (
        <div className="tc-page">
            <SEO
                title="Política de Privacidad"
                description="Qué datos personales recibe Interfaz 360, para qué los usa, con quién los comparte, cuánto tiempo los guarda y cómo ejercer tus derechos según la Ley 21.719."
            />
            <Navbar />
            <ChatAgent />

            <main className="tc">
            <div className="page-head gutter" style={{ paddingBottom: 40 }}>
                <div className="max" style={{ display: 'block' }}>
                    <span className="eyebrow">Legal</span>
                    <h1 className="display" style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}>Política de Privacidad</h1>
                    <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>Última actualización: {LEGAL_ACTUALIZADO}</p>

                    </div>
            </div>
            <div className="s gutter" style={{ paddingTop: 48 }}>
                <div className="max">
                    <div className="legal-text">
                        <section>
                            <h2>En corto</h2>
                            <ul>
                                <li>Pedimos solo los datos que necesitamos para responderte o prestarte el servicio.</li>
                                <li>No vendemos tus datos ni los usamos para publicidad sin tu permiso.</li>
                                <li>El chat del sitio lo responde un asistente de inteligencia artificial y la conversación se guarda.</li>
                                <li>Usamos proveedores con servidores fuera de Chile (principalmente en Estados Unidos).</li>
                                <li>Puedes pedir ver, corregir o borrar tus datos escribiendo a <Correo />.</li>
                            </ul>
                        </section>

                        <section>
                            <h2>Quién es responsable de tus datos</h2>
                            <p>
                                El responsable del tratamiento es {pendiente(EMPRESA.razonSocial, 'Razón social')},
                                RUT {pendiente(EMPRESA.rut, 'RUT')}, con domicilio en{' '}
                                {pendiente(EMPRESA.domicilio, 'Domicilio')}, que opera bajo la marca {EMPRESA.marca}.
                                Para cualquier tema sobre tus datos personales escríbenos a <Correo />.
                            </p>
                            <p>
                                Esta política se rige por la Ley N.º 19.628 sobre Protección de la Vida Privada,
                                con las modificaciones de la Ley N.º 21.719, que rigen desde el 1 de diciembre de 2026.
                            </p>
                        </section>

                        <section>
                            <h2>Qué datos recibimos y de dónde</h2>
                            <ul>
                                <li>
                                    <strong>Formulario de contacto:</strong> nombre, correo, WhatsApp (opcional), los
                                    servicios que te interesan y tu mensaje. Nos llega por correo electrónico.
                                </li>
                                <li>
                                    <strong>Chat del sitio:</strong> nombre, correo y WhatsApp (opcional) si decides
                                    dejarlos, el texto de la conversación y la dirección IP desde donde escribes.
                                </li>
                                <li>
                                    <strong>Portal de clientes:</strong> los datos de tu cuenta (correo y contraseña,
                                    que guardamos cifrada), nombre, teléfono y, cuando compras un dominio o servicio,
                                    los datos del titular: nombre o razón social, RUT y dirección. También tus pedidos
                                    y solicitudes de soporte.
                                </li>
                                <li>
                                    <strong>Navegación:</strong> datos de uso del sitio (páginas vistas, dispositivo,
                                    origen de la visita) a través de Google Tag Manager, Google Analytics y Vercel
                                    Analytics. Más detalle en la sección de cookies.
                                </li>
                                <li>
                                    <strong>WhatsApp y correo:</strong> lo que nos escribas directamente por esos canales.
                                </li>
                            </ul>
                            <p>
                                No pedimos datos sensibles (salud, ideología, origen étnico, datos biométricos, etc.)
                                ni guardamos datos de tarjetas en este sitio.
                            </p>
                        </section>

                        <section>
                            <h2>Para qué los usamos y con qué fundamento</h2>
                            <ul>
                                <li>
                                    <strong>Responder tu consulta y preparar una cotización.</strong> Fundamento: lo
                                    pediste tú, como paso previo a un posible contrato.
                                </li>
                                <li>
                                    <strong>Prestar el servicio contratado</strong> (desarrollo, hosting, correos,
                                    dominios, soporte y el portal). Fundamento: el contrato contigo.
                                </li>
                                <li>
                                    <strong>Emitir documentos tributarios y llevar la contabilidad.</strong>
                                    Fundamento: obligación legal.
                                </li>
                                <li>
                                    <strong>Proteger el sitio contra abuso y spam</strong> (por ejemplo, limitar
                                    mensajes por dirección IP) y <strong>medir cómo se usa el sitio</strong> para
                                    mejorarlo. Fundamento: nuestro interés legítimo, que no pasa por encima de tus derechos.
                                </li>
                                <li>
                                    <strong>Enviarte novedades u ofertas.</strong> Solo si lo aceptas por separado y
                                    de forma expresa. Hoy no enviamos boletines.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>El chat y la inteligencia artificial</h2>
                            <p>
                                El chat lo responde un asistente de inteligencia artificial (Claude, de Anthropic),
                                no una persona. Lo usamos para orientarte sobre servicios y precios. Guardamos la
                                conversación para darte seguimiento y mejorar las respuestas, y nuestro equipo puede leerla.
                            </p>
                            <p>
                                El asistente no toma decisiones que te afecten: no aprueba ni rechaza contratos ni fija
                                condiciones. Las cotizaciones y acuerdos los revisa y confirma siempre una persona del equipo.
                                Te pedimos no escribir en el chat contraseñas, datos de tarjetas ni datos sensibles.
                            </p>
                        </section>

                        <section>
                            <h2>Con quién compartimos tus datos</h2>
                            <p>
                                No vendemos ni cedemos tus datos. Los compartimos solo con los proveedores que necesitamos
                                para funcionar, que los tratan por encargo nuestro y únicamente para el servicio que nos prestan:
                            </p>
                            <ul>
                                <li><strong>Vercel</strong> (Estados Unidos): aloja este sitio y mide visitas de forma agregada.</li>
                                <li><strong>Supabase</strong> (Estados Unidos): base de datos del chat, del portal y de los pedidos.</li>
                                <li><strong>Anthropic</strong> (Estados Unidos): procesa los mensajes del chat para generar las respuestas.</li>
                                <li><strong>Resend</strong> (Estados Unidos): envía los correos de aviso y de contacto.</li>
                                <li><strong>Google</strong> (Estados Unidos): Tag Manager y Analytics para medir el uso del sitio.</li>
                                <li>
                                    <strong>NIC Chile</strong> (Chile): si registramos un dominio .cl a tu nombre, le entregamos
                                    los datos del titular que exige. NIC Chile publica el nombre del titular en su sistema de consulta.
                                </li>
                                <li>
                                    <strong>Transbank</strong> (Chile): procesa los pagos con tarjeta vía Webpay.
                                    Nosotros no vemos ni guardamos los datos de tu tarjeta: solo el resultado del pago y los últimos 4 dígitos.
                                </li>
                                <li>
                                    <strong>Mercado Pago</strong> (Chile): procesa los pagos que hagas con Mercado Pago. Le entregamos
                                    el correo de tu cuenta y el detalle de la compra; los datos de tu tarjeta o de tu cuenta de Mercado Pago
                                    los ingresas en su sitio y nosotros solo recibimos el resultado del pago y los últimos 4 dígitos.
                                </li>
                            </ul>
                            <p>
                                También podemos entregar datos cuando una ley o una autoridad competente lo exija.
                            </p>
                        </section>

                        <section>
                            <h2>Datos que salen de Chile</h2>
                            <p>
                                Varios de estos proveedores guardan o procesan datos en servidores de Estados Unidos. Los
                                elegimos porque ofrecen estándares de seguridad reconocidos y se comprometen por contrato a
                                proteger los datos y a usarlos solo para prestarnos su servicio. Esa transferencia es necesaria
                                para responderte y prestarte los servicios que pides.
                            </p>
                        </section>

                        <section>
                            <h2>Cuánto tiempo los guardamos</h2>
                            <ul>
                                <li>
                                    <strong>Consultas que no terminan en contratación</strong> (formulario, correo, chat
                                    y WhatsApp): 12 meses desde el último contacto.
                                </li>
                                <li>
                                    <strong>Conversaciones del chat:</strong> 12 meses desde el último mensaje.
                                </li>
                                <li>
                                    <strong>Clientes:</strong> mientras dure la relación comercial y, después, solo lo que
                                    exija la ley tributaria (hasta 6 años) o lo necesario para atender reclamos.
                                </li>
                                <li>
                                    <strong>Cuentas del portal sin compras:</strong> hasta que pidas eliminarla, o 24 meses
                                    sin uso.
                                </li>
                            </ul>
                            <p>
                                Cumplido el plazo, quitamos los datos que te identifican (nombre, correo, teléfono, RUT,
                                dirección e IP). Lo que queda, como el texto de una consulta sin tu identidad, lo usamos
                                solo para estadísticas y para mejorar el servicio.
                            </p>
                            <p>
                                Mantenemos respaldos cifrados de la base de datos para recuperarnos de fallas. Se guardan
                                hasta por 24 meses y luego se eliminan. Si pides borrar tus datos, no los volvemos a
                                restaurar desde un respaldo.
                            </p>
                        </section>

                        <section>
                            <h2>Cómo los protegemos</h2>
                            <p>
                                El acceso a los datos está restringido al equipo que los necesita, con verificación en dos
                                pasos en las cuentas de administración. La base de datos aplica reglas para que cada cliente
                                vea solo su información y las conexiones viajan cifradas. Si ocurriera una filtración que
                                ponga en riesgo tus datos, avisaremos a la Agencia de Protección de Datos Personales y a las
                                personas afectadas lo antes posible, como exige la ley.
                            </p>
                        </section>

                        <section>
                            <h2>Tus derechos</h2>
                            <p>Puedes pedirnos en cualquier momento, sin costo:</p>
                            <ul>
                                <li><strong>Acceso:</strong> saber qué datos tuyos tenemos, para qué y de dónde vienen.</li>
                                <li><strong>Rectificación:</strong> corregir datos incorrectos o incompletos.</li>
                                <li><strong>Supresión:</strong> que borremos tus datos cuando ya no corresponda tenerlos.</li>
                                <li><strong>Oposición:</strong> que dejemos de usarlos para un fin determinado, como la medición o el marketing.</li>
                                <li><strong>Portabilidad:</strong> recibir tus datos en un formato que puedas llevar a otro proveedor.</li>
                                <li><strong>Bloqueo:</strong> que suspendamos temporalmente su uso mientras se resuelve una solicitud.</li>
                                <li>
                                    <strong>No quedar sujeto a decisiones automatizadas</strong> que te afecten
                                    significativamente. No tomamos decisiones de ese tipo.
                                </li>
                            </ul>
                            <p>
                                Escríbenos a <Correo /> indicando qué necesitas y desde el correo con que te comunicaste
                                con nosotros (o con algún dato que nos permita verificar que eres tú). Respondemos dentro
                                de 30 días corridos. Si no quedas conforme con la respuesta, puedes reclamar ante la
                                Agencia de Protección de Datos Personales.
                            </p>
                            <p>
                                Si eres cliente del portal, también puedes ver y corregir tus datos directamente en la
                                pestaña Mis datos.
                            </p>
                        </section>

                        <section>
                            <h2>Cookies y medición</h2>
                            <p>
                                Usamos Google Tag Manager y Google Analytics para contar visitas y entender cómo se llega al
                                sitio (por ejemplo, desde un anuncio de Google). Instalan cookies, por eso <strong>solo se
                                activan si las aceptas</strong> en el aviso que aparece al entrar. Si eliges "Solo
                                necesarias", no se cargan.
                            </p>
                            <p>
                                Sin pedir permiso usamos solo lo necesario para que el sitio funcione: Vercel Analytics, que
                                cuenta visitas de forma agregada y sin cookies; los datos temporales del chat, que se guardan
                                en tu navegador mientras dura la pestaña; la sesión del portal si inicias sesión; y tu
                                elección sobre las cookies.
                            </p>
                            <p>
                                Puedes cambiar tu elección cuando quieras desde el enlace "Cookies" al pie de cada página.
                            </p>
                        </section>

                        <section>
                            <h2>Menores de edad</h2>
                            <p>
                                Este sitio y nuestros servicios están dirigidos a personas adultas y empresas. No
                                recolectamos a sabiendas datos de menores de 14 años. Si crees que un menor nos entregó
                                sus datos, escríbenos y los eliminaremos.
                            </p>
                        </section>

                        <section>
                            <h2>Datos de los clientes de nuestros clientes</h2>
                            <p>
                                Cuando alojamos el sitio de una empresa o le administramos sistemas, los datos de sus
                                propios clientes los tratamos por encargo de esa empresa, que es la responsable. Si quieres
                                ejercer tus derechos sobre esos datos, dirígete primero a esa empresa; nosotros la
                                apoyaremos para responderte.
                            </p>
                        </section>

                        <section>
                            <h2>Cambios a esta política</h2>
                            <p>
                                Podemos actualizar esta política cuando cambien el sitio, los servicios o la ley. La fecha
                                de arriba indica la última versión. Si el cambio es importante y tenemos tu correo, te
                                avisaremos.
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
