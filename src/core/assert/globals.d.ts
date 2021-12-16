export {};

declare global {
  interface Window {
    // Never exists; used as part of post-compilation checks to verify DCE.
    __AMP_ASSERTION_CHECK: undefined;

    // Global error reporting handler; only present in AMP pages.
    __AMP_REPORT_ERROR?: (this: Window, err: Error, opt_el?: Element) => void;
  }

  interface Error {
    // Allows error handlers to display errors with console-interactive values.
    messageArray?: any[];
  }
}
