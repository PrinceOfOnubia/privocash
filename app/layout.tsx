import type { Metadata } from "next";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import Navbar from "@/components/Navbar";
import WalletModal from "@/components/WalletModal";
import UBg from "@/components/UBg";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://privocash.vercel.app"),
  title: "PrivoCash — Private Solana Payments",
  description: "Send SOL privately.",
  keywords: [
    "Solana payments",
    "private payment links",
    "Phantom wallet",
    "payment privacy",
  ],
  openGraph: {
    title: "PrivoCash",
    description: "Send SOL privately.",
    type: "website",
    images: [
      {
        url: "/og-image.png?v=5",
        width: 1200,
        height: 630,
        alt: "PrivoCash — Send SOL privately.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivoCash",
    description: "Send SOL privately.",
    images: ["/og-image.png?v=5"],
  },
  icons: {
    icon: [
      { url: "/privocash-icon.jpg", type: "image/jpeg" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
