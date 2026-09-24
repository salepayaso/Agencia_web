import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import { authError } from '../lib/authError';

const MIN = 8;

// Sirve para tres casos: la invitación de un cliente nuevo, el enlace de
// "olvidé mi contraseña" y el cambio de contraseña desde el portal.
const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false); // hay sesión válida para cambiarla
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            // 1. Sesión ya establecida (el cliente de Supabase lee el enlace solo)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setReady(true);
                return;
            }

            // 2. Si no, leer el enlace a mano (plantillas con código corto)
            let hash = window.location.hash;
            if (hash.startsWith('#')) hash = hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const type = params.get('type');
            const email = params.get('email');

            if (accessToken && !accessToken.includes('.')) {
                if (!email) {
                    setMessage({ type: 'error', text: 'El enlace del correo está incompleto. Pide uno nuevo.' });
                    return;
                }
                const { data, error } = await supabase.auth.verifyOtp({ token: accessToken, type: type || 'recovery', email });
                if (error) {
                    setMessage({ type: 'error', text: authError(error) });
                    return;
                }
                if (data.session) {
                    window.history.replaceState(null, '', window.location.pathname);
                    setReady(true);
                }
                return;
            }

            setMessage({ type: 'error', text: 'El enlace expiró o no es válido. Pide uno nuevo desde "¿Olvidaste tu contraseña?".' });
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setReady(true);
                setMessage(null);
            }
        });

        handleAuth();
        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password.length < MIN) {
            setMessage({ type: 'error', text: `La contraseña debe tener al menos ${MIN} caracteres.` });
            return;
        }
        if (password !== confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: authError(error) });
            return;
        }
        setMessage({ type: 'ok', text: 'Contraseña guardada. Te llevamos a tu portal…' });
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    };

    return (
        <AuthLayout title="Crear contraseña" description="Crea o cambia la contraseña de tu portal de clientes.">
            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 18 }}>
                <div>
                    <span className="eyebrow">Portal de clientes</span>
                    <h2 style={{ marginTop: 10 }}>Crear contraseña</h2>
                </div>
                <label className="field"><span>Nueva contraseña <em>· mínimo {MIN} caracteres</em></span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" disabled={!ready} required />
                </label>
                <label className="field">Repite la contraseña
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" disabled={!ready} required />
                </label>
                {message && (
                    <p className={`alert${message.type === 'ok' ? ' ok' : ''}`} role={message.type === 'ok' ? 'status' : 'alert'}>
                        {message.text}
                    </p>
                )}
                <button type="submit" className="btn signal" disabled={loading || !ready}>
                    {loading ? 'Guardando…' : 'Guardar contraseña →'}
                </button>
                <div className="row-between">
                    <Link to="/login" className="textlink">← Ir a entrar</Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default UpdatePassword;
