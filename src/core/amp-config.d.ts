export {};

declare global {
  // AMP configuration and runtime settings structure.
  interface AmpConfig {
    test?: boolean;
    localDev?: boolean;
    canary?: boolean;
    type?: string;
  }

  interface Window {
    // AMP Runtime settings, configuration, and environment/build constants.
    AMP_CONFIG?: AmpConfig & {[key: string]: (boolean|string)};
  }
}
