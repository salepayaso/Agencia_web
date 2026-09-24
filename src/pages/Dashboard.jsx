import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import Wordmark from '../components/Wordmark';
import { PortalLoading } from '../components/ProtectedRoute';
import DomainSection from '../components/DomainSection';
import { OFFERS, PAYS, ORDER_STATUS, clp, placeOrder } from '../lib/orders';

// Portal del cliente ("Tu cuenta, en orden"): dominio, plan y pagos, correos,
// estado del sitio, documentos y soporte. Sin estadísticas: esas son internas.
// Los campos domain_name, domain_expires, billing_cycle, payment_method,
// site_status y tickets.category vienen de supabase_scripts/portal_cliente_2026_09_24.sql;
// si todavía no existen, el portal muestra "Por definir" y sigue funcionando.
// Una cuenta nueva (sin servicios) entra directo a "Contratar": dominio, hosting
// o pack. Los pedidos van a la tabla orders (portal_registro_pedidos_2026_09_24.sql).

const CATEGORIES = [
    { id: 'general', label: 'Consulta general' },
    { id: 'contenido', label: 'Cambios en mi sitio' },
    { id: 'correo', label: 'Correos' },
    { id: 'dns', label: 'Cambio de DNS' },
    { id: 'pagos', label: 'Pagos y facturación' },
];
const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || 'Consulta general';

const STATUS = {
    pending: { label: 'En revisión', cls: 'hot' },
    in_progress: { label: 'En curso', cls: 'hot' },
    solved: { label: 'Resuelto', cls: 'ok' },
};
const isOpen = (t) => t.status !== 'solved';

// Fechas 'AAAA-MM-DD' como fecha local (sin correrse un día por la zona horaria)
const parseDate = (v) => {
    if (!v) return null;
    const [y, m, d] = String(v).slice(0, 10).split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
};
const fmt = (d) => d?.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
const daysFrom = (d) => {
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
};
const dayWord = (n) => (Math.abs(n) === 1 ? 'día' : 'días');

