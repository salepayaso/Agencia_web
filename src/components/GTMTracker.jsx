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

    return null;
};

export default GTMTracker;
