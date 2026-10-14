import Navbar from './Navbar';
import Footer from './Footer';
import ChatAgent from './ChatAgent';
import SEO from './SEO';
import { openChat } from '../lib/chat';

// Estructura común de las páginas públicas: menú, asesor, contenido y footer.
const PageShell = ({ title, description, noindex, children }) => (
    <div className="tc-page">
        <SEO title={title} description={description} noindex={noindex} />
        <Navbar />
        <ChatAgent />
        <main className="tc">{children}</main>
        <Footer />
    </div>
);

// Encabezado de página interna: eyebrow, título grande y bajada.
export const PageHead = ({ eyebrow, title, children }) => (
    <section className="page-head gutter">
        <div className="max">
            <div>
                <span className="eyebrow">{eyebrow}</span>
                <h1 className="display">{title}</h1>
            </div>
            {children && <p>{children}</p>}
        </div>
    </section>
);

// Franja naranja de cierre que abre el asesor.
export const CtaBand = ({ title = '¿Conversamos sobre tu negocio?', label = 'Hablar con el asesor →', message }) => (
    <section className="cta gutter">
        <div className="max">
            <h2 className="display">{title}</h2>
            <button
                type="button"
                className="btn"
                onClick={() => {
                    window.dataLayer?.push({ event: 'interest_click', service_name: `CTA: ${title}`, click_url: 'button' });
                    openChat(message);
                }}
            >
                {label}
            </button>
        </div>
    </section>
);

export default PageShell;
