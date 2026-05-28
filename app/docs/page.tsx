import Link from "next/link";
import { NetworkBadge } from "@/components/Atoms";
import { C } from "@/lib/constants";

const sections = [
  {
    title: "Create Private Link",
    body: "Create a payment request with an amount, reference, and expiry. Share the generated link with a payer. The payer funds a private deposit and receives a claim secret after the deposit succeeds.",
  },
  {
    title: "Pay Privately",
    body: "Create a private SOL deposit directly from your connected Solana wallet. PrivoCash shows a claim secret after the private deposit is confirmed. Share that secret securely with the recipient.",
  },
  {
    title: "Claim",
    body: "Paste a claim secret, connect a Solana wallet, check the claimable balance, and claim the private deposit. Secrets are not stored in URLs.",
  },
  {
    title: "RPC Requirements",
    body: "Privacy Cash infrastructure currently expects a mainnet-beta Solana RPC with access to the configured program and address lookup table. Use a reliable provider such as Helius, and configure fallback RPC URLs for resilience.",
  },
];

export default function DocsPage() {
  return (
    <div className="split">
      <div className="split-left">
        <span className="lbl" style={{ color: C.accent, display: "block", marginBottom: 18 }}>DOCS</span>
        <h1 className="d page-title">Private Solana<br /><em style={{ color: C.accent }}>Payments.</em></h1>
        <p className="lead">
          PrivoCash provides private payment links, direct private deposits, and claim-secret withdrawals for Solana users.
        </p>
        <div className="action-row">
          <Link className="btn bp" href="/create">Create Link</Link>
          <Link className="btn bs" href="/claim">Claim</Link>
        </div>
      </div>

      <div className="split-right">
        <div className="form-shell">
          <div className="card form-card">
            <div style={{ display: "grid", gap: 22 }}>
              <NetworkBadge />
              {sections.map((section) => (
                <div key={section.title} className="receipt-row" style={{ alignItems: "flex-start" }}>
                  <span>{section.title}</span>
                  <span>{section.body}</span>
                </div>
              ))}
              <div className="receipt-row" style={{ alignItems: "flex-start" }}>
                <span>Privacy Limits</span>
                <span>Solana network activity remains public. PrivoCash is designed to reduce wallet exposure in payment flows without promising full anonymity.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
