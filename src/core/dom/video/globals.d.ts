export {};

declare global {
  interface Window {
    // Used for storing whether or not the browser supports autoplay.
    __AMP_AUTOPLAY?: Promise<boolean>;
  }
}
