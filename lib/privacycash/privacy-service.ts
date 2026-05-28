import type { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createPrivacySecret, decodePrivacySecret } from "./secret";

const KEY_BASE_PATH = "/circuit2/transaction2";

type WalletLike = {
  publicKey: PublicKey | null;
  signTransaction?: <T extends VersionedTransaction>(transaction: T) => Promise<T>;
};

type PrivacyCashUtils = {
  deposit: (params: {
    lightWasm: unknown;
    storage: Storage;
    keyBasePath: string;
    publicKey: PublicKey;
    connection: Connection;
    amount_in_lamports: number;
    encryptionService: unknown;
    transactionSigner: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  }) => Promise<{ tx: string }>;
  withdraw: (params: {
    lightWasm: unknown;
    storage: Storage;
    keyBasePath: string;
    publicKey: PublicKey;
    connection: Connection;
    amount_in_lamports: number;
    encryptionService: unknown;
    recipient: PublicKey;
  }) => Promise<{
    tx: string;
    recipient: string;
    amount_in_lamports: number;
    fee_in_lamports: number;
    isPartial: boolean;
  }>;
  getUtxos: (params: {
    publicKey: PublicKey;
    connection: Connection;
    encryptionService: unknown;
    storage: Storage;
    abortSignal?: AbortSignal;
    offset?: number;
  }) => Promise<unknown[]>;
  getBalanceFromUtxos: (utxos: unknown[]) => { lamports: number };
};

type EncryptionModule = {
  EncryptionService: new () => {
    deriveEncryptionKeyFromSignature: (secretBytes: Uint8Array) => void;
  };
};

type PrivacyCashConstants = {
  ALT_ADDRESS: PublicKey;
  PROGRAM_ID: PublicKey;
};

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Private payments can only be prepared in the browser.");
  }
}

function assertLamports(amountLamports: number) {
  if (!Number.isFinite(amountLamports) || amountLamports <= 0) {
    throw new Error("Enter a valid SOL amount.");
  }
}

function mapPrivacyError(error: unknown) {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Private payment failed.";
  const msg = raw.toLowerCase();

  if (msg.includes("user rejected") || msg.includes("rejected")) {
    return "Transaction rejected in Phantom.";
  }
  if (msg.includes("403") || msg.includes("access forbidden") || msg.includes("forbidden")) {
    return "The Solana RPC endpoint rejected this request. Check the RPC API key or configure a working mainnet-beta fallback RPC.";
  }
  if (msg.includes("429") || msg.includes("rate limit")) {
    return "The Solana RPC endpoint is rate limited. Try again or configure a higher-capacity mainnet-beta RPC.";
  }
  if (msg.includes("insufficient") || msg.includes("0x1")) {
    return "Insufficient SOL balance for the private deposit and network fees.";
  }
  if (msg.includes("transaction2") || msg.includes("zkey") || msg.includes("wasm")) {
    return "Private proof assets could not be loaded. Please refresh and try again.";
  }
  if (msg.includes("alt not found") || msg.includes("address lookup")) {
    return "Privacy Cash infrastructure was not found on this RPC network. Use a mainnet-beta Solana RPC or set the matching Privacy Cash program and ALT addresses.";
  }
  if (msg.includes("proof") || msg.includes("snark") || msg.includes("witness")) {
    return "Private proof generation failed. No public transfer was sent.";
  }
  if (msg.includes("no private balance") || msg.includes("no utxo") || msg.includes("spent")) {
    return "This claim secret has no claimable private balance or was already claimed.";
  }
  if (msg.includes("invalid secret")) {
    return "Claim secret is invalid.";
  }

  return raw || "Private payment failed. No public transfer was sent.";
}

async function loadPrivacyCashUtils(): Promise<PrivacyCashUtils> {
  return (await import("../../vendor/privacycash-dist/exportUtils.js")) as PrivacyCashUtils;
}

async function loadPrivacyCashConstants(): Promise<PrivacyCashConstants> {
  return (await import("../../vendor/privacycash-dist/utils/constants.js")) as PrivacyCashConstants;
}

async function assertPrivacyInfrastructure(connection: Connection) {
  const { ALT_ADDRESS } = await loadPrivacyCashConstants();
  const alt = await connection.getAddressLookupTable(ALT_ADDRESS);
  if (!alt.value) {
    throw new Error(`ALT not found at address ${ALT_ADDRESS.toString()}`);
  }
}

async function getLightWasm() {
  const { WasmFactory } = await import("@lightprotocol/hasher.rs");
  return WasmFactory.getInstance();
}

