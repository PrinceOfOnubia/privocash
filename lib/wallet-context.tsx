"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
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
    connected: adapter.connected,
    openModal: () => setVisible(true),
    closeModal: () => setVisible(false),
  };
}
