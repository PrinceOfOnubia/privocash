import type { Metadata } from "next";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import Navbar from "@/components/Navbar";
import WalletModal from "@/components/WalletModal";
import UBg from "@/components/UBg";

export const metadata: Metadata = {
  title: "PrivoCash — Private Solana Payments",
  description:
    "Create private payment links or send SOL privately from one simple interface.",
  keywords: [
    "Solana payments",
    "private payment links",
    "Phantom wallet",
    "payment privacy",
  ],
  openGraph: {
    title: "PrivoCash",
    description:
      "Create private Solana payment links or send SOL privately from one simple interface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {/* Fixed background layers */}
          <UBg />
          <div className="noise" />

          {/* Nav + Modal */}
          <Navbar />
          <WalletModal />

          {/* Page content */}
          <main style={{ position: "relative", zIndex: 3 }}>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
