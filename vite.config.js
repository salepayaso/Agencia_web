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
        await runChatTurn(check, emit);
      } catch (error) {
        console.error('Chat error (dev):', error);
        emit({ type: 'error', message: 'Error en el agente. Revisa ANTHROPIC_API_KEY en .env' });
      } finally {
        res.end();
      }
    });
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
