"use client";

import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { NetworkBadge, PBanner, ShieldSVG, Spin } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { claimPrivateSol, getPrivateUtxos, lamportsToSol } from "@/lib/privacycash/privacy-service";
import { decodePrivacySecret } from "@/lib/privacycash/secret";
import { solanaExplorerUrl } from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

type Step = "ready" | "checking" | "claiming" | "claimed";

export default function ClaimPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, openModal } = wallet;
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<Step>("ready");
  const [error, setError] = useState("");
  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [signature, setSignature] = useState("");
  const [copied, setCopied] = useState(false);

  const validSecret = !secret.trim() || !!decodePrivacySecret(secret);

  const copySignature = async () => {
    await navigator.clipboard?.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const check = async () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!decodePrivacySecret(secret)) {
      setError("Enter a valid claim secret.");
      return;
    }

    try {
      setError("");
      setStep("checking");
      const result = await getPrivateUtxos({ secret, wallet, connection });
      setBalanceLamports(result.balanceLamports);
      setStep("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check this claim secret.");
      setStep("ready");
    }
  };

  const claim = async () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!decodePrivacySecret(secret)) {
      setError("Enter a valid claim secret.");
      return;
    }

    try {
      setError("");
      setStep("claiming");
      const result = await claimPrivateSol({ secret, wallet, connection });
      setSignature(result.withdrawSignature);
      setBalanceLamports(result.amountLamports);
      setStep("claimed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed. No public fallback transfer was sent.");
      setStep("ready");
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>CLAIM PRIVATELY</span>
        <h1 className="d page-title">Claim With<br /><em style={{ color: C.accent }}>Secret.</em></h1>
        <p className="lead">
          Paste the claim secret, connect Phantom, and withdraw the private deposit to your wallet.
        </p>
        <div className="feature-list">
          {[
            { i: "01", t: "Paste claim secret", d: "Secrets are never placed in the URL." },
            { i: "02", t: "Prepare private proof", d: "PrivoCash scans for the private deposit before claiming." },
            { i: "03", t: "Claim privately", d: "Confirm the withdrawal in Phantom when prompted." },
          ].map((f) => (
            <div key={f.t} className="feature-row">
              <span className="m feature-index">{f.i}</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{f.t}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="split-right">
        <div className="form-shell">
          <div className="card form-card">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Claim Secret</label>
                <textarea
                  className="inp"
                  rows={4}
                  placeholder="Paste claim secret"
                  value={secret}
                  onChange={(event) => {
                    setSecret(event.target.value.trim());
                    setError("");
                  }}
                  style={!validSecret ? { borderColor: C.err } : {}}
                />
                {!validSecret && <p style={{ color: C.err, fontSize: 12, marginTop: 6 }}>Invalid claim secret.</p>}
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Network</label>
                <div className="network-lock">
                  <NetworkBadge />
                  <span className="m" style={{ color: C.dim, fontSize: 12 }}>Private claim</span>
                </div>
              </div>

              {balanceLamports != null && (
                <div className="receipt-row">
                  <span>Claimable balance</span>
                  <span className="m">{lamportsToSol(balanceLamports)} SOL</span>
                </div>
              )}

              <PBanner text="If the private proof or withdrawal fails, PrivoCash stops immediately. No public fallback transfer is sent." />
              {step === "checking" && <p style={{ color: C.accent, fontSize: 13 }}>Preparing private payment proof...</p>}
              {step === "claiming" && <p style={{ color: C.accent, fontSize: 13 }}>Generating privacy proof. Confirm in Phantom...</p>}
              {error && <p style={{ color: C.err, fontSize: 13, lineHeight: 1.6 }}>{error}</p>}

              {step === "claimed" ? (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="receipt-row">
                    <span>Status</span>
                    <span className="m">Claimed</span>
                  </div>
                  <button className="btn bs full-mobile" onClick={copySignature}>{copied ? "Copied Signature" : "Copy Signature"}</button>
                  <a className="btn bp full-mobile" href={solanaExplorerUrl(signature)} target="_blank" rel="noreferrer">View on Explorer</a>
                </div>
              ) : (
                <div className="action-row" style={{ margin: 0 }}>
                  <button className="btn bs full-mobile" style={{ flex: 1 }} onClick={check} disabled={step !== "ready"}>
                    {step === "checking" ? <><Spin /> Checking...</> : "Check"}
                  </button>
                  <button className="btn bp full-mobile" style={{ flex: 1 }} onClick={claim} disabled={step !== "ready"}>
                    {step === "claiming" ? <><Spin /> Claiming...</> : <><ShieldSVG sz={17} col="#fff" />{publicKey ? "Claim Privately" : "Connect Phantom"}</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
