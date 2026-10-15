// Motor del agente IA. Compartido entre la función de Vercel (api/chat.js) y el
// middleware de desarrollo local en vite.config.js.

import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompt.js';
import { LIMITS, cleanPhone } from './guardrails.js';
import { registerLead } from './leadStore.js';
import { logChatTurn } from './chatLog.js';
import { reservarRespuesta } from './agentQuota.js';

// Nivel 1 del catálogo de agentes: FAQ, precios y agendamiento.
// Suficiente para este caso de uso y con el costo por conversación más bajo.
const MODEL = 'claude-haiku-5-5';

// Haiku 5.5 piensa antes de responder. En un chat comercial basta con poco:
// 'low' es lo más rápido y barato. Subir a 'medium' si empieza a saltarse reglas.
const EFFORT = 'low';

const REFUSAL_REPLY =
    'Eso no te lo puedo responder por acá. Si quieres, escríbenos por WhatsApp al +56 9 5414 6176 y lo vemos.';

const LEAD_TOOL = {
    name: 'registrar_lead',
    description:
        'Registra a un visitante interesado y lo que necesita, para que un asesor lo contacte ' +
        'y prepare su demo o propuesta. Úsala cuando ya tengas su nombre y un dato de contacto ' +
        '(WhatsApp o correo), ya sea del formulario o porque lo escribió en el chat. ' +
        'Nunca inventes datos que el visitante no te haya dado.',
    input_schema: {
        type: 'object',
        properties: {
            nombre: { type: 'string', description: 'Nombre del visitante, tal como lo escribió.' },
            contacto: { type: 'string', description: 'Correo o teléfono que entregó el visitante.' },
            interes: { type: 'string', description: 'Qué servicio o plan le interesa, en pocas palabras.' },
            resumen: { type: 'string', description: 'Resumen breve de lo que necesita, para contexto del asesor que lo atienda.' },
        },
        required: ['nombre', 'contacto', 'interes'],
        additionalProperties: false,
    },
    strict: true,
};

// Para quien ya dejó nombre y WhatsApp en el formulario. El modelo no ve esos
// datos, así que con la herramienta completa se los volvía a pedir: acá solo
// informa qué necesita y el servidor completa el resto con el formulario.
const LEAD_TOOL_IDENTIFICADO = {
    name: 'registrar_lead',
    description:
        'Registra algo nuevo que pide un visitante que ya dejó su nombre y WhatsApp en el ' +
        'formulario (otra cotización, otro servicio, contratar), para que un asesor lo vea. ' +
        'El sistema ya tiene sus datos de contacto: no se los pidas.',
    input_schema: {
        type: 'object',
        properties: {
            interes: { type: 'string', description: 'Qué servicio o plan le interesa, en pocas palabras.' },
            resumen: { type: 'string', description: 'Resumen breve de su negocio y lo que necesita, para contexto del asesor que lo atienda.' },
        },
        required: ['interes'],
        additionalProperties: false,
    },
    strict: true,
};

const IDENTIFY_TOOL = {
    name: 'solicitar_datos',
    description:
        'Abre en pantalla un formulario para que el visitante deje su nombre y WhatsApp, ' +
        'con el correo opcional. Úsala cuando acepte la demo sin costo, pida que lo contacten ' +
        'o quiera contratar. No la uses para dar precios: los precios se dan sin pedir datos. ' +
        'No pidas los datos por chat: para eso está esta herramienta.',
    input_schema: {
        type: 'object',
        properties: {
            motivo: {
                type: 'string',
                description: 'Qué pidió el visitante, en pocas palabras. Ej: "demo de landing para su pastelería".',
            },
        },
        required: ['motivo'],
        additionalProperties: false,
    },
    strict: true,
};

function buildClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Falta ANTHROPIC_API_KEY');
    return new Anthropic({ apiKey });
}

/**
 * Ejecuta el turno del agente, va emitiendo eventos por callback y al final
 * guarda el turno en la conversación, aunque el visitante no se haya identificado.
 * @param {{message: string, history: Array, visitor: object, sessionId?: string|null, ip?: string}} params
 * @param {(event: {type: string, [k: string]: unknown}) => void} emit
 */
