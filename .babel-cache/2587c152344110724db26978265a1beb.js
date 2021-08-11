function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
BatchSegmentDef,
RequestDef,
TransportSerializerDef,
TransportSerializers,
defaultSerializer } from "./transport-serializer";

import { IframeTransport } from "./iframe-transport";
import { Services } from "../../../src/service";
import { WindowInterface } from "../../../src/core/window/interface";
import {
assertHttpsUrl,
checkCorsUrl,
isAmpScriptUri,
parseUrlDeprecated } from "../../../src/url";

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
  function Transport(ampdoc) {var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /** @type {!JsonObject} */(({}));_classCallCheck(this, Transport);
    /** @private {!AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!JsonObject} */
    this.options_ = options;

    /** @private {string|undefined} */
    this.referrerPolicy_ = /** @type {string|undefined} */(
    this.options_['referrerPolicy']);


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
   */_createClass(Transport, [{ key: "sendRequest", value:
    function sendRequest(url, segments, inBatch) {
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
        var request = inBatch ?
        serializer.generateBatchRequest(url, segments, withPayload) :
        serializer.generateRequest(url, segments[0], withPayload);
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
          payload: getRequest(true).payload });

        return;
      }

      if (
      this.options_['beacon'] &&
      Transport.sendRequestUsingBeacon(this.win_, getRequest(this.useBody_)))
      {
        return;
      }
      if (
      this.options_['xhrpost'] &&
      Transport.sendRequestUsingXhr(this.win_, getRequest(this.useBody_)))
      {
        return;
      }
      var image = this.options_['image'];
      if (image) {
        var suppressWarnings =
        _typeof(image) == 'object' && image['suppressWarnings'];
        Transport.sendRequestUsingImage(
        this.win_,
        getRequest(false),
        suppressWarnings,
        /** @type {string|undefined} */(this.referrerPolicy_));

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
     */ }, { key: "maybeInitIframeTransport", value:
    function maybeInitIframeTransport(element) {
      if (!this.options_['iframe'] || this.iframeTransport_) {
        return;
      }

      // In the case of FIE rendering, we should be using the parent doc win.
      var topWin = getTopWindow(toWin(element.ownerDocument.defaultView));
      var type = element.getAttribute('type');
      // In inabox there is no amp-ad element.
      var ampAdResourceId = this.isInabox_ ?
      '1' :
      user().assertString(
      getAmpAdResourceId(element, topWin),
      'No friendly amp-ad ancestor element was found ' +
      'for amp-analytics tag with iframe transport.');


      this.iframeTransport_ = new IframeTransport(
      topWin,
      type,
      this.options_,
      ampAdResourceId);

    }

    /**
     * Deletes iframe transport.
     */ }, { key: "deleteIframeTransport", value:
    function deleteIframeTransport() {
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
     */ }, { key: "sendRequestUsingIframe", value:
    function sendRequestUsingIframe(url, segment) {var _this = this;
      var request = defaultSerializer(url, [segment]);
      if (!request) {
        user().error(TAG_, 'Request not sent. Contents empty.');
        return;
      }

      assertHttpsUrl(request, 'amp-analytics request');
      userAssert(
      parseUrlDeprecated(request).origin !=
      parseUrlDeprecated(this.win_.location.href).origin,
      'Origin of iframe request must not be equal to the document origin.' +
      ' See https://github.com/ampproject/' +
      'amphtml/blob/main/docs/spec/amp-iframe-origin-policy.md for details.');


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
     */ }, { key: "getSerializer_", value:
    function getSerializer_() {
      return (/** @type {!TransportSerializerDef} */(
        TransportSerializers['default']));

    }

    /**
     * @param {!Window} win
     * @param {!RequestDef} request
     * @param {boolean} suppressWarnings
     * @param {string|undefined} referrerPolicy
     */ }], [{ key: "sendRequestUsingImage", value:
    function sendRequestUsingImage(win, request, suppressWarnings, referrerPolicy) {
      if (!win) {
        return;
      }
      var image = createPixel(win, request.url, referrerPolicy);
      loadPromise(image).
      then(function () {
        dev().fine(TAG_, 'Sent image request', request.url);
      }).
      catch(function () {
        if (!suppressWarnings) {
          user().warn(
          TAG_,
          'Response unparseable or failed to send image request',
          request.url);

        }
      });
    }

    /**
     * @param {!Window} win
     * @param {!RequestDef} request
     * @return {boolean} True if this browser supports navigator.sendBeacon.
     */ }, { key: "sendRequestUsingBeacon", value:
    function sendRequestUsingBeacon(win, request) {
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
     */ }, { key: "sendRequestUsingXhr", value:
    function sendRequestUsingXhr(win, request) {
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
     */ }, { key: "forwardRequestToAmpScript", value:
    function forwardRequestToAmpScript(ampdoc, request) {
      return Services.scriptForDocOrNull(ampdoc).then(function (ampScriptService) {
        userAssert(ampScriptService, 'AMP-SCRIPT is not installed');
        ampScriptService.fetch(request.url, JSON.parse(request.payload));
      });
    } }]);return Transport;}();


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
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/transport.js