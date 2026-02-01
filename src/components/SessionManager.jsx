import { useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos

const SessionManager = () => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/login');
        }
    };

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(logout, SESSION_TIMEOUT);
    };

    useEffect(() => {
        const handleActivity = () => {
            resetTimer();
        };

        // Escuchar eventos de actividad del usuario
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        // Iniciar el temporizador al montar el componente
        resetTimer();

        // Limpiar al desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, []);

    return null; // Este componente no renderiza nada visual
};

export default SessionManager;
