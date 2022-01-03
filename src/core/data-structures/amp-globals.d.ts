export {};

declare global {
  interface Window {
    // Counter for the DomBaseWeakRef polyfill.
    __AMP_WEAKREF_ID?: number;
  }
}
