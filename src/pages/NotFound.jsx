import { Link } from 'react-router-dom';
import PageShell, { PageHead } from '../components/PageShell';

// Dirección que no existe. Vercel la sirve con estado 404 (ver vercel.json),
// así Google no la cuenta como página vacía.
const NotFound = () => (
    <PageShell title="Página no encontrada" description="Esta página no existe en Interfaz 360." noindex>
        <PageHead eyebrow="Error 404" title="Esta página no existe">
            Puede que el enlace esté mal escrito o que la página se haya movido.
        </PageHead>
        <section className="s gutter" style={{ paddingTop: 0 }}>
            <div className="max" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/" className="btn solid">Ir al inicio</Link>
                <Link to="/servicios" className="btn">Ver servicios</Link>
                <Link to="/contacto" className="btn">Contacto</Link>
            </div>
        </section>
    </PageShell>
);

export default NotFound;
