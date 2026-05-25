# PrivoCash — Solana Payments

Create private payment links or send SOL privately from one simple interface.

## Stack

- Next.js 14 App Router
- TypeScript
- React 18
- Unicorn Studio background (`q74MturjEeRrERoc3hmn`)

## Quick Start

```bash
npm install
npm run dev
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Solana-only landing page |
| `/create` | Create a private Solana payment link |
| `/create/success` | Link details, copy actions, and payment details |
| `/send` | Pay privately by entering recipient address and SOL amount |
| `/send/success` | Mock direct private payment receipt |
| `/pay/[id]` | Payer and recipient status/claim flow |
| `/pay/success` | Mock payment receipt |
| `/dashboard` | Created links, statuses, and copy/view actions |

## Product Boundaries

- Only Solana and SOL payments are active in the UI.
- Phantom is the primary wallet flow.
- Payment-link and private-payment records live in `lib/payment-service.ts`.
- The product does not claim complete transaction invisibility. Solana network activity remains public.

## Integration Points

- Move payment-link and private-payment records from browser storage to durable backend storage.
- Add server-side status indexing for Solana transaction signatures.
