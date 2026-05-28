import Link from "next/link";
import { Logo, NetworkBadge } from "@/components/Atoms";
import { C } from "@/lib/constants";

const privacy = [
  {
    title: "Wallet Connection",
    body: "When you connect a Solana wallet, PrivoCash reads your public wallet address and balance so the interface can show account state and prepare transactions.",
  },
  {
    title: "Payment Links",
    body: "Payment link records are stored in the browser for the MVP experience. Link metadata can include amount, label, status, timestamps, and transaction signatures.",
  },
  {
    title: "Claim Secrets",
    body: "Claim secrets are shown only after a private deposit succeeds. They are not placed in payment URLs. You should save and share them securely.",
  },
  {
    title: "Transactions",
    body: "Solana transactions remain public on-chain. PrivoCash focuses on reducing wallet exposure in the payment flow without promising full anonymity.",
  },
  {
    title: "RPC Providers",
    body: "The app connects to Solana RPC endpoints to read balances, prepare private payments, and confirm transactions. RPC providers may receive standard network request information.",
  },
  {
    title: "Local Browser Data",
    body: "You can clear browser storage to remove local PrivoCash records from the current device. Clearing storage may remove link history and claim handoff information.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="split">
      <div className="split-left">
        <Logo sz={24} />
        <span className="lbl" style={{ color: C.accent, display: "block", marginTop: 40, marginBottom: 18 }}>PRIVACY</span>
        <h1 className="d page-title">Privacy<br /><em style={{ color: C.accent }}>Policy.</em></h1>
        <p className="lead">
          PrivoCash keeps the payment experience simple and privacy-focused while making the limits of Solana payments clear.
        </p>
        <div className="action-row">
          <Link className="btn bp" href="/send">Pay Privately</Link>
          <Link className="btn bs" href="/docs">Read Docs</Link>
        </div>
      </div>

      <div className="split-right">
        <div className="form-shell">
          <div className="card form-card">
            <div style={{ display: "grid", gap: 22 }}>
              <NetworkBadge />
              {privacy.map((item) => (
                <div key={item.title} className="receipt-row" style={{ alignItems: "flex-start" }}>
                  <span>{item.title}</span>
                  <span>{item.body}</span>
                </div>
              ))}
              <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
                Last updated: May 28, 2026. This policy may be updated as PrivoCash adds new product capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
