// Correos de la cotización: el envío al cliente y la aceptación (aviso al equipo
// y confirmación al cliente). Si un correo falla, el estado igual queda guardado.

import { escapeHtml, avisosFrom } from './leads.js';
import { sendMail, clientesFrom } from './briefMail.js';
import { quoteNumber, quoteTotals, clp } from '../../src/data/quote.js';

const fecha = (v) => new Date(v).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' });
const firstName = (s) => escapeHtml(String(s || '').trim().split(' ')[0]);

const marca = '<p style="font-size:20px;font-weight:800;letter-spacing:.02em;margin:0 0 20px;">INTERFAZ <span style="background:#e8471c;color:#fff;padding:0 4px;">360</span></p>';
const firma = '<p>Saludos,<br><strong>Equipo Interfaz 360</strong><br><a href="https://interfaz360.cl" style="color:#0f1a2e;">interfaz360.cl</a> · WhatsApp +56 9 5414 6176</p>';
const boton = (href, texto) => `<p><a href="${href}" style="display:inline-block;background:#e8471c;color:#fff;text-decoration:none;padding:11px 18px;font-weight:700;">${texto}</a></p>`;
const cuerpo = (html) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#0f1a2e; font-size:15px; line-height:1.55;">${marca}${html}${firma}</div>`;

/** La cotización al cliente, con el enlace para verla, descargarla y aceptarla. */
export function sendQuoteToClient(row, { origin }) {
    const doc = row.quote;
    const t = quoteTotals(doc.items);
    const num = quoteNumber(row);
    return sendMail({
        from: clientesFrom(),
        to: [doc.client.email],
        reply_to: 'contacto@interfaz360.cl',
        subject: `Tu cotización ${num} · Interfaz 360`,
        html: cuerpo(`
            <p>Hola ${firstName(doc.client.contact)}:</p>
            <p>Te enviamos la cotización para ${escapeHtml(doc.client.name)}, preparada con lo que nos contaste.</p>
            <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;font-size:15px;">
                <tr><td style="padding:6px 0;color:#51607a;">Total</td><td style="padding:6px 0;text-align:right;font-weight:700;">${clp(t.total)} <span style="font-weight:400;color:#51607a;">IVA incluido</span></td></tr>
                <tr><td style="padding:6px 0;color:#51607a;">Para partir (50 %)</td><td style="padding:6px 0;text-align:right;font-weight:700;">${clp(t.anticipo)}</td></tr>
                <tr><td style="padding:6px 0;color:#51607a;">Válida hasta</td><td style="padding:6px 0;text-align:right;">${fecha(doc.valid_until)}</td></tr>
            </table>
            <p>En el enlace puedes ver el detalle, descargarla en PDF y aceptarla:</p>
            ${boton(`${origin}/cotizacion/${row.token}`, 'Ver mi cotización')}
            <p>Si quieres cambiar algo o tienes dudas, responde este correo o escríbenos por WhatsApp y lo vemos.</p>
        `),
    }, 'cotización');
}

/** Aviso al equipo: el cliente aceptó. */
export function sendAcceptToTeam(row, { origin }) {
    const destino = process.env.AVISOS_EMAIL;
    if (!destino) return false;
    const doc = row.quote;
    const t = quoteTotals(doc.items);
    return sendMail({
        from: avisosFrom(),
        to: [destino],
        reply_to: doc.client.email,
        subject: `✅ Cotización ${quoteNumber(row)} aceptada · ${doc.client.name} · ${clp(t.total)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#0f1a2e;">
                <h2 style="color:#1f8a4c;margin-bottom:4px;">${escapeHtml(doc.client.name)} aceptó la cotización</h2>
                <p>Envíale los datos de transferencia para el anticipo de <strong>${clp(t.anticipo)}</strong> (50 % de ${clp(t.total)}).</p>
                <p>Contacto: ${escapeHtml(doc.client.contact)} · ${escapeHtml(doc.client.email)}${doc.client.phone ? ` · ${escapeHtml(doc.client.phone)}` : ''}</p>
                <p><a href="${origin}/admin" style="display:inline-block;background:#0f1a2e;color:#fff;text-decoration:none;padding:10px 16px;font-weight:600;">Abrir el panel</a></p>
            </div>
        `,
    }, 'aceptación al equipo');
}

/** Confirmación al cliente de que recibimos su aceptación. */
export function sendAcceptReceipt(row, { origin }) {
    const doc = row.quote;
    const t = quoteTotals(doc.items);
    return sendMail({
        from: clientesFrom(),
        to: [doc.client.email],
        reply_to: 'contacto@interfaz360.cl',
        subject: `Recibimos tu aceptación (${quoteNumber(row)})`,
        html: cuerpo(`
            <p>Hola ${firstName(doc.client.contact)}:</p>
            <p>¡Gracias por confiar en nosotros! Recibimos tu aceptación de la cotización ${quoteNumber(row)}.</p>
            <p>Para partir falta el anticipo de <strong>${clp(t.anticipo)}</strong> (50 % del total). Te enviaremos los datos de transferencia a este correo dentro de un día hábil.</p>
            <p>Mientras tanto, puedes ir juntando tu logo, fotos y textos y mandárnoslos por WhatsApp o en una carpeta de Google Drive.</p>
            ${boton(`${origin}/cotizacion/${row.token}`, 'Ver mi cotización')}
        `),
    }, 'aceptación al cliente');
}
