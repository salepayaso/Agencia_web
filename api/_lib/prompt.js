// Cerebro del agente IA de interfaz360.cl
//
// El TEXTO del prompt NO vive en el repositorio: se carga desde la variable de
// entorno AGENT_PROMPT, un JSON con los bloques. Acá queda solo la lógica de
// ensamblado. Motivo: el repositorio es público y el prompt es el activo del
// producto.
//
// Este archivo es la Capa 1 y 2 de contención (alcance cerrado + reglas duras).
// La Capa 3 (filtro previo) vive en ./guardrails.js
//
// IMPORTANTE: mantener el texto ESTABLE entre requests. Se envía con
// cache_control y cualquier cambio de un solo byte invalida el caché.
// No insertar fechas, horas ni datos variables en los bloques.

import { catalogoParaAgente, preciosPublicosParaAgente } from '../../src/data/catalogo.js';

const BLOQUES = ['base', 'pricing', 'gateAnonimo', 'gateIdConTelefono', 'gateIdSinTelefono'];

// Lo que incluye cada servicio y los precios que el sitio ya muestra salen del
// mismo catálogo que usa la página (src/data/catalogo.js), así el agente nunca
// promete algo distinto. AGENT_PROMPT solo lleva la marca donde va cada texto.
// Sin la marca se usa el texto tal cual (prompt antiguo) y se avisa en el log.
const MARCAS = [
    { bloque: 'base', marca: '{{CATALOGO}}', texto: catalogoParaAgente },
    { bloque: 'pricing', marca: '{{PRECIOS_PUBLICOS}}', texto: preciosPublicosParaAgente },
];

// Marca que ocupa el lugar del nombre del visitante dentro de los bloques de
// gate identificado. Se sustituye en cada request.
const TOKEN_NOMBRE = '{{NOMBRE}}';

let cache = null;

function cargarBloques() {
    if (cache) return cache;

    const raw = process.env.AGENT_PROMPT;
    if (!raw) {
        throw new Error('Falta la variable de entorno AGENT_PROMPT con los bloques del prompt.');
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('AGENT_PROMPT no contiene JSON válido.');
    }

    for (const bloque of BLOQUES) {
        if (typeof parsed[bloque] !== 'string' || !parsed[bloque]) {
            throw new Error(`AGENT_PROMPT: falta el bloque "${bloque}" o está vacío.`);
        }
    }

    for (const { bloque, marca, texto } of MARCAS) {
        if (parsed[bloque].includes(marca)) {
            parsed[bloque] = parsed[bloque].split(marca).join(texto());
        } else {
            console.warn(`[prompt] AGENT_PROMPT.${bloque} no tiene ${marca}: se usa el texto fijo, no el catálogo.`);
        }
    }

    cache = parsed;
    return cache;
}

/**
 * Arma el system prompt según si el visitante dejó sus datos o no.
 * Los precios van siempre: el agente los da abiertos y pide el contacto a
 * cambio de la demo. Base y precios van primero y fijos, para que se cacheen
 * entre requests; solo el último bloque cambia según el visitante.
 * @param {{nombre: string, email?: string, telefono?: string} | null} visitor ya validado con cleanVisitor
 */
export function buildSystemPrompt(visitor) {
    const bloques = cargarBloques();
    const fijos = [
        { type: 'text', text: bloques.base },
        { type: 'text', text: bloques.pricing, cache_control: { type: 'ephemeral' } },
    ];

    if (!visitor) {
        return [...fijos, { type: 'text', text: bloques.gateAnonimo }];
    }

    const gate = (visitor.telefono ? bloques.gateIdConTelefono : bloques.gateIdSinTelefono)
        .split(TOKEN_NOMBRE)
        .join(visitor.nombre);

    return [...fijos, { type: 'text', text: gate }];
}
