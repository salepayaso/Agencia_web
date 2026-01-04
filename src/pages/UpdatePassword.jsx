import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Lock, Loader2 } from 'lucide-react';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            // 1. Escuchar sesión establecida automáticamente (Flow normal)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setMessage(null);
                return;
            }

            // 2. Si no hay sesión, intentar analizar la URL manualmente
            let hash = window.location.hash;
            if (hash.startsWith('#')) hash = hash.substring(1);

            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const type = params.get('type');
            const email = params.get('email');

            if (accessToken && !accessToken.includes('.')) {
                // Es un token OTP (corto), no un JWT
                if (!email) {
                    setMessage({ type: 'error', text: 'Error: El enlace del correo está incompleto. Falta el parámetro &email={{ .Email }}.' });
                    return;
                }

                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        token: accessToken,
                        type: type || 'recovery',
                        email: email
                    });

                    if (error) throw error;
                    if (data.session) {
                        setMessage({ type: 'success', text: 'Código verificado. Ahora crea tu contraseña.' });
                        // Limpiar URL para que no moleste
                        window.history.replaceState(null, '', window.location.pathname);
                        return;
                    }
                } catch (err) {
                    console.error("Error verifying OTP:", err);
                    setMessage({ type: 'error', text: `Error verificando invitación: ${err.message}` });
                }
            } else if (!session) {
                // Si no hay sesión y tampoco parece un OTP válido
                if (!window.location.hash) {
                    setMessage({ type: 'error', text: 'Enlace inválido o expirado. Asegúrate de usar el enlace completo del correo.' });
                } else {
                    setMessage({ type: 'error', text: 'No se detectó una sesión válida. El enlace puede haber expirado.' });
                }
            }
        };

        // Escuchar cambios de estado por si acaso
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) setMessage(null);
        });

        handleAuth();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente. Redirigiendo...' });

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Crear nueva contraseña</h1>
                    <p className="text-gray-400 text-sm">Ingresa tu nueva contraseña para acceder.</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Actualizar Contraseña'}
                    </Button>
                </form>

                {/* DEBUG SECTION - Eliminar en producción */}
                <div className="mt-8 p-4 bg-black/50 rounded-lg text-xs font-mono text-gray-400 break-all">
                    <p className="font-bold text-gray-300 mb-2">🔧 DEBUG INFO (Captura esto si falla)</p>
                    <p>URL: {window.location.href}</p>
                    <p>Hash: {window.location.hash || '(vacio)'}</p>
                    <p>Search: {window.location.search || '(vacio)'}</p>
                    <p>Session: {message?.type === 'success' ? 'Active' : 'Checking...'}</p>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
