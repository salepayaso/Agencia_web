import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import { authError } from '../lib/authError';

const Login = () => {
    const [mode, setMode] = useState('login'); // login | forgot
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const navigate = useNavigate();

    // Si ya tiene sesión, directo al portal
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/dashboard', { replace: true });
        });
    }, [navigate]);

    const switchMode = (next) => {
        setMode(next);
        setError('');
        setNotice('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) {
            setError(authError(err));
            setLoading(false);
            return;
        }
        navigate('/dashboard', { replace: true });
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Escribe el correo con el que entras al portal.');
            return;
        }
        setLoading(true);
        setError('');
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/update-password`,
        });
        setLoading(false);
        // Mismo mensaje exista o no la cuenta: no revelamos qué correos son clientes.
        if (err && !(err.message || '').toLowerCase().includes('not found')) {
            setError(authError(err));
            return;
        }
        setNotice(`Si ${email.trim()} tiene una cuenta, te llegará un correo con un enlace para crear una nueva contraseña.`);
    };

    return (
        <AuthLayout title="Acceso clientes" description="Portal de clientes de Interfaz 360: dominio, plan, correos, documentos y soporte.">
            {mode === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'grid', gap: 18 }}>
                    <div>
                        <span className="eyebrow">Acceso clientes</span>
                        <h2 style={{ marginTop: 10 }}>Entrar a mi portal</h2>
                    </div>
                    <label className="field">Correo
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@empresa.cl" required />
                    </label>
                    <label className="field">Contraseña
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                    </label>
                    {error && <p className="alert" role="alert">{error}</p>}
                    <button type="submit" className="btn signal" disabled={loading}>
                        {loading ? 'Entrando…' : 'Entrar →'}
                    </button>
                    <div className="row-between">
                        <button type="button" className="textlink" onClick={() => switchMode('forgot')}>¿Olvidaste tu contraseña?</button>
                        <a className="muted" href="https://wa.me/56954146176" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>
                            ¿Aún no tienes cuenta?
                        </a>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleForgot} style={{ display: 'grid', gap: 18 }}>
                    <div>
                        <span className="eyebrow">Recuperar acceso</span>
                        <h2 style={{ marginTop: 10 }}>Nueva contraseña</h2>
                    </div>
                    <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                        Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.
                    </p>
                    <label className="field">Correo
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@empresa.cl" required />
                    </label>
                    {error && <p className="alert" role="alert">{error}</p>}
                    {notice && <p className="alert ok" role="status">{notice}</p>}
                    <button type="submit" className="btn signal" disabled={loading || !!notice}>
                        {loading ? 'Enviando…' : 'Enviar enlace →'}
                    </button>
                    <div className="row-between">
                        <button type="button" className="textlink" onClick={() => switchMode('login')}>← Volver a entrar</button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
};

export default Login;
