"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

const FALLBACK_RPC_URLS = [
  ...(process.env.NEXT_PUBLIC_SOLANA_FALLBACK_RPC_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  clusterApiUrl("mainnet-beta"),
];

const RPC_ENDPOINTS = Array.from(new Set([SOLANA_RPC_URL, ...FALLBACK_RPC_URLS]));

async function getWorkingEndpoint(endpoints: string[]) {
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, "confirmed");
      await connection.getLatestBlockhash();
      return endpoint;
    } catch {
      continue;
    }
  }

  return clusterApiUrl("mainnet-beta");
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  const [endpoint, setEndpoint] = useState(SOLANA_RPC_URL);

  useEffect(() => {
    let cancelled = false;
    getWorkingEndpoint(RPC_ENDPOINTS).then((workingEndpoint) => {
      if (!cancelled) setEndpoint(workingEndpoint);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useWallet() {
  const adapter = useAdapterWallet();
  const { setVisible } = useWalletModal();
  const wallet = adapter.publicKey?.toBase58() ?? null;

  return {
    ...adapter,
    wallet,
    walletName: adapter.wallet?.adapter.name ?? null,
    connected: adapter.connected,
    openModal: () => setVisible(true),
    closeModal: () => setVisible(false),
  };
}
