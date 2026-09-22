// Registro de cada turno del chat en Supabase, se identifique o no el visitante.
// Si falla, solo se anota en el log: el chat nunca se corta por esto.

import { supabaseConfig } from './leadStore.js';

/**
 * Agrega el mensaje del visitante y la respuesta del agente a su conversación.
 * @param {{sessionId: string|null, ip?: string, visitor?: {nombre: string, email: string}|null, message: string, reply: string}} turn
 */
export async function logChatTurn({ sessionId, ip, visitor, message, reply }) {
    const config = supabaseConfig();
    if (!config || !sessionId) return;

    const at = new Date().toISOString();
    const turnos = [{ role: 'user', content: message, at }];
    if (reply) turnos.push({ role: 'assistant', content: reply, at });

    try {
        const response = await fetch(`${config.url}/rest/v1/rpc/registrar_turno_chat`, {
            method: 'POST',
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                p_session_id: sessionId,
                p_ip: ip && ip !== 'unknown' ? ip : null,
                p_lead_key: visitor?.email || null,
                p_nombre: visitor?.nombre || null,
                p_turnos: turnos,
            }),
        });

        if (!response.ok) {
            console.error('Supabase error (chat):', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error guardando conversación:', error);
    }
}
