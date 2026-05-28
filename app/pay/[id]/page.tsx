"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Countdown, Logo, NetworkBadge, PBanner, ShieldSVG, Spin } from "@/components/Atoms";
import { C } from "@/lib/constants";
import {
  getPaymentLink,
  getPaymentLinkRecord,
  isExpired,
  PaymentLink,
  saveClaimHandoff,
  solToLamports,
  updatePaymentLink,
  updatePaymentLinkRecord,
} from "@/lib/payment-service";
import { depositPrivateSol } from "@/lib/privacycash/privacy-service";
import { useWallet } from "@/lib/wallet-context";

export default function PayLinkPage() {
  const router = useRouter();
  const params = useParams();
  const linkId = params?.id as string;
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, openModal } = wallet;
  const [link, setLink] = useState<PaymentLink | null>(() =>
    typeof window === "undefined" ? null : getPaymentLink(linkId)
  );
  const [loadingLink, setLoadingLink] = useState(true);
  const expired = link ? isExpired(link) : false;
  const isCreator = !!publicKey && !!link?.creator && link.creator === publicKey.toBase58();
  const [step, setStep] = useState<"ready" | "pending">("ready");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPaymentLinkRecord(linkId, true).then((record) => {
      if (!cancelled) {
        setLink(record);
        setLoadingLink(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [linkId]);

  const pay = async () => {
    if (!publicKey) {
      openModal();
      return;
    }
    if (!link) return;
    if (isCreator) {
      await navigator.clipboard?.writeText(`${window.location.origin}/pay/${link.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      return;
    }
    if (expired) {
      setError("This payment link has expired. Ask the recipient to create a new link.");
      await updatePaymentLinkRecord(link.id, { status: "expired" });
      return;
    }

    try {
      setError("");
      setStep("pending");
      setStatus("Preparing private payment...");
      setStatus("Generating private proof...");
      const result = await depositPrivateSol({
        amountLamports: link.amountLamports || solToLamports(link.amount),
        connection,
        wallet,
      });
      updatePaymentLink(link.id, {
        status: "funded",
        depositSignature: result.depositSignature,
      });
      await updatePaymentLinkRecord(link.id, {
        status: "funded",
        depositSignature: result.depositSignature,
      });
      saveClaimHandoff({
        id: link.id,
        source: "payment-link",
        amount: link.amount,
        secret: result.secret,
        depositSignature: result.depositSignature,
        label: link.title,
      });
      router.push(`/pay/success?id=${link.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Private payment could not be completed.");
      setStep("ready");
      setStatus("");
    }
  };

  if (loadingLink) {
    return (
      <div className="split">
        <div className="split-left">
          <Logo sz={22} />
          <span className="lbl" style={{ color: C.accent, display: "block", marginTop: 40, marginBottom: 18 }}>PAYMENT REQUEST</span>
          <h1 className="d page-title">Loading<br /><em style={{ color: C.accent }}>Payment Link.</em></h1>
          <p className="lead">Fetching the private payment request.</p>
        </div>
      </div>
    );
  }

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
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>PRIVATE PAYMENT LINK</span>
        <div className="d amount-hero">{link.amount}</div>
        <div style={{ marginBottom: 34 }}><NetworkBadge /></div>
        <div className="timer-card">
          <div className="lbl" style={{ marginBottom: 12 }}>EXPIRES IN</div>
          <Countdown mins={link.expiryMinutes || 15} expiresAt={link.expiresAt} />
        </div>
        <p className="m lbl" style={{ color: C.dim }}>PAY PRIVATELY, THEN SHARE THE CLAIM SECRET</p>
      </div>

      <div className="split-right">
        <div className="form-shell">
          {step === "ready" && (
            <div className="card form-card">
              <PBanner text="This creates a private deposit. If proof generation fails, no public fallback transfer is sent." />
              <div className="receipt-list">
                {[
                  ["You pay", `${link.amount} ${link.token}`],
                  ["Reference", link.title],
                  ["Network", link.network],
                  ["Status", link.status],
                  ["Expires", expired ? "Expired" : "Active"],
                ].map(([k, v]) => (
                  <div key={k} className="receipt-row">
                    <span>{k}</span>
                    <span className="m">{v}</span>
                  </div>
                ))}
              </div>
              {error && <p style={{ color: C.err, fontSize: 12, marginBottom: 14 }}>{error}</p>}
              <button className="btn bp full-mobile" style={{ width: "100%", padding: "18px", fontSize: 16 }} onClick={pay} disabled={expired && !isCreator}>
                <ShieldSVG sz={18} col="#fff" />
                {isCreator ? copied ? "Copied Link" : "Copy Payment Link" : expired ? "Link Expired" : publicKey ? "Pay Privately" : "Connect Wallet to Pay"}
              </button>
            </div>
          )}

          {step === "pending" && (
            <div className="card form-card center-card">
              <div className="success-orb"><Spin /></div>
              <h3 className="d modal-title">Preparing Private Payment</h3>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65 }}>{status || "Generating private proof. Confirm the private deposit in your wallet when prompted."}</p>
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
