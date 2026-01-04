import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogOut, LayoutDashboard, FileText, Settings, User } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black/30 border-r border-white/5 p-6 flex flex-col">
                <div className="mb-10">
                    <span className="text-2xl font-bold text-gradient">WebArchitect</span>
                    <span className="text-xs text-gray-400 block mt-1">Portal Cliente</span>
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
                        icon={Settings}
                        active={view === 'tickets'}
                        onClick={() => setView('tickets')}
                    >
                        Soporte / Tickets
                    </NavItem>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                            <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500">Cliente</p>
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
                {view === 'overview' ? (
                    <>
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Hola, Bienvenido de nuevo</h1>
                            <p className="text-gray-400">Aquí está el estado actual de tus servicios digitales.</p>
                        </header>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <StatCard title="Proyectos Activos" value="1" />
                            <StatCard title="Tickets Abiertos" value="0" />
                            <StatCard title="Próximo Pago" value="30 Días" />
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-white/5">
                            <h3 className="text-xl font-bold mb-4">Estado del Servicio</h3>
                            <div className="flex items-center gap-3 text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="font-medium">Todos los sistemas operativos</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <TicketsView />
                )}
            </main>
        </div>
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
