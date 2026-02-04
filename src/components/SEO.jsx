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

    }, [title, description, image, location]);

    return null;
};

export default SEO;
