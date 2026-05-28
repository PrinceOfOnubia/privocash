import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOLANA_NETWORK } from "./constants";

export type PaymentStatus = "created" | "funded" | "claimed" | "failed" | "expired";

export interface PaymentLink {
  id: string;
  type: "payment-link";
  title: string;
  amount: string;
  amountLamports: number;
  token: "SOL";
  network: typeof SOLANA_NETWORK.label;
  status: PaymentStatus;
  views: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  expiryMinutes: number;
  recipient?: string;
  note?: string;
  depositSignature?: string;
  withdrawSignature?: string;
}

export interface PrivatePayment {
  id: string;
  type: "private-payment";
  amount: string;
  amountLamports: number;
  token: "SOL";
  network: typeof SOLANA_NETWORK.label;
  status: "funded" | "claimed" | "failed";
  date: string;
  createdAt: string;
  updatedAt: string;
  recipient?: string;
  note?: string;
  depositSignature: string;
  withdrawSignature?: string;
}

export interface CreatePaymentInput {
  amount: string;
  title: string;
  note?: string;
  recipient?: string;
  expiry?: string;
}

export interface CreatePrivatePaymentInput {
  amount: string;
  recipient?: string;
  note?: string;
  depositSignature: string;
}

const LINKS_KEY = "privocash.paymentLinks";
const PRIVATE_PAYMENTS_KEY = "privocash.privatePayments";
const CLAIM_HANDOFF_KEY = "privocash.claimHandoff";

const today = () =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date());

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function solToLamports(amount: string) {
  return Math.round(Number(amount) * LAMPORTS_PER_SOL);
}

export function expiryToMinutes(expiry = "15m") {
  if (expiry.endsWith("h")) return Number(expiry.replace("h", "")) * 60;
  if (expiry.endsWith("m")) return Number(expiry.replace("m", ""));
  return 15;
}

export function isExpired(link: Pick<PaymentLink, "expiresAt" | "status">) {
  return link.status !== "funded" && link.status !== "claimed" && Date.now() > new Date(link.expiresAt).getTime();
}

export function getPaymentLinks(): PaymentLink[] {
  return read<PaymentLink[]>(LINKS_KEY, []);
}

export function createPaymentLink(input: CreatePaymentInput): PaymentLink {
  const now = new Date().toISOString();
  const expiryMinutes = expiryToMinutes(input.expiry);
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
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + expiryMinutes * 60_000).toISOString(),
    expiryMinutes,
    recipient: input.recipient,
    note: input.note?.trim() || undefined,
  };

  write(LINKS_KEY, [link, ...getPaymentLinks()]);
  return link;
}

export function getPaymentLink(id: string): PaymentLink | null {
  return getPaymentLinks().find((link) => link.id === id) ?? null;
}

export function updatePaymentLink(id: string, patch: Partial<PaymentLink>) {
  const links = getPaymentLinks().map((link) =>
    link.id === id ? { ...link, ...patch, updatedAt: new Date().toISOString() } : link
  );
  write(LINKS_KEY, links);
}

export function getPrivatePayments(): PrivatePayment[] {
  return read<PrivatePayment[]>(PRIVATE_PAYMENTS_KEY, []);
}

export function recordPrivatePayment(input: CreatePrivatePaymentInput): PrivatePayment {
  const now = new Date().toISOString();
  const payment: PrivatePayment = {
    id: newId("pay"),
    type: "private-payment",
    recipient: input.recipient?.trim() || undefined,
    amount: input.amount,
    amountLamports: solToLamports(input.amount),
    token: "SOL",
    network: SOLANA_NETWORK.label,
    status: "funded",
    date: today(),
    createdAt: now,
    updatedAt: now,
    note: input.note?.trim() || undefined,
    depositSignature: input.depositSignature,
  };

  write(PRIVATE_PAYMENTS_KEY, [payment, ...getPrivatePayments()]);
  return payment;
}

export function parseSolanaAddress(address: string): PublicKey | null {
  try {
    return new PublicKey(address.trim());
  } catch {
    return null;
  }
}

export function validSolAmount(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value) && value > 0;
}

export function solanaExplorerUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}`;
}

export interface ClaimHandoff {
  id: string;
  amount: string;
  secret: string;
  depositSignature: string;
  source: "payment-link" | "private-payment";
  label?: string;
  createdAt: string;
}

export function saveClaimHandoff(input: Omit<ClaimHandoff, "createdAt">) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CLAIM_HANDOFF_KEY, JSON.stringify({
    ...input,
    createdAt: new Date().toISOString(),
  }));
}

export function getClaimHandoff() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(CLAIM_HANDOFF_KEY);
    return value ? (JSON.parse(value) as ClaimHandoff) : null;
  } catch {
    return null;
  }
}

export function clearClaimHandoff() {
  if (typeof window === "undefined") return;
  window.sessionStorage?.removeItem(CLAIM_HANDOFF_KEY);
  window.localStorage.removeItem(CLAIM_HANDOFF_KEY);
}
