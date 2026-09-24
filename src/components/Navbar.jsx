import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Wordmark from './Wordmark';
import { openChat } from '../lib/chat';

const LINKS = [
    { to: '/servicios', label: 'Servicios' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/contacto', label: 'Contacto' },
];

const Navbar = () => {
    const location = useLocation();
    // El menú del celular queda abierto solo en la página donde se abrió:
    // al navegar se cierra solo.
    const [openAt, setOpenAt] = useState(null);
    const isOpen = openAt === location.key;
    const setIsOpen = (open) => setOpenAt(open ? location.key : null);

    // Sin scroll de fondo mientras el menú del celular está abierto
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const current = (path) => (location.pathname === path ? 'page' : undefined);

    const talk = () => {
        setIsOpen(false);
        openChat();
    };

    return (
        <div className="tc">
            <header className="nav gutter">
                <div className="max">
                    <Link to="/" className="brand" aria-label="Interfaz 360, ir al inicio">
                        <Wordmark className="text-[22px]" />
                    </Link>

                    <ul>
                        {LINKS.map(({ to, label }) => (
                            <li key={to}>
                                <Link to={to} aria-current={current(to)}>{label}</Link>
                            </li>
                        ))}
                    </ul>

                    <div className="right">
                        <Link to="/login" className="client">Clientes</Link>
                        <button type="button" className="btn solid" onClick={talk}>
                            Hablar con el asesor
                        </button>
                        <button
                            type="button"
                            className="burger"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={isOpen}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {isOpen && (
                <nav className="menu" aria-label="Menú principal">
                    <Link to="/" aria-current={current('/')}>Inicio</Link>
                    {LINKS.map(({ to, label }) => (
                        <Link key={to} to={to} aria-current={current(to)}>{label}</Link>
                    ))}
                    <Link to="/login" aria-current={current('/login')}>Portal de clientes</Link>
                    <button type="button" className="btn signal" onClick={talk}>
                        Hablar con el asesor →
                    </button>
                </nav>
            )}
        </div>
    );
};

export default Navbar;
