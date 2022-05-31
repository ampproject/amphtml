const {ConsoleMessage} = require('puppeteer'); // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * @typedef {{
 *   url: string;
 *   name: string;
 *   viewport: {
 *     width: number,
 *     height: number,
 *   };
 *   loading_incomplete_selectors: string[];
 *   loading_complete_selectors: string[];
 *   loading_complete_delay_ms: number;
 *   enable_percy_javascript: boolean;
 *   interactive_tests: string;
 *   no_base_test: boolean;
 *   flaky: boolean;
 *   tests_: Record<string, Function>;
 * }}
 */
let WebpageDef;

/**
 * @typedef {{
 *   name: string;
 *   message: string;
 *   error: Error;
 *   consoleMessages: ConsoleMessage[];
 * }}
 */
let TestErrorDef;

/**
 * @typedef {{
 *   visible?: boolean,
 *   hidden?: boolean,
 * }}
 */
let VisibilityDef;

module.exports = {
  TestErrorDef,
  VisibilityDef,
  WebpageDef,
};
