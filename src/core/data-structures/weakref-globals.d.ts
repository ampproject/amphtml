export {};

declare global {
  interface Window {
    WeakRef?: typeof WeakRef;

    // Counter for the DomBaseWeakRef polyfill.
    __AMP_WEAKREF_ID?: number;
  }
}
