export {};

declare global {
  interface Window {
    // Global property set by test some harnesses to signal a testing environment.
    __AMP_TEST?: boolean;

    // Global property set by test some harnesses to signal karma testing environment.
    __karma__?: boolean;
  }
}
