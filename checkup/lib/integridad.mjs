// Huella digital del código. La idea es simple: se guarda el hash de cada
// archivo del sitio cuando está como corresponde (el "visto bueno"), y en cada
// chequeo se compara. Si un archivo cambió sin que tú lo hayas cambiado, sale
// en el informe. Es la red que atrapa un archivo tocado por fuera.

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Lo que se vigila: el código del sitio y la configuración que define su
// seguridad. node_modules queda fuera: eso lo cubre el lockfile y npm audit.
const VIGILADOS = ['api', 'src', 'index.html', 'vercel.json', 'package.json', 'package-lock.json'];
const EXTENSIONES = /\.(js|jsx|mjs|cjs|ts|tsx|json|html|css)$/i;

async function huellaArchivo(ruta) {
    const contenido = await fs.readFile(ruta);
    // Se normalizan los saltos de línea: en Windows un checkout puede cambiarlos
    // sin que el contenido real sea distinto.
    const normalizado = contenido.toString('utf8').replace(/\r\n/g, '\n');
    return crypto.createHash('sha256').update(normalizado).digest('hex').slice(0, 16);
}

async function recorrer(base, relativo, salida) {
    const completo = path.join(base, relativo);
    const info = await fs.stat(completo).catch(() => null);
    if (!info) return;

    if (info.isFile()) {
        if (EXTENSIONES.test(relativo)) salida[relativo.replace(/\\/g, '/')] = await huellaArchivo(completo);
        return;
    }
    for (const entrada of await fs.readdir(completo)) {
        await recorrer(base, path.join(relativo, entrada), salida);
    }
}

/** Hash de cada archivo vigilado del proyecto, indexado por ruta relativa. */
export async function huellaProyecto(repo) {
    const salida = {};
    for (const objetivo of VIGILADOS) await recorrer(repo, objetivo, salida);
    return salida;
}

export function rutaBaseline(repo) {
    return path.join(repo, 'checkup', 'baseline.json');
}

export async function leerBaseline(repo) {
    try {
        return JSON.parse(await fs.readFile(rutaBaseline(repo), 'utf8'));
    } catch {
        return null;
    }
}

export async function guardarBaseline(repo, huella, nota) {
    const contenido = {
        generado: new Date().toISOString(),
        nota: nota || 'Visto bueno manual del código del sitio.',
        total: Object.keys(huella).length,
        archivos: huella,
    };
    await fs.writeFile(rutaBaseline(repo), `${JSON.stringify(contenido, null, 2)}\n`, 'utf8');
    return contenido;
}

/** Compara la huella actual contra el visto bueno guardado. */
export function comparar(baseline, actual) {
    const antes = baseline?.archivos || {};
    const modificados = [];
    const nuevos = [];
    const eliminados = [];

    for (const [ruta, hash] of Object.entries(actual)) {
        if (!(ruta in antes)) nuevos.push(ruta);
        else if (antes[ruta] !== hash) modificados.push(ruta);
    }
    for (const ruta of Object.keys(antes)) {
        if (!(ruta in actual)) eliminados.push(ruta);
    }

    return { modificados, nuevos, eliminados, total: Object.keys(actual).length };
}
