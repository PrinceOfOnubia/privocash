declare module "../../vendor/privacycash-dist/exportUtils.js" {
  export const deposit: unknown;
  export const withdraw: unknown;
  export const getUtxos: unknown;
  export const getBalanceFromUtxos: unknown;
}

declare module "../../vendor/privacycash-dist/utils/encryption.js" {
  export class EncryptionService {
    deriveEncryptionKeyFromSignature(secretBytes: Uint8Array): void;
  }
}
