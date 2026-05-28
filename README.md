# PrivoCash — Private Solana Payments

Create private payment links or send SOL privately from one simple interface.

## Stack

- Next.js 14 App Router
- TypeScript
- React 18
- Railway Postgres for payment metadata
- Unicorn Studio background (`q74MturjEeRrERoc3hmn`)

## Quick Start

```bash
npm install
npm run dev
```

## Environment

```bash
NEXT_PUBLIC_SOLANA_RPC_URL=
NEXT_PUBLIC_SOLANA_FALLBACK_RPC_URLS=
DATABASE_URL=
DATABASE_SSL=true
```

`DATABASE_URL` should point to the Railway Postgres connection string. If it is missing, the app falls back to browser storage so local UI development still works.

## Railway Postgres

1. Create a Railway project.
2. Add a Postgres database.
3. Copy the database `DATABASE_URL`.
4. Add `DATABASE_URL` to Vercel or the Railway app environment.
5. Keep `DATABASE_SSL=true` for hosted connections.

The app creates the required tables automatically on first API use. The same schema is also available in `database/schema.sql` if you want to run it manually from Railway’s SQL console.

Secrets are not stored in Postgres. The database stores payment metadata, statuses, expiry, and transaction signatures only.

## Routes

| Route | Description |
| --- | --- |
| `/` | Solana-only landing page |
| `/create` | Create a private Solana payment link |
| `/create/success` | Link details, copy actions, and payment details |
| `/send` | Pay privately by entering recipient address and SOL amount |
| `/send/success` | Private payment receipt and claim-secret handoff |
| `/pay/[id]` | Payer and recipient status/claim flow |
| `/pay/success` | Private payment-link receipt and claim-secret handoff |
| `/dashboard` | Created links, statuses, and copy/view actions |
| `/links` | Payment links created by the connected wallet |
| `/docs` | Product and integration docs |
| `/terms` | Terms of use |
| `/privacy` | Privacy policy |

## Product Boundaries

- Only Solana and SOL payments are active in the UI.
- Solana wallets are connected through the wallet adapter modal.
- Payment-link and private-payment metadata is stored in Railway Postgres when `DATABASE_URL` is configured.
- The product does not claim complete transaction invisibility. Solana network activity remains public.

## Integration Points

- Add server-side status indexing for Solana transaction signatures.
