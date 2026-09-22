// Informe HTML autocontenido: un solo archivo, sin dependencias, que se abre
// en el navegador o se imprime a PDF. Es lo que se le muestra al cliente.

const ETIQUETA = {
    ok: 'Correcto',
    falla: 'Requiere atención',
    aviso: 'Para revisar',
    omitido: 'No aplica',
};

function escapar(texto) {
    return String(texto).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function evidenciaHtml(evidencia) {
    if (evidencia === null || evidencia === undefined) return '';
    const texto = typeof evidencia === 'string' ? evidencia : JSON.stringify(evidencia, null, 2);
    if (!texto || texto === '""') return '';
    return `<pre class="evidencia">${escapar(texto.slice(0, 1800))}</pre>`;
}

function estadoGeneral(conteo) {
    if (conteo.falla > 0) return { clase: 'falla', titulo: 'Requiere atención', texto: `${conteo.falla} punto(s) que hay que corregir.` };
    if (conteo.aviso > 0) return { clase: 'aviso', titulo: 'Operativo con observaciones', texto: `${conteo.aviso} punto(s) para revisar, nada caído.` };
    return { clase: 'ok', titulo: 'Todo operativo', texto: 'Todas las verificaciones pasaron.' };
}

export function generarHtml(corrida) {
    const general = estadoGeneral(corrida.conteo);
    const fecha = new Date(corrida.fecha).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });

    const proyectos = corrida.proyectos.map((p) => {
        const est = estadoGeneral(p.conteo);
        const suites = p.suites.map((s) => {
            const filas = s.checks.map((c) => `
                <tr class="fila ${c.estado}">
                    <td class="marca"><span class="punto ${c.estado}"></span></td>
                    <td>
                        <div class="titulo">${escapar(c.titulo)}</div>
                        ${c.detalle ? `<div class="detalle">${escapar(c.detalle)}</div>` : ''}
                        ${evidenciaHtml(c.evidencia)}
                    </td>
                    <td class="estado ${c.estado}">${ETIQUETA[c.estado]}</td>
                </tr>`).join('');

            return `
                <section class="suite">
                    <h3>${escapar(s.nombre)}</h3>
                    <table>${filas}</table>
                </section>`;
        }).join('');

        return `
            <article class="proyecto">
                <header class="cabecera-proyecto ${est.clase}">
                    <div>
                        <h2>${escapar(p.nombre)}</h2>
                        <a class="url" href="${escapar(p.base)}">${escapar(p.base)}</a>
                    </div>
                    <div class="semaforo ${est.clase}">
                        <strong>${est.titulo}</strong>
                        <span>${p.conteo.ok} correctas · ${p.conteo.aviso} observaciones · ${p.conteo.falla} fallas</span>
                    </div>
                </header>
                ${suites}
            </article>`;
    }).join('');

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Informe de Estado 360 — ${escapar(fecha)}</title>
<style>
  :root {
    --tinta: #12121a; --suave: #5c5c6e; --linea: #e6e6ef; --fondo: #f6f6fb;
    --marca: #6366f1; --ok: #16a34a; --aviso: #d97706; --falla: #dc2626; --omitido: #9ca3af;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fondo); color: var(--tinta);
         font: 15px/1.55 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .hoja { max-width: 940px; margin: 0 auto; padding: 32px 20px 64px; }
  .portada { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff;
             border-radius: 16px; padding: 28px 30px; margin-bottom: 24px; }
  .portada h1 { margin: 0 0 4px; font-size: 26px; letter-spacing: -0.3px; }
  .portada .marca-nombre { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; opacity: .8; }
  .portada .fecha { opacity: .85; font-size: 14px; margin-top: 10px; }
  .resumen { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .tarjeta { background: rgba(255,255,255,.14); border-radius: 10px; padding: 10px 16px; min-width: 110px; }
  .tarjeta b { display: block; font-size: 22px; }
  .tarjeta span { font-size: 12px; opacity: .85; }
  .veredicto { margin-top: 18px; padding: 12px 16px; border-radius: 10px; background: rgba(255,255,255,.16); }
  .veredicto strong { display: block; font-size: 17px; }
  .proyecto { background: #fff; border: 1px solid var(--linea); border-radius: 14px;
              margin-bottom: 20px; overflow: hidden; }
  .cabecera-proyecto { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between;
                       align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--linea); }
  .cabecera-proyecto h2 { margin: 0; font-size: 18px; }
  .url { color: var(--suave); font-size: 13px; text-decoration: none; }
  .semaforo { text-align: right; font-size: 12px; color: var(--suave); }
  .semaforo strong { display: block; font-size: 14px; }
  .semaforo.ok strong { color: var(--ok); }
  .semaforo.aviso strong { color: var(--aviso); }
  .semaforo.falla strong { color: var(--falla); }
  .suite { padding: 4px 22px 14px; }
  .suite h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
              color: var(--suave); margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  .fila td { border-top: 1px solid var(--linea); padding: 11px 6px; vertical-align: top; }
  .fila.omitido { opacity: .6; }
  .marca { width: 20px; }
  .punto { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-top: 6px; }
  .punto.ok { background: var(--ok); } .punto.aviso { background: var(--aviso); }
  .punto.falla { background: var(--falla); } .punto.omitido { background: var(--omitido); }
  .titulo { font-weight: 600; }
  .detalle { color: var(--suave); font-size: 13.5px; margin-top: 2px; }
  .evidencia { background: #f4f4f9; border-radius: 8px; padding: 8px 10px; margin: 8px 0 0;
               font: 12px/1.45 ui-monospace, Consolas, monospace; white-space: pre-wrap;
               word-break: break-word; color: #3c3c50; max-height: 220px; overflow: auto; }
  .estado { width: 130px; text-align: right; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .estado.ok { color: var(--ok); } .estado.aviso { color: var(--aviso); }
  .estado.falla { color: var(--falla); } .estado.omitido { color: var(--omitido); }
  .pie { color: var(--suave); font-size: 12.5px; text-align: center; margin-top: 26px; line-height: 1.7; }
  @media print {
    body { background: #fff; }
    .proyecto, .portada { break-inside: avoid; }
    .evidencia { max-height: none; }
  }
</style>
</head>
<body>
<div class="hoja">
  <div class="portada">
    <div class="marca-nombre">Interfaz360 · Perfil de Gestión 360</div>
    <h1>Informe de Estado 360</h1>
    <div class="fecha">Revisión automática del ${escapar(fecha)} · modo ${corrida.profundo ? 'profundo' : 'seguro'}</div>
    <div class="resumen">
      <div class="tarjeta"><b>${corrida.conteo.ok}</b><span>Verificaciones correctas</span></div>
      <div class="tarjeta"><b>${corrida.conteo.aviso}</b><span>Observaciones</span></div>
      <div class="tarjeta"><b>${corrida.conteo.falla}</b><span>Fallas</span></div>
      <div class="tarjeta"><b>${corrida.proyectos.length}</b><span>Proyectos revisados</span></div>
    </div>
    <div class="veredicto">
      <strong>${general.titulo}</strong>
      <span>${general.texto}</span>
    </div>
  </div>
  ${proyectos}
  <p class="pie">
    Informe generado automáticamente por el sistema de monitoreo de Interfaz360.<br />
    Las pruebas corren en modo seguro: no se envían correos reales ni se registran datos de prueba.<br />
    www.interfaz360.cl · contacto@interfaz360.cl · +56 9 5414 6176
  </p>
</div>
</body>
</html>
`;
}
