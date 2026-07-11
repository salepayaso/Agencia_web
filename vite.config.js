import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    domainCheckDevApi(),
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
})
