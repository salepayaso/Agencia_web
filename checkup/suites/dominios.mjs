// Suite 4 — Buscador de dominios .cl. Es el gancho comercial del sitio:
// si esto falla, se caen los leads de venta de dominios.
// Consulta el WHOIS real de NIC.cl, así que se mide con pocas llamadas.

import { ok, falla, aviso, omitido, esperar } from '../lib/check.mjs';
import { pedir } from '../lib/red.mjs';

export const id = 'dominios';
export const nombre = 'Buscador de dominios .cl';

const MS_LENTO = 9000;

export async function run(ctx) {
    const checks = [];
    const endpoint = `${ctx.base}/api/check-domain`;

    // --- Dominio que sabemos tomado ---
    const tomado = await pedir(`${endpoint}?domain=interfaz360`);
    const datosTomado = tomado.json();
    // 429 = el tope por IP de este mismo buscador está activo (p. ej. dos corridas
    // seguidas). No es una falla del sitio y las demás pruebas saldrían igual.
    if (tomado.status === 429) {
        checks.push(aviso('dominios.tope', 'Chequeo del buscador inconcluso',
            'El buscador respondió 429: su tope de consultas por IP está activo, probablemente por una corrida reciente. Repetir en unos minutos.'));
        return checks;
    }
    if (tomado.status !== 200 || !datosTomado) {
        checks.push(falla('dominios.tomado', 'El buscador no responde',
            `Status ${tomado.status}. ${tomado.error || tomado.cuerpo.slice(0, 200)}`));
    } else {
        checks.push(esperar(datosTomado.available === false, 'dominios.tomado',
            'Un dominio registrado se muestra como ocupado',
            `interfaz360.cl aparece tomado${datosTomado.expiration ? `, vence ${datosTomado.expiration}` : ''}.`,
            'Un dominio registrado aparece como disponible: se le podría vender algo que no existe.',
            datosTomado));
        checks.push(esperar(Boolean(datosTomado.expiration), 'dominios.vencimiento',
            'Se muestra la fecha de vencimiento del dominio ocupado',
            `Vence ${datosTomado.expiration}.`,
            'No se está leyendo la fecha de vencimiento desde NIC.cl.', datosTomado));
    }

    // --- Dominio que sabemos libre (nombre aleatorio) ---
    const aleatorio = `libre${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const libre = await pedir(`${endpoint}?domain=${aleatorio}`);
    const datosLibre = libre.json();
    if (libre.status !== 200 || !datosLibre) {
        checks.push(falla('dominios.libre', 'El buscador falla con un dominio libre',
            `Status ${libre.status}. ${libre.error || libre.cuerpo.slice(0, 200)}`));
    } else {
        checks.push(esperar(datosLibre.available === true, 'dominios.libre',
            'Un dominio libre se muestra como disponible',
            `${aleatorio}.cl aparece disponible, que es el caso que genera la venta.`,
            'Un dominio libre aparece como ocupado: se pierde el lead.', datosLibre));
    }

    // --- Velocidad: el visitante está esperando el resultado en pantalla ---
    const peorTiempo = Math.max(tomado.ms || 0, libre.ms || 0);
    checks.push(peorTiempo <= MS_LENTO
        ? ok('dominios.velocidad', 'La búsqueda responde a tiempo', `Peor caso ${peorTiempo} ms.`)
        : aviso('dominios.velocidad', 'La búsqueda está lenta',
            `Peor caso ${peorTiempo} ms. Sobre ${MS_LENTO} ms el visitante cree que se colgó.`));

    // --- Entradas inválidas: no deben llegar a NIC.cl ---
    const invalidos = [
        ['a', 'un nombre de una letra'],
        ['con espacio', 'un nombre con espacios'],
        ['<script>alert(1)</script>', 'un intento de inyectar código'],
        ['', 'un campo vacío'],
    ];
    const pasaronDeLargo = [];
    for (const [valor, descripcion] of invalidos) {
        const res = await pedir(`${endpoint}?domain=${encodeURIComponent(valor)}`);
        if (res.status !== 400) pasaronDeLargo.push(`${descripcion} → ${res.status}`);
    }
    const soloTope = pasaronDeLargo.length > 0 && pasaronDeLargo.every((linea) => linea.endsWith('→ 429'));
    if (soloTope) {
        checks.push(aviso('dominios.invalidos', 'Rechazo de búsquedas basura inconcluso',
            'El tope de consultas se activó a mitad de la prueba (429): no llegan a NIC.cl, pero no se pudo confirmar la validación.',
            pasaronDeLargo));
    } else checks.push(esperar(pasaronDeLargo.length === 0, 'dominios.invalidos',
        'Las búsquedas basura se rechazan antes de consultar NIC.cl',
        `${invalidos.length} entradas inválidas devuelven 400 sin gastar consultas.`,
        'Hay entradas inválidas que llegan al servidor WHOIS.', pasaronDeLargo.length ? pasaronDeLargo : null));

    // --- Solo GET ---
    const post = await pedir(endpoint, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
    checks.push(esperar(post.status === 405, 'dominios.metodo',
        'El buscador solo acepta el método correcto',
        'Un POST devuelve 405.', `Un POST devolvió ${post.status} en vez de 405.`, post.status));

    // --- Rate limit: solo en modo profundo, porque son 11 consultas a NIC.cl ---
    if (!ctx.profundo) {
        checks.push(omitido('dominios.rate-limit', 'Tope de consultas por minuto',
            'Se prueba solo con --profundo: gasta 11 consultas al WHOIS de NIC.cl.'));
        return checks;
    }

    let bloqueado = false;
    for (let i = 0; i < 12 && !bloqueado; i += 1) {
        const res = await pedir(`${endpoint}?domain=rl${i}${Date.now().toString(36)}`);
        if (res.status === 429) bloqueado = true;
    }
    checks.push(esperar(bloqueado, 'dominios.rate-limit',
        'El buscador corta a quien lo usa como scraper',
        'Tras varias consultas seguidas devuelve 429.',
        'No se activó el tope por minuto: alguien puede usar tu buscador como API gratis.'));

    return checks;
}
