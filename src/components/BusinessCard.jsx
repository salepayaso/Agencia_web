import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import Wordmark from './Wordmark';

// Tarjeta digital (/tarjeta): se comparte por QR o enlace.
const INFO = {
    name: 'Interfaz 360',
    role: 'Agencia digital · Web, Google y Agentes IA',
    email: 'contacto@interfaz360.cl',
    website: 'interfaz360.cl',
    url: 'https://interfaz360.cl',
    instagram: 'https://www.instagram.com/interfaz360/',
};

const VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Interfaz 360
ORG:Interfaz 360
TITLE:Agencia digital
EMAIL:contacto@interfaz360.cl
URL:https://interfaz360.cl
END:VCARD`;

const BusinessCard = () => {
    const [copied, setCopied] = useState(false);

    const saveContact = () => {
        const url = URL.createObjectURL(new Blob([VCARD], { type: 'text/vcard' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interfaz-360.vcf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Interfaz 360', text: 'Tarjeta digital de Interfaz 360', url: window.location.href });
            } catch {
                // la persona cerró el menú de compartir
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // sin portapapeles: el enlace sigue en la barra del navegador
        }
    };

    return (
        <div className="tc-page">
            <SEO title="Tarjeta digital" description="Tarjeta digital de Interfaz 360." />
            <main className="tc gutter" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', paddingBlock: 40 }}>
                <div className="panel" style={{ width: 'min(420px, 100%)' }}>
                    <div style={{ background: 'var(--ink)', padding: '36px 28px 28px', color: '#fff' }}>
                        <Wordmark className="text-[34px]" />
                        <p style={{ margin: '14px 0 0', color: 'var(--mute)', fontSize: 15 }}>{INFO.role}</p>
                    </div>
                    <div className="box-body" style={{ padding: 24, gap: 18 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <button type="button" className="btn signal" style={{ justifyContent: 'center' }} onClick={saveContact}>Guardar contacto</button>
                            <button type="button" className="btn" style={{ justifyContent: 'center' }} onClick={share}>{copied ? 'Enlace copiado' : 'Compartir'}</button>
                        </div>
                        <dl className="acct" style={{ boxShadow: 'none', margin: 0 }}>
                            <div className="row"><dt>Correo</dt><dd><b><a href={`mailto:${INFO.email}`}>{INFO.email}</a></b></dd><span /></div>
                            <div className="row"><dt>Sitio</dt><dd><b><a href={INFO.url} target="_blank" rel="noopener noreferrer">{INFO.website}</a></b></dd><span /></div>
                            <div className="row" style={{ borderBottom: 0 }}><dt>Instagram</dt><dd><b><a href={INFO.instagram} target="_blank" rel="noopener noreferrer">@interfaz360</a></b></dd><span /></div>
                        </dl>
                        <Link to="/" className="textlink" style={{ justifySelf: 'start' }}>Ir al sitio →</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessCard;
