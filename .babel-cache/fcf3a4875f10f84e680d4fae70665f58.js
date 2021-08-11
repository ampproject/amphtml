function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { CONSTANTS, MessageType } from "../../../src/3p-frame-messaging";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Deferred } from "../../../src/core/data-structures/promise";
import { LegacyAdIntersectionObserverHost } from "./legacy-ad-intersection-observer-host";
import { Services } from "../../../src/service";
import { SubscriptionApi, listenFor, listenForOncePromise, postMessageToWindows } from "../../../src/iframe-helper";
import { applyFillContent } from "../../../src/core/dom/layout";
import { dev, devAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getData } from "../../../src/event-helper";
import { getHtml } from "../../../src/core/dom/get-html";
import { isExperimentOn } from "../../../src/experiments";
import { isGoogleAdsA4AValidEnvironment } from "../../../ads/google/a4a/utils";
import { removeElement } from "../../../src/core/dom";
import { reportErrorToAnalytics } from "../../../src/error-reporting";
import { setStyle } from "../../../src/core/dom/style";
import { throttle } from "../../../src/core/types/function";
var VISIBILITY_TIMEOUT = 10000;
var MIN_INABOX_POSITION_EVENT_INTERVAL = 100;

/** @type {string} */
var TAG = 'amp-ad-xorigin-iframe';
export var AmpAdXOriginIframeHandler = /*#__PURE__*/function () {
  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   */
  function AmpAdXOriginIframeHandler(baseInstance) {
    _classCallCheck(this, AmpAdXOriginIframeHandler);

    /** @private {!Window} */
    this.win_ = baseInstance.win;

    /** @private */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private {?./amp-ad-ui.AmpAdUIHandler} */
    this.uiHandler_ = baseInstance.uiHandler;

    /** @type {?HTMLIFrameElement} iframe instance */
    this.iframe = null;

    /** @private {?LegacyAdIntersectionObserverHost} */
    this.legacyIntersectionObserverApiHost_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {?SubscriptionApi} */
    this.inaboxPositionApi_ = null;

    /** @private {boolean} */
    this.isInaboxPositionApiInit_ = false;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.baseInstance_.getAmpDoc());

    /** @private {boolean} */
    this.inViewport_ = false;

    /** @private {boolean} */
    this.sendPositionPending_ = false;
  }

  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!HTMLIFrameElement} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @param {boolean=} opt_letCreativeTriggerRenderStart Whether to wait for
   *    render start from the creative, or simply trigger it in here.
   * @return {!Promise} awaiting render complete promise
   */
  _createClass(AmpAdXOriginIframeHandler, [{
    key: "init",
    value: function init(iframe, opt_isA4A, opt_letCreativeTriggerRenderStart) {
      var _this = this;

      devAssert(!this.iframe, 'multiple invocations of init without destroy!');
      this.iframe = iframe;
      this.iframe.setAttribute('scrolling', 'no');

      if (!this.uiHandler_.isStickyAd()) {
        applyFillContent(this.iframe);
      }

      var timer = Services.timerFor(this.baseInstance_.win);
      // Init the legacy observeInterection API service.
      // (Behave like position observer)
      this.legacyIntersectionObserverApiHost_ = new LegacyAdIntersectionObserverHost(this.baseInstance_, this.iframe);
      this.embedStateApi_ = new SubscriptionApi(this.iframe, 'send-embed-state', true, function () {
        return _this.sendEmbedInfo_(_this.inViewport_);
      });

      // Enable creative position observer if inabox experiment enabled OR
      // adsense running on non-CDN cache where AMP creatives are xdomained and
      // may require this information.
      if (isExperimentOn(this.win_, 'inabox-position-api') || /^adsense$/i.test(this.element_.getAttribute('type')) && !isGoogleAdsA4AValidEnvironment(this.win_)) {
        // To provide position to inabox.
        this.inaboxPositionApi_ = new SubscriptionApi(this.iframe, MessageType.SEND_POSITIONS, true, function () {
          // TODO(@zhouyx): Make sendPosition_ only send to
          // message origin iframe
          _this.sendPosition_();

          _this.registerPosition_();
        });
      }

      // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
      // iframe.
      listenForOncePromise(this.iframe, 'entity-id', true).then(function (info) {
        _this.element_.creativeId = info.data['id'];
      });
      this.handleOneTimeRequest_(MessageType.GET_HTML, function (payload) {
        var selector = payload['selector'];
        var attributes = payload['attributes'];
        var content = '';

        if (_this.element_.hasAttribute('data-html-access-allowed')) {
          content = getHtml(_this.baseInstance_.win, selector, attributes);
        }

        return Promise.resolve(content);
      });
      this.handleOneTimeRequest_(MessageType.GET_CONSENT_STATE, function () {
        return _this.baseInstance_.getConsentState().then(function (consentState) {
          return {
            consentState: consentState
          };
        });
      });
      // Install iframe resize API.
      this.unlisteners_.push(listenFor(this.iframe, 'embed-size', function (data, source, origin, event) {
        if (!!data['hasOverflow']) {
          _this.element_.warnOnMissingOverflow = false;
        }

        _this.handleResize_(data['id'], data['height'], data['width'], source, origin, event);
      }, true, true));

      if (this.uiHandler_.isStickyAd()) {
        setStyle(iframe, 'pointer-events', 'none');
        this.unlisteners_.push(listenFor(this.iframe, 'signal-interactive', function () {
          setStyle(iframe, 'pointer-events', 'auto');
        }, true, true));
      }

      this.unlisteners_.push(this.baseInstance_.getAmpDoc().onVisibilityChanged(function () {
        _this.sendEmbedInfo_(_this.inViewport_);
      }));
      this.unlisteners_.push(listenFor(this.iframe, MessageType.USER_ERROR_IN_IFRAME, function (data) {
        _this.userErrorForAnalytics_(data['message'], data['expected'] == true);
      }, true, true
      /* opt_includingNestedWindows */
      ));
      // Iframe.onload normally called by the Ad after full load.
      var iframeLoadPromise = this.baseInstance_.loadPromise(this.iframe).then(function () {
        // Wait just a little to allow `no-content` message to arrive.
        if (_this.iframe) {
          // Chrome does not reflect the iframe readystate.
          _this.iframe.readyState = 'complete';
        }

        return timer.promise(10);
      });

      // Calculate render-start and no-content signals.
      var _Deferred = new Deferred(),
          renderStartPromise = _Deferred.promise,
          renderStartResolve = _Deferred.resolve;

      var _Deferred2 = new Deferred(),
          noContentPromise = _Deferred2.promise,
          noContentResolve = _Deferred2.resolve;

      if (this.baseInstance_.config && this.baseInstance_.config.renderStartImplemented) {
        // When `render-start` is supported, these signals are mutually
        // exclusive. Whichever arrives first wins.
        listenForOncePromise(this.iframe, ['render-start', 'no-content'], true).then(function (info) {
          var data = info.data;

          if (data['type'] == 'render-start') {
            _this.renderStartMsgHandler_(info);

            renderStartResolve();
          } else {
            _this.noContent_();

            noContentResolve();
          }
        });
      } else {
        // If `render-start` is not supported, listen to `bootstrap-loaded`.
        // This will avoid keeping the Ad empty until it's fully loaded, which
        // could be a long time.
        listenForOncePromise(this.iframe, 'bootstrap-loaded', true).then(function () {
          renderStartResolve();
        });
        // Likewise, no-content is observed here. However, it's impossible to
        // assure exclusivity between `no-content` and `bootstrap-loaded` b/c
        // `bootstrap-loaded` always arrives first.
        listenForOncePromise(this.iframe, 'no-content', true).then(function () {
          _this.noContent_();

          noContentResolve();
        });
      }

      // Wait for initial load signal. Notice that this signal is not
      // used to resolve the final layout promise because iframe may still be
      // consuming significant network and CPU resources.
      listenForOncePromise(this.iframe, CommonSignals.INI_LOAD, true).then(function () {
        // TODO(dvoytenko, #7788): ensure that in-a-box "ini-load" message is
        // received here as well.
        _this.baseInstance_.signals().signal(CommonSignals.INI_LOAD);
      });
      this.element_.appendChild(this.iframe);

      if (opt_isA4A && !opt_letCreativeTriggerRenderStart) {
        // A4A writes creative frame directly to page once creative is received
        // and therefore does not require render start message so attach and
        // impose no loader delay.  Network is using renderStart or
        // bootstrap-loaded to indicate ad request was sent, either way we know
        // that occurred for Fast Fetch.
        this.baseInstance_.renderStarted();
        renderStartResolve();
      } else {
        // Set iframe initially hidden which will be removed on render-start or
        // load, whichever is earlier.
        setStyle(this.iframe, 'visibility', 'hidden');
      }

      // If A4A where creative is responsible for triggering render start (e.g
      // no fill for sticky ad case), only trigger if renderStart listener promise
      // explicitly fired (though we do not expect this to occur for A4A).
      var triggerRenderStartPromise = opt_isA4A && opt_letCreativeTriggerRenderStart ? renderStartPromise : Promise.race([renderStartPromise, iframeLoadPromise, timer.promise(VISIBILITY_TIMEOUT)]);
      triggerRenderStartPromise.then(function () {
        // Common signal RENDER_START invoked at toggle visibility time
        // Note: 'render-start' msg and common signal RENDER_START are different
        // 'render-start' msg is a way for implemented Ad to display ad earlier
        // RENDER_START signal is a signal to inform AMP runtime and other AMP
        // elements that the component visibility has been toggled on.
        _this.baseInstance_.renderStarted();

        if (_this.iframe) {
          setStyle(_this.iframe, 'visibility', '');
        }
      });
      // The actual ad load is eariliest of iframe.onload event and no-content.
      return Promise.race([iframeLoadPromise, noContentPromise]);
    }
    /**
     * @param {string} requestType
     * @param {function(*)} getter
     * @private
     */

  }, {
    key: "handleOneTimeRequest_",
    value: function handleOneTimeRequest_(requestType, getter) {
      var _this2 = this;

      this.unlisteners_.push(listenFor(this.iframe, requestType, function (info, source, origin) {
        if (!_this2.iframe) {
          return;
        }

        var messageId = info[CONSTANTS.messageIdFieldName];
        var payload = info[CONSTANTS.payloadFieldName];
        getter(payload).then(function (content) {
          var result = dict();
          result[CONSTANTS.messageIdFieldName] = messageId;
          result[CONSTANTS.contentFieldName] = content;
          postMessageToWindows(dev().assertElement(_this2.iframe), [{
            win: source,
            origin: origin
          }], requestType + CONSTANTS.responseTypeSuffix, result, true);
        });
      }, true
      /* opt_is3P */
      , false
      /* opt_includingNestedWindows */
      ));
    }
    /**
     * callback functon on receiving render-start
     * @param {{data: !JsonObject}} info
     * @private
     */

  }, {
    key: "renderStartMsgHandler_",
    value: function renderStartMsgHandler_(info) {
      var data = getData(info);
      this.handleResize_(undefined, data['height'], data['width'], info['source'], info['origin'], info['event']);
    }
    /**
     * Cleans up the listeners on the cross domain ad iframe and frees the
     * iframe resource.
     * @param {boolean=} opt_keep
     */

  }, {
    key: "freeXOriginIframe",
    value: function freeXOriginIframe(opt_keep) {
      this.cleanup_();

      // If ask to keep the iframe.
      // Use in the case of no-content and iframe is a master iframe.
      if (opt_keep) {
        return;
      }

      if (this.iframe) {
        removeElement(this.iframe);
        this.iframe = null;
      }
    }
    /**
     * Cleans up listeners on the ad, and apply the default UI for ad.
     * @private
     */

  }, {
    key: "noContent_",
    value: function noContent_() {
      if (!this.iframe) {
        // unlayout already called
        return;
      }

      this.freeXOriginIframe(this.iframe.name.indexOf('_master') >= 0);
      this.uiHandler_.applyNoContentUI();
    }
    /**
     * Cleans up listeners on the ad iframe.
     * @private
     */

  }, {
    key: "cleanup_",
    value: function cleanup_() {
      this.unlisteners_.forEach(function (unlistener) {
        return unlistener();
      });
      this.unlisteners_.length = 0;

      if (this.embedStateApi_) {
        this.embedStateApi_.destroy();
        this.embedStateApi_ = null;
      }

      if (this.inaboxPositionApi_) {
        this.inaboxPositionApi_.destroy();
        this.inaboxPositionApi_ = null;
      }

      if (this.legacyIntersectionObserverApiHost_) {
        this.legacyIntersectionObserverApiHost_.destroy();
        this.legacyIntersectionObserverApiHost_ = null;
      }
    }
    /**
     * Updates the element's dimensions to accommodate the iframe's
     * requested dimensions. Notifies the window that request the resize
     * of success or failure.
     * @param {number|undefined} id
     * @param {number|string|undefined} height
     * @param {number|string|undefined} width
     * @param {!Window} source
     * @param {string} origin
     * @param {!MessageEvent} event
     * @private
     */

  }, {
    key: "handleResize_",
    value: function handleResize_(id, height, width, source, origin, event) {
      var _this3 = this;

      this.baseInstance_.getVsync().mutate(function () {
        if (!_this3.iframe) {
          // iframe can be cleanup before vsync.
          return;
        }

        var iframeHeight = _this3.iframe.
        /*OK*/
        offsetHeight;
        var iframeWidth = _this3.iframe.
        /*OK*/
        offsetWidth;

        _this3.uiHandler_.updateSize(height, width, iframeHeight, iframeWidth, event).then(function (info) {
          _this3.uiHandler_.onResizeSuccess();

          _this3.sendEmbedSizeResponse_(info.success, id, info.newWidth, info.newHeight, source, origin);
        }, function () {});
      });
    }
    /**
     * Sends a response to the window which requested a resize.
     * @param {boolean} success
     * @param {number|undefined} id
     * @param {number} requestedWidth
     * @param {number} requestedHeight
     * @param {!Window} source
     * @param {string} origin
     * @private
     */

  }, {
    key: "sendEmbedSizeResponse_",
    value: function sendEmbedSizeResponse_(success, id, requestedWidth, requestedHeight, source, origin) {
      // The iframe may have been removed by the time we resize.
      if (!this.iframe) {
        return;
      }

      postMessageToWindows(this.iframe, [{
        win: source,
        origin: origin
      }], success ? 'embed-size-changed' : 'embed-size-denied', dict({
        'id': id,
        'requestedWidth': requestedWidth,
        'requestedHeight': requestedHeight
      }), true);
    }
    /**
     * @param {boolean} inViewport
     * @private
     */

  }, {
    key: "sendEmbedInfo_",
    value: function sendEmbedInfo_(inViewport) {
      if (!this.embedStateApi_) {
        return;
      }

      this.embedStateApi_.send('embed-state', dict({
        'inViewport': inViewport,
        'pageHidden': !this.baseInstance_.getAmpDoc().isVisible()
      }));
    }
    /**
     * Retrieve iframe position entry in next animation frame.
     * @return {*} TODO(#23582): Specify return type
     * @private
     */

  }, {
    key: "getIframePositionPromise_",
    value: function getIframePositionPromise_() {
      var _this4 = this;

      return this.viewport_.getClientRectAsync(dev().assertElement(this.iframe)).then(function (position) {
        devAssert(position, 'element clientRect should intersects with root clientRect');

        var viewport = _this4.viewport_.getRect();

        return dict({
          'targetRect': position,
          'viewportRect': viewport
        });
      });
    }
    /** @private */

  }, {
    key: "sendPosition_",
    value: function sendPosition_() {
      var _this5 = this;

      if (this.sendPositionPending_) {
        // Only send once in single animation frame.
        return;
      }

      this.sendPositionPending_ = true;
      this.getIframePositionPromise_().then(function (position) {
        _this5.sendPositionPending_ = false;

        _this5.inaboxPositionApi_.send(MessageType.POSITION, position);
      });
    }
    /** @private */

  }, {
    key: "registerPosition_",
    value: function registerPosition_() {
      var _this6 = this;

      if (this.isInaboxPositionApiInit_) {
        // only register to viewport scroll/resize once
        return;
      }

      this.isInaboxPositionApiInit_ = true;
      // Send window scroll/resize event to viewport.
      this.unlisteners_.push(this.viewport_.onScroll(throttle(this.win_, function () {
        _this6.getIframePositionPromise_().then(function (position) {
          _this6.inaboxPositionApi_.send(MessageType.POSITION, position);
        });
      }, MIN_INABOX_POSITION_EVENT_INTERVAL)));
      this.unlisteners_.push(this.viewport_.onResize(function () {
        _this6.getIframePositionPromise_().then(function (position) {
          _this6.inaboxPositionApi_.send(MessageType.POSITION, position);
        });
      }));
    }
    /**
     * See BaseElement method.
     * @param {boolean} inViewport
     */

  }, {
    key: "viewportCallback",
    value: function viewportCallback(inViewport) {
      this.inViewport_ = inViewport;
      this.sendEmbedInfo_(inViewport);
    }
    /**
     * See BaseElement method.
     */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {
      // When the framework has the need to remeasure us, our position might
      // have changed. Send an intersection record if needed.
      if (this.legacyIntersectionObserverApiHost_) {
        this.legacyIntersectionObserverApiHost_.fire();
      }
    }
    /**
     * @param {string} message
     * @param {boolean} expected
     * @private
     */

  }, {
    key: "userErrorForAnalytics_",
    value: function userErrorForAnalytics_(message, expected) {
      if (typeof message != 'string') {
        return;
      }

      if (expected) {
        dev().expectedError(TAG, message);
      } else {
        var e = new Error(message);
        e.name = '3pError';
        reportErrorToAnalytics(e, this.baseInstance_.win);
      }
    }
  }]);

  return AmpAdXOriginIframeHandler;
}();
// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC14b3JpZ2luLWlmcmFtZS1oYW5kbGVyLmpzIl0sIm5hbWVzIjpbIkNPTlNUQU5UUyIsIk1lc3NhZ2VUeXBlIiwiQ29tbW9uU2lnbmFscyIsIkRlZmVycmVkIiwiTGVnYWN5QWRJbnRlcnNlY3Rpb25PYnNlcnZlckhvc3QiLCJTZXJ2aWNlcyIsIlN1YnNjcmlwdGlvbkFwaSIsImxpc3RlbkZvciIsImxpc3RlbkZvck9uY2VQcm9taXNlIiwicG9zdE1lc3NhZ2VUb1dpbmRvd3MiLCJhcHBseUZpbGxDb250ZW50IiwiZGV2IiwiZGV2QXNzZXJ0IiwiZGljdCIsImdldERhdGEiLCJnZXRIdG1sIiwiaXNFeHBlcmltZW50T24iLCJpc0dvb2dsZUFkc0E0QVZhbGlkRW52aXJvbm1lbnQiLCJyZW1vdmVFbGVtZW50IiwicmVwb3J0RXJyb3JUb0FuYWx5dGljcyIsInNldFN0eWxlIiwidGhyb3R0bGUiLCJWSVNJQklMSVRZX1RJTUVPVVQiLCJNSU5fSU5BQk9YX1BPU0lUSU9OX0VWRU5UX0lOVEVSVkFMIiwiVEFHIiwiQW1wQWRYT3JpZ2luSWZyYW1lSGFuZGxlciIsImJhc2VJbnN0YW5jZSIsIndpbl8iLCJ3aW4iLCJiYXNlSW5zdGFuY2VfIiwiZWxlbWVudF8iLCJlbGVtZW50IiwidWlIYW5kbGVyXyIsInVpSGFuZGxlciIsImlmcmFtZSIsImxlZ2FjeUludGVyc2VjdGlvbk9ic2VydmVyQXBpSG9zdF8iLCJlbWJlZFN0YXRlQXBpXyIsImluYWJveFBvc2l0aW9uQXBpXyIsImlzSW5hYm94UG9zaXRpb25BcGlJbml0XyIsInVubGlzdGVuZXJzXyIsInZpZXdwb3J0XyIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0QW1wRG9jIiwiaW5WaWV3cG9ydF8iLCJzZW5kUG9zaXRpb25QZW5kaW5nXyIsIm9wdF9pc0E0QSIsIm9wdF9sZXRDcmVhdGl2ZVRyaWdnZXJSZW5kZXJTdGFydCIsInNldEF0dHJpYnV0ZSIsImlzU3RpY2t5QWQiLCJ0aW1lciIsInRpbWVyRm9yIiwic2VuZEVtYmVkSW5mb18iLCJ0ZXN0IiwiZ2V0QXR0cmlidXRlIiwiU0VORF9QT1NJVElPTlMiLCJzZW5kUG9zaXRpb25fIiwicmVnaXN0ZXJQb3NpdGlvbl8iLCJ0aGVuIiwiaW5mbyIsImNyZWF0aXZlSWQiLCJkYXRhIiwiaGFuZGxlT25lVGltZVJlcXVlc3RfIiwiR0VUX0hUTUwiLCJwYXlsb2FkIiwic2VsZWN0b3IiLCJhdHRyaWJ1dGVzIiwiY29udGVudCIsImhhc0F0dHJpYnV0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiR0VUX0NPTlNFTlRfU1RBVEUiLCJnZXRDb25zZW50U3RhdGUiLCJjb25zZW50U3RhdGUiLCJwdXNoIiwic291cmNlIiwib3JpZ2luIiwiZXZlbnQiLCJ3YXJuT25NaXNzaW5nT3ZlcmZsb3ciLCJoYW5kbGVSZXNpemVfIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsIlVTRVJfRVJST1JfSU5fSUZSQU1FIiwidXNlckVycm9yRm9yQW5hbHl0aWNzXyIsImlmcmFtZUxvYWRQcm9taXNlIiwibG9hZFByb21pc2UiLCJyZWFkeVN0YXRlIiwicHJvbWlzZSIsInJlbmRlclN0YXJ0UHJvbWlzZSIsInJlbmRlclN0YXJ0UmVzb2x2ZSIsIm5vQ29udGVudFByb21pc2UiLCJub0NvbnRlbnRSZXNvbHZlIiwiY29uZmlnIiwicmVuZGVyU3RhcnRJbXBsZW1lbnRlZCIsInJlbmRlclN0YXJ0TXNnSGFuZGxlcl8iLCJub0NvbnRlbnRfIiwiSU5JX0xPQUQiLCJzaWduYWxzIiwic2lnbmFsIiwiYXBwZW5kQ2hpbGQiLCJyZW5kZXJTdGFydGVkIiwidHJpZ2dlclJlbmRlclN0YXJ0UHJvbWlzZSIsInJhY2UiLCJyZXF1ZXN0VHlwZSIsImdldHRlciIsIm1lc3NhZ2VJZCIsIm1lc3NhZ2VJZEZpZWxkTmFtZSIsInBheWxvYWRGaWVsZE5hbWUiLCJyZXN1bHQiLCJjb250ZW50RmllbGROYW1lIiwiYXNzZXJ0RWxlbWVudCIsInJlc3BvbnNlVHlwZVN1ZmZpeCIsInVuZGVmaW5lZCIsIm9wdF9rZWVwIiwiY2xlYW51cF8iLCJmcmVlWE9yaWdpbklmcmFtZSIsIm5hbWUiLCJpbmRleE9mIiwiYXBwbHlOb0NvbnRlbnRVSSIsImZvckVhY2giLCJ1bmxpc3RlbmVyIiwibGVuZ3RoIiwiZGVzdHJveSIsImlkIiwiaGVpZ2h0Iiwid2lkdGgiLCJnZXRWc3luYyIsIm11dGF0ZSIsImlmcmFtZUhlaWdodCIsIm9mZnNldEhlaWdodCIsImlmcmFtZVdpZHRoIiwib2Zmc2V0V2lkdGgiLCJ1cGRhdGVTaXplIiwib25SZXNpemVTdWNjZXNzIiwic2VuZEVtYmVkU2l6ZVJlc3BvbnNlXyIsInN1Y2Nlc3MiLCJuZXdXaWR0aCIsIm5ld0hlaWdodCIsInJlcXVlc3RlZFdpZHRoIiwicmVxdWVzdGVkSGVpZ2h0IiwiaW5WaWV3cG9ydCIsInNlbmQiLCJpc1Zpc2libGUiLCJnZXRDbGllbnRSZWN0QXN5bmMiLCJwb3NpdGlvbiIsInZpZXdwb3J0IiwiZ2V0UmVjdCIsImdldElmcmFtZVBvc2l0aW9uUHJvbWlzZV8iLCJQT1NJVElPTiIsIm9uU2Nyb2xsIiwib25SZXNpemUiLCJmaXJlIiwibWVzc2FnZSIsImV4cGVjdGVkIiwiZXhwZWN0ZWRFcnJvciIsImUiLCJFcnJvciIsIkFNUCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsU0FBUixFQUFtQkMsV0FBbkI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLGdDQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLGVBREYsRUFFRUMsU0FGRixFQUdFQyxvQkFIRixFQUlFQyxvQkFKRjtBQU1BLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLDhCQUFSO0FBQ0EsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFFQSxJQUFNQyxrQkFBa0IsR0FBRyxLQUEzQjtBQUVBLElBQU1DLGtDQUFrQyxHQUFHLEdBQTNDOztBQUVBO0FBQ0EsSUFBTUMsR0FBRyxHQUFHLHVCQUFaO0FBRUEsV0FBYUMseUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxxQ0FBWUMsWUFBWixFQUEwQjtBQUFBOztBQUN4QjtBQUNBLFNBQUtDLElBQUwsR0FBWUQsWUFBWSxDQUFDRSxHQUF6Qjs7QUFFQTtBQUNBLFNBQUtDLGFBQUwsR0FBcUJILFlBQXJCOztBQUVBO0FBQ0EsU0FBS0ksUUFBTCxHQUFnQkosWUFBWSxDQUFDSyxPQUE3Qjs7QUFFQTtBQUNBLFNBQUtDLFVBQUwsR0FBa0JOLFlBQVksQ0FBQ08sU0FBL0I7O0FBRUE7QUFDQSxTQUFLQyxNQUFMLEdBQWMsSUFBZDs7QUFFQTtBQUNBLFNBQUtDLGtDQUFMLEdBQTBDLElBQTFDOztBQUVBO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixJQUF0Qjs7QUFFQTtBQUNBLFNBQUtDLGtCQUFMLEdBQTBCLElBQTFCOztBQUVBO0FBQ0EsU0FBS0Msd0JBQUwsR0FBZ0MsS0FBaEM7O0FBRUE7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLEVBQXBCOztBQUVBO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQm5DLFFBQVEsQ0FBQ29DLGNBQVQsQ0FBd0IsS0FBS1osYUFBTCxDQUFtQmEsU0FBbkIsRUFBeEIsQ0FBakI7O0FBRUE7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLEtBQW5COztBQUVBO0FBQ0EsU0FBS0Msb0JBQUwsR0FBNEIsS0FBNUI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcERBO0FBQUE7QUFBQSxXQXFERSxjQUFLVixNQUFMLEVBQWFXLFNBQWIsRUFBd0JDLGlDQUF4QixFQUEyRDtBQUFBOztBQUN6RGxDLE1BQUFBLFNBQVMsQ0FBQyxDQUFDLEtBQUtzQixNQUFQLEVBQWUsK0NBQWYsQ0FBVDtBQUNBLFdBQUtBLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFdBQUtBLE1BQUwsQ0FBWWEsWUFBWixDQUF5QixXQUF6QixFQUFzQyxJQUF0Qzs7QUFDQSxVQUFJLENBQUMsS0FBS2YsVUFBTCxDQUFnQmdCLFVBQWhCLEVBQUwsRUFBbUM7QUFDakN0QyxRQUFBQSxnQkFBZ0IsQ0FBQyxLQUFLd0IsTUFBTixDQUFoQjtBQUNEOztBQUNELFVBQU1lLEtBQUssR0FBRzVDLFFBQVEsQ0FBQzZDLFFBQVQsQ0FBa0IsS0FBS3JCLGFBQUwsQ0FBbUJELEdBQXJDLENBQWQ7QUFFQTtBQUNBO0FBQ0EsV0FBS08sa0NBQUwsR0FDRSxJQUFJL0IsZ0NBQUosQ0FBcUMsS0FBS3lCLGFBQTFDLEVBQXlELEtBQUtLLE1BQTlELENBREY7QUFHQSxXQUFLRSxjQUFMLEdBQXNCLElBQUk5QixlQUFKLENBQ3BCLEtBQUs0QixNQURlLEVBRXBCLGtCQUZvQixFQUdwQixJQUhvQixFQUlwQjtBQUFBLGVBQU0sS0FBSSxDQUFDaUIsY0FBTCxDQUFvQixLQUFJLENBQUNSLFdBQXpCLENBQU47QUFBQSxPQUpvQixDQUF0Qjs7QUFPQTtBQUNBO0FBQ0E7QUFDQSxVQUNFM0IsY0FBYyxDQUFDLEtBQUtXLElBQU4sRUFBWSxxQkFBWixDQUFkLElBQ0MsYUFBYXlCLElBQWIsQ0FBa0IsS0FBS3RCLFFBQUwsQ0FBY3VCLFlBQWQsQ0FBMkIsTUFBM0IsQ0FBbEIsS0FDQyxDQUFDcEMsOEJBQThCLENBQUMsS0FBS1UsSUFBTixDQUhuQyxFQUlFO0FBQ0E7QUFDQSxhQUFLVSxrQkFBTCxHQUEwQixJQUFJL0IsZUFBSixDQUN4QixLQUFLNEIsTUFEbUIsRUFFeEJqQyxXQUFXLENBQUNxRCxjQUZZLEVBR3hCLElBSHdCLEVBSXhCLFlBQU07QUFDSjtBQUNBO0FBQ0EsVUFBQSxLQUFJLENBQUNDLGFBQUw7O0FBQ0EsVUFBQSxLQUFJLENBQUNDLGlCQUFMO0FBQ0QsU0FUdUIsQ0FBMUI7QUFXRDs7QUFDRDtBQUNBO0FBQ0FoRCxNQUFBQSxvQkFBb0IsQ0FBQyxLQUFLMEIsTUFBTixFQUFjLFdBQWQsRUFBMkIsSUFBM0IsQ0FBcEIsQ0FBcUR1QixJQUFyRCxDQUEwRCxVQUFDQyxJQUFELEVBQVU7QUFDbEUsUUFBQSxLQUFJLENBQUM1QixRQUFMLENBQWM2QixVQUFkLEdBQTJCRCxJQUFJLENBQUNFLElBQUwsQ0FBVSxJQUFWLENBQTNCO0FBQ0QsT0FGRDtBQUlBLFdBQUtDLHFCQUFMLENBQTJCNUQsV0FBVyxDQUFDNkQsUUFBdkMsRUFBaUQsVUFBQ0MsT0FBRCxFQUFhO0FBQzVELFlBQU1DLFFBQVEsR0FBR0QsT0FBTyxDQUFDLFVBQUQsQ0FBeEI7QUFDQSxZQUFNRSxVQUFVLEdBQUdGLE9BQU8sQ0FBQyxZQUFELENBQTFCO0FBQ0EsWUFBSUcsT0FBTyxHQUFHLEVBQWQ7O0FBQ0EsWUFBSSxLQUFJLENBQUNwQyxRQUFMLENBQWNxQyxZQUFkLENBQTJCLDBCQUEzQixDQUFKLEVBQTREO0FBQzFERCxVQUFBQSxPQUFPLEdBQUduRCxPQUFPLENBQUMsS0FBSSxDQUFDYyxhQUFMLENBQW1CRCxHQUFwQixFQUF5Qm9DLFFBQXpCLEVBQW1DQyxVQUFuQyxDQUFqQjtBQUNEOztBQUNELGVBQU9HLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQkgsT0FBaEIsQ0FBUDtBQUNELE9BUkQ7QUFVQSxXQUFLTCxxQkFBTCxDQUEyQjVELFdBQVcsQ0FBQ3FFLGlCQUF2QyxFQUEwRCxZQUFNO0FBQzlELGVBQU8sS0FBSSxDQUFDekMsYUFBTCxDQUFtQjBDLGVBQW5CLEdBQXFDZCxJQUFyQyxDQUEwQyxVQUFDZSxZQUFELEVBQWtCO0FBQ2pFLGlCQUFPO0FBQUNBLFlBQUFBLFlBQVksRUFBWkE7QUFBRCxXQUFQO0FBQ0QsU0FGTSxDQUFQO0FBR0QsT0FKRDtBQU1BO0FBQ0EsV0FBS2pDLFlBQUwsQ0FBa0JrQyxJQUFsQixDQUNFbEUsU0FBUyxDQUNQLEtBQUsyQixNQURFLEVBRVAsWUFGTyxFQUdQLFVBQUMwQixJQUFELEVBQU9jLE1BQVAsRUFBZUMsTUFBZixFQUF1QkMsS0FBdkIsRUFBaUM7QUFDL0IsWUFBSSxDQUFDLENBQUNoQixJQUFJLENBQUMsYUFBRCxDQUFWLEVBQTJCO0FBQ3pCLFVBQUEsS0FBSSxDQUFDOUIsUUFBTCxDQUFjK0MscUJBQWQsR0FBc0MsS0FBdEM7QUFDRDs7QUFDRCxRQUFBLEtBQUksQ0FBQ0MsYUFBTCxDQUNFbEIsSUFBSSxDQUFDLElBQUQsQ0FETixFQUVFQSxJQUFJLENBQUMsUUFBRCxDQUZOLEVBR0VBLElBQUksQ0FBQyxPQUFELENBSE4sRUFJRWMsTUFKRixFQUtFQyxNQUxGLEVBTUVDLEtBTkY7QUFRRCxPQWZNLEVBZ0JQLElBaEJPLEVBaUJQLElBakJPLENBRFg7O0FBc0JBLFVBQUksS0FBSzVDLFVBQUwsQ0FBZ0JnQixVQUFoQixFQUFKLEVBQWtDO0FBQ2hDNUIsUUFBQUEsUUFBUSxDQUFDYyxNQUFELEVBQVMsZ0JBQVQsRUFBMkIsTUFBM0IsQ0FBUjtBQUNBLGFBQUtLLFlBQUwsQ0FBa0JrQyxJQUFsQixDQUNFbEUsU0FBUyxDQUNQLEtBQUsyQixNQURFLEVBRVAsb0JBRk8sRUFHUCxZQUFNO0FBQ0pkLFVBQUFBLFFBQVEsQ0FBQ2MsTUFBRCxFQUFTLGdCQUFULEVBQTJCLE1BQTNCLENBQVI7QUFDRCxTQUxNLEVBTVAsSUFOTyxFQU9QLElBUE8sQ0FEWDtBQVdEOztBQUVELFdBQUtLLFlBQUwsQ0FBa0JrQyxJQUFsQixDQUNFLEtBQUs1QyxhQUFMLENBQW1CYSxTQUFuQixHQUErQnFDLG1CQUEvQixDQUFtRCxZQUFNO0FBQ3ZELFFBQUEsS0FBSSxDQUFDNUIsY0FBTCxDQUFvQixLQUFJLENBQUNSLFdBQXpCO0FBQ0QsT0FGRCxDQURGO0FBTUEsV0FBS0osWUFBTCxDQUFrQmtDLElBQWxCLENBQ0VsRSxTQUFTLENBQ1AsS0FBSzJCLE1BREUsRUFFUGpDLFdBQVcsQ0FBQytFLG9CQUZMLEVBR1AsVUFBQ3BCLElBQUQsRUFBVTtBQUNSLFFBQUEsS0FBSSxDQUFDcUIsc0JBQUwsQ0FDRXJCLElBQUksQ0FBQyxTQUFELENBRE4sRUFFRUEsSUFBSSxDQUFDLFVBQUQsQ0FBSixJQUFvQixJQUZ0QjtBQUlELE9BUk0sRUFTUCxJQVRPLEVBVVA7QUFBSztBQVZFLE9BRFg7QUFlQTtBQUNBLFVBQU1zQixpQkFBaUIsR0FBRyxLQUFLckQsYUFBTCxDQUN2QnNELFdBRHVCLENBQ1gsS0FBS2pELE1BRE0sRUFFdkJ1QixJQUZ1QixDQUVsQixZQUFNO0FBQ1Y7QUFDQSxZQUFJLEtBQUksQ0FBQ3ZCLE1BQVQsRUFBaUI7QUFDZjtBQUNBLFVBQUEsS0FBSSxDQUFDQSxNQUFMLENBQVlrRCxVQUFaLEdBQXlCLFVBQXpCO0FBQ0Q7O0FBQ0QsZUFBT25DLEtBQUssQ0FBQ29DLE9BQU4sQ0FBYyxFQUFkLENBQVA7QUFDRCxPQVR1QixDQUExQjs7QUFXQTtBQUNBLHNCQUNFLElBQUlsRixRQUFKLEVBREY7QUFBQSxVQUFnQm1GLGtCQUFoQixhQUFPRCxPQUFQO0FBQUEsVUFBNkNFLGtCQUE3QyxhQUFvQ2xCLE9BQXBDOztBQUVBLHVCQUNFLElBQUlsRSxRQUFKLEVBREY7QUFBQSxVQUFnQnFGLGdCQUFoQixjQUFPSCxPQUFQO0FBQUEsVUFBMkNJLGdCQUEzQyxjQUFrQ3BCLE9BQWxDOztBQUdBLFVBQ0UsS0FBS3hDLGFBQUwsQ0FBbUI2RCxNQUFuQixJQUNBLEtBQUs3RCxhQUFMLENBQW1CNkQsTUFBbkIsQ0FBMEJDLHNCQUY1QixFQUdFO0FBQ0E7QUFDQTtBQUNBbkYsUUFBQUEsb0JBQW9CLENBQ2xCLEtBQUswQixNQURhLEVBRWxCLENBQUMsY0FBRCxFQUFpQixZQUFqQixDQUZrQixFQUdsQixJQUhrQixDQUFwQixDQUlFdUIsSUFKRixDQUlPLFVBQUNDLElBQUQsRUFBVTtBQUNmLGNBQU9FLElBQVAsR0FBZUYsSUFBZixDQUFPRSxJQUFQOztBQUNBLGNBQUlBLElBQUksQ0FBQyxNQUFELENBQUosSUFBZ0IsY0FBcEIsRUFBb0M7QUFDbEMsWUFBQSxLQUFJLENBQUNnQyxzQkFBTCxDQUE0QmxDLElBQTVCOztBQUNBNkIsWUFBQUEsa0JBQWtCO0FBQ25CLFdBSEQsTUFHTztBQUNMLFlBQUEsS0FBSSxDQUFDTSxVQUFMOztBQUNBSixZQUFBQSxnQkFBZ0I7QUFDakI7QUFDRixTQWJEO0FBY0QsT0FwQkQsTUFvQk87QUFDTDtBQUNBO0FBQ0E7QUFDQWpGLFFBQUFBLG9CQUFvQixDQUFDLEtBQUswQixNQUFOLEVBQWMsa0JBQWQsRUFBa0MsSUFBbEMsQ0FBcEIsQ0FBNER1QixJQUE1RCxDQUFpRSxZQUFNO0FBQ3JFOEIsVUFBQUEsa0JBQWtCO0FBQ25CLFNBRkQ7QUFHQTtBQUNBO0FBQ0E7QUFDQS9FLFFBQUFBLG9CQUFvQixDQUFDLEtBQUswQixNQUFOLEVBQWMsWUFBZCxFQUE0QixJQUE1QixDQUFwQixDQUFzRHVCLElBQXRELENBQTJELFlBQU07QUFDL0QsVUFBQSxLQUFJLENBQUNvQyxVQUFMOztBQUNBSixVQUFBQSxnQkFBZ0I7QUFDakIsU0FIRDtBQUlEOztBQUVEO0FBQ0E7QUFDQTtBQUNBakYsTUFBQUEsb0JBQW9CLENBQUMsS0FBSzBCLE1BQU4sRUFBY2hDLGFBQWEsQ0FBQzRGLFFBQTVCLEVBQXNDLElBQXRDLENBQXBCLENBQWdFckMsSUFBaEUsQ0FBcUUsWUFBTTtBQUN6RTtBQUNBO0FBQ0EsUUFBQSxLQUFJLENBQUM1QixhQUFMLENBQW1Ca0UsT0FBbkIsR0FBNkJDLE1BQTdCLENBQW9DOUYsYUFBYSxDQUFDNEYsUUFBbEQ7QUFDRCxPQUpEO0FBTUEsV0FBS2hFLFFBQUwsQ0FBY21FLFdBQWQsQ0FBMEIsS0FBSy9ELE1BQS9COztBQUNBLFVBQUlXLFNBQVMsSUFBSSxDQUFDQyxpQ0FBbEIsRUFBcUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUtqQixhQUFMLENBQW1CcUUsYUFBbkI7QUFDQVgsUUFBQUEsa0JBQWtCO0FBQ25CLE9BUkQsTUFRTztBQUNMO0FBQ0E7QUFDQW5FLFFBQUFBLFFBQVEsQ0FBQyxLQUFLYyxNQUFOLEVBQWMsWUFBZCxFQUE0QixRQUE1QixDQUFSO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsVUFBTWlFLHlCQUF5QixHQUM3QnRELFNBQVMsSUFBSUMsaUNBQWIsR0FDSXdDLGtCQURKLEdBRUlsQixPQUFPLENBQUNnQyxJQUFSLENBQWEsQ0FDWGQsa0JBRFcsRUFFWEosaUJBRlcsRUFHWGpDLEtBQUssQ0FBQ29DLE9BQU4sQ0FBYy9ELGtCQUFkLENBSFcsQ0FBYixDQUhOO0FBUUE2RSxNQUFBQSx5QkFBeUIsQ0FBQzFDLElBQTFCLENBQStCLFlBQU07QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUEsS0FBSSxDQUFDNUIsYUFBTCxDQUFtQnFFLGFBQW5COztBQUNBLFlBQUksS0FBSSxDQUFDaEUsTUFBVCxFQUFpQjtBQUNmZCxVQUFBQSxRQUFRLENBQUMsS0FBSSxDQUFDYyxNQUFOLEVBQWMsWUFBZCxFQUE0QixFQUE1QixDQUFSO0FBQ0Q7QUFDRixPQVZEO0FBWUE7QUFDQSxhQUFPa0MsT0FBTyxDQUFDZ0MsSUFBUixDQUFhLENBQUNsQixpQkFBRCxFQUFvQk0sZ0JBQXBCLENBQWIsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUE3UkE7QUFBQTtBQUFBLFdBOFJFLCtCQUFzQmEsV0FBdEIsRUFBbUNDLE1BQW5DLEVBQTJDO0FBQUE7O0FBQ3pDLFdBQUsvRCxZQUFMLENBQWtCa0MsSUFBbEIsQ0FDRWxFLFNBQVMsQ0FDUCxLQUFLMkIsTUFERSxFQUVQbUUsV0FGTyxFQUdQLFVBQUMzQyxJQUFELEVBQU9nQixNQUFQLEVBQWVDLE1BQWYsRUFBMEI7QUFDeEIsWUFBSSxDQUFDLE1BQUksQ0FBQ3pDLE1BQVYsRUFBa0I7QUFDaEI7QUFDRDs7QUFFRCxZQUFNcUUsU0FBUyxHQUFHN0MsSUFBSSxDQUFDMUQsU0FBUyxDQUFDd0csa0JBQVgsQ0FBdEI7QUFDQSxZQUFNekMsT0FBTyxHQUFHTCxJQUFJLENBQUMxRCxTQUFTLENBQUN5RyxnQkFBWCxDQUFwQjtBQUVBSCxRQUFBQSxNQUFNLENBQUN2QyxPQUFELENBQU4sQ0FBZ0JOLElBQWhCLENBQXFCLFVBQUNTLE9BQUQsRUFBYTtBQUNoQyxjQUFNd0MsTUFBTSxHQUFHN0YsSUFBSSxFQUFuQjtBQUNBNkYsVUFBQUEsTUFBTSxDQUFDMUcsU0FBUyxDQUFDd0csa0JBQVgsQ0FBTixHQUF1Q0QsU0FBdkM7QUFDQUcsVUFBQUEsTUFBTSxDQUFDMUcsU0FBUyxDQUFDMkcsZ0JBQVgsQ0FBTixHQUFxQ3pDLE9BQXJDO0FBQ0F6RCxVQUFBQSxvQkFBb0IsQ0FDbEJFLEdBQUcsR0FBR2lHLGFBQU4sQ0FBb0IsTUFBSSxDQUFDMUUsTUFBekIsQ0FEa0IsRUFFbEIsQ0FBQztBQUFDTixZQUFBQSxHQUFHLEVBQUU4QyxNQUFOO0FBQWNDLFlBQUFBLE1BQU0sRUFBTkE7QUFBZCxXQUFELENBRmtCLEVBR2xCMEIsV0FBVyxHQUFHckcsU0FBUyxDQUFDNkcsa0JBSE4sRUFJbEJILE1BSmtCLEVBS2xCLElBTGtCLENBQXBCO0FBT0QsU0FYRDtBQVlELE9BdkJNLEVBd0JQO0FBQUs7QUF4QkUsUUF5QlA7QUFBTTtBQXpCQyxPQURYO0FBNkJEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFsVUE7QUFBQTtBQUFBLFdBbVVFLGdDQUF1QmhELElBQXZCLEVBQTZCO0FBQzNCLFVBQU1FLElBQUksR0FBRzlDLE9BQU8sQ0FBQzRDLElBQUQsQ0FBcEI7QUFDQSxXQUFLb0IsYUFBTCxDQUNFZ0MsU0FERixFQUVFbEQsSUFBSSxDQUFDLFFBQUQsQ0FGTixFQUdFQSxJQUFJLENBQUMsT0FBRCxDQUhOLEVBSUVGLElBQUksQ0FBQyxRQUFELENBSk4sRUFLRUEsSUFBSSxDQUFDLFFBQUQsQ0FMTixFQU1FQSxJQUFJLENBQUMsT0FBRCxDQU5OO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQW5WQTtBQUFBO0FBQUEsV0FvVkUsMkJBQWtCcUQsUUFBbEIsRUFBNEI7QUFDMUIsV0FBS0MsUUFBTDs7QUFDQTtBQUNBO0FBQ0EsVUFBSUQsUUFBSixFQUFjO0FBQ1o7QUFDRDs7QUFDRCxVQUFJLEtBQUs3RSxNQUFULEVBQWlCO0FBQ2ZoQixRQUFBQSxhQUFhLENBQUMsS0FBS2dCLE1BQU4sQ0FBYjtBQUNBLGFBQUtBLE1BQUwsR0FBYyxJQUFkO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXBXQTtBQUFBO0FBQUEsV0FxV0Usc0JBQWE7QUFDWCxVQUFJLENBQUMsS0FBS0EsTUFBVixFQUFrQjtBQUNoQjtBQUNBO0FBQ0Q7O0FBQ0QsV0FBSytFLGlCQUFMLENBQXVCLEtBQUsvRSxNQUFMLENBQVlnRixJQUFaLENBQWlCQyxPQUFqQixDQUF5QixTQUF6QixLQUF1QyxDQUE5RDtBQUNBLFdBQUtuRixVQUFMLENBQWdCb0YsZ0JBQWhCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFqWEE7QUFBQTtBQUFBLFdBa1hFLG9CQUFXO0FBQ1QsV0FBSzdFLFlBQUwsQ0FBa0I4RSxPQUFsQixDQUEwQixVQUFDQyxVQUFEO0FBQUEsZUFBZ0JBLFVBQVUsRUFBMUI7QUFBQSxPQUExQjtBQUNBLFdBQUsvRSxZQUFMLENBQWtCZ0YsTUFBbEIsR0FBMkIsQ0FBM0I7O0FBQ0EsVUFBSSxLQUFLbkYsY0FBVCxFQUF5QjtBQUN2QixhQUFLQSxjQUFMLENBQW9Cb0YsT0FBcEI7QUFDQSxhQUFLcEYsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUNELFVBQUksS0FBS0Msa0JBQVQsRUFBNkI7QUFDM0IsYUFBS0Esa0JBQUwsQ0FBd0JtRixPQUF4QjtBQUNBLGFBQUtuRixrQkFBTCxHQUEwQixJQUExQjtBQUNEOztBQUNELFVBQUksS0FBS0Ysa0NBQVQsRUFBNkM7QUFDM0MsYUFBS0Esa0NBQUwsQ0FBd0NxRixPQUF4QztBQUNBLGFBQUtyRixrQ0FBTCxHQUEwQyxJQUExQztBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOVlBO0FBQUE7QUFBQSxXQStZRSx1QkFBY3NGLEVBQWQsRUFBa0JDLE1BQWxCLEVBQTBCQyxLQUExQixFQUFpQ2pELE1BQWpDLEVBQXlDQyxNQUF6QyxFQUFpREMsS0FBakQsRUFBd0Q7QUFBQTs7QUFDdEQsV0FBSy9DLGFBQUwsQ0FBbUIrRixRQUFuQixHQUE4QkMsTUFBOUIsQ0FBcUMsWUFBTTtBQUN6QyxZQUFJLENBQUMsTUFBSSxDQUFDM0YsTUFBVixFQUFrQjtBQUNoQjtBQUNBO0FBQ0Q7O0FBQ0QsWUFBTTRGLFlBQVksR0FBRyxNQUFJLENBQUM1RixNQUFMO0FBQVk7QUFBTzZGLFFBQUFBLFlBQXhDO0FBQ0EsWUFBTUMsV0FBVyxHQUFHLE1BQUksQ0FBQzlGLE1BQUw7QUFBWTtBQUFPK0YsUUFBQUEsV0FBdkM7O0FBQ0EsUUFBQSxNQUFJLENBQUNqRyxVQUFMLENBQ0drRyxVQURILENBQ2NSLE1BRGQsRUFDc0JDLEtBRHRCLEVBQzZCRyxZQUQ3QixFQUMyQ0UsV0FEM0MsRUFDd0RwRCxLQUR4RCxFQUVHbkIsSUFGSCxDQUdJLFVBQUNDLElBQUQsRUFBVTtBQUNSLFVBQUEsTUFBSSxDQUFDMUIsVUFBTCxDQUFnQm1HLGVBQWhCOztBQUNBLFVBQUEsTUFBSSxDQUFDQyxzQkFBTCxDQUNFMUUsSUFBSSxDQUFDMkUsT0FEUCxFQUVFWixFQUZGLEVBR0UvRCxJQUFJLENBQUM0RSxRQUhQLEVBSUU1RSxJQUFJLENBQUM2RSxTQUpQLEVBS0U3RCxNQUxGLEVBTUVDLE1BTkY7QUFRRCxTQWJMLEVBY0ksWUFBTSxDQUFFLENBZFo7QUFnQkQsT0F2QkQ7QUF3QkQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFuYkE7QUFBQTtBQUFBLFdBb2JFLGdDQUNFMEQsT0FERixFQUVFWixFQUZGLEVBR0VlLGNBSEYsRUFJRUMsZUFKRixFQUtFL0QsTUFMRixFQU1FQyxNQU5GLEVBT0U7QUFDQTtBQUNBLFVBQUksQ0FBQyxLQUFLekMsTUFBVixFQUFrQjtBQUNoQjtBQUNEOztBQUNEekIsTUFBQUEsb0JBQW9CLENBQ2xCLEtBQUt5QixNQURhLEVBRWxCLENBQUM7QUFBQ04sUUFBQUEsR0FBRyxFQUFFOEMsTUFBTjtBQUFjQyxRQUFBQSxNQUFNLEVBQU5BO0FBQWQsT0FBRCxDQUZrQixFQUdsQjBELE9BQU8sR0FBRyxvQkFBSCxHQUEwQixtQkFIZixFQUlsQnhILElBQUksQ0FBQztBQUNILGNBQU00RyxFQURIO0FBRUgsMEJBQWtCZSxjQUZmO0FBR0gsMkJBQW1CQztBQUhoQixPQUFELENBSmMsRUFTbEIsSUFUa0IsQ0FBcEI7QUFXRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWhkQTtBQUFBO0FBQUEsV0FpZEUsd0JBQWVDLFVBQWYsRUFBMkI7QUFDekIsVUFBSSxDQUFDLEtBQUt0RyxjQUFWLEVBQTBCO0FBQ3hCO0FBQ0Q7O0FBQ0QsV0FBS0EsY0FBTCxDQUFvQnVHLElBQXBCLENBQ0UsYUFERixFQUVFOUgsSUFBSSxDQUFDO0FBQ0gsc0JBQWM2SCxVQURYO0FBRUgsc0JBQWMsQ0FBQyxLQUFLN0csYUFBTCxDQUFtQmEsU0FBbkIsR0FBK0JrRyxTQUEvQjtBQUZaLE9BQUQsQ0FGTjtBQU9EO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFsZUE7QUFBQTtBQUFBLFdBbWVFLHFDQUE0QjtBQUFBOztBQUMxQixhQUFPLEtBQUtwRyxTQUFMLENBQ0pxRyxrQkFESSxDQUNlbEksR0FBRyxHQUFHaUcsYUFBTixDQUFvQixLQUFLMUUsTUFBekIsQ0FEZixFQUVKdUIsSUFGSSxDQUVDLFVBQUNxRixRQUFELEVBQWM7QUFDbEJsSSxRQUFBQSxTQUFTLENBQ1BrSSxRQURPLEVBRVAsMkRBRk8sQ0FBVDs7QUFJQSxZQUFNQyxRQUFRLEdBQUcsTUFBSSxDQUFDdkcsU0FBTCxDQUFld0csT0FBZixFQUFqQjs7QUFDQSxlQUFPbkksSUFBSSxDQUFDO0FBQ1Ysd0JBQWNpSSxRQURKO0FBRVYsMEJBQWdCQztBQUZOLFNBQUQsQ0FBWDtBQUlELE9BWkksQ0FBUDtBQWFEO0FBRUQ7O0FBbmZGO0FBQUE7QUFBQSxXQW9mRSx5QkFBZ0I7QUFBQTs7QUFDZCxVQUFJLEtBQUtuRyxvQkFBVCxFQUErQjtBQUM3QjtBQUNBO0FBQ0Q7O0FBRUQsV0FBS0Esb0JBQUwsR0FBNEIsSUFBNUI7QUFDQSxXQUFLcUcseUJBQUwsR0FBaUN4RixJQUFqQyxDQUFzQyxVQUFDcUYsUUFBRCxFQUFjO0FBQ2xELFFBQUEsTUFBSSxDQUFDbEcsb0JBQUwsR0FBNEIsS0FBNUI7O0FBQ0EsUUFBQSxNQUFJLENBQUNQLGtCQUFMLENBQXdCc0csSUFBeEIsQ0FBNkIxSSxXQUFXLENBQUNpSixRQUF6QyxFQUFtREosUUFBbkQ7QUFDRCxPQUhEO0FBSUQ7QUFFRDs7QUFqZ0JGO0FBQUE7QUFBQSxXQWtnQkUsNkJBQW9CO0FBQUE7O0FBQ2xCLFVBQUksS0FBS3hHLHdCQUFULEVBQW1DO0FBQ2pDO0FBQ0E7QUFDRDs7QUFFRCxXQUFLQSx3QkFBTCxHQUFnQyxJQUFoQztBQUNBO0FBQ0EsV0FBS0MsWUFBTCxDQUFrQmtDLElBQWxCLENBQ0UsS0FBS2pDLFNBQUwsQ0FBZTJHLFFBQWYsQ0FDRTlILFFBQVEsQ0FDTixLQUFLTSxJQURDLEVBRU4sWUFBTTtBQUNKLFFBQUEsTUFBSSxDQUFDc0gseUJBQUwsR0FBaUN4RixJQUFqQyxDQUFzQyxVQUFDcUYsUUFBRCxFQUFjO0FBQ2xELFVBQUEsTUFBSSxDQUFDekcsa0JBQUwsQ0FBd0JzRyxJQUF4QixDQUE2QjFJLFdBQVcsQ0FBQ2lKLFFBQXpDLEVBQW1ESixRQUFuRDtBQUNELFNBRkQ7QUFHRCxPQU5LLEVBT052SCxrQ0FQTSxDQURWLENBREY7QUFhQSxXQUFLZ0IsWUFBTCxDQUFrQmtDLElBQWxCLENBQ0UsS0FBS2pDLFNBQUwsQ0FBZTRHLFFBQWYsQ0FBd0IsWUFBTTtBQUM1QixRQUFBLE1BQUksQ0FBQ0gseUJBQUwsR0FBaUN4RixJQUFqQyxDQUFzQyxVQUFDcUYsUUFBRCxFQUFjO0FBQ2xELFVBQUEsTUFBSSxDQUFDekcsa0JBQUwsQ0FBd0JzRyxJQUF4QixDQUE2QjFJLFdBQVcsQ0FBQ2lKLFFBQXpDLEVBQW1ESixRQUFuRDtBQUNELFNBRkQ7QUFHRCxPQUpELENBREY7QUFPRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQW5pQkE7QUFBQTtBQUFBLFdBb2lCRSwwQkFBaUJKLFVBQWpCLEVBQTZCO0FBQzNCLFdBQUsvRixXQUFMLEdBQW1CK0YsVUFBbkI7QUFDQSxXQUFLdkYsY0FBTCxDQUFvQnVGLFVBQXBCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBM2lCQTtBQUFBO0FBQUEsV0E0aUJFLDJCQUFrQjtBQUNoQjtBQUNBO0FBQ0EsVUFBSSxLQUFLdkcsa0NBQVQsRUFBNkM7QUFDM0MsYUFBS0Esa0NBQUwsQ0FBd0NrSCxJQUF4QztBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXhqQkE7QUFBQTtBQUFBLFdBeWpCRSxnQ0FBdUJDLE9BQXZCLEVBQWdDQyxRQUFoQyxFQUEwQztBQUN4QyxVQUFJLE9BQU9ELE9BQVAsSUFBa0IsUUFBdEIsRUFBZ0M7QUFDOUI7QUFDRDs7QUFDRCxVQUFJQyxRQUFKLEVBQWM7QUFDWjVJLFFBQUFBLEdBQUcsR0FBRzZJLGFBQU4sQ0FBb0JoSSxHQUFwQixFQUF5QjhILE9BQXpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBTUcsQ0FBQyxHQUFHLElBQUlDLEtBQUosQ0FBVUosT0FBVixDQUFWO0FBQ0FHLFFBQUFBLENBQUMsQ0FBQ3ZDLElBQUYsR0FBUyxTQUFUO0FBQ0EvRixRQUFBQSxzQkFBc0IsQ0FBQ3NJLENBQUQsRUFBSSxLQUFLNUgsYUFBTCxDQUFtQkQsR0FBdkIsQ0FBdEI7QUFDRDtBQUNGO0FBcGtCSDs7QUFBQTtBQUFBO0FBdWtCQTtBQUNBO0FBQ0ErSCxHQUFHLENBQUNsSSx5QkFBSixHQUFnQ0EseUJBQWhDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Q09OU1RBTlRTLCBNZXNzYWdlVHlwZX0gZnJvbSAnLi4vLi4vLi4vc3JjLzNwLWZyYW1lLW1lc3NhZ2luZyc7XG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb21tb24tc2lnbmFscyc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge0xlZ2FjeUFkSW50ZXJzZWN0aW9uT2JzZXJ2ZXJIb3N0fSBmcm9tICcuL2xlZ2FjeS1hZC1pbnRlcnNlY3Rpb24tb2JzZXJ2ZXItaG9zdCc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1xuICBTdWJzY3JpcHRpb25BcGksXG4gIGxpc3RlbkZvcixcbiAgbGlzdGVuRm9yT25jZVByb21pc2UsXG4gIHBvc3RNZXNzYWdlVG9XaW5kb3dzLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvaWZyYW1lLWhlbHBlcic7XG5pbXBvcnQge2FwcGx5RmlsbENvbnRlbnR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldERhdGF9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtnZXRIdG1sfSBmcm9tICcjY29yZS9kb20vZ2V0LWh0bWwnO1xuaW1wb3J0IHtpc0V4cGVyaW1lbnRPbn0gZnJvbSAnI2V4cGVyaW1lbnRzJztcbmltcG9ydCB7aXNHb29nbGVBZHNBNEFWYWxpZEVudmlyb25tZW50fSBmcm9tICcjYWRzL2dvb2dsZS9hNGEvdXRpbHMnO1xuaW1wb3J0IHtyZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtyZXBvcnRFcnJvclRvQW5hbHl0aWNzfSBmcm9tICcuLi8uLi8uLi9zcmMvZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7c2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3Rocm90dGxlfSBmcm9tICcjY29yZS90eXBlcy9mdW5jdGlvbic7XG5cbmNvbnN0IFZJU0lCSUxJVFlfVElNRU9VVCA9IDEwMDAwO1xuXG5jb25zdCBNSU5fSU5BQk9YX1BPU0lUSU9OX0VWRU5UX0lOVEVSVkFMID0gMTAwO1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtYWQteG9yaWdpbi1pZnJhbWUnO1xuXG5leHBvcnQgY2xhc3MgQW1wQWRYT3JpZ2luSWZyYW1lSGFuZGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcC1hZC0zcC1pbXBsLkFtcEFkM1BJbXBsfCEuLi8uLi9hbXAtYTRhLzAuMS9hbXAtYTRhLkFtcEE0QX0gYmFzZUluc3RhbmNlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihiYXNlSW5zdGFuY2UpIHtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gYmFzZUluc3RhbmNlLndpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuYmFzZUluc3RhbmNlXyA9IGJhc2VJbnN0YW5jZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGJhc2VJbnN0YW5jZS5lbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li9hbXAtYWQtdWkuQW1wQWRVSUhhbmRsZXJ9ICovXG4gICAgdGhpcy51aUhhbmRsZXJfID0gYmFzZUluc3RhbmNlLnVpSGFuZGxlcjtcblxuICAgIC8qKiBAdHlwZSB7P0hUTUxJRnJhbWVFbGVtZW50fSBpZnJhbWUgaW5zdGFuY2UgKi9cbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9MZWdhY3lBZEludGVyc2VjdGlvbk9ic2VydmVySG9zdH0gKi9cbiAgICB0aGlzLmxlZ2FjeUludGVyc2VjdGlvbk9ic2VydmVyQXBpSG9zdF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtTdWJzY3JpcHRpb25BcGl9ICovXG4gICAgdGhpcy5lbWJlZFN0YXRlQXBpXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9TdWJzY3JpcHRpb25BcGl9ICovXG4gICAgdGhpcy5pbmFib3hQb3NpdGlvbkFwaV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJbmFib3hQb3NpdGlvbkFwaUluaXRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhRnVuY3Rpb24+fSBmdW5jdGlvbnMgdG8gdW5yZWdpc3RlciBsaXN0ZW5lcnMgKi9cbiAgICB0aGlzLnVubGlzdGVuZXJzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZpZXdwb3J0L3ZpZXdwb3J0LWludGVyZmFjZS5WaWV3cG9ydEludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdwb3J0XyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYmFzZUluc3RhbmNlXy5nZXRBbXBEb2MoKSk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pblZpZXdwb3J0XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuc2VuZFBvc2l0aW9uUGVuZGluZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIGxpc3RlbmVycyBhbmQgaWZyYW1lIHN0YXRlIGZvciBpZnJhbWUgY29udGFpbmluZyBhZCBjcmVhdGl2ZS5cbiAgICogQHBhcmFtIHshSFRNTElGcmFtZUVsZW1lbnR9IGlmcmFtZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaXNBNEEgd2hlbiB0cnVlIGRvIG5vdCBsaXN0ZW4gdG8gYWQgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2xldENyZWF0aXZlVHJpZ2dlclJlbmRlclN0YXJ0IFdoZXRoZXIgdG8gd2FpdCBmb3JcbiAgICogICAgcmVuZGVyIHN0YXJ0IGZyb20gdGhlIGNyZWF0aXZlLCBvciBzaW1wbHkgdHJpZ2dlciBpdCBpbiBoZXJlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gYXdhaXRpbmcgcmVuZGVyIGNvbXBsZXRlIHByb21pc2VcbiAgICovXG4gIGluaXQoaWZyYW1lLCBvcHRfaXNBNEEsIG9wdF9sZXRDcmVhdGl2ZVRyaWdnZXJSZW5kZXJTdGFydCkge1xuICAgIGRldkFzc2VydCghdGhpcy5pZnJhbWUsICdtdWx0aXBsZSBpbnZvY2F0aW9ucyBvZiBpbml0IHdpdGhvdXQgZGVzdHJveSEnKTtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLmlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3Njcm9sbGluZycsICdubycpO1xuICAgIGlmICghdGhpcy51aUhhbmRsZXJfLmlzU3RpY2t5QWQoKSkge1xuICAgICAgYXBwbHlGaWxsQ29udGVudCh0aGlzLmlmcmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IHRpbWVyID0gU2VydmljZXMudGltZXJGb3IodGhpcy5iYXNlSW5zdGFuY2VfLndpbik7XG5cbiAgICAvLyBJbml0IHRoZSBsZWdhY3kgb2JzZXJ2ZUludGVyZWN0aW9uIEFQSSBzZXJ2aWNlLlxuICAgIC8vIChCZWhhdmUgbGlrZSBwb3NpdGlvbiBvYnNlcnZlcilcbiAgICB0aGlzLmxlZ2FjeUludGVyc2VjdGlvbk9ic2VydmVyQXBpSG9zdF8gPVxuICAgICAgbmV3IExlZ2FjeUFkSW50ZXJzZWN0aW9uT2JzZXJ2ZXJIb3N0KHRoaXMuYmFzZUluc3RhbmNlXywgdGhpcy5pZnJhbWUpO1xuXG4gICAgdGhpcy5lbWJlZFN0YXRlQXBpXyA9IG5ldyBTdWJzY3JpcHRpb25BcGkoXG4gICAgICB0aGlzLmlmcmFtZSxcbiAgICAgICdzZW5kLWVtYmVkLXN0YXRlJyxcbiAgICAgIHRydWUsXG4gICAgICAoKSA9PiB0aGlzLnNlbmRFbWJlZEluZm9fKHRoaXMuaW5WaWV3cG9ydF8pXG4gICAgKTtcblxuICAgIC8vIEVuYWJsZSBjcmVhdGl2ZSBwb3NpdGlvbiBvYnNlcnZlciBpZiBpbmFib3ggZXhwZXJpbWVudCBlbmFibGVkIE9SXG4gICAgLy8gYWRzZW5zZSBydW5uaW5nIG9uIG5vbi1DRE4gY2FjaGUgd2hlcmUgQU1QIGNyZWF0aXZlcyBhcmUgeGRvbWFpbmVkIGFuZFxuICAgIC8vIG1heSByZXF1aXJlIHRoaXMgaW5mb3JtYXRpb24uXG4gICAgaWYgKFxuICAgICAgaXNFeHBlcmltZW50T24odGhpcy53aW5fLCAnaW5hYm94LXBvc2l0aW9uLWFwaScpIHx8XG4gICAgICAoL15hZHNlbnNlJC9pLnRlc3QodGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkgJiZcbiAgICAgICAgIWlzR29vZ2xlQWRzQTRBVmFsaWRFbnZpcm9ubWVudCh0aGlzLndpbl8pKVxuICAgICkge1xuICAgICAgLy8gVG8gcHJvdmlkZSBwb3NpdGlvbiB0byBpbmFib3guXG4gICAgICB0aGlzLmluYWJveFBvc2l0aW9uQXBpXyA9IG5ldyBTdWJzY3JpcHRpb25BcGkoXG4gICAgICAgIHRoaXMuaWZyYW1lLFxuICAgICAgICBNZXNzYWdlVHlwZS5TRU5EX1BPU0lUSU9OUyxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIC8vIFRPRE8oQHpob3V5eCk6IE1ha2Ugc2VuZFBvc2l0aW9uXyBvbmx5IHNlbmQgdG9cbiAgICAgICAgICAvLyBtZXNzYWdlIG9yaWdpbiBpZnJhbWVcbiAgICAgICAgICB0aGlzLnNlbmRQb3NpdGlvbl8oKTtcbiAgICAgICAgICB0aGlzLnJlZ2lzdGVyUG9zaXRpb25fKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICAgIC8vIFRyaWdnZXJlZCBieSBjb250ZXh0LnJlcG9ydFJlbmRlcmVkRW50aXR5SWRlbnRpZmllcijigKYpIGluc2lkZSB0aGUgYWRcbiAgICAvLyBpZnJhbWUuXG4gICAgbGlzdGVuRm9yT25jZVByb21pc2UodGhpcy5pZnJhbWUsICdlbnRpdHktaWQnLCB0cnVlKS50aGVuKChpbmZvKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnRfLmNyZWF0aXZlSWQgPSBpbmZvLmRhdGFbJ2lkJ107XG4gICAgfSk7XG5cbiAgICB0aGlzLmhhbmRsZU9uZVRpbWVSZXF1ZXN0XyhNZXNzYWdlVHlwZS5HRVRfSFRNTCwgKHBheWxvYWQpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gcGF5bG9hZFsnc2VsZWN0b3InXTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBwYXlsb2FkWydhdHRyaWJ1dGVzJ107XG4gICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgaWYgKHRoaXMuZWxlbWVudF8uaGFzQXR0cmlidXRlKCdkYXRhLWh0bWwtYWNjZXNzLWFsbG93ZWQnKSkge1xuICAgICAgICBjb250ZW50ID0gZ2V0SHRtbCh0aGlzLmJhc2VJbnN0YW5jZV8ud2luLCBzZWxlY3RvciwgYXR0cmlidXRlcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNvbnRlbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5oYW5kbGVPbmVUaW1lUmVxdWVzdF8oTWVzc2FnZVR5cGUuR0VUX0NPTlNFTlRfU1RBVEUsICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmJhc2VJbnN0YW5jZV8uZ2V0Q29uc2VudFN0YXRlKCkudGhlbigoY29uc2VudFN0YXRlKSA9PiB7XG4gICAgICAgIHJldHVybiB7Y29uc2VudFN0YXRlfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gSW5zdGFsbCBpZnJhbWUgcmVzaXplIEFQSS5cbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuRm9yKFxuICAgICAgICB0aGlzLmlmcmFtZSxcbiAgICAgICAgJ2VtYmVkLXNpemUnLFxuICAgICAgICAoZGF0YSwgc291cmNlLCBvcmlnaW4sIGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKCEhZGF0YVsnaGFzT3ZlcmZsb3cnXSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy53YXJuT25NaXNzaW5nT3ZlcmZsb3cgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5oYW5kbGVSZXNpemVfKFxuICAgICAgICAgICAgZGF0YVsnaWQnXSxcbiAgICAgICAgICAgIGRhdGFbJ2hlaWdodCddLFxuICAgICAgICAgICAgZGF0YVsnd2lkdGgnXSxcbiAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgIGV2ZW50XG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG5cbiAgICBpZiAodGhpcy51aUhhbmRsZXJfLmlzU3RpY2t5QWQoKSkge1xuICAgICAgc2V0U3R5bGUoaWZyYW1lLCAncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuICAgICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaChcbiAgICAgICAgbGlzdGVuRm9yKFxuICAgICAgICAgIHRoaXMuaWZyYW1lLFxuICAgICAgICAgICdzaWduYWwtaW50ZXJhY3RpdmUnLFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHNldFN0eWxlKGlmcmFtZSwgJ3BvaW50ZXItZXZlbnRzJywgJ2F1dG8nKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8uZ2V0QW1wRG9jKCkub25WaXNpYmlsaXR5Q2hhbmdlZCgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VuZEVtYmVkSW5mb18odGhpcy5pblZpZXdwb3J0Xyk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuRm9yKFxuICAgICAgICB0aGlzLmlmcmFtZSxcbiAgICAgICAgTWVzc2FnZVR5cGUuVVNFUl9FUlJPUl9JTl9JRlJBTUUsXG4gICAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgICAgdGhpcy51c2VyRXJyb3JGb3JBbmFseXRpY3NfKFxuICAgICAgICAgICAgZGF0YVsnbWVzc2FnZSddLFxuICAgICAgICAgICAgZGF0YVsnZXhwZWN0ZWQnXSA9PSB0cnVlXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdHJ1ZSAvKiBvcHRfaW5jbHVkaW5nTmVzdGVkV2luZG93cyAqL1xuICAgICAgKVxuICAgICk7XG5cbiAgICAvLyBJZnJhbWUub25sb2FkIG5vcm1hbGx5IGNhbGxlZCBieSB0aGUgQWQgYWZ0ZXIgZnVsbCBsb2FkLlxuICAgIGNvbnN0IGlmcmFtZUxvYWRQcm9taXNlID0gdGhpcy5iYXNlSW5zdGFuY2VfXG4gICAgICAubG9hZFByb21pc2UodGhpcy5pZnJhbWUpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIFdhaXQganVzdCBhIGxpdHRsZSB0byBhbGxvdyBgbm8tY29udGVudGAgbWVzc2FnZSB0byBhcnJpdmUuXG4gICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgICAgIC8vIENocm9tZSBkb2VzIG5vdCByZWZsZWN0IHRoZSBpZnJhbWUgcmVhZHlzdGF0ZS5cbiAgICAgICAgICB0aGlzLmlmcmFtZS5yZWFkeVN0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGltZXIucHJvbWlzZSgxMCk7XG4gICAgICB9KTtcblxuICAgIC8vIENhbGN1bGF0ZSByZW5kZXItc3RhcnQgYW5kIG5vLWNvbnRlbnQgc2lnbmFscy5cbiAgICBjb25zdCB7cHJvbWlzZTogcmVuZGVyU3RhcnRQcm9taXNlLCByZXNvbHZlOiByZW5kZXJTdGFydFJlc29sdmV9ID1cbiAgICAgIG5ldyBEZWZlcnJlZCgpO1xuICAgIGNvbnN0IHtwcm9taXNlOiBub0NvbnRlbnRQcm9taXNlLCByZXNvbHZlOiBub0NvbnRlbnRSZXNvbHZlfSA9XG4gICAgICBuZXcgRGVmZXJyZWQoKTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy5jb25maWcgJiZcbiAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy5jb25maWcucmVuZGVyU3RhcnRJbXBsZW1lbnRlZFxuICAgICkge1xuICAgICAgLy8gV2hlbiBgcmVuZGVyLXN0YXJ0YCBpcyBzdXBwb3J0ZWQsIHRoZXNlIHNpZ25hbHMgYXJlIG11dHVhbGx5XG4gICAgICAvLyBleGNsdXNpdmUuIFdoaWNoZXZlciBhcnJpdmVzIGZpcnN0IHdpbnMuXG4gICAgICBsaXN0ZW5Gb3JPbmNlUHJvbWlzZShcbiAgICAgICAgdGhpcy5pZnJhbWUsXG4gICAgICAgIFsncmVuZGVyLXN0YXJ0JywgJ25vLWNvbnRlbnQnXSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgIGNvbnN0IHtkYXRhfSA9IGluZm87XG4gICAgICAgIGlmIChkYXRhWyd0eXBlJ10gPT0gJ3JlbmRlci1zdGFydCcpIHtcbiAgICAgICAgICB0aGlzLnJlbmRlclN0YXJ0TXNnSGFuZGxlcl8oaW5mbyk7XG4gICAgICAgICAgcmVuZGVyU3RhcnRSZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ub0NvbnRlbnRfKCk7XG4gICAgICAgICAgbm9Db250ZW50UmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgYHJlbmRlci1zdGFydGAgaXMgbm90IHN1cHBvcnRlZCwgbGlzdGVuIHRvIGBib290c3RyYXAtbG9hZGVkYC5cbiAgICAgIC8vIFRoaXMgd2lsbCBhdm9pZCBrZWVwaW5nIHRoZSBBZCBlbXB0eSB1bnRpbCBpdCdzIGZ1bGx5IGxvYWRlZCwgd2hpY2hcbiAgICAgIC8vIGNvdWxkIGJlIGEgbG9uZyB0aW1lLlxuICAgICAgbGlzdGVuRm9yT25jZVByb21pc2UodGhpcy5pZnJhbWUsICdib290c3RyYXAtbG9hZGVkJywgdHJ1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlbmRlclN0YXJ0UmVzb2x2ZSgpO1xuICAgICAgfSk7XG4gICAgICAvLyBMaWtld2lzZSwgbm8tY29udGVudCBpcyBvYnNlcnZlZCBoZXJlLiBIb3dldmVyLCBpdCdzIGltcG9zc2libGUgdG9cbiAgICAgIC8vIGFzc3VyZSBleGNsdXNpdml0eSBiZXR3ZWVuIGBuby1jb250ZW50YCBhbmQgYGJvb3RzdHJhcC1sb2FkZWRgIGIvY1xuICAgICAgLy8gYGJvb3RzdHJhcC1sb2FkZWRgIGFsd2F5cyBhcnJpdmVzIGZpcnN0LlxuICAgICAgbGlzdGVuRm9yT25jZVByb21pc2UodGhpcy5pZnJhbWUsICduby1jb250ZW50JywgdHJ1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMubm9Db250ZW50XygpO1xuICAgICAgICBub0NvbnRlbnRSZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBpbml0aWFsIGxvYWQgc2lnbmFsLiBOb3RpY2UgdGhhdCB0aGlzIHNpZ25hbCBpcyBub3RcbiAgICAvLyB1c2VkIHRvIHJlc29sdmUgdGhlIGZpbmFsIGxheW91dCBwcm9taXNlIGJlY2F1c2UgaWZyYW1lIG1heSBzdGlsbCBiZVxuICAgIC8vIGNvbnN1bWluZyBzaWduaWZpY2FudCBuZXR3b3JrIGFuZCBDUFUgcmVzb3VyY2VzLlxuICAgIGxpc3RlbkZvck9uY2VQcm9taXNlKHRoaXMuaWZyYW1lLCBDb21tb25TaWduYWxzLklOSV9MT0FELCB0cnVlKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIFRPRE8oZHZveXRlbmtvLCAjNzc4OCk6IGVuc3VyZSB0aGF0IGluLWEtYm94IFwiaW5pLWxvYWRcIiBtZXNzYWdlIGlzXG4gICAgICAvLyByZWNlaXZlZCBoZXJlIGFzIHdlbGwuXG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8uc2lnbmFscygpLnNpZ25hbChDb21tb25TaWduYWxzLklOSV9MT0FEKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQodGhpcy5pZnJhbWUpO1xuICAgIGlmIChvcHRfaXNBNEEgJiYgIW9wdF9sZXRDcmVhdGl2ZVRyaWdnZXJSZW5kZXJTdGFydCkge1xuICAgICAgLy8gQTRBIHdyaXRlcyBjcmVhdGl2ZSBmcmFtZSBkaXJlY3RseSB0byBwYWdlIG9uY2UgY3JlYXRpdmUgaXMgcmVjZWl2ZWRcbiAgICAgIC8vIGFuZCB0aGVyZWZvcmUgZG9lcyBub3QgcmVxdWlyZSByZW5kZXIgc3RhcnQgbWVzc2FnZSBzbyBhdHRhY2ggYW5kXG4gICAgICAvLyBpbXBvc2Ugbm8gbG9hZGVyIGRlbGF5LiAgTmV0d29yayBpcyB1c2luZyByZW5kZXJTdGFydCBvclxuICAgICAgLy8gYm9vdHN0cmFwLWxvYWRlZCB0byBpbmRpY2F0ZSBhZCByZXF1ZXN0IHdhcyBzZW50LCBlaXRoZXIgd2F5IHdlIGtub3dcbiAgICAgIC8vIHRoYXQgb2NjdXJyZWQgZm9yIEZhc3QgRmV0Y2guXG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8ucmVuZGVyU3RhcnRlZCgpO1xuICAgICAgcmVuZGVyU3RhcnRSZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNldCBpZnJhbWUgaW5pdGlhbGx5IGhpZGRlbiB3aGljaCB3aWxsIGJlIHJlbW92ZWQgb24gcmVuZGVyLXN0YXJ0IG9yXG4gICAgICAvLyBsb2FkLCB3aGljaGV2ZXIgaXMgZWFybGllci5cbiAgICAgIHNldFN0eWxlKHRoaXMuaWZyYW1lLCAndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICB9XG5cbiAgICAvLyBJZiBBNEEgd2hlcmUgY3JlYXRpdmUgaXMgcmVzcG9uc2libGUgZm9yIHRyaWdnZXJpbmcgcmVuZGVyIHN0YXJ0IChlLmdcbiAgICAvLyBubyBmaWxsIGZvciBzdGlja3kgYWQgY2FzZSksIG9ubHkgdHJpZ2dlciBpZiByZW5kZXJTdGFydCBsaXN0ZW5lciBwcm9taXNlXG4gICAgLy8gZXhwbGljaXRseSBmaXJlZCAodGhvdWdoIHdlIGRvIG5vdCBleHBlY3QgdGhpcyB0byBvY2N1ciBmb3IgQTRBKS5cbiAgICBjb25zdCB0cmlnZ2VyUmVuZGVyU3RhcnRQcm9taXNlID1cbiAgICAgIG9wdF9pc0E0QSAmJiBvcHRfbGV0Q3JlYXRpdmVUcmlnZ2VyUmVuZGVyU3RhcnRcbiAgICAgICAgPyByZW5kZXJTdGFydFByb21pc2VcbiAgICAgICAgOiBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgcmVuZGVyU3RhcnRQcm9taXNlLFxuICAgICAgICAgICAgaWZyYW1lTG9hZFByb21pc2UsXG4gICAgICAgICAgICB0aW1lci5wcm9taXNlKFZJU0lCSUxJVFlfVElNRU9VVCksXG4gICAgICAgICAgXSk7XG4gICAgdHJpZ2dlclJlbmRlclN0YXJ0UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIC8vIENvbW1vbiBzaWduYWwgUkVOREVSX1NUQVJUIGludm9rZWQgYXQgdG9nZ2xlIHZpc2liaWxpdHkgdGltZVxuICAgICAgLy8gTm90ZTogJ3JlbmRlci1zdGFydCcgbXNnIGFuZCBjb21tb24gc2lnbmFsIFJFTkRFUl9TVEFSVCBhcmUgZGlmZmVyZW50XG4gICAgICAvLyAncmVuZGVyLXN0YXJ0JyBtc2cgaXMgYSB3YXkgZm9yIGltcGxlbWVudGVkIEFkIHRvIGRpc3BsYXkgYWQgZWFybGllclxuICAgICAgLy8gUkVOREVSX1NUQVJUIHNpZ25hbCBpcyBhIHNpZ25hbCB0byBpbmZvcm0gQU1QIHJ1bnRpbWUgYW5kIG90aGVyIEFNUFxuICAgICAgLy8gZWxlbWVudHMgdGhhdCB0aGUgY29tcG9uZW50IHZpc2liaWxpdHkgaGFzIGJlZW4gdG9nZ2xlZCBvbi5cbiAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy5yZW5kZXJTdGFydGVkKCk7XG4gICAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgICAgc2V0U3R5bGUodGhpcy5pZnJhbWUsICd2aXNpYmlsaXR5JywgJycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGFjdHVhbCBhZCBsb2FkIGlzIGVhcmlsaWVzdCBvZiBpZnJhbWUub25sb2FkIGV2ZW50IGFuZCBuby1jb250ZW50LlxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW2lmcmFtZUxvYWRQcm9taXNlLCBub0NvbnRlbnRQcm9taXNlXSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RUeXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKil9IGdldHRlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlT25lVGltZVJlcXVlc3RfKHJlcXVlc3RUeXBlLCBnZXR0ZXIpIHtcbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuRm9yKFxuICAgICAgICB0aGlzLmlmcmFtZSxcbiAgICAgICAgcmVxdWVzdFR5cGUsXG4gICAgICAgIChpbmZvLCBzb3VyY2UsIG9yaWdpbikgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5pZnJhbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBtZXNzYWdlSWQgPSBpbmZvW0NPTlNUQU5UUy5tZXNzYWdlSWRGaWVsZE5hbWVdO1xuICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBpbmZvW0NPTlNUQU5UUy5wYXlsb2FkRmllbGROYW1lXTtcblxuICAgICAgICAgIGdldHRlcihwYXlsb2FkKS50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkaWN0KCk7XG4gICAgICAgICAgICByZXN1bHRbQ09OU1RBTlRTLm1lc3NhZ2VJZEZpZWxkTmFtZV0gPSBtZXNzYWdlSWQ7XG4gICAgICAgICAgICByZXN1bHRbQ09OU1RBTlRTLmNvbnRlbnRGaWVsZE5hbWVdID0gY29udGVudDtcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlVG9XaW5kb3dzKFxuICAgICAgICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuaWZyYW1lKSxcbiAgICAgICAgICAgICAgW3t3aW46IHNvdXJjZSwgb3JpZ2lufV0sXG4gICAgICAgICAgICAgIHJlcXVlc3RUeXBlICsgQ09OU1RBTlRTLnJlc3BvbnNlVHlwZVN1ZmZpeCxcbiAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB0cnVlIC8qIG9wdF9pczNQICovLFxuICAgICAgICBmYWxzZSAvKiBvcHRfaW5jbHVkaW5nTmVzdGVkV2luZG93cyAqL1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogY2FsbGJhY2sgZnVuY3RvbiBvbiByZWNlaXZpbmcgcmVuZGVyLXN0YXJ0XG4gICAqIEBwYXJhbSB7e2RhdGE6ICFKc29uT2JqZWN0fX0gaW5mb1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVuZGVyU3RhcnRNc2dIYW5kbGVyXyhpbmZvKSB7XG4gICAgY29uc3QgZGF0YSA9IGdldERhdGEoaW5mbyk7XG4gICAgdGhpcy5oYW5kbGVSZXNpemVfKFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgZGF0YVsnaGVpZ2h0J10sXG4gICAgICBkYXRhWyd3aWR0aCddLFxuICAgICAgaW5mb1snc291cmNlJ10sXG4gICAgICBpbmZvWydvcmlnaW4nXSxcbiAgICAgIGluZm9bJ2V2ZW50J11cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyB1cCB0aGUgbGlzdGVuZXJzIG9uIHRoZSBjcm9zcyBkb21haW4gYWQgaWZyYW1lIGFuZCBmcmVlcyB0aGVcbiAgICogaWZyYW1lIHJlc291cmNlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfa2VlcFxuICAgKi9cbiAgZnJlZVhPcmlnaW5JZnJhbWUob3B0X2tlZXApIHtcbiAgICB0aGlzLmNsZWFudXBfKCk7XG4gICAgLy8gSWYgYXNrIHRvIGtlZXAgdGhlIGlmcmFtZS5cbiAgICAvLyBVc2UgaW4gdGhlIGNhc2Ugb2Ygbm8tY29udGVudCBhbmQgaWZyYW1lIGlzIGEgbWFzdGVyIGlmcmFtZS5cbiAgICBpZiAob3B0X2tlZXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICByZW1vdmVFbGVtZW50KHRoaXMuaWZyYW1lKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHVwIGxpc3RlbmVycyBvbiB0aGUgYWQsIGFuZCBhcHBseSB0aGUgZGVmYXVsdCBVSSBmb3IgYWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBub0NvbnRlbnRfKCkge1xuICAgIGlmICghdGhpcy5pZnJhbWUpIHtcbiAgICAgIC8vIHVubGF5b3V0IGFscmVhZHkgY2FsbGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZnJlZVhPcmlnaW5JZnJhbWUodGhpcy5pZnJhbWUubmFtZS5pbmRleE9mKCdfbWFzdGVyJykgPj0gMCk7XG4gICAgdGhpcy51aUhhbmRsZXJfLmFwcGx5Tm9Db250ZW50VUkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgbGlzdGVuZXJzIG9uIHRoZSBhZCBpZnJhbWUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbGVhbnVwXygpIHtcbiAgICB0aGlzLnVubGlzdGVuZXJzXy5mb3JFYWNoKCh1bmxpc3RlbmVyKSA9PiB1bmxpc3RlbmVyKCkpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLmxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMuZW1iZWRTdGF0ZUFwaV8pIHtcbiAgICAgIHRoaXMuZW1iZWRTdGF0ZUFwaV8uZGVzdHJveSgpO1xuICAgICAgdGhpcy5lbWJlZFN0YXRlQXBpXyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLmluYWJveFBvc2l0aW9uQXBpXykge1xuICAgICAgdGhpcy5pbmFib3hQb3NpdGlvbkFwaV8uZGVzdHJveSgpO1xuICAgICAgdGhpcy5pbmFib3hQb3NpdGlvbkFwaV8gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5sZWdhY3lJbnRlcnNlY3Rpb25PYnNlcnZlckFwaUhvc3RfKSB7XG4gICAgICB0aGlzLmxlZ2FjeUludGVyc2VjdGlvbk9ic2VydmVyQXBpSG9zdF8uZGVzdHJveSgpO1xuICAgICAgdGhpcy5sZWdhY3lJbnRlcnNlY3Rpb25PYnNlcnZlckFwaUhvc3RfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZWxlbWVudCdzIGRpbWVuc2lvbnMgdG8gYWNjb21tb2RhdGUgdGhlIGlmcmFtZSdzXG4gICAqIHJlcXVlc3RlZCBkaW1lbnNpb25zLiBOb3RpZmllcyB0aGUgd2luZG93IHRoYXQgcmVxdWVzdCB0aGUgcmVzaXplXG4gICAqIG9mIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBpZFxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd8dW5kZWZpbmVkfSBoZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfHVuZGVmaW5lZH0gd2lkdGhcbiAgICogQHBhcmFtIHshV2luZG93fSBzb3VyY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpblxuICAgKiBAcGFyYW0geyFNZXNzYWdlRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVSZXNpemVfKGlkLCBoZWlnaHQsIHdpZHRoLCBzb3VyY2UsIG9yaWdpbiwgZXZlbnQpIHtcbiAgICB0aGlzLmJhc2VJbnN0YW5jZV8uZ2V0VnN5bmMoKS5tdXRhdGUoKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmlmcmFtZSkge1xuICAgICAgICAvLyBpZnJhbWUgY2FuIGJlIGNsZWFudXAgYmVmb3JlIHZzeW5jLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBpZnJhbWVIZWlnaHQgPSB0aGlzLmlmcmFtZS4vKk9LKi8gb2Zmc2V0SGVpZ2h0O1xuICAgICAgY29uc3QgaWZyYW1lV2lkdGggPSB0aGlzLmlmcmFtZS4vKk9LKi8gb2Zmc2V0V2lkdGg7XG4gICAgICB0aGlzLnVpSGFuZGxlcl9cbiAgICAgICAgLnVwZGF0ZVNpemUoaGVpZ2h0LCB3aWR0aCwgaWZyYW1lSGVpZ2h0LCBpZnJhbWVXaWR0aCwgZXZlbnQpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgIChpbmZvKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVpSGFuZGxlcl8ub25SZXNpemVTdWNjZXNzKCk7XG4gICAgICAgICAgICB0aGlzLnNlbmRFbWJlZFNpemVSZXNwb25zZV8oXG4gICAgICAgICAgICAgIGluZm8uc3VjY2VzcyxcbiAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgIGluZm8ubmV3V2lkdGgsXG4gICAgICAgICAgICAgIGluZm8ubmV3SGVpZ2h0LFxuICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgIG9yaWdpblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICgpID0+IHt9XG4gICAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSByZXNwb25zZSB0byB0aGUgd2luZG93IHdoaWNoIHJlcXVlc3RlZCBhIHJlc2l6ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBzdWNjZXNzXG4gICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gaWRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlcXVlc3RlZFdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZXF1ZXN0ZWRIZWlnaHRcbiAgICogQHBhcmFtIHshV2luZG93fSBzb3VyY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZEVtYmVkU2l6ZVJlc3BvbnNlXyhcbiAgICBzdWNjZXNzLFxuICAgIGlkLFxuICAgIHJlcXVlc3RlZFdpZHRoLFxuICAgIHJlcXVlc3RlZEhlaWdodCxcbiAgICBzb3VyY2UsXG4gICAgb3JpZ2luXG4gICkge1xuICAgIC8vIFRoZSBpZnJhbWUgbWF5IGhhdmUgYmVlbiByZW1vdmVkIGJ5IHRoZSB0aW1lIHdlIHJlc2l6ZS5cbiAgICBpZiAoIXRoaXMuaWZyYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHBvc3RNZXNzYWdlVG9XaW5kb3dzKFxuICAgICAgdGhpcy5pZnJhbWUsXG4gICAgICBbe3dpbjogc291cmNlLCBvcmlnaW59XSxcbiAgICAgIHN1Y2Nlc3MgPyAnZW1iZWQtc2l6ZS1jaGFuZ2VkJyA6ICdlbWJlZC1zaXplLWRlbmllZCcsXG4gICAgICBkaWN0KHtcbiAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICdyZXF1ZXN0ZWRXaWR0aCc6IHJlcXVlc3RlZFdpZHRoLFxuICAgICAgICAncmVxdWVzdGVkSGVpZ2h0JzogcmVxdWVzdGVkSGVpZ2h0LFxuICAgICAgfSksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGluVmlld3BvcnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNlbmRFbWJlZEluZm9fKGluVmlld3BvcnQpIHtcbiAgICBpZiAoIXRoaXMuZW1iZWRTdGF0ZUFwaV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5lbWJlZFN0YXRlQXBpXy5zZW5kKFxuICAgICAgJ2VtYmVkLXN0YXRlJyxcbiAgICAgIGRpY3Qoe1xuICAgICAgICAnaW5WaWV3cG9ydCc6IGluVmlld3BvcnQsXG4gICAgICAgICdwYWdlSGlkZGVuJzogIXRoaXMuYmFzZUluc3RhbmNlXy5nZXRBbXBEb2MoKS5pc1Zpc2libGUoKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBpZnJhbWUgcG9zaXRpb24gZW50cnkgaW4gbmV4dCBhbmltYXRpb24gZnJhbWUuXG4gICAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SWZyYW1lUG9zaXRpb25Qcm9taXNlXygpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3cG9ydF9cbiAgICAgIC5nZXRDbGllbnRSZWN0QXN5bmMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmlmcmFtZSkpXG4gICAgICAudGhlbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgZGV2QXNzZXJ0KFxuICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICdlbGVtZW50IGNsaWVudFJlY3Qgc2hvdWxkIGludGVyc2VjdHMgd2l0aCByb290IGNsaWVudFJlY3QnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy52aWV3cG9ydF8uZ2V0UmVjdCgpO1xuICAgICAgICByZXR1cm4gZGljdCh7XG4gICAgICAgICAgJ3RhcmdldFJlY3QnOiBwb3NpdGlvbixcbiAgICAgICAgICAndmlld3BvcnRSZWN0Jzogdmlld3BvcnQsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc2VuZFBvc2l0aW9uXygpIHtcbiAgICBpZiAodGhpcy5zZW5kUG9zaXRpb25QZW5kaW5nXykge1xuICAgICAgLy8gT25seSBzZW5kIG9uY2UgaW4gc2luZ2xlIGFuaW1hdGlvbiBmcmFtZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRQb3NpdGlvblBlbmRpbmdfID0gdHJ1ZTtcbiAgICB0aGlzLmdldElmcmFtZVBvc2l0aW9uUHJvbWlzZV8oKS50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgdGhpcy5zZW5kUG9zaXRpb25QZW5kaW5nXyA9IGZhbHNlO1xuICAgICAgdGhpcy5pbmFib3hQb3NpdGlvbkFwaV8uc2VuZChNZXNzYWdlVHlwZS5QT1NJVElPTiwgcG9zaXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlZ2lzdGVyUG9zaXRpb25fKCkge1xuICAgIGlmICh0aGlzLmlzSW5hYm94UG9zaXRpb25BcGlJbml0Xykge1xuICAgICAgLy8gb25seSByZWdpc3RlciB0byB2aWV3cG9ydCBzY3JvbGwvcmVzaXplIG9uY2VcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzSW5hYm94UG9zaXRpb25BcGlJbml0XyA9IHRydWU7XG4gICAgLy8gU2VuZCB3aW5kb3cgc2Nyb2xsL3Jlc2l6ZSBldmVudCB0byB2aWV3cG9ydC5cbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgdGhpcy52aWV3cG9ydF8ub25TY3JvbGwoXG4gICAgICAgIHRocm90dGxlKFxuICAgICAgICAgIHRoaXMud2luXyxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldElmcmFtZVBvc2l0aW9uUHJvbWlzZV8oKS50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmluYWJveFBvc2l0aW9uQXBpXy5zZW5kKE1lc3NhZ2VUeXBlLlBPU0lUSU9OLCBwb3NpdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1JTl9JTkFCT1hfUE9TSVRJT05fRVZFTlRfSU5URVJWQUxcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaChcbiAgICAgIHRoaXMudmlld3BvcnRfLm9uUmVzaXplKCgpID0+IHtcbiAgICAgICAgdGhpcy5nZXRJZnJhbWVQb3NpdGlvblByb21pc2VfKCkudGhlbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgICB0aGlzLmluYWJveFBvc2l0aW9uQXBpXy5zZW5kKE1lc3NhZ2VUeXBlLlBPU0lUSU9OLCBwb3NpdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBCYXNlRWxlbWVudCBtZXRob2QuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5WaWV3cG9ydFxuICAgKi9cbiAgdmlld3BvcnRDYWxsYmFjayhpblZpZXdwb3J0KSB7XG4gICAgdGhpcy5pblZpZXdwb3J0XyA9IGluVmlld3BvcnQ7XG4gICAgdGhpcy5zZW5kRW1iZWRJbmZvXyhpblZpZXdwb3J0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgQmFzZUVsZW1lbnQgbWV0aG9kLlxuICAgKi9cbiAgb25MYXlvdXRNZWFzdXJlKCkge1xuICAgIC8vIFdoZW4gdGhlIGZyYW1ld29yayBoYXMgdGhlIG5lZWQgdG8gcmVtZWFzdXJlIHVzLCBvdXIgcG9zaXRpb24gbWlnaHRcbiAgICAvLyBoYXZlIGNoYW5nZWQuIFNlbmQgYW4gaW50ZXJzZWN0aW9uIHJlY29yZCBpZiBuZWVkZWQuXG4gICAgaWYgKHRoaXMubGVnYWN5SW50ZXJzZWN0aW9uT2JzZXJ2ZXJBcGlIb3N0Xykge1xuICAgICAgdGhpcy5sZWdhY3lJbnRlcnNlY3Rpb25PYnNlcnZlckFwaUhvc3RfLmZpcmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICogQHBhcmFtIHtib29sZWFufSBleHBlY3RlZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXNlckVycm9yRm9yQW5hbHl0aWNzXyhtZXNzYWdlLCBleHBlY3RlZCkge1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSAhPSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXhwZWN0ZWQpIHtcbiAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHLCBtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgIGUubmFtZSA9ICczcEVycm9yJztcbiAgICAgIHJlcG9ydEVycm9yVG9BbmFseXRpY3MoZSwgdGhpcy5iYXNlSW5zdGFuY2VfLndpbik7XG4gICAgfVxuICB9XG59XG5cbi8vIE1ha2UgdGhlIGNsYXNzIGF2YWlsYWJsZSB0byBvdGhlciBsYXRlIGxvYWRlZCBhbXAtYWQgaW1wbGVtZW50YXRpb25zXG4vLyB3aXRob3V0IHRoZW0gaGF2aW5nIHRvIGRlcGVuZCBvbiBpdCBkaXJlY3RseS5cbkFNUC5BbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyID0gQW1wQWRYT3JpZ2luSWZyYW1lSGFuZGxlcjtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js