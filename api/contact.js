import { checkContactLimit, getClientIp, isAllowedOrigin } from './_lib/guardrails.js';
import { escapeHtml } from './_lib/leads.js';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 3000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req)) {
        return res.status(403).json({ error: 'Origen no permitido.' });
    }

    const limitError = checkContactLimit(getClientIp(req));
    if (limitError) {
        return res.status(429).json({ error: limitError });
    }

    const { name, email, message } = req.body || {};

    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string'
        || !name.trim() || !email.trim() || !message.trim()) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE
        || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email.trim())) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Configuración de servidor incompleta' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Interfaz360 <onboarding@resend.dev>',
                to: ['oss.maturana@gmail.com'],
                reply_to: email.trim(),
                subject: `Nuevo contacto desde interfaz360.cl — ${name.trim().replace(/\s+/g, ' ')}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Nuevo mensaje de contacto</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 80px;"><strong>Nombre:</strong></td>
                                <td style="padding: 8px 0;">${safeName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0;"><a href="mailto:${encodeURIComponent(email.trim())}">${safeEmail}</a></td>
                            </tr>
                        </table>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
                        <h3 style="color: #333;">Mensaje:</h3>
                        <p style="color: #444; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
                        <p style="color: #999; font-size: 12px;">Enviado desde www.interfaz360.cl</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Resend error:', errorData);
            return res.status(500).json({ error: 'Error al enviar el email' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
