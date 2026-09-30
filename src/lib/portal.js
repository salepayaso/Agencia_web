// Piezas comunes del portal del cliente (Dashboard) y del panel de administración (Admin).

export const CATEGORIES = [
    { id: 'general', label: 'Consulta general' },
    { id: 'contenido', label: 'Cambios en mi sitio' },
    { id: 'correo', label: 'Correos' },
    { id: 'dns', label: 'Cambio de DNS' },
    { id: 'pagos', label: 'Pagos y facturación' },
];
export const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || 'Consulta general';

export const TICKET_STATUS = {
    pending: { label: 'En revisión', cls: 'hot' },
    in_progress: { label: 'En curso', cls: 'hot' },
    solved: { label: 'Resuelto', cls: 'ok' },
};
export const isOpen = (t) => t.status !== 'solved';

// Fechas 'AAAA-MM-DD' como fecha local (sin correrse un día por la zona horaria)
export const parseDate = (v) => {
    if (!v) return null;
    const [y, m, d] = String(v).slice(0, 10).split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
};
export const fmt = (d) => d?.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
export const daysFrom = (d) => {
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
};
export const dayWord = (n) => (Math.abs(n) === 1 ? 'día' : 'días');

// ¿Tiene algo contratado? Si no, solo "Contratar" está habilitado; el resto se
// desbloquea al tener un servicio. plan_type y hosting_plan NO cuentan: la base
// les pone 'basic' y 'Plan Básico' por defecto a toda ficha nueva.
export const hasServices = (p, orders = []) =>
    !!(p?.domain_name || p?.active_web || orders.some((o) => o.status === 'activo'));

// "VICTOR ANDRÉS" → "Victor"; para el saludo y la barra superior
export const firstName = (full) => {
    const w = String(full || '').trim().split(/\s+/)[0] || '';
    return w ? w.charAt(0).toLocaleUpperCase('es-CL') + w.slice(1).toLocaleLowerCase('es-CL') : '';
};
