import Link from "next/link";
import { Logo, NetworkBadge } from "@/components/Atoms";
import { C } from "@/lib/constants";

const terms = [
  {
    title: "Using PrivoCash",
    body: "PrivoCash is a non-custodial interface for private Solana payment requests, private deposits, and claim-secret withdrawals. You are responsible for the wallet you connect, the addresses you use, and the secrets you share.",
  },
  {
    title: "Wallets and Transactions",
    body: "Transactions are signed in your Solana wallet. PrivoCash cannot recover lost wallet access, reverse confirmed transactions, or retrieve claim secrets after you leave the success screen.",
  },
  {
    title: "Claim Secrets",
    body: "A claim secret controls access to a private deposit. Treat it like sensitive payment information. Anyone with a valid claim secret may be able to claim the associated funds.",
  },
  {
    title: "Network Conditions",
    body: "Solana fees, confirmation times, RPC availability, and Privacy Cash proving services may vary. A failed private payment should stop the flow and should not trigger a public fallback transfer.",
  },
  {
    title: "Acceptable Use",
    body: "Use PrivoCash only where you are allowed to do so. Do not use the service to violate laws, sanctions, platform rules, or the rights of others.",
  },
  {
    title: "No Financial Advice",
    body: "PrivoCash is payment software, not financial, legal, tax, or investment advice. Review every transaction before approving it in your wallet.",
  },
];

export default function TermsPage() {
  return (
    <div className="split">
      <div className="split-left">
        <Logo sz={24} />
        <span className="lbl" style={{ color: C.accent, display: "block", marginTop: 40, marginBottom: 18 }}>TERMS</span>
        <h1 className="d page-title">Terms of<br /><em style={{ color: C.accent }}>Use.</em></h1>
        <p className="lead">
          These terms explain the basic responsibilities that apply when using PrivoCash for Private Solana payments.
        </p>
        <div className="action-row">
          <Link className="btn bp" href="/create">Create Link</Link>
          <Link className="btn bs" href="/docs">Read Docs</Link>
        </div>
      </div>

      <div className="split-right">
        <div className="form-shell">
          <div className="card form-card">
            <div style={{ display: "grid", gap: 22 }}>
              <NetworkBadge />
              {terms.map((item) => (
                <div key={item.title} className="receipt-row" style={{ alignItems: "flex-start" }}>
                  <span>{item.title}</span>
                  <span>{item.body}</span>
                </div>
              ))}
              <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
                Last updated: May 28, 2026. These terms may be updated as PrivoCash adds new product capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
