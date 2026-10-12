import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import Wordmark from '../components/Wordmark';
import { PortalLoading } from '../components/ProtectedRoute';
import { OFFERS, conIva, PAYS, clp, rutOk, isOpenOrder, isUnpaidCard, orderStatus } from '../lib/orders';
import {
    catLabel, TICKET_STATUS, isOpen, parseDate, fmt, daysFrom, dayWord, hasServices,
    HOSTING_PLANS, PAY_METHODS, DOC_TITLES, cleanDomain,
} from '../lib/portal';
import { QUOTE_STATUS, briefNumber, briefRows, cleanBrief } from '../data/brief';

// Panel de administración (/admin): cotizaciones, pedidos, clientes y soporte sin entrar a Supabase.
// Solo para cuentas en la tabla admins (supabase_scripts/admin_panel_2026_09_30.sql).
// Lee con las políticas "Admin can view all ..." y cambia datos SOLO con las
// funciones admin_update_order / admin_update_ticket,
// admin_create_brief / admin_update_quote (cotizaciones_2026_10_12.sql) y
// admin_update_profile / admin_set_client_note / admin_add_document /
// admin_delete_document (fichas_admin_2026_10_12.sql),
// que vuelven a revisar is_admin() en la base. Ocultar esta página no es la
// seguridad: la seguridad está en la base.

const ERRORS = {
    no_autorizado: 'Tu cuenta no tiene permiso de administrador.',
    estado_invalido: 'Ese estado no es válido.',
    falta_nombre: 'Escribe el nombre del cliente.',
    falta_titulo: 'Escribe el título del documento.',
    correos_invalidos: 'La lista de correos no es válida.',
};
const errText = (e) => ERRORS[Object.keys(ERRORS).find((k) => (e?.message || '').includes(k))] || 'No se pudo guardar. Intenta de nuevo.';

const waLink = (phone) => {
    const n = String(phone || '').replace(/\D/g, '');
    return n.length >= 8 ? `https://wa.me/${n.length === 9 ? `56${n}` : n}` : null;
};

const clientLabel = (p) => p?.client_name || p?.holder_name || p?.email || 'Sin ficha';

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('hoy');
    const [profiles, setProfiles] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [notes, setNotes] = useState({});

    const load = useCallback(async () => {
        const [p, o, t, q, d, n] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('tickets').select('*').order('created_at', { ascending: false }),
            supabase.from('quotes').select('*').order('created_at', { ascending: false }),
            supabase.from('documents').select('*').order('created_at', { ascending: false }),
            supabase.from('client_notes').select('*'),
        ]);
        setProfiles(p.data || []);
        setOrders(o.data || []);
        setTickets(t.data || []);
        setQuotes(q.data || []);
        setDocuments(d.data || []);
        setNotes(Object.fromEntries((n.data || []).map((x) => [x.user_id, x.note])));
    }, []);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return navigate('/login', { replace: true });
            const { data: admin } = await supabase.rpc('is_admin');
            if (!admin) return navigate('/dashboard', { replace: true });
            await load();
            setLoading(false);
        })();
    }, [navigate, load]);

    const byId = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);

    if (loading) return <PortalLoading />;

    const waiting = orders.filter((o) => o.status === 'pendiente' && isOpenOrder(o));
    const paid = orders.filter((o) => o.status === 'pagado');
    const openTickets = tickets.filter(isOpen);
    const newBriefs = quotes.filter((x) => x.status === 'brief_recibido');
    const expiring = profiles.filter((p) => {
        const d = daysFrom(parseDate(p.domain_expires));
        return d !== null && d <= 30;
    });

    const logout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const tabBtn = (id, label, count = 0) => (
        <button type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
            {label}{count > 0 && <span className="count">{count}</span>}
        </button>
    );

    return (
        <div className="tc-page">
            <SEO title="Administración" description="Panel de administración de Interfaz 360." />
            <div className="tc">
                <header className="portal-bar gutter">
                    <div className="max">
                        <Link to="/" className="brand" aria-label="Interfaz 360, ir al sitio">
                            <Wordmark className="text-[20px]" />
                            <small>Administración</small>
                        </Link>
                        <div className="who">
                            <Link to="/dashboard" className="textlink">Mi portal</Link>
                            <button type="button" className="btn" onClick={logout}>Cerrar sesión</button>
                        </div>
                    </div>
                </header>

                <main className="gutter">
                    <div className="max">
                        <div className="portal-head">
                            <div>
                                <span className="eyebrow">Panel de administración</span>
                                <h1 className="display" style={{ marginTop: 14 }}>Todo <span>en orden</span></h1>
                            </div>
                            <div className="tabs" role="tablist" aria-label="Secciones del panel">
                                {tabBtn('hoy', 'Hoy')}
                                {tabBtn('cotizaciones', 'Cotizaciones', newBriefs.length)}
                                {tabBtn('pedidos', 'Pedidos', waiting.length + paid.length)}
                                {tabBtn('clientes', 'Clientes')}
                                {tabBtn('soporte', 'Soporte', openTickets.length)}
                            </div>
                        </div>

                        <div style={{ paddingBottom: 80 }}>
                            {tab === 'hoy' && (
                                <Today newBriefs={newBriefs} waiting={waiting} paid={paid} openTickets={openTickets} expiring={expiring} goTo={setTab} />
                            )}
                            {tab === 'cotizaciones' && <Quotes quotes={quotes} onChanged={load} />}
                            {tab === 'pedidos' && <Orders orders={orders} byId={byId} onChanged={load} />}
                            {tab === 'clientes' && <Clients profiles={profiles} orders={orders} documents={documents} notes={notes} onChanged={load} />}
                            {tab === 'soporte' && <Tickets tickets={tickets} byId={byId} onChanged={load} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Hoy: lo que requiere acción ----------------------------------------------------------
const Today = ({ newBriefs, waiting, paid, openTickets, expiring, goTo }) => {
    const tiles = [
        { n: newBriefs.length, t: 'Briefs por cotizar', d: 'Clientes que ya enviaron su brief: prepara la cotización.', go: 'cotizaciones' },
        { n: waiting.length, t: 'Esperando pago', d: 'Envía los datos de transferencia. Los pagos con Webpay o Mercado Pago llegan solos a "Pagados".', go: 'pedidos' },
        { n: paid.length, t: 'Pagados por activar', d: 'Registra el dominio o activa el hosting y márcalos activos.', go: 'pedidos' },
        { n: openTickets.length, t: 'Solicitudes abiertas', d: 'Respondemos dentro de un día hábil.', go: 'soporte' },
        { n: expiring.length, t: 'Dominios por vencer', d: 'Vencen en 30 días o menos (o ya vencieron).', go: 'clientes' },
    ];
    return (
        <div className="admin-tiles">
            {tiles.map((x) => (
                <button key={x.t} type="button" className={`panel admin-tile${x.n ? ' hot' : ''}`} onClick={() => goTo(x.go)}>
                    <b>{x.n}</b>
                    <span>{x.t}</span>
                    <small>{x.d}</small>
                </button>
            ))}
        </div>
    );
};

// Cotizaciones: briefs por enlace ----------------------------------------------------------
const briefLink = (q) => `${window.location.origin}/brief/${q.token}`;

const briefMessage = (q) => {
    const first = (q.client_name || '').trim().split(' ')[0];
    return `Hola ${first}, te dejo el enlace para que nos cuentes de tu proyecto: ${briefLink(q)}\nPuedes guardar y volver cuando quieras. Con tus respuestas preparamos tu cotización.\nEquipo Interfaz 360`;
};

const copyText = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
};

const CLOSED = ['publicado', 'cancelada'];

const Quotes = ({ quotes, onChanged }) => {
    const [all, setAll] = useState(false);
    const [created, setCreated] = useState(null);
    const list = all ? quotes : quotes.filter((q) => !CLOSED.includes(q.status));

    return (
        <div style={{ display: 'grid', gap: 28 }}>
            <NewBrief onCreated={(q) => { setCreated(q); onChanged(); }} />
            {created && <LinkBox quote={created} onClose={() => setCreated(null)} />}
            <section className="panel">
                <div className="box-title">
                    <b>{all ? 'Todos los proyectos' : 'Proyectos en curso'}</b>
                    <button type="button" className="textlink" onClick={() => setAll((v) => !v)}>{all ? 'Ver solo en curso' : `Ver todos (${quotes.length})`}</button>
                </div>
                {list.length ? list.map((q) => <QuoteRow key={q.id} quote={q} onChanged={onChanged} />) : (
                    <p className="empty">No hay proyectos {all ? '' : 'en curso'}. Crea un brief cuando termines de conversar con un cliente.</p>
                )}
            </section>
        </div>
    );
};

const NewBrief = ({ onCreated }) => {
    const empty = { name: '', email: '', phone: '', note: '' };
    const [f, setF] = useState(empty);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { data, error: err } = await supabase.rpc('admin_create_brief', { p_name: f.name, p_email: f.email, p_phone: f.phone, p_note: f.note });
        setBusy(false);
        if (err) return setError(errText(err));
        const row = data?.[0];
        setF(empty);
        onCreated({ id: row.id, token: row.token, client_name: f.name, client_email: f.email, client_phone: f.phone, created_at: new Date().toISOString() });
    };

    return (
        <section className="panel">
            <div className="box-title"><b>Nuevo brief</b><span>Después de conversar con el cliente</span></div>
            <form className="box-body" onSubmit={submit} noValidate>
                <div className="admin-form">
                    <label className="field">Nombre del cliente<input value={f.name} onChange={set('name')} maxLength={120} required /></label>
                    <label className="field">Correo<input type="email" value={f.email} onChange={set('email')} maxLength={254} autoCapitalize="none" /></label>
                    <label className="field">WhatsApp<input type="tel" value={f.phone} onChange={set('phone')} maxLength={30} placeholder="+56 9 1234 5678" /></label>
                    <label className="field wide">Nota interna <em>(no la ve el cliente)</em><input value={f.note} onChange={set('note')} maxLength={1000} placeholder="Qué conversamos: quiere tienda, viene recomendado por…" /></label>
                </div>
                {error && <p className="alert" role="alert">{error}</p>}
                <div className="admin-actions">
                    <button type="submit" className="btn signal" disabled={busy}>{busy ? 'Creando…' : 'Crear enlace →'}</button>
                    <span className="muted" style={{ fontSize: 13 }}>El cliente lo llena sin crear cuenta. Tú le mandas el enlace.</span>
                </div>
            </form>
        </section>
    );
};

