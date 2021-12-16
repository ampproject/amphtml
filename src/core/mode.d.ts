export {};

declare global {
  interface AmpModeObject {
    esm: boolean;
  }

  interface Window {
    // AMP Mode, used to force an override in tests.
    __AMP_MODE: AmpModeObject;
  }
}
