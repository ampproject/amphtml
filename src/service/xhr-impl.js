/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Services} from '../services';
import {
  assertSuccess,
  getViewerInterceptResponse,
  setupAMPCors,
  setupInit,
  setupInput,
  setupJsonFetchInit,
} from '../utils/xhr-utils';
import {getCorsUrl, parseUrlDeprecated} from '../url';
import {getService, registerServiceBuilder} from '../service';
import {isFormDataWrapper} from '../form-data-wrapper';
import {user} from '../log';

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
      ? ampdocService.getAmpDoc()
      : null;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!Response>|!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    return getViewerInterceptResponse(
      this.win,
      this.ampdocSingle_,
      input,
      init
    ).then(interceptorResponse => {
      if (interceptorResponse) {
        return interceptorResponse;
      }
      // After this point, both the native `fetch` and the `fetch` polyfill
      // will expect a native `FormData` object in the `body` property, so
      // the native `FormData` object needs to be unwrapped.
      if (isFormDataWrapper(init.body)) {
        const formDataWrapper =
          /** @type {!FormDataWrapperInterface} */ (init.body);
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
    return this.fetch_(input, init).catch(
      reason => {
        const targetOrigin = parseUrlDeprecated(input).origin;
        throw user().createExpectedError(
          'XHR',
          `Failed fetching (${targetOrigin}/...):`,
          reason && reason.message
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
   * @param {boolean=} opt_allowFailure Allows non-2XX status codes to fulfill.
   * @return {!Promise<!Response>}
   */
  fetchJson(input, opt_init, opt_allowFailure) {
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
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   */
  fetch(input, opt_init) {
    const init = setupInit(opt_init);
    return this.fetchAmpCors_(input, init).then(response =>
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
    return this.fetchAmpCors_(input, opt_init).then(response =>
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