// Enlace del brief: copiarlo o mandarlo por WhatsApp o correo.
const LinkBox = ({ quote: q, onClose }) => {
    const [copied, setCopied] = useState('');
    const copy = async (what, value) => setCopied(await copyText(value) ? what : 'error');
    const wa = waLink(q.client_phone);
    const message = briefMessage(q);
    return (
        <section className="panel">
            <div className="box-title">
                <b>Enlace del brief · {briefNumber(q)}</b>
                <button type="button" className="textlink" onClick={onClose}>Cerrar</button>
            </div>
            <div className="box-body">
                <input className="admin-input" readOnly value={briefLink(q)} onFocus={(e) => e.target.select()} aria-label="Enlace del brief" />
                <div className="admin-actions">
                    <button type="button" className="btn signal" onClick={() => copy('enlace', briefLink(q))}>Copiar enlace</button>
                    <button type="button" className="btn" onClick={() => copy('mensaje', message)}>Copiar mensaje</button>
                    {wa && <a className="textlink" href={`${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>}
                    {q.client_email && <a className="textlink" href={`mailto:${q.client_email}?subject=${encodeURIComponent('Cuéntanos de tu proyecto')}&body=${encodeURIComponent(message)}`}>Enviar por correo</a>}
                </div>
                {copied && (
                    <p className={copied === 'error' ? 'alert' : 'alert ok'} role="status">
                        {copied === 'error' ? 'No se pudo copiar: selecciona el enlace y cópialo a mano.' : `Copiaste el ${copied}.`}
                    </p>
                )}
            </div>
        </section>
    );
};

const QuoteRow = ({ quote: q, onChanged }) => {
    const [status, setStatus] = useState(q.status);
    const [note, setNote] = useState(q.admin_note || '');
    const [open, setOpen] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const sent = !!q.brief_sent_at;
    const brief = sent ? cleanBrief(q.brief) : null;
    const st = QUOTE_STATUS[q.status] || { label: q.status, cls: '' };
    const wa = waLink(brief?.telefono || q.client_phone);
    const email = brief?.correo || q.client_email;
    const progress = sent ? `brief enviado el ${new Date(q.brief_sent_at).toLocaleDateString('es-CL')}`
        : q.brief_saved_at ? 'lo empezó a llenar' : 'aún no guarda nada';

    const save = async () => {
        setBusy(true);
        setError('');
        const { error: err } = await supabase.rpc('admin_update_quote', { p_id: q.id, p_status: status, p_note: note });
        setBusy(false);
        if (err) return setError(errText(err));
        onChanged();
    };

    return (
        <article className="ticket">
            <div className="t-top">
                <h3>{q.client_name}{brief?.negocio ? ` · ${brief.negocio}` : ''}</h3>
                <span className={`pill ${st.cls}`}>{st.label}</span>
            </div>
            <span className="meta">
                {briefNumber(q)} · creado el {new Date(q.created_at).toLocaleDateString('es-CL')} · {progress}{email ? ` · ${email}` : ''}
            </span>
            {sent && (
                <button type="button" className="textlink" style={{ justifySelf: 'start' }} onClick={() => setOpen((v) => !v)}>{open ? 'Ocultar brief' : 'Ver brief'}</button>
            )}
            {open && brief && (
                <dl className="brief-summary" style={{ padding: 0 }}>
                    {briefRows(brief, { team: true }).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
            )}
            <div className="admin-actions">
                <select className="admin-input" style={{ maxWidth: 240 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Estado">
                    {Object.entries(QUOTE_STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
                </select>
                <input className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Nota interna (no la ve el cliente)" aria-label="Nota interna" />
                <button type="button" className="btn signal" disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar →'}</button>
            </div>
            <div className="admin-actions">
                <button type="button" className="textlink" onClick={() => setShowLink((v) => !v)}>{showLink ? 'Ocultar enlace' : 'Enlace del brief'}</button>
                {wa && <a className="textlink" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
                {email && <a className="textlink" href={`mailto:${email}`}>Correo</a>}
            </div>
            {showLink && <LinkBox quote={q} onClose={() => setShowLink(false)} />}
            {error && <p className="alert" role="alert">{error}</p>}
        </article>
    );
};

// Pedidos --------------------------------------------------------------------------------
const NEXT = {
    pendiente: { to: 'pagado', label: 'Confirmar pago' },
    pagado: { to: 'activo', label: 'Activar' },
};

const Orders = ({ orders, byId, onChanged }) => {
    const [all, setAll] = useState(false);
    const list = all ? orders : orders.filter(isOpenOrder);
    return (
        <section className="panel">
            <div className="box-title">
                <b>{all ? 'Todos los pedidos' : 'Pedidos por atender'}</b>
                <button type="button" className="textlink" onClick={() => setAll((v) => !v)}>{all ? 'Ver solo por atender' : `Ver todos (${orders.length})`}</button>
            </div>
            {list.length ? list.map((o) => <OrderRow key={o.id} order={o} client={byId[o.user_id]} onChanged={onChanged} />) : (
                <p className="empty">No hay pedidos {all ? '' : 'por atender'}.</p>
            )}
        </section>
    );
};

const OrderRow = ({ order: o, client, onChanged }) => {
    const [note, setNote] = useState(o.admin_note || '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const plan = OFFERS[o.kind]?.years[o.years] || OFFERS[o.kind]?.years[1];
    const h = o.holder || {};
    const email = client?.contact_email || client?.email;
    const wa = waLink(h.phone || client?.phone);

    const save = async (status) => {
        setBusy(true);
        setError('');
        const { error: err } = await supabase.rpc('admin_update_order', { p_id: o.id, p_status: status, p_note: note });
        setBusy(false);
        if (err) return setError(errText(err));
        onChanged();
    };

    // Tarjeta sin completar: no hubo cobro, no se confirma a mano
    const next = isUnpaidCard(o) ? null : NEXT[o.status];
    // Pedido de dominio para el mismo dominio que ya está en la ficha = renovación
    const renewal = o.kind === 'dominio' && o.status !== 'activo' && !!o.domain && client?.domain_name === o.domain;
    const mailSubject = encodeURIComponent(`Tu pedido ${OFFERS[o.kind]?.title || ''}${o.domain ? ` · ${o.domain}` : ''}`);

    return (
        <article className="ticket">
            <div className="t-top">
                <h3>{renewal ? 'Renovación · ' : ''}{OFFERS[o.kind]?.title || o.kind}{o.domain ? ` · ${o.domain}` : ''}</h3>
                <span className={`pill ${orderStatus(o).cls}`}>{orderStatus(o).label}</span>
            </div>
            <span className="meta">
                N.º {o.id} · {new Date(o.created_at).toLocaleDateString('es-CL')} · {plan ? `${plan.label} · ${clp(o.amount ?? conIva(plan.price))} IVA incl.` : ''} · {PAYS[o.payment_method]?.label || o.payment_method}
                {o.payment_method === 'webpay' && o.payment_info?.authorization_code && ` · Aut. ${o.payment_info.authorization_code}${o.payment_info.card_last4 ? ` · **** ${o.payment_info.card_last4}` : ''}`}
                {o.payment_method === 'mp' && o.payment_info?.mp_payment_id && ` · Pago MP ${o.payment_info.mp_payment_id}${o.payment_info.card_last4 ? ` · **** ${o.payment_info.card_last4}` : ''}`}
                {o.payment_info?.revisar && ' · REVISAR MONTO'}
            </span>
            <p className="desc">
                <b>{clientLabel(client)}</b>{email ? ` · ${email}` : ''}
                {h.holder_name && <><br />Titular ({h.holder_kind || 'persona'}): {h.holder_name} · RUT {h.rut || '—'} · {h.address || 'sin dirección'}</>}
            </p>
            <div className="admin-actions">
                <input className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Nota que verá el cliente (opcional)" aria-label="Nota para el cliente" />
                {next && <button type="button" className="btn signal" disabled={busy} onClick={() => save(next.to)}>{next.label} →</button>}
                <button type="button" className="btn" disabled={busy} onClick={() => save(o.status)}>Guardar nota</button>
                {o.status !== 'cancelado' && o.status !== 'activo' && (
                    <button type="button" className="textlink" disabled={busy} onClick={() => window.confirm('¿Cancelar este pedido?') && save('cancelado')}>Cancelar pedido</button>
                )}
                {email && <a className="textlink" href={`mailto:${email}?subject=${mailSubject}`}>Correo</a>}
                {wa && <a className="textlink" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
            </div>
            {o.status === 'pagado' && renewal && (
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>Renueva primero en NIC. Al activar, el vencimiento de la ficha se extiende {o.years} {o.years === 1 ? 'año' : 'años'} (desde la fecha actual si ya venció; corrígela en Clientes si NIC indica otra).</p>
            )}
            {o.status === 'pagado' && !renewal && (o.kind === 'dominio' || o.kind === 'pack') && (
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>Al activar, la ficha del cliente queda con el dominio y vence en {o.years} {o.years === 1 ? 'año' : 'años'}.</p>
            )}
            {error && <p className="alert" role="alert">{error}</p>}
        </article>
    );
};

// Clientes -------------------------------------------------------------------------------
// Avisos de la ficha que piden acción: fechas vencidas o datos que faltan.
const clientWarnings = (p) => {
    const out = [];
    const exp = daysFrom(parseDate(p.domain_expires));
    const pay = daysFrom(parseDate(p.next_payment_date));
    if (p.domain_name && exp === null) out.push('Dominio sin fecha de vencimiento: no le llegará el aviso de renovación');
    if (p.domain_name && p.domain_name !== cleanDomain(p.domain_name)) out.push(`El dominio debería ser ${cleanDomain(p.domain_name)}`);
    if (pay !== null && pay < 0) out.push('El próximo pago tiene una fecha que ya pasó');
    return out;
};

const Clients = ({ profiles, orders, documents, notes, onChanged }) => {
    const [q, setQ] = useState('');
    const [editing, setEditing] = useState(null);
    const term = q.trim().toLowerCase();
    const list = profiles.filter((p) => !term || [p.client_name, p.email, p.contact_email, p.domain_name, p.active_web, p.holder_name, p.rut]
        .some((v) => String(v || '').toLowerCase().includes(term)));

    return (
        <section className="panel">
            <div className="box-title">
                <b>Clientes ({profiles.length})</b>
                <input className="admin-input" style={{ maxWidth: 260 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, correo, dominio o RUT" aria-label="Buscar cliente" />
            </div>
            {list.map((p) => {
                const mine = orders.filter((o) => o.user_id === p.id);
                const docs = documents.filter((d) => d.user_id === p.id);
                const active = hasServices(p, mine);
                const exp = parseDate(p.domain_expires);
                const left = daysFrom(exp);
                const warnings = clientWarnings(p);
                return (
                    <article className="ticket" key={p.id}>
                        <div className="t-top">
                            <h3>{clientLabel(p)}</h3>
                            <span className={`pill ${active ? 'ok' : ''}`}>{active ? 'Cliente' : 'Sin servicios'}</span>
                        </div>
                        <span className="meta">
                            {p.contact_email || p.email}{p.phone ? ` · ${p.phone}` : ''} · {mine.length} {mine.length === 1 ? 'pedido' : 'pedidos'} · {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                        </span>
                        <p className="desc">
                            {p.domain_name || p.active_web || 'Sin dominio ni sitio'}
                            {exp && <> · vence {fmt(exp)} <b className={left < 0 ? 'st-bad' : left <= 30 ? 'st-warn' : ''}>({left < 0 ? `vencido hace ${-left} ${dayWord(left)}` : `quedan ${left} ${dayWord(left)}`})</b></>}
                            {p.hosting_plan && <> · {p.hosting_plan}</>}
                            {p.rut && <><br />Titular: {p.holder_name || '—'} · RUT {p.rut}</>}
                            {notes[p.id] && <><br /><i>Nota: {notes[p.id]}</i></>}
                        </p>
                        {warnings.map((w) => <p key={w} className="st-warn" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>⚠ {w}</p>)}
                        {editing === p.id ? (
                            <ClientEditor profile={p} documents={docs} note={notes[p.id] || ''} onClose={() => setEditing(null)} onChanged={onChanged} />
                        ) : (
                            <div className="admin-actions">
                                <button type="button" className="btn" onClick={() => setEditing(p.id)}>Editar ficha</button>
                                {waLink(p.phone) && <a className="textlink" href={waLink(p.phone)} target="_blank" rel="noreferrer">WhatsApp</a>}
                            </div>
                        )}
                    </article>
                );
            })}
            {!list.length && <p className="empty">Nadie coincide con “{q}”.</p>}
        </section>
    );
};

const CLIENT_TABS = [
    ['servicios', 'Servicios'],
    ['hosting', 'Hosting y correos'],
    ['titular', 'Titular'],
    ['documentos', 'Documentos'],
    ['nota', 'Nota interna'],
];

// Ficha del cliente con pestañas. Cada pestaña guarda solo sus campos.
const ClientEditor = ({ profile: p, documents, note, onClose, onChanged }) => {
    const [tab, setTab] = useState('servicios');
    const [msg, setMsg] = useState(null); // { ok, text }

    // Guarda los campos de la pestaña con admin_update_profile.
    const saveProfile = async (fields) => {
        setMsg(null);
        const { error } = await supabase.rpc('admin_update_profile', { p_id: p.id, p: fields });
        if (error) return setMsg({ ok: false, text: errText(error) });
        setMsg({ ok: true, text: 'Guardado. El cliente ya lo ve en su portal.' });
        onChanged();
    };

    return (
        <div className="client-editor">
            <div className="tabs" role="tablist" aria-label="Secciones de la ficha">
                {CLIENT_TABS.map(([id, label]) => (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setMsg(null); }}>
                        {label}{id === 'documentos' && documents.length > 0 && <span className="count">{documents.length}</span>}
                    </button>
                ))}
            </div>
            {tab === 'servicios' && <ServicesTab profile={p} onSave={saveProfile} />}
            {tab === 'hosting' && <HostingTab profile={p} onSave={saveProfile} />}
            {tab === 'titular' && <HolderTab profile={p} onSave={saveProfile} />}
            {tab === 'documentos' && <DocumentsTab profile={p} documents={documents} onChanged={onChanged} />}
            {tab === 'nota' && <NoteTab profile={p} note={note} onSaved={(text) => { setMsg({ ok: true, text }); onChanged(); }} />}
            {msg && <p className={msg.ok ? 'alert ok' : 'alert'} role="status">{msg.text}</p>}
            <div><button type="button" className="textlink" onClick={onClose}>Cerrar ficha</button></div>
        </div>
    );
};

// Formulario de una pestaña: estado propio + botón Guardar.
const useTabForm = (initial) => {
    const [f, setF] = useState(initial);
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
    const run = async (fn) => {
        setBusy(true);
        try { await fn(); } finally { setBusy(false); }
    };
    return { f, setF, set, busy, run };
};

const SaveButton = ({ busy }) => (
    <div className="admin-actions wide">
        <button type="submit" className="btn signal" disabled={busy}>{busy ? 'Guardando…' : 'Guardar →'}</button>
    </div>
);

const ServicesTab = ({ profile: p, onSave }) => {
    const { f, setF, set, busy, run } = useTabForm({
        domain_name: p.domain_name || '',
        domain_expires: p.domain_expires || '',
        active_web: p.active_web || '',
        site_status: p.site_status || 'online',
        billing_cycle: p.billing_cycle || '',
        payment_method: p.payment_method || '',
        next_payment_date: p.next_payment_date || '',
    });
    const exp = daysFrom(parseDate(f.domain_expires));
    const pay = daysFrom(parseDate(f.next_payment_date));
    const legacyPay = f.payment_method && !PAY_METHODS.includes(f.payment_method);

    const submit = (e) => {
        e.preventDefault();
        run(() => onSave({ ...f, domain_name: cleanDomain(f.domain_name) }));
    };

    return (
        <form className="admin-form" onSubmit={submit} noValidate>
            <label className="field">Dominio
                <input value={f.domain_name} onChange={set('domain_name')} onBlur={() => setF((x) => ({ ...x, domain_name: cleanDomain(x.domain_name) }))} placeholder="minegocio.cl" autoCapitalize="none" />
            </label>
            <label className="field">Vence el
                <input type="date" value={f.domain_expires} onChange={set('domain_expires')} />
                {f.domain_name && !f.domain_expires && <em className="st-warn">Sin fecha no hay aviso de renovación</em>}
                {exp !== null && exp < 0 && <em className="st-bad">Ya venció</em>}
            </label>
            <label className="field">Sitio web<input value={f.active_web} onChange={set('active_web')} placeholder="www.minegocio.cl" autoCapitalize="none" /></label>
            <label className="field">Estado del sitio
                <select value={f.site_status} onChange={set('site_status')}>
                    <option value="online">En línea</option>
                    <option value="mantenimiento">En mantención</option>
                    <option value="caido">Caído</option>
                </select>
            </label>
            <label className="field">Ciclo de pago
                <select value={f.billing_cycle} onChange={set('billing_cycle')}>
                    <option value="">Sin definir</option>
                    <option value="anual">Anual</option>
                    <option value="mensual">Mensual</option>
                </select>
            </label>
            <label className="field">Medio de pago <em>(lo ve el cliente)</em>
                <select value={f.payment_method} onChange={set('payment_method')}>
                    <option value="">Sin definir</option>
                    {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    {legacyPay && <option value={f.payment_method}>{f.payment_method} (anterior)</option>}
                </select>
            </label>
            <label className="field">Próximo pago
                <input type="date" value={f.next_payment_date} onChange={set('next_payment_date')} />
                {pay !== null && pay < 0 && <em className="st-bad">Esta fecha ya pasó</em>}
                {f.domain_expires && f.next_payment_date !== f.domain_expires && (
                    <button type="button" className="textlink" style={{ justifySelf: 'start', textTransform: 'none', letterSpacing: 0 }} onClick={() => setF((x) => ({ ...x, next_payment_date: x.domain_expires }))}>
                        Igual al vencimiento del dominio
                    </button>
                )}
            </label>
            <SaveButton busy={busy} />
        </form>
    );
};

const HostingTab = ({ profile: p, onSave }) => {
    const { f, setF, set, busy, run } = useTabForm({
        hosting_plan: p.hosting_plan || '',
        storage_limit: p.storage_limit || '',
        disk_usage: p.disk_usage || '',
        email_count: p.email_count || '',
        emails: Array.isArray(p.additional_emails) ? p.additional_emails.filter(Boolean) : [],
    });
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const known = HOSTING_PLANS.some((h) => h.id === f.hosting_plan);
    const limit = parseInt(f.email_count, 10) || 0;

    // Al elegir un plan de la lista, el espacio y el cupo de correos se completan solos.
    const pickPlan = (e) => {
        const plan = HOSTING_PLANS.find((h) => h.id === e.target.value);
        setF((x) => ({
            ...x,
            hosting_plan: e.target.value,
            ...(plan ? { storage_limit: plan.storage, email_count: plan.emails } : {}),
            ...(e.target.value === '' ? { storage_limit: '', email_count: '' } : {}),
        }));
    };

    const addEmail = () => {
        const e = newEmail.trim().toLowerCase();
        setError('');
        if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e)) return setError('Escribe un correo completo, por ejemplo contacto@minegocio.cl.');
        if (f.emails.includes(e)) return setError('Ese correo ya está en la lista.');
        if (limit && f.emails.length >= limit) return setError(`El plan tiene ${limit} correos. Sube el cupo si contrató más.`);
        setF((x) => ({ ...x, emails: [...x.emails, e] }));
        setNewEmail('');
    };

    const submit = (e) => {
        e.preventDefault();
        const { emails, ...rest } = f;
        run(() => onSave({ ...rest, additional_emails: emails }));
    };

    return (
        <form className="admin-form" onSubmit={submit} noValidate>
            <label className="field">Plan de hosting <em>(lo ve el cliente)</em>
                <select value={f.hosting_plan} onChange={pickPlan}>
                    <option value="">Sin hosting</option>
                    {HOSTING_PLANS.map((h) => <option key={h.id} value={h.id}>{h.id} ({h.emails} correos, {h.storage})</option>)}
                    {f.hosting_plan && !known && <option value={f.hosting_plan}>Plan anterior: {f.hosting_plan}</option>}
                </select>
            </label>
            <label className="field">Espacio contratado<input value={f.storage_limit} onChange={set('storage_limit')} placeholder="5 GB" /></label>
            <label className="field">Espacio usado <em>(míralo en cPanel)</em><input value={f.disk_usage} onChange={set('disk_usage')} placeholder="12%" /></label>
            <label className="field">Cupo de correos<input type="number" min="0" max="50" value={f.email_count} onChange={set('email_count')} /></label>

            <div className="wide" style={{ display: 'grid', gap: 8 }}>
                <span className="field">Correos del cliente ({f.emails.length}{limit ? ` de ${limit}` : ''})</span>
                {f.emails.length > 0 && (
                    <ul className="mail-list" style={{ margin: 0 }}>
                        {f.emails.map((m) => (
                            <li key={m}>
                                <code>{m}</code>
                                <button type="button" onClick={() => setF((x) => ({ ...x, emails: x.emails.filter((y) => y !== m) }))}>Quitar</button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="admin-actions">
                    <input className="admin-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }} placeholder={`contacto@${p.domain_name || 'minegocio.cl'}`} autoCapitalize="none" aria-label="Nuevo correo" />
                    <button type="button" className="btn" onClick={addEmail}>Agregar</button>
                </div>
                <span className="muted" style={{ fontSize: 13 }}>Primero créalo en cPanel; aquí solo se anota para que el cliente lo vea en su portal.</span>
            </div>
            {error && <p className="alert wide" role="alert">{error}</p>}
            <SaveButton busy={busy} />
        </form>
    );
};

const HolderTab = ({ profile: p, onSave }) => {
    const { f, set, busy, run } = useTabForm({
        client_name: p.client_name || '',
        contact_email: p.contact_email || '',
        phone: p.phone || '',
        holder_kind: p.holder_kind || 'persona',
        holder_name: p.holder_name || '',
        rut: p.rut || '',
        address: p.address || '',
    });
    const badRut = f.rut.trim() && !rutOk(f.rut);

    return (
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); run(() => onSave(f)); }} noValidate>
            <label className="field">Nombre en el portal<input value={f.client_name} onChange={set('client_name')} maxLength={120} /></label>
            <label className="field">Correo de contacto<input type="email" value={f.contact_email} onChange={set('contact_email')} placeholder={p.email} autoCapitalize="none" /></label>
            <label className="field">Teléfono / WhatsApp<input type="tel" value={f.phone} onChange={set('phone')} maxLength={30} /></label>
            <label className="field">Titular de los dominios
                <select value={f.holder_kind} onChange={set('holder_kind')}>
                    <option value="persona">Persona</option>
                    <option value="empresa">Empresa</option>
                </select>
            </label>
            <label className="field">{f.holder_kind === 'empresa' ? 'Razón social' : 'Nombre completo'}<input value={f.holder_name} onChange={set('holder_name')} maxLength={120} /></label>
            <label className="field">RUT
                <input value={f.rut} onChange={set('rut')} maxLength={20} placeholder="76.123.456-7" />
                {badRut && <em className="st-bad">El dígito verificador no calza</em>}
            </label>
            <label className="field wide">Dirección<input value={f.address} onChange={set('address')} maxLength={200} /></label>
            <SaveButton busy={busy} />
        </form>
    );
};

// Nombre de archivo seguro para el bucket: sin tildes ni espacios.
const safeFileName = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(-80);

const MAX_DOC_BYTES = 10 * 1024 * 1024;

const DocumentsTab = ({ profile: p, documents, onChanged }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [inputKey, setInputKey] = useState(0);
    const [busy, setBusy] = useState(null);
    const [msg, setMsg] = useState(null);

    const upload = async (e) => {
        e.preventDefault();
        setMsg(null);
        if (title.trim().length < 2) return setMsg({ ok: false, text: 'Escribe el título que verá el cliente.' });
        if (!file) return setMsg({ ok: false, text: 'Elige el archivo.' });
        if (file.size > MAX_DOC_BYTES) return setMsg({ ok: false, text: 'El archivo pesa más de 10 MB.' });
        setBusy('subir');
        // Carpeta por cliente: el archivo es solo de este documento.
        const path = `${p.id}/${Date.now()}-${safeFileName(file.name)}`;
        const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type });
        if (upErr) {
            setBusy(null);
            return setMsg({ ok: false, text: /mime|type/i.test(upErr.message) ? 'Solo PDF, JPG, PNG o WEBP.' : 'No se pudo subir el archivo. Intenta de nuevo.' });
        }
        const { error: rpcErr } = await supabase.rpc('admin_add_document', { p_user: p.id, p_title: title, p_path: path });
        if (rpcErr) {
            await supabase.storage.from('documents').remove([path]);
            setBusy(null);
            return setMsg({ ok: false, text: errText(rpcErr) });
        }
        setBusy(null);
        setTitle('');
        setFile(null);
        setInputKey((k) => k + 1);
        setMsg({ ok: true, text: 'Listo: el cliente ya lo ve en Documentos.' });
        onChanged();
    };

    const open = async (d) => {
        const { data } = await supabase.storage.from('documents').createSignedUrl(d.file_url, 60);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
        else setMsg({ ok: false, text: `No se pudo abrir "${d.title}".` });
    };

    const remove = async (d) => {
        if (!window.confirm(`¿Quitar "${d.title}" del portal del cliente?`)) return;
        setBusy(d.id);
        setMsg(null);
        const { data: path, error } = await supabase.rpc('admin_delete_document', { p_id: d.id });
        // El archivo se borra solo si es de la carpeta de este cliente: los
        // antiguos (en la raíz del bucket) pueden estar compartidos con otros.
        if (!error && path?.startsWith(`${p.id}/`)) await supabase.storage.from('documents').remove([path]);
        setBusy(null);
        if (error) return setMsg({ ok: false, text: errText(error) });
        onChanged();
    };

    return (
        <div className="admin-form">
            <div className="wide">
                {documents.length ? (
                    <ul className="doc-list" style={{ border: '1px solid var(--rule)' }}>
                        {documents.map((d) => (
                            <li key={d.id}>
                                <span>{d.title}<small>{new Date(d.created_at).toLocaleDateString('es-CL')}</small></span>
                                <span className="admin-actions" style={{ flex: 'none' }}>
                                    <button type="button" onClick={() => open(d)}>Ver</button>
                                    <button type="button" onClick={() => remove(d)} disabled={busy === d.id}>{busy === d.id ? 'Quitando…' : 'Quitar'}</button>
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="muted" style={{ margin: 0 }}>Este cliente no tiene documentos.</p>}
            </div>
            <form className="admin-form wide" onSubmit={upload} noValidate>
                <label className="field">Título <em>(lo ve el cliente)</em>
                    <input list="doc-titles" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Contrato, Factura N.º 12…" />
                    <datalist id="doc-titles">{DOC_TITLES.map((t) => <option key={t} value={t} />)}</datalist>
                </label>
                <label className="field">Archivo <em>(PDF o imagen, hasta 10 MB)</em>
                    <input key={inputKey} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <div className="admin-actions wide">
                    <button type="submit" className="btn signal" disabled={busy === 'subir'}>{busy === 'subir' ? 'Subiendo…' : 'Subir documento →'}</button>
                </div>
            </form>
            {msg && <p className={msg.ok ? 'alert ok wide' : 'alert wide'} role="status">{msg.text}</p>}
        </div>
    );
};

const NoteTab = ({ profile: p, note, onSaved }) => {
    const [text, setText] = useState(note);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error: err } = await supabase.rpc('admin_set_client_note', { p_id: p.id, p_note: text });
        setBusy(false);
        if (err) return setError(errText(err));
        onSaved('Nota guardada. El cliente no la ve.');
    };

    return (
        <form className="admin-form" onSubmit={submit} noValidate>
            <label className="field wide">Nota interna <em>(solo la ves tú: otros dominios, acuerdos, contrato anterior…)</em>
                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={3000} rows={5} />
            </label>
            {error && <p className="alert wide" role="alert">{error}</p>}
            <SaveButton busy={busy} />
        </form>
    );
};

// Soporte --------------------------------------------------------------------------------
const Tickets = ({ tickets, byId, onChanged }) => {
    const [all, setAll] = useState(false);
    const list = all ? tickets : tickets.filter(isOpen);
    return (
        <section className="panel">
            <div className="box-title">
                <b>{all ? 'Todas las solicitudes' : 'Solicitudes abiertas'}</b>
                <button type="button" className="textlink" onClick={() => setAll((v) => !v)}>{all ? 'Ver solo abiertas' : `Ver todas (${tickets.length})`}</button>
            </div>
            {list.length ? list.map((t) => <TicketRow key={t.id} ticket={t} client={byId[t.user_id]} onChanged={onChanged} />) : (
                <p className="empty">No hay solicitudes {all ? '' : 'abiertas'}.</p>
            )}
        </section>
    );
};

const TicketRow = ({ ticket: t, client, onChanged }) => {
    const [status, setStatus] = useState(TICKET_STATUS[t.status] ? t.status : 'pending');
    const [reply, setReply] = useState(t.admin_response || '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const save = async () => {
        setBusy(true);
        setError('');
        const { error: err } = await supabase.rpc('admin_update_ticket', { p_id: t.id, p_status: status, p_response: reply });
        setBusy(false);
        if (err) return setError(errText(err));
        onChanged();
    };

    return (
        <article className="ticket">
            <div className="t-top">
                <h3>{t.title}</h3>
                <span className={`pill ${TICKET_STATUS[t.status]?.cls || 'hot'}`}>{TICKET_STATUS[t.status]?.label || t.status}</span>
            </div>
            <span className="meta">{clientLabel(client)} · {catLabel(t.category)} · {new Date(t.created_at).toLocaleDateString('es-CL')}</span>
            <p className="desc">{t.description}</p>
            <label className="field">Respuesta (la ve el cliente en su portal)
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={3000} rows={3} />
            </label>
            <div className="admin-actions">
                <select className="admin-input" style={{ maxWidth: 180 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Estado">
                    {Object.entries(TICKET_STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
                </select>
                <button type="button" className="btn signal" disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar →'}</button>
            </div>
            {error && <p className="alert" role="alert">{error}</p>}
        </article>
    );
};

export default Admin;
