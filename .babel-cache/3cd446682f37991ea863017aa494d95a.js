function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { BatchSegmentDef, RequestDef, TransportSerializerDef, TransportSerializers, defaultSerializer } from "./transport-serializer";
import { IframeTransport } from "./iframe-transport";
import { Services } from "../../../src/service";
import { WindowInterface } from "../../../src/core/window/interface";
import { assertHttpsUrl, checkCorsUrl, isAmpScriptUri, parseUrlDeprecated } from "../../../src/url";
import { createPixel } from "../../../src/pixel";
import { dev, user, userAssert } from "../../../src/log";
import { getAmpAdResourceId } from "../../../src/ad-helper";
import { getMode } from "../../../src/mode";
import { getTopWindow } from "../../../src/service-helpers";
import { loadPromise } from "../../../src/event-helper";
import { removeElement } from "../../../src/core/dom";
import { toWin } from "../../../src/core/window";
import { toggle } from "../../../src/core/dom/style";

/** @const {string} */
var TAG_ = 'amp-analytics/transport';

/**
 * Transport defines the ways how the analytics pings are going to be sent.
 */
export var Transport = /*#__PURE__*/function () {
  /**
   * @param {!AmpDoc} ampdoc
   * @param {!JsonObject} options
   */
  function Transport(ampdoc, options) {
    if (options === void 0) {
      options =
      /** @type {!JsonObject} */
      {};
    }

    _classCallCheck(this, Transport);

    /** @private {!AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!JsonObject} */
    this.options_ = options;

    /** @private {string|undefined} */
    this.referrerPolicy_ =
    /** @type {string|undefined} */
    this.options_['referrerPolicy'];

    // no-referrer is only supported in image transport
    if (this.referrerPolicy_ === 'no-referrer') {
      this.options_['beacon'] = false;
      this.options_['xhrpost'] = false;
    }

    /** @private {boolean} */
    this.useBody_ = !!this.options_['useBody'];

    /** @private {?IframeTransport} */
    this.iframeTransport_ = null;

    /** @private {boolean} */
    this.isInabox_ = getMode(this.win_).runtime == 'inabox';
  }

  /**
   * @param {string} url
   * @param {!Array<!BatchSegmentDef>} segments
   * @param {boolean} inBatch
   */
  _createClass(Transport, [{
    key: "sendRequest",
    value: function sendRequest(url, segments, inBatch) {
      if (!url || segments.length === 0) {
        dev().info(TAG_, 'Empty request not sent: ', url);
        return;
      }

      var serializer = this.getSerializer_();

      /**
       * @param {boolean} withPayload
       * @return {!RequestDef}
       */
      function generateRequest(withPayload) {
        var request = inBatch ? serializer.generateBatchRequest(url, segments, withPayload) : serializer.generateRequest(url, segments[0], withPayload);

        if (!isAmpScriptUri(request.url)) {
          assertHttpsUrl(request.url, 'amp-analytics request');
          checkCorsUrl(request.url);
        }

        return request;
      }

      var getRequest = cacheFuncResult(generateRequest);

      if (this.options_['iframe']) {
        if (!this.iframeTransport_) {
          dev().error(TAG_, 'iframe transport was inadvertently deleted');
          return;
        }

        this.iframeTransport_.sendRequest(getRequest(false).url);
        return;
      }

      if (this.options_['amp-script']) {
        Transport.forwardRequestToAmpScript(this.ampdoc_, {
          url: url,
          payload: getRequest(true).payload
        });
        return;
      }

      if (this.options_['beacon'] && Transport.sendRequestUsingBeacon(this.win_, getRequest(this.useBody_))) {
        return;
      }

      if (this.options_['xhrpost'] && Transport.sendRequestUsingXhr(this.win_, getRequest(this.useBody_))) {
        return;
      }

      var image = this.options_['image'];

      if (image) {
        var suppressWarnings = typeof image == 'object' && image['suppressWarnings'];
        Transport.sendRequestUsingImage(this.win_, getRequest(false), suppressWarnings,
        /** @type {string|undefined} */
        this.referrerPolicy_);
        return;
      }

      user().warn(TAG_, 'Failed to send request', url, this.options_);
    }
    /**
     * amp-analytics will create an iframe for vendors in
     * extensions/amp-analytics/0.1/vendors/* who have transport/iframe defined.
     * This is limited to MRC-accreddited vendors. The frame is removed if the
     * user navigates/swipes away from the page, and is recreated if the user
     * navigates back to the page.
     *
     * @param {!Element} element
     */

  }, {
    key: "maybeInitIframeTransport",
    value: function maybeInitIframeTransport(element) {
      if (!this.options_['iframe'] || this.iframeTransport_) {
        return;
      }

      // In the case of FIE rendering, we should be using the parent doc win.
      var topWin = getTopWindow(toWin(element.ownerDocument.defaultView));
      var type = element.getAttribute('type');
      // In inabox there is no amp-ad element.
      var ampAdResourceId = this.isInabox_ ? '1' : user().assertString(getAmpAdResourceId(element, topWin), 'No friendly amp-ad ancestor element was found ' + 'for amp-analytics tag with iframe transport.');
      this.iframeTransport_ = new IframeTransport(topWin, type, this.options_, ampAdResourceId);
    }
    /**
     * Deletes iframe transport.
     */

  }, {
    key: "deleteIframeTransport",
    value: function deleteIframeTransport() {
      if (this.iframeTransport_) {
        this.iframeTransport_.detach();
        this.iframeTransport_ = null;
      }
    }
    /**
     * Sends a ping request using an iframe, that is removed 5 seconds after
     * it is loaded.
     * This is not available as a standard transport, but rather used for
     * specific, allowlisted requests.
     * Note that this is unrelated to the iframeTransport
     *
     * @param {string} url
     * @param {!BatchSegmentDef} segment
     */

  }, {
    key: "sendRequestUsingIframe",
    value: function sendRequestUsingIframe(url, segment) {
      var _this = this;

      var request = defaultSerializer(url, [segment]);

      if (!request) {
        user().error(TAG_, 'Request not sent. Contents empty.');
        return;
      }

      assertHttpsUrl(request, 'amp-analytics request');
      userAssert(parseUrlDeprecated(request).origin != parseUrlDeprecated(this.win_.location.href).origin, 'Origin of iframe request must not be equal to the document origin.' + ' See https://github.com/ampproject/' + 'amphtml/blob/main/docs/spec/amp-iframe-origin-policy.md for details.');

      /** @const {!Element} */
      var iframe = this.win_.document.createElement('iframe');
      toggle(iframe, false);

      iframe.onload = iframe.onerror = function () {
        Services.timerFor(_this.win_).delay(function () {
          removeElement(iframe);
        }, 5000);
      };

      iframe.setAttribute('amp-analytics', '');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      iframe.src = request;
      this.win_.document.body.appendChild(iframe);
    }
    /**
     * @return {!TransportSerializerDef}
     */

  }, {
    key: "getSerializer_",
    value: function getSerializer_() {
      return (
        /** @type {!TransportSerializerDef} */
        TransportSerializers['default']
      );
    }
    /**
     * @param {!Window} win
     * @param {!RequestDef} request
     * @param {boolean} suppressWarnings
     * @param {string|undefined} referrerPolicy
     */

  }], [{
    key: "sendRequestUsingImage",
    value: function sendRequestUsingImage(win, request, suppressWarnings, referrerPolicy) {
      if (!win) {
        return;
      }

      var image = createPixel(win, request.url, referrerPolicy);
      loadPromise(image).then(function () {
        dev().fine(TAG_, 'Sent image request', request.url);
      }).catch(function () {
        if (!suppressWarnings) {
          user().warn(TAG_, 'Response unparseable or failed to send image request', request.url);
        }
      });
    }
    /**
     * @param {!Window} win
     * @param {!RequestDef} request
     * @return {boolean} True if this browser supports navigator.sendBeacon.
     */

  }, {
    key: "sendRequestUsingBeacon",
    value: function sendRequestUsingBeacon(win, request) {
      var sendBeacon = WindowInterface.getSendBeacon(win);

      if (!sendBeacon) {
        return false;
      }

      var result = sendBeacon(request.url, request.payload || '');

      if (result) {
        dev().fine(TAG_, 'Sent beacon request', request);
      }

      return result;
    }
    /**
     * @param {!Window} win
     * @param {!RequestDef} request
     * @return {boolean} True if this browser supports cross-domain XHR.
     */

  }, {
    key: "sendRequestUsingXhr",
    value: function sendRequestUsingXhr(win, request) {
      var XMLHttpRequest = WindowInterface.getXMLHttpRequest(win);

      if (!XMLHttpRequest) {
        return false;
      }

      var xhr = new XMLHttpRequest();

      if (!('withCredentials' in xhr)) {
        return false;
      }

      xhr.open('POST', request.url, true);
      xhr.withCredentials = true;
      // Prevent pre-flight HEAD request.
      xhr.setRequestHeader('Content-Type', 'text/plain');

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          dev().fine(TAG_, 'Sent XHR request', request.url);
        }
      };

      xhr.send(request.payload || '');
      return true;
    }
    /**
     * @param {!AmpDoc} ampdoc
     * @param {!RequestDef} request
     * @return {!Promise}
     */

  }, {
    key: "forwardRequestToAmpScript",
    value: function forwardRequestToAmpScript(ampdoc, request) {
      return Services.scriptForDocOrNull(ampdoc).then(function (ampScriptService) {
        userAssert(ampScriptService, 'AMP-SCRIPT is not installed');
        ampScriptService.fetch(request.url, JSON.parse(request.payload));
      });
    }
  }]);

  return Transport;
}();

