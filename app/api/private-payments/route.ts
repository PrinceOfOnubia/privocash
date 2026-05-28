import { NextRequest, NextResponse } from "next/server";
import { createDbPrivatePayment, databaseEnabled, listDbPrivatePayments } from "@/lib/server/payment-repository";
import { validSolAmount } from "@/lib/payment-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!databaseEnabled()) return NextResponse.json({ payments: [], database: false });

  const ownerWallet = request.nextUrl.searchParams.get("ownerWallet") ?? undefined;
  const payments = await listDbPrivatePayments(ownerWallet);
  return NextResponse.json({ payments, database: true });
}

export async function POST(request: NextRequest) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json();
  if (!validSolAmount(body.amount)) {
    return NextResponse.json({ error: "Enter a valid SOL amount." }, { status: 400 });
  }
  if (!body.depositSignature) {
    return NextResponse.json({ error: "Deposit signature is required." }, { status: 400 });
  }

  const payment = await createDbPrivatePayment({
    amount: String(body.amount),
    recipient: body.recipient ? String(body.recipient) : undefined,
    note: body.note ? String(body.note) : undefined,
    depositSignature: String(body.depositSignature),
    ownerWallet: body.ownerWallet ? String(body.ownerWallet) : undefined,
  });

  return NextResponse.json({ payment }, { status: 201 });
}
