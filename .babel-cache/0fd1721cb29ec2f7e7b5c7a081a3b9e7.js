function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { parseJson } from "../core/types/object/json";
import { Services } from "./";
import { isFormDataWrapper } from "../form-data-wrapper";
import { dev, user } from "../log";
import { getService, registerServiceBuilder } from "../service-helpers";
import { getCorsUrl as _getCorsUrl, parseUrlDeprecated } from "../url";
import { assertSuccess, getViewerInterceptResponse, setupAMPCors, setupInit, setupInput, setupJsonFetchInit } from "../utils/xhr-utils";

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
  function Xhr(win) {
    _classCallCheck(this, Xhr);

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
    this.ampdocSingle_ = ampdocService.isSingleDoc() ? ampdocService.getSingleDoc() : null;
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
  _createClass(Xhr, [{
    key: "fetch_",
    value: function fetch_(input, init) {
      var _arguments = arguments,
          _this = this;

      return getViewerInterceptResponse(this.win, this.ampdocSingle_, input, init).then(function (interceptorResponse) {
        if (interceptorResponse) {
          return interceptorResponse;
        }

        // After this point, both the native `fetch` and the `fetch` polyfill
        // will expect a native `FormData` object in the `body` property, so
        // the native `FormData` object needs to be unwrapped.
        if (isFormDataWrapper(init.body)) {
          var formDataWrapper =
          /** @type {!FormDataWrapperInterface} */
          init.body;
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
     */

  }, {
    key: "fetchAmpCors_",
    value: function fetchAmpCors_(input, init) {
      if (init === void 0) {
        init = {};
      }

      input = setupInput(this.win, input, init);
      init = setupAMPCors(this.win, input, init);
      return this.fetch_(input, init).then(function (response) {
        return response;
      }, function (reason) {
        var targetOrigin = parseUrlDeprecated(input).origin;
        throw user().createExpectedError('XHR', "Failed fetching (" + targetOrigin + "/...):", reason &&
        /** @type {!Error} */
        reason.message);
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
     */

  }, {
    key: "fetchJson",
    value: function fetchJson(input, opt_init) {
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

  }, {
    key: "fetchText",
    value: function fetchText(input, opt_init) {
      return this.fetch(input, setupInit(opt_init, 'text/plain'));
    }
    /**
     * A subsitute for the standard response.json(), which may optionally strip a prefix before calling JSON.parse().
     *
     * @param {!Response} res fetch response to convert to json.
     * @param {string|undefined} prefix to strip away.
     * @return {Promise<*>}
     */

  }, {
    key: "xssiJson",
    value: function xssiJson(res, prefix) {
      if (!prefix) {
        return res.json();
      }

      return res.text().then(function (txt) {
        if (!txt.startsWith(dev().assertString(prefix))) {
          user().warn('XHR', "Failed to strip missing prefix \"" + prefix + "\" in fetch response.");
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

  }, {
    key: "fetch",
    value: function fetch(input, opt_init) {
      var init = setupInit(opt_init);
      return this.fetchAmpCors_(input, init).then(function (response) {
        return assertSuccess(response);
      });
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

  }, {
    key: "sendSignal",
    value: function sendSignal(input, opt_init) {
      return this.fetchAmpCors_(input, opt_init).then(function (response) {
        return assertSuccess(response);
      });
    }
    /**
     * Add "__amp_source_origin" query parameter to the URL. Ideally, we'd be
     * able to set a header (e.g. AMP-Source-Origin), but this will force
     * preflight request on all CORS request.
     * @param {!Window} win
     * @param {string} url
     * @return {string}
     */

  }, {
    key: "getCorsUrl",
    value: function getCorsUrl(win, url) {
      return _getCorsUrl(win, url);
    }
  }]);

  return Xhr;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInhoci1pbXBsLmpzIl0sIm5hbWVzIjpbInBhcnNlSnNvbiIsIlNlcnZpY2VzIiwiaXNGb3JtRGF0YVdyYXBwZXIiLCJkZXYiLCJ1c2VyIiwiZ2V0U2VydmljZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJnZXRDb3JzVXJsIiwicGFyc2VVcmxEZXByZWNhdGVkIiwiYXNzZXJ0U3VjY2VzcyIsImdldFZpZXdlckludGVyY2VwdFJlc3BvbnNlIiwic2V0dXBBTVBDb3JzIiwic2V0dXBJbml0Iiwic2V0dXBJbnB1dCIsInNldHVwSnNvbkZldGNoSW5pdCIsIlhociIsIndpbiIsImFtcGRvY1NlcnZpY2UiLCJhbXBkb2NTZXJ2aWNlRm9yIiwiYW1wZG9jU2luZ2xlXyIsImlzU2luZ2xlRG9jIiwiZ2V0U2luZ2xlRG9jIiwiaW5wdXQiLCJpbml0IiwidGhlbiIsImludGVyY2VwdG9yUmVzcG9uc2UiLCJib2R5IiwiZm9ybURhdGFXcmFwcGVyIiwiZ2V0Rm9ybURhdGEiLCJmZXRjaCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZmV0Y2hfIiwicmVzcG9uc2UiLCJyZWFzb24iLCJ0YXJnZXRPcmlnaW4iLCJvcmlnaW4iLCJjcmVhdGVFeHBlY3RlZEVycm9yIiwibWVzc2FnZSIsIm9wdF9pbml0IiwicmVzIiwicHJlZml4IiwianNvbiIsInRleHQiLCJ0eHQiLCJzdGFydHNXaXRoIiwiYXNzZXJ0U3RyaW5nIiwid2FybiIsInNsaWNlIiwibGVuZ3RoIiwiZmV0Y2hBbXBDb3JzXyIsInVybCIsInhoclNlcnZpY2VGb3JUZXN0aW5nIiwid2luZG93IiwiaW5zdGFsbFhoclNlcnZpY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxHQUFS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aEMsQ0FBcUMsVUFBQ1MsUUFBRDtBQUFBLGVBQzFDeEIsYUFBYSxDQUFDd0IsUUFBRCxDQUQ2QjtBQUFBLE9BQXJDLENBQVA7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaEtBO0FBQUE7QUFBQSxXQWlLRSxvQkFBV1gsS0FBWCxFQUFrQmlCLFFBQWxCLEVBQTRCO0FBQzFCLGFBQU8sS0FBS1csYUFBTCxDQUFtQjVCLEtBQW5CLEVBQTBCaUIsUUFBMUIsRUFBb0NmLElBQXBDLENBQXlDLFVBQUNTLFFBQUQ7QUFBQSxlQUM5Q3hCLGFBQWEsQ0FBQ3dCLFFBQUQsQ0FEaUM7QUFBQSxPQUF6QyxDQUFQO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlLQTtBQUFBO0FBQUEsV0ErS0Usb0JBQVdqQixHQUFYLEVBQWdCbUMsR0FBaEIsRUFBcUI7QUFDbkIsYUFBTzVDLFdBQVUsQ0FBQ1MsR0FBRCxFQUFNbUMsR0FBTixDQUFqQjtBQUNEO0FBakxIOztBQUFBO0FBQUE7O0FBb0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxvQkFBVCxDQUE4QkMsTUFBOUIsRUFBc0M7QUFDM0NDLEVBQUFBLGlCQUFpQixDQUFDRCxNQUFELENBQWpCO0FBQ0EsU0FBT2hELFVBQVUsQ0FBQ2dELE1BQUQsRUFBUyxLQUFULENBQWpCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxpQkFBVCxDQUEyQkQsTUFBM0IsRUFBbUM7QUFDeEMvQyxFQUFBQSxzQkFBc0IsQ0FBQytDLE1BQUQsRUFBUyxLQUFULEVBQWdCdEMsR0FBaEIsQ0FBdEI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7aXNGb3JtRGF0YVdyYXBwZXJ9IGZyb20gJy4uL2Zvcm0tZGF0YS13cmFwcGVyJztcbmltcG9ydCB7ZGV2LCB1c2VyfSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlLCByZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRDb3JzVXJsLCBwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4uL3VybCc7XG5pbXBvcnQge1xuICBhc3NlcnRTdWNjZXNzLFxuICBnZXRWaWV3ZXJJbnRlcmNlcHRSZXNwb25zZSxcbiAgc2V0dXBBTVBDb3JzLFxuICBzZXR1cEluaXQsXG4gIHNldHVwSW5wdXQsXG4gIHNldHVwSnNvbkZldGNoSW5pdCxcbn0gZnJvbSAnLi4vdXRpbHMveGhyLXV0aWxzJztcblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCBwb2x5ZmlsbHMgRmV0Y2ggQVBJIGZvciB1c2Ugd2l0aGluIEFNUC5cbiAqXG4gKiBAcGFja2FnZSBWaXNpYmxlIGZvciB0eXBlLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBYaHIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIC8qKiBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW4gPSB3aW47XG5cbiAgICBjb25zdCBhbXBkb2NTZXJ2aWNlID0gU2VydmljZXMuYW1wZG9jU2VydmljZUZvcih3aW4pO1xuXG4gICAgLy8gVGhlIGlzU2luZ2xlRG9jIGNoZWNrIGlzIHJlcXVpcmVkIGJlY2F1c2UgaWYgaW4gc2hhZG93IG1vZGUsIHRoaXMgd2lsbFxuICAgIC8vIHRocm93IGEgY29uc29sZSBlcnJvciBiZWNhdXNlIHRoZSBzaGVsbFNoYWRvd0RvY18gaXMgbm90IHNldCB3aGVuXG4gICAgLy8gZmV0Y2hpbmcgdGhlIGFtcCBkb2MuIFNvIGVpdGhlciB0aGUgdGVzdC1iaW5kLWltcGwgb3IgdGVzdCBwcmUgc2V0dXAgaW5cbiAgICAvLyBzaGFkb3cgbW9kZSB0ZXN0cyBuZWVkcyB0byBiZSBmaXhlZCBvciB0aGVyZSBpcyBhIGJ1ZyBpbiBhbXBkb2MgaW1wbFxuICAgIC8vIGdldEFtcERvYy5cbiAgICAvLyBUT0RPKGFsYWJpYWdhKTogVGhpcyBzaG91bGQgYmUgaW52ZXN0aWdhdGVkIGFuZCBmaXhlZFxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jU2luZ2xlXyA9IGFtcGRvY1NlcnZpY2UuaXNTaW5nbGVEb2MoKVxuICAgICAgPyBhbXBkb2NTZXJ2aWNlLmdldFNpbmdsZURvYygpXG4gICAgICA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogV2Ugd2FudCB0byBjYWxsIGBmZXRjaF9gIHVuYm91bmQgZnJvbSBhbnkgY29udGV4dCBzaW5jZSBpdCBjb3VsZFxuICAgKiBiZSBlaXRoZXIgdGhlIG5hdGl2ZSBmZXRjaCBvciBvdXIgcG9seWZpbGwuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICAgKiBAcGFyYW0geyFGZXRjaEluaXREZWZ9IGluaXRcbiAgICogQHJldHVybiB7IVByb21pc2U8IVJlc3BvbnNlPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZldGNoXyhpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBnZXRWaWV3ZXJJbnRlcmNlcHRSZXNwb25zZShcbiAgICAgIHRoaXMud2luLFxuICAgICAgdGhpcy5hbXBkb2NTaW5nbGVfLFxuICAgICAgaW5wdXQsXG4gICAgICBpbml0XG4gICAgKS50aGVuKChpbnRlcmNlcHRvclJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoaW50ZXJjZXB0b3JSZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gaW50ZXJjZXB0b3JSZXNwb25zZTtcbiAgICAgIH1cbiAgICAgIC8vIEFmdGVyIHRoaXMgcG9pbnQsIGJvdGggdGhlIG5hdGl2ZSBgZmV0Y2hgIGFuZCB0aGUgYGZldGNoYCBwb2x5ZmlsbFxuICAgICAgLy8gd2lsbCBleHBlY3QgYSBuYXRpdmUgYEZvcm1EYXRhYCBvYmplY3QgaW4gdGhlIGBib2R5YCBwcm9wZXJ0eSwgc29cbiAgICAgIC8vIHRoZSBuYXRpdmUgYEZvcm1EYXRhYCBvYmplY3QgbmVlZHMgdG8gYmUgdW53cmFwcGVkLlxuICAgICAgaWYgKGlzRm9ybURhdGFXcmFwcGVyKGluaXQuYm9keSkpIHtcbiAgICAgICAgY29uc3QgZm9ybURhdGFXcmFwcGVyID0gLyoqIEB0eXBlIHshRm9ybURhdGFXcmFwcGVySW50ZXJmYWNlfSAqLyAoXG4gICAgICAgICAgaW5pdC5ib2R5XG4gICAgICAgICk7XG4gICAgICAgIGluaXQuYm9keSA9IGZvcm1EYXRhV3JhcHBlci5nZXRGb3JtRGF0YSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMud2luLmZldGNoLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGZpbmFsIGluaXRpYWxpemF0aW9uIGFuZCByZXF1ZXN0cyB0aGUgZmV0Y2guIEl0IGRvZXMgdHdvXG4gICAqIG1haW4gdGhpbmdzOlxuICAgKiAtIEl0IGFkZHMgXCJfX2FtcF9zb3VyY2Vfb3JpZ2luXCIgVVJMIHBhcmFtZXRlciB3aXRoIHNvdXJjZSBvcmlnaW5cbiAgICogVVNFIFdJVEggQ0FVVElPTjogc2V0dGluZyBhbXBDb3JzIHRvIGZhbHNlIGRpc2FibGVzIEFNUCBzb3VyY2Ugb3JpZ2luIGNoZWNrXG4gICAqIGJ1dCBhbGxvd3MgZm9yIGNhY2hpbmcgcmVzb3VyY2VzIGNyb3NzIHBhZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHshRmV0Y2hJbml0RGVmPX0gaW5pdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhUmVzcG9uc2U+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZmV0Y2hBbXBDb3JzXyhpbnB1dCwgaW5pdCA9IHt9KSB7XG4gICAgaW5wdXQgPSBzZXR1cElucHV0KHRoaXMud2luLCBpbnB1dCwgaW5pdCk7XG4gICAgaW5pdCA9IHNldHVwQU1QQ29ycyh0aGlzLndpbiwgaW5wdXQsIGluaXQpO1xuICAgIHJldHVybiB0aGlzLmZldGNoXyhpbnB1dCwgaW5pdCkudGhlbihcbiAgICAgIChyZXNwb25zZSkgPT4gcmVzcG9uc2UsXG4gICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldE9yaWdpbiA9IHBhcnNlVXJsRGVwcmVjYXRlZChpbnB1dCkub3JpZ2luO1xuICAgICAgICB0aHJvdyB1c2VyKCkuY3JlYXRlRXhwZWN0ZWRFcnJvcihcbiAgICAgICAgICAnWEhSJyxcbiAgICAgICAgICBgRmFpbGVkIGZldGNoaW5nICgke3RhcmdldE9yaWdpbn0vLi4uKTpgLFxuICAgICAgICAgIHJlYXNvbiAmJiAvKiogQHR5cGUgeyFFcnJvcn0gKi8gKHJlYXNvbikubWVzc2FnZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyBhIEpTT04gcmVzcG9uc2UuIE5vdGUgdGhpcyByZXR1cm5zIHRoZSByZXNwb25zZSBvYmplY3QsIG5vdCB0aGVcbiAgICogcmVzcG9uc2UncyBKU09OLiAjZmV0Y2hKc29uIG1lcmVseSBzZXRzIHVwIHRoZSByZXF1ZXN0IHRvIGFjY2VwdCBKU09OLlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0dsb2JhbEZldGNoL2ZldGNoXG4gICAqXG4gICAqIFNlZSBgZmV0Y2hBbXBDb3JzX2AgZm9yIG1vcmUgZGV0YWlsLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHs/RmV0Y2hJbml0RGVmPX0gb3B0X2luaXRcbiAgICogQHJldHVybiB7IVByb21pc2U8IVJlc3BvbnNlPn1cbiAgICovXG4gIGZldGNoSnNvbihpbnB1dCwgb3B0X2luaXQpIHtcbiAgICByZXR1cm4gdGhpcy5mZXRjaChpbnB1dCwgc2V0dXBKc29uRmV0Y2hJbml0KG9wdF9pbml0KSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyBhIHRleHQgcmVzcG9uc2UuIE5vdGUgdGhpcyByZXR1cm5zIHRoZSByZXNwb25zZSBvYmplY3QsIG5vdCB0aGVcbiAgICogcmVzcG9uc2UncyB0ZXh0LiAjZmV0Y2hUZXh0IG1lcmVseSBzZXRzIHVwIHRoZSByZXF1ZXN0IHRvIGFjY2VwdCB0ZXh0LlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0dsb2JhbEZldGNoL2ZldGNoXG4gICAqXG4gICAqIFNlZSBgZmV0Y2hBbXBDb3JzX2AgZm9yIG1vcmUgZGV0YWlsLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHs/RmV0Y2hJbml0RGVmPX0gb3B0X2luaXRcbiAgICogQHJldHVybiB7IVByb21pc2U8IVJlc3BvbnNlPn1cbiAgICovXG4gIGZldGNoVGV4dChpbnB1dCwgb3B0X2luaXQpIHtcbiAgICByZXR1cm4gdGhpcy5mZXRjaChpbnB1dCwgc2V0dXBJbml0KG9wdF9pbml0LCAndGV4dC9wbGFpbicpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHN1YnNpdHV0ZSBmb3IgdGhlIHN0YW5kYXJkIHJlc3BvbnNlLmpzb24oKSwgd2hpY2ggbWF5IG9wdGlvbmFsbHkgc3RyaXAgYSBwcmVmaXggYmVmb3JlIGNhbGxpbmcgSlNPTi5wYXJzZSgpLlxuICAgKlxuICAgKiBAcGFyYW0geyFSZXNwb25zZX0gcmVzIGZldGNoIHJlc3BvbnNlIHRvIGNvbnZlcnQgdG8ganNvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBwcmVmaXggdG8gc3RyaXAgYXdheS5cbiAgICogQHJldHVybiB7UHJvbWlzZTwqPn1cbiAgICovXG4gIHhzc2lKc29uKHJlcywgcHJlZml4KSB7XG4gICAgaWYgKCFwcmVmaXgpIHtcbiAgICAgIHJldHVybiByZXMuanNvbigpO1xuICAgIH1cblxuICAgIHJldHVybiByZXMudGV4dCgpLnRoZW4oKHR4dCkgPT4ge1xuICAgICAgaWYgKCF0eHQuc3RhcnRzV2l0aChkZXYoKS5hc3NlcnRTdHJpbmcocHJlZml4KSkpIHtcbiAgICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgICAgJ1hIUicsXG4gICAgICAgICAgYEZhaWxlZCB0byBzdHJpcCBtaXNzaW5nIHByZWZpeCBcIiR7cHJlZml4fVwiIGluIGZldGNoIHJlc3BvbnNlLmBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlSnNvbih0eHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlSnNvbih0eHQuc2xpY2UocHJlZml4Lmxlbmd0aCkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBVUkxcbiAgICogQHBhcmFtIHs/RmV0Y2hJbml0RGVmPX0gb3B0X2luaXQgRmV0Y2ggb3B0aW9ucyBvYmplY3QuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFSZXNwb25zZT59XG4gICAqL1xuICBmZXRjaChpbnB1dCwgb3B0X2luaXQpIHtcbiAgICBjb25zdCBpbml0ID0gc2V0dXBJbml0KG9wdF9pbml0KTtcbiAgICByZXR1cm4gdGhpcy5mZXRjaEFtcENvcnNfKGlucHV0LCBpbml0KS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgIGFzc2VydFN1Y2Nlc3MocmVzcG9uc2UpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyB0aGUgcmVxdWVzdCwgYXdhaXRzIHJlc3VsdCBhbmQgY29uZmlybXMgdGhhdCBpdCB3YXMgc3VjY2Vzc2Z1bC5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9HbG9iYWxGZXRjaC9mZXRjaFxuICAgKlxuICAgKiBTZWUgYGZldGNoQW1wQ29yc19gIGZvciBtb3JlIGRldGFpbC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gICAqIEBwYXJhbSB7IUZldGNoSW5pdERlZj19IG9wdF9pbml0XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgc2VuZFNpZ25hbChpbnB1dCwgb3B0X2luaXQpIHtcbiAgICByZXR1cm4gdGhpcy5mZXRjaEFtcENvcnNfKGlucHV0LCBvcHRfaW5pdCkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICBhc3NlcnRTdWNjZXNzKHJlc3BvbnNlKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIFwiX19hbXBfc291cmNlX29yaWdpblwiIHF1ZXJ5IHBhcmFtZXRlciB0byB0aGUgVVJMLiBJZGVhbGx5LCB3ZSdkIGJlXG4gICAqIGFibGUgdG8gc2V0IGEgaGVhZGVyIChlLmcuIEFNUC1Tb3VyY2UtT3JpZ2luKSwgYnV0IHRoaXMgd2lsbCBmb3JjZVxuICAgKiBwcmVmbGlnaHQgcmVxdWVzdCBvbiBhbGwgQ09SUyByZXF1ZXN0LlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldENvcnNVcmwod2luLCB1cmwpIHtcbiAgICByZXR1cm4gZ2V0Q29yc1VybCh3aW4sIHVybCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICogQHJldHVybiB7IVhocn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHhoclNlcnZpY2VGb3JUZXN0aW5nKHdpbmRvdykge1xuICBpbnN0YWxsWGhyU2VydmljZSh3aW5kb3cpO1xuICByZXR1cm4gZ2V0U2VydmljZSh3aW5kb3csICd4aHInKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFhoclNlcnZpY2Uod2luZG93KSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIod2luZG93LCAneGhyJywgWGhyKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/xhr-impl.js