import bs58 from "bs58";

const SECRET_BYTES = 32;

export function createPrivacySecret() {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Secure random generation is unavailable in this browser.");
  }
  const bytes = new Uint8Array(SECRET_BYTES);
  crypto.getRandomValues(bytes);
  return bs58.encode(bytes);
}

export function decodePrivacySecret(secret: string) {
  try {
    const bytes = bs58.decode(secret.trim());
    if (bytes.length !== SECRET_BYTES) return null;
    return bytes;
  } catch {
    return null;
  }
}
