import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {dev, user} from '#utils/log';
import {
  assertSuccess,
  getViewerInterceptResponse,
  setupAMPCors,
  setupInit,
  setupInput,
  setupJsonFetchInit,
} from '#utils/xhr-utils';

import {isFormDataWrapper} from '../form-data-wrapper';
import {getService, registerServiceBuilder} from '../service-helpers';
import {getCorsUrl, parseUrlDeprecated} from '../url';

/**
 * A service that polyfills Fetch API for use within AMP.
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class Xhr {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    const ampdocService = Services.ampdocServiceFor(win);

    // The isSingleDoc check is required because if in shadow mode, this will
    // throw a console error because the shellShadowDoc_ is not set when
    // fetching the amp doc. So either the test-bind-impl or test pre setup in
    // shadow mode tests needs to be fixed or there is a bug in ampdoc impl
    // getAmpDoc.
    // TODO(alabiaga): This should be investigated and fixed
    /** @private {?./ampdoc-impl.AmpDoc} */
    this.ampdocSingle_ = ampdocService.isSingleDoc()
      ? ampdocService.getSingleDoc()
      : null;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    return getViewerInterceptResponse(
      this.win,
      this.ampdocSingle_,
      input,
      init
    ).then((interceptorResponse) => {
      if (interceptorResponse) {
        return interceptorResponse;
      }
      // After this point, both the native `fetch` and the `fetch` polyfill
      // will expect a native `FormData` object in the `body` property, so
      // the native `FormData` object needs to be unwrapped.
      if (isFormDataWrapper(init.body)) {
        const formDataWrapper = /** @type {!FormDataWrapperInterface} */ (
          init.body
        );
        init.body = formDataWrapper.getFormData();
      }
      return this.win.fetch.apply(null, arguments);
    });
  }

  /**
   * Performs the final initialization and requests the fetch. It does two
   * main things:
   * - It adds "__amp_source_origin" URL parameter with source origin
   * USE WITH CAUTION: setting ampCors to false disables AMP source origin check
   * but allows for caching resources cross pages.
   *
   * @param {string} input
   * @param {!FetchInitDef=} init
   * @return {!Promise<!Response>}
   * @private
   */
  fetchAmpCors_(input, init = {}) {
    input = setupInput(this.win, input, init);
    init = setupAMPCors(this.win, input, init);
    return this.fetch_(input, init).then(
      (response) => response,
      (reason) => {
        const targetOrigin = parseUrlDeprecated(input).origin;
        throw user().createExpectedError(
          'XHR',
          `Failed fetching (${targetOrigin}/...):`,
          reason && /** @type {!Error} */ (reason).message
        );
      }
    );
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
    return this.fetch(input, setupJsonFetchInit(opt_init));
  }

  /**
   * Fetches a text response. Note this returns the response object, not the
   * response's text. #fetchText merely sets up the request to accept text.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {?FetchInitDef=} opt_init
   * @return {!Promise<!Response>}
   */
  fetchText(input, opt_init) {
    return this.fetch(input, setupInit(opt_init, 'text/plain'));
  }

  /**
   * A subsitute for the standard response.json(), which may optionally strip a prefix before calling JSON.parse().
   *
   * @param {!Response} res fetch response to convert to json.
   * @param {string|undefined} prefix to strip away.
   * @return {Promise<*>}
   */
  xssiJson(res, prefix) {
    if (!prefix) {
      return res.json();
    }

    return res.text().then((txt) => {
      if (!txt.startsWith(dev().assertString(prefix))) {
        user().warn(
          'XHR',
          `Failed to strip missing prefix "${prefix}" in fetch response.`
        );
        return parseJson(txt);
      }
      return parseJson(txt.slice(prefix.length));
    });
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   */
  fetch(input, opt_init) {
    const init = setupInit(opt_init);
    return this.fetchAmpCors_(input, init).then((response) =>
      assertSuccess(response)
    );
  }

  /**
   * Sends the request, awaits result and confirms that it was successful.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
   *
   * See `fetchAmpCors_` for more detail.
   *
   * @param {string} input
   * @param {!FetchInitDef=} opt_init
   * @return {!Promise}
   */
  sendSignal(input, opt_init) {
    return this.fetchAmpCors_(input, opt_init).then((response) =>
      assertSuccess(response)
    );
  }

  /**
   * Add "__amp_source_origin" query parameter to the URL. Ideally, we'd be
   * able to set a header (e.g. AMP-Source-Origin), but this will force
   * preflight request on all CORS request.
   * @param {!Window} win
   * @param {string} url
   * @return {string}
   */
  getCorsUrl(win, url) {
    return getCorsUrl(win, url);
  }
}

/**
 * @param {!Window} window
 * @return {!Xhr}
 */
export function xhrServiceForTesting(window) {
  installXhrService(window);
  return getService(window, 'xhr');
}

/**
 * @param {!Window} window
 */
export function installXhrService(window) {
  registerServiceBuilder(window, 'xhr', Xhr);
}
