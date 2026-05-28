"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NetworkBadge, ShieldSVG, STag } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { getPaymentLinks, PaymentLink } from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

export default function LinksPage() {
  const router = useRouter();
  const { wallet, walletName, openModal } = useWallet();
  const [copied, setCopied] = useState<string | null>(null);
  const [links] = useState<PaymentLink[]>(() =>
    typeof window === "undefined" ? [] : getPaymentLinks()
  );

  const copy = async (id: string) => {
    const origin = typeof window === "undefined" ? "https://privo.cash" : window.location.origin;
    await navigator.clipboard?.writeText(`${origin}/pay/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  if (!wallet) {
    return (
      <div className="split">
        <div className="split-left">
          <ShieldSVG sz={52} />
          <h2 className="d page-title" style={{ marginTop: 28 }}>Connect your<br /><em style={{ color: C.accent }}>Solana Wallet.</em></h2>
          <p className="lead">Connect a wallet to view the private payment links created in this browser.</p>
          <button className="btn bp full-mobile" onClick={openModal}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="wallet-card">
          <div className="lbl" style={{ marginBottom: 6 }}>CONNECTED WALLET</div>
          <div className="m" style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{walletName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="pulse-dot" />
            <span className="m" style={{ fontSize: 12, color: C.accent }}>{wallet.slice(0, 8)}...{wallet.slice(-4)}</span>
          </div>
        </div>
        <button className="snav" onClick={() => router.push("/dashboard")} style={{ color: C.muted }}>Dashboard</button>
        <button className="snav on" onClick={() => router.push("/links")} style={{ color: C.accent }}>Payment Links</button>
      </aside>

      <main className="dash-main">
        <div className="dash-head">
          <div>
            <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 10 }}>PAYMENT LINKS</span>
            <h1 className="d dash-title">Links Created</h1>
          </div>
          <div className="head-actions">
            <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="card empty-state">
            <ShieldSVG sz={34} />
            <h3 className="d">No links yet</h3>
            <p>Create a private payment link and it will appear here.</p>
            <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
          </div>
        ) : (
          <div className="card link-table">
            <div className="table-head">
              {["Link", "Amount", "Network", "Views", "Status", "Actions"].map((h) => <span key={h} className="lbl">{h}</span>)}
            </div>
            {links.map((link) => (
              <div key={link.id} className="table-row">
                <div>
                  <div className="activity-type">Payment link</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{link.title}</div>
                  <div className="m" style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>privo.cash/pay/{link.id} · {link.date}</div>
                </div>
                <span className="m">{link.amount} {link.token}</span>
                <NetworkBadge />
                <span className="m">{link.views}</span>
                <STag s={link.status} />
                <div className="row-actions">
                  <button className="btn bo" onClick={() => copy(link.id)}>{copied === link.id ? "Copied" : "Copy URL"}</button>
                  <button className="btn bs" onClick={() => router.push(`/pay/${link.id}`)}>Open</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
