import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only plugin: serve the /api/* serverless functions under `npm run dev`.
// Vite normally ignores the /api directory (those run only on Vercel), so
// without this the frontend's fetch("/api/generate") 404s in local dev and the
// UI falls back to the mock. This wires the real handler into Vite's dev server
// so `npm run dev` behaves like production and hits the live Gemini API.
//
// The API key stays server-side: it's read from process.env inside the handler
// and is never added to `define`/import.meta.env, so it never reaches the
// browser bundle.
function apiDevServer(env) {
  return {
    name: 'api-dev-server',
    apply: 'serve', // dev only — no effect on `vite build`
    configureServer(server) {
      // Make the .env.local key visible to the handler via process.env.
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
      }
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        try {
          // Buffer the request body.
          const chunks = []
          for await (const c of req) chunks.push(c)
          const raw = Buffer.concat(chunks).toString()
          const body = raw ? JSON.parse(raw) : {}

          // Adapt Node's res to the Vercel-style { status, json, setHeader } API.
          const shim = {
            statusCode: 200,
            status(code) { res.statusCode = code; return this },
            setHeader(k, v) { res.setHeader(k, v); return this },
            json(payload) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
              return this
            },
          }

          // Load the function through Vite so its imports resolve.
          const mod = await server.ssrLoadModule('/api/generate.js')
          await mod.default({ method: req.method, body }, shim)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Dev API error: ' + (err?.message || 'unknown') }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix loads ALL env vars (incl. unprefixed GEMINI_API_KEY) from
  // .env.local — used only here on the Node side, never exposed to the client.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiDevServer(env)],
    server: {
      port: 5173,
      open: false,
    },
  }
})
