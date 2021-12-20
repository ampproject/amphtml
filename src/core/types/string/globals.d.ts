import './amp-globals.d';

declare global {
  interface Window {
    msCrypto?: Crypto;
  }
}
