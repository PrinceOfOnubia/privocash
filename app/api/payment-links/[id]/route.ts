import { NextRequest, NextResponse } from "next/server";
import { databaseEnabled, getDbPaymentLink, updateDbPaymentLink } from "@/lib/server/payment-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseEnabled()) return NextResponse.json({ link: null, database: false }, { status: 404 });

  const { id } = await params;
  const incrementViews = request.nextUrl.searchParams.get("view") === "1";
  const link = await getDbPaymentLink(id, incrementViews);
  if (!link) return NextResponse.json({ error: "Payment link not found." }, { status: 404 });

  return NextResponse.json({ link, database: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const link = await updateDbPaymentLink(id, {
    status: body.status,
    depositSignature: body.depositSignature,
    withdrawSignature: body.withdrawSignature,
    views: body.views,
  });
  if (!link) return NextResponse.json({ error: "Payment link not found." }, { status: 404 });

  return NextResponse.json({ link });
}
