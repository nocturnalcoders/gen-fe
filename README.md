# Garuda Empowerment Network — web

The website for Garuda Empowerment Network (GEN): TanStack Start (React, SSR) + Tailwind.
All data comes from the GEN API in `gen-backend`.

## Development

Needs Node 22.12 or newer, and the API running on http://localhost:8000.

```bash
npm install
npm run dev        # http://localhost:8080
```

To use an API somewhere else, put `VITE_API_BASE_URL=...` in `.env.development.local`.

## Production

```bash
npm run build      # writes a Node server to .output/
npm start          # PORT=3000 by default
```

In production the gateway (the `gen-gateway` project) serves this app
and the API on one origin, with the API under `/api`.
