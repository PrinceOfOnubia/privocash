"use client";
import { useEffect, useState } from "react";
import { C, F, SOLANA_NETWORK, TOKENS, EXPIRY } from "@/lib/constants";

// ── Arrow ──────────────────────────────────────────────────────
export const Arr = ({ sz = 15 }: { sz?: number }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Spinner ────────────────────────────────────────────────────
export const Spin = () => (
  <div style={{ width:20, height:20, border:"2.5px solid rgba(255,255,255,.2)", borderTopColor:"#fff", borderRadius:"50%", animation:"sk .7s linear infinite", flexShrink:0 }}/>
);

// ── Shield SVG ─────────────────────────────────────────────────
export const ShieldSVG = ({ sz = 20, col = C.accent }: { sz?: number; col?: string }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
    <path d="M12 2L4 6v6c0 5.5 3.8 10.15 8 11.35C16.2 22.15 20 17.5 20 12V6L12 2Z"
      fill={col+"1a"} stroke={col} strokeWidth="1.5"/>
    <path d="M9 12l2 2 4-4" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Logo ───────────────────────────────────────────────────────
export const Logo = ({ onClick, sz = 26 }: { onClick?: () => void; sz?: number }) => (
  <div
    onClick={onClick}
    data-c
    aria-label="PrivoCash"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: sz * 0.26,
      cursor: "pointer",
      lineHeight: 1,
    }}
  >
    <span
      aria-hidden="true"
      style={{
        width: sz,
        height: sz,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #38d5ff 0%, #2563eb 82%)",
        boxShadow: `0 0 ${Math.max(10, sz * 0.55)}px rgba(37, 99, 235, 0.35)`,
        flexShrink: 0,
      }}
    >
      <svg width={sz * 0.52} height={sz * 0.52} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.3" r="5.1" fill={C.logoBg} />
        <path d="M8.7 11.5h6.6l2.15 8.4c.22.86-.43 1.7-1.32 1.7H7.87c-.89 0-1.54-.84-1.32-1.7l2.15-8.4Z" fill={C.logoBg} />
      </svg>
    </span>
    <span
      style={{
        color: "#fff",
        fontFamily: F.body,
        fontSize: sz * 0.78,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        whiteSpace: "nowrap",
      }}
    >
      Privo<span style={{ color: "#25b8ff" }}>Cash</span>
    </span>
  </div>
);

// ── Privacy Banner ─────────────────────────────────────────────
export const PBanner = ({ text }: { text: string }) => (
  <div className="pbn">
    <ShieldSVG sz={18}/>
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:4 }}>Privacy Protected</div>
      <div style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>{text}</div>
    </div>
  </div>
);

export const NetworkBadge = () => (
  <span className="chain tag" style={{ background: `${SOLANA_NETWORK.color}14`, borderColor: `${SOLANA_NETWORK.color}40`, color: SOLANA_NETWORK.color, border: "1px solid" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: SOLANA_NETWORK.color, display: "inline-block" }} />
    {SOLANA_NETWORK.label}
  </span>
);

// ── Status Tag ─────────────────────────────────────────────────
const tagMap: Record<string,string> = { active:"tok", created:"tok", funded:"tpa", paid:"tpa", claimed:"tpa", failed:"tex", expired:"tex" };
const labMap: Record<string,string> = { active:"Active", created:"Created", funded:"Funded", paid:"Paid", claimed:"Claimed", failed:"Failed", expired:"Expired" };
export const STag = ({ s }: { s: string }) => (
  <span className={`tag ${tagMap[s]||"tok"}`}>{labMap[s]||s}</span>
);

// ── Countdown ──────────────────────────────────────────────────
export const Countdown = ({ mins }: { mins: number }) => {
  const [secs, setSecs] = useState(mins * 60);
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const m = Math.floor(secs/60).toString().padStart(2,"0");
  const s = (secs%60).toString().padStart(2,"0");
  const pct = (secs / (mins*60)) * 100;
  const col = secs < 60 ? C.err : secs < 180 ? C.warn : C.accent;
  return (
    <div>
      <span className="m" style={{ fontSize:30, fontWeight:700, color:col }}>{m}:{s}</span>
      <div className="sb" style={{ marginTop:8 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:2, transition:"width 1s linear" }}/>
      </div>
    </div>
  );
};

// ── Token/Expiry Select Row ────────────────────────────────────
export const TokenSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="token-select" style={{ position:"relative", width:128 }}>
    <select className="inp sel" value={value} onChange={e=>onChange(e.target.value)} style={{ paddingRight:34 }}>
      {TOKENS.map(t => <option key={t}>{t}</option>)}
    </select>
    <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.muted, fontSize:11 }}>▾</span>
  </div>
);

export const ExpiryPills = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
    {EXPIRY.map(o => (
      <button key={o.v} onClick={()=>onChange(o.v)}
        style={{ padding:"13px 8px", borderRadius:11, cursor:"pointer", border:`1px solid ${value===o.v ? C.accent+"80" : C.border}`, background: value===o.v ? C.accentDim : "rgba(255,255,255,.03)", color: value===o.v ? C.accent : C.muted, fontFamily:F.mono, fontSize:12, fontWeight:700, transition:"all .15s" }}>
        {o.l}
      </button>
    ))}
  </div>
);
