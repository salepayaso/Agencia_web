import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Wordmark from '../components/Wordmark';
import QuoteDocument from '../components/QuoteDocument';
import { PortalLoading } from '../components/ProtectedRoute';
import { quoteTotals, clp } from '../data/quote';

// Cotización por enlace personal (/cotizacion/:token): el cliente la ve, la
// descarga en PDF (imprimir → Guardar como PDF) y la acepta. Sin cuenta.

const WHATSAPP = '+56 9 5414 6176';

const QuotePage = () => {
    const { token } = useParams();
    const [state, setState] = useState('loading'); // loading | missing | error | ready
    const [data, setData] = useState(null);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    // Enlace personal: fuera de los buscadores.
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
        return () => meta.remove();
    }, []);

    useEffect(() => {
        let alive = true;
        fetch(`/api/cotizacion?t=${encodeURIComponent(token)}`)
            .then(async (res) => {
                if (!alive) return;
                if (res.status === 404) return setState('missing');
                const json = await res.json().catch(() => ({}));
                if (!res.ok) return setState('error');
                setData(json);
                setState('ready');
            })
            .catch(() => alive && setState('error'));
        return () => { alive = false; };
    }, [token]);

    // El nombre del PDF sale del título de la página.
    useEffect(() => {
        if (data) document.title = `Cotización ${data.number} · Interfaz 360`;
    }, [data]);

    if (state === 'loading') return <PortalLoading />;

    const accept = async () => {
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/cotizacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ t: token, action: 'accept' }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) return setError(json.error || 'No pudimos registrar tu aceptación. Intenta de nuevo.');
            setData(json);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setError('No pudimos registrar tu aceptación. Revisa tu conexión e intenta de nuevo.');
        } finally {
            setBusy(false);
        }
    };

    const t = data ? quoteTotals(data.quote.items) : null;

    return (
        <div className="tc-page">
            <div className="tc">
                <header className="portal-bar gutter no-print">
                    <div className="max">
                        <Link to="/" className="brand" aria-label="Interfaz 360, ir al sitio">
                            <Wordmark className="text-[20px]" />
                            <small>{data ? `Cotización ${data.number}` : 'Cotización'}</small>
                        </Link>
                    </div>
                </header>

                <main className="gutter">
                    <div className="max" style={{ paddingBlock: '40px 80px', display: 'grid', gap: 28 }}>
                        {state === 'missing' && (
                            <div className="portal-head" style={{ paddingTop: 8 }}>
                                <div>
                                    <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Esta cotización no está disponible</h1>
                                    <p className="portal-lede">Puede que aún la estemos preparando o que el enlace esté incompleto. Escríbenos por WhatsApp al {WHATSAPP}.</p>
                                </div>
                            </div>
                        )}
                        {state === 'error' && (
                            <p className="alert">No pudimos abrir tu cotización. Intenta de nuevo en un momento o escríbenos por WhatsApp al {WHATSAPP}.</p>
                        )}

                        {state === 'ready' && (
                            <>
                                <section className="panel quote-bar no-print">
                                    {data.accepted ? (
                                        <div className="box-body">
                                            <p className="alert ok" style={{ margin: 0 }}>
                                                ¡Aceptada! Gracias por confiar en nosotros. Te enviaremos por correo los datos para pagar el anticipo
                                                de {clp(t.anticipo)} y partimos apenas lo recibamos.
                                            </p>
                                            <div className="admin-actions">
                                                <button type="button" className="btn" onClick={() => window.print()}>Descargar PDF</button>
                                            </div>
                                        </div>
                                    ) : data.expired ? (
                                        <div className="box-body">
                                            <p className="alert" style={{ margin: 0 }}>Esta cotización venció. Escríbenos por WhatsApp al {WHATSAPP} y te enviamos una actualizada.</p>
                                        </div>
                                    ) : (
                                        <div className="box-body">
                                            <div className="quote-bar-head">
                                                <div>
                                                    <span className="eyebrow">Total {clp(t.total)} IVA incluido</span>
                                                    <p style={{ margin: '6px 0 0', fontSize: 15 }}>Para partir pagas el 50 %: <b>{clp(t.anticipo)}</b>.</p>
                                                </div>
                                                <button type="button" className="btn" onClick={() => window.print()}>Descargar PDF</button>
                                            </div>
                                            <label className="brief-check">
                                                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                                                <span>Leí el detalle y las condiciones, y acepto esta cotización.</span>
                                            </label>
                                            {error && <p className="alert" role="alert">{error}</p>}
                                            <div className="admin-actions">
                                                <button type="button" className="btn signal" disabled={!agree || busy} onClick={accept}>
                                                    {busy ? 'Enviando…' : 'Aceptar cotización →'}
                                                </button>
                                                <span className="muted" style={{ fontSize: 13 }}>¿Quieres cambiar algo? Escríbenos por WhatsApp al {WHATSAPP}.</span>
                                            </div>
                                        </div>
                                    )}
                                </section>
                                <QuoteDocument q={data} doc={data.quote} />
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuotePage;
