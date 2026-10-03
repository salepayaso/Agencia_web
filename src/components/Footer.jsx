import { Link } from 'react-router-dom';
import Wordmark from './Wordmark';
import { openCookieSettings } from '../lib/consent';

const Footer = () => (
    <div className="tc">
        <footer className="foot-site gutter">
            <div className="max">
                <div>
                    <Link to="/" className="brand" aria-label="Interfaz 360, ir al inicio">
                        <Wordmark className="text-[28px]" />
                    </Link>
                    <p style={{ maxWidth: '34ch' }}>
                        Agencia digital para pymes y emprendedores de Chile. Web, Google, software y agentes IA.
                    </p>
                </div>
                <div>
                    <h2>Sitio</h2>
                    <ul>
                        <li><Link to="/servicios">Servicios</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </div>
                <div>
                    <h2>Clientes</h2>
                    <ul>
                        <li><Link to="/login">Portal de clientes</Link></li>
                        <li><Link to="/#dominio">Buscar dominio</Link></li>
                        <li><Link to="/contacto">Soporte</Link></li>
                    </ul>
                </div>
                <div>
                    <h2>Síguenos</h2>
                    <ul>
                        <li>
                            <a href="https://www.instagram.com/interfaz360/" target="_blank" rel="noopener noreferrer">
                                Instagram @interfaz360
                            </a>
                        </li>
                        <li><a href="mailto:contacto@interfaz360.cl">contacto@interfaz360.cl</a></li>
                    </ul>
                </div>
                <div className="legal">
                    <span>© {new Date().getFullYear()} Interfaz 360 · Santiago, Chile</span>
                    <nav aria-label="Legal">
                        <Link to="/privacidad">Privacidad</Link>
                        <Link to="/terminos">Términos</Link>
                        <button type="button" onClick={openCookieSettings}>Cookies</button>
                    </nav>
                </div>
            </div>
        </footer>
    </div>
);

export default Footer;
