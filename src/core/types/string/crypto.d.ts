export {};

declare global {
interface Window {
  msCrypto?: Crypto;
}
}
