// Abre el chat del agente desde cualquier botón del sitio.
// Si viene un mensaje, el chat lo envía como si la persona lo hubiera escrito,
// así el agente responde al tiro sobre lo que le interesó.
export const OPEN_CHAT_EVENT = 'interfaz360:open-chat';

export const openChat = (message = '') => {
    window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { message } }));
};
