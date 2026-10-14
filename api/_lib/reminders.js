// Recordatorios automáticos de los proyectos. Los corre el cron diario
// (api/keepalive.js), así que no suman otra función a Vercel.
//
// Cada uno sale una sola vez por proyecto y queda marcado en quotes.reminders
// ({ brief: fecha, vence: valid_until, ... }), que se ve en /admin. Los de la
// cotización se marcan con su fecha de validez: si se reenvía, vuelven a salir.
// Los correos al cliente no llevan montos.

import { rest, rows } from './orderStore.js';
import {
    sendBriefReminder, sendExpiryReminder, sendExpiredToTeam, sendDepositReminder, sendBalanceReminder,
} from './quoteMail.js';

const DAY = 24 * 60 * 60 * 1000;
const ORIGIN = 'https://interfaz360.cl';
// Tope por corrida: si algo sale mal, que no sea una ráfaga de correos.
const MAX_PER_RUN = 20;

const olderThan = (date, days, now) => !!date && now - new Date(date).getTime() > days * DAY;

// Cuándo toca cada uno. mark = con qué se marca (por defecto, la fecha de envío).
// Los nombres que ve el admin están en REMINDER_LABEL (src/data/quote.js).
export const REMINDERS = [
    {
        key: 'brief',
        due: (r, now) => r.status === 'brief_pendiente' && !r.brief_sent_at && !!(r.brief?.correo || r.client_email)
            && olderThan(r.created_at, 3, now) && !r.reminders?.brief,
        send: sendBriefReminder,
    },
    {
        key: 'vence',
        due: (r, now) => {
            const until = r.quote?.valid_until && new Date(r.quote.valid_until).getTime();
            return r.status === 'cotizacion_enviada' && !!until && until > now && until - now <= 3 * DAY
                && r.reminders?.vence !== r.quote.valid_until;
        },
        mark: (r) => r.quote.valid_until,
        send: sendExpiryReminder,
    },
    {
        key: 'vencida',
        due: (r, now) => r.status === 'cotizacion_enviada' && !!r.quote?.valid_until
            && new Date(r.quote.valid_until).getTime() < now && r.reminders?.vencida !== r.quote.valid_until,
        mark: (r) => r.quote.valid_until,
        send: sendExpiredToTeam,
    },
    {
        key: 'anticipo',
        due: (r, now) => r.status === 'aceptada' && !r.deposit_paid_at && olderThan(r.accepted_at, 5, now) && !r.reminders?.anticipo,
        send: sendDepositReminder,
    },
    {
        key: 'saldo',
        due: (r, now) => r.status !== 'cancelada' && !!r.deposit_paid_at && !r.balance_paid_at
            && olderThan(r.balance_requested_at, 7, now) && !r.reminders?.saldo,
        send: sendBalanceReminder,
    },
];

/**
 * Envía los recordatorios que tocan hoy. Con dryRun solo dice cuáles saldrían.
 * @returns {Promise<Array<{id: number, key: string, ok: boolean}>>}
 */
export async function runReminders({ dryRun = false, now = Date.now() } = {}) {
    const list = await rows(await rest(
        'quotes?status=in.(brief_pendiente,cotizacion_enviada,aceptada,en_desarrollo)&select=*&order=id',
    ), 'leer proyectos');

    const pending = list.flatMap((row) => REMINDERS.filter((r) => r.due(row, now)).map((r) => ({ row, r })));
    const results = [];
    for (const { row, r } of pending.slice(0, MAX_PER_RUN)) {
        if (dryRun) {
            results.push({ id: row.id, key: r.key, ok: true });
            continue;
        }
        const ok = await r.send(row, { origin: ORIGIN });
        if (ok) {
            const reminders = { ...(row.reminders || {}), [r.key]: r.mark ? r.mark(row) : new Date(now).toISOString() };
            row.reminders = reminders;
            const saved = await rest(`quotes?id=eq.${row.id}`, { method: 'PATCH', body: { reminders }, prefer: 'return=minimal' });
            if (!saved.ok) console.error('[recordatorios] marcar', row.id, r.key, saved.status, await saved.text());
        }
        results.push({ id: row.id, key: r.key, ok: !!ok });
    }
    if (pending.length > MAX_PER_RUN) console.error(`[recordatorios] quedaron ${pending.length - MAX_PER_RUN} para mañana`);
    return results;
}
