export {};

declare global {
interface Window {
  // Never exists; used as part of post-compilation checks to verify DCE.
  __AMP_ASSERTION_CHECK: undefined;

  // Global error reporting handler; only present in AMP pages.
  __AMP_REPORT_ERROR?: (this:Window, Error, Element?) => void;

  // Global property set by test some harnesses to signal a testing environment.
  __AMP_TEST?: boolean;

  // Counter for the DomBaseWeakRef polyfill.
  __AMP_WEAKREF_ID?: number;

  // AMP Runtime settings, configuration, and environment/build constants.
  AMP_CONFIG?: AmpConfigDef;

  // AMP Mode, used to force an override in tests.
  __AMP_MODE: {esm: boolean};
}
}

