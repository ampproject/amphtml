interface Window {
  Image: typeof Image;
  XMLHttpRequest: typeof XMLHttpRequest;
  Date: typeof Date;

  /**
   * Never exists; used as part of post-compilation checks to verify DCE.
   */
  __AMP_ASSERTION_CHECK: undefined;

  /**
   * Global error reporting handler; only present in AMP pages.
   */
  __AMP_REPORT_ERROR:
    | undefined
    | ((this: Window, e: Error, element?: Element) => void);

  /**
   * Global property set by test some harnesses to signal a testing environment.
   */
  __AMP_TEST: undefined | boolean;

  /**
   * Counter for the DomBaseWeakRef polyfill.
   */
  __AMP_WEAKREF_ID: undefined | number;

  /**
   * AMP Runtime settings, configuration, and environment/build constants.
   */
  AMP_CONFIG: AmpConfigDef | undefined;

  msCrypto: typeof window.crypto | undefined;
}

// TODO: move these elsewhere
declare var IS_ESM: boolean;
declare var IS_MINIFIED: boolean;
declare var IS_FORTESTING: boolean;
