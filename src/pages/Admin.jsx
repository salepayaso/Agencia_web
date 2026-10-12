import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import Wordmark from '../components/Wordmark';
import { PortalLoading } from '../components/ProtectedRoute';
import { OFFERS, conIva, PAYS, clp, isOpenOrder, isUnpaidCard, orderStatus } from '../lib/orders';
import { catLabel, TICKET_STATUS, isOpen, parseDate, fmt, daysFrom, dayWord, hasServices } from '../lib/portal';

// Panel de administración (/admin): pedidos, clientes y soporte sin entrar a Supabase.
// Solo para cuentas en la tabla admins (supabase_scripts/admin_panel_2026_09_30.sql).
// Lee con las políticas "Admin can view all ..." y cambia datos SOLO con las
// funciones admin_update_order / admin_update_ticket / admin_update_client,
// que vuelven a revisar is_admin() en la base. Ocultar esta página no es la
// seguridad: la seguridad está en la base.

const ERRORS = {
    no_autorizado: 'Tu cuenta no tiene permiso de administrador.',
    estado_invalido: 'Ese estado no es válido.',
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

    const load = useCallback(async () => {
        const [p, o, t] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        ]);
        setProfiles(p.data || []);
        setOrders(o.data || []);
        setTickets(t.data || []);
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
                                {tabBtn('pedidos', 'Pedidos', waiting.length + paid.length)}
                                {tabBtn('clientes', 'Clientes')}
                                {tabBtn('soporte', 'Soporte', openTickets.length)}
                            </div>
                        </div>

                        <div style={{ paddingBottom: 80 }}>
                            {tab === 'hoy' && (
                                <Today waiting={waiting} paid={paid} openTickets={openTickets} expiring={expiring} goTo={setTab} />
                            )}
                            {tab === 'pedidos' && <Orders orders={orders} byId={byId} onChanged={load} />}
                            {tab === 'clientes' && <Clients profiles={profiles} orders={orders} onChanged={load} />}
                            {tab === 'soporte' && <Tickets tickets={tickets} byId={byId} onChanged={load} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Hoy: lo que requiere acción ----------------------------------------------------------
const Today = ({ waiting, paid, openTickets, expiring, goTo }) => {
    const tiles = [
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
const Clients = ({ profiles, orders, onChanged }) => {
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
                const active = hasServices(p, mine);
                const exp = parseDate(p.domain_expires);
                const left = daysFrom(exp);
                return (
                    <article className="ticket" key={p.id}>
                        <div className="t-top">
                            <h3>{clientLabel(p)}</h3>
                            <span className={`pill ${active ? 'ok' : ''}`}>{active ? 'Cliente' : 'Sin servicios'}</span>
                        </div>
                        <span className="meta">
                            {p.contact_email || p.email}{p.phone ? ` · ${p.phone}` : ''} · {mine.length} {mine.length === 1 ? 'pedido' : 'pedidos'}
                        </span>
                        <p className="desc">
                            {p.domain_name || p.active_web || 'Sin dominio ni sitio'}
                            {exp && <> · vence {fmt(exp)} <b className={left < 0 ? 'st-bad' : left <= 30 ? 'st-warn' : ''}>({left < 0 ? `vencido hace ${-left} ${dayWord(left)}` : `quedan ${left} ${dayWord(left)}`})</b></>}
                            {p.rut && <><br />Titular: {p.holder_name || '—'} · RUT {p.rut}</>}
                        </p>
                        {editing === p.id ? (
                            <ClientForm profile={p} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />
                        ) : (
                            <div className="admin-actions">
                                <button type="button" className="btn" onClick={() => setEditing(p.id)}>Editar servicios</button>
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

const ClientForm = ({ profile: p, onClose, onSaved }) => {
    const [f, setF] = useState({
        domain_name: p.domain_name || '',
        domain_expires: p.domain_expires || '',
        active_web: p.active_web || '',
        site_status: p.site_status || 'online',
        hosting_plan: p.hosting_plan || '',
        billing_cycle: p.billing_cycle || '',
        payment_method: p.payment_method || '',
        next_payment_date: p.next_payment_date || '',
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error: err } = await supabase.rpc('admin_update_client', {
            p_id: p.id,
            p_domain_name: f.domain_name,
            p_domain_expires: f.domain_expires || null,
            p_active_web: f.active_web,
            p_site_status: f.site_status,
            p_hosting_plan: f.hosting_plan,
            p_billing_cycle: f.billing_cycle,
            p_payment_method: f.payment_method,
            p_next_payment_date: f.next_payment_date || null,
        });
        setBusy(false);
        if (err) return setError(errText(err));
        onSaved();
    };

    return (
        <form className="admin-form" onSubmit={submit} noValidate>
            <label className="field">Dominio<input value={f.domain_name} onChange={set('domain_name')} placeholder="minegocio.cl" autoCapitalize="none" /></label>
            <label className="field">Vence el<input type="date" value={f.domain_expires} onChange={set('domain_expires')} /></label>
            <label className="field">Sitio web<input value={f.active_web} onChange={set('active_web')} placeholder="www.minegocio.cl" autoCapitalize="none" /></label>
            <label className="field">Estado del sitio
                <select value={f.site_status} onChange={set('site_status')}>
                    <option value="online">En línea</option>
                    <option value="mantenimiento">En mantención</option>
                    <option value="caido">Caído</option>
                </select>
            </label>
            <label className="field">Plan de hosting<input value={f.hosting_plan} onChange={set('hosting_plan')} placeholder="Hosting con correos" /></label>
            <label className="field">Ciclo de pago
                <select value={f.billing_cycle} onChange={set('billing_cycle')}>
                    <option value="">Sin definir</option>
                    <option value="anual">Anual</option>
                    <option value="mensual">Mensual</option>
                </select>
            </label>
            <label className="field">Medio de pago (lo ve el cliente)<input value={f.payment_method} onChange={set('payment_method')} placeholder="Transferencia" /></label>
            <label className="field">Próximo pago<input type="date" value={f.next_payment_date} onChange={set('next_payment_date')} /></label>
            {error && <p className="alert wide" role="alert">{error}</p>}
            <div className="admin-actions wide">
                <button type="submit" className="btn signal" disabled={busy}>{busy ? 'Guardando…' : 'Guardar →'}</button>
                <button type="button" className="textlink" onClick={onClose}>Cancelar</button>
            </div>
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
