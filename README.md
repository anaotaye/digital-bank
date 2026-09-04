# Digital Bank – Ann's Bank

A fullstack digital bank with Next.js frontend and Node.js/Express backend, integrating with NIBSS for interbank transfers.

## How to run

1. From the root directory, install dependencies:

   ```sh
   npm install
   ```

2. Configure environment variables:
   - `apps/api/.env` — NIBSS credentials + other backend vars (see `.env.example`)
   - `apps/web/.env.local` — frontend API URL (see `.env.local.example`)

3. Start both API and frontend concurrently:

   ```sh
   npm run dev
   ```

   - API: http://localhost:4000
   - Frontend: http://localhost:3000

## Project structure

```
digital-bank/
├── apps/
│   ├── api/          ← Node.js + Express backend
│   └── web/          ← Next.js frontend
├── packages/
│   └── shared/       ← Shared Zod schemas + types
└── package.json      ← Root workspace config
```

## Workspaces

- `@repo/api` — backend server
- `@repo/web` — Next.js frontend
- `@repo/shared` — shared schemas & types
