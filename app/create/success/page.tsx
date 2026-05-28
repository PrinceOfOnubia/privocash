"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Countdown, NetworkBadge, PBanner } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { getPaymentLink, PaymentLink } from "@/lib/payment-service";

function CreateSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const [link] = useState<PaymentLink | null>(() =>
    typeof window === "undefined" ? null : getPaymentLink(id)
  );
  const [copied, setCopied] = useState<string | null>(null);

  const url = `privo.cash/pay/${id}`;

  const copy = async (value: string, key: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  if (!link) {
    return (
      <div className="split">
        <div className="split-left">
          <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PAYMENT LINK</span>
          <h1 className="d page-title">Link<br /><em style={{ color: C.accent }}>Not Found.</em></h1>
          <p className="lead">Create a secure payment link to start receiving SOL.</p>
          <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="split">
      <div className="split-left">
        <div className="success-orb">
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={C.accent} strokeWidth="2" strokeLinecap="round" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={C.accent} strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PAYMENT LINK READY</span>
        <h1 className="d page-title">Link<br /><em style={{ color: C.accent }}>Created.</em></h1>
        <p className="lead">
          Share this private payment link. Payers fund a private deposit and receive a claim secret to share securely.
        </p>

        <div className="copy-box">
          <span className="m copy-value">{url}</span>
          <button className="btn bo bsm" onClick={() => copy(url, "url")}>{copied === "url" ? "Copied" : "Copy"}</button>
        </div>

        <div className="action-row">
          <button className="btn bs" onClick={() => router.push(`/pay/${id}`)}>Open Link</button>
          <button className="btn bp" onClick={() => router.push("/create")}>Create Another</button>
        </div>
      </div>

      <div className="split-right" style={{ alignItems: "center" }}>
        <div className="form-shell">
          <div className="card form-card">
            <div className="lbl" style={{ marginBottom: 24 }}>PAYMENT DETAILS</div>
            <div className="detail-grid">
              <div className="detail-cell">
                <div className="lbl">AMOUNT</div>
                <div className="d detail-value">{link.amount} <span>SOL</span></div>
              </div>
              <div className="detail-cell">
                <div className="lbl">EXPIRES IN</div>
                <Countdown mins={15} />
              </div>
            </div>
            <div className="receipt-list">
              <div className="receipt-row"><span>Reference</span><span>{link.title}</span></div>
              <div className="receipt-row"><span>Claim method</span><span className="m">Secret</span></div>
            </div>
            <NetworkBadge />
          </div>
          <PBanner text="Claim secrets are not stored in the link or exposed in the URL." />
        </div>
      </div>
    </div>
  );
}

export default function CreateSuccess() {
  return (
    <Suspense fallback={null}>
      <CreateSuccessContent />
    </Suspense>
  );
}
