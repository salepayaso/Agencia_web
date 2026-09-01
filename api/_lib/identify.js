// Registro del visitante al abrir la conversación.
// No pasa por el modelo: es solo validar y avisar por correo, así que no gasta
// tokens y garantiza que el lead quede aunque la persona no escriba nada más.

import { cleanVisitor } from './guardrails.js';
import { sendLeadEmail } from './leads.js';

export async function handleIdentify(body) {
    const visitor = cleanVisitor(body?.visitor);
    if (!visitor) {
        return { status: 400, payload: { error: 'Revisa tu nombre y correo.' } };
    }

    const sent = await sendLeadEmail({
        nombre: visitor.nombre,
        contacto: visitor.email,
        telefono: visitor.telefono,
        interes: 'Abrió el chat del sitio web',
        resumen: visitor.telefono
            ? 'Entró al chat y dejó su correo y WhatsApp. Todavía no escribe su consulta.'
            : 'Entró al chat y dejó su correo. Todavía no escribe su consulta.',
    });

    return { status: 200, payload: { ok: sent } };
}
