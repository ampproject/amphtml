export {};

declare global {
  interface Window {
    // Global property set by test some harnesses to signal a testing environment.
    __AMP_TEST?: boolean;

    // AMP Mode, used to force an override in tests.
    __AMP_MODE: AmpModeObject;

    // AMP Runtime settings, configuration, and environment/build constants.
    AMP_CONFIG?: AmpConfig & {[key: string]: boolean | string};
  }

  interface Document {
    AMP?: {
      canonicalUrl?: string;
    };
  }

  interface AmpConfig {
    test?: boolean;
    localDev?: boolean;
    canary?: boolean;
    type?: string;
  }

  interface AmpModeObject {
    esm: boolean;
    noCssBinary: boolean;
  }
}
