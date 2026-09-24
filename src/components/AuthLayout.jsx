import { Link } from 'react-router-dom';
import SEO from './SEO';
import Wordmark from './Wordmark';

// Pantalla partida del acceso de clientes: a la izquierda el título,
// a la derecha el formulario.
const AuthLayout = ({ title, description, children }) => (
    <div className="tc-page">
        <SEO title={title} description={description} />
        <div className="tc auth">
            <aside className="side">
                <Link to="/" className="brand" aria-label="Interfaz 360, ir al inicio">
                    <Wordmark className="text-[26px]" />
                </Link>
                <div>
                    <span className="eyebrow">Portal de clientes</span>
                    <h1 className="display">Tu cuenta,<br />en <span>orden</span></h1>
                    <p className="lede">Tu dominio, tus pagos, tus correos y tu soporte en un solo lugar.</p>
                </div>
                <Link to="/" className="back">← Volver al sitio</Link>
            </aside>
            <div className="main">
                <div className="panel card">{children}</div>
            </div>
        </div>
    </div>
);

export default AuthLayout;
