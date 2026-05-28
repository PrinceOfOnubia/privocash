"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Arr, Logo, NetworkBadge, PBanner, ShieldSVG } from "@/components/Atoms";
import { C } from "@/lib/constants";
import { useWallet } from "@/lib/wallet-context";

export default function Home() {
  const router = useRouter();
  const { connected, openModal } = useWallet();
  const nav = (to: string) => (connected ? router.push(to) : openModal());

  return (
    <div className="home-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="lbl" style={{ color: C.accent }}>PRIVATE SOLANA PAYMENTS</span>
            <NetworkBadge />
          </div>
          <h1 className="d hero-title">
            Private Solana
            <br />
            <em>Payments.</em>
          </h1>
          <p className="hero-lead">
            Create secure payment links or send SOL privately while reducing wallet exposure.
          </p>
          <div className="hero-actions">
            <button className="btn bp" onClick={() => nav("/create")}><ShieldSVG sz={17} col="#fff" /> Create Private Link <Arr /></button>
            <button className="btn bs" onClick={() => nav("/send")}>Pay Privately</button>
          </div>
        </div>

        <div className="hero-panel card">
          <div className="panel-top">
            <Logo sz={22} />
            <span className="m" style={{ color: C.ok, fontSize: 12 }}>Active</span>
          </div>
          <div className="payment-link-preview">
            <span className="lbl">PAYMENT REQUEST</span>
            <div className="d preview-amount">0.5 <span>SOL</span></div>
            <div className="copy-box" style={{ margin: 0 }}>
              <span className="m copy-value">privo.cash/pay/...</span>
              <span className="btn bo bsm">Copy</span>
            </div>
          </div>
          <PBanner text="Secure payment links and private SOL deposits in one simple Phantom flow." />
        </div>
      </section>

      <section className="section-band">
        <div className="section-head">
          <span className="lbl" style={{ color: C.accent }}>HOW IT WORKS</span>
          <h2 className="d section-title">Two private Solana payment flows.</h2>
        </div>
        <div className="steps-grid">
          {[
            ["01", "Connect Solana wallet", "Phantom is the primary wallet flow for PrivoCash."],
            ["02", "Create secure links", "The recipient creates a request link, shares it, and the payer opens the link to pay."],
            ["03", "Pay privately", "The sender creates a private deposit and shares the claim secret securely."],
          ].map(([n, t, d]) => (
            <div key={n} className="step-card">
              <span className="m feature-index">{n}</span>
              <h3 className="d">{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band two-col">
        <div>
          <span className="lbl" style={{ color: C.accent }}>WHY PRIVOCASH</span>
          <h2 className="d section-title">Payment privacy without the extra complexity.</h2>
          <p className="body-copy">
            PrivoCash gives Solana users a cleaner way to request and send payments. Create a secure link, share it, or start a private deposit from Phantom in a simple private-payment flow.
          </p>
        </div>
        <div className="card form-card">
          {[
            ["Secure payment links", "Create a Solana payment request in seconds and share it anywhere."],
            ["Pay privately", "Send SOL directly through a cleaner payment flow designed to reduce wallet exposure."],
            ["Built for real users", "No account setup, no confusing dashboards, just connect Phantom and move."],
          ].map(([k, v]) => (
            <div key={k} className="receipt-row">
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <h2 className="d hero-title">Start with<br /><em>Private SOL.</em></h2>
        <p className="hero-lead">Create a payment link or send directly after connecting Phantom.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <button className="btn bp" onClick={() => nav("/create")}><ShieldSVG sz={18} col="#fff" /> Create Link</button>
          <button className="btn bs" onClick={() => nav("/send")}>Pay Privately</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-main">
          <Logo sz={32} />
          <div className="footer-links">
            <Link href="/create" className="nl">Create Link</Link>
            <Link href="/send" className="nl">Pay Privately</Link>
            <Link href="/claim" className="nl">Claim</Link>
            <Link href="/dashboard" className="nl">Dashboard</Link>
            <a href="mailto:hello@privo.cash" className="nl">Contact</a>
          </div>
        </div>
        <hr className="dv" />
        <div className="footer-bottom">
          <span className="m lbl">©{new Date().getFullYear()} PRIVOCASH — PRIVATE SOLANA PAYMENTS</span>
          <span className="m lbl">NOT CUSTODY · SOLANA PAYMENTS</span>
        </div>
      </footer>
    </div>
  );
}
