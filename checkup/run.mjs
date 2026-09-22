#!/usr/bin/env node
//
// Chequeo automático de Interfaz360.
//
//   node checkup/run.mjs                      todos los proyectos, contra producción
//   node checkup/run.mjs --proyecto=panaderia solo ese proyecto
//   node checkup/run.mjs --local              contra el sitio corriendo en tu PC
//   node checkup/run.mjs --profundo           además conversa de verdad con el agente IA
//   node checkup/run.mjs --baseline           renueva la huella del código (visto bueno)
//   node checkup/run.mjs --suite=seguridad    corre solo una suite
//
// Sale con código 1 si algo falló: así el cron de GitHub avisa solo.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { correrSuite, resumir } from './lib/check.mjs';
import { generarHtml } from './lib/informe.mjs';
import { huellaProyecto, guardarBaseline } from './lib/integridad.mjs';

import * as unidad from './suites/unidad.mjs';
import * as infra from './suites/infra.mjs';
import * as paginas from './suites/paginas.mjs';
import * as dominios from './suites/dominios.mjs';
import * as agente from './suites/agente.mjs';
import * as enlaces from './suites/enlaces.mjs';
import * as seguridad from './suites/seguridad.mjs';

const SUITES = { unidad, infra, paginas, dominios, agente, enlaces, seguridad };

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const COLOR = {
    ok: '\x1b[32m', falla: '\x1b[31m', aviso: '\x1b[33m', omitido: '\x1b[90m',
    reset: '\x1b[0m', negrita: '\x1b[1m',
};
const MARCA = { ok: 'OK  ', falla: 'FALLA', aviso: 'AVISO', omitido: '--  ' };

function leerArgumentos(argv) {
    const args = { proyecto: null, suite: null, local: false, profundo: false, baseline: false, silencioso: false };
    for (const arg of argv) {
        if (arg === '--local') args.local = true;
        else if (arg === '--profundo') args.profundo = true;
        else if (arg === '--baseline') args.baseline = true;
        else if (arg === '--silencioso') args.silencioso = true;
        else if (arg.startsWith('--proyecto=')) args.proyecto = arg.split('=')[1];
        else if (arg.startsWith('--suite=')) args.suite = arg.split('=')[1];
    }
    return args;
}

async function main() {
    const args = leerArgumentos(process.argv.slice(2));

    if (args.baseline) {
        const huella = await huellaProyecto(RAIZ);
        const guardado = await guardarBaseline(RAIZ, huella);
        console.log(`Huella renovada: ${guardado.total} archivos vigilados.`);
        console.log('A partir de ahora, cualquier cambio en el código sale en el informe.');
        return 0;
    }

    const objetivos = JSON.parse(await fs.readFile(path.join(AQUI, 'config', 'targets.json'), 'utf8'));
    const seleccionados = args.proyecto
        ? { [args.proyecto]: objetivos[args.proyecto] }
        : objetivos;

    if (args.proyecto && !objetivos[args.proyecto]) {
        console.error(`No existe el proyecto "${args.proyecto}" en checkup/config/targets.json.`);
        console.error(`Disponibles: ${Object.keys(objetivos).join(', ')}`);
        return 2;
    }

    const corrida = {
        fecha: new Date().toISOString(),
        profundo: args.profundo,
        local: args.local,
        proyectos: [],
        conteo: { ok: 0, falla: 0, aviso: 0, omitido: 0 },
    };

    for (const [clave, proyecto] of Object.entries(seleccionados)) {
        const base = (args.local && proyecto.local ? proyecto.local : proyecto.base).replace(/\/$/, '');
        const repo = proyecto.repo ? path.resolve(RAIZ, proyecto.repo) : null;
        const ctx = { clave, proyecto, base, repo, profundo: args.profundo, local: args.local };

        const nombres = (proyecto.suites || Object.keys(SUITES))
            .filter((s) => !args.suite || s === args.suite);

        if (!args.silencioso) {
            console.log(`\n${COLOR.negrita}${proyecto.nombre}${COLOR.reset}  ${base}`);
        }

        const resultados = [];
        for (const nombreSuite of nombres) {
            const suite = SUITES[nombreSuite];
            if (!suite) continue;
            const resultado = await correrSuite(suite, ctx);
            resultados.push(resultado);

            if (!args.silencioso) {
                console.log(`\n  ${COLOR.negrita}${resultado.nombre}${COLOR.reset}`);
                for (const c of resultado.checks) {
                    console.log(`  ${COLOR[c.estado]}${MARCA[c.estado]}${COLOR.reset}  ${c.titulo}`);
                    if (c.estado === 'falla' && c.detalle) console.log(`         ${COLOR.falla}${c.detalle}${COLOR.reset}`);
                    else if (c.estado === 'aviso' && c.detalle) console.log(`         ${COLOR.aviso}${c.detalle}${COLOR.reset}`);
                }
            }
        }

        const todos = resultados.flatMap((r) => r.checks);
        const conteo = resumir(todos);
        for (const clave2 of Object.keys(corrida.conteo)) corrida.conteo[clave2] += conteo[clave2] || 0;

        corrida.proyectos.push({ clave, nombre: proyecto.nombre, base, suites: resultados, conteo });
    }

    const { rutaHtml, rutaJson } = await escribirInformes(corrida);

    if (!args.silencioso) {
        const { ok, aviso, falla } = corrida.conteo;
        console.log(`\n${COLOR.negrita}Resumen:${COLOR.reset} ${COLOR.ok}${ok} correctas${COLOR.reset}, `
            + `${COLOR.aviso}${aviso} observaciones${COLOR.reset}, ${COLOR.falla}${falla} fallas${COLOR.reset}`);
        console.log(`Informe: ${rutaHtml}`);
        console.log(`Datos:   ${rutaJson}`);
    }

    return corrida.conteo.falla > 0 ? 1 : 0;
}

async function escribirInformes(corrida) {
    const carpeta = path.join(AQUI, 'reports');
    await fs.mkdir(carpeta, { recursive: true });

    const sello = corrida.fecha.slice(0, 19).replace(/[:T]/g, '-');
    const rutaHtml = path.join(carpeta, `estado-${sello}.html`);
    const rutaJson = path.join(carpeta, `estado-${sello}.json`);

    const html = generarHtml(corrida);
    await fs.writeFile(rutaHtml, html, 'utf8');
    await fs.writeFile(rutaJson, `${JSON.stringify(corrida, null, 2)}\n`, 'utf8');
    // Copia fija para abrir siempre el último sin buscar el archivo con fecha.
    await fs.writeFile(path.join(carpeta, 'ultimo.html'), html, 'utf8');

    return { rutaHtml, rutaJson };
}

process.exitCode = await main();
