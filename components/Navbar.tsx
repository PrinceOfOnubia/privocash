"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Atoms";
import { useWallet } from "@/lib/wallet-context";
import { useScrolled } from "@/lib/hooks";
import { C } from "@/lib/constants";

const NAV = [
  { href: "/create", label: "Create Link" },
  { href: "/send", label: "Pay Privately" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const path = usePathname();
  const scrolled = useScrolled();
  const { wallet, openModal, disconnect, connected } = useWallet();
  const [open, setOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        height: 68,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(6,6,10,.84)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all .35s ease",
      }}
    >
      <Link href="/">
        <Logo sz={34} />
      </Link>

      {/* Desktop Nav */}
      <div
        style={{
          display: "none",
        }}
        className="md:flex items-center gap-2"
      >
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nl ${path === href ? "on" : ""}`}
            style={{
              padding: "8px 16px",
              borderRadius: 9,
              background:
                path === href ? C.accentDim : "transparent",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop Wallet */}
      <div className="hidden md:flex items-center gap-3">
        {connected && wallet ? (
          <div style={{ position: "relative" }}>
            <button className="wallet-pill" onClick={() => setWalletOpen((v) => !v)}>
              <span className="pulse-dot" />
              <span className="m">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
            </button>
            {walletOpen && (
              <div className="wallet-menu">
                <div className="lbl">CONNECTED PHANTOM</div>
                <div className="m wallet-menu-address">{wallet.slice(0, 8)}...{wallet.slice(-6)}</div>
                <button
                  className="wallet-disconnect"
                  onClick={() => {
                    disconnect();
                    setWalletOpen(false);
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn bp bsm" onClick={openModal}>
            Connect Phantom
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? <X size={20} color={C.text} /> : <Menu size={20} color={C.text} />}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 0,
            right: 0,
            background: "#06060A",
            borderTop: `1px solid ${C.border}`,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
                className="nl"
                style={{ padding: "12px 0", fontSize: 16 }}
              >
                {label}
              </Link>
          ))}

          <div style={{ marginTop: 10 }}>
            {connected && wallet ? (
              <div style={{ display: "grid", gap: 10 }}>
                <span className="m" style={{ color: C.accent }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <button
                  className="btn bs bsm"
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn bp bsm"
                onClick={openModal}
              >
                Connect Phantom
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
