import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogOut, LayoutDashboard, FileText, Settings, User, Globe, Calendar, Download, AlertCircle } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black/30 border-r border-white/5 p-6 flex flex-col">
                <div className="mb-10 flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <div>
                        <span className="text-xl font-bold text-gradient block">Interfaz 360</span>
                        <span className="text-xs text-gray-400 block">Portal Cliente</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem
                        icon={LayoutDashboard}
                        active={view === 'overview'}
                        onClick={() => setView('overview')}
                    >
                        Resumen
                    </NavItem>
                    <NavItem
                        icon={FileText}
                        active={view === 'tickets'}
                        onClick={() => setView('tickets')}
                    >
                        Soporte / Tickets
                    </NavItem>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 overflow-hidden relative">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{profile?.client_name || 'Nuevo Cliente'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm w-full"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {view === 'overview' && <Overview profile={profile} />}
                {view === 'tickets' && <TicketsView />}
            </main>
        </div>
    );
};

const Overview = ({ profile }) => {
    const handleDownloadDocument = async () => {
        if (!profile?.document_url) return;

        try {
            // Asumimos que document_url es solo el nombre del archivo en el bucket 'documents'
            const { data, error } = await supabase
                .storage
                .from('documents')
                .createSignedUrl(profile.document_url, 60); // URL válida por 60 segundos

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (err) {
            console.error('Error downloading:', err);
            alert('Error al descargar el documento. Verifica que el archivo exista en el bucket "documents".');
        }
    };

    const daysUntilPayment = profile?.next_payment_date
        ? Math.ceil((new Date(profile.next_payment_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Hola, {profile?.client_name?.split(' ')[0] || 'Cliente'}</h1>
                <p className="text-gray-400">Aquí está el estado actual de tus servicios digitales.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <Globe size={24} />
                        </div>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Activo</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Sitio Web</p>
                    <a
                        href={`https://${profile?.active_web}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xl font-bold hover:text-primary-400 transition-colors truncate block"
                    >
                        {profile?.active_web || 'No asignado'}
                    </a>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <Calendar size={24} />
                        </div>
                        {daysUntilPayment !== null && (
                            <span className={`text-xs px-2 py-1 rounded ${daysUntilPayment < 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {daysUntilPayment} días restantes
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Próximo Pago</p>
                    <p className="text-xl font-bold">{profile?.next_payment_date || 'No programado'}</p>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                            <FileText size={24} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Documentos</p>
                    {profile?.document_url ? (
                        <button
                            onClick={handleDownloadDocument}
                            className="text-lg font-bold flex items-center gap-2 hover:text-primary-400 transition-colors"
                        >
                            Descargar PDF <Download size={16} />
                        </button>
                    ) : (
                        <p className="text-lg font-bold text-gray-500">Sin documentos</p>
                    )}
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">Estado del Servicio</h3>
                <div className="flex items-center gap-3 text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="font-medium">
                        {profile?.app_name ? `Sistema ${profile.app_name} Operativo` : 'Todos los sistemas operativos'}
                    </span>
                </div>
            </div>
        </>
    );
};

const TicketsView = () => {
    // Mock data por ahora
    const tickets = [
        { id: 1, title: 'Cambio de color en el footer', status: 'pending', date: '2024-01-03' },
        { id: 2, title: 'Error en formulario de contacto', status: 'solved', date: '2023-12-28' },
    ];

    return (
        <div className="max-w-4xl">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Sistema de Tickets</h1>
                    <p className="text-gray-400">Solicita cambios o reporta incidencias.</p>
                </div>
                <Button variant="primary">Nuevo Ticket</Button>
            </header>

            <div className="space-y-4">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="glass-card p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                            <h4 className="font-bold text-lg mb-1">{ticket.title}</h4>
                            <p className="text-xs text-gray-500">Creado el {ticket.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                            {ticket.status === 'pending' ? 'En Proceso' : 'Resuelto'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NavItem = ({ icon: Icon, children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
        <Icon size={20} />
        <span className="font-medium">{children}</span>
    </button>
);

const StatCard = ({ title, value }) => (
    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

export default Dashboard;
