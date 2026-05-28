"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NetworkBadge, PBanner } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { getClaimHandoff, solanaExplorerUrl } from "@/lib/payment-service";

function PaySuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const handoff = getClaimHandoff();
  const signature = handoff?.depositSignature || "";
  const amount = handoff?.amount || "0";
  const [copied, setCopied] = useState<"sig" | "secret" | null>(null);

  const copy = async (value: string, key: "sig" | "secret") => {
    await navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="split">
      <div className="split-left">
        <div className="success-orb">
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PRIVATE DEPOSIT FUNDED</span>
        <h1 className="d page-title">Claim Secret<br /><em style={{ color: C.accent }}>Ready.</em></h1>
        <p className="lead">
          The private deposit was confirmed. Share the claim secret securely with the recipient so they can claim privately.
        </p>
        {handoff?.secret && (
          <div className="copy-box">
            <span className="m copy-value">{handoff.secret}</span>
            <button className="btn bo bsm" onClick={() => copy(handoff.secret, "secret")}>{copied === "secret" ? "Copied" : "Copy Secret"}</button>
          </div>
        )}
        <div className="action-row">
          <button className="btn bs" onClick={() => copy(signature, "sig")}>{copied === "sig" ? "Copied Signature" : "Copy Signature"}</button>
          <a className="btn bp" href={solanaExplorerUrl(signature)} target="_blank" rel="noreferrer">View on Explorer</a>
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
                ["Status", "Private deposit funded"],
              ].map(([k, v]) => (
                <div key={k} className="receipt-row">
                  <span>{k}</span>
                  <span className="m">{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}><NetworkBadge /></div>
          </div>
          <PBanner text="Save this secret now. It is not stored in the payment link or exposed in the URL." />
          <button className="btn bs full-mobile" style={{ marginTop: 16, width: "100%" }} onClick={() => router.push("/claim")}>Open Claim Page</button>
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
