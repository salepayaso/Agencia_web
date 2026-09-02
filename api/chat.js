import { runChatTurn } from './_lib/chatEngine.js';
import { handleIdentify } from './_lib/identify.js';
import {
    validateRequest,
    checkRateLimit,
    registerStrike,
    blockedUntil,
    getClientIp,
    isAllowedOrigin,
} from './_lib/guardrails.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req)) {
        return res.status(403).json({ error: 'Origen no permitido.' });
    }

    const ip = getClientIp(req);
    const limitError = checkRateLimit(ip);
    if (limitError) {
        // blockedUntil solo viene si es un bloqueo por reincidencia. El tope
        // por hora o por día no cierra la ventana: es gente que solo insistió.
        return res.status(429).json({ error: limitError, blockedUntil: blockedUntil(ip) });
    }

    // Registro inicial del visitante: no llama al modelo.
    if (req.body?.action === 'identify') {
        const { status, payload } = await handleIdentify(req.body);
        return res.status(status).json(payload);
    }

    // Si el filtro previo no puede configurarse, no atendemos: es preferible
    // caerse a responder sin Capa 3.
    let check;
    try {
        check = validateRequest(req.body);
    } catch (error) {
        console.error('Guardrails mal configurados:', error);
        return res.status(500).json({ error: 'El chat no está disponible por ahora.' });
    }

    // Bloqueado por el filtro previo: respondemos sin llamar a la API.
    if (!check.ok && check.blocked) {
        const nowBlocked = check.strike ? registerStrike(ip) : false;
        return res.status(200).json({
            reply: nowBlocked
                ? 'Listo, hasta acá llegamos. Si necesitas algo de verdad, escríbenos por WhatsApp al +56 9 5414 6176.'
                : check.reply,
            // Con esto el front se despide y cierra la ventana en vez de dejar
            // a la persona escribiendo al vacío contra el mismo mensaje seco.
            blockedUntil: nowBlocked ? blockedUntil(ip) : 0,
        });
    }

    // Falta identificarse: el front abre el formulario.
    if (!check.ok && check.needsIdentity) {
        return res.status(200).json({ reply: check.reply, needsIdentity: true });
    }
    if (!check.ok) {
        return res.status(check.status).json({ error: check.error });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Falta ANTHROPIC_API_KEY');
        return res.status(500).json({ error: 'El chat no está disponible por ahora.' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    const emit = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);

    try {
        await runChatTurn(check, emit);
    } catch (error) {
        console.error('Chat error:', error);
        emit({
            type: 'error',
            message:
                'Se me cayó la conexión 😕 Intenta de nuevo, o escríbenos por WhatsApp al +56 9 5414 6176.',
        });
    } finally {
        res.end();
    }
}
