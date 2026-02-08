import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, image = '/seo_imagen.jpg' }) => {
    const location = useLocation();

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
            breadcrumbList.itemListElement.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": segment.charAt(0).toUpperCase() + segment.slice(1),
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
