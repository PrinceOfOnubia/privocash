"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { NetworkBadge, ShieldSVG, STag } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { getPaymentLinks, getPrivatePayments, PaymentLink, PrivatePayment } from "@/lib/payment-service";
import { useWallet } from "@/lib/wallet-context";

type Tab = "activity" | "links";

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, openModal } = useWallet();
  const [tab, setTab] = useState<Tab>("activity");
  const [copied, setCopied] = useState<string | null>(null);
  const [links] = useState<PaymentLink[]>(() =>
    typeof window === "undefined" ? [] : getPaymentLinks()
  );
  const [payments] = useState<PrivatePayment[]>(() =>
    typeof window === "undefined" ? [] : getPrivatePayments()
  );

  const activity = useMemo(() => [...links, ...payments], [links, payments]);

  const copy = async (id: string) => {
    await navigator.clipboard?.writeText(`privo.cash/pay/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  if (!wallet) {
    return (
      <div className="split">
        <div className="split-left">
          <ShieldSVG sz={52} />
          <h2 className="d page-title" style={{ marginTop: 28 }}>Connect your<br /><em style={{ color: C.accent }}>Solana Wallet.</em></h2>
          <p className="lead">Your private payment links and payment activity are tied to your Solana wallet. No account or email needed.</p>
          <button className="btn bp full-mobile" onClick={openModal}>Connect Phantom</button>
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
          <div className="lbl" style={{ marginBottom: 6 }}>CONNECTED PHANTOM</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="pulse-dot" />
            <span className="m" style={{ fontSize: 12, color: C.accent }}>{wallet.slice(0, 8)}...{wallet.slice(-4)}</span>
          </div>
        </div>

        {(["activity", "links"] as const).map((id) => (
          <button key={id} className={`snav ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} style={{ color: tab === id ? C.accent : C.muted }}>
            {id === "activity" ? "Activity" : "Payment Links"}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div className="dash-actions">
          <button className="btn bp dash-action-btn" onClick={() => router.push("/create")}>Create Link</button>
          <button className="btn bs dash-action-btn" onClick={() => router.push("/send")}>Pay Privately</button>
        </div>
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
            ["Active Links", String(links.filter((link) => link.status === "active").length), "Ready to pay"],
            ["Private Payments", String(payments.length), "Direct sends"],
            ["Network", "Solana", "SOL only"],
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
            <p>Create a private payment link or send SOL privately to see activity here.</p>
            <div className="action-row" style={{ justifyContent: "center" }}>
              <button className="btn bp" onClick={() => router.push("/create")}>Create Link</button>
              <button className="btn bs" onClick={() => router.push("/send")}>Pay Privately</button>
            </div>
          </div>
        ) : (
          <div className="card link-table">
            <div className="table-head">
              {["Activity", "Amount", "Network", "Views", "Status", "Actions"].map((h) => <span key={h} className="lbl">{h}</span>)}
            </div>
            {(tab === "links" ? links : links).map((l) => (
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
            {tab === "activity" && payments.map((payment) => (
              <div key={payment.id} className="table-row">
                <div>
                  <div className="activity-type">Private payment</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{payment.note || "Direct SOL payment"}</div>
                  <div className="m" style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>to {payment.recipient.slice(0, 8)}...{payment.recipient.slice(-6)} · {payment.date}</div>
                </div>
                <span className="m">{payment.amount} {payment.token}</span>
                <NetworkBadge />
                <span className="m">-</span>
                <STag s="paid" />
                <div className="row-actions">
                  <button className="btn bo" onClick={async () => {
                    await navigator.clipboard?.writeText(payment.txSignature);
                    setCopied(payment.id);
                    setTimeout(() => setCopied(null), 1800);
                  }}>{copied === payment.id ? "Copied" : "Copy Sig"}</button>
                  <button className="btn bs" onClick={() => router.push("/send")}>Repeat</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
