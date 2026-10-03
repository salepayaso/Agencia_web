import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readConsent, saveConsent, loadAnalytics, onOpenCookieSettings } from '../lib/consent';

// Aviso de cookies. Mientras la persona no acepta, Google Tag Manager no se carga.
const CookieBanner = () => {
    const [open, setOpen] = useState(() => readConsent() === null);

    useEffect(() => {
        if (readConsent() === 'all') loadAnalytics();
        return onOpenCookieSettings(() => setOpen(true));
    }, []);

    if (!open) return null;

    const choose = (choice) => {
        saveConsent(choice);
        setOpen(false);
    };

    return (
        <div
            role="region"
            aria-label="Preferencias de cookies"
            className="fixed z-[60] bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-paper border-[1.5px] border-ink p-4 font-body shadow-lg"
        >
            <p className="text-sm text-ink font-bold leading-snug">¿Nos dejas medir las visitas?</p>
            <p className="text-xs text-ink-2 leading-snug mt-1.5">
                Usamos Google Analytics para saber cómo llegas al sitio y mejorar nuestros anuncios. Solo se activa si
                aceptas; el sitio funciona igual si no.{' '}
                <Link to="/privacidad" className="underline hover:text-ink">Más información</Link>
            </p>
            <div className="flex gap-2 mt-3">
                <button
                    type="button"
                    onClick={() => choose('all')}
                    className="flex-1 bg-signal hover:bg-ink text-white text-sm font-bold py-2 transition-colors"
                >
                    Aceptar
                </button>
                <button
                    type="button"
                    onClick={() => choose('necessary')}
                    className="flex-1 border-[1.5px] border-ink text-ink hover:bg-paper-2 text-sm font-bold py-2 transition-colors"
                >
                    Solo necesarias
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
