// Cupo mensual y vencimiento del agente IA en el sitio de un cliente.
//
// El sitio del cliente lleva AGENT_CLIENT_ID en Vercel; el cupo y la fecha de
// término viven en Supabase (agentes_clientes / agentes_uso). Sin esa variable
// no hay tope: es el chat de interfaz360.cl.
//
// Si Supabase no responde, el agente atiende igual: una caída nuestra no debe
// dejar mudo el sitio del cliente, y unas respuestas de más cuestan centavos.

import { supabaseConfig } from './leadStore.js';

const WHATSAPP_INTERFAZ = '+56 9 5414 6176';

/**
 * Descuenta una respuesta del mes. Devuelve null si puede responder, o el texto
 * que se le muestra al visitante en lugar de la respuesta del agente.
 * @returns {Promise<string|null>}
 */
export async function reservarRespuesta() {
    const clienteId = process.env.AGENT_CLIENT_ID;
    if (!clienteId) return null;

    const config = supabaseConfig();
    if (!config) {
        console.error('[cupo] falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY: se atiende sin tope');
        return null;
    }

    let cupo;
    try {
        const response = await fetch(`${config.url}/rest/v1/rpc/consumir_respuesta_agente`, {
            method: 'POST',
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ p_cliente: clienteId }),
        });
        if (!response.ok) {
            console.error('[cupo] Supabase error:', response.status, await response.text());
            return null;
        }
        cupo = await response.json();
    } catch (error) {
        console.error('[cupo] no se pudo consultar:', error);
        return null;
    }

    if (cupo?.ok) return null;

    const whatsapp = cupo?.whatsapp || process.env.AGENT_WHATSAPP || WHATSAPP_INTERFAZ;
    console.warn(`[cupo] ${clienteId} sin respuesta: ${cupo?.motivo}`);

    if (cupo?.motivo === 'tope') {
        return `Este mes ya respondí todas las consultas que tengo disponibles 🙏 Escríbenos por WhatsApp al ${whatsapp} y te atendemos ahí.`;
    }
    return `El asistente no está disponible por ahora. Escríbenos por WhatsApp al ${whatsapp} y te atendemos ahí.`;
}
