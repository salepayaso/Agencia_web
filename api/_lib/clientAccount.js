// Al publicar un proyecto de cotización el cliente pasa a ser cliente del portal:
// si no tiene cuenta se la creamos (invitación con enlace para crear su
// contraseña) y su ficha se llena con los datos del brief.
//
// La ficha (profiles) la crea el trigger handle_new_user al nacer el usuario;
// aquí solo se completan los campos que estén vacíos, nunca se pisan datos.

import { supabaseConfig } from './leadStore.js';
import { rest, rows } from './orderStore.js';

const clean = (v, max = 200) => {
    const s = String(v ?? '').trim().slice(0, max);
    return s || null;
};

async function findProfile(email) {
    const e = encodeURIComponent(email);
    const [p] = await rows(await rest(`profiles?or=(email.eq.${e},contact_email.eq.${e})&select=*&limit=1`), 'buscar cliente');
    return p || null;
}

/** Crea el usuario y devuelve { id, link } con el enlace para crear su contraseña. */
async function invite(email, name, origin) {
    const config = supabaseConfig();
    if (!config) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL');
    const res = await fetch(`${config.url}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'invite',
            email,
            data: { full_name: name || '' },
            redirect_to: `${origin}/update-password`,
        }),
    });
    if (!res.ok) {
        console.error('[cliente] invitación:', res.status, await res.text());
        return null;
    }
    const data = await res.json();
    const id = data.user?.id || data.id;
    const link = data.properties?.action_link || data.action_link;
    return id && link ? { id, link } : null;
}

/**
 * Deja al cliente de la cotización con cuenta y ficha.
 * Devuelve { account: 'nueva' | 'existente', link } o null si no se pudo (el
 * proyecto se publica igual; el equipo lo crea a mano).
 */
export async function ensureClientAccount(row, { site, origin }) {
    const doc = row.quote || {};
    const brief = row.brief || {};
    const email = clean(doc.client?.email || brief.correo || row.client_email, 200)?.toLowerCase();
    if (!email) return null;
    const name = clean(doc.client?.contact || brief.nombre || row.client_name, 120);

    try {
        let profile = await findProfile(email);
        let account = 'existente';
        let link = null;
        if (!profile) {
            const created = await invite(email, name, origin);
            if (!created) return null;
            account = 'nueva';
            link = created.link;
            profile = await findProfile(email);
            if (!profile) return { account, link };
        }

        // Solo lo que falta en la ficha
        const fill = {
            client_name: name,
            contact_email: email,
            phone: clean(doc.client?.phone || brief.telefono || row.client_phone, 30),
            rut: clean(doc.client?.rut || brief.rut, 20),
            holder_name: clean(brief.razon, 160),
            active_web: clean(site, 200),
        };
        const patch = Object.fromEntries(Object.entries(fill).filter(([k, v]) => v && !profile[k]));
        if (Object.keys(patch).length) {
            const res = await rest(`profiles?id=eq.${profile.id}`, { method: 'PATCH', body: patch, prefer: 'return=minimal' });
            if (!res.ok) console.error('[cliente] completar ficha:', res.status, await res.text());
        }
        return { account, link };
    } catch (err) {
        console.error('[cliente] no se pudo crear la cuenta:', err?.message);
        return null;
    }
}
