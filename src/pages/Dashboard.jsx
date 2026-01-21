import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogOut, LayoutDashboard, FileText, Settings, User, Globe, Calendar, Download, HardDrive, Mail, Activity, Server, Plus, X, Send, ShieldCheck, Check } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [view, setView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }
                setUser(user);

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                        {/* Outer Spinning Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary-500/50"
                        />
                        {/* Inner Counter Spinning Ring */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500/50"
                        />

                        {/* Logo */}
                        <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 relative z-10">
                            <img src="/logo sin fondo optimizado.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white tracking-[0.3em] uppercase mb-1">Cargando</h3>
                        <p className="text-primary-400/80 text-[10px] tracking-widest uppercase">Estableciendo Conexión Segura</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg text-white flex overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-72 bg-dark-card/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col relative z-10 hidden md:flex">
                <div className="mb-12 flex items-center gap-3 px-2">
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-primary-500/20 blur-lg rounded-full group-hover:bg-primary-500/30 transition-all"></div>
                        <img src="/logo sin fondo optimizado.png" alt="Logo" className="h-12 w-12 rounded-full object-cover relative z-10 border border-white/10" />
                    </div>
                    <div>
                        <img src="/brand-text-v2.png" alt="Interfaz 360" className="h-6 object-contain mb-1" />
                        <span className="text-[10px] tracking-widest uppercase text-primary-400 font-bold block pl-1">Portal Cliente</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem
                        icon={LayoutDashboard}
                        active={view === 'overview'}
                        onClick={() => setView('overview')}
                    >
                        Resumen General
                    </NavItem>
                    <NavItem
                        icon={FileText}
                        active={view === 'tickets'}
                        onClick={() => setView('tickets')}
                    >
                        Soporte & Tickets
                    </NavItem>
                    <NavItem icon={Settings} onClick={() => alert("Próximamente: Configuración de cuenta")}>
                        Configuración
                    </NavItem>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 p-[1px]">
                                <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={18} className="text-white" />
                                    )}
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{profile?.client_name || 'Nuevo Cliente'}</p>
                                <p className="text-xs text-gray-500 truncate" title={profile?.contact_email || user?.email}>
                                    {profile?.contact_email || user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-green-400 font-medium">Conectado</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm w-full px-2 py-2 rounded-lg hover:bg-white/5"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
                {view === 'overview' && <Overview profile={profile} />}
                {view === 'tickets' && <TicketsView user={user} profile={profile} />}
            </main>
        </div>
    );
};

