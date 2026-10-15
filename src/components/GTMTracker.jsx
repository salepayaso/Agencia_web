import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GTMTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'page_view',
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    // Clic en cualquier enlace a WhatsApp del sitio (chat, botones, pie):
    // un solo listener en vez de marcar cada enlace.
    useEffect(() => {
        const onClick = (e) => {
            const link = e.target.closest?.('a[href*="wa.me/"]');
            if (!link) return;
            window.dataLayer?.push({
                event: 'whatsapp_click',
                page_path: window.location.pathname,
                link_text: link.textContent.trim().slice(0, 80),
            });
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, []);

    return null;
};

export default GTMTracker;
