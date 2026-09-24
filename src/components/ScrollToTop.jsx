import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de página vuelve arriba. Si el enlace trae un ancla (/#dominio),
// baja a esa sección cuando la página ya la dibujó.
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
            return;
        }
        let tries = 0;
        const find = () => {
            const el = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else if (tries++ < 20) setTimeout(find, 100);
        };
        find();
    }, [pathname, hash]);

    return null;
}
