import { useState, useCallback, createElement } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

// Confirmación con el diseño del sitio, en vez de window.confirm.
// Uso:
//   const [confirm, dialog] = useConfirm();
//   if (!(await confirm({ title: '¿Enviar?', text: '…', ok: 'Enviar' }))) return;
//   …y renderizar {dialog} en el componente.
export function useConfirm() {
    const [ask, setAsk] = useState(null); // { title, text, ok, cancel, danger, resolve }

    const confirm = useCallback((opts) => new Promise((resolve) => setAsk({ ...opts, resolve })), []);
    const close = useCallback((value) => {
        setAsk((current) => {
            current?.resolve(value);
            return null;
        });
    }, []);

    const dialog = ask ? createElement(ConfirmDialog, { ...ask, onClose: close }) : null;
    return [confirm, dialog];
}
