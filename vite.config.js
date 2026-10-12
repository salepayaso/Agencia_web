import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// Sirve /api/check-domain en desarrollo local (npm run dev).
// En producción Vercel usa api/check-domain.js directamente.
const domainCheckDevApi = () => ({
  name: 'domain-check-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/check-domain', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const { normalizeDomain, queryWhoisClWithRetry, parseWhoisResponse } = await import('./api/_lib/whois.js');
        const url = new URL(req.url, 'http://localhost');
        const name = normalizeDomain(url.searchParams.get('domain'));

        if (!name) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Dominio inválido. Usa solo letras, números y guiones.' }));
          return;
        }

        const domain = `${name}.cl`;
        const raw = await queryWhoisClWithRetry(domain);
        res.statusCode = 200;
        res.end(JSON.stringify(parseWhoisResponse(domain, raw)));
      } catch (error) {
        console.error('WHOIS error (dev):', error);
        res.statusCode = 502;
        res.end(JSON.stringify({ error: 'No pudimos completar la consulta. Intenta de nuevo en unos segundos.' }));
      }
    });
  },
});

// Sirve /api/chat en desarrollo local (npm run dev).
// En producción Vercel usa api/chat.js directamente.
const chatDevApi = () => ({
  name: 'chat-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);

      let body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'JSON inválido' }));
        return;
      }

      if (body?.action === 'identify') {
        const { handleIdentify } = await import('./api/_lib/identify.js');
        const { status, payload } = await handleIdentify(body);
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
        return;
      }

      const { validateRequest, checkRateLimit, registerStrike, getClientIp } =
        await import('./api/_lib/guardrails.js');

      const ip = getClientIp(req);
      const limitError = checkRateLimit(ip);
      if (limitError) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: limitError }));
        return;
      }

      const check = validateRequest(body);

      if (!check.ok && (check.blocked || check.needsIdentity)) {
        const nowBlocked = check.strike ? registerStrike(ip) : false;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          reply: nowBlocked
            ? 'Listo, hasta acá llegamos. Si necesitas algo de verdad, escríbenos por WhatsApp al +56 9 5414 6176.'
            : check.reply,
          needsIdentity: check.needsIdentity === true,
        }));
        return;
      }
      if (!check.ok) {
        res.statusCode = check.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: check.error }));
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });

      const emit = (event) => res.write(`data: ${JSON.stringify(event)}

`);

      try {
        const { runChatTurn } = await import('./api/_lib/chatEngine.js');
        await runChatTurn({ ...check, ip }, emit);
      } catch (error) {
        console.error('Chat error (dev):', error);
        emit({ type: 'error', message: 'Error en el agente. Revisa ANTHROPIC_API_KEY en .env' });
      } finally {
        res.end();
      }
    });
  },
});

// Sirve /api/contact en desarrollo local (npm run dev): formularios y pedidos.
// En producción Vercel usa api/contact.js directamente.
// Sin RESEND_API_KEY y AVISOS_EMAIL en .env (viven en Vercel) no envía nada:
// muestra en la terminal el correo que habría llegado y responde OK.
const contactDevApi = () => ({
  name: 'contact-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/contact', async (req, res) => {
      const send = (status, payload) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      };
      if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      let body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
      } catch {
        return send(400, { error: 'JSON inválido' });
      }

      if (!process.env.RESEND_API_KEY || !process.env.AVISOS_EMAIL) {
        console.log(`\n[contacto · local] Correo NO enviado (faltan RESEND_API_KEY / AVISOS_EMAIL en .env). Habría llegado:\n`
          + `De: ${body.name} <${body.email}>${body.phone ? ` · ${body.phone}` : ''}\n${body.message}\n`);
        return send(200, { success: true, dev: true });
      }

      const { default: handler } = await import('./api/contact.js');
      req.body = body;
      const vercelRes = {
        status(code) { res.statusCode = code; return vercelRes; },
        json(payload) { send(res.statusCode, payload); return vercelRes; },
      };
      await handler(req, vercelRes);
    });
  },
});

// Corre un handler de api/ como lo haría Vercel: req.body, req.query, res.status() y res.json().
async function runVercelHandler(server, req, res, file) {
  const route = new URL(req.url, 'http://localhost');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');
  const type = String(req.headers['content-type'] || '');
  try {
    req.body = type.includes('json') ? JSON.parse(raw || '{}')
      : type.includes('urlencoded') ? Object.fromEntries(new URLSearchParams(raw)) : {};
  } catch {
    req.body = {};
  }
  req.query = Object.fromEntries(route.searchParams);

  const vercelRes = Object.assign(res, {
    status(code) { res.statusCode = code; return vercelRes; },
    json(payload) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
      return vercelRes;
    },
  });
  const { default: handler } = await server.ssrLoadModule(file);
  await handler(req, vercelRes);
}

// Sirve los pagos en línea en desarrollo local (npm run dev):
//   /api/webpay/crear y retorno, contra la integración de Transbank (tarjetas de prueba).
//   /api/mercadopago/crear y retorno, con MP_ACCESS_TOKEN de prueba (TEST-…). El
//   webhook no llega a localhost: el pago se registra al volver de Mercado Pago.
// Necesita SUPABASE_SERVICE_ROLE_KEY en .env. En producción Vercel usa api/<pasarela>/*.js.
const paymentDevApi = (gateway) => ({
  name: `${gateway}-dev-api`,
  configureServer(server) {
    server.middlewares.use(`/api/${gateway}`, async (req, res) => {
      const name = new URL(req.url, 'http://localhost').pathname.replace(/^\//, '');
      if (!['crear', 'retorno'].includes(name)) {
        res.statusCode = 404;
        return res.end();
      }
      await runVercelHandler(server, req, res, `./api/${gateway}/${name}.js`);
    });
  },
});

// Sirve /api/brief en desarrollo local (necesita SUPABASE_SERVICE_ROLE_KEY en .env).
const briefDevApi = () => ({
  name: 'brief-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/brief', (req, res) => runVercelHandler(server, req, res, './api/brief.js'));
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expone las claves del .env al middleware de desarrollo (contexto Node).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
  plugins: [
    react(),
    domainCheckDevApi(),
    chatDevApi(),
    contactDevApi(),
    paymentDevApi('webpay'),
    paymentDevApi('mercadopago'),
    briefDevApi(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
      // Conversion a formatos mas eficientes
      cache: true,
      cacheLocation: '.cache',
    }),
    ],
  };
})
