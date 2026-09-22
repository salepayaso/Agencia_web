// Registro de leads en Supabase y aviso por correo sin gastar la cuota de Resend.
// Supabase guarda todo; el correo sale una sola vez por lead cada 24 horas.
// Si Supabase falla, se manda el correo igual: un lead nunca se pierde.

import { sendLeadEmail } from './leads.js';

const RENOTIFY_MS = 24 * 60 * 60 * 1000;

export function supabaseConfig() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return url && key ? { url, key } : null;
}

/** Correo en minúsculas; si no hay, el teléfono; si no, el contacto tal cual. */
export function leadKey({ email, telefono, contacto }) {
    if (email) return email.trim().toLowerCase();
    if (/@/.test(contacto || '')) return contacto.trim().toLowerCase();
    if (telefono) return `tel:${telefono}`;
    return (contacto || '').trim().toLowerCase();
}

async function upsertLead(row) {
    const config = supabaseConfig();
    if (!config) {
        console.error('Lead sin guardar: falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL');
        return null;
    }

    try {
        const response = await fetch(`${config.url}/rest/v1/leads?on_conflict=lead_key`, {
            method: 'POST',
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=representation',
            },
            body: JSON.stringify(row),
        });

        if (!response.ok) {
            console.error('Supabase error (lead):', response.status, await response.text());
            return null;
        }
        const [saved] = await response.json();
        return saved || null;
    } catch (error) {
        console.error('Error guardando lead:', error);
        return null;
    }
}

async function markNotified(key) {
    const config = supabaseConfig();
    if (!config) return;

    try {
        await fetch(`${config.url}/rest/v1/leads?lead_key=eq.${encodeURIComponent(key)}`, {
            method: 'PATCH',
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notified_at: new Date().toISOString() }),
        });
    } catch (error) {
        console.error('Error marcando lead como avisado:', error);
    }
}

/**
 * Guarda el lead y avisa por correo solo si no se avisó en las últimas 24 horas.
 * Devuelve true si el lead quedó registrado por al menos una de las dos vías.
 * @param {{nombre: string, email?: string, telefono?: string, contacto?: string, interes?: string, resumen?: string}} lead
 * @param {Array<{role: string, content: string}>} transcript
 */
export async function registerLead(lead, transcript = []) {
    const key = leadKey(lead);
    if (!key) return false;

    // Solo columnas con valor: en un upsert, lo que no se manda no se pisa.
    const row = { lead_key: key, updated_at: new Date().toISOString() };
    for (const field of ['nombre', 'email', 'telefono', 'contacto', 'interes', 'resumen']) {
        if (lead[field]) row[field] = lead[field];
    }
    if (transcript.length) row.transcript = transcript;

    const saved = await upsertLead(row);

    const lastNotified = saved?.notified_at ? Date.parse(saved.notified_at) : 0;
    if (saved && Date.now() - lastNotified < RENOTIFY_MS) {
        return true;
    }

    const sent = await sendLeadEmail({ ...lead, contacto: lead.contacto || lead.email }, transcript);
    if (sent && saved) await markNotified(key);

    return Boolean(saved) || sent;
}
