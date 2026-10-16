import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Wordmark from '../components/Wordmark';
import QuoteDocument from '../components/QuoteDocument';
import { PortalLoading } from '../components/ProtectedRoute';
import { quoteTotals, stageAmount, clp } from '../data/quote';
import { PAYS } from '../lib/orders';
import { PaymentReceipt, TransferData } from '../components/PaymentReceipt';
import { transferenciaLista } from '../data/transferencia';

// Cotización por enlace personal (/cotizacion/:token): el cliente la ve, la
// descarga en PDF (imprimir → Guardar como PDF), la acepta y paga el anticipo y
// el saldo. Sin cuenta. Los pagos en línea usan las mismas pasarelas del portal
// (se encienden con VITE_PAGO_WEBPAY / VITE_PAGO_MP); la transferencia la
// confirma el equipo y los datos van por correo.

const WHATSAPP = '+56 9 5414 6176';

const PAGO_MSG = {
    ok: { ok: true, text: '¡Pago recibido! Te llegó la confirmación por correo.' },
    rechazado: { ok: false, text: 'El pago fue rechazado y no se hizo ningún cobro. Puedes intentarlo de nuevo o pagar por transferencia.' },
    anulado: { ok: false, text: 'Saliste del pago antes de terminar. No se hizo ningún cobro.' },
    proceso: { ok: true, text: 'Tu pago está en revisión en Mercado Pago. Te avisamos por correo apenas se confirme.' },
    error: { ok: false, text: `No pudimos confirmar el pago. Si se hizo el cargo, escríbenos por WhatsApp al ${WHATSAPP} y lo revisamos.` },
};

const ONLINE = Object.entries(PAYS).filter(([, p]) => p.online && p.active);

const fecha = (v) => new Date(v).toLocaleDateString('es-CL');

const QuotePage = () => {
    const { token } = useParams();
    const [params] = useSearchParams();
    const [state, setState] = useState('loading'); // loading | missing | error | ready
    const [data, setData] = useState(null);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const pagoMsg = PAGO_MSG[params.get('pago')];

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
        setBusy('accept');
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
            setBusy('');
        }
    };

    // Va a la pasarela: Webpay con un POST de token_ws, Mercado Pago a su página.
    const pay = async (method) => {
        setBusy(method);
        setError('');
        try {
            const res = await fetch(method === 'webpay' ? '/api/webpay/crear' : '/api/mercadopago/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quote: token, stage: data.due }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.url) throw new Error(json.error || '');
            if (method === 'webpay') {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = json.url;
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'token_ws';
                input.value = json.token;
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            } else {
                window.location.assign(json.url);
            }
        } catch (err) {
            setError(err.message || `No pudimos abrir el pago. Intenta de nuevo o paga por transferencia.`);
            setBusy('');
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
                                    <div className="box-body">
                                        {pagoMsg && <p className={pagoMsg.ok ? 'alert ok' : 'alert'} role="status" style={{ margin: 0 }}>{pagoMsg.text}</p>}
                                        {params.get('pago') === 'ok' && data.receipts?.[0] && (() => {
                                            const r = data.receipts[0];
                                            return (
                                                <PaymentReceipt method={r.method} buyOrder={r.buyOrder} amount={r.amount} paidAt={r.paidAt} info={r.info}
                                                    detail={`Cotización ${data.number} · ${r.stage === 'anticipo' ? 'Anticipo' : 'Saldo'} 50 %`} />
                                            );
                                        })()}

                                        {!data.accepted && data.expired && (
                                            <p className="alert" style={{ margin: 0 }}>Esta cotización venció. Escríbenos por WhatsApp al {WHATSAPP} y te enviamos una actualizada.</p>
                                        )}

                                        {!data.accepted && !data.expired && (
                                            <>
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
                                                <div className="admin-actions">
                                                    <button type="button" className="btn signal" disabled={!agree || !!busy} onClick={accept}>
                                                        {busy === 'accept' ? 'Enviando…' : 'Aceptar cotización →'}
                                                    </button>
                                                    <span className="muted" style={{ fontSize: 13 }}>¿Quieres cambiar algo? Escríbenos por WhatsApp al {WHATSAPP}.</span>
                                                </div>
                                            </>
                                        )}

                                        {data.accepted && (
                                            <>
                                                <div className="quote-bar-head">
                                                    <div>
                                                        <span className="eyebrow">Tu proyecto</span>
                                                        <ol className="quote-progress">
                                                            <li className="done">Aceptada</li>
                                                            <li className={data.depositPaidAt ? 'done' : 'now'}>Anticipo{data.depositPaidAt ? ` · ${fecha(data.depositPaidAt)}` : ''}</li>
                                                            <li className={data.balancePaidAt ? 'done' : data.depositPaidAt ? 'now' : ''}>En desarrollo</li>
                                                            <li className={data.balancePaidAt ? 'done' : data.due === 'saldo' ? 'now' : ''}>Saldo{data.balancePaidAt ? ` · ${fecha(data.balancePaidAt)}` : ''}</li>
                                                            <li className={data.publishedAt ? 'done' : data.balancePaidAt ? 'now' : ''}>Publicado</li>
                                                        </ol>
                                                    </div>
                                                    <button type="button" className="btn" onClick={() => window.print()}>Descargar PDF</button>
                                                </div>

                                                {data.due && (
                                                    <div className="quote-pay">
                                                        <p style={{ margin: 0, fontSize: 16 }}>
                                                            {data.due === 'anticipo' ? 'Para partir falta el anticipo' : 'Tu sitio está listo: falta el saldo'}{' '}
                                                            de <b>{clp(stageAmount(data.quote, data.due))}</b> (50 %, IVA incluido).
                                                        </p>
                                                        {ONLINE.length > 0 && (
                                                            <div className="admin-actions">
                                                                {ONLINE.map(([id, p]) => (
                                                                    <button key={id} type="button" className="btn signal" disabled={!!busy} onClick={() => pay(id)}>
                                                                        {busy === id ? `Abriendo ${p.site}…` : `Pagar con ${p.site} →`}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {transferenciaLista() ? (
                                                            <>
                                                                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                                                                    {ONLINE.length ? 'Si prefieres transferencia, usa estos datos:' : 'Pagas por transferencia con estos datos:'}
                                                                </p>
                                                                <TransferData amount={stageAmount(data.quote, data.due)} reference={`Cotización ${data.number}`} />
                                                            </>
                                                        ) : (
                                                            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                                                                {ONLINE.length ? 'Si prefieres transferencia, ' : 'Pagas por transferencia: '}
                                                                te enviaremos los datos por correo y confirmamos tu pago apenas llegue.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {!data.due && !data.publishedAt && (
                                                    <p className="alert ok" style={{ margin: 0 }}>
                                                        {data.balancePaidAt
                                                            ? 'Todo pagado. Estamos publicando tu sitio y te avisamos apenas esté en línea.'
                                                            : data.depositPaidAt
                                                                ? 'Recibimos tu anticipo y estamos trabajando en tu sitio. Te mostramos la primera versión en 10 días hábiles.'
                                                                : 'Gracias por aceptar.'}
                                                    </p>
                                                )}
                                                {data.publishedAt && <p className="alert ok" style={{ margin: 0 }}>¡Tu sitio está publicado! Tienes 30 días de garantía: si ves algún error, escríbenos.</p>}
                                            </>
                                        )}
                                        {error && <p className="alert" role="alert" style={{ margin: 0 }}>{error}</p>}
                                    </div>
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
