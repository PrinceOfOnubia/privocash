import { NextRequest, NextResponse } from "next/server";
import { databaseEnabled, updateDbPrivatePayment } from "@/lib/server/payment-repository";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json();
  const payment = await updateDbPrivatePayment(params.id, {
    status: body.status,
    withdrawSignature: body.withdrawSignature,
  });
  if (!payment) return NextResponse.json({ error: "Private payment not found." }, { status: 404 });

  return NextResponse.json({ payment });
}
