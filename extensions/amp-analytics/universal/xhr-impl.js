import {setupJsonFetchInit} from '../../../src/utils/xhr-utils';

export default new (class {
  /**
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   */
  fetch(input, opt_init) {
    return fetch(input, opt_init);
  }

  /**
   * Fetches a JSON response. Note this returns the response object, not the
   * response's JSON. #fetchJson merely sets up the request to accept JSON.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!Response>}
   */
  fetchJson(input, opt_init) {
    return fetch(input, setupJsonFetchInit(opt_init));
  }

  /** */
  xssiJson() {
    throw new Error('Not implemented');
  }

  /** */
  fetchText() {
    throw new Error('Not implemented');
  }

  /** */
  sendSignal() {
    throw new Error('Not implemented');
  }

  /** */
  getCorsUrl() {
    throw new Error('Not implemented');
  }
})();
