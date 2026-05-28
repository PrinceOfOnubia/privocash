import { QueryResultRow } from "pg";
import { SOLANA_NETWORK } from "@/lib/constants";
import {
  CreatePaymentInput,
  CreatePrivatePaymentInput,
  expiryToMinutes,
  PaymentLink,
  PaymentStatus,
  PrivatePayment,
  solToLamports,
} from "@/lib/payment-service";
import { ensureSchema, getPool, hasDatabase } from "./db";

const today = () =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date());

const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const iso = (value: Date | string) => new Date(value).toISOString();

function linkFromRow(row: QueryResultRow): PaymentLink {
  return {
    id: row.id,
    type: "payment-link",
    title: row.title,
    amount: row.amount,
    amountLamports: Number(row.amount_lamports),
    token: "SOL",
    network: row.network,
    status: row.status,
    views: Number(row.views),
    date: row.date,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    expiresAt: iso(row.expires_at),
    expiryMinutes: Number(row.expiry_minutes),
    creator: row.creator ?? undefined,
    recipient: row.recipient ?? undefined,
    note: row.note ?? undefined,
    depositSignature: row.deposit_signature ?? undefined,
    withdrawSignature: row.withdraw_signature ?? undefined,
  };
}

function paymentFromRow(row: QueryResultRow): PrivatePayment {
  return {
    id: row.id,
    type: "private-payment",
    amount: row.amount,
    amountLamports: Number(row.amount_lamports),
    token: "SOL",
    network: row.network,
    status: row.status,
    date: row.date,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    recipient: row.recipient ?? undefined,
    note: row.note ?? undefined,
    depositSignature: row.deposit_signature,
    withdrawSignature: row.withdraw_signature ?? undefined,
  };
}

export function databaseEnabled() {
  return hasDatabase();
}

export async function createDbPaymentLink(input: CreatePaymentInput) {
  await ensureSchema();
  const expiryMinutes = expiryToMinutes(input.expiry);
  const now = new Date();
  const link: PaymentLink = {
    id: newId("sol"),
    type: "payment-link",
    title: input.title.trim() || "Private Solana payment",
    amount: input.amount,
    amountLamports: solToLamports(input.amount),
    token: "SOL",
    network: SOLANA_NETWORK.label,
    status: "created",
    views: 0,
    date: today(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + expiryMinutes * 60_000).toISOString(),
    expiryMinutes,
    creator: input.creator,
    recipient: input.recipient,
    note: input.note?.trim() || undefined,
  };

  await getPool().query(
    `insert into payment_links (
      id, title, amount, amount_lamports, network, status, views, date,
      created_at, updated_at, expires_at, expiry_minutes, creator, recipient, note
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [
      link.id,
      link.title,
      link.amount,
      link.amountLamports,
      link.network,
      link.status,
      link.views,
      link.date,
      link.createdAt,
      link.updatedAt,
      link.expiresAt,
      link.expiryMinutes,
      link.creator ?? null,
      link.recipient ?? null,
      link.note ?? null,
    ]
  );

  return link;
}

export async function listDbPaymentLinks(creator?: string) {
  await ensureSchema();
  const result = creator
    ? await getPool().query("select * from payment_links where creator = $1 order by created_at desc", [creator])
    : await getPool().query("select * from payment_links order by created_at desc limit 100");
  return result.rows.map(linkFromRow);
}

export async function getDbPaymentLink(id: string, incrementViews = false) {
  await ensureSchema();
  if (incrementViews) {
    await getPool().query("update payment_links set views = views + 1, updated_at = now() where id = $1", [id]);
  }
  const result = await getPool().query("select * from payment_links where id = $1", [id]);
  return result.rows[0] ? linkFromRow(result.rows[0]) : null;
}

export async function updateDbPaymentLink(id: string, patch: Partial<PaymentLink>) {
  await ensureSchema();
  const allowed: Record<string, string> = {
    status: "status",
    depositSignature: "deposit_signature",
    withdrawSignature: "withdraw_signature",
    views: "views",
  };
  const entries = Object.entries(patch).filter(([key, value]) => allowed[key] && value !== undefined);
  if (entries.length === 0) return getDbPaymentLink(id);

  const sets = entries.map(([key], index) => `${allowed[key]} = $${index + 2}`);
  const values = entries.map(([, value]) => value);
  const result = await getPool().query(
    `update payment_links set ${sets.join(", ")}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  );
  return result.rows[0] ? linkFromRow(result.rows[0]) : null;
}

export async function createDbPrivatePayment(input: CreatePrivatePaymentInput & { ownerWallet?: string }) {
  await ensureSchema();
  const now = new Date();
  const payment: PrivatePayment & { ownerWallet?: string } = {
    id: newId("pay"),
    type: "private-payment",
    recipient: input.recipient?.trim() || undefined,
    amount: input.amount,
    amountLamports: solToLamports(input.amount),
    token: "SOL",
    network: SOLANA_NETWORK.label,
    status: "funded",
    date: today(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    note: input.note?.trim() || undefined,
    depositSignature: input.depositSignature,
    ownerWallet: input.ownerWallet,
  };

  await getPool().query(
    `insert into private_payments (
      id, owner_wallet, recipient, amount, amount_lamports, network, status, date,
      created_at, updated_at, note, deposit_signature
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      payment.id,
      payment.ownerWallet ?? null,
      payment.recipient ?? null,
      payment.amount,
      payment.amountLamports,
      payment.network,
      payment.status,
      payment.date,
      payment.createdAt,
      payment.updatedAt,
      payment.note ?? null,
      payment.depositSignature,
    ]
  );

  return payment;
}

export async function listDbPrivatePayments(ownerWallet?: string) {
  await ensureSchema();
  const result = ownerWallet
    ? await getPool().query("select * from private_payments where owner_wallet = $1 order by created_at desc", [ownerWallet])
    : await getPool().query("select * from private_payments order by created_at desc limit 100");
  return result.rows.map(paymentFromRow);
}

export async function updateDbPrivatePayment(id: string, patch: { status?: PaymentStatus; withdrawSignature?: string }) {
  await ensureSchema();
  const allowed: Record<string, string> = {
    status: "status",
    withdrawSignature: "withdraw_signature",
  };
  const entries = Object.entries(patch).filter(([key, value]) => allowed[key] && value !== undefined);
  if (entries.length === 0) return null;
  const sets = entries.map(([key], index) => `${allowed[key]} = $${index + 2}`);
  const values = entries.map(([, value]) => value);
  const result = await getPool().query(
    `update private_payments set ${sets.join(", ")}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  );
  return result.rows[0] ? paymentFromRow(result.rows[0]) : null;
}
