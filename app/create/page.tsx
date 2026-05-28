"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExpiryPills, NetworkBadge, PBanner, ShieldSVG, Spin, TokenSelect } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { createPaymentLinkRecord } from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

interface Form {
  amount: string;
  token: "SOL";
  expiry: string;
  title: string;
  note: string;
}

export default function CreatePage() {
  const router = useRouter();
  const { publicKey, openModal } = useWallet();
  const [form, setForm] = useState<Form>({ amount: "", token: "SOL", expiry: "15m", title: "", note: "" });
  const [errs, setErrs] = useState<Partial<Form>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  };

  const go = async () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!form.amount || Number.isNaN(+form.amount) || +form.amount <= 0) {
      setErrs({ amount: "Enter a valid SOL amount" });
      return;
    }

    setLoading(true);
    try {
      const link = await createPaymentLinkRecord({
        amount: form.amount,
        title: form.title,
        note: form.note,
        expiry: form.expiry,
        creator: publicKey.toBase58(),
      });
      setTimeout(() => router.push(`/create/success?id=${link.id}`), 400);
    } catch {
      setErrs({ amount: "Payment link could not be created. Try again." });
      setLoading(false);
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PRIVATE SOLANA PAYMENT LINK</span>
        <h1 className="d page-title">
          Create a<br /><em style={{ color: C.accent }}>Private Link.</em>
        </h1>
        <p className="lead">
          Generate a private payment link. The payer creates a private deposit and receives a claim secret to share securely.
        </p>
        <div className="feature-list">
          {[
            { icon: "01", t: "Connect wallet", d: "Use a Solana wallet with no account or email." },
            { icon: "02", t: "Create a secure link", d: "Set a SOL amount, reference, and optional note." },
            { icon: "03", t: "Share and claim", d: "Payers fund a private deposit, then share the claim secret securely." },
          ].map((f) => (
            <div key={f.t} className="feature-row">
              <span className="m feature-index">{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{f.t}</div>
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
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Amount</label>
                <div className="amount-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input className="inp" type="number" min="0" step="0.001" placeholder="0.00" value={form.amount} onChange={(e) => set("amount", e.target.value)} style={errs.amount ? { borderColor: C.err } : {}} />
                    {errs.amount && <p style={{ color: C.err, fontSize: 12, marginTop: 6 }}>{errs.amount}</p>}
                  </div>
                  <TokenSelect value={form.token} onChange={(v) => set("token", v as "SOL")} />
                </div>
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Network</label>
                <div className="network-lock">
                  <NetworkBadge />
                  <span className="m" style={{ color: C.dim, fontSize: 12 }}>Private deposit</span>
                </div>
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Link Expires In</label>
                <ExpiryPills value={form.expiry} onChange={(v) => set("expiry", v)} />
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Reference</label>
                <input className="inp" placeholder="Invoice, service, or payment label" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Note (optional)</label>
                <input className="inp" placeholder="Invoice, service, or short memo" value={form.note} onChange={(e) => set("note", e.target.value)} />
              </div>

              <PBanner text="Payment links create private deposits. Claim secrets are shown only after a successful private payment." />

              <button className="btn bp full-mobile" style={{ width: "100%", padding: "17px", fontSize: 15 }} onClick={go}>
                {loading ? <><Spin /> Creating...</> : <><ShieldSVG sz={17} col="#fff" />{publicKey ? "Create Private Link" : "Connect Wallet"}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