export async function runChatTurn(params, emit) {
    let reply = '';
    const tracked = (event) => {
        if (event.type === 'delta') reply += event.text;
        emit(event);
    };

    try {
        // Sin cupo o con la prueba vencida no se llama al modelo: deriva a WhatsApp.
        const sinCupo = await reservarRespuesta();
        if (sinCupo) {
            tracked({ type: 'delta', text: sinCupo });
            tracked({ type: 'done' });
            return;
        }
        await runAgent(params, tracked);
    } finally {
        await logChatTurn({ ...params, reply: reply.trim() });
    }
}

async function runAgent({ message, history, visitor }, emit) {
    const client = buildClient();

    const system = buildSystemPrompt(visitor);
    // El formulario solo tiene sentido mientras no sepamos quién es. Quien entró
    // con el formulario antiguo (solo correo) todavía puede dar su WhatsApp por chat.
    const tools = !visitor
        ? [LEAD_TOOL, IDENTIFY_TOOL]
        : [visitor.telefono ? LEAD_TOOL_IDENTIFICADO : LEAD_TOOL];

    const messages = [
        ...history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: 'user', content: message },
    ];

    // Hasta dos vueltas: la respuesta y, si usó una herramienta, el cierre.
    let streamedText = false;

    for (let round = 0; round < 2; round += 1) {
        // Separa el texto previo a la herramienta del cierre, para que no
        // queden dos frases pegadas en la misma burbuja.
        if (round > 0 && streamedText) emit({ type: 'delta', text: '\n\n' });

        const stream = client.messages.stream({
            model: MODEL,
            max_tokens: LIMITS.MAX_OUTPUT_TOKENS,
            output_config: { effort: EFFORT },
            system,
            tools,
            messages,
        });

        stream.on('text', (text) => {
            streamedText = true;
            emit({ type: 'delta', text });
        });

        const response = await stream.finalMessage();

        // Los filtros de seguridad del modelo pueden negarse a responder. Sin
        // texto escrito, el visitante vería una burbuja vacía.
        if (response.stop_reason === 'refusal') {
            if (!streamedText) emit({ type: 'delta', text: REFUSAL_REPLY });
            emit({ type: 'done' });
            return;
        }

        if (response.stop_reason !== 'tool_use') {
            emit({ type: 'done' });
            return;
        }

        const toolUses = response.content.filter((block) => block.type === 'tool_use');
        const results = [];

        for (const call of toolUses) {
            // El agente ya escribió su mensaje antes de abrir el formulario, así
            // que el turno termina acá: una segunda pasada solo repetiría lo mismo.
            if (call.name === 'solicitar_datos') {
                emit({ type: 'identify', motivo: call.input?.motivo || '' });
                if (!streamedText) {
                    emit({
                        type: 'delta',
                        text: 'Déjame tu nombre y WhatsApp acá abajo y te escribimos 👇',
                    });
                }
                emit({ type: 'done' });
                return;
            }

            if (call.name === 'registrar_lead') {
                const transcript = messages
                    .filter((turn) => typeof turn.content === 'string')
                    .map((turn) => ({ role: turn.role, content: turn.content }));

                // Los datos del formulario mandan por sobre lo que informe el modelo.
                // Si ya se avisó por correo al identificarse, solo se completa el registro.
                const sent = await registerLead(
                    {
                        ...call.input,
                        nombre: call.input?.nombre || visitor?.nombre,
                        contacto: call.input?.contacto || visitor?.email || `+${visitor?.telefono}`,
                        email: visitor?.email,
                        telefono: visitor?.telefono || cleanPhone(call.input?.contacto),
                    },
                    transcript,
                );
                emit({ type: 'lead', ok: sent });

                results.push({
                    type: 'tool_result',
                    tool_use_id: call.id,
                    content: sent
                        ? 'Lead registrado. Si todavía no se lo dijiste, confírmale en una frase que un asesor de Interfaz360 le va a escribir por WhatsApp (o por correo si no dejó WhatsApp). No le des otro número ni repitas lo que ya le dijiste.'
                        : 'No se pudo registrar. Pídele disculpas breves al visitante y dale el WhatsApp +56 9 5414 6176 para que escriba directo.',
                });
                continue;
            }

            results.push({
                type: 'tool_result',
                tool_use_id: call.id,
                is_error: true,
                content: 'Herramienta desconocida.',
            });
        }

        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: results });
    }

    emit({ type: 'done' });
}
