function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { parseJson } from "../core/types/object/json";

import { Services } from "./";

import { isFormDataWrapper } from "../form-data-wrapper";
import { dev, user } from "../log";
import { getService, registerServiceBuilder } from "../service-helpers";
import { getCorsUrl as _getCorsUrl, parseUrlDeprecated } from "../url";
import {
assertSuccess,
getViewerInterceptResponse,
setupAMPCors,
setupInit,
setupInput,
setupJsonFetchInit } from "../utils/xhr-utils";


/**
 * A service that polyfills Fetch API for use within AMP.
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export var Xhr = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Xhr(win) {_classCallCheck(this, Xhr);
    /** @const {!Window} */
    this.win = win;

    var ampdocService = Services.ampdocServiceFor(win);

    // The isSingleDoc check is required because if in shadow mode, this will
    // throw a console error because the shellShadowDoc_ is not set when
    // fetching the amp doc. So either the test-bind-impl or test pre setup in
    // shadow mode tests needs to be fixed or there is a bug in ampdoc impl
    // getAmpDoc.
    // TODO(alabiaga): This should be investigated and fixed
    /** @private {?./ampdoc-impl.AmpDoc} */
    this.ampdocSingle_ = ampdocService.isSingleDoc() ?
    ampdocService.getSingleDoc() :
    null;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!Response>}
   * @private
   */_createClass(Xhr, [{ key: "fetch_", value:
    function fetch_(input, init) {var _arguments = arguments,_this = this;
      return getViewerInterceptResponse(
      this.win,
      this.ampdocSingle_,
      input,
      init).
      then(function (interceptorResponse) {
        if (interceptorResponse) {
          return interceptorResponse;
        }
        // After this point, both the native `fetch` and the `fetch` polyfill
        // will expect a native `FormData` object in the `body` property, so
        // the native `FormData` object needs to be unwrapped.
        if (isFormDataWrapper(init.body)) {
          var formDataWrapper = /** @type {!FormDataWrapperInterface} */(
          init.body);

          init.body = formDataWrapper.getFormData();
        }
        return _this.win.fetch.apply(null, _arguments);
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
     */ }, { key: "fetchAmpCors_", value:
    function fetchAmpCors_(input) {var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      input = setupInput(this.win, input, init);
      init = setupAMPCors(this.win, input, init);
      return this.fetch_(input, init).then(
      function (response) {return response;},
      function (reason) {
        var targetOrigin = parseUrlDeprecated(input).origin;
        throw user().createExpectedError(
        'XHR', "Failed fetching (".concat(
        targetOrigin, "/...):"),
        reason && /** @type {!Error} */(reason).message);

      });

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
     */ }, { key: "fetchJson", value:
    function fetchJson(input, opt_init) {
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
     */ }, { key: "fetchText", value:
    function fetchText(input, opt_init) {
      return this.fetch(input, setupInit(opt_init, 'text/plain'));
    }

    /**
     * A subsitute for the standard response.json(), which may optionally strip a prefix before calling JSON.parse().
     *
     * @param {!Response} res fetch response to convert to json.
     * @param {string|undefined} prefix to strip away.
     * @return {Promise<*>}
     */ }, { key: "xssiJson", value:
    function xssiJson(res, prefix) {
      if (!prefix) {
        return res.json();
      }

      return res.text().then(function (txt) {
        if (!txt.startsWith( /** @type {string} */(prefix))) {
          user().warn(
          'XHR', "Failed to strip missing prefix \"".concat(
          prefix, "\" in fetch response."));

          return parseJson(txt);
        }
        return parseJson(txt.slice(prefix.length));
      });
    }

    /**
     * @param {string} input URL
     * @param {?FetchInitDef=} opt_init Fetch options object.
     * @return {!Promise<!Response>}
     */ }, { key: "fetch", value:
    function fetch(input, opt_init) {
      var init = setupInit(opt_init);
      return this.fetchAmpCors_(input, init).then(function (response) {return (
          assertSuccess(response));});

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
     */ }, { key: "sendSignal", value:
    function sendSignal(input, opt_init) {
      return this.fetchAmpCors_(input, opt_init).then(function (response) {return (
          assertSuccess(response));});

    }

    /**
     * Add "__amp_source_origin" query parameter to the URL. Ideally, we'd be
     * able to set a header (e.g. AMP-Source-Origin), but this will force
     * preflight request on all CORS request.
     * @param {!Window} win
     * @param {string} url
     * @return {string}
     */ }, { key: "getCorsUrl", value:
    function getCorsUrl(win, url) {
      return _getCorsUrl(win, url);
    } }]);return Xhr;}();


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
// /Users/mszylkowski/src/amphtml/src/service/xhr-impl.js