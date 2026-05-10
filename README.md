# ClientPilot Backend (SaaS)

Express + Postgres API that powers the ClientPilot **SaaS** dashboard. I built it as a practical backend reference: auth, data modeling, migrations, and Stripe-style subscription plumbing.

## What’s inside
- JWT auth (register/login/reset flows)
- CRUD for clients, projects, invoices
- Dashboard metrics endpoints
- Invoice PDF endpoint
- Subscription endpoints (Stripe integration hooks)

## Stack
- Node.js + TypeScript + Express
- PostgreSQL (`pg`)
- `node-pg-migrate` for migrations
- Stripe SDK (checkout/webhooks)
- Zod for validation

## Run locally
Start Postgres:
```bash
docker compose up -d
```
It exposes Postgres on `localhost:5440` (see `docker-compose.yml`).

Create a `.env` (don’t commit it):
```bash
PORT=5000
DATABASE_URL=postgres://postgres:clientpilot-admin@localhost:5440/clientpilot-db
JWT_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Install + run:
```bash
npm install
npm run dev
```

Migrations:
```bash
npm run migrate:up
```

## Folder map
- `src/server.ts` – server entry
- `src/app.ts` – Express app + middleware
- `src/routes/*` and `src/controllers/*`
- `migrations/*` – migration sources

