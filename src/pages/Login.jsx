import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import { authError } from '../lib/authError';

const MIN = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TITLES = {
    login: { eyebrow: 'Acceso clientes', title: 'Entrar a mi portal' },
    signup: { eyebrow: 'Cuenta nueva', title: 'Crear mi cuenta' },
    forgot: { eyebrow: 'Recuperar acceso', title: 'Nueva contraseña' },
};

const Login = () => {
    const [params] = useSearchParams();
    const [mode, setMode] = useState(params.get('crear') !== null ? 'signup' : 'login'); // login | signup | forgot
    const [name, setName] = useState('');
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

    const handleSignup = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2) return setError('Escribe tu nombre o el de tu negocio.');
        if (!EMAIL_RE.test(email.trim())) return setError('Revisa el correo, parece incompleto.');
        if (password.length < MIN) return setError(`La contraseña debe tener al menos ${MIN} caracteres.`);
        setLoading(true);
        setError('');
        const { data, error: err } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { full_name: name.trim() },
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        setLoading(false);
        if (err) {
            setError(authError(err));
            return;
        }
        window.dataLayer?.push({ event: 'sign_up', method: 'email' });
        // Con confirmación de correo activa no hay sesión hasta que haga clic en el enlace
        if (data.session) {
            navigate('/dashboard', { replace: true });
            return;
        }
        setNotice(`Listo. Te enviamos un correo a ${email.trim()}: haz clic en el enlace para activar tu cuenta y entrar a tu portal.`);
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!EMAIL_RE.test(email.trim())) return setError('Escribe el correo con el que entras al portal.');
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

    const submit = { login: handleLogin, signup: handleSignup, forgot: handleForgot }[mode];
    const t = TITLES[mode];

    return (
        <AuthLayout title="Acceso clientes" description="Portal de clientes de Interfaz 360: dominio, plan, correos, documentos y soporte.">
            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 18 }}>
                <div>
                    <span className="eyebrow">{t.eyebrow}</span>
                    <h2 style={{ marginTop: 10 }}>{t.title}</h2>
                </div>

                {mode === 'signup' && (
                    <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                        Con tu cuenta compras tu dominio o tus correos y sigues tus pedidos y solicitudes en un solo lugar.
                    </p>
                )}
                {mode === 'forgot' && (
                    <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                        Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.
                    </p>
                )}

                {mode === 'signup' && (
                    <label className="field">Tu nombre o el de tu negocio
                        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />
                    </label>
                )}
                <label className="field">Correo
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@empresa.cl" />
                </label>
                {mode !== 'forgot' && (
                    <label className="field">
                        <span>Contraseña{mode === 'signup' && <em> · mínimo {MIN} caracteres</em>}</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        />
                    </label>
                )}

                {error && <p className="alert" role="alert">{error}</p>}
                {notice && <p className="alert ok" role="status">{notice}</p>}

                <button type="submit" className="btn signal" disabled={loading || !!notice}>
                    {loading ? 'Un momento…' : { login: 'Entrar →', signup: 'Crear mi cuenta →', forgot: 'Enviar enlace →' }[mode]}
                </button>

                <div className="row-between">
                    {mode === 'login' && (
                        <>
                            <button type="button" className="textlink" onClick={() => switchMode('forgot')}>¿Olvidaste tu contraseña?</button>
                            <button type="button" className="textlink" onClick={() => switchMode('signup')}>Crear una cuenta</button>
                        </>
                    )}
                    {mode !== 'login' && (
                        <button type="button" className="textlink" onClick={() => switchMode('login')}>
                            {mode === 'signup' ? '¿Ya tienes cuenta? Entrar' : '← Volver a entrar'}
                        </button>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
