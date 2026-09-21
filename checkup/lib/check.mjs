// Vocabulario común de todas las suites: un chequeo es un objeto con estado.
// 'ok' pasa, 'falla' rompe el informe, 'aviso' no rompe pero hay que mirarlo,
// 'omitido' es un chequeo que no aplica a este proyecto o quedó fuera del modo.

export const ESTADOS = ['ok', 'falla', 'aviso', 'omitido'];

function build(estado, id, titulo, detalle, evidencia) {
    return { id, titulo, estado, detalle: detalle || '', evidencia: evidencia || null };
}

export const ok = (id, titulo, detalle, evidencia) => build('ok', id, titulo, detalle, evidencia);
export const falla = (id, titulo, detalle, evidencia) => build('falla', id, titulo, detalle, evidencia);
export const aviso = (id, titulo, detalle, evidencia) => build('aviso', id, titulo, detalle, evidencia);
export const omitido = (id, titulo, detalle) => build('omitido', id, titulo, detalle, null);

/** Atajo: pasa o falla según la condición. */
export function esperar(condicion, id, titulo, detalleOk, detalleFalla, evidencia) {
    return condicion
        ? ok(id, titulo, detalleOk, evidencia)
        : falla(id, titulo, detalleFalla, evidencia);
}

/** Envuelve una suite para que un error inesperado no tumbe la corrida entera. */
export async function correrSuite(suite, ctx) {
    try {
        const checks = await suite.run(ctx);
        return { id: suite.id, nombre: suite.nombre, checks };
    } catch (error) {
        return {
            id: suite.id,
            nombre: suite.nombre,
            checks: [falla(`${suite.id}.excepcion`, 'La suite no pudo completarse', String(error?.message || error))],
        };
    }
}

/** Resumen numérico de una lista de chequeos. */
export function resumir(checks) {
    const conteo = { ok: 0, falla: 0, aviso: 0, omitido: 0 };
    for (const c of checks) conteo[c.estado] = (conteo[c.estado] || 0) + 1;
    return conteo;
}
