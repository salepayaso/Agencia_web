// Correos del brief: el resumen para el equipo y la confirmación para el cliente.
// Si un correo falla, el brief igual queda guardado y se ve en /admin.

import { escapeHtml, avisosFrom } from './leads.js';
import { briefRows, briefNumber, TIPOS } from '../../src/data/brief.js';

// Al cliente le escribimos desde contacto@, que es un buzón real y recibe sus respuestas.
// Sin AVISOS_FROM (desarrollo local) el dominio no está configurado: se usa el remitente de prueba.
const clientesFrom = () => (process.env.AVISOS_FROM ? 'Interfaz 360 <contacto@interfaz360.cl>' : avisosFrom());

async function send(payload, label) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error(`[brief] ${label} sin enviar: falta RESEND_API_KEY`);
        return false;
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) console.error(`[brief] Resend (${label}):`, await res.text());
        return res.ok;
    } catch (error) {
        console.error(`[brief] ${label}:`, error);
        return false;
    }
}

/** Resumen al equipo. again = el cliente lo editó después de enviarlo. */
export function sendBriefToTeam(quote, brief, { origin, again }) {
    const destino = process.env.AVISOS_EMAIL;
    if (!destino) {
        console.error('[brief] resumen sin enviar: falta AVISOS_EMAIL');
        return false;
    }
    const num = briefNumber(quote);
    const filas = briefRows(brief, { team: true }).map(([k, v]) => `
        <tr><td style="padding:6px 12px 6px 0;color:#666;width:140px;vertical-align:top;"><strong>${k}:</strong></td>
        <td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`).join('');
    const aviso = brief.sitio_actual === 'arreglar'
        ? '<p style="background:#fbe3da;padding:10px 12px;margin:0 0 12px;">Quería arreglar un sitio hecho por otros: en el formulario se le dijo que no lo hacemos y que le ofrecemos uno nuevo.</p>'
        : '';

    return send({
        from: avisosFrom(),
        to: [destino],
        ...(brief.correo ? { reply_to: brief.correo } : {}),
        subject: `📝 Brief ${again ? 'actualizado' : 'recibido'} ${num}: ${TIPOS[brief.tipo].resumen} para ${brief.negocio || quote.client_name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color:#0f1a2e;">
                <h2 style="color:#e8471c;margin-bottom:4px;">Brief ${again ? 'actualizado' : 'recibido'} · ${num}</h2>
                <p style="color:#666;margin-top:0;">${escapeHtml(quote.client_name)} ${again ? 'cambió sus respuestas' : 'completó el brief'}. Prepara la cotización en el panel.</p>
                ${aviso}
                <table style="width:100%;border-collapse:collapse;font-size:14px;">${filas}</table>
                <p style="margin-top:20px;"><a href="${origin}/admin" style="display:inline-block;background:#0f1a2e;color:#fff;text-decoration:none;padding:10px 16px;font-weight:600;">Abrir el panel</a></p>
            </div>
        `,
    }, 'resumen');
}

/** Confirmación al cliente, con su enlace para volver a editar. */
export function sendBriefReceipt(quote, brief, { origin }) {
    if (!brief.correo) return false;
    const nombre = escapeHtml((brief.nombre || quote.client_name).split(' ')[0]);
    const enlace = `${origin}/brief/${quote.token}`;
    const como = {
        correo: `te la enviamos a ${escapeHtml(brief.correo)}`,
        whatsapp: `te la mandamos por WhatsApp${brief.telefono ? ` al ${escapeHtml(brief.telefono)}` : ''}`,
        reunion: 'te escribimos para coordinar una reunión por Meet y revisarla juntos',
    }[brief.via];

    return send({
        from: clientesFrom(),
        to: [brief.correo],
        reply_to: 'contacto@interfaz360.cl',
        subject: `Recibimos la información de tu proyecto (${briefNumber(quote)})`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#0f1a2e; font-size:15px; line-height:1.55;">
                <p style="font-size:20px;font-weight:800;letter-spacing:.02em;margin:0 0 20px;">INTERFAZ <span style="background:#e8471c;color:#fff;padding:0 4px;">360</span></p>
                <p>Hola ${nombre}:</p>
                <p>Gracias por contarnos de ${escapeHtml(brief.negocio || 'tu proyecto')}. Recibimos tu información y ya estamos preparando tu cotización: ${como}.</p>
                <p>Si quieres cambiar o agregar algo antes de que la enviemos, puedes volver a tu formulario con este enlace:</p>
                <p><a href="${enlace}" style="display:inline-block;background:#e8471c;color:#fff;text-decoration:none;padding:10px 16px;font-weight:700;">Ver mi formulario</a></p>
                <p>Si tienes logo, fotos o textos, puedes mandárnoslos por WhatsApp al +56 9 5414 6176 o compartirnos una carpeta de Google Drive.</p>
                <p>Saludos,<br><strong>Equipo Interfaz 360</strong><br><a href="https://interfaz360.cl" style="color:#0f1a2e;">interfaz360.cl</a></p>
                <p style="color:#888;font-size:12px;margin-top:28px;">Este enlace es personal: no lo compartas. Referencia ${briefNumber(quote)}.</p>
            </div>
        `,
    }, 'confirmación');
}
