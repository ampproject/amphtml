export {};

declare global {
  interface Window {
    msCrypto?: Crypto;
  }

  interface Location {
    // Set by a viewer when it removes the fragment.
    originalHash?: string;
  }
}
