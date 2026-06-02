export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

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
                to: ['contacto@interfaz360.cl'],
                reply_to: email,
                subject: `Nuevo contacto desde interfaz360.cl — ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Nuevo mensaje de contacto</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 80px;"><strong>Nombre:</strong></td>
                                <td style="padding: 8px 0;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                            </tr>
                        </table>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
                        <h3 style="color: #333;">Mensaje:</h3>
                        <p style="color: #444; line-height: 1.6; white-space: pre-wrap;">${message}</p>
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
