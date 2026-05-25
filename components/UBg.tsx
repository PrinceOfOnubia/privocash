"use client";
import { useEffect } from "react";
import { UNICORN_PROJECT } from "@/lib/constants";

declare global {
  interface Window {
    UnicornStudio?: { init: () => void };
    __ul?: boolean;
  }
}

export default function UBg() {
  useEffect(() => {
    if (window.__ul) { try { window.UnicornStudio?.init(); } catch { /* no-op */ } return; }
    window.__ul = true;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";
    s.onload = () => { try { window.UnicornStudio?.init(); } catch { /* no-op */ } };
    document.head.appendChild(s);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <div data-us-project={UNICORN_PROJECT} style={{ width:"100vw", height:"100vh" }}/>
    </div>
  );
}