const parseEmails = (raw) => {
    try {
        const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch {
        return [];
    }
};

// ¿Tiene algo contratado? Si no, el portal abre en "Contratar" y oculta el resumen vacío.
const hasServices = (p, orders = []) =>
    !!(p?.domain_name || p?.active_web || p?.plan_type || p?.hosting_plan || orders.some((o) => o.status === 'activo'));

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(null); // se decide al cargar
    const [composing, setComposing] = useState(false);

    const loadTickets = useCallback(async (uid) => {
        const { data } = await supabase.from('tickets').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        setTickets(data || []);
    }, []);

    // Si la tabla orders aún no existe, simplemente no hay pedidos que mostrar
    const loadOrders = useCallback(async (uid) => {
        const { data } = await supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        setOrders(data || []);
        return data || [];
    }, []);

    useEffect(() => {
        const load = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) {
                navigate('/login', { replace: true });
                return;
            }
            setUser(u);
            const [{ data: p }, { data: docs }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', u.id).maybeSingle(),
                supabase.from('documents').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
            ]);
            setProfile(p || null);
            setDocuments(docs || []);
            const [, ords] = await Promise.all([loadTickets(u.id), loadOrders(u.id)]);
            setTab(hasServices(p, ords) ? 'resumen' : 'contratar');
            setLoading(false);
        };
        load();
    }, [navigate, loadTickets, loadOrders]);

    const logout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    if (loading) return <PortalLoading />;

    const openTickets = tickets.filter(isOpen);
    const active = hasServices(profile, orders);
    const pendingOrders = orders.filter((o) => o.status === 'pendiente' || o.status === 'pagado');
    const name = profile?.client_name || 'Tu negocio';
    const newRequest = () => { setTab('soporte'); setComposing(true); };

    return (
        <div className="tc-page">
            <SEO title="Mi cuenta" description="Portal de clientes de Interfaz 360." />
            <div className="tc">
                <header className="portal-bar gutter">
                    <div className="max">
                        <Link to="/" className="brand" aria-label="Interfaz 360, ir al sitio">
                            <Wordmark className="text-[20px]" />
                            <small>Portal de clientes</small>
                        </Link>
                        <div className="who">
                            <span title={user?.email}>{profile?.contact_email || user?.email}</span>
                            <button type="button" className="btn" onClick={logout}>Cerrar sesión</button>
                        </div>
                    </div>
                </header>

                <main className="gutter">
                    <div className="max">
                        <div className="portal-head">
                            <div>
                                <span className="eyebrow">Mi cuenta · {name}</span>
                                <h1 className="display" style={{ marginTop: 14 }}>
                                    Tu cuenta, <span>en orden</span>
                                </h1>
                            </div>
                            <div className="tabs" role="tablist" aria-label="Secciones del portal">
                                {active && (
                                    <button type="button" role="tab" aria-selected={tab === 'resumen'} onClick={() => setTab('resumen')}>Resumen</button>
                                )}
                                <button type="button" role="tab" aria-selected={tab === 'contratar'} onClick={() => setTab('contratar')}>
                                    Contratar{pendingOrders.length > 0 && <span className="count">{pendingOrders.length}</span>}
                                </button>
                                <button type="button" role="tab" aria-selected={tab === 'soporte'} onClick={() => setTab('soporte')}>
                                    Soporte{openTickets.length > 0 && <span className="count">{openTickets.length}</span>}
                                </button>
                                <button type="button" role="tab" aria-selected={tab === 'documentos'} onClick={() => setTab('documentos')}>Documentos</button>
                            </div>
                        </div>

                        {tab === 'contratar' && (
                            <Hire user={user} isNew={!active} orders={orders} onOrdered={() => loadOrders(user.id)} />
                        )}
                        {tab === 'resumen' && (
                            <Overview profile={profile} user={user} documents={documents} tickets={tickets} onNewRequest={newRequest} goTo={setTab} />
                        )}
                        {tab === 'soporte' && (
                            <Support
                                user={user}
                                profile={profile}
                                tickets={tickets}
                                composing={composing}
                                setComposing={setComposing}
                                onCreated={() => loadTickets(user.id)}
                            />
                        )}
                        {tab === 'documentos' && <Documents documents={documents} profile={profile} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

/* ---------------- Contratar ---------------- */

const OFFER_CARDS = [
    {
        id: 'dominio',
        price: `Desde ${clp(OFFERS.dominio.years[1].price)}`,
        desc: 'Tu dominio .cl registrado a tu nombre. Te avisamos antes de que venza.',
        cta: 'Buscar dominio →',
    },
    {
        id: 'hosting',
        price: clp(OFFERS.hosting.years[1].price),
        desc: 'Espacio para tu sitio y correos con el nombre de tu empresa. Al activarlo te enviamos los accesos de cPanel por correo.',
        cta: 'Contratar hosting →',
    },
    {
        id: 'pack',
        price: clp(OFFERS.pack.years[1].price),
        desc: `Hosting con correos + dominio .cl, todo listo para partir. Ahorras ${clp(OFFERS.dominio.years[1].price + OFFERS.hosting.years[1].price - OFFERS.pack.years[1].price)} al año.`,
        cta: 'Contratar pack →',
        hot: true,
    },
];

const Hire = ({ user, isNew, orders, onOrdered }) => {
    const [picked, setPicked] = useState(null); // dominio | hosting | pack

    return (
        <div style={{ display: 'grid', gap: 32, paddingBottom: 80 }}>
            {isNew && (
                <section className="panel">
                    <div className="box-title"><b>Tu cuenta está lista</b></div>
                    <div className="box-body">
                        <p className="muted" style={{ margin: 0, fontSize: 16 }}>
                            Todavía no tienes servicios con nosotros. Elige por dónde partir: cuando se active, aquí verás su estado, vencimiento y pagos.
                        </p>
                    </div>
                </section>
            )}

            {picked === 'hosting' ? (
                <HostingOrder user={user} onDone={onOrdered} onCancel={() => setPicked(null)} />
            ) : picked ? (
                <DomainSection embedded kind={picked} onOrdered={onOrdered} onCancel={() => setPicked(null)} />
            ) : (
                <div className="plans offers">
                    {OFFER_CARDS.map((o) => (
                        <article key={o.id} className={`plan-card${o.hot ? ' hot' : ''}`}>
                            <header>
                                <div>
                                    <h3>{OFFERS[o.id].title}</h3>
                                    <small><b style={{ color: 'var(--ink)', fontSize: 20 }}>{o.price}</b> al año</small>
                                </div>
                                {o.hot && <span className="badge">Conviene</span>}
                            </header>
                            <div className="body"><p className="muted" style={{ margin: 0, fontSize: 15 }}>{o.desc}</p></div>
                            <footer>
                                <button type="button" className={`btn ${o.hot ? 'signal' : 'solid'}`} onClick={() => setPicked(o.id)}>{o.cta}</button>
                            </footer>
                        </article>
                    ))}
                </div>
            )}

            <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                ¿Necesitas también la página web, una tienda o un agente IA? <Link to="/servicios#planes" className="textlink">Mira los planes</Link>
            </p>

            <section className="panel">
                <div className="box-title"><b>Tus pedidos</b><span className="muted">{orders.length}</span></div>
                {orders.length ? orders.map((o) => {
                    const st = ORDER_STATUS[o.status] || ORDER_STATUS.pendiente;
                    const plan = OFFERS[o.kind]?.years[o.years] || OFFERS[o.kind]?.years[1];
                    return (
                        <article className="ticket" key={o.id}>
                            <div className="t-top">
                                <h3>{OFFERS[o.kind]?.title || o.kind}{o.domain ? ` · ${o.domain}` : ''}</h3>
                                <span className={`pill ${st.cls}`}>{st.label}</span>
                            </div>
                            <span className="meta">
                                {new Date(o.created_at).toLocaleDateString('es-CL')}{plan ? ` · ${plan.label} · ${clp(plan.price)}` : ''} · {PAYS[o.payment_method]?.label}
                            </span>
                            {o.admin_note && <div className="reply"><b>Nota de Interfaz 360</b>{o.admin_note}</div>}
                            {o.status === 'pendiente' && !o.admin_note && (
                                <p className="desc">Te escribimos al correo con {o.payment_method === 'tr' ? 'los datos para transferir' : 'el enlace de pago'}.</p>
                            )}
                        </article>
                    );
                }) : (
                    <p className="empty">Aún no tienes pedidos.</p>
                )}
            </section>
        </div>
    );
};

const HostingOrder = ({ user, onDone, onCancel }) => {
    const [domain, setDomain] = useState('');
    const [pay, setPay] = useState('webpay');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const price = OFFERS.hosting.years[1].price;

    const submit = async (e) => {
        e.preventDefault();
        const d = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
        if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return setError('Escribe el dominio completo, por ejemplo minegocio.cl.');
        setSending(true);
        setError('');
        try {
            await placeOrder({ user, kind: 'hosting', domain: d, years: 1, pay, holder: null });
            setDone(true);
            onDone?.();
        } catch (err) {
            setError(err?.message === 'limite_diario'
                ? 'Llegaste al máximo de pedidos por hoy. Si necesitas algo más, escríbenos en Soporte.'
                : 'No pudimos enviar el pedido. Intenta de nuevo en un momento.');
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="panel">
            <div className="box-title">
                <b>Hosting con correos · {clp(price)} al año</b>
                <button type="button" className="textlink" onClick={onCancel}>Cerrar</button>
            </div>
            {done ? (
                <div className="box-body">
                    <p className="alert ok" role="status">
                        Recibimos tu pedido. Te escribimos a {user.email} con {pay === 'tr' ? 'los datos para transferir' : 'el enlace de pago'}.
                        Apenas se confirme, activamos tu hosting y te enviamos los accesos de cPanel por correo.
                    </p>
                    <div><button type="button" className="textlink" onClick={onCancel}>Volver a Contratar</button></div>
                </div>
            ) : (
                <form className="box-body" onSubmit={submit} noValidate>
                    <label className="field">¿Para qué dominio?
                        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="minegocio.cl" maxLength={80} autoCapitalize="none" spellCheck={false} />
                    </label>
                    <p className="muted" style={{ margin: 0, fontSize: 14 }}>¿Todavía no tienes dominio? El pack hosting + dominio te sale más barato.</p>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <span className="field">¿Cómo quieres pagar?</span>
                        <div className="toggles" role="radiogroup" aria-label="Forma de pago">
                            {Object.entries(PAYS).map(([id, p]) => (
                                <button key={id} type="button" role="radio" aria-checked={pay === id} aria-pressed={pay === id} onClick={() => setPay(id)} title={p.note}>{p.label}</button>
                            ))}
                        </div>
                    </div>
                    {error && <p className="alert" role="alert">{error}</p>}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn signal" disabled={sending}>{sending ? 'Enviando…' : `Confirmar pedido · ${clp(price)} →`}</button>
                        <span className="muted" style={{ fontSize: 13 }}>No se cobra ahora: te enviamos el pago por correo.</span>
                    </div>
                </form>
            )}
        </section>
    );
};

/* ---------------- Resumen ---------------- */

const Overview = ({ profile, user, documents, tickets, onNewRequest, goTo }) => {
    const emails = parseEmails(profile?.additional_emails);
    const emailLimit = parseInt(profile?.email_count, 10) || null;

    // Dominio
    const domain = profile?.domain_name || profile?.active_web || null;
    const expires = parseDate(profile?.domain_expires);
    const dLeft = daysFrom(expires);
    const domainSt = dLeft === null ? null
        : dLeft < 0 ? { t: 'Vencido', c: 'bad' }
            : dLeft <= 30 ? { t: 'Por vencer', c: 'warn' }
                : { t: 'Vigente', c: '' };

    // Plan y pago
    const plan = [profile?.plan_type, profile?.billing_cycle].filter(Boolean).join(' · ');
    const nextPay = parseDate(profile?.next_payment_date);
    const pLeft = daysFrom(nextPay);
    const paySt = pLeft === null ? null
        : pLeft < 0 ? { t: 'Atrasado', c: 'bad' }
            : pLeft <= 7 ? { t: 'Próximo', c: 'warn' }
                : { t: 'Al día', c: '' };

    // Sitio
    const site = profile?.active_web || null;
    const siteSt = {
        online: { t: 'En línea', s: 'OK', c: '' },
        mantenimiento: { t: 'En mantenimiento', s: 'Aviso', c: 'warn' },
        caido: { t: 'Fuera de línea', s: 'Revisando', c: 'bad' },
    }[profile?.site_status || 'online'];

    const openTickets = tickets.filter(isOpen);
    const lastTicket = tickets[0];
    const allGood = domainSt?.c !== 'bad' && paySt?.c !== 'bad' && siteSt.c !== 'bad';

    return (
        <div className="portal-grid">
            <div className="acct" aria-label="Resumen de tu cuenta">
                <div className="top">
                    <b>Tu cuenta</b>
                    <span className={allGood ? 'st-ok' : 'st-bad'}>{allGood ? '● Todo al día' : '● Hay algo que revisar'}</span>
                </div>
                <dl>
                    <div className="row">
                        <dt>Dominio</dt>
                        <dd>
                            <b>{domain || 'Por definir'}</b>
                            <small>
                                {expires
                                    ? `Vence el ${fmt(expires)} · ${dLeft < 0 ? `venció hace ${-dLeft} ${dayWord(dLeft)}` : `quedan ${dLeft} ${dayWord(dLeft)}`}`
                                    : 'Fecha de vencimiento por cargar'}
                            </small>
                        </dd>
                        {domainSt ? <span className={`st ${domainSt.c}`}>{domainSt.t}</span> : <span className="st ghost">—</span>}
                    </div>
                    <div className="row">
                        <dt>Plan</dt>
                        <dd>
                            <b>{plan || 'Por definir'}</b>
                            <small>
                                {nextPay ? `Próximo pago ${fmt(nextPay)}` : 'Próximo pago por definir'}
                                {profile?.payment_method ? ` · ${profile.payment_method}` : ''}
                            </small>
                        </dd>
                        {paySt ? <span className={`st ${paySt.c}`}>{paySt.t}</span> : <span className="st ghost">—</span>}
                    </div>
                    <div className="row">
                        <dt>Correos</dt>
                        <dd>
                            <b>{emailLimit ? `${emails.length} de ${emailLimit} activos` : `${emails.length} activos`}</b>
                            <small>{emails.length ? emails.map((e) => e.split('@')[0] + '@').join(' · ') : 'Aún no hay correos creados'}</small>
                        </dd>
                        {emailLimit && emailLimit > emails.length
                            ? <span className="st ghost">+ {emailLimit - emails.length} libres</span>
                            : <span className="st">OK</span>}
                    </div>
                    <div className="row">
                        <dt>Sitio web</dt>
                        <dd>
                            <b>{site ? <a href={`https://${site.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{siteSt.t}</a> : 'Por publicar'}</b>
                            <small>{site ? site.replace(/^https?:\/\//, '') : 'Te avisamos cuando esté en línea'}</small>
                        </dd>
                        {site ? <span className={`st ${siteSt.c}`}>{siteSt.s}</span> : <span className="st ghost">—</span>}
                    </div>
                    <div className="row">
                        <dt>Documentos</dt>
                        <dd>
                            <b>{documents.length ? documents.slice(0, 2).map((d) => d.title).join(' · ') : 'Sin documentos aún'}</b>
                            <small>{documents.length ? `${documents.length} ${documents.length === 1 ? 'archivo' : 'archivos'}` : 'Aquí verás tu contrato y facturas'}</small>
                        </dd>
                        {documents.length
                            ? <button type="button" className="st ghost" style={{ background: 'none', cursor: 'pointer' }} onClick={() => goTo('documentos')}>Ver</button>
                            : <span className="st ghost">—</span>}
                    </div>
                    <div className="row">
                        <dt>Soporte</dt>
                        <dd>
                            <b>{lastTicket ? lastTicket.title : 'Sin solicitudes'}</b>
                            <small>{lastTicket ? `${STATUS[lastTicket.status]?.label || 'En revisión'} · ${catLabel(lastTicket.category)}` : '¿Necesitas un cambio? Pídelo aquí'}</small>
                        </dd>
                        {openTickets.length
                            ? <span className="st hot">{openTickets.length} {openTickets.length === 1 ? 'abierta' : 'abiertas'}</span>
                            : <span className="st">Al día</span>}
                    </div>
                </dl>
                {!profile && (
                    <div className="foot">Estamos terminando de cargar tu cuenta. Si ves algo incompleto, escríbenos en Soporte.</div>
                )}
            </div>

            <div style={{ display: 'grid', gap: 28 }}>
                <section className="panel">
                    <div className="box-title"><b>¿Necesitas ayuda?</b></div>
                    <div className="box-body">
                        <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                            Pide cambios en tu sitio, correos nuevos o un cambio de DNS. Respondemos dentro de un día hábil.
                        </p>
                        <div><button type="button" className="btn signal" onClick={onNewRequest}>Nueva solicitud →</button></div>
                    </div>
                </section>

                <section className="panel">
                    <div className="box-title"><b>Tus correos</b><span className="muted">{emails.length}{emailLimit ? ` de ${emailLimit}` : ''}</span></div>
                    <div className="box-body">
                        {emails.length ? (
                            <ul className="mail-list" style={{ margin: 0 }}>
                                {emails.map((e) => <CopyEmail key={e} email={e} />)}
                            </ul>
                        ) : (
                            <p className="muted" style={{ margin: 0, fontSize: 15 }}>Cuando creemos tus correos aparecerán aquí.</p>
                        )}
                    </div>
                </section>

                {(profile?.hosting_plan || profile?.disk_usage) && (
                    <section className="panel">
                        <div className="box-title"><b>Hosting</b><span className="muted">{profile?.hosting_plan}</span></div>
                        <div className="box-body">
                            <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                                Espacio usado: <b style={{ color: 'var(--ink)' }}>{profile?.disk_usage || '0%'}</b>
                                {profile?.storage_limit ? ` de ${profile.storage_limit}` : ''}
                            </p>
                        </div>
                    </section>
                )}

                <section className="panel">
                    <div className="box-title"><b>Tu acceso</b></div>
                    <div className="box-body" style={{ fontSize: 15 }}>
                        <span className="muted">Entras con {user?.email}</span>
                        <div><Link to="/update-password" className="textlink">Cambiar mi contraseña</Link></div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const CopyEmail = ({ email }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Sin permiso de portapapeles: el correo igual queda a la vista.
        }
    };
    return (
        <li>
            <code>{email}</code>
            <button type="button" onClick={copy}>{copied ? 'Copiado' : 'Copiar'}</button>
        </li>
    );
};

/* ---------------- Soporte ---------------- */

const EMPTY_TICKET = { category: 'general', title: '', description: '' };

const Support = ({ user, profile, tickets, composing, setComposing, onCreated }) => {
    const [form, setForm] = useState(EMPTY_TICKET);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (form.title.trim().length < 4) return setError('Escribe un asunto corto, por ejemplo "Cambiar foto de portada".');
        if (form.description.trim().length < 10) return setError('Cuéntanos un poco más para poder ayudarte.');
        setSending(true);
        setError('');

        const row = {
            user_id: user.id,
            title: form.title.trim(),
            description: form.description.trim(),
            priority: 'normal',
            status: 'pending',
            category: form.category,
        };
        let { error: err } = await supabase.from('tickets').insert([row]);
        // Si la columna category aún no existe, se guarda igual con el tipo en el asunto.
        if (err && /category/i.test(err.message || '')) {
            const { category, ...rest } = row;
            ({ error: err } = await supabase.from('tickets').insert([{ ...rest, title: `[${catLabel(category)}] ${rest.title}` }]));
        }
        if (err) {
            setSending(false);
            setError(/limite_diario/.test(err.message || '')
                ? 'Llegaste al máximo de solicitudes por hoy. Si es urgente, escríbenos por WhatsApp al +56 9 5414 6176.'
                : 'No pudimos guardar tu solicitud. Intenta de nuevo en un momento.');
            return;
        }

        // Aviso interno. La solicitud ya quedó guardada: si el aviso falla, no se muestra error.
        try {
            const fd = new FormData();
            fd.append('email', user.email);
            fd.append('subject', `Nueva solicitud (${catLabel(form.category)}): ${form.title.trim()}`);
            fd.append('message', `Cliente: ${profile?.client_name || 'Sin nombre'}\nTipo: ${catLabel(form.category)}\n\n${form.description.trim()}`);
            await fetch('https://formspree.io/f/mojvoerb', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        } catch {
            // sin aviso, pero la solicitud está en la base
        }

        setSending(false);
        setForm(EMPTY_TICKET);
        setComposing(false);
        setSent(true);
        onCreated();
    };

    return (
        <div className="portal-grid">
            <section className="panel">
                <div className="box-title">
                    <b>Tus solicitudes</b>
                    {!composing && <button type="button" className="btn signal" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => { setComposing(true); setSent(false); }}>Nueva solicitud →</button>}
                </div>
                {sent && <p className="alert ok" role="status" style={{ margin: 18 }}>Recibimos tu solicitud. Te respondemos dentro de un día hábil.</p>}
                {tickets.length ? tickets.map((t) => (
                    <article className="ticket" key={t.id}>
                        <div className="t-top">
                            <h3>{t.title}</h3>
                            <span className={`pill ${STATUS[t.status]?.cls || 'hot'}`}>{STATUS[t.status]?.label || 'En revisión'}</span>
                        </div>
                        <span className="meta">{catLabel(t.category)} · {new Date(t.created_at).toLocaleDateString('es-CL')}</span>
                        <p className="desc">{t.description}</p>
                        {t.admin_response && (
                            <div className="reply"><b>Respuesta de Interfaz 360</b>{t.admin_response}</div>
                        )}
                    </article>
                )) : (
                    <p className="empty">No tienes solicitudes. Cuando pidas algo, podrás seguirlo aquí.</p>
                )}
            </section>

            {composing ? (
                <section className="panel">
                    <div className="box-title"><b>Nueva solicitud</b></div>
                    <form className="box-body" onSubmit={submit} noValidate>
                        <label className="field">¿Sobre qué es?
                            <select value={form.category} onChange={set('category')}>
                                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </label>
                        {form.category === 'dns' && (
                            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                                Indica qué registro necesitas (por ejemplo, apuntar el dominio a otro servidor) y para qué servicio. Si el cambio afecta tus correos, te avisamos antes de hacerlo.
                            </p>
                        )}
                        <label className="field">Asunto
                            <input value={form.title} onChange={set('title')} maxLength={120} placeholder="Ej: Cambiar foto de portada" />
                        </label>
                        <label className="field">Detalle
                            <textarea value={form.description} onChange={set('description')} maxLength={3000} rows={6} placeholder="Cuéntanos qué necesitas" />
                        </label>
                        {error && <p className="alert" role="alert">{error}</p>}
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button type="submit" className="btn signal" disabled={sending}>{sending ? 'Enviando…' : 'Enviar solicitud →'}</button>
                            <button type="button" className="textlink" onClick={() => { setComposing(false); setError(''); }}>Cancelar</button>
                        </div>
                    </form>
                </section>
            ) : (
                <section className="panel">
                    <div className="box-title"><b>Cómo funciona</b></div>
                    <div className="box-body">
                        <ul className="ticks">
                            <li>Envías tu solicitud con el tipo y el detalle.</li>
                            <li>La revisamos y te respondemos dentro de un día hábil.</li>
                            <li>La respuesta aparece aquí, junto a tu solicitud.</li>
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
};

/* ---------------- Documentos ---------------- */

const Documents = ({ documents, profile }) => {
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState('');

    const list = documents.length
        ? documents
        : profile?.document_url
            ? [{ id: 'legacy', title: 'Documento general', file_url: profile.document_url }]
            : [];

    // Enlace firmado de 60 segundos: el archivo nunca queda público.
    const download = async (doc) => {
        setBusy(doc.id);
        setError('');
        const { data, error: err } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 60);
        setBusy(null);
        if (err || !data?.signedUrl) {
            setError(`No pudimos abrir "${doc.title}". Escríbenos en Soporte y te lo enviamos.`);
            return;
        }
        window.open(data.signedUrl, '_blank', 'noopener');
    };

    return (
        <div className="portal-grid">
            <section className="panel">
                <div className="box-title"><b>Tus documentos</b><span className="muted">{list.length}</span></div>
                {error && <p className="alert" role="alert" style={{ margin: 18 }}>{error}</p>}
                {list.length ? (
                    <ul className="doc-list">
                        {list.map((d) => (
                            <li key={d.id}>
                                <span>
                                    {d.title}
                                    {d.created_at && <small>{new Date(d.created_at).toLocaleDateString('es-CL')}</small>}
                                </span>
                                <button type="button" onClick={() => download(d)} disabled={busy === d.id}>
                                    {busy === d.id ? 'Abriendo…' : 'Descargar'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty">Aquí verás tu contrato, facturas y manuales cuando los subamos.</p>
                )}
            </section>
            <section className="panel">
                <div className="box-title"><b>Sobre tus archivos</b></div>
                <div className="box-body">
                    <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                        Solo tú puedes ver estos documentos. Cada descarga usa un enlace temporal que vence en un minuto.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
