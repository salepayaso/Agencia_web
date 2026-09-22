# Chequeo automático — Interfaz360

Sistema propio de monitoreo y pruebas. Revisa que el sitio esté arriba, que sus
funciones comerciales sirvan, que nadie haya metido mano en el código y genera
un **Informe de Estado 360** en HTML, listo para mostrarle a un cliente.

No usa ninguna dependencia externa: solo Node.

---

## Uso rápido

| Comando | Qué hace |
|---|---|
| `npm run checkup` | Revisa todos los proyectos contra producción |
| `npm run checkup:local` | Revisa el sitio corriendo en tu PC (`npm run build && npm run preview`) |
| `npm run checkup:profundo` | Además conversa de verdad con el agente IA (gasta tokens) |
| `npm run checkup:baseline` | Renueva la huella del código: "así quedó, esto es lo correcto" |

Opciones sueltas:

```
node checkup/run.mjs --proyecto=panaderia    solo ese proyecto
node checkup/run.mjs --suite=seguridad       solo esa suite
node checkup/run.mjs --silencioso            sin salida en consola, solo el informe
```

El informe queda en `checkup/reports/`. `ultimo.html` es siempre la última corrida:
ábrelo en el navegador, o imprímelo a PDF para enviarlo.

---

## Los cuatro estados

| Estado | Significa |
|---|---|
| **Correcto** | La verificación pasó |
| **Para revisar** | No hay nada caído, pero conviene mirarlo |
| **Requiere atención** | Algo está mal y hay que corregirlo |
| **No aplica** | La prueba quedó fuera (otro proyecto, o modo seguro) |

Si hay al menos una falla, el comando termina con código 1. Por eso el cron de
GitHub queda en rojo solo y te llega el correo.

---

## Las siete suites

| Suite | Qué revisa | Necesita el repo |
|---|---|---|
| `unidad` | Lógica del buscador de dominios, filtros del agente, limpieza de leads | Sí |
| `infra` | DNS, certificado SSL y días que le quedan, redirección a https, cabeceras | No |
| `paginas` | Que cada ruta cargue, SPA al refrescar, SEO, robots, y que el JS no lleve claves | No |
| `dominios` | Buscador .cl: dominio libre, dominio tomado, basura rechazada, velocidad | No |
| `agente` | Agente IA, formulario de contacto y cron: todos sus rechazos de seguridad | No |
| `enlaces` | Botones internos, número de WhatsApp, correos, enlaces externos vivos | Sí |
| `seguridad` | Huella del código, credenciales filtradas, `npm audit`, cabeceras en `vercel.json` | Sí |

---

## Modo seguro vs. modo profundo

**Por defecto corre en modo seguro.** Eso significa que solo prueba los caminos
que no cuestan plata:

- `/api/contact` → prueba que rechace (403 sin origen, 400 datos malos). **Nunca
  envía un correo real**, porque cada envío gasta cuota de Resend.
- `/api/chat` → prueba que rechace (403, 400, intento de manipulación). **No
  conversa**, porque cada conversación gasta tokens de Claude.
- `identify` → prueba que rechace datos falsos. **No crea leads de prueba** en
  Supabase ni te manda correo.
- Buscador de dominios → 2 consultas reales a NIC.cl. La prueba del tope por
  minuto queda fuera porque gasta 11.

Con `--profundo` se agregan la conversación real con el agente y la prueba del
tope del buscador. Úsalo a mano cuando quieras verificar de punta a punta;
el cron diario nunca lo usa. El envío real de correo no se prueba nunca de
forma automática: eso se verifica a mano desde el formulario del sitio.

---

## La huella del código (detectar cambios que no hiciste tú)

`checkup/baseline.json` guarda el hash de cada archivo de `api/`, `src/`,
`index.html`, `vercel.json` y el `package.json`. En cada corrida se comparan.

- Si nada cambió → "El código está idéntico al último visto bueno".
- Si algo cambió → sale la lista exacta de archivos, como observación.

El flujo es: trabajas, revisas que todo esté bien, y corres
`npm run checkup:baseline` para dejar el nuevo "visto bueno". Desde ahí,
cualquier archivo que aparezca modificado sin que tú lo hayas tocado es una
señal para mirar.

---

## Agregar otro proyecto

Todo vive en `checkup/config/targets.json`. Un proyecto de cliente, sin repo
local, solo necesita esto:

```json
"cliente-nuevo": {
  "nombre": "Cliente Nuevo — sitio web",
  "base": "https://www.clientenuevo.cl",
  "spa": true,
  "rutas": ["/", "/servicios", "/contacto"],
  "suites": ["infra", "paginas"]
}
```

Campos disponibles:

| Campo | Para qué |
|---|---|
| `base` | URL de producción |
| `local` | URL local, para `--local` |
| `repo` | Ruta al repositorio, si lo tienes en disco. Sin esto se omiten `unidad`, `enlaces` y `seguridad` |
| `spa` | `false` si es un sitio tradicional, así no se revisa la reescritura de rutas |
| `rutas` | Páginas a revisar una por una |
| `whatsapp` | Número esperado en los botones, para pillar uno mal escrito |
| `correos` | Casillas válidas en los enlaces `mailto:` |
| `suites` | Cuáles correr |

---

## El cron: cómo queda corriendo solo

Está en `.github/workflows/checkup.yml`. GitHub lo dispara:

- **Todos los días a las 12:00 UTC** (08:00 o 09:00 en Chile según horario de verano).
  GitHub solo entiende UTC, por eso el horario chileno se mueve una hora en el año.
- **En cada push a `main`**, para pillar un despliegue que rompió algo.
- **Cuando tú quieras**, desde la pestaña Actions → "Run workflow".

Corre en los servidores de GitHub, gratis, sin que tu PC esté encendido. Si algo
falla, la corrida queda en rojo y GitHub te manda el correo. El informe queda
descargable desde la corrida durante 30 días.

Ojo: el cron corre contra **producción**, así que revisa el sitio publicado, no
el código de tu máquina. Para revisar lo que tienes en el PC antes de subirlo,
usa `npm run checkup:local`.
