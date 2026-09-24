import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

// Pantalla de espera con el sello de la marca
export const PortalLoading = () => (
    <div className="tc-page">
        <div className="tc loading" role="status" aria-label="Cargando tu portal">
            <span className="seal">360</span>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    if (loading) return <PortalLoading />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;
