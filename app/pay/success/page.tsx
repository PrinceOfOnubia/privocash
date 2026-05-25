"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NetworkBadge, PBanner } from "@/components/Atoms";
import { C } from "@/lib/constants";

const explorerUrl = (signature: string) =>
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

function PaySuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const signature = params.get("sig") || "";
  const amount = params.get("amount") || "0";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="split">
      <div className="split-left">
        <div className="success-orb">
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PAYMENT COMPLETE</span>
        <h1 className="d page-title">Payment<br /><em style={{ color: C.accent }}>Completed.</em></h1>
        <p className="lead">
          The payment was submitted successfully. Keep the transaction signature for your records.
        </p>
        <div className="action-row">
          <button className="btn bs" onClick={copy}>{copied ? "Copied Signature" : "Copy Signature"}</button>
          <a className="btn bp" href={explorerUrl(signature)} target="_blank" rel="noreferrer">View on Explorer</a>
        </div>
      </div>

      <div className="split-right">
        <div className="form-shell">
          <span className="lbl" style={{ display: "block", marginBottom: 24 }}>PAYMENT RECEIPT</span>
          <div className="card form-card">
            <div className="receipt-list" style={{ margin: 0 }}>
              {[
                ["Link", `privo.cash/pay/${id}`],
                ["Amount", `${amount} SOL`],
                ["Network", "Solana"],
                ["Signature", signature ? `${signature.slice(0, 24)}...` : "Unavailable"],
                ["Status", "Paid"],
              ].map(([k, v]) => (
                <div key={k} className="receipt-row">
                  <span>{k}</span>
                  <span className="m">{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}><NetworkBadge /></div>
          </div>
          <PBanner text="Solana transactions remain public. PrivoCash keeps the payment experience cleaner and more private." />
          <button className="btn bs full-mobile" style={{ marginTop: 16, width: "100%" }} onClick={() => router.push("/dashboard")}>View Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default function PaySuccess() {
  return (
    <Suspense fallback={null}>
      <PaySuccessContent />
    </Suspense>
  );
}
