"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExpiryPills, NetworkBadge, PBanner, ShieldSVG, Spin, TokenSelect } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { createPaymentLink } from "@/lib/payment-service";
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

  const go = () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!form.amount || Number.isNaN(+form.amount) || +form.amount <= 0) {
      setErrs({ amount: "Enter a valid SOL amount" });
      return;
    }

    setLoading(true);
    const link = createPaymentLink({
      amount: form.amount,
      title: form.title,
      note: form.note,
      recipient: publicKey.toBase58(),
    });
    setTimeout(() => router.push(`/create/success?id=${link.id}`), 400);
  };

  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PRIVATE SOLANA PAYMENT LINK</span>
        <h1 className="d page-title">
          Create a<br /><em style={{ color: C.accent }}>Private Link.</em>
        </h1>
        <p className="lead">
          Generate a secure Solana payment link. Share it anywhere and let recipients claim privately without showing your primary wallet in the payment request.
        </p>
        <div className="feature-list">
          {[
            { icon: "01", t: "Connect Phantom", d: "Use a Solana wallet with no account or email." },
            { icon: "02", t: "Create a secure link", d: "Set a SOL amount, reference, and optional note." },
            { icon: "03", t: "Share and get paid", d: "Payers open the link and send SOL to your connected wallet." },
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
                  <span className="m" style={{ color: C.dim, fontSize: 12 }}>SOL payments</span>
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

              <PBanner text="Solana transactions remain public. PrivoCash keeps the request experience cleaner and more private." />

              <button className="btn bp full-mobile" style={{ width: "100%", padding: "17px", fontSize: 15 }} onClick={go}>
                {loading ? <><Spin /> Creating...</> : <><ShieldSVG sz={17} col="#fff" />{publicKey ? "Create Private Link" : "Connect Phantom"}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