const Overview = ({ profile }) => {
    const [viewingDoc, setViewingDoc] = useState(null);

    const daysUntilPayment = profile?.next_payment_date
        ? Math.ceil((new Date(profile.next_payment_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const hostingPlan = profile?.hosting_plan || "Plan Básico";
    const diskUsage = profile?.disk_usage || "0%";
    const emailCount = profile?.email_count || "0";

    return (
        <div className="max-w-6xl mx-auto animate-fade-in-up">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-white/90">
                        Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">{profile?.client_name?.split(' ')[0] || 'Cliente'}</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Resumen de tus servicios digitales en tiempo real.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Última actualización</p>
                    <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Website Card */}
                <div className="group relative bg-dark-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-hidden hover:border-primary-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <Globe size={28} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                ONLINE
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Sitio Web Activo</h3>
                        <a
                            href={`https://${profile?.active_web}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-2xl font-bold text-white hover:text-primary-400 transition-colors truncate block"
                        >
                            {profile?.active_web || 'No asignado'}
                        </a>
                    </div>
                </div>

                {/* Hosting & Emails Card */}
                <div className="group relative bg-dark-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <Server size={28} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                                {hostingPlan}
                            </span>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="overflow-hidden">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-2">Correos</p>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-white font-bold text-lg mb-1">
                                        <Mail size={16} className="text-gray-400" />
                                        {emailCount}
                                    </div>
                                    {profile?.contact_email && (
                                        <CopyEmail email={profile.contact_email} />
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-2">Almacenamiento</p>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                                        <HardDrive size={16} className="text-gray-400" />
                                        {diskUsage}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 pl-6">
                                        de {profile?.storage_limit || extractStorageLimit(hostingPlan)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments Card */}
                <div className="group relative bg-dark-card/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-hidden hover:border-orange-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                                <Calendar size={28} />
                            </div>
                            {daysUntilPayment !== null && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${daysUntilPayment < 7 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                    {daysUntilPayment} días
                                </span>
                            )}
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Próxima Facturación</h3>
                        <p className="text-2xl font-bold text-white">{profile?.next_payment_date || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-dark-card/30 rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-primary-500" />
                        Estado de Servicios
                    </h3>
                    <div className="space-y-4">
                        <StatusItem label="Servidor Web (Apache)" status="active" />
                        <StatusItem label="Base de Datos (MySQL)" status="active" />
                        <StatusItem label="Servidor de Correos" status="active" />
                        <StatusItem label="Copias de Seguridad" status="pending" text="Programado 03:00 AM" />
                    </div>
                </div>

                <div className="bg-dark-card/30 rounded-2xl border border-white/5 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="relative z-10 w-full">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Documentación</h3>

                        {profile?.document_url ? (
                            <>
                                <div className="bg-black/30 rounded-lg p-3 mb-6 max-w-xs mx-auto border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Archivo Disponible:</p>
                                    <p className="text-gray-300 text-sm truncate font-mono" title={profile.document_url}>
                                        {profile.document_url}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setViewingDoc(profile.document_url)}
                                    variant="primary"
                                    icon={Download}
                                    className="w-full md:w-auto"
                                >
                                    Descargar
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">No hay documentos vinculados a tu cuenta actualmente.</p>
                                <span className="px-4 py-2 rounded-lg bg-white/5 text-gray-500 text-sm font-medium border border-white/5">
                                    No disponible
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Details Modal (Ventana Detallada) */}
            <DocumentPreviewModal
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
                docName={viewingDoc}
            />
        </div>
    );
};

// ... (Existing StatusItem component) ...

// New Component: Document Modal
const DocumentPreviewModal = ({ isOpen, onClose, docName }) => {
    const [downloading, setDownloading] = useState(false);

    const performDownload = async () => {
        setDownloading(true);
        try {
            const { data, error } = await supabase
                .storage
                .from('documents')
                .createSignedUrl(docName, 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
                onClose();
            }
        } catch (err) {
            console.error('Error downloading:', err);
            alert(`Error: No se pudo descargar "${docName}". \n\nPosibles causas:\n1. El nombre del archivo en el perfil no coincide EXACTAMENTE con el del Storage.\n2. Faltan permisos de lectura en el bucket 'documents' (Corre el script SQL).`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    ></motion.div>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-dark-card border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl z-10"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/20">
                                <ShieldCheck size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Descarga Segura</h2>
                            <p className="text-gray-400 text-sm mb-6">Estás a punto de descargar un documento confidencial.</p>

                            <div className="bg-white/5 rounded-xl p-4 mb-8 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Nombre del Archivo</p>
                                <p className="text-white font-mono text-sm break-all">{docName}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/5">Cancelar</Button>
                                <Button onClick={performDownload} variant="primary" className="flex-1" disabled={downloading}>
                                    {downloading ? 'Descargando...' : 'Confirmar y Abrir'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const StatusItem = ({ label, status, text }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
            {text && <span className="text-xs text-gray-500 mr-2">{text}</span>}
            <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`}></span>
            <span className={`text-xs font-bold uppercase ${status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                {status === 'active' ? 'Ok' : 'Wait'}
            </span>
        </div>
    </div>
);

const TicketsView = ({ user, profile }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', description: '' });
    const [isHuman, setIsHuman] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTickets = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setTickets(data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const handleSubmitTicket = async (e) => {
        e.preventDefault();

        if (!isHuman) {
            alert("Por favor confirma que no eres un robot.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Save to Supabase (Priority is default 'normal')
            const { error } = await supabase
                .from('tickets')
                .insert([
                    {
                        user_id: user.id,
                        title: newTicket.title,
                        description: newTicket.description,
                        priority: 'normal',
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            // 2. Notify Admin via Formspree
            const formData = new FormData();
            formData.append('email', user.email);
            formData.append('subject', `Nuevo Ticket de Soporte: ${newTicket.title}`);
            formData.append('message', `Cliente: ${profile?.client_name || 'Desconocido'}\n\nDescripción:\n${newTicket.description}`);

            await fetch("https://formspree.io/f/mojvoerb", {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            setIsModalOpen(false);
            setNewTicket({ title: '', description: '' });
            setIsHuman(false);
            fetchTickets();
            alert("Ticket creado exitosamente. Hemos sido notificados.");

        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Hubo un error al crear el ticket.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl animate-fade-in-up relative">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white/90">Soporte Técnico</h1>
                    <p className="text-gray-400">Gestiona tus incidencias y solicitudes.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>Crear Ticket</Button>
            </header>

            {loading ? (
                <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 mx-auto"></div></div>
            ) : tickets.length > 0 ? (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="group glass-card p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between md:items-center hover:bg-white/5 transition-all hover:border-white/10 cursor-pointer">
                            <div className="flex items-start gap-4 mb-3 md:mb-0">
                                <div className={`mt-1 w-2 h-2 rounded-full ${ticket.status === 'solved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-white group-hover:text-primary-400 transition-colors">{ticket.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="uppercase font-bold text-gray-500">Normal</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-1">{ticket.description}</p>
                                </div>
                            </div>
                            <span className={`self-start md:self-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${ticket.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                {ticket.status === 'pending' ? 'En Revisión' : 'Resuelto'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Todo en orden</h3>
                    <p className="text-gray-400">No tienes tickets de soporte activos.</p>
                </div>
            )}

            {/* Create Ticket Modal High-Tech Refined */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all"
                            onClick={() => setIsModalOpen(false)}
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-dark-bg/90 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-[0_0_50px_rgba(14,165,233,0.15)] z-10 overflow-hidden"
                        >
                            {/* Decorative Glows */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10"></div>

                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="text-center mb-8">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 text-primary-400 mb-4 border border-primary-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                                    <Send size={24} />
                                </span>
                                <h2 className="text-2xl font-bold text-white mb-1">Nuevo Ticket de Soporte</h2>
                                <p className="text-sm text-gray-400">Describe tu problema y te ayudaremos a la brevedad.</p>
                            </div>

                            <form onSubmit={handleSubmitTicket} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Asunto</label>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all group-hover:border-white/20"
                                            placeholder="Ej: Problema con el correo corporativo"
                                            value={newTicket.title}
                                            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Descripción Detallada</label>
                                    <div className="relative group">
                                        <textarea
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none h-32 transition-all group-hover:border-white/20"
                                            placeholder="Explícanos qué sucede..."
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Security Check */}
                                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsHuman(!isHuman)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${isHuman ? 'bg-primary-500 border-primary-500' : 'border-gray-500'}`}>
                                            {isHuman && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-300 font-medium select-none">Confirmar que soy un humano</span>
                                    </div>
                                    <ShieldCheck size={18} className="text-gray-600" />
                                </div>

                                <Button type="submit" variant="primary" className="w-full justify-center py-4 text-base shadow-lg shadow-primary-500/20" disabled={isSubmitting}>
                                    {isSubmitting ? 'Enviando Solicitud...' : 'Crear Ticket'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavItem = ({ icon: Icon, children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent border-l-4 border-primary-500"></div>
        )}
        <Icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-primary-400' : 'text-gray-500 group-hover:text-white'}`} />
        <span className="font-medium relative z-10">{children}</span>
    </button>
);

const CopyEmail = ({ email }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 w-full group/copy bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-all">
            <p className="text-sm text-gray-200 font-mono break-all flex-1" title={email}>
                {email}
            </p>
            <button
                onClick={handleCopy}
                className={`p-1.5 rounded-md transition-all shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                title="Copiar email"
            >
                {copied ? <Check size={14} /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
            </button>
        </div>
    );
};

const extractStorageLimit = (planName) => {
    const limits = {
        "Plan Básico": "10 GB",
        "Plan Emprendedor": "25 GB",
        "Plan Pyme": "50 GB",
        "Plan Corporativo": "100 GB"
    };
    return limits[planName] || "10 GB";
};

export default Dashboard;
