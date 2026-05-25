"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Countdown, Logo, NetworkBadge, PBanner, ShieldSVG, Spin } from "@/components/Atoms";
import { C } from "@/lib/constants";
import {
  getPaymentLink,
  parseSolanaAddress,
  PaymentLink,
  sendSolPayment,
  updatePaymentLink,
} from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

export default function PayLinkPage() {
  const router = useRouter();
  const params = useParams();
  const linkId = params?.id as string;
  const { connection } = useConnection();
  const { publicKey, sendTransaction, openModal } = useWallet();
  const [link] = useState<PaymentLink | null>(() =>
    typeof window === "undefined" ? null : getPaymentLink(linkId)
  );
  const [step, setStep] = useState<"ready" | "pending">("ready");
  const [error, setError] = useState("");

  const pay = async () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!link) return;

    const recipient = parseSolanaAddress(link.recipient);
    if (!recipient) {
      setError("This payment link has an invalid recipient address.");
      return;
    }

    try {
      setError("");
      setStep("pending");
      const signature = await sendSolPayment({
        amount: link.amount,
        connection,
        from: publicKey,
        recipient,
        sendTransaction,
      });
      updatePaymentLink(link.id, { status: "paid", txSignature: signature });
      router.push(`/pay/success?id=${link.id}&sig=${signature}&amount=${link.amount}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be completed.");
      setStep("ready");
    }
  };

  if (!link) {
    return (
      <div className="split">
        <div className="split-left">
          <Logo sz={22} />
          <span className="lbl" style={{ color: C.accent, display: "block", marginTop: 40, marginBottom: 18 }}>PAYMENT REQUEST</span>
          <h1 className="d page-title">Link<br /><em style={{ color: C.accent }}>Not Found.</em></h1>
          <p className="lead">Ask the recipient for a current PrivoCash payment link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="split">
      <div className="split-left">
        <div style={{ marginBottom: 40 }}><Logo sz={22} /></div>
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>SOLANA PAYMENT REQUEST</span>
        <div className="d amount-hero">{link.amount}</div>
        <div style={{ marginBottom: 34 }}><NetworkBadge /></div>
        <div className="timer-card">
          <div className="lbl" style={{ marginBottom: 12 }}>EXPIRES IN</div>
          <Countdown mins={14} />
        </div>
        <p className="m lbl" style={{ color: C.dim }}>RECIPIENT WALLET IS NOT SHOWN IN THE REQUEST COPY</p>
      </div>

      <div className="split-right">
        <div className="form-shell">
          {step === "ready" && (
            <div className="card form-card">
              <PBanner text="Solana transactions remain public. PrivoCash keeps the payment experience cleaner and more private." />
              <div className="receipt-list">
                {[
                  ["You pay", `${link.amount} ${link.token}`],
                  ["Reference", link.title],
                  ["Network", link.network],
                  ["Recipient", `${link.recipient.slice(0, 8)}...${link.recipient.slice(-6)}`],
                  ["Status", link.status],
                ].map(([k, v]) => (
                  <div key={k} className="receipt-row">
                    <span>{k}</span>
                    <span className="m">{v}</span>
                  </div>
                ))}
              </div>
              {error && <p style={{ color: C.err, fontSize: 12, marginBottom: 14 }}>{error}</p>}
              <button className="btn bp full-mobile" style={{ width: "100%", padding: "18px", fontSize: 16 }} onClick={pay}>
                <ShieldSVG sz={18} col="#fff" />
                {publicKey ? "Pay with Phantom" : "Connect Phantom to Pay"}
              </button>
            </div>
          )}

          {step === "pending" && (
            <div className="card form-card center-card">
              <div className="success-orb"><Spin /></div>
              <h3 className="d modal-title">Submitting Payment</h3>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65 }}>Confirm the transaction in Phantom to complete this payment.</p>
              <div className="sb" style={{ marginTop: 28 }} />
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span className="m lbl">SECURED BY PRIVOCASH · SOLANA PAYMENTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
