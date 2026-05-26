import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PrivoCash — Send SOL privately.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#050615",
          color: "white",
          position: "relative",
          overflow: "hidden",
          padding: "0 92px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 24% 26%, rgba(27,183,255,.36), transparent 36%), radial-gradient(circle at 84% 82%, rgba(37,99,235,.34), transparent 42%)" }} />
        <div style={{ position: "absolute", left: 70, right: 70, top: 82, height: 2, background: "linear-gradient(90deg, transparent, rgba(56,189,248,.28), transparent)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 54 }}>
          <div style={{ width: 176, height: 176, borderRadius: 88, background: "linear-gradient(135deg, #42D9FF 0%, #0F5BFF 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 80px rgba(37,99,235,.42)" }}>
            <div style={{ width: 68, height: 68, borderRadius: 34, background: "#050615", position: "absolute", transform: "translateY(-30px)" }} />
            <div style={{ width: 78, height: 92, background: "#050615", clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)", borderRadius: 12, transform: "translateY(34px)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
              <span>Privo</span>
              <span style={{ color: "#1597FF" }}>Cash</span>
            </div>
            <div style={{ marginTop: 28, fontSize: 44, fontWeight: 700, color: "#EEF6FF" }}>Send SOL privately.</div>
            <div style={{ marginTop: 18, fontSize: 27, color: "#8CA4C8" }}>Private Solana payments from one simple interface.</div>
            <div style={{ marginTop: 38, display: "flex", alignItems: "center", gap: 12, width: 218, height: 48, borderRadius: 24, border: "1px solid rgba(59,130,246,.45)", background: "rgba(37,99,235,.20)", padding: "0 22px", color: "#BBD7FF", fontSize: 19, fontWeight: 700 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: "#14F195" }} />
              Solana payments
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
