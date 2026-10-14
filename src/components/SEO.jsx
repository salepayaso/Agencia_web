import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.interfaz360.cl';

// Agrega o actualiza una etiqueta del <head>; devuelve el elemento.
function headTag(selector, create) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = create();
        document.head.appendChild(el);
    }
    return el;
}

const SEO = ({ title, description, image = '/seo_imagen.jpg', noindex = false }) => {
    const location = useLocation();

    // Canonical propio de cada página (sin barra final, salvo la portada):
    // si no, Google cree que todas son copias de la portada.
    useEffect(() => {
        const path = location.pathname.replace(/\/+$/, '') || '/';
        const link = headTag('link[rel="canonical"]', () => {
            const l = document.createElement('link');
            l.rel = 'canonical';
            return l;
        });
        link.href = `${SITE}${path}`;
    }, [location.pathname]);

    // Páginas privadas (portal, admin, enlaces personales): fuera de los buscadores.
    useEffect(() => {
        if (!noindex) return;
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
        return () => meta.remove();
    }, [noindex]);

    useEffect(() => {
        // Título dinámico
        const fullTitle = `${title} | Interfaz 360`;
        document.title = fullTitle;

        // Meta descripción
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }

        // Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', fullTitle);

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', description);

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', `https://www.interfaz360.cl${image}`);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://www.interfaz360.cl${location.pathname}`);

        // Twitter
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) twitterDescription.setAttribute('content', description);

        // --- Datos Estructurados Dinámicos (JSON-LD) ---
        // Eliminar JSON-LD dinámico previo si existe
        const existingScript = document.getElementById('dynamic-json-ld');
        if (existingScript) existingScript.remove();

        // Crear BreadcrumbList
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbList = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Inicio",
                    "item": "https://www.interfaz360.cl/"
                }
            ]
        };

        pathSegments.forEach((segment, index) => {
            const url = `https://www.interfaz360.cl/${pathSegments.slice(0, index + 1).join('/')}`;
            let name = segment.charAt(0).toUpperCase() + segment.slice(1);
            if (name === 'Nosotros') name = 'Nosotros'; // Keep consistent
            breadcrumbList.itemListElement.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": name,
                "item": url
            });
        });

        // Inyectar Script
        const script = document.createElement('script');
        script.id = 'dynamic-json-ld';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(breadcrumbList);
        document.head.appendChild(script);

    }, [title, description, image, location]);

    return null;
};

export default SEO;
