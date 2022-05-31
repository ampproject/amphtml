import {AmpA4A} from '../amp-a4a';

/** @type {string} @private */
export const TEST_URL =
  'http://iframe.localhost:' +
  location.port +
  '/test/fixtures/served/iframe.html?args';

export class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve(TEST_URL);
  }

  updateLayoutPriority() {
    // Do nothing.
  }

  getFallback() {
    return null;
  }

  toggleFallback() {
    // Do nothing.
  }

  mutateElement(callback) {
    callback();
  }

  /** @override */
  getPreconnectUrls() {
    return ['https://googleads.g.doubleclick.net'];
  }

  /** @override */
  getA4aAnalyticsConfig() {
    return {};
  }
}
