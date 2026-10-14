import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PVGIS (re.jrc.ec.europa.eu) sends no Access-Control-Allow-Origin header,
// so a direct browser fetch() is CORS-blocked (confirmed via real browser
// testing, Aug 2026). In production, /api/pvgis and /api/geocode are Vercel
// serverless functions (api/), same-origin. The dev plugin below serves the
// SAME handler files, so `npm run dev` exercises the real validation, caching
// and rate limiting instead of a separate copy of the proxy logic.
function localApi() {
  const routes = { '/api/pvgis': './api/pvgis.js', '/api/geocode': './api/geocode.js', '/api/log': './api/log.js' }
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const file = routes[url.pathname]
        if (!file) return next()
        try {
          const { default: handler } = await server.ssrLoadModule(file)
          req.query = Object.fromEntries(
            [...url.searchParams.keys()].map((k) => [k, url.searchParams.getAll(k).length > 1 ? url.searchParams.getAll(k) : url.searchParams.get(k)]),
          )
          if (req.method === 'POST') {
            // Vercel parst den Body selbst; im Dev-Server lesen wir ihn hier (Text, max. 16 KB).
            const chunks = []
            let size = 0
            for await (const c of req) { size += c.length; if (size > 16384) break; chunks.push(c) }
            req.body = Buffer.concat(chunks).toString('utf8')
          }
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }
          await handler(req, res)
        } catch (err) {
          console.error('[local-api]', err)
          res.statusCode = 500
          res.end('{"error":"local api error"}')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi()],
  // Kurz-Hash des Commits (Vercel setzt ihn beim Build) — steht in Fehlermeldungen,
  // damit klar ist, welche Version den Fehler erzeugt hat.
  define: {
    __COMMIT__: JSON.stringify((process.env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 7)),
  },
  // Default build (Vercel, domain root) uses absolute "/" asset URLs. The
  // WordPress plugin build sets VITE_BASE=./ instead: WordPress serves the
  // app from a plugin subdirectory whose exact path isn't known at build
  // time, and a relative base makes Vite resolve JS-imported assets (hero
  // photos, logos, ...) via import.meta.url — i.e. relative to wherever the
  // script itself ends up loaded from — instead of the domain root. Without
  // this, every imported image 404s under WordPress (confirmed via local
  // wp-env test, Aug 2026).
  base: process.env.VITE_BASE || '/',
  // Emits .vite/manifest.json (entry -> hashed filename) so non-Vite consumers
  // (the WordPress plugin's PHP enqueue code, see wordpress-plugin/) can look up
  // the current build's asset filenames instead of hardcoding or globbing them.
  build: {
    manifest: true,
  },
})
