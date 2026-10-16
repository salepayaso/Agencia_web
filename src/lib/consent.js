// Consentimiento de cookies (Ley 21.719). Google Tag Manager, y con él Google
// Analytics y las conversiones de Ads, se carga solo en el dominio de
// producción y solo si la persona acepta. En la vista previa y en local nunca
// se carga, así las pruebas no ensucian las estadísticas.
const GTM_ID = 'GTM-K4N4G54W';
const PROD_HOSTS = ['www.interfaz360.cl', 'interfaz360.cl'];
const KEY = 'i360-cookies';
const OPEN_EVENT = 'i360:cookies';
const CHOSEN_EVENT = 'i360:cookies-chosen';

const GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };

// GTM exige recibir el objeto arguments, no un arreglo.
function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
}

/** 'all', 'necessary' o null si todavía no elige. */
export function readConsent() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        return saved?.choice === 'all' || saved?.choice === 'necessary' ? saved.choice : null;
    } catch {
        return null;
    }
}

let loaded = false;

export function loadAnalytics() {
    if (loaded || !PROD_HOSTS.includes(window.location.hostname)) return;
    loaded = true;
    gtag('consent', 'default', DENIED);
    gtag('consent', 'update', GRANTED);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);
}

// Borra las cookies de Google Analytics y Ads (_ga, _gid, _gcl...) del dominio.
function clearGoogleCookies() {
    const host = window.location.hostname;
    const domains = ['', host, `.${host.replace(/^www\./, '')}`];
    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) return;
        domains.forEach((d) => {
            document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
        });
    });
}

export function saveConsent(choice) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    } catch {
        // Sin localStorage la elección vale solo para esta visita.
    }
    window.dispatchEvent(new Event(CHOSEN_EVENT));
    if (choice === 'all') {
        loadAnalytics();
    } else {
        if (loaded) gtag('consent', 'update', DENIED);
        clearGoogleCookies();
    }
}

/** Avisa cuando la persona responde el aviso de cookies (el chat espera eso para saludar). */
export const onConsentChosen = (fn) => {
    window.addEventListener(CHOSEN_EVENT, fn);
    return () => window.removeEventListener(CHOSEN_EVENT, fn);
};

/** Vuelve a mostrar el banner (enlace "Cookies" del pie de página). */
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onOpenCookieSettings = (fn) => {
    window.addEventListener(OPEN_EVENT, fn);
    return () => window.removeEventListener(OPEN_EVENT, fn);
};
