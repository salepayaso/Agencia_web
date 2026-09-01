// Convierte agent_prompt.txt (legible, editable a mano) en agent_prompt.json,
// que es el valor que se pega en la variable de entorno AGENT_PROMPT de Vercel.
//
// Uso:  node scripts/construir-prompt.mjs
//
// Ninguno de los dos archivos se sube al repositorio: el texto del prompt es
// el activo del producto y el repo es publico. Ver api/_lib/prompt.js.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRADA = join(RAIZ, 'agent_prompt.txt');
const SALIDA = join(RAIZ, 'agent_prompt.json');

const REQUERIDOS = ['base', 'pricing', 'gateAnonimo', 'gateIdConTelefono', 'gateIdSinTelefono'];

const texto = readFileSync(ENTRADA, 'utf8');
const partes = texto.split(/^===== BLOQUE: (.+?) =====$/m);

// partes[0] es la cabecera; luego se alternan nombre y contenido.
const bloques = {};
for (let i = 1; i < partes.length; i += 2) {
    const nombre = partes[i].trim();
    // Quita las lineas de comentario que empiezan con # al inicio del bloque.
    const contenido = partes[i + 1].replace(/^\s*(#[^\n]*\n)+/, '').trim();
    bloques[nombre] = contenido;
}

const faltantes = REQUERIDOS.filter((n) => !bloques[n]);
if (faltantes.length) {
    console.error('Faltan bloques o quedaron vacios:', faltantes.join(', '));
    console.error('Revisa que las lineas "===== BLOQUE: nombre =====" esten intactas.');
    process.exit(1);
}

const sobrantes = Object.keys(bloques).filter((n) => !REQUERIDOS.includes(n));
if (sobrantes.length) {
    console.error('Hay bloques con nombre desconocido:', sobrantes.join(', '));
    process.exit(1);
}

for (const clave of ['gateIdConTelefono', 'gateIdSinTelefono']) {
    if (!bloques[clave].includes('{{NOMBRE}}')) {
        console.error(`El bloque ${clave} perdio la marca {{NOMBRE}}. Sin ella el agente no saluda por su nombre.`);
        process.exit(1);
    }
}

const json = JSON.stringify(
    Object.fromEntries(REQUERIDOS.map((n) => [n, bloques[n]]))
);

if (json.includes('\n') || json.includes('\r')) {
    console.error('El JSON quedo con saltos de linea. No se puede pegar en Vercel asi.');
    process.exit(1);
}

writeFileSync(SALIDA, json, 'utf8');

console.log('agent_prompt.json regenerado.');
console.log('Caracteres a pegar en AGENT_PROMPT:', json.length);
console.log('');
console.log('Siguiente paso: Vercel > Environment Variables > AGENT_PROMPT > Edit,');
console.log('pega el contenido de agent_prompt.json, guarda y redespliega sin cache.');
