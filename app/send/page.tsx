"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { NetworkBadge, PBanner, ShieldSVG, Spin, TokenSelect } from "@/components/Atoms";
import { C } from "@/lib/constants";
import {
  parseSolanaAddress,
  recordPrivatePaymentRecord,
  saveClaimHandoff,
  solToLamports,
  validSolAmount,
} from "@/lib/payment-service";
import { depositPrivateSol } from "@/lib/privacycash/privacy-service";
import { useWallet } from "@/lib/wallet-context";

interface Form {
  recipient: string;
  amount: string;
  token: "SOL";
  note: string;
}

export default function SendPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, openModal } = wallet;
  const [form, setForm] = useState<Form>({ recipient: "", amount: "", token: "SOL", note: "" });
  const [errs, setErrs] = useState<Partial<Form>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrs((current) => ({ ...current, [key]: "" }));
    setError("");
  };

  const submit = async () => {
    if (!publicKey) {
      openModal();
      return;
    }

    const recipient = form.recipient.trim() ? parseSolanaAddress(form.recipient) : null;
    const nextErrs: Partial<Form> = {};
    if (form.recipient.trim() && !recipient) nextErrs.recipient = "Enter a valid Solana address";
    if (!validSolAmount(form.amount)) nextErrs.amount = "Enter a valid SOL amount";
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length) return;

    try {
      setLoading(true);
      setStatus("Preparing private payment...");
      const amountLamports = solToLamports(form.amount);
      setStatus("Generating private proof...");
      const result = await depositPrivateSol({
        amountLamports,
        connection,
        wallet,
      });
      const payment = await recordPrivatePaymentRecord({
        recipient: recipient?.toBase58(),
        amount: form.amount,
        note: form.note,
        depositSignature: result.depositSignature,
        ownerWallet: publicKey.toBase58(),
      });
      saveClaimHandoff({
        id: payment.id,
        source: "private-payment",
        amount: form.amount,
        secret: result.secret,
        depositSignature: result.depositSignature,
        label: form.note || "Private SOL payment",
      });
      router.push(`/send/success?id=${payment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Private payment could not be completed.");
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PAY PRIVATELY</span>
        <h1 className="d page-title">Send SOL<br /><em style={{ color: C.accent }}>Privately.</em></h1>
        <p className="lead">
          Create a private SOL deposit and share the generated claim secret with your recipient.
        </p>
        <div className="feature-list">
          {[
            { i: "01", t: "Connect wallet", d: "Authorize the private deposit from your Solana wallet." },
            { i: "02", t: "Create private deposit", d: "Generate a claim secret after the private payment is confirmed." },
            { i: "03", t: "Share securely", d: "Send the secret to your recipient so they can claim privately." },
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
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Recipient Solana Address (optional)</label>
                <input className="inp" placeholder="Paste recipient Solana address" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} style={errs.recipient ? { borderColor: C.err } : {}} />
                {errs.recipient && <p style={{ color: C.err, fontSize: 12, marginTop: 6 }}>{errs.recipient}</p>}
              </div>

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
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Note / Reference (optional)</label>
                <input className="inp" placeholder="Invoice, payout, or short memo" value={form.note} onChange={(e) => set("note", e.target.value)} />
              </div>

              <PBanner text="If private proof generation fails, PrivoCash stops the payment. No public fallback transfer is sent." />
              {status && <p style={{ color: C.accent, fontSize: 13, lineHeight: 1.6 }}>{status}</p>}
              {error && <p style={{ color: C.err, fontSize: 13, lineHeight: 1.6 }}>{error}</p>}

              <button className="btn bp full-mobile" style={{ width: "100%", padding: "17px", fontSize: 15 }} onClick={submit} disabled={loading}>
                {loading ? <><Spin /> Confirm in wallet...</> : <><ShieldSVG sz={17} col="#fff" />{publicKey ? "Pay Privately" : "Connect Wallet"}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
