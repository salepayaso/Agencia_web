import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            console.log("ProtectedRoute: Verificando sesión...");
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) console.error("ProtectedRoute Error:", error);
            console.log("ProtectedRoute Usuario encontrado:", user);
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center text-primary-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
