import { Fragment } from 'react';
import { EMPRESA } from '../data/empresa';
import {
    quoteNumber, quoteTotals, clp, ALWAYS_INCLUDED, NOT_INCLUDED, CONDITIONS, RENEWALS,
} from '../data/quote';

// La cotización como documento A4 de dos hojas. La usan la vista previa de /admin
// y la página del cliente (/cotizacion/:token), que la imprime como PDF.
// q = fila de quotes (id, created_at); doc = la cotización (cliente, resumen, ítems, fechas).

const fecha = (v) => (v ? new Date(v).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '—');

const QuoteDocument = ({ q, doc, children }) => {
    const t = quoteTotals(doc.items);
    const num = quoteNumber(q);
    const c = doc.client || {};
    return (
        <div className="quote-doc">
            <section className="qd-sheet">
                <header className="qd-head">
                    <div>
                        <div className="qd-mark">Interfaz<span>360</span></div>
                        <p className="qd-issuer">
                            {EMPRESA.razonSocial} · RUT {EMPRESA.rut}<br />
                            Desarrollo web, correos y agentes IA · {EMPRESA.domicilio}<br />
                            interfaz360.cl · contacto@interfaz360.cl · +56 9 5414 6176
                        </p>
                    </div>
                    <div className="qd-id">
                        <h1>Cotización</h1>
                        <div className="qd-num">N.º {num}</div>
                        <dl>
                            <dt>Emitida</dt><dd>{doc.issued_at ? fecha(doc.issued_at) : 'Borrador'}</dd>
                            <dt>Válida hasta</dt><dd>{doc.valid_until ? fecha(doc.valid_until) : '15 días desde el envío'}</dd>
                        </dl>
                    </div>
                </header>

                <div className="qd-client">
                    <div>
                        <p className="qd-label">Para</p>
                        <div className="qd-name">{c.name || '—'}</div>
                        <dl className="qd-kv">
                            {c.rut && <><dt>RUT</dt><dd>{c.rut}</dd></>}
                            {c.rubro && <><dt>Rubro</dt><dd>{c.rubro}</dd></>}
                        </dl>
                    </div>
                    <div>
                        <p className="qd-label">Contacto</p>
                        <dl className="qd-kv">
                            <dt>Nombre</dt><dd>{c.contact || '—'}</dd>
                            <dt>Correo</dt><dd>{c.email || '—'}</dd>
                            {c.phone && <><dt>WhatsApp</dt><dd>{c.phone}</dd></>}
                        </dl>
                    </div>
                </div>

                <div>
                    <p className="qd-label">Qué vamos a hacer</p>
                    <p className="qd-summary">{doc.summary}</p>
                </div>

                <div>
                    <h2>Detalle</h2>
                    <div className="qd-table">
                        <table>
                            <thead><tr><th>Ítem</th><th className="amt">Monto neto</th></tr></thead>
                            <tbody>
                                {doc.items.map((i, n) => (
                                    <tr key={n} className={i.amount < 0 ? 'discount' : ''}>
                                        <td>
                                            <div className="qd-item">{i.title}</div>
                                            {i.sub && <div className="qd-sub">{i.sub}</div>}
                                            {i.includes?.length > 0 && <ul className="qd-inc">{i.includes.map((x) => <li key={x}>{x}</li>)}</ul>}
                                        </td>
                                        <td className="amt">{clp(i.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="qd-totals">
                        <dl>
                            {t.discount < 0 && <><dt>Subtotal</dt><dd>{clp(t.subtotal)}</dd><dt>Descuento</dt><dd>{clp(t.discount)}</dd></>}
                            <dt>Neto</dt><dd>{clp(t.neto)}</dd>
                            <dt>IVA 19 %</dt><dd>{clp(t.iva)}</dd>
                            <dt className="grand">Total</dt><dd className="grand">{clp(t.total)}</dd>
                            <dd className="fine">Pesos chilenos. Todos los valores son netos + IVA.</dd>
                        </dl>
                    </div>
                </div>

                <div>
                    <h2>Forma de pago</h2>
                    <div className="qd-pay">
                        <div><b>50 %</b><span>{clp(t.anticipo)}</span><small>Al aceptar la cotización. Con este pago partimos.</small></div>
                        <div><b>50 %</b><span>{clp(t.saldo)}</span><small>Cuando apruebas el sitio, antes de publicarlo.</small></div>
                    </div>
                    <p className="qd-fine">Pago por transferencia. Te enviamos los datos al aceptar.</p>
                </div>
                <footer className="qd-foot"><span>{EMPRESA.razonSocial} · {num}</span><span>Página 1 de 2</span></footer>
            </section>

            <section className="qd-sheet">
                <div className="qd-cols">
                    <div>
                        <h2>Incluye</h2>
                        <ul className="qd-list yes">{ALWAYS_INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                    <div>
                        <h2>No incluye</h2>
                        <ul className="qd-list no">{NOT_INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                </div>

                <div>
                    <h2>Cómo sigue</h2>
                    <ol className="qd-steps">
                        {[
                            ['Aceptas', 'y pagas el 50 %.'],
                            ['Material', 'nos envías lo que tengas por WhatsApp o Drive; lo que falte, lo creamos juntos.'],
                            ['Primera versión', 'en 10 días hábiles.'],
                            ['Ajustes', 'hasta que quede como quieres.'],
                            ['Publicamos', 'tras el pago del saldo.'],
                        ].map(([a, b]) => <li key={a}><b>{a}</b>{b}</li>)}
                    </ol>
                </div>

                <div>
                    <h2>Desde el segundo año</h2>
                    {doc.domain === 'propio' ? (
                        <>
                            <div className="qd-renew">
                                <div><b>Hosting de correos</b> · solo si quieres mantener tus correos con nosotros</div>
                                <div><b>{clp(RENEWALS.hosting)} + IVA</b> al año</div>
                            </div>
                            <p className="qd-fine">
                                Tu dominio es tuyo y lo renuevas directamente con tu proveedor: mientras siga activo, tu sitio sigue publicado sin costo
                                adicional. Si no quieres los correos, desde el segundo año no nos pagas nada.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="qd-renew">
                                <div><b>Dominio .cl</b> · mantiene tu sitio publicado</div>
                                <div><b>{clp(RENEWALS.dominio)} + IVA</b> al año</div>
                            </div>
                            <p className="qd-fine">
                                Para que tu sitio siga publicado basta con renovar el dominio. Si además quieres mantener tus correos, se suma el hosting
                                de correos ({clp(RENEWALS.hosting)} + IVA al año), o el pack dominio + correos por {clp(RENEWALS.pack)} + IVA al año.
                                Tu dominio sigue a tu nombre y te avisamos antes de cada vencimiento.
                            </p>
                        </>
                    )}
                </div>

                <div>
                    <h2>Condiciones</h2>
                    <ol className="qd-terms">{CONDITIONS.map((x) => <li key={x}>{x}</li>)}</ol>
                </div>

                {children && <Fragment>{children}</Fragment>}

                <div className="qd-contact">
                    <p className="qd-label">¿Dudas?</p>
                    WhatsApp +56 9 5414 6176 · contacto@interfaz360.cl · Reunión por Meet: mar, jue y sáb desde las 18:00
                </div>
                <footer className="qd-foot"><span>{EMPRESA.razonSocial} · {num}</span><span>Página 2 de 2</span></footer>
            </section>
        </div>
    );
};

export default QuoteDocument;
