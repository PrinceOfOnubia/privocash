"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { NetworkBadge, PBanner, ShieldSVG, Spin, TokenSelect } from "@/components/Atoms";
import { C } from "@/lib/constants";
import {
  parseSolanaAddress,
  recordPrivatePayment,
  sendSolPayment,
  validSolAmount,
} from "@/lib/payment-service";
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
  const { publicKey, sendTransaction, openModal } = useWallet();
  const [form, setForm] = useState<Form>({ recipient: "", amount: "", token: "SOL", note: "" });
  const [errs, setErrs] = useState<Partial<Form>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const recipient = parseSolanaAddress(form.recipient);
    const nextErrs: Partial<Form> = {};
    if (!recipient) nextErrs.recipient = "Enter a valid Solana address";
    if (!validSolAmount(form.amount)) nextErrs.amount = "Enter a valid SOL amount";
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length || !recipient) return;

    try {
      setLoading(true);
      const signature = await sendSolPayment({
        amount: form.amount,
        connection,
        from: publicKey,
        recipient,
        sendTransaction,
      });
      recordPrivatePayment({
        recipient: recipient.toBase58(),
        amount: form.amount,
        note: form.note,
        txSignature: signature,
      });
      router.push(`/send/success?sig=${signature}&amount=${form.amount}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction was not completed.");
      setLoading(false);
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PAY PRIVATELY</span>
        <h1 className="d page-title">Send SOL<br /><em style={{ color: C.accent }}>Privately.</em></h1>
        <p className="lead">
          Enter a recipient Solana address and amount. PrivoCash keeps the payment experience cleaner while Solana transactions remain public.
        </p>
        <div className="feature-list">
          {[
            { i: "01", t: "Connect Phantom", d: "Authorize the transfer from your Solana wallet." },
            { i: "02", t: "Enter recipient and amount", d: "Pay privately with SOL through a cleaner flow." },
            { i: "03", t: "Track signature", d: "Review the transaction on Solana Explorer after sending." },
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
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Recipient Solana Address</label>
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
                  <span className="m" style={{ color: C.dim, fontSize: 12 }}>Direct SOL transfer</span>
                </div>
              </div>

              <div>
                <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Note / Reference (optional)</label>
                <input className="inp" placeholder="Invoice, payout, or short memo" value={form.note} onChange={(e) => set("note", e.target.value)} />
              </div>

              <PBanner text="Reduce wallet exposure when requesting and sending payments. Solana transactions remain public." />
              {error && <p style={{ color: C.err, fontSize: 13, lineHeight: 1.6 }}>{error}</p>}

              <button className="btn bp full-mobile" style={{ width: "100%", padding: "17px", fontSize: 15 }} onClick={submit} disabled={loading}>
                {loading ? <><Spin /> Sending...</> : <><ShieldSVG sz={17} col="#fff" />{publicKey ? "Pay Privately" : "Connect Phantom"}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