export function encryptionServiceFromSecretBytes(secretBytes: Uint8Array) {
  return import("../../vendor/privacycash-dist/utils/encryption.js").then((mod) => {
    const { EncryptionService } = mod as EncryptionModule;
    const service = new EncryptionService();
    service.deriveEncryptionKeyFromSignature(secretBytes);
    return service;
  });
}

export { createPrivacySecret };

export async function depositPrivateSol({
  amountLamports,
  wallet,
  connection,
}: {
  amountLamports: number;
  wallet: WalletLike;
  connection: Connection;
}) {
  assertBrowser();
  assertLamports(amountLamports);
  if (!wallet.publicKey) throw new Error("Connect Phantom to continue.");
  if (!wallet.signTransaction) throw new Error("Phantom must support transaction signing.");

  try {
    const secret = createPrivacySecret();
    const secretBytes = decodePrivacySecret(secret);
    if (!secretBytes) throw new Error("Invalid secret");

    await assertPrivacyInfrastructure(connection);

    const [{ deposit }, lightWasm, encryptionService] = await Promise.all([
      loadPrivacyCashUtils(),
      getLightWasm(),
      encryptionServiceFromSecretBytes(secretBytes),
    ]);

    const result = await deposit({
      lightWasm,
      connection,
      amount_in_lamports: amountLamports,
      keyBasePath: KEY_BASE_PATH,
      publicKey: wallet.publicKey,
      transactionSigner: async (transaction) => wallet.signTransaction!(transaction),
      storage: window.localStorage,
      encryptionService,
    });

    return {
      secret,
      depositSignature: result.tx,
      amountLamports,
    };
  } catch (error) {
    throw new Error(mapPrivacyError(error));
  }
}

export async function getPrivateUtxos({
  secret,
  wallet,
  connection,
  abortSignal,
}: {
  secret: string;
  wallet: WalletLike;
  connection: Connection;
  abortSignal?: AbortSignal;
}) {
  assertBrowser();
  if (!wallet.publicKey) throw new Error("Connect Phantom to continue.");
  const secretBytes = decodePrivacySecret(secret);
  if (!secretBytes) throw new Error("Invalid secret");

  try {
    await assertPrivacyInfrastructure(connection);

    const [{ getUtxos, getBalanceFromUtxos }, encryptionService] = await Promise.all([
      loadPrivacyCashUtils(),
      encryptionServiceFromSecretBytes(secretBytes),
    ]);
    const utxos = await getUtxos({
      publicKey: wallet.publicKey,
      connection,
      encryptionService,
      storage: window.localStorage,
      abortSignal,
    });

    return {
      utxos,
      balanceLamports: getBalanceFromUtxos(utxos).lamports,
    };
  } catch (error) {
    throw new Error(mapPrivacyError(error));
  }
}

export async function claimPrivateSol({
  secret,
  wallet,
  connection,
}: {
  secret: string;
  wallet: WalletLike;
  connection: Connection;
}) {
  assertBrowser();
  if (!wallet.publicKey) throw new Error("Connect Phantom to continue.");
  const secretBytes = decodePrivacySecret(secret);
  if (!secretBytes) throw new Error("Invalid secret");

  try {
    await assertPrivacyInfrastructure(connection);

    const [{ withdraw, getUtxos, getBalanceFromUtxos }, lightWasm, encryptionService] =
      await Promise.all([
        loadPrivacyCashUtils(),
        getLightWasm(),
        encryptionServiceFromSecretBytes(secretBytes),
      ]);
    const utxos = await getUtxos({
      publicKey: wallet.publicKey,
      connection,
      encryptionService,
      storage: window.localStorage,
    });
    const balanceLamports = getBalanceFromUtxos(utxos).lamports;
    if (!balanceLamports || balanceLamports <= 0) {
      throw new Error("No private balance found for this claim secret.");
    }

    const result = await withdraw({
      lightWasm,
      connection,
      amount_in_lamports: balanceLamports,
      keyBasePath: KEY_BASE_PATH,
      publicKey: wallet.publicKey,
      recipient: wallet.publicKey,
      storage: window.localStorage,
      encryptionService,
    });

    return {
      withdrawSignature: result.tx,
      recipient: result.recipient,
      amountLamports: result.amount_in_lamports,
      feeLamports: result.fee_in_lamports,
      isPartial: result.isPartial,
    };
  } catch (error) {
    throw new Error(mapPrivacyError(error));
  }
}

export function lamportsToSol(lamports: number) {
  return (lamports / LAMPORTS_PER_SOL).toLocaleString(undefined, {
    maximumFractionDigits: 9,
  });
}
