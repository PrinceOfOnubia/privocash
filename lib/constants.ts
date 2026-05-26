export const C = {
  bg: "#06060A",
  logoBg: "#020416",
  surface: "rgba(255,255,255,0.032)",
  surfaceHov: "rgba(255,255,255,0.062)",
  border: "rgba(255,255,255,0.075)",
  borderHov: "rgba(255,255,255,0.18)",
  text: "#EEEDF4",
  muted: "rgba(238,237,244,0.48)",
  dim: "rgba(238,237,244,0.24)",
  faint: "rgba(238,237,244,0.08)",
  accent: "#2563EB",
  accentHi: "#3B7BFF",
  accentDim: "rgba(37,99,235,0.13)",
  accentBrd: "rgba(37,99,235,0.32)",
  ok: "#10B981",
  err: "#EF4444",
  warn: "#F59E0B",
} as const;

export const F = {
  display: "'Syne', sans-serif",
  body: "'Instrument Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const SOLANA_NETWORK = {
  id: "solana",
  short: "SOL",
  label: "Solana",
  color: "#14F195",
} as const;

export const TOKENS = ["SOL"] as const;

export const EXPIRY = [
  { v: "10m", l: "10 min" },
  { v: "15m", l: "15 min" },
  { v: "30m", l: "30 min" },
  { v: "1h", l: "1 hour" },
] as const;

export const UNICORN_PROJECT = "q74MturjEeRrERoc3hmn";
