// Envío del lead capturado por el agente al correo interno, vía Resend.
// Reusa la misma cuenta y API key que api/contact.js.

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

// Botones para responderle al lead de inmediato desde el propio correo.
function buildActions(lead) {
    const boton = (href, texto, color) =>
        `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;margin-right:8px;">${texto}</a>`;

    const saludo = encodeURIComponent(
        `Hola ${lead.nombre}, te escribo de Interfaz360 por tu consulta en nuestro sitio web.`,
    );

    const acciones = [];
    if (lead.telefono) {
        acciones.push(boton(`https://wa.me/${lead.telefono}?text=${saludo}`, 'Responder por WhatsApp', '#25D366'));
    }
    if (/@/.test(lead.contacto)) {
        acciones.push(
            boton(
                `mailto:${encodeURIComponent(lead.contacto)}?subject=${encodeURIComponent('Interfaz360 — tu consulta')}&body=${saludo}`,
                'Responder por correo',
                '#6366f1',
            ),
        );
    }

    return acciones.length ? `<div style="margin-top:20px;">${acciones.join('')}</div>` : '';
}

/**
 * @param {{nombre: string, contacto: string, telefono?: string, interes: string, resumen?: string}} lead
 * @param {Array<{role: string, content: string}>} transcript
 */
export async function sendLeadEmail(lead, transcript = []) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('Lead sin enviar: falta RESEND_API_KEY');
        return false;
    }

    const conversation = transcript
        .map((turn) => {
            const who = turn.role === 'user' ? 'Visitante' : 'Agente';
            const color = turn.role === 'user' ? '#111' : '#6366f1';
            return `<p style="margin:0 0 10px;"><strong style="color:${color};">${who}:</strong> ${escapeHtml(turn.content)}</p>`;
        })
        .join('');

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Interfaz360 <onboarding@resend.dev>',
                to: ['oss.maturana@gmail.com'],
                subject: `🤖 Lead del agente IA — ${lead.nombre}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
                        <h2 style="color: #6366f1; margin-bottom: 4px;">Nuevo lead capturado por el agente IA</h2>
                        <p style="color:#999; font-size:12px; margin-top:0;">Desde el chat de www.interfaz360.cl</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 110px;"><strong>Nombre:</strong></td>
                                <td style="padding: 8px 0;">${escapeHtml(lead.nombre)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Contacto:</strong></td>
                                <td style="padding: 8px 0;">${escapeHtml(lead.contacto)}</td>
                            </tr>
                            ${lead.telefono ? `<tr>
                                <td style="padding: 8px 0; color: #666;"><strong>WhatsApp:</strong></td>
                                <td style="padding: 8px 0;">+${escapeHtml(lead.telefono)}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Interés:</strong></td>
                                <td style="padding: 8px 0;">${escapeHtml(lead.interes)}</td>
                            </tr>
                        </table>
                        ${buildActions(lead)}
                        ${lead.resumen ? `<hr style="border:none;border-top:1px solid #eee;margin:16px 0;" /><h3 style="color:#333;">Resumen del agente</h3><p style="color:#444;line-height:1.6;">${escapeHtml(lead.resumen)}</p>` : ''}
                        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                        <h3 style="color:#333;">Conversación completa</h3>
                        <div style="color:#444;line-height:1.5;font-size:14px;">${conversation}</div>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            console.error('Resend error (lead):', await response.text());
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error enviando lead:', error);
        return false;
    }
}
