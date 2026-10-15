// Registro del visitante cuando completa el formulario del chat.
// No pasa por el modelo: es solo validar, guardar el lead y avisar por correo,
// así que no gasta tokens y garantiza que el lead quede aunque la persona no
// escriba nada más. El correo lleva la conversación hasta ese momento: con eso
// el equipo ya sabe de qué negocio se trata para preparar la demo.

import { cleanVisitor, cleanHistory } from './guardrails.js';
import { registerLead } from './leadStore.js';

export async function handleIdentify(body) {
    const visitor = cleanVisitor(body?.visitor);
    if (!visitor) {
        return { status: 400, payload: { error: 'Revisa tu nombre y WhatsApp.' } };
    }

    const motivo = typeof body?.motivo === 'string' ? body.motivo.trim().slice(0, 160) : '';
    const transcript = cleanHistory(body?.history);

    const ok = await registerLead(
        {
            nombre: visitor.nombre,
            email: visitor.email,
            contacto: visitor.email || `+${visitor.telefono}`,
            telefono: visitor.telefono,
            interes: motivo || 'Dejó sus datos en el chat del sitio web',
            resumen: visitor.email
                ? 'Dejó sus datos en el chat del sitio web (WhatsApp y correo).'
                : 'Dejó sus datos en el chat del sitio web (solo WhatsApp).',
        },
        transcript,
    );

    return { status: 200, payload: { ok } };
}
