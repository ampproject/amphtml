import mustache from '#third_party/mustache/mustache';

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @visibleForTesting
 */
export class AmpMustache {
  constructor() {
    const event = new CustomEvent('templateServiceLoaded', {mustache});
    window.dispatchEvent(event);
    window.BENTO = window.BENTO || [];
    window.BENTO['templateServiceLoaded'] = true;
  }

  static getService() {
    return Promise.resolve(mustache);
  }
}

new AmpMustache(); // need to fire the custom event
