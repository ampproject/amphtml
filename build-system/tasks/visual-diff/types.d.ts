import type puppeteer from 'puppeteer';

/**
 * @typedef {{
 */
export type WebpageDef = {
  url: string;
  name: string;
  viewport: puppeteer.Viewport;
  loading_incomplete_selectors: string[];
  loading_complete_selectors: string[];
  loading_complete_delay_ms: number;
  enable_percy_javascript: boolean;
  interactive_tests: string;
  no_base_test: boolean;
  flaky: boolean;
  tests_: Record<string, Function>;
};

export type TestErrorDef = {
  name: string;
  message: string;
  error: Error;
  consoleMessages: puppeteer.ConsoleMessage[];
};

export type VisibilityDef = {
  visible?: boolean;
  hidden?: boolean;
};
