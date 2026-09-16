// Cron diario de Vercel: consulta la base para que el proyecto gratis de
// Supabase no se pause tras 7 días sin actividad.

export default async function handler(req, res) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const url = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        console.error('Keepalive: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
        return res.status(500).json({ error: 'Configuración de servidor incompleta' });
    }

    try {
        const response = await fetch(`${url}/rest/v1/rpc/keepalive`, {
            method: 'POST',
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
            },
            body: '{}',
        });

        if (!response.ok) {
            console.error('Keepalive falló:', response.status, await response.text());
            return res.status(502).json({ error: 'Supabase no respondió bien' });
        }

        return res.status(200).json({ ok: true, at: await response.json() });
    } catch (error) {
        console.error('Keepalive error:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