/**
 * A helper method that wraps a function and cache its return value.
 *
 * @param {!Function} func the function to cache
 * @return {!Function}
 */
function cacheFuncResult(func) {
  var cachedValue = {};
  return function (arg) {
    var key = String(arg);

    if (cachedValue[key] === undefined) {
      cachedValue[key] = func(arg);
    }

    return cachedValue[key];
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcG9ydC5qcyJdLCJuYW1lcyI6WyJCYXRjaFNlZ21lbnREZWYiLCJSZXF1ZXN0RGVmIiwiVHJhbnNwb3J0U2VyaWFsaXplckRlZiIsIlRyYW5zcG9ydFNlcmlhbGl6ZXJzIiwiZGVmYXVsdFNlcmlhbGl6ZXIiLCJJZnJhbWVUcmFuc3BvcnQiLCJTZXJ2aWNlcyIsIldpbmRvd0ludGVyZmFjZSIsImFzc2VydEh0dHBzVXJsIiwiY2hlY2tDb3JzVXJsIiwiaXNBbXBTY3JpcHRVcmkiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJjcmVhdGVQaXhlbCIsImRldiIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZ2V0QW1wQWRSZXNvdXJjZUlkIiwiZ2V0TW9kZSIsImdldFRvcFdpbmRvdyIsImxvYWRQcm9taXNlIiwicmVtb3ZlRWxlbWVudCIsInRvV2luIiwidG9nZ2xlIiwiVEFHXyIsIlRyYW5zcG9ydCIsImFtcGRvYyIsIm9wdGlvbnMiLCJhbXBkb2NfIiwid2luXyIsIndpbiIsIm9wdGlvbnNfIiwicmVmZXJyZXJQb2xpY3lfIiwidXNlQm9keV8iLCJpZnJhbWVUcmFuc3BvcnRfIiwiaXNJbmFib3hfIiwicnVudGltZSIsInVybCIsInNlZ21lbnRzIiwiaW5CYXRjaCIsImxlbmd0aCIsImluZm8iLCJzZXJpYWxpemVyIiwiZ2V0U2VyaWFsaXplcl8iLCJnZW5lcmF0ZVJlcXVlc3QiLCJ3aXRoUGF5bG9hZCIsInJlcXVlc3QiLCJnZW5lcmF0ZUJhdGNoUmVxdWVzdCIsImdldFJlcXVlc3QiLCJjYWNoZUZ1bmNSZXN1bHQiLCJlcnJvciIsInNlbmRSZXF1ZXN0IiwiZm9yd2FyZFJlcXVlc3RUb0FtcFNjcmlwdCIsInBheWxvYWQiLCJzZW5kUmVxdWVzdFVzaW5nQmVhY29uIiwic2VuZFJlcXVlc3RVc2luZ1hociIsImltYWdlIiwic3VwcHJlc3NXYXJuaW5ncyIsInNlbmRSZXF1ZXN0VXNpbmdJbWFnZSIsIndhcm4iLCJlbGVtZW50IiwidG9wV2luIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwidHlwZSIsImdldEF0dHJpYnV0ZSIsImFtcEFkUmVzb3VyY2VJZCIsImFzc2VydFN0cmluZyIsImRldGFjaCIsInNlZ21lbnQiLCJvcmlnaW4iLCJsb2NhdGlvbiIsImhyZWYiLCJpZnJhbWUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJvbmVycm9yIiwidGltZXJGb3IiLCJkZWxheSIsInNldEF0dHJpYnV0ZSIsInNyYyIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInJlZmVycmVyUG9saWN5IiwidGhlbiIsImZpbmUiLCJjYXRjaCIsInNlbmRCZWFjb24iLCJnZXRTZW5kQmVhY29uIiwicmVzdWx0IiwiWE1MSHR0cFJlcXVlc3QiLCJnZXRYTUxIdHRwUmVxdWVzdCIsInhociIsIm9wZW4iLCJ3aXRoQ3JlZGVudGlhbHMiLCJzZXRSZXF1ZXN0SGVhZGVyIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInNlbmQiLCJzY3JpcHRGb3JEb2NPck51bGwiLCJhbXBTY3JpcHRTZXJ2aWNlIiwiZmV0Y2giLCJKU09OIiwicGFyc2UiLCJmdW5jIiwiY2FjaGVkVmFsdWUiLCJhcmciLCJrZXkiLCJTdHJpbmciLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLGVBREYsRUFFRUMsVUFGRixFQUdFQyxzQkFIRixFQUlFQyxvQkFKRixFQUtFQyxpQkFMRjtBQU9BLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQ0VDLGNBREYsRUFFRUMsWUFGRixFQUdFQyxjQUhGLEVBSUVDLGtCQUpGO0FBTUEsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsSUFBYixFQUFtQkMsVUFBbkI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFD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QVY7QUFDQUEsUUFBQUEsZ0JBQWdCLENBQUNDLEtBQWpCLENBQXVCeEQsT0FBTyxDQUFDVCxHQUEvQixFQUFvQ2tFLElBQUksQ0FBQ0MsS0FBTCxDQUFXMUQsT0FBTyxDQUFDTyxPQUFuQixDQUFwQztBQUNELE9BSE0sQ0FBUDtBQUlEO0FBN1JIOztBQUFBO0FBQUE7O0FBZ1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNKLGVBQVQsQ0FBeUJ3RCxJQUF6QixFQUErQjtBQUM3QixNQUFNQyxXQUFXLEdBQUcsRUFBcEI7QUFDQSxTQUFPLFVBQUNDLEdBQUQsRUFBUztBQUNkLFFBQU1DLEdBQUcsR0FBR0MsTUFBTSxDQUFDRixHQUFELENBQWxCOztBQUNBLFFBQUlELFdBQVcsQ0FBQ0UsR0FBRCxDQUFYLEtBQXFCRSxTQUF6QixFQUFvQztBQUNsQ0osTUFBQUEsV0FBVyxDQUFDRSxHQUFELENBQVgsR0FBbUJILElBQUksQ0FBQ0UsR0FBRCxDQUF2QjtBQUNEOztBQUNELFdBQU9ELFdBQVcsQ0FBQ0UsR0FBRCxDQUFsQjtBQUNELEdBTkQ7QUFPRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBCYXRjaFNlZ21lbnREZWYsXG4gIFJlcXVlc3REZWYsXG4gIFRyYW5zcG9ydFNlcmlhbGl6ZXJEZWYsXG4gIFRyYW5zcG9ydFNlcmlhbGl6ZXJzLFxuICBkZWZhdWx0U2VyaWFsaXplcixcbn0gZnJvbSAnLi90cmFuc3BvcnQtc2VyaWFsaXplcic7XG5pbXBvcnQge0lmcmFtZVRyYW5zcG9ydH0gZnJvbSAnLi9pZnJhbWUtdHJhbnNwb3J0JztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7V2luZG93SW50ZXJmYWNlfSBmcm9tICcjY29yZS93aW5kb3cvaW50ZXJmYWNlJztcbmltcG9ydCB7XG4gIGFzc2VydEh0dHBzVXJsLFxuICBjaGVja0NvcnNVcmwsXG4gIGlzQW1wU2NyaXB0VXJpLFxuICBwYXJzZVVybERlcHJlY2F0ZWQsXG59IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHtjcmVhdGVQaXhlbH0gZnJvbSAnLi4vLi4vLi4vc3JjL3BpeGVsJztcbmltcG9ydCB7ZGV2LCB1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0QW1wQWRSZXNvdXJjZUlkfSBmcm9tICcuLi8uLi8uLi9zcmMvYWQtaGVscGVyJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtnZXRUb3BXaW5kb3d9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuXG5pbXBvcnQge2xvYWRQcm9taXNlfSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7cmVtb3ZlRWxlbWVudH0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5pbXBvcnQge3RvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHXyA9ICdhbXAtYW5hbHl0aWNzL3RyYW5zcG9ydCc7XG5cbi8qKlxuICogVHJhbnNwb3J0IGRlZmluZXMgdGhlIHdheXMgaG93IHRoZSBhbmFseXRpY3MgcGluZ3MgYXJlIGdvaW5nIHRvIGJlIHNlbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmFuc3BvcnQge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jLCBvcHRpb25zID0gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHt9KSkge1xuICAgIC8qKiBAcHJpdmF0ZSB7IUFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gYW1wZG9jLndpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUpzb25PYmplY3R9ICovXG4gICAgdGhpcy5vcHRpb25zXyA9IG9wdGlvbnM7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ3x1bmRlZmluZWR9ICovXG4gICAgdGhpcy5yZWZlcnJlclBvbGljeV8gPSAvKiogQHR5cGUge3N0cmluZ3x1bmRlZmluZWR9ICovIChcbiAgICAgIHRoaXMub3B0aW9uc19bJ3JlZmVycmVyUG9saWN5J11cbiAgICApO1xuXG4gICAgLy8gbm8tcmVmZXJyZXIgaXMgb25seSBzdXBwb3J0ZWQgaW4gaW1hZ2UgdHJhbnNwb3J0XG4gICAgaWYgKHRoaXMucmVmZXJyZXJQb2xpY3lfID09PSAnbm8tcmVmZXJyZXInKSB7XG4gICAgICB0aGlzLm9wdGlvbnNfWydiZWFjb24nXSA9IGZhbHNlO1xuICAgICAgdGhpcy5vcHRpb25zX1sneGhycG9zdCddID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMudXNlQm9keV8gPSAhIXRoaXMub3B0aW9uc19bJ3VzZUJvZHknXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0lmcmFtZVRyYW5zcG9ydH0gKi9cbiAgICB0aGlzLmlmcmFtZVRyYW5zcG9ydF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJbmFib3hfID0gZ2V0TW9kZSh0aGlzLndpbl8pLnJ1bnRpbWUgPT0gJ2luYWJveCc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFBcnJheTwhQmF0Y2hTZWdtZW50RGVmPn0gc2VnbWVudHNcbiAgICogQHBhcmFtIHtib29sZWFufSBpbkJhdGNoXG4gICAqL1xuICBzZW5kUmVxdWVzdCh1cmwsIHNlZ21lbnRzLCBpbkJhdGNoKSB7XG4gICAgaWYgKCF1cmwgfHwgc2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZXYoKS5pbmZvKFRBR18sICdFbXB0eSByZXF1ZXN0IG5vdCBzZW50OiAnLCB1cmwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzZXJpYWxpemVyID0gdGhpcy5nZXRTZXJpYWxpemVyXygpO1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd2l0aFBheWxvYWRcbiAgICAgKiBAcmV0dXJuIHshUmVxdWVzdERlZn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZVJlcXVlc3Qod2l0aFBheWxvYWQpIHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSBpbkJhdGNoXG4gICAgICAgID8gc2VyaWFsaXplci5nZW5lcmF0ZUJhdGNoUmVxdWVzdCh1cmwsIHNlZ21lbnRzLCB3aXRoUGF5bG9hZClcbiAgICAgICAgOiBzZXJpYWxpemVyLmdlbmVyYXRlUmVxdWVzdCh1cmwsIHNlZ21lbnRzWzBdLCB3aXRoUGF5bG9hZCk7XG4gICAgICBpZiAoIWlzQW1wU2NyaXB0VXJpKHJlcXVlc3QudXJsKSkge1xuICAgICAgICBhc3NlcnRIdHRwc1VybChyZXF1ZXN0LnVybCwgJ2FtcC1hbmFseXRpY3MgcmVxdWVzdCcpO1xuICAgICAgICBjaGVja0NvcnNVcmwocmVxdWVzdC51cmwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0UmVxdWVzdCA9IGNhY2hlRnVuY1Jlc3VsdChnZW5lcmF0ZVJlcXVlc3QpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9uc19bJ2lmcmFtZSddKSB7XG4gICAgICBpZiAoIXRoaXMuaWZyYW1lVHJhbnNwb3J0Xykge1xuICAgICAgICBkZXYoKS5lcnJvcihUQUdfLCAnaWZyYW1lIHRyYW5zcG9ydCB3YXMgaW5hZHZlcnRlbnRseSBkZWxldGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaWZyYW1lVHJhbnNwb3J0Xy5zZW5kUmVxdWVzdChnZXRSZXF1ZXN0KGZhbHNlKS51cmwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnNfWydhbXAtc2NyaXB0J10pIHtcbiAgICAgIFRyYW5zcG9ydC5mb3J3YXJkUmVxdWVzdFRvQW1wU2NyaXB0KHRoaXMuYW1wZG9jXywge1xuICAgICAgICB1cmwsXG4gICAgICAgIHBheWxvYWQ6IGdldFJlcXVlc3QodHJ1ZSkucGF5bG9hZCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMub3B0aW9uc19bJ2JlYWNvbiddICYmXG4gICAgICBUcmFuc3BvcnQuc2VuZFJlcXVlc3RVc2luZ0JlYWNvbih0aGlzLndpbl8sIGdldFJlcXVlc3QodGhpcy51c2VCb2R5XykpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHRoaXMub3B0aW9uc19bJ3hocnBvc3QnXSAmJlxuICAgICAgVHJhbnNwb3J0LnNlbmRSZXF1ZXN0VXNpbmdYaHIodGhpcy53aW5fLCBnZXRSZXF1ZXN0KHRoaXMudXNlQm9keV8pKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbWFnZSA9IHRoaXMub3B0aW9uc19bJ2ltYWdlJ107XG4gICAgaWYgKGltYWdlKSB7XG4gICAgICBjb25zdCBzdXBwcmVzc1dhcm5pbmdzID1cbiAgICAgICAgdHlwZW9mIGltYWdlID09ICdvYmplY3QnICYmIGltYWdlWydzdXBwcmVzc1dhcm5pbmdzJ107XG4gICAgICBUcmFuc3BvcnQuc2VuZFJlcXVlc3RVc2luZ0ltYWdlKFxuICAgICAgICB0aGlzLndpbl8sXG4gICAgICAgIGdldFJlcXVlc3QoZmFsc2UpLFxuICAgICAgICBzdXBwcmVzc1dhcm5pbmdzLFxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ3x1bmRlZmluZWR9ICovICh0aGlzLnJlZmVycmVyUG9saWN5XylcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHVzZXIoKS53YXJuKFRBR18sICdGYWlsZWQgdG8gc2VuZCByZXF1ZXN0JywgdXJsLCB0aGlzLm9wdGlvbnNfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhbXAtYW5hbHl0aWNzIHdpbGwgY3JlYXRlIGFuIGlmcmFtZSBmb3IgdmVuZG9ycyBpblxuICAgKiBleHRlbnNpb25zL2FtcC1hbmFseXRpY3MvMC4xL3ZlbmRvcnMvKiB3aG8gaGF2ZSB0cmFuc3BvcnQvaWZyYW1lIGRlZmluZWQuXG4gICAqIFRoaXMgaXMgbGltaXRlZCB0byBNUkMtYWNjcmVkZGl0ZWQgdmVuZG9ycy4gVGhlIGZyYW1lIGlzIHJlbW92ZWQgaWYgdGhlXG4gICAqIHVzZXIgbmF2aWdhdGVzL3N3aXBlcyBhd2F5IGZyb20gdGhlIHBhZ2UsIGFuZCBpcyByZWNyZWF0ZWQgaWYgdGhlIHVzZXJcbiAgICogbmF2aWdhdGVzIGJhY2sgdG8gdGhlIHBhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIG1heWJlSW5pdElmcmFtZVRyYW5zcG9ydChlbGVtZW50KSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnNfWydpZnJhbWUnXSB8fCB0aGlzLmlmcmFtZVRyYW5zcG9ydF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbiB0aGUgY2FzZSBvZiBGSUUgcmVuZGVyaW5nLCB3ZSBzaG91bGQgYmUgdXNpbmcgdGhlIHBhcmVudCBkb2Mgd2luLlxuICAgIGNvbnN0IHRvcFdpbiA9IGdldFRvcFdpbmRvdyh0b1dpbihlbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpKTtcbiAgICBjb25zdCB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAvLyBJbiBpbmFib3ggdGhlcmUgaXMgbm8gYW1wLWFkIGVsZW1lbnQuXG4gICAgY29uc3QgYW1wQWRSZXNvdXJjZUlkID0gdGhpcy5pc0luYWJveF9cbiAgICAgID8gJzEnXG4gICAgICA6IHVzZXIoKS5hc3NlcnRTdHJpbmcoXG4gICAgICAgICAgZ2V0QW1wQWRSZXNvdXJjZUlkKGVsZW1lbnQsIHRvcFdpbiksXG4gICAgICAgICAgJ05vIGZyaWVuZGx5IGFtcC1hZCBhbmNlc3RvciBlbGVtZW50IHdhcyBmb3VuZCAnICtcbiAgICAgICAgICAgICdmb3IgYW1wLWFuYWx5dGljcyB0YWcgd2l0aCBpZnJhbWUgdHJhbnNwb3J0LidcbiAgICAgICAgKTtcblxuICAgIHRoaXMuaWZyYW1lVHJhbnNwb3J0XyA9IG5ldyBJZnJhbWVUcmFuc3BvcnQoXG4gICAgICB0b3BXaW4sXG4gICAgICB0eXBlLFxuICAgICAgdGhpcy5vcHRpb25zXyxcbiAgICAgIGFtcEFkUmVzb3VyY2VJZFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBpZnJhbWUgdHJhbnNwb3J0LlxuICAgKi9cbiAgZGVsZXRlSWZyYW1lVHJhbnNwb3J0KCkge1xuICAgIGlmICh0aGlzLmlmcmFtZVRyYW5zcG9ydF8pIHtcbiAgICAgIHRoaXMuaWZyYW1lVHJhbnNwb3J0Xy5kZXRhY2goKTtcbiAgICAgIHRoaXMuaWZyYW1lVHJhbnNwb3J0XyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgcGluZyByZXF1ZXN0IHVzaW5nIGFuIGlmcmFtZSwgdGhhdCBpcyByZW1vdmVkIDUgc2Vjb25kcyBhZnRlclxuICAgKiBpdCBpcyBsb2FkZWQuXG4gICAqIFRoaXMgaXMgbm90IGF2YWlsYWJsZSBhcyBhIHN0YW5kYXJkIHRyYW5zcG9ydCwgYnV0IHJhdGhlciB1c2VkIGZvclxuICAgKiBzcGVjaWZpYywgYWxsb3dsaXN0ZWQgcmVxdWVzdHMuXG4gICAqIE5vdGUgdGhhdCB0aGlzIGlzIHVucmVsYXRlZCB0byB0aGUgaWZyYW1lVHJhbnNwb3J0XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshQmF0Y2hTZWdtZW50RGVmfSBzZWdtZW50XG4gICAqL1xuICBzZW5kUmVxdWVzdFVzaW5nSWZyYW1lKHVybCwgc2VnbWVudCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBkZWZhdWx0U2VyaWFsaXplcih1cmwsIFtzZWdtZW50XSk7XG4gICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHXywgJ1JlcXVlc3Qgbm90IHNlbnQuIENvbnRlbnRzIGVtcHR5LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFzc2VydEh0dHBzVXJsKHJlcXVlc3QsICdhbXAtYW5hbHl0aWNzIHJlcXVlc3QnKTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgcGFyc2VVcmxEZXByZWNhdGVkKHJlcXVlc3QpLm9yaWdpbiAhPVxuICAgICAgICBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy53aW5fLmxvY2F0aW9uLmhyZWYpLm9yaWdpbixcbiAgICAgICdPcmlnaW4gb2YgaWZyYW1lIHJlcXVlc3QgbXVzdCBub3QgYmUgZXF1YWwgdG8gdGhlIGRvY3VtZW50IG9yaWdpbi4nICtcbiAgICAgICAgJyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvJyArXG4gICAgICAgICdhbXBodG1sL2Jsb2IvbWFpbi9kb2NzL3NwZWMvYW1wLWlmcmFtZS1vcmlnaW4tcG9saWN5Lm1kIGZvciBkZXRhaWxzLidcbiAgICApO1xuXG4gICAgLyoqIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgY29uc3QgaWZyYW1lID0gdGhpcy53aW5fLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIHRvZ2dsZShpZnJhbWUsIGZhbHNlKTtcbiAgICBpZnJhbWUub25sb2FkID0gaWZyYW1lLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbl8pLmRlbGF5KCgpID0+IHtcbiAgICAgICAgcmVtb3ZlRWxlbWVudChpZnJhbWUpO1xuICAgICAgfSwgNTAwMCk7XG4gICAgfTtcblxuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2FtcC1hbmFseXRpY3MnLCAnJyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc2FuZGJveCcsICdhbGxvdy1zY3JpcHRzIGFsbG93LXNhbWUtb3JpZ2luJyk7XG4gICAgaWZyYW1lLnNyYyA9IHJlcXVlc3Q7XG4gICAgdGhpcy53aW5fLmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshVHJhbnNwb3J0U2VyaWFsaXplckRlZn1cbiAgICovXG4gIGdldFNlcmlhbGl6ZXJfKCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFUcmFuc3BvcnRTZXJpYWxpemVyRGVmfSAqLyAoXG4gICAgICBUcmFuc3BvcnRTZXJpYWxpemVyc1snZGVmYXVsdCddXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFSZXF1ZXN0RGVmfSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3VwcHJlc3NXYXJuaW5nc1xuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHJlZmVycmVyUG9saWN5XG4gICAqL1xuICBzdGF0aWMgc2VuZFJlcXVlc3RVc2luZ0ltYWdlKHdpbiwgcmVxdWVzdCwgc3VwcHJlc3NXYXJuaW5ncywgcmVmZXJyZXJQb2xpY3kpIHtcbiAgICBpZiAoIXdpbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbWFnZSA9IGNyZWF0ZVBpeGVsKHdpbiwgcmVxdWVzdC51cmwsIHJlZmVycmVyUG9saWN5KTtcbiAgICBsb2FkUHJvbWlzZShpbWFnZSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgZGV2KCkuZmluZShUQUdfLCAnU2VudCBpbWFnZSByZXF1ZXN0JywgcmVxdWVzdC51cmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIGlmICghc3VwcHJlc3NXYXJuaW5ncykge1xuICAgICAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAgICAgVEFHXyxcbiAgICAgICAgICAgICdSZXNwb25zZSB1bnBhcnNlYWJsZSBvciBmYWlsZWQgdG8gc2VuZCBpbWFnZSByZXF1ZXN0JyxcbiAgICAgICAgICAgIHJlcXVlc3QudXJsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshUmVxdWVzdERlZn0gcmVxdWVzdFxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoaXMgYnJvd3NlciBzdXBwb3J0cyBuYXZpZ2F0b3Iuc2VuZEJlYWNvbi5cbiAgICovXG4gIHN0YXRpYyBzZW5kUmVxdWVzdFVzaW5nQmVhY29uKHdpbiwgcmVxdWVzdCkge1xuICAgIGNvbnN0IHNlbmRCZWFjb24gPSBXaW5kb3dJbnRlcmZhY2UuZ2V0U2VuZEJlYWNvbih3aW4pO1xuICAgIGlmICghc2VuZEJlYWNvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBzZW5kQmVhY29uKHJlcXVlc3QudXJsLCByZXF1ZXN0LnBheWxvYWQgfHwgJycpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGRldigpLmZpbmUoVEFHXywgJ1NlbnQgYmVhY29uIHJlcXVlc3QnLCByZXF1ZXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFSZXF1ZXN0RGVmfSByZXF1ZXN0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhpcyBicm93c2VyIHN1cHBvcnRzIGNyb3NzLWRvbWFpbiBYSFIuXG4gICAqL1xuICBzdGF0aWMgc2VuZFJlcXVlc3RVc2luZ1hocih3aW4sIHJlcXVlc3QpIHtcbiAgICBjb25zdCBYTUxIdHRwUmVxdWVzdCA9IFdpbmRvd0ludGVyZmFjZS5nZXRYTUxIdHRwUmVxdWVzdCh3aW4pO1xuICAgIGlmICghWE1MSHR0cFJlcXVlc3QpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgaWYgKCEoJ3dpdGhDcmVkZW50aWFscycgaW4geGhyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBMb29rcyBsaWtlIFhIUiBsZXZlbCAxIC0gQ09SUyBpcyBub3Qgc3VwcG9ydGVkLlxuICAgIH1cbiAgICB4aHIub3BlbignUE9TVCcsIHJlcXVlc3QudXJsLCB0cnVlKTtcbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAgIC8vIFByZXZlbnQgcHJlLWZsaWdodCBIRUFEIHJlcXVlc3QuXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L3BsYWluJyk7XG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgZGV2KCkuZmluZShUQUdfLCAnU2VudCBYSFIgcmVxdWVzdCcsIHJlcXVlc3QudXJsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLnNlbmQocmVxdWVzdC5wYXlsb2FkIHx8ICcnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0geyFSZXF1ZXN0RGVmfSByZXF1ZXN0XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgc3RhdGljIGZvcndhcmRSZXF1ZXN0VG9BbXBTY3JpcHQoYW1wZG9jLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnNjcmlwdEZvckRvY09yTnVsbChhbXBkb2MpLnRoZW4oKGFtcFNjcmlwdFNlcnZpY2UpID0+IHtcbiAgICAgIHVzZXJBc3NlcnQoYW1wU2NyaXB0U2VydmljZSwgJ0FNUC1TQ1JJUFQgaXMgbm90IGluc3RhbGxlZCcpO1xuICAgICAgYW1wU2NyaXB0U2VydmljZS5mZXRjaChyZXF1ZXN0LnVybCwgSlNPTi5wYXJzZShyZXF1ZXN0LnBheWxvYWQpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIG1ldGhvZCB0aGF0IHdyYXBzIGEgZnVuY3Rpb24gYW5kIGNhY2hlIGl0cyByZXR1cm4gdmFsdWUuXG4gKlxuICogQHBhcmFtIHshRnVuY3Rpb259IGZ1bmMgdGhlIGZ1bmN0aW9uIHRvIGNhY2hlXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNhY2hlRnVuY1Jlc3VsdChmdW5jKSB7XG4gIGNvbnN0IGNhY2hlZFZhbHVlID0ge307XG4gIHJldHVybiAoYXJnKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gU3RyaW5nKGFyZyk7XG4gICAgaWYgKGNhY2hlZFZhbHVlW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY2FjaGVkVmFsdWVba2V5XSA9IGZ1bmMoYXJnKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZFZhbHVlW2tleV07XG4gIH07XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/transport.js