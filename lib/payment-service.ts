import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SOLANA_NETWORK } from "./constants";

export type PaymentStatus = "active" | "paid" | "claimed" | "expired";

export interface PaymentLink {
  id: string;
  title: string;
  amount: string;
  token: "SOL";
  network: typeof SOLANA_NETWORK.label;
  status: PaymentStatus;
  views: number;
  date: string;
  recipient: string;
  note?: string;
  txSignature?: string;
}

export interface PrivatePayment {
  id: string;
  type: "private-payment";
  recipient: string;
  amount: string;
  token: "SOL";
  network: typeof SOLANA_NETWORK.label;
  status: "sent" | "pending";
  date: string;
  note?: string;
  txSignature: string;
}

export interface CreatePaymentInput {
  amount: string;
  title: string;
  note?: string;
  recipient: string;
}

export interface CreatePrivatePaymentInput {
  amount: string;
  recipient: string;
  note?: string;
  txSignature: string;
}

const LINKS_KEY = "privocash.paymentLinks";
const PRIVATE_PAYMENTS_KEY = "privocash.privatePayments";

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

export function getPaymentLinks(): PaymentLink[] {
  return read<PaymentLink[]>(LINKS_KEY, []);
}

export function createPaymentLink(input: CreatePaymentInput): PaymentLink {
  const link: PaymentLink = {
    id: newId("sol"),
    title: input.title.trim() || "Private Solana payment",
    amount: input.amount,
    token: "SOL",
    network: SOLANA_NETWORK.label,
    status: "active",
    views: 0,
    date: today(),
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
    link.id === id ? { ...link, ...patch } : link
  );
  write(LINKS_KEY, links);
}

export function getPrivatePayments(): PrivatePayment[] {
  return read<PrivatePayment[]>(PRIVATE_PAYMENTS_KEY, []);
}

export function recordPrivatePayment(input: CreatePrivatePaymentInput): PrivatePayment {
  const payment: PrivatePayment = {
    id: newId("pay"),
    type: "private-payment",
    recipient: input.recipient,
    amount: input.amount,
    token: "SOL",
    network: SOLANA_NETWORK.label,
    status: "sent",
    date: today(),
    note: input.note?.trim() || undefined,
    txSignature: input.txSignature,
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

export async function sendSolPayment({
  amount,
  connection,
  from,
  recipient,
  sendTransaction,
}: {
  amount: string;
  connection: Connection;
  from: PublicKey;
  recipient: PublicKey;
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
}) {
  const lamports = Math.round(Number(amount) * LAMPORTS_PER_SOL);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: recipient,
      lamports,
    })
  );

  transaction.feePayer = from;
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  const signature = await sendTransaction(transaction, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}

export function solanaExplorerUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}`;
}
