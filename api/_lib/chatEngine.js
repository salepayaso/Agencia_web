// Motor del agente IA. Compartido entre la función de Vercel (api/chat.js) y el
// middleware de desarrollo local en vite.config.js.

import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompt.js';
import { LIMITS, cleanPhone } from './guardrails.js';
import { sendLeadEmail } from './leads.js';

// Nivel 1 del catálogo de agentes: FAQ, precios y agendamiento.
// Suficiente para este caso de uso y con el costo por conversación más bajo.
const MODEL = 'claude-haiku-4-5';

const LEAD_TOOL = {
    name: 'registrar_lead',
    description:
        'Registra los datos de un visitante interesado y los envía al equipo comercial por correo. ' +
        'Úsala solo cuando el visitante ya te dio su nombre y al menos un dato de contacto ' +
        '(correo o teléfono). Nunca inventes datos que el visitante no te haya dado.',
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


const IDENTIFY_TOOL = {
    name: 'solicitar_datos',
    description:
        'Abre en pantalla un formulario para que el visitante deje su nombre, correo y ' +
        'WhatsApp opcional. Úsala apenas muestre interés concreto en los servicios, ' +
        'productos o precios de Interfaz360. No pidas los datos por chat: para eso está esta herramienta.',
    input_schema: {
        type: 'object',
        properties: {
            motivo: {
                type: 'string',
                description: 'Qué le interesa al visitante, en pocas palabras. Ej: "precio de una landing".',
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
 * Ejecuta el turno del agente y va emitiendo eventos por callback.
 * @param {{message: string, history: Array, visitor: object}} params
 * @param {(event: {type: string, [k: string]: unknown}) => void} emit
 */
export async function runChatTurn({ message, history, visitor }, emit) {
    const client = buildClient();

    const system = buildSystemPrompt(visitor);
    // El formulario solo tiene sentido mientras no sepamos quién es.
    const tools = visitor ? [LEAD_TOOL] : [LEAD_TOOL, IDENTIFY_TOOL];

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
            system,
            tools,
            messages,
        });

        stream.on('text', (text) => {
            streamedText = true;
            emit({ type: 'delta', text });
        });

        const response = await stream.finalMessage();

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
                        text: 'Déjame tus datos acá abajo y te muestro precios y detalles 👇',
                    });
                }
                emit({ type: 'done' });
                return;
            }

            if (call.name === 'registrar_lead') {
                const transcript = messages
                    .filter((turn) => typeof turn.content === 'string')
                    .map((turn) => ({ role: turn.role, content: turn.content }));

                // El teléfono del formulario manda por sobre lo que informe el modelo.
                const sent = await sendLeadEmail(
                    { ...call.input, telefono: visitor?.telefono || cleanPhone(call.input?.contacto) },
                    transcript,
                );
                emit({ type: 'lead', ok: sent });

                results.push({
                    type: 'tool_result',
                    tool_use_id: call.id,
                    content: sent
                        ? 'Lead registrado. Confírmale al visitante que el equipo de Interfaz360 lo va a contactar a la brevedad por correo o WhatsApp, y ofrécele el WhatsApp +56 9 5414 6176 si prefiere escribir de inmediato.'
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
