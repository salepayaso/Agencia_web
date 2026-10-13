import { useRef, useEffect } from 'react';

// Confirmación con el diseño del sitio, en vez de la ventana del navegador.
// Se usa a través de useConfirm (src/lib/useConfirm.js).
const ConfirmDialog = ({ title, text, ok = 'Confirmar', cancel = 'Cancelar', danger = false, onClose }) => {
    const okRef = useRef(null);

    useEffect(() => {
        okRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}>
            <div className="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
                <h2 id="confirm-title">{title}</h2>
                {text && <p id="confirm-text">{text}</p>}
                <div className="admin-actions">
                    <button ref={okRef} type="button" className={`btn ${danger ? 'solid' : 'signal'}`} onClick={() => onClose(true)}>{ok}</button>
                    <button type="button" className="textlink" onClick={() => onClose(false)}>{cancel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
