"use client";

import { useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { NetworkBadge, ShieldSVG, STag } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { getPaymentLinks, getPrivatePayments, PaymentLink, PrivatePayment } from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

export default function DashboardPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { wallet, walletName, publicKey, openModal } = useWallet();
  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("...");
  const [links] = useState<PaymentLink[]>(() =>
    typeof window === "undefined" ? [] : getPaymentLinks()
  );
  const [payments] = useState<PrivatePayment[]>(() =>
    typeof window === "undefined" ? [] : getPrivatePayments()
  );

  const activity = useMemo(() => [...links, ...payments], [links, payments]);

  useEffect(() => {
    let cancelled = false;
    if (!publicKey) return;
    connection.getBalance(publicKey).then((lamports) => {
      if (!cancelled) setBalance((lamports / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 4 }));
    }).catch(() => {
      if (!cancelled) setBalance("Unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey]);

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
          <p className="lead">Your secure payment links and SOL payment activity are tied to your Solana wallet. No account or email needed.</p>
          <button className="btn bp full-mobile" onClick={openModal}>Connect Wallet</button>
        </div>
        <div className="split-right">
          <div className="feature-list" style={{ width: "100%", maxWidth: 520 }}>
            {[
              { i: "01", t: "Non-custodial", d: "We never hold your funds or keys." },
              { i: "02", t: "SOL payments", d: "Create links or send SOL privately from one interface." },
              { i: "03", t: "Cleaner requests", d: "Reduce wallet exposure when requesting and sending payments." },
            ].map((f) => (
              <div key={f.t} className="feature-row">
                <span className="m feature-index">{f.i}</span>
                <div><div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{f.t}</div><div style={{ fontSize: 13, color: C.dim }}>{f.d}</div></div>
              </div>
            ))}
          </div>
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

        <button className="snav on" onClick={() => router.push("/dashboard")} style={{ color: C.accent }}>Dashboard</button>
        <button className="snav" onClick={() => router.push("/links")} style={{ color: C.muted }}>Payment Links</button>
      </aside>

      <main className="dash-main">
        <div className="dash-head">
          <div>
            <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 10 }}>DASHBOARD</span>
            <h1 className="d dash-title">Private Solana Payments</h1>
          </div>
          <div className="head-actions">
            <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
            <button className="btn bs" onClick={() => router.push("/send")}>Pay Privately</button>
          </div>
        </div>

        <div className="stats-grid">
          {[
            ["Payment Links", String(links.length), "Created"],
            ["Funded Links", String(links.filter((link) => link.status === "funded").length), "Private deposits"],
            ["Private SOL Payments", String(payments.length), "Deposits created"],
            ["Wallet Balance", balance, "SOL"],
          ].map(([l, v, s]) => (
            <div key={l} className="card stat-card">
              <div className="lbl">{l}</div>
              <div className="d stat-value">{v}</div>
              <div className="m" style={{ fontSize: 11, color: C.dim, marginTop: 8 }}>{s}</div>
            </div>
          ))}
        </div>

        {activity.length === 0 ? (
          <div className="card empty-state">
            <ShieldSVG sz={34} />
            <h3 className="d">No activity yet</h3>
            <p>Create a secure payment link or send SOL privately to see activity here.</p>
            <div className="action-row dashboard-empty-actions" style={{ justifyContent: "center" }}>
              <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
              <button className="btn bs" onClick={() => router.push("/send")}>Pay Privately</button>
            </div>
          </div>
        ) : (
          <div className="card link-table">
            <div className="table-head">
              {["Activity", "Amount", "Network", "Views", "Status", "Actions"].map((h) => <span key={h} className="lbl">{h}</span>)}
            </div>
            {links.map((l) => (
              <div key={l.id} className="table-row">
                <div>
                  <div className="activity-type">Payment link</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{l.title}</div>
                  <div className="m" style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>privo.cash/pay/{l.id} · {l.date}</div>
                </div>
                <span className="m">{l.amount} {l.token}</span>
                <NetworkBadge />
                <span className="m">{l.views}</span>
                <STag s={l.status} />
                <div className="row-actions">
                  <button className="btn bo" onClick={() => copy(l.id)}>{copied === l.id ? "Copied" : "Copy"}</button>
                  <button className="btn bs" onClick={() => router.push(`/pay/${l.id}`)}>View</button>
                </div>
              </div>
            ))}
            {payments.map((payment) => (
              <div key={payment.id} className="table-row">
                <div>
                  <div className="activity-type">Private payment</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{payment.note || "Private SOL deposit"}</div>
                  <div className="m" style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>
                    {payment.recipient ? `for ${payment.recipient.slice(0, 8)}...${payment.recipient.slice(-6)}` : "claim secret generated"} · {payment.date}
                  </div>
                </div>
                <span className="m">{payment.amount} {payment.token}</span>
                <NetworkBadge />
                <span className="m">-</span>
                <STag s="paid" />
                <div className="row-actions">
                  <button className="btn bo" onClick={async () => {
                    await navigator.clipboard?.writeText(payment.depositSignature);
                    setCopied(payment.id);
                    setTimeout(() => setCopied(null), 1800);
                  }}>{copied === payment.id ? "Copied" : "Copy Sig"}</button>
                  <button className="btn bs" onClick={() => router.push("/claim")}>Claim</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
