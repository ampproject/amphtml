import './amp-globals.d';

declare global {
  interface Window {
    // Global property set by test some harnesses to signal karma testing environment.
    __karma__?: boolean;
  }
}
