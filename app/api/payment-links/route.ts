import { NextRequest, NextResponse } from "next/server";
import { createDbPaymentLink, databaseEnabled, listDbPaymentLinks } from "@/lib/server/payment-repository";
import { validSolAmount } from "@/lib/payment-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!databaseEnabled()) return NextResponse.json({ links: [], database: false });

  const creator = request.nextUrl.searchParams.get("creator") ?? undefined;
  const links = await listDbPaymentLinks(creator);
  return NextResponse.json({ links, database: true });
}

export async function POST(request: NextRequest) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json();
  if (!validSolAmount(body.amount)) {
    return NextResponse.json({ error: "Enter a valid SOL amount." }, { status: 400 });
  }

  const link = await createDbPaymentLink({
    amount: String(body.amount),
    title: String(body.title ?? ""),
    note: body.note ? String(body.note) : undefined,
    recipient: body.recipient ? String(body.recipient) : undefined,
    creator: body.creator ? String(body.creator) : undefined,
    expiry: body.expiry ? String(body.expiry) : undefined,
  });

  return NextResponse.json({ link }, { status: 201 });
}
