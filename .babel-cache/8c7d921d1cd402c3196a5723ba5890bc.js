function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { Services } from "../../../src/service";
import { dev, devAssert, user } from "../../../src/log";
import { dict, hasOwn } from "../../../src/core/types/object";
import { getData } from "../../../src/event-helper";
import { getPageLayoutBoxBlocking } from "../../../src/core/dom/layout/page-layout-box";
import { getStyle, setStyles } from "../../../src/core/dom/style";
import { parseUrlDeprecated } from "../../../src/url";
import { throttle } from "../../../src/core/types/function";
import { tryParseJson } from "../../../src/core/types/object/json";

/**
 * Used to manage messages for different Safeframe ad slots.
 *
 * Maps a sentinel value to an instance of the SafeframeHostApi to which that
 * sentinel value belongs.
 * @type {!Object<string, !SafeframeHostApi>}
 */
export var safeframeHosts = {};

/** @private {boolean} */
var safeframeListenerCreated_ = false;

/** @enum {string} */
export var MESSAGE_FIELDS = {
  CHANNEL: 'c',
  SENTINEL: 'e',
  ENDPOINT_IDENTITY: 'i',
  PAYLOAD: 'p',
  SERVICE: 's',
  MESSAGE: 'message'
};

/** @enum {string} */
export var SERVICE = {
  GEOMETRY_UPDATE: 'geometry_update',
  CREATIVE_GEOMETRY_UPDATE: 'creative_geometry_update',
  EXPAND_REQUEST: 'expand_request',
  EXPAND_RESPONSE: 'expand_response',
  REGISTER_DONE: 'register_done',
  COLLAPSE_REQUEST: 'collapse_request',
  COLLAPSE_RESPONSE: 'collapse_response',
  RESIZE_REQUEST: 'resize_request',
  RESIZE_RESPONSE: 'resize_response'
};

/** @private {string} */
var TAG = 'AMP-DOUBLECLICK-SAFEFRAME';

/**
 * Event listener callback for message events. If message is a Safeframe
 * message, handles the message. This listener is registered within
 * SafeframeHostApi.
 * @param {!Event} event
 */
export function safeframeListener(event) {
  var data = tryParseJson(getData(event));

  if (!data) {
    return;
  }

  var payload = tryParseJson(data[MESSAGE_FIELDS.PAYLOAD]) || {};

  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  var sentinel = data[MESSAGE_FIELDS.SENTINEL] || payload['sentinel'];
  var safeframeHost = safeframeHosts[sentinel];

  if (!safeframeHost) {
    dev().warn(TAG, "Safeframe Host for sentinel: " + sentinel + " not found.");
    return;
  }

  if (!safeframeHost.equalsSafeframeContentWindow(event.source)) {
    dev().warn(TAG, "Safeframe source did not match event.source.");
    return;
  }

  if (!safeframeHost.channel) {
    safeframeHost.connectMessagingChannel(data[MESSAGE_FIELDS.CHANNEL]);
  } else if (payload) {
    // Currently we do not expect a payload on initial connection messages.
    safeframeHost.processMessage(
    /** @type {!JsonObject} */
    payload, data[MESSAGE_FIELDS.SERVICE]);
  }
}

/**
 * Sets up the host API for DoubleClick Safeframe to allow the following
 * Safeframe container APIs to work:
 *   - $sf.ext.expand()
 *   - $sf.ext.collapse()
 *   - $sf.ext.geom() Expand and collapse are both implemented utilizing AMP's
 *     built in element resizing.
 *
 * For geom, the host needs to send geometry updates into the container whenever
 *  a position change happens, at a max frequency of 1 message/second. To
 *  implement this messaging, we are leveraging the existing
 *  IntersectionObserver class that works with AMP elements. However, the
 *  safeframe iframe that we need to monitor is not an AMP element, but rather
 *  contained within an amp-ad. So, we are doing intersection observing on the
 *  amp-ad, and calculating the correct position for the iframe whenever we get
 *  an update.
 *
 * We pass an instance of this class into the IntersectionObserver class, which
 *  then calls the instance of send() below whenever an update occurs.
 */
export var SafeframeHostApi = /*#__PURE__*/function () {
  /**
   * @param {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} baseInstance
   * @param {boolean} isFluid
   * @param {{width:number, height:number}} creativeSize
   */
  function SafeframeHostApi(baseInstance, isFluid, creativeSize) {
    _classCallCheck(this, SafeframeHostApi);

    /** @private {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} */
    this.baseInstance_ = baseInstance;

    /** @private {!Function} */
    this.checkStillCurrent_ = this.baseInstance_.verifyStillCurrent.bind(this.baseInstance_)();

    /** @private {!Window} */
    this.win_ = this.baseInstance_.win;

    /** @private {string} */
    this.sentinel_ = this.baseInstance_.sentinel;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @type {?string} */
    this.channel = null;

    /** @private {?JsonObject} */
    this.currentGeometry_ = null;

    /** @private {number} */
    this.endpointIdentity_ = Math.random();

    /** @private {number} */
    this.uid_ = Math.random();

    /** @private {boolean} */
    this.isFluid_ = isFluid;

    /** @private {{width:number, height:number}} */
    this.creativeSize_ = creativeSize;

    /** @private {{width:number, height:number}} */
    this.initialCreativeSize_ =
    /** @type {{width:number, height:number}} */
    _extends({}, creativeSize);

    /** @protected {?Promise} */
    this.delay_ = null;

    /** @private {../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = this.baseInstance_.getViewport();

    /** @private {boolean} */
    this.isCollapsed_ = true;

    /** @private {boolean} */
    this.isRegistered_ = false;
    // TODO: Make this page-level.
    var sfConfig = Object(tryParseJson(this.baseInstance_.element.getAttribute('data-safeframe-config')) || {});

    /** @private {boolean} */
    this.expandByOverlay_ = hasOwn(sfConfig, 'expandByOverlay') ? sfConfig['expandByOverlay'] : true;

    /** @private {boolean} */
    this.expandByPush_ = hasOwn(sfConfig, 'expandByPush') ? sfConfig['expandByPush'] : true;

    /** @private {?Function} */
    this.unlisten_ = null;
    this.registerSafeframeHost();
  }

  /**
   * Returns true if the given window matches the Safeframe's content window.
   * Comparing to a null window will always return false.
   *
   * @param {?Window} otherWindow
   * @return {boolean}
   */
  _createClass(SafeframeHostApi, [{
    key: "equalsSafeframeContentWindow",
    value: function equalsSafeframeContentWindow(otherWindow) {
      return !!otherWindow && otherWindow === this.baseInstance_.iframe.contentWindow;
    }
    /**
     * Returns the Safeframe specific name attributes that are needed for the
     * Safeframe creative to properly setup.
     * @return {!JsonObject}
     */

  }, {
    key: "getSafeframeNameAttr",
    value: function getSafeframeNameAttr() {
      var attributes = dict({});
      attributes['uid'] = this.uid_;
      attributes['hostPeerName'] = this.win_.location.origin;
      attributes['initialGeometry'] = this.getInitialGeometry();
      attributes['permissions'] = JSON.stringify(dict({
        'expandByOverlay': this.expandByOverlay_,
        'expandByPush': this.expandByPush_,
        'readCookie': false,
        'writeCookie': false
      }));
      attributes['metadata'] = JSON.stringify(dict({
        'shared': {
          'sf_ver': this.baseInstance_.safeframeVersion,
          'ck_on': 1,
          'flash_ver': '26.0.0',
          // Once GPT Safeframe is updated to look in amp object,
          // remove this canonical_url here.
          'canonical_url': this.maybeGetCanonicalUrl(),
          'amp': {
            'canonical_url': this.maybeGetCanonicalUrl()
          }
        }
      }));
      attributes['reportCreativeGeometry'] = this.isFluid_;
      attributes['isDifferentSourceWindow'] = false;
      attributes['sentinel'] = this.sentinel_;
      return attributes;
    }
    /**
     * Returns the canonical URL of the page, if the publisher allows
     * it to be passed.
     * @return {string|undefined}
     * @visibleForTesting
     */

  }, {
    key: "maybeGetCanonicalUrl",
    value: function maybeGetCanonicalUrl() {
      // Don't allow for referrer policy same-origin,
      // as Safeframe will always be a different origin.
      // Don't allow for no-referrer.
      var ampdoc = this.baseInstance_.getAmpDoc();

      var _Services$documentInf = Services.documentInfoForDoc(ampdoc),
          canonicalUrl = _Services$documentInf.canonicalUrl;

      var metaReferrer = ampdoc.getMetaByName('referrer');

      if (!metaReferrer) {
        return canonicalUrl;
      }

      switch (metaReferrer) {
        case 'same-origin':
          return;

        case 'no-referrer':
          return;

        case 'origin':
          return parseUrlDeprecated(canonicalUrl).origin;
      }

      return canonicalUrl;
    }
    /**
     * Returns the initialGeometry to assign to the name of the safeframe
     * for rendering. This needs to be done differently than all the other
     * geometry updates, because we don't actually have access to the
     * rendered safeframe yet.
     * @return {string}
     */

  }, {
    key: "getInitialGeometry",
    value: function getInitialGeometry() {
      var ampAdBox = getPageLayoutBoxBlocking(this.baseInstance_.element);
      var heightOffset = (ampAdBox.height - this.creativeSize_.height) / 2;
      var widthOffset = (ampAdBox.width - this.creativeSize_.width) / 2;
      var iframeBox =
      /** @type {!../../../src/layout-rect.LayoutRectDef} */
      {
        top: ampAdBox.top + heightOffset,
        bottom: ampAdBox.bottom - heightOffset,
        left: ampAdBox.left + widthOffset,
        right: ampAdBox.right - widthOffset,
        height: this.initialCreativeSize_.height,
        width: this.initialCreativeSize_.width
      };
      return this.formatGeom_(iframeBox);
    }
    /**
     * Registers this instance as the host API for the current sentinel.
     * If the global safeframe listener has not yet been created, it creates
     * that as well.
     */

  }, {
    key: "registerSafeframeHost",
    value: function registerSafeframeHost() {
      devAssert(this.sentinel_);
      safeframeHosts[this.sentinel_] = safeframeHosts[this.sentinel_] || this;

      if (!safeframeListenerCreated_) {
        safeframeListenerCreated_ = true;
        this.win_.addEventListener('message', safeframeListener, false);
      }
    }
    /**
     * Sends initial connection message to the safeframe to finish initialization.
     * Also initializes the sending of geometry update messages to the frame.
     * @param {string} channel
     */

  }, {
    key: "connectMessagingChannel",
    value: function connectMessagingChannel(channel) {
      // Set the iframe here, because when class is first created the iframe
      // element does not yet exist on this.baseInstance_. The first time
      // we receive a message we know that it now exists.
      devAssert(this.baseInstance_.iframe);
      this.iframe_ = this.baseInstance_.iframe;
      this.channel = channel;
      this.setupGeom_();
      this.sendMessage_({
        'message': 'connect',
        'c': this.channel
      }, '');
    }
    /**
     * Creates IntersectionObserver instance for this SafeframeAPI instance.
     * We utilize the existing IntersectionObserver class, by passing in this
     * class for IO to use instead of SubscriptionApi for sending its update
     * messages. The method 'send' below is triggered by IO every time that
     * an update occurs.
     * @private
     */

  }, {
    key: "setupGeom_",
    value: function setupGeom_() {
      devAssert(this.iframe_.contentWindow, 'Frame contentWindow unavailable.');
      var throttledUpdate = throttle(this.win_, this.updateGeometry_.bind(this), 1000);
      var scrollUnlistener = this.viewport_.onScroll(throttledUpdate);
      var changedUnlistener = this.viewport_.onChanged(throttledUpdate);

      this.unlisten_ = function () {
        scrollUnlistener();
        changedUnlistener();
      };

      this.updateGeometry_();
    }
    /**
     * Sends a geometry update message into the safeframe.
     * @private
     */

  }, {
    key: "updateGeometry_",
    value: function updateGeometry_() {
      var _this = this;

      if (!this.iframe_) {
        return;
      }

      this.viewport_.getClientRectAsync(this.iframe_).then(function (iframeBox) {
        _this.checkStillCurrent_();

        var formattedGeom = _this.formatGeom_(iframeBox);

        _this.sendMessage_({
          newGeometry: formattedGeom,
          uid: _this.uid_
        }, SERVICE.GEOMETRY_UPDATE);
      }).catch(function (err) {
        return dev().error(TAG, err);
      });
    }
    /**
     * Builds geometry update format expected by GPT Safeframe.
     * Also sets this.currentGeometry as side effect.
     * @param {!../../../src/layout-rect.LayoutRectDef} iframeBox The elementRect for the safeframe.
     * @return {string} Safeframe formatted changes.
     * @private
     */

  }, {
    key: "formatGeom_",
    value: function formatGeom_(iframeBox) {
      var viewportSize = this.viewport_.getSize();
      var scrollLeft = this.viewport_.getScrollLeft();
      var scrollTop = this.viewport_.getScrollTop();
      var currentGeometry =
      /** @type {JsonObject} */
      {
        'windowCoords_t': 0,
        'windowCoords_r': viewportSize.width,
        'windowCoords_b': viewportSize.height,
        'windowCoords_l': 0,
        'frameCoords_t': iframeBox.top + scrollTop,
        'frameCoords_r': iframeBox.right + scrollLeft,
        'frameCoords_b': iframeBox.bottom + scrollTop,
        'frameCoords_l': iframeBox.left + scrollLeft,
        'posCoords_t': iframeBox.top,
        'posCoords_b': iframeBox.bottom,
        'posCoords_r': iframeBox.right,
        'posCoords_l': iframeBox.left,
        'styleZIndex': getStyle(this.baseInstance_.element, 'zIndex'),
        // AMP's built in resize methodology that we use only allows expansion
        // to the right and bottom, so we enforce that here.
        'allowedExpansion_r': viewportSize.width - iframeBox.width,
        'allowedExpansion_b': viewportSize.height - iframeBox.height,
        'allowedExpansion_t': 0,
        'allowedExpansion_l': 0,
        'yInView': this.getPercInView(viewportSize.height, iframeBox.top, iframeBox.bottom),
        'xInView': this.getPercInView(viewportSize.width, iframeBox.left, iframeBox.right)
      };
      this.currentGeometry_ = currentGeometry;
      return JSON.stringify(currentGeometry);
    }
    /**
     * Helper function to calculate both the xInView and yInView of the
     * geometry update messages. In the case of a 400px wide viewport,
     * with a 100px wide creative that starts at x position 50, if we
     * are calculating xInView, rootBoundEnd is 400, boundingRectStart
     * is 50, and boundingRectEnd is 150.
     * @param {number} rootBoundEnd
     * @param {number} boundingRectStart
     * @param {number} boundingRectEnd
     * @return {number}
     */

  }, {
    key: "getPercInView",
    value: function getPercInView(rootBoundEnd, boundingRectStart, boundingRectEnd) {
      var lengthInView = boundingRectEnd >= rootBoundEnd ? rootBoundEnd - boundingRectStart : boundingRectEnd;
      var percInView = lengthInView / (boundingRectEnd - boundingRectStart);
      return Math.max(0, Math.min(1, percInView)) || 0;
    }
    /**
     * Handles serializing and sending messages to the safeframe.
     * @param {!Object} payload
     * @param {string} serviceName
     * @private
     */

  }, {
    key: "sendMessage_",
    value: function sendMessage_(payload, serviceName) {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        dev().expectedError(TAG, 'Frame contentWindow unavailable.');
        return;
      }

      var message = dict();
      message[MESSAGE_FIELDS.CHANNEL] = this.channel;
      message[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify(
      /** @type {!JsonObject} */
      payload);
      message[MESSAGE_FIELDS.SERVICE] = serviceName;
      message[MESSAGE_FIELDS.SENTINEL] = this.sentinel_;
      message[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = this.endpointIdentity_;
      this.iframe_.contentWindow.
      /*OK*/
      postMessage(JSON.stringify(message), '*');
    }
    /**
     * Routes messages to their appropriate handler.
     * @param {!JsonObject} payload
     * @param {string} service
     */

  }, {
    key: "processMessage",
    value: function processMessage(payload, service) {
      // We are not logging unexpected messages, and some expected
      // messages are being dropped, like init_done, as we don't need them.
      switch (service) {
        case SERVICE.CREATIVE_GEOMETRY_UPDATE:
          this.handleFluidMessage_(payload);
          break;

        case SERVICE.EXPAND_REQUEST:
          this.handleExpandRequest_(payload);
          break;

        case SERVICE.REGISTER_DONE:
          this.isRegistered_ = true;
          break;

        case SERVICE.COLLAPSE_REQUEST:
          this.handleCollapseRequest_();
          break;

        case SERVICE.RESIZE_REQUEST:
          this.handleResizeRequest_(payload);

        default:
          break;
      }
    }
    /**
     * @param {!JsonObject} payload
     * @private
     */

  }, {
    key: "handleExpandRequest_",
    value: function handleExpandRequest_(payload) {
      if (!this.isRegistered_) {
        return;
      }

      var expandHeight = Number(this.creativeSize_.height) + payload['expand_b'] + payload['expand_t'];
      var expandWidth = Number(this.creativeSize_.width) + payload['expand_r'] + payload['expand_l'];

      // Verify that if expanding by push, that expandByPush is allowed.
      // If expanding by overlay, verify that expandByOverlay is allowed,
      // and that we are only expanding within the bounds of the amp-ad.
      if (isNaN(expandHeight) || isNaN(expandWidth) || payload['push'] && !this.expandByPush_ || !payload['push'] && !this.expandByOverlay_ && (expandWidth > this.creativeSize_.width || expandHeight > this.creativeSize_.height)) {
        dev().error(TAG, 'Invalid expand values.');
        this.sendResizeResponse(
        /* SUCCESS? */
        false, SERVICE.EXPAND_RESPONSE);
        return;
      }

      // Can't expand to greater than the viewport size
      if (expandHeight > this.viewport_.getSize().height || expandWidth > this.viewport_.getSize().width) {
        this.sendResizeResponse(
        /* SUCCESS? */
        false, SERVICE.EXPAND_RESPONSE);
        return;
      }

      this.handleSizeChange(expandHeight, expandWidth, SERVICE.EXPAND_RESPONSE);
    }
    /**
     * @private
     */

  }, {
    key: "handleCollapseRequest_",
    value: function handleCollapseRequest_() {
      // Only collapse if expanded.
      if (this.isCollapsed_ || !this.isRegistered_) {
        this.sendResizeResponse(
        /* SUCCESS? */
        false, SERVICE.COLLAPSE_RESPONSE);
        return;
      }

      this.handleSizeChange(this.initialCreativeSize_.height, this.initialCreativeSize_.width, SERVICE.COLLAPSE_RESPONSE,
      /** isCollapse */
      true);
    }
    /**
     * @param {number} height
     * @param {number} width
     * @param {string} messageType
     */

  }, {
    key: "resizeSafeframe",
    value: function resizeSafeframe(height, width, messageType) {
      var _this2 = this;

      this.isCollapsed_ = messageType == SERVICE.COLLAPSE_RESPONSE;
      this.baseInstance_.measureMutateElement(
      /** MEASURER */
      function () {
        _this2.baseInstance_.getResource().measure();
      },
      /** MUTATOR */
      function () {
        if (_this2.iframe_) {
          setStyles(_this2.iframe_, {
            'height': height + 'px',
            'width': width + 'px'
          });
          _this2.creativeSize_.height = height;
          _this2.creativeSize_.width = width;
        }

        _this2.sendResizeResponse(
        /** SUCCESS */
        true, messageType);
      }, this.iframe_);
    }
    /**
     * Resizes the safeframe, and potentially the containing amp-ad element.
     * Then sends a response message to the Safeframe creative.
     *
     * For expansion:
     *  If the new size is fully contained within the bounds of the amp-ad,
     *  we can resize immediately as there will be no reflow. However, if
     *  the new size is larger than the amp-ad, then first we need to try
     *  to resize the amp-ad, and only resize the safeframe if that succeeds.
     * For collapse:
     *  We always first want to attempt to collapse the amp-ad. Then,
     *  regardless of whether that succeeds, we collapse the safeframe too.
     * @param {number} height In pixels.
     * @param {number} width In pixels.
     * @param {string} messageType
     * @param {boolean=} optIsCollapse Whether this is a collapse attempt.
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "handleSizeChange",
    value: function handleSizeChange(height, width, messageType, optIsCollapse) {
      var _this3 = this;

      return this.viewport_.getClientRectAsync(this.baseInstance_.element).then(function (box) {
        if (!optIsCollapse && width <= box.width && height <= box.height) {
          _this3.resizeSafeframe(height, width, messageType);
        } else {
          _this3.resizeAmpAdAndSafeframe(height, width, messageType, optIsCollapse);
        }
      });
    }
    /**
     * @param {!JsonObject} payload
     * @private
     */

  }, {
    key: "handleResizeRequest_",
    value: function handleResizeRequest_(payload) {
      if (!this.isRegistered_) {
        return;
      }

      var resizeHeight = Number(this.creativeSize_.height) + (payload['resize_b'] + payload['resize_t']);
      var resizeWidth = Number(this.creativeSize_.width) + (payload['resize_r'] + payload['resize_l']);

      // Make sure we are actually resizing here.
      if (isNaN(resizeWidth) || isNaN(resizeHeight)) {
        dev().error(TAG, 'Invalid resize values.');
        return;
      }

      this.resizeAmpAdAndSafeframe(resizeHeight, resizeWidth, SERVICE.RESIZE_RESPONSE, true);
    }
    /**
     * @param {boolean} success
     * @param {string} messageType
     */

  }, {
    key: "sendResizeResponse",
    value: function sendResizeResponse(success, messageType) {
      var _this4 = this;

      if (!this.iframe_) {
        return;
      }

      this.viewport_.getClientRectAsync(this.iframe_).then(function (iframeBox) {
        _this4.checkStillCurrent_();

        var formattedGeom = _this4.formatGeom_(iframeBox);

        _this4.sendMessage_({
          uid: _this4.uid_,
          success: success,
          newGeometry: formattedGeom,
          'expand_t': _this4.currentGeometry_['allowedExpansion_t'],
          'expand_b': _this4.currentGeometry_['allowedExpansion_b'],
          'expand_r': _this4.currentGeometry_['allowedExpansion_r'],
          'expand_l': _this4.currentGeometry_['allowedExpansion_l'],
          push: true
        }, messageType);
      }).catch(function (err) {
        return dev().error(TAG, err);
      });
    }
    /**
     * Attempts to resize both the amp-ad and the Safeframe.
     * If the amp-ad can not be resized, then if it was a collapse request,
     * we will still collapse just the safeframe.
     * @param {number} height
     * @param {number} width
     * @param {string} messageType
     * @param {boolean=} opt_isShrinking True if collapsing or resizing smaller.
     */

  }, {
    key: "resizeAmpAdAndSafeframe",
    value: function resizeAmpAdAndSafeframe(height, width, messageType, opt_isShrinking) {
      var _this5 = this;

      // First, attempt to resize the Amp-Ad that is the parent of the
      // safeframe
      this.baseInstance_.attemptChangeSize(height, width).then(function () {
        _this5.checkStillCurrent_();

        // If this resize succeeded, we always resize the safeframe.
        // resizeSafeframe also sends the resize response.
        _this5.resizeSafeframe(height, width, messageType);
      },
      /** REJECT CALLBACK */
      function () {
        // If the resize initially failed, it may have been queued
        // as a pendingChangeSize, which will cause the size change
        // to execute upon the next user interaction. We don't want
        // that for safeframe, so we reset it here.
        _this5.baseInstance_.getResource().resetPendingChangeSize();

        if (opt_isShrinking) {
          // If this is a collapse or resize request, then even if resizing
          // the amp-ad failed, still resize the iframe.
          // resizeSafeframe also sends the resize response.
          // Only register as collapsed if explicitly a collapse request.
          _this5.resizeSafeframe(height, width, messageType);
        } else {
          // We were attempting to
          // expand past the bounds of the amp-ad, and it failed. Thus,
          // we need to send a failure message, and the safeframe is
          // not resized.
          _this5.sendResizeResponse(false, messageType);
        }
      }).catch(function (err) {
        if (err.message == 'CANCELLED') {
          dev().error(TAG, err);
          return;
        }

        dev().error(TAG, "Resizing failed: " + err);

        _this5.sendResizeResponse(false, messageType);
      });
    }
    /**
     * Handles Fluid-related messages dispatched from SafeFrame.
     * @param {!JsonObject} payload
     * @private
     */

  }, {
    key: "handleFluidMessage_",
    value: function handleFluidMessage_(payload) {
      var _this6 = this;

      var newHeight;

      if (!payload || !(newHeight = parseInt(payload['height'], 10))) {
        return;
      }

      this.baseInstance_.attemptChangeHeight(newHeight).then(function () {
        _this6.checkStillCurrent_();

        _this6.onFluidResize_(newHeight);
      }).catch(function (err) {
        user().warn(TAG, err);

        var _this6$baseInstance_$ = _this6.baseInstance_.getSlotSize(),
            height = _this6$baseInstance_$.height,
            width = _this6$baseInstance_$.width;

        if (width && height) {
          _this6.onFluidResize_(height);
        }
      });
    }
    /**
     * Fires a delayed impression and notifies the Fluid creative that its
     * container has been resized.
     * @param {number} newHeight The height expanded to.
     * @private
     */

  }, {
    key: "onFluidResize_",
    value: function onFluidResize_(newHeight) {
      var iframe = dev().assertElement(this.baseInstance_.iframe);
      var iframeHeight = parseInt(getStyle(iframe, 'height'), 10) || 0;

      if (iframeHeight != newHeight) {
        setStyles(iframe, {
          height: newHeight + "px"
        });
      }

      this.baseInstance_.fireFluidDelayedImpression();

      // In case we've unloaded in a race condition.
      if (!this.iframe_.contentWindow) {
        return;
      }

      this.iframe_.contentWindow.
      /*OK*/
      postMessage(JSON.stringify(dict({
        'message': 'resize-complete',
        'c': this.channel
      })), '*');
    }
    /**
     * Unregister this Host API.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.iframe_ = null;
      delete safeframeHosts[this.sentinel_];

      if (this.unlisten_) {
        this.unlisten_();
      }

      if (Object.keys(safeframeHosts).length == 0) {
        removeSafeframeListener();
      }
    }
  }]);

  return SafeframeHostApi;
}();

/**
 * Removes the safeframe event listener.
 */
export function removeSafeframeListener() {
  window.removeEventListener('message', safeframeListener, false);
  safeframeListenerCreated_ = false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNhZmVmcmFtZS1ob3N0LmpzIl0sIm5hbWVzIjpbIlNlcnZpY2VzIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsImRpY3QiLCJoYXNPd24iLCJnZXREYXRhIiwiZ2V0UGFnZUxheW91dEJveEJsb2NraW5nIiwiZ2V0U3R5bGUiLCJzZXRTdHlsZXMiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJ0aHJvdHRsZSIsInRyeVBhcnNlSnNvbiIsInNhZmVmcmFtZUhvc3RzIiwic2FmZWZyYW1lTGlzdGVuZXJDcmVhdGVkXyIsIk1FU1NBR0VfRklFTERTIiwiQ0hBTk5FTCIsIlNFTlRJTkVMIiwiRU5EUE9JTlRfSURFTlRJVFkiLCJQQVlMT0FEIiwiU0VSVklDRSIsIk1FU1NBR0UiLCJHRU9NRVRSWV9VUERBVEUiLCJDUkVBVElWRV9HRU9NRVRSWV9VUERBVEUiLCJFWFBBTkRfUkVRVUVTVCIsIkVYUEFORF9SRVNQT05TRSIsIlJFR0lTVEVSX0RPTkUiLCJDT0xMQVBTRV9SRVFVRVNUIiwiQ09MTEFQU0VfUkVTUE9OU0UiLCJSRVNJWkVfUkVRVUVTVCIsIlJFU0laRV9SRVNQT05TRSIsIlRBRyIsInNhZmVmcmFtZUxpc3RlbmVyIiwiZXZlbnQiLCJkYXRhIiwicGF5bG9hZCIsInNlbnRpbmVsIiwic2FmZWZyYW1lSG9zdCIsIndhcm4iLCJlcXVhbHNTYWZlZnJhbWVDb250ZW50V2luZG93Iiwic291cmNlIiwiY2hhbm5lbCIsImNvbm5lY3RNZXNzYWdpbmdDaGFubmVsIiwicHJvY2Vzc01lc3NhZ2UiLCJTYWZlZnJhbWVIb3N0QXBpIiwiYmFzZUluc3RhbmNlIiwiaXNGbHVpZCIsImNyZWF0aXZlU2l6ZSIsImJhc2VJbnN0YW5jZV8iLCJjaGVja1N0aWxsQ3VycmVudF8iLCJ2ZXJpZnlTdGlsbEN1cnJlbnQiLCJiaW5kIiwid2luXyIsIndpbiIsInNlbnRpbmVsXyIsImlmcmFtZV8iLCJjdXJyZW50R2VvbWV0cnlfIiwiZW5kcG9pbnRJZGVudGl0eV8iLCJNYXRoIiwicmFuZG9tIiwidWlkXyIsImlzRmx1aWRfIiwiY3JlYXRpdmVTaXplXyIsImluaXRpYWxDcmVhdGl2ZVNpemVfIiwiZGVsYXlfIiwidmlld3BvcnRfIiwiZ2V0Vmlld3BvcnQiLCJpc0NvbGxhcHNlZF8iLCJpc1JlZ2lzdGVyZWRfIiwic2ZDb25maWciLCJPYmplY3QiLCJlbGVtZW50IiwiZ2V0QXR0cmlidXRlIiwiZXhwYW5kQnlPdmVybGF5XyIsImV4cGFuZEJ5UHVzaF8iLCJ1bmxpc3Rlbl8iLCJyZWdpc3RlclNhZmVmcmFtZUhvc3QiLCJvdGhlcldpbmRvdyIsImlmcmFtZSIsImNvbnRlbnRXaW5kb3ciLCJhdHRyaWJ1dGVzIiwibG9jYXRpb24iLCJvcmlnaW4iLCJnZXRJbml0aWFsR2VvbWV0cnkiLCJKU09OIiwic3RyaW5naWZ5Iiwic2FmZWZyYW1lVmVyc2lvbiIsIm1heWJlR2V0Q2Fub25pY2FsVXJsIiwiYW1wZG9jIiwiZ2V0QW1wRG9jIiwiZG9jdW1lbnRJbmZvRm9yRG9jIiwiY2Fub25pY2FsVXJsIiwibWV0YVJlZmVycmVyIiwiZ2V0TWV0YUJ5TmFtZSIsImFtcEFkQm94IiwiaGVpZ2h0T2Zmc2V0IiwiaGVpZ2h0Iiwid2lkdGhPZmZzZXQiLCJ3aWR0aCIsImlmcmFtZUJveCIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsImZvcm1hdEdlb21fIiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldHVwR2VvbV8iLCJzZW5kTWVzc2FnZV8iLCJ0aHJvdHRsZWRVcGRhdGUiLCJ1cGRhdGVHZW9tZXRyeV8iLCJzY3JvbGxVbmxpc3RlbmVyIiwib25TY3JvbGwiLCJjaGFuZ2VkVW5saXN0ZW5lciIsIm9uQ2hhbmdlZCIsImdldENsaWVudFJlY3RBc3luYyIsInRoZW4iLCJmb3JtYXR0ZWRHZW9tIiwibmV3R2VvbWV0cnkiLCJ1aWQiLCJjYXRjaCIsImVyciIsImVycm9yIiwidmlld3BvcnRTaXplIiwiZ2V0U2l6ZSIsInNjcm9sbExlZnQiLCJnZXRTY3JvbGxMZWZ0Iiwic2Nyb2xsVG9wIiwiZ2V0U2Nyb2xsVG9wIiwiY3VycmVudEdlb21ldHJ5IiwiZ2V0UGVyY0luVmlldyIsInJvb3RCb3VuZEVuZCIsImJvdW5kaW5nUmVjdFN0YXJ0IiwiYm91bmRpbmdSZWN0RW5kIiwibGVuZ3RoSW5WaWV3IiwicGVyY0luVmlldyIsIm1heCIsIm1pbiIsInNlcnZpY2VOYW1lIiwiZXhwZWN0ZWRFcnJvciIsIm1lc3NhZ2UiLCJwb3N0TWVzc2FnZSIsInNlcnZpY2UiLCJoYW5kbGVGbHVpZE1lc3NhZ2VfIiwiaGFuZGxlRXhwYW5kUmVxdWVzdF8iLCJoYW5kbGVDb2xsYXBzZVJlcXVlc3RfIiwiaGFuZGxlUmVzaXplUmVxdWVzdF8iLCJleHBhbmRIZWlnaHQiLCJOdW1iZXIiLCJleHBhbmRXaWR0aCIsImlzTmFOIiwic2VuZFJlc2l6ZVJlc3BvbnNlIiwiaGFuZGxlU2l6ZUNoYW5nZSIsIm1lc3NhZ2VUeXBlIiwibWVhc3VyZU11dGF0ZUVsZW1lbnQiLCJnZXRSZXNvdXJjZSIsIm1lYXN1cmUiLCJvcHRJc0NvbGxhcHNlIiwiYm94IiwicmVzaXplU2FmZWZyYW1lIiwicmVzaXplQW1wQWRBbmRTYWZlZnJhbWUiLCJyZXNpemVIZWlnaHQiLCJyZXNpemVXaWR0aCIsInN1Y2Nlc3MiLCJwdXNoIiwib3B0X2lzU2hyaW5raW5nIiwiYXR0ZW1wdENoYW5nZVNpemUiLCJyZXNldFBlbmRpbmdDaGFuZ2VTaXplIiwibmV3SGVpZ2h0IiwicGFyc2VJbnQiLCJhdHRlbXB0Q2hhbmdlSGVpZ2h0Iiwib25GbHVpZFJlc2l6ZV8iLCJnZXRTbG90U2l6ZSIsImFzc2VydEVsZW1lbnQiLCJpZnJhbWVIZWlnaHQiLCJmaXJlRmx1aWREZWxheWVkSW1wcmVzc2lvbiIsImtleXMiLCJsZW5ndGgiLCJyZW1vdmVTYWZlZnJhbWVMaXN0ZW5lciIsIndpbmRvdyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYixFQUF3QkMsSUFBeEI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLE1BQWQ7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsd0JBQVI7QUFDQSxTQUFRQyxRQUFSLEVBQWtCQyxTQUFsQjtBQUNBLFNBQVFDLGtCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFlBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLGNBQWMsR0FBRyxFQUF2Qjs7QUFFUDtBQUNBLElBQUlDLHlCQUF5QixHQUFHLEtBQWhDOztBQUVBO0FBQ0EsT0FBTyxJQUFNQyxjQUFjLEdBQUc7QUFDNUJDLEVBQUFBLE9BQU8sRUFBRSxHQURtQjtBQUU1QkMsRUFBQUEsUUFBUSxFQUFFLEdBRmtCO0FBRzVCQyxFQUFBQSxpQkFBaUIsRUFBRSxHQUhTO0FBSTVCQyxFQUFBQSxPQUFPLEVBQUUsR0FKbUI7QUFLNUJDLEVBQUFBLE9BQU8sRUFBRSxHQUxtQjtBQU01QkMsRUFBQUEsT0FBTyxFQUFFO0FBTm1CLENBQXZCOztBQVNQO0FBQ0EsT0FBTyxJQUFNRCxPQUFPLEdBQUc7QUFDckJFLEVBQUFBLGVBQWUsRUFBRSxpQkFESTtBQUVyQkMsRUFBQUEsd0JBQXdCLEVBQUUsMEJBRkw7QUFHckJDLEVBQUFBLGNBQWMsRUFBRSxnQkFISztBQUlyQkMsRUFBQUEsZUFBZSxFQUFFLGlCQUpJO0FBS3JCQyxFQUFBQSxhQUFhLEVBQUUsZUFMTTtBQU1yQkMsRUFBQUEsZ0JBQWdCLEVBQUUsa0JBTkc7QUFPckJDLEVBQUFBLGlCQUFpQixFQUFFLG1CQVBFO0FBUXJCQyxFQUFBQSxjQUFjLEVBQUUsZ0JBUks7QUFTckJDLEVBQUFBLGVBQWUsRUFBRTtBQVRJLENBQWhCOztBQVlQO0FBQ0EsSUFBTUMsR0FBRyxHQUFHLDJCQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsaUJBQVQsQ0FBMkJDLEtBQTNCLEVBQWtDO0FBQ3ZDLE1BQU1DLElBQUksR0FBR3RCLFlBQVksQ0FBQ04sT0FBTyxDQUFDMkIsS0FBRCxDQUFSLENBQXpCOztBQUNBLE1BQUksQ0FBQ0MsSUFBTCxFQUFXO0FBQ1Q7QUFDRDs7QUFDRCxNQUFNQyxPQUFPLEdBQUd2QixZQUFZLENBQUNzQixJQUFJLENBQUNuQixjQUFjLENBQUNJLE9BQWhCLENBQUwsQ0FBWixJQUE4QyxFQUE5RDs7QUFDQTtBQUNGO0FBQ0E7QUFDQTtBQUNFLE1BQU1pQixRQUFRLEdBQUdGLElBQUksQ0FBQ25CLGNBQWMsQ0FBQ0UsUUFBaEIsQ0FBSixJQUFpQ2tCLE9BQU8sQ0FBQyxVQUFELENBQXpEO0FBQ0EsTUFBTUUsYUFBYSxHQUFHeEIsY0FBYyxDQUFDdUIsUUFBRCxDQUFwQzs7QUFDQSxNQUFJLENBQUNDLGFBQUwsRUFBb0I7QUFDbEJwQyxJQUFBQSxHQUFHLEdBQUdxQyxJQUFOLENBQVdQLEdBQVgsb0NBQWdESyxRQUFoRDtBQUNBO0FBQ0Q7O0FBQ0QsTUFBSSxDQUFDQyxhQUFhLENBQUNFLDRCQUFkLENBQTJDTixLQUFLLENBQUNPLE1BQWpELENBQUwsRUFBK0Q7QUFDN0R2QyxJQUFBQSxHQUFHLEdBQUdxQyxJQUFOLENBQVdQLEdBQVg7QUFDQTtBQUNEOztBQUNELE1BQUksQ0FBQ00sYUFBYSxDQUFDSSxPQUFuQixFQUE0QjtBQUMxQkosSUFBQUEsYUFBYSxDQUFDSyx1QkFBZCxDQUFzQ1IsSUFBSSxDQUFDbkIsY0FBYyxDQUFDQyxPQUFoQixDQUExQztBQUNELEdBRkQsTUFFTyxJQUFJbUIsT0FBSixFQUFhO0FBQ2xCO0FBQ0FFLElBQUFBLGFBQWEsQ0FBQ00sY0FBZDtBQUNFO0FBQTRCUixJQUFBQSxPQUQ5QixFQUVFRCxJQUFJLENBQUNuQixjQUFjLENBQUNLLE9BQWhCLENBRk47QUFJRDtBQUNGOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhd0IsZ0JBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsNEJBQVlDLFlBQVosRUFBMEJDLE9BQTFCLEVBQW1DQyxZQUFuQyxFQUFpRDtBQUFBOztBQUMvQztBQUNBLFNBQUtDLGFBQUwsR0FBcUJILFlBQXJCOztBQUVBO0FBQ0EsU0FBS0ksa0JBQUwsR0FBMEIsS0FBS0QsYUFBTCxDQUFtQkUsa0JBQW5CLENBQXNDQyxJQUF0QyxDQUN4QixLQUFLSCxhQURtQixHQUExQjs7QUFJQTtBQUNBLFNBQUtJLElBQUwsR0FBWSxLQUFLSixhQUFMLENBQW1CSyxHQUEvQjs7QUFFQTtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsS0FBS04sYUFBTCxDQUFtQlosUUFBcEM7O0FBRUE7QUFDQSxTQUFLbUIsT0FBTCxHQUFlLElBQWY7O0FBRUE7QUFDQSxTQUFLZCxPQUFMLEdBQWUsSUFBZjs7QUFFQTtBQUNBLFNBQUtlLGdCQUFMLEdBQXdCLElBQXhCOztBQUVBO0FBQ0EsU0FBS0MsaUJBQUwsR0FBeUJDLElBQUksQ0FBQ0MsTUFBTCxFQUF6Qjs7QUFFQTtBQUNBLFNBQUtDLElBQUwsR0FBWUYsSUFBSSxDQUFDQyxNQUFMLEVBQVo7O0FBRUE7QUFDQSxTQUFLRSxRQUFMLEdBQWdCZixPQUFoQjs7QUFFQTtBQUNBLFNBQUtnQixhQUFMLEdBQXFCZixZQUFyQjs7QUFFQTtBQUNBLFNBQUtnQixvQkFBTDtBQUE0QjtBQUE1QixpQkFDS2hCLFlBREw7O0FBSUE7QUFDQSxTQUFLaUIsTUFBTCxHQUFjLElBQWQ7O0FBRUE7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEtBQUtqQixhQUFMLENBQW1Ca0IsV0FBbkIsRUFBakI7O0FBRUE7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLElBQXBCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixLQUFyQjtBQUVBO0FBQ0EsUUFBTUMsUUFBUSxHQUFHQyxNQUFNLENBQ3JCMUQsWUFBWSxDQUNWLEtBQUtvQyxhQUFMLENBQW1CdUIsT0FBbkIsQ0FBMkJDLFlBQTNCLENBQXdDLHVCQUF4QyxDQURVLENBQVosSUFFSyxFQUhnQixDQUF2Qjs7QUFLQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCcEUsTUFBTSxDQUFDZ0UsUUFBRCxFQUFXLGlCQUFYLENBQU4sR0FDcEJBLFFBQVEsQ0FBQyxpQkFBRCxDQURZLEdBRXBCLElBRko7O0FBSUE7QUFDQSxTQUFLSyxhQUFMLEdBQXFCckUsTUFBTSxDQUFDZ0UsUUFBRCxFQUFXLGNBQVgsQ0FBTixHQUNqQkEsUUFBUSxDQUFDLGNBQUQsQ0FEUyxHQUVqQixJQUZKOztBQUlBO0FBQ0EsU0FBS00sU0FBTCxHQUFpQixJQUFqQjtBQUVBLFNBQUtDLHFCQUFMO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF2RkE7QUFBQTtBQUFBLFdBd0ZFLHNDQUE2QkMsV0FBN0IsRUFBMEM7QUFDeEMsYUFDRSxDQUFDLENBQUNBLFdBQUYsSUFBaUJBLFdBQVcsS0FBSyxLQUFLN0IsYUFBTCxDQUFtQjhCLE1BQW5CLENBQTBCQyxhQUQ3RDtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFsR0E7QUFBQTtBQUFBLFdBbUdFLGdDQUF1QjtBQUNyQixVQUFNQyxVQUFVLEdBQUc1RSxJQUFJLENBQUMsRUFBRCxDQUF2QjtBQUNBNEUsTUFBQUEsVUFBVSxDQUFDLEtBQUQsQ0FBVixHQUFvQixLQUFLcEIsSUFBekI7QUFDQW9CLE1BQUFBLFVBQVUsQ0FBQyxjQUFELENBQVYsR0FBNkIsS0FBSzVCLElBQUwsQ0FBVTZCLFFBQVYsQ0FBbUJDLE1BQWhEO0FBQ0FGLE1BQUFBLFVBQVUsQ0FBQyxpQkFBRCxDQUFWLEdBQWdDLEtBQUtHLGtCQUFMLEVBQWhDO0FBQ0FILE1BQUFBLFVBQVUsQ0FBQyxhQUFELENBQVYsR0FBNEJJLElBQUksQ0FBQ0MsU0FBTCxDQUMxQmpGLElBQUksQ0FBQztBQUNILDJCQUFtQixLQUFLcUUsZ0JBRHJCO0FBRUgsd0JBQWdCLEtBQUtDLGFBRmxCO0FBR0gsc0JBQWMsS0FIWDtBQUlILHVCQUFlO0FBSlosT0FBRCxDQURzQixDQUE1QjtBQVFBTSxNQUFBQSxVQUFVLENBQUMsVUFBRCxDQUFWLEdBQXlCSSxJQUFJLENBQUNDLFNBQUwsQ0FDdkJqRixJQUFJLENBQUM7QUFDSCxrQkFBVTtBQUNSLG9CQUFVLEtBQUs0QyxhQUFMLENBQW1Cc0MsZ0JBRHJCO0FBRVIsbUJBQVMsQ0FGRDtBQUdSLHVCQUFhLFFBSEw7QUFJUjtBQUNBO0FBQ0EsMkJBQWlCLEtBQUtDLG9CQUFMLEVBTlQ7QUFPUixpQkFBTztBQUNMLDZCQUFpQixLQUFLQSxvQkFBTDtBQURaO0FBUEM7QUFEUCxPQUFELENBRG1CLENBQXpCO0FBZUFQLE1BQUFBLFVBQVUsQ0FBQyx3QkFBRCxDQUFWLEdBQXVDLEtBQUtuQixRQUE1QztBQUNBbUIsTUFBQUEsVUFBVSxDQUFDLHlCQUFELENBQVYsR0FBd0MsS0FBeEM7QUFDQUEsTUFBQUEsVUFBVSxDQUFDLFVBQUQsQ0FBVixHQUF5QixLQUFLMUIsU0FBOUI7QUFDQSxhQUFPMEIsVUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFJQTtBQUFBO0FBQUEsV0EySUUsZ0NBQXVCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLFVBQU1RLE1BQU0sR0FBRyxLQUFLeEMsYUFBTCxDQUFtQnlDLFNBQW5CLEVBQWY7O0FBQ0Esa0NBQXVCekYsUUFBUSxDQUFDMEYsa0JBQVQsQ0FBNEJGLE1BQTVCLENBQXZCO0FBQUEsVUFBT0csWUFBUCx5QkFBT0EsWUFBUDs7QUFDQSxVQUFNQyxZQUFZLEdBQUdKLE1BQU0sQ0FBQ0ssYUFBUCxDQUFxQixVQUFyQixDQUFyQjs7QUFDQSxVQUFJLENBQUNELFlBQUwsRUFBbUI7QUFDakIsZUFBT0QsWUFBUDtBQUNEOztBQUNELGNBQVFDLFlBQVI7QUFDRSxhQUFLLGFBQUw7QUFDRTs7QUFDRixhQUFLLGFBQUw7QUFDRTs7QUFDRixhQUFLLFFBQUw7QUFDRSxpQkFBT2xGLGtCQUFrQixDQUFDaUYsWUFBRCxDQUFsQixDQUFpQ1QsTUFBeEM7QUFOSjs7QUFRQSxhQUFPUyxZQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF0S0E7QUFBQTtBQUFBLFdBdUtFLDhCQUFxQjtBQUNuQixVQUFNRyxRQUFRLEdBQUd2Rix3QkFBd0IsQ0FBQyxLQUFLeUMsYUFBTCxDQUFtQnVCLE9BQXBCLENBQXpDO0FBQ0EsVUFBTXdCLFlBQVksR0FBRyxDQUFDRCxRQUFRLENBQUNFLE1BQVQsR0FBa0IsS0FBS2xDLGFBQUwsQ0FBbUJrQyxNQUF0QyxJQUFnRCxDQUFyRTtBQUNBLFVBQU1DLFdBQVcsR0FBRyxDQUFDSCxRQUFRLENBQUNJLEtBQVQsR0FBaUIsS0FBS3BDLGFBQUwsQ0FBbUJvQyxLQUFyQyxJQUE4QyxDQUFsRTtBQUNBLFVBQU1DLFNBQVM7QUFBRztBQUF3RDtBQUN4RUMsUUFBQUEsR0FBRyxFQUFFTixRQUFRLENBQUNNLEdBQVQsR0FBZUwsWUFEb0Q7QUFFeEVNLFFBQUFBLE1BQU0sRUFBRVAsUUFBUSxDQUFDTyxNQUFULEdBQWtCTixZQUY4QztBQUd4RU8sUUFBQUEsSUFBSSxFQUFFUixRQUFRLENBQUNRLElBQVQsR0FBZ0JMLFdBSGtEO0FBSXhFTSxRQUFBQSxLQUFLLEVBQUVULFFBQVEsQ0FBQ1MsS0FBVCxHQUFpQk4sV0FKZ0Q7QUFLeEVELFFBQUFBLE1BQU0sRUFBRSxLQUFLakMsb0JBQUwsQ0FBMEJpQyxNQUxzQztBQU14RUUsUUFBQUEsS0FBSyxFQUFFLEtBQUtuQyxvQkFBTCxDQUEwQm1DO0FBTnVDLE9BQTFFO0FBUUEsYUFBTyxLQUFLTSxXQUFMLENBQWlCTCxTQUFqQixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTFMQTtBQUFBO0FBQUEsV0EyTEUsaUNBQXdCO0FBQ3RCakcsTUFBQUEsU0FBUyxDQUFDLEtBQUtvRCxTQUFOLENBQVQ7QUFDQXpDLE1BQUFBLGNBQWMsQ0FBQyxLQUFLeUMsU0FBTixDQUFkLEdBQWlDekMsY0FBYyxDQUFDLEtBQUt5QyxTQUFOLENBQWQsSUFBa0MsSUFBbkU7O0FBQ0EsVUFBSSxDQUFDeEMseUJBQUwsRUFBZ0M7QUFDOUJBLFFBQUFBLHlCQUF5QixHQUFHLElBQTVCO0FBQ0EsYUFBS3NDLElBQUwsQ0FBVXFELGdCQUFWLENBQTJCLFNBQTNCLEVBQXNDekUsaUJBQXRDLEVBQXlELEtBQXpEO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBeE1BO0FBQUE7QUFBQSxXQXlNRSxpQ0FBd0JTLE9BQXhCLEVBQWlDO0FBQy9CO0FBQ0E7QUFDQTtBQUNBdkMsTUFBQUEsU0FBUyxDQUFDLEtBQUs4QyxhQUFMLENBQW1COEIsTUFBcEIsQ0FBVDtBQUNBLFdBQUt2QixPQUFMLEdBQWUsS0FBS1AsYUFBTCxDQUFtQjhCLE1BQWxDO0FBQ0EsV0FBS3JDLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFdBQUtpRSxVQUFMO0FBQ0EsV0FBS0MsWUFBTCxDQUNFO0FBQ0UsbUJBQVcsU0FEYjtBQUVFLGFBQUssS0FBS2xFO0FBRlosT0FERixFQUtFLEVBTEY7QUFPRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBak9BO0FBQUE7QUFBQSxXQWtPRSxzQkFBYTtBQUNYdkMsTUFBQUEsU0FBUyxDQUFDLEtBQUtxRCxPQUFMLENBQWF3QixhQUFkLEVBQTZCLGtDQUE3QixDQUFUO0FBQ0EsVUFBTTZCLGVBQWUsR0FBR2pHLFFBQVEsQ0FDOUIsS0FBS3lDLElBRHlCLEVBRTlCLEtBQUt5RCxlQUFMLENBQXFCMUQsSUFBckIsQ0FBMEIsSUFBMUIsQ0FGOEIsRUFHOUIsSUFIOEIsQ0FBaEM7QUFLQSxVQUFNMkQsZ0JBQWdCLEdBQUcsS0FBSzdDLFNBQUwsQ0FBZThDLFFBQWYsQ0FBd0JILGVBQXhCLENBQXpCO0FBQ0EsVUFBTUksaUJBQWlCLEdBQUcsS0FBSy9DLFNBQUwsQ0FBZWdELFNBQWYsQ0FBeUJMLGVBQXpCLENBQTFCOztBQUNBLFdBQUtqQyxTQUFMLEdBQWlCLFlBQU07QUFDckJtQyxRQUFBQSxnQkFBZ0I7QUFDaEJFLFFBQUFBLGlCQUFpQjtBQUNsQixPQUhEOztBQUlBLFdBQUtILGVBQUw7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXJQQTtBQUFBO0FBQUEsV0FzUEUsMkJBQWtCO0FBQUE7O0FBQ2hCLFVBQUksQ0FBQyxLQUFLdEQsT0FBVixFQUFtQjtBQUNqQjtBQUNEOztBQUNELFdBQUtVLFNBQUwsQ0FDR2lELGtCQURILENBQ3NCLEtBQUszRCxPQUQzQixFQUVHNEQsSUFGSCxDQUVRLFVBQUNoQixTQUFELEVBQWU7QUFDbkIsUUFBQSxLQUFJLENBQUNsRCxrQkFBTDs7QUFDQSxZQUFNbUUsYUFBYSxHQUFHLEtBQUksQ0FBQ1osV0FBTCxDQUFpQkwsU0FBakIsQ0FBdEI7O0FBQ0EsUUFBQSxLQUFJLENBQUNRLFlBQUwsQ0FDRTtBQUNFVSxVQUFBQSxXQUFXLEVBQUVELGFBRGY7QUFFRUUsVUFBQUEsR0FBRyxFQUFFLEtBQUksQ0FBQzFEO0FBRlosU0FERixFQUtFeEMsT0FBTyxDQUFDRSxlQUxWO0FBT0QsT0FaSCxFQWFHaUcsS0FiSCxDQWFTLFVBQUNDLEdBQUQ7QUFBQSxlQUFTdkgsR0FBRyxHQUFHd0gsS0FBTixDQUFZMUYsR0FBWixFQUFpQnlGLEdBQWpCLENBQVQ7QUFBQSxPQWJUO0FBY0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoUkE7QUFBQTtBQUFBLFdBaVJFLHFCQUFZckIsU0FBWixFQUF1QjtBQUNyQixVQUFNdUIsWUFBWSxHQUFHLEtBQUt6RCxTQUFMLENBQWUwRCxPQUFmLEVBQXJCO0FBQ0EsVUFBTUMsVUFBVSxHQUFHLEtBQUszRCxTQUFMLENBQWU0RCxhQUFmLEVBQW5CO0FBQ0EsVUFBTUMsU0FBUyxHQUFHLEtBQUs3RCxTQUFMLENBQWU4RCxZQUFmLEVBQWxCO0FBQ0EsVUFBTUMsZUFBZTtBQUFHO0FBQTJCO0FBQ2pELDBCQUFrQixDQUQrQjtBQUVqRCwwQkFBa0JOLFlBQVksQ0FBQ3hCLEtBRmtCO0FBR2pELDBCQUFrQndCLFlBQVksQ0FBQzFCLE1BSGtCO0FBSWpELDBCQUFrQixDQUorQjtBQUtqRCx5QkFBaUJHLFNBQVMsQ0FBQ0MsR0FBVixHQUFnQjBCLFNBTGdCO0FBTWpELHlCQUFpQjNCLFNBQVMsQ0FBQ0ksS0FBVixHQUFrQnFCLFVBTmM7QUFPakQseUJBQWlCekIsU0FBUyxDQUFDRSxNQUFWLEdBQW1CeUIsU0FQYTtBQVFqRCx5QkFBaUIzQixTQUFTLENBQUNHLElBQVYsR0FBaUJzQixVQVJlO0FBU2pELHVCQUFlekIsU0FBUyxDQUFDQyxHQVR3QjtBQVVqRCx1QkFBZUQsU0FBUyxDQUFDRSxNQVZ3QjtBQVdqRCx1QkFBZUYsU0FBUyxDQUFDSSxLQVh3QjtBQVlqRCx1QkFBZUosU0FBUyxDQUFDRyxJQVp3QjtBQWFqRCx1QkFBZTlGLFFBQVEsQ0FBQyxLQUFLd0MsYUFBTCxDQUFtQnVCLE9BQXBCLEVBQTZCLFFBQTdCLENBYjBCO0FBY2pEO0FBQ0E7QUFDQSw4QkFBc0JtRCxZQUFZLENBQUN4QixLQUFiLEdBQXFCQyxTQUFTLENBQUNELEtBaEJKO0FBaUJqRCw4QkFBc0J3QixZQUFZLENBQUMxQixNQUFiLEdBQXNCRyxTQUFTLENBQUNILE1BakJMO0FBa0JqRCw4QkFBc0IsQ0FsQjJCO0FBbUJqRCw4QkFBc0IsQ0FuQjJCO0FBb0JqRCxtQkFBVyxLQUFLaUMsYUFBTCxDQUNUUCxZQUFZLENBQUMxQixNQURKLEVBRVRHLFNBQVMsQ0FBQ0MsR0FGRCxFQUdURCxTQUFTLENBQUNFLE1BSEQsQ0FwQnNDO0FBeUJqRCxtQkFBVyxLQUFLNEIsYUFBTCxDQUNUUCxZQUFZLENBQUN4QixLQURKLEVBRVRDLFNBQVMsQ0FBQ0csSUFGRCxFQUdUSCxTQUFTLENBQUNJLEtBSEQ7QUF6QnNDLE9BQW5EO0FBK0JBLFdBQUsvQyxnQkFBTCxHQUF3QndFLGVBQXhCO0FBQ0EsYUFBTzVDLElBQUksQ0FBQ0MsU0FBTCxDQUFlMkMsZUFBZixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxVQTtBQUFBO0FBQUEsV0FtVUUsdUJBQWNFLFlBQWQsRUFBNEJDLGlCQUE1QixFQUErQ0MsZUFBL0MsRUFBZ0U7QUFDOUQsVUFBTUMsWUFBWSxHQUNoQkQsZUFBZSxJQUFJRixZQUFuQixHQUNJQSxZQUFZLEdBQUdDLGlCQURuQixHQUVJQyxlQUhOO0FBSUEsVUFBTUUsVUFBVSxHQUFHRCxZQUFZLElBQUlELGVBQWUsR0FBR0QsaUJBQXRCLENBQS9CO0FBQ0EsYUFBT3pFLElBQUksQ0FBQzZFLEdBQUwsQ0FBUyxDQUFULEVBQVk3RSxJQUFJLENBQUM4RSxHQUFMLENBQVMsQ0FBVCxFQUFZRixVQUFaLENBQVosS0FBd0MsQ0FBL0M7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqVkE7QUFBQTtBQUFBLFdBa1ZFLHNCQUFhbkcsT0FBYixFQUFzQnNHLFdBQXRCLEVBQW1DO0FBQ2pDLFVBQUksQ0FBQyxLQUFLbEYsT0FBTixJQUFpQixDQUFDLEtBQUtBLE9BQUwsQ0FBYXdCLGFBQW5DLEVBQWtEO0FBQ2hEOUUsUUFBQUEsR0FBRyxHQUFHeUksYUFBTixDQUFvQjNHLEdBQXBCLEVBQXlCLGtDQUF6QjtBQUNBO0FBQ0Q7O0FBQ0QsVUFBTTRHLE9BQU8sR0FBR3ZJLElBQUksRUFBcEI7QUFDQXVJLE1BQUFBLE9BQU8sQ0FBQzVILGNBQWMsQ0FBQ0MsT0FBaEIsQ0FBUCxHQUFrQyxLQUFLeUIsT0FBdkM7QUFDQWtHLE1BQUFBLE9BQU8sQ0FBQzVILGNBQWMsQ0FBQ0ksT0FBaEIsQ0FBUCxHQUFrQ2lFLElBQUksQ0FBQ0MsU0FBTDtBQUNoQztBQUE0QmxELE1BQUFBLE9BREksQ0FBbEM7QUFHQXdHLE1BQUFBLE9BQU8sQ0FBQzVILGNBQWMsQ0FBQ0ssT0FBaEIsQ0FBUCxHQUFrQ3FILFdBQWxDO0FBQ0FFLE1BQUFBLE9BQU8sQ0FBQzVILGNBQWMsQ0FBQ0UsUUFBaEIsQ0FBUCxHQUFtQyxLQUFLcUMsU0FBeEM7QUFDQXFGLE1BQUFBLE9BQU8sQ0FBQzVILGNBQWMsQ0FBQ0csaUJBQWhCLENBQVAsR0FBNEMsS0FBS3VDLGlCQUFqRDtBQUNBLFdBQUtGLE9BQUwsQ0FBYXdCLGFBQWI7QUFBMkI7QUFBTzZELE1BQUFBLFdBQWxDLENBQThDeEQsSUFBSSxDQUFDQyxTQUFMLENBQWVzRCxPQUFmLENBQTlDLEVBQXVFLEdBQXZFO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXRXQTtBQUFBO0FBQUEsV0F1V0Usd0JBQWV4RyxPQUFmLEVBQXdCMEcsT0FBeEIsRUFBaUM7QUFDL0I7QUFDQTtBQUNBLGNBQVFBLE9BQVI7QUFDRSxhQUFLekgsT0FBTyxDQUFDRyx3QkFBYjtBQUNFLGVBQUt1SCxtQkFBTCxDQUF5QjNHLE9BQXpCO0FBQ0E7O0FBQ0YsYUFBS2YsT0FBTyxDQUFDSSxjQUFiO0FBQ0UsZUFBS3VILG9CQUFMLENBQTBCNUcsT0FBMUI7QUFDQTs7QUFDRixhQUFLZixPQUFPLENBQUNNLGFBQWI7QUFDRSxlQUFLMEMsYUFBTCxHQUFxQixJQUFyQjtBQUNBOztBQUNGLGFBQUtoRCxPQUFPLENBQUNPLGdCQUFiO0FBQ0UsZUFBS3FILHNCQUFMO0FBQ0E7O0FBQ0YsYUFBSzVILE9BQU8sQ0FBQ1MsY0FBYjtBQUNFLGVBQUtvSCxvQkFBTCxDQUEwQjlHLE9BQTFCOztBQUNGO0FBQ0U7QUFoQko7QUFrQkQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFqWUE7QUFBQTtBQUFBLFdBa1lFLDhCQUFxQkEsT0FBckIsRUFBOEI7QUFDNUIsVUFBSSxDQUFDLEtBQUtpQyxhQUFWLEVBQXlCO0FBQ3ZCO0FBQ0Q7O0FBQ0QsVUFBTThFLFlBQVksR0FDaEJDLE1BQU0sQ0FBQyxLQUFLckYsYUFBTCxDQUFtQmtDLE1BQXBCLENBQU4sR0FDQTdELE9BQU8sQ0FBQyxVQUFELENBRFAsR0FFQUEsT0FBTyxDQUFDLFVBQUQsQ0FIVDtBQUlBLFVBQU1pSCxXQUFXLEdBQ2ZELE1BQU0sQ0FBQyxLQUFLckYsYUFBTCxDQUFtQm9DLEtBQXBCLENBQU4sR0FDQS9ELE9BQU8sQ0FBQyxVQUFELENBRFAsR0FFQUEsT0FBTyxDQUFDLFVBQUQsQ0FIVDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSxVQUNFa0gsS0FBSyxDQUFDSCxZQUFELENBQUwsSUFDQUcsS0FBSyxDQUFDRCxXQUFELENBREwsSUFFQ2pILE9BQU8sQ0FBQyxNQUFELENBQVAsSUFBbUIsQ0FBQyxLQUFLdUMsYUFGMUIsSUFHQyxDQUFDdkMsT0FBTyxDQUFDLE1BQUQsQ0FBUixJQUNDLENBQUMsS0FBS3NDLGdCQURQLEtBRUUyRSxXQUFXLEdBQUcsS0FBS3RGLGFBQUwsQ0FBbUJvQyxLQUFqQyxJQUNDZ0QsWUFBWSxHQUFHLEtBQUtwRixhQUFMLENBQW1Ca0MsTUFIckMsQ0FKSCxFQVFFO0FBQ0EvRixRQUFBQSxHQUFHLEdBQUd3SCxLQUFOLENBQVkxRixHQUFaLEVBQWlCLHdCQUFqQjtBQUNBLGFBQUt1SCxrQkFBTDtBQUF3QjtBQUFlLGFBQXZDLEVBQThDbEksT0FBTyxDQUFDSyxlQUF0RDtBQUNBO0FBQ0Q7O0FBQ0Q7QUFDQSxVQUNFeUgsWUFBWSxHQUFHLEtBQUtqRixTQUFMLENBQWUwRCxPQUFmLEdBQXlCM0IsTUFBeEMsSUFDQW9ELFdBQVcsR0FBRyxLQUFLbkYsU0FBTCxDQUFlMEQsT0FBZixHQUF5QnpCLEtBRnpDLEVBR0U7QUFDQSxhQUFLb0Qsa0JBQUw7QUFBd0I7QUFBZSxhQUF2QyxFQUE4Q2xJLE9BQU8sQ0FBQ0ssZUFBdEQ7QUFDQTtBQUNEOztBQUNELFdBQUs4SCxnQkFBTCxDQUFzQkwsWUFBdEIsRUFBb0NFLFdBQXBDLEVBQWlEaEksT0FBTyxDQUFDSyxlQUF6RDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQTNhQTtBQUFBO0FBQUEsV0E0YUUsa0NBQXlCO0FBQ3ZCO0FBQ0EsVUFBSSxLQUFLMEMsWUFBTCxJQUFxQixDQUFDLEtBQUtDLGFBQS9CLEVBQThDO0FBQzVDLGFBQUtrRixrQkFBTDtBQUF3QjtBQUFlLGFBQXZDLEVBQThDbEksT0FBTyxDQUFDUSxpQkFBdEQ7QUFDQTtBQUNEOztBQUNELFdBQUsySCxnQkFBTCxDQUNFLEtBQUt4RixvQkFBTCxDQUEwQmlDLE1BRDVCLEVBRUUsS0FBS2pDLG9CQUFMLENBQTBCbUMsS0FGNUIsRUFHRTlFLE9BQU8sQ0FBQ1EsaUJBSFY7QUFJRTtBQUFrQixVQUpwQjtBQU1EO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUE5YkE7QUFBQTtBQUFBLFdBK2JFLHlCQUFnQm9FLE1BQWhCLEVBQXdCRSxLQUF4QixFQUErQnNELFdBQS9CLEVBQTRDO0FBQUE7O0FBQzFDLFdBQUtyRixZQUFMLEdBQW9CcUYsV0FBVyxJQUFJcEksT0FBTyxDQUFDUSxpQkFBM0M7QUFDQSxXQUFLb0IsYUFBTCxDQUFtQnlHLG9CQUFuQjtBQUNFO0FBQWdCLGtCQUFNO0FBQ3BCLFFBQUEsTUFBSSxDQUFDekcsYUFBTCxDQUFtQjBHLFdBQW5CLEdBQWlDQyxPQUFqQztBQUNELE9BSEg7QUFJRTtBQUFlLGtCQUFNO0FBQ25CLFlBQUksTUFBSSxDQUFDcEcsT0FBVCxFQUFrQjtBQUNoQjlDLFVBQUFBLFNBQVMsQ0FBQyxNQUFJLENBQUM4QyxPQUFOLEVBQWU7QUFDdEIsc0JBQVV5QyxNQUFNLEdBQUcsSUFERztBQUV0QixxQkFBU0UsS0FBSyxHQUFHO0FBRkssV0FBZixDQUFUO0FBSUEsVUFBQSxNQUFJLENBQUNwQyxhQUFMLENBQW1Ca0MsTUFBbkIsR0FBNEJBLE1BQTVCO0FBQ0EsVUFBQSxNQUFJLENBQUNsQyxhQUFMLENBQW1Cb0MsS0FBbkIsR0FBMkJBLEtBQTNCO0FBQ0Q7O0FBQ0QsUUFBQSxNQUFJLENBQUNvRCxrQkFBTDtBQUF3QjtBQUFlLFlBQXZDLEVBQTZDRSxXQUE3QztBQUNELE9BZEgsRUFlRSxLQUFLakcsT0FmUDtBQWlCRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyZUE7QUFBQTtBQUFBLFdBc2VFLDBCQUFpQnlDLE1BQWpCLEVBQXlCRSxLQUF6QixFQUFnQ3NELFdBQWhDLEVBQTZDSSxhQUE3QyxFQUE0RDtBQUFBOztBQUMxRCxhQUFPLEtBQUszRixTQUFMLENBQ0ppRCxrQkFESSxDQUNlLEtBQUtsRSxhQUFMLENBQW1CdUIsT0FEbEMsRUFFSjRDLElBRkksQ0FFQyxVQUFDMEMsR0FBRCxFQUFTO0FBQ2IsWUFBSSxDQUFDRCxhQUFELElBQWtCMUQsS0FBSyxJQUFJMkQsR0FBRyxDQUFDM0QsS0FBL0IsSUFBd0NGLE1BQU0sSUFBSTZELEdBQUcsQ0FBQzdELE1BQTFELEVBQWtFO0FBQ2hFLFVBQUEsTUFBSSxDQUFDOEQsZUFBTCxDQUFxQjlELE1BQXJCLEVBQTZCRSxLQUE3QixFQUFvQ3NELFdBQXBDO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsVUFBQSxNQUFJLENBQUNPLHVCQUFMLENBQ0UvRCxNQURGLEVBRUVFLEtBRkYsRUFHRXNELFdBSEYsRUFJRUksYUFKRjtBQU1EO0FBQ0YsT0FiSSxDQUFQO0FBY0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUExZkE7QUFBQTtBQUFBLFdBMmZFLDhCQUFxQnpILE9BQXJCLEVBQThCO0FBQzVCLFVBQUksQ0FBQyxLQUFLaUMsYUFBVixFQUF5QjtBQUN2QjtBQUNEOztBQUNELFVBQU00RixZQUFZLEdBQ2hCYixNQUFNLENBQUMsS0FBS3JGLGFBQUwsQ0FBbUJrQyxNQUFwQixDQUFOLElBQ0M3RCxPQUFPLENBQUMsVUFBRCxDQUFQLEdBQXNCQSxPQUFPLENBQUMsVUFBRCxDQUQ5QixDQURGO0FBR0EsVUFBTThILFdBQVcsR0FDZmQsTUFBTSxDQUFDLEtBQUtyRixhQUFMLENBQW1Cb0MsS0FBcEIsQ0FBTixJQUNDL0QsT0FBTyxDQUFDLFVBQUQsQ0FBUCxHQUFzQkEsT0FBTyxDQUFDLFVBQUQsQ0FEOUIsQ0FERjs7QUFJQTtBQUNBLFVBQUlrSCxLQUFLLENBQUNZLFdBQUQsQ0FBTCxJQUFzQlosS0FBSyxDQUFDVyxZQUFELENBQS9CLEVBQStDO0FBQzdDL0osUUFBQUEsR0FBRyxHQUFHd0gsS0FBTixDQUFZMUYsR0FBWixFQUFpQix3QkFBakI7QUFDQTtBQUNEOztBQUVELFdBQUtnSSx1QkFBTCxDQUNFQyxZQURGLEVBRUVDLFdBRkYsRUFHRTdJLE9BQU8sQ0FBQ1UsZUFIVixFQUlFLElBSkY7QUFNRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXZoQkE7QUFBQTtBQUFBLFdBd2hCRSw0QkFBbUJvSSxPQUFuQixFQUE0QlYsV0FBNUIsRUFBeUM7QUFBQTs7QUFDdkMsVUFBSSxDQUFDLEtBQUtqRyxPQUFWLEVBQW1CO0FBQ2pCO0FBQ0Q7O0FBQ0QsV0FBS1UsU0FBTCxDQUNHaUQsa0JBREgsQ0FDc0IsS0FBSzNELE9BRDNCLEVBRUc0RCxJQUZILENBRVEsVUFBQ2hCLFNBQUQsRUFBZTtBQUNuQixRQUFBLE1BQUksQ0FBQ2xELGtCQUFMOztBQUNBLFlBQU1tRSxhQUFhLEdBQUcsTUFBSSxDQUFDWixXQUFMLENBQWlCTCxTQUFqQixDQUF0Qjs7QUFDQSxRQUFBLE1BQUksQ0FBQ1EsWUFBTCxDQUNFO0FBQ0VXLFVBQUFBLEdBQUcsRUFBRSxNQUFJLENBQUMxRCxJQURaO0FBRUVzRyxVQUFBQSxPQUFPLEVBQVBBLE9BRkY7QUFHRTdDLFVBQUFBLFdBQVcsRUFBRUQsYUFIZjtBQUlFLHNCQUFZLE1BQUksQ0FBQzVELGdCQUFMLENBQXNCLG9CQUF0QixDQUpkO0FBS0Usc0JBQVksTUFBSSxDQUFDQSxnQkFBTCxDQUFzQixvQkFBdEIsQ0FMZDtBQU1FLHNCQUFZLE1BQUksQ0FBQ0EsZ0JBQUwsQ0FBc0Isb0JBQXRCLENBTmQ7QUFPRSxzQkFBWSxNQUFJLENBQUNBLGdCQUFMLENBQXNCLG9CQUF0QixDQVBkO0FBUUUyRyxVQUFBQSxJQUFJLEVBQUU7QUFSUixTQURGLEVBV0VYLFdBWEY7QUFhRCxPQWxCSCxFQW1CR2pDLEtBbkJILENBbUJTLFVBQUNDLEdBQUQ7QUFBQSxlQUFTdkgsR0FBRyxHQUFHd0gsS0FBTixDQUFZMUYsR0FBWixFQUFpQnlGLEdBQWpCLENBQVQ7QUFBQSxPQW5CVDtBQW9CRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUExakJBO0FBQUE7QUFBQSxXQTJqQkUsaUNBQXdCeEIsTUFBeEIsRUFBZ0NFLEtBQWhDLEVBQXVDc0QsV0FBdkMsRUFBb0RZLGVBQXBELEVBQXFFO0FBQUE7O0FBQ25FO0FBQ0E7QUFDQSxXQUFLcEgsYUFBTCxDQUNHcUgsaUJBREgsQ0FDcUJyRSxNQURyQixFQUM2QkUsS0FEN0IsRUFFR2lCLElBRkgsQ0FHSSxZQUFNO0FBQ0osUUFBQSxNQUFJLENBQUNsRSxrQkFBTDs7QUFDQTtBQUNBO0FBQ0EsUUFBQSxNQUFJLENBQUM2RyxlQUFMLENBQXFCOUQsTUFBckIsRUFBNkJFLEtBQTdCLEVBQW9Dc0QsV0FBcEM7QUFDRCxPQVJMO0FBU0k7QUFBdUIsa0JBQU07QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFBLE1BQUksQ0FBQ3hHLGFBQUwsQ0FBbUIwRyxXQUFuQixHQUFpQ1ksc0JBQWpDOztBQUNBLFlBQUlGLGVBQUosRUFBcUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFBLE1BQUksQ0FBQ04sZUFBTCxDQUFxQjlELE1BQXJCLEVBQTZCRSxLQUE3QixFQUFvQ3NELFdBQXBDO0FBQ0QsU0FORCxNQU1PO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFBLE1BQUksQ0FBQ0Ysa0JBQUwsQ0FBd0IsS0FBeEIsRUFBK0JFLFdBQS9CO0FBQ0Q7QUFDRixPQTVCTCxFQThCR2pDLEtBOUJILENBOEJTLFVBQUNDLEdBQUQsRUFBUztBQUNkLFlBQUlBLEdBQUcsQ0FBQ21CLE9BQUosSUFBZSxXQUFuQixFQUFnQztBQUM5QjFJLFVBQUFBLEdBQUcsR0FBR3dILEtBQU4sQ0FBWTFGLEdBQVosRUFBaUJ5RixHQUFqQjtBQUNBO0FBQ0Q7O0FBQ0R2SCxRQUFBQSxHQUFHLEdBQUd3SCxLQUFOLENBQVkxRixHQUFaLHdCQUFxQ3lGLEdBQXJDOztBQUNBLFFBQUEsTUFBSSxDQUFDOEIsa0JBQUwsQ0FBd0IsS0FBeEIsRUFBK0JFLFdBQS9CO0FBQ0QsT0FyQ0g7QUFzQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTFtQkE7QUFBQTtBQUFBLFdBMm1CRSw2QkFBb0JySCxPQUFwQixFQUE2QjtBQUFBOztBQUMzQixVQUFJb0ksU0FBSjs7QUFDQSxVQUFJLENBQUNwSSxPQUFELElBQVksRUFBRW9JLFNBQVMsR0FBR0MsUUFBUSxDQUFDckksT0FBTyxDQUFDLFFBQUQsQ0FBUixFQUFvQixFQUFwQixDQUF0QixDQUFoQixFQUFnRTtBQUM5RDtBQUNEOztBQUNELFdBQUthLGFBQUwsQ0FDR3lILG1CQURILENBQ3VCRixTQUR2QixFQUVHcEQsSUFGSCxDQUVRLFlBQU07QUFDVixRQUFBLE1BQUksQ0FBQ2xFLGtCQUFMOztBQUNBLFFBQUEsTUFBSSxDQUFDeUgsY0FBTCxDQUFvQkgsU0FBcEI7QUFDRCxPQUxILEVBTUdoRCxLQU5ILENBTVMsVUFBQ0MsR0FBRCxFQUFTO0FBQ2RySCxRQUFBQSxJQUFJLEdBQUdtQyxJQUFQLENBQVlQLEdBQVosRUFBaUJ5RixHQUFqQjs7QUFDQSxvQ0FBd0IsTUFBSSxDQUFDeEUsYUFBTCxDQUFtQjJILFdBQW5CLEVBQXhCO0FBQUEsWUFBTzNFLE1BQVAseUJBQU9BLE1BQVA7QUFBQSxZQUFlRSxLQUFmLHlCQUFlQSxLQUFmOztBQUNBLFlBQUlBLEtBQUssSUFBSUYsTUFBYixFQUFxQjtBQUNuQixVQUFBLE1BQUksQ0FBQzBFLGNBQUwsQ0FBb0IxRSxNQUFwQjtBQUNEO0FBQ0YsT0FaSDtBQWFEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXBvQkE7QUFBQTtBQUFBLFdBcW9CRSx3QkFBZXVFLFNBQWYsRUFBMEI7QUFDeEIsVUFBTXpGLE1BQU0sR0FBRzdFLEdBQUcsR0FBRzJLLGFBQU4sQ0FBb0IsS0FBSzVILGFBQUwsQ0FBbUI4QixNQUF2QyxDQUFmO0FBQ0EsVUFBTStGLFlBQVksR0FBR0wsUUFBUSxDQUFDaEssUUFBUSxDQUFDc0UsTUFBRCxFQUFTLFFBQVQsQ0FBVCxFQUE2QixFQUE3QixDQUFSLElBQTRDLENBQWpFOztBQUNBLFVBQUkrRixZQUFZLElBQUlOLFNBQXBCLEVBQStCO0FBQzdCOUosUUFBQUEsU0FBUyxDQUFDcUUsTUFBRCxFQUFTO0FBQUNrQixVQUFBQSxNQUFNLEVBQUt1RSxTQUFMO0FBQVAsU0FBVCxDQUFUO0FBQ0Q7O0FBQ0QsV0FBS3ZILGFBQUwsQ0FBbUI4SCwwQkFBbkI7O0FBQ0E7QUFDQSxVQUFJLENBQUMsS0FBS3ZILE9BQUwsQ0FBYXdCLGFBQWxCLEVBQWlDO0FBQy9CO0FBQ0Q7O0FBQ0QsV0FBS3hCLE9BQUwsQ0FBYXdCLGFBQWI7QUFBMkI7QUFBTzZELE1BQUFBLFdBQWxDLENBQ0V4RCxJQUFJLENBQUNDLFNBQUwsQ0FBZWpGLElBQUksQ0FBQztBQUFDLG1CQUFXLGlCQUFaO0FBQStCLGFBQUssS0FBS3FDO0FBQXpDLE9BQUQsQ0FBbkIsQ0FERixFQUVFLEdBRkY7QUFJRDtBQUVEO0FBQ0Y7QUFDQTs7QUF4cEJBO0FBQUE7QUFBQSxXQXlwQkUsbUJBQVU7QUFDUixXQUFLYyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQU8xQyxjQUFjLENBQUMsS0FBS3lDLFNBQU4sQ0FBckI7O0FBQ0EsVUFBSSxLQUFLcUIsU0FBVCxFQUFvQjtBQUNsQixhQUFLQSxTQUFMO0FBQ0Q7O0FBQ0QsVUFBSUwsTUFBTSxDQUFDeUcsSUFBUCxDQUFZbEssY0FBWixFQUE0Qm1LLE1BQTVCLElBQXNDLENBQTFDLEVBQTZDO0FBQzNDQyxRQUFBQSx1QkFBdUI7QUFDeEI7QUFDRjtBQWxxQkg7O0FBQUE7QUFBQTs7QUFxcUJBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0EsdUJBQVQsR0FBbUM7QUFDeENDLEVBQUFBLE1BQU0sQ0FBQ0MsbUJBQVAsQ0FBMkIsU0FBM0IsRUFBc0NuSixpQkFBdEMsRUFBeUQsS0FBekQ7QUFDQWxCLEVBQUFBLHlCQUF5QixHQUFHLEtBQTVCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3QsIGhhc093bn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7Z2V0RGF0YX0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2dldFBhZ2VMYXlvdXRCb3hCbG9ja2luZ30gZnJvbSAnI2NvcmUvZG9tL2xheW91dC9wYWdlLWxheW91dC1ib3gnO1xuaW1wb3J0IHtnZXRTdHlsZSwgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHt0aHJvdHRsZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuaW1wb3J0IHt0cnlQYXJzZUpzb259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdC9qc29uJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hbmFnZSBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IFNhZmVmcmFtZSBhZCBzbG90cy5cbiAqXG4gKiBNYXBzIGEgc2VudGluZWwgdmFsdWUgdG8gYW4gaW5zdGFuY2Ugb2YgdGhlIFNhZmVmcmFtZUhvc3RBcGkgdG8gd2hpY2ggdGhhdFxuICogc2VudGluZWwgdmFsdWUgYmVsb25ncy5cbiAqIEB0eXBlIHshT2JqZWN0PHN0cmluZywgIVNhZmVmcmFtZUhvc3RBcGk+fVxuICovXG5leHBvcnQgY29uc3Qgc2FmZWZyYW1lSG9zdHMgPSB7fTtcblxuLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xubGV0IHNhZmVmcmFtZUxpc3RlbmVyQ3JlYXRlZF8gPSBmYWxzZTtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgTUVTU0FHRV9GSUVMRFMgPSB7XG4gIENIQU5ORUw6ICdjJyxcbiAgU0VOVElORUw6ICdlJyxcbiAgRU5EUE9JTlRfSURFTlRJVFk6ICdpJyxcbiAgUEFZTE9BRDogJ3AnLFxuICBTRVJWSUNFOiAncycsXG4gIE1FU1NBR0U6ICdtZXNzYWdlJyxcbn07XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFNFUlZJQ0UgPSB7XG4gIEdFT01FVFJZX1VQREFURTogJ2dlb21ldHJ5X3VwZGF0ZScsXG4gIENSRUFUSVZFX0dFT01FVFJZX1VQREFURTogJ2NyZWF0aXZlX2dlb21ldHJ5X3VwZGF0ZScsXG4gIEVYUEFORF9SRVFVRVNUOiAnZXhwYW5kX3JlcXVlc3QnLFxuICBFWFBBTkRfUkVTUE9OU0U6ICdleHBhbmRfcmVzcG9uc2UnLFxuICBSRUdJU1RFUl9ET05FOiAncmVnaXN0ZXJfZG9uZScsXG4gIENPTExBUFNFX1JFUVVFU1Q6ICdjb2xsYXBzZV9yZXF1ZXN0JyxcbiAgQ09MTEFQU0VfUkVTUE9OU0U6ICdjb2xsYXBzZV9yZXNwb25zZScsXG4gIFJFU0laRV9SRVFVRVNUOiAncmVzaXplX3JlcXVlc3QnLFxuICBSRVNJWkVfUkVTUE9OU0U6ICdyZXNpemVfcmVzcG9uc2UnLFxufTtcblxuLyoqIEBwcml2YXRlIHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnQU1QLURPVUJMRUNMSUNLLVNBRkVGUkFNRSc7XG5cbi8qKlxuICogRXZlbnQgbGlzdGVuZXIgY2FsbGJhY2sgZm9yIG1lc3NhZ2UgZXZlbnRzLiBJZiBtZXNzYWdlIGlzIGEgU2FmZWZyYW1lXG4gKiBtZXNzYWdlLCBoYW5kbGVzIHRoZSBtZXNzYWdlLiBUaGlzIGxpc3RlbmVyIGlzIHJlZ2lzdGVyZWQgd2l0aGluXG4gKiBTYWZlZnJhbWVIb3N0QXBpLlxuICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYWZlZnJhbWVMaXN0ZW5lcihldmVudCkge1xuICBjb25zdCBkYXRhID0gdHJ5UGFyc2VKc29uKGdldERhdGEoZXZlbnQpKTtcbiAgaWYgKCFkYXRhKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBheWxvYWQgPSB0cnlQYXJzZUpzb24oZGF0YVtNRVNTQUdFX0ZJRUxEUy5QQVlMT0FEXSkgfHwge307XG4gIC8qKlxuICAgKiBJZiB0aGUgc2VudGluZWwgaXMgcHJvdmlkZWQgYXQgdGhlIHRvcCBsZXZlbCwgdGhpcyBpcyBhIG1lc3NhZ2Ugc2ltcGx5XG4gICAqIHRvIHNldHVwIHRoZSBwb3N0TWVzc2FnZSBjaGFubmVsLCBzbyBzZXQgaXQgdXAuXG4gICAqL1xuICBjb25zdCBzZW50aW5lbCA9IGRhdGFbTUVTU0FHRV9GSUVMRFMuU0VOVElORUxdIHx8IHBheWxvYWRbJ3NlbnRpbmVsJ107XG4gIGNvbnN0IHNhZmVmcmFtZUhvc3QgPSBzYWZlZnJhbWVIb3N0c1tzZW50aW5lbF07XG4gIGlmICghc2FmZWZyYW1lSG9zdCkge1xuICAgIGRldigpLndhcm4oVEFHLCBgU2FmZWZyYW1lIEhvc3QgZm9yIHNlbnRpbmVsOiAke3NlbnRpbmVsfSBub3QgZm91bmQuYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghc2FmZWZyYW1lSG9zdC5lcXVhbHNTYWZlZnJhbWVDb250ZW50V2luZG93KGV2ZW50LnNvdXJjZSkpIHtcbiAgICBkZXYoKS53YXJuKFRBRywgYFNhZmVmcmFtZSBzb3VyY2UgZGlkIG5vdCBtYXRjaCBldmVudC5zb3VyY2UuYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghc2FmZWZyYW1lSG9zdC5jaGFubmVsKSB7XG4gICAgc2FmZWZyYW1lSG9zdC5jb25uZWN0TWVzc2FnaW5nQ2hhbm5lbChkYXRhW01FU1NBR0VfRklFTERTLkNIQU5ORUxdKTtcbiAgfSBlbHNlIGlmIChwYXlsb2FkKSB7XG4gICAgLy8gQ3VycmVudGx5IHdlIGRvIG5vdCBleHBlY3QgYSBwYXlsb2FkIG9uIGluaXRpYWwgY29ubmVjdGlvbiBtZXNzYWdlcy5cbiAgICBzYWZlZnJhbWVIb3N0LnByb2Nlc3NNZXNzYWdlKFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHBheWxvYWQpLFxuICAgICAgZGF0YVtNRVNTQUdFX0ZJRUxEUy5TRVJWSUNFXVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBob3N0IEFQSSBmb3IgRG91YmxlQ2xpY2sgU2FmZWZyYW1lIHRvIGFsbG93IHRoZSBmb2xsb3dpbmdcbiAqIFNhZmVmcmFtZSBjb250YWluZXIgQVBJcyB0byB3b3JrOlxuICogICAtICRzZi5leHQuZXhwYW5kKClcbiAqICAgLSAkc2YuZXh0LmNvbGxhcHNlKClcbiAqICAgLSAkc2YuZXh0Lmdlb20oKSBFeHBhbmQgYW5kIGNvbGxhcHNlIGFyZSBib3RoIGltcGxlbWVudGVkIHV0aWxpemluZyBBTVAnc1xuICogICAgIGJ1aWx0IGluIGVsZW1lbnQgcmVzaXppbmcuXG4gKlxuICogRm9yIGdlb20sIHRoZSBob3N0IG5lZWRzIHRvIHNlbmQgZ2VvbWV0cnkgdXBkYXRlcyBpbnRvIHRoZSBjb250YWluZXIgd2hlbmV2ZXJcbiAqICBhIHBvc2l0aW9uIGNoYW5nZSBoYXBwZW5zLCBhdCBhIG1heCBmcmVxdWVuY3kgb2YgMSBtZXNzYWdlL3NlY29uZC4gVG9cbiAqICBpbXBsZW1lbnQgdGhpcyBtZXNzYWdpbmcsIHdlIGFyZSBsZXZlcmFnaW5nIHRoZSBleGlzdGluZ1xuICogIEludGVyc2VjdGlvbk9ic2VydmVyIGNsYXNzIHRoYXQgd29ya3Mgd2l0aCBBTVAgZWxlbWVudHMuIEhvd2V2ZXIsIHRoZVxuICogIHNhZmVmcmFtZSBpZnJhbWUgdGhhdCB3ZSBuZWVkIHRvIG1vbml0b3IgaXMgbm90IGFuIEFNUCBlbGVtZW50LCBidXQgcmF0aGVyXG4gKiAgY29udGFpbmVkIHdpdGhpbiBhbiBhbXAtYWQuIFNvLCB3ZSBhcmUgZG9pbmcgaW50ZXJzZWN0aW9uIG9ic2VydmluZyBvbiB0aGVcbiAqICBhbXAtYWQsIGFuZCBjYWxjdWxhdGluZyB0aGUgY29ycmVjdCBwb3NpdGlvbiBmb3IgdGhlIGlmcmFtZSB3aGVuZXZlciB3ZSBnZXRcbiAqICBhbiB1cGRhdGUuXG4gKlxuICogV2UgcGFzcyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGludG8gdGhlIEludGVyc2VjdGlvbk9ic2VydmVyIGNsYXNzLCB3aGljaFxuICogIHRoZW4gY2FsbHMgdGhlIGluc3RhbmNlIG9mIHNlbmQoKSBiZWxvdyB3aGVuZXZlciBhbiB1cGRhdGUgb2NjdXJzLlxuICovXG5leHBvcnQgY2xhc3MgU2FmZWZyYW1lSG9zdEFwaSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsfSBiYXNlSW5zdGFuY2VcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0ZsdWlkXG4gICAqIEBwYXJhbSB7e3dpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlcn19IGNyZWF0aXZlU2l6ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoYmFzZUluc3RhbmNlLCBpc0ZsdWlkLCBjcmVhdGl2ZVNpemUpIHtcbiAgICAvKiogQHByaXZhdGUgeyEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsfSAqL1xuICAgIHRoaXMuYmFzZUluc3RhbmNlXyA9IGJhc2VJbnN0YW5jZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMuY2hlY2tTdGlsbEN1cnJlbnRfID0gdGhpcy5iYXNlSW5zdGFuY2VfLnZlcmlmeVN0aWxsQ3VycmVudC5iaW5kKFxuICAgICAgdGhpcy5iYXNlSW5zdGFuY2VfXG4gICAgKSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHRoaXMuYmFzZUluc3RhbmNlXy53aW47XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLnNlbnRpbmVsXyA9IHRoaXMuYmFzZUluc3RhbmNlXy5zZW50aW5lbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5pZnJhbWVfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLmNoYW5uZWwgPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLmN1cnJlbnRHZW9tZXRyeV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5lbmRwb2ludElkZW50aXR5XyA9IE1hdGgucmFuZG9tKCk7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnVpZF8gPSBNYXRoLnJhbmRvbSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNGbHVpZF8gPSBpc0ZsdWlkO1xuXG4gICAgLyoqIEBwcml2YXRlIHt7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyfX0gKi9cbiAgICB0aGlzLmNyZWF0aXZlU2l6ZV8gPSBjcmVhdGl2ZVNpemU7XG5cbiAgICAvKiogQHByaXZhdGUge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSAqL1xuICAgIHRoaXMuaW5pdGlhbENyZWF0aXZlU2l6ZV8gPSAvKiogQHR5cGUge3t3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXJ9fSAqLyAoe1xuICAgICAgLi4uY3JlYXRpdmVTaXplLFxuICAgIH0pO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez9Qcm9taXNlfSAqL1xuICAgIHRoaXMuZGVsYXlfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Li4vLi4vLi4vc3JjL3NlcnZpY2Uvdmlld3BvcnQvdmlld3BvcnQtaW50ZXJmYWNlLlZpZXdwb3J0SW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld3BvcnRfID0gdGhpcy5iYXNlSW5zdGFuY2VfLmdldFZpZXdwb3J0KCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0NvbGxhcHNlZF8gPSB0cnVlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNSZWdpc3RlcmVkXyA9IGZhbHNlO1xuXG4gICAgLy8gVE9ETzogTWFrZSB0aGlzIHBhZ2UtbGV2ZWwuXG4gICAgY29uc3Qgc2ZDb25maWcgPSBPYmplY3QoXG4gICAgICB0cnlQYXJzZUpzb24oXG4gICAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zYWZlZnJhbWUtY29uZmlnJylcbiAgICAgICkgfHwge31cbiAgICApO1xuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmV4cGFuZEJ5T3ZlcmxheV8gPSBoYXNPd24oc2ZDb25maWcsICdleHBhbmRCeU92ZXJsYXknKVxuICAgICAgPyBzZkNvbmZpZ1snZXhwYW5kQnlPdmVybGF5J11cbiAgICAgIDogdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmV4cGFuZEJ5UHVzaF8gPSBoYXNPd24oc2ZDb25maWcsICdleHBhbmRCeVB1c2gnKVxuICAgICAgPyBzZkNvbmZpZ1snZXhwYW5kQnlQdXNoJ11cbiAgICAgIDogdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0Z1bmN0aW9ufSAqL1xuICAgIHRoaXMudW5saXN0ZW5fID0gbnVsbDtcblxuICAgIHRoaXMucmVnaXN0ZXJTYWZlZnJhbWVIb3N0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB3aW5kb3cgbWF0Y2hlcyB0aGUgU2FmZWZyYW1lJ3MgY29udGVudCB3aW5kb3cuXG4gICAqIENvbXBhcmluZyB0byBhIG51bGwgd2luZG93IHdpbGwgYWx3YXlzIHJldHVybiBmYWxzZS5cbiAgICpcbiAgICogQHBhcmFtIHs/V2luZG93fSBvdGhlcldpbmRvd1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzU2FmZWZyYW1lQ29udGVudFdpbmRvdyhvdGhlcldpbmRvdykge1xuICAgIHJldHVybiAoXG4gICAgICAhIW90aGVyV2luZG93ICYmIG90aGVyV2luZG93ID09PSB0aGlzLmJhc2VJbnN0YW5jZV8uaWZyYW1lLmNvbnRlbnRXaW5kb3dcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFNhZmVmcmFtZSBzcGVjaWZpYyBuYW1lIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbmVlZGVkIGZvciB0aGVcbiAgICogU2FmZWZyYW1lIGNyZWF0aXZlIHRvIHByb3Blcmx5IHNldHVwLlxuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAgICovXG4gIGdldFNhZmVmcmFtZU5hbWVBdHRyKCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBkaWN0KHt9KTtcbiAgICBhdHRyaWJ1dGVzWyd1aWQnXSA9IHRoaXMudWlkXztcbiAgICBhdHRyaWJ1dGVzWydob3N0UGVlck5hbWUnXSA9IHRoaXMud2luXy5sb2NhdGlvbi5vcmlnaW47XG4gICAgYXR0cmlidXRlc1snaW5pdGlhbEdlb21ldHJ5J10gPSB0aGlzLmdldEluaXRpYWxHZW9tZXRyeSgpO1xuICAgIGF0dHJpYnV0ZXNbJ3Blcm1pc3Npb25zJ10gPSBKU09OLnN0cmluZ2lmeShcbiAgICAgIGRpY3Qoe1xuICAgICAgICAnZXhwYW5kQnlPdmVybGF5JzogdGhpcy5leHBhbmRCeU92ZXJsYXlfLFxuICAgICAgICAnZXhwYW5kQnlQdXNoJzogdGhpcy5leHBhbmRCeVB1c2hfLFxuICAgICAgICAncmVhZENvb2tpZSc6IGZhbHNlLFxuICAgICAgICAnd3JpdGVDb29raWUnOiBmYWxzZSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBhdHRyaWJ1dGVzWydtZXRhZGF0YSddID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICBkaWN0KHtcbiAgICAgICAgJ3NoYXJlZCc6IHtcbiAgICAgICAgICAnc2ZfdmVyJzogdGhpcy5iYXNlSW5zdGFuY2VfLnNhZmVmcmFtZVZlcnNpb24sXG4gICAgICAgICAgJ2NrX29uJzogMSxcbiAgICAgICAgICAnZmxhc2hfdmVyJzogJzI2LjAuMCcsXG4gICAgICAgICAgLy8gT25jZSBHUFQgU2FmZWZyYW1lIGlzIHVwZGF0ZWQgdG8gbG9vayBpbiBhbXAgb2JqZWN0LFxuICAgICAgICAgIC8vIHJlbW92ZSB0aGlzIGNhbm9uaWNhbF91cmwgaGVyZS5cbiAgICAgICAgICAnY2Fub25pY2FsX3VybCc6IHRoaXMubWF5YmVHZXRDYW5vbmljYWxVcmwoKSxcbiAgICAgICAgICAnYW1wJzoge1xuICAgICAgICAgICAgJ2Nhbm9uaWNhbF91cmwnOiB0aGlzLm1heWJlR2V0Q2Fub25pY2FsVXJsKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBhdHRyaWJ1dGVzWydyZXBvcnRDcmVhdGl2ZUdlb21ldHJ5J10gPSB0aGlzLmlzRmx1aWRfO1xuICAgIGF0dHJpYnV0ZXNbJ2lzRGlmZmVyZW50U291cmNlV2luZG93J10gPSBmYWxzZTtcbiAgICBhdHRyaWJ1dGVzWydzZW50aW5lbCddID0gdGhpcy5zZW50aW5lbF87XG4gICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2Fub25pY2FsIFVSTCBvZiB0aGUgcGFnZSwgaWYgdGhlIHB1Ymxpc2hlciBhbGxvd3NcbiAgICogaXQgdG8gYmUgcGFzc2VkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8dW5kZWZpbmVkfVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIG1heWJlR2V0Q2Fub25pY2FsVXJsKCkge1xuICAgIC8vIERvbid0IGFsbG93IGZvciByZWZlcnJlciBwb2xpY3kgc2FtZS1vcmlnaW4sXG4gICAgLy8gYXMgU2FmZWZyYW1lIHdpbGwgYWx3YXlzIGJlIGEgZGlmZmVyZW50IG9yaWdpbi5cbiAgICAvLyBEb24ndCBhbGxvdyBmb3Igbm8tcmVmZXJyZXIuXG4gICAgY29uc3QgYW1wZG9jID0gdGhpcy5iYXNlSW5zdGFuY2VfLmdldEFtcERvYygpO1xuICAgIGNvbnN0IHtjYW5vbmljYWxVcmx9ID0gU2VydmljZXMuZG9jdW1lbnRJbmZvRm9yRG9jKGFtcGRvYyk7XG4gICAgY29uc3QgbWV0YVJlZmVycmVyID0gYW1wZG9jLmdldE1ldGFCeU5hbWUoJ3JlZmVycmVyJyk7XG4gICAgaWYgKCFtZXRhUmVmZXJyZXIpIHtcbiAgICAgIHJldHVybiBjYW5vbmljYWxVcmw7XG4gICAgfVxuICAgIHN3aXRjaCAobWV0YVJlZmVycmVyKSB7XG4gICAgICBjYXNlICdzYW1lLW9yaWdpbic6XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgJ25vLXJlZmVycmVyJzpcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSAnb3JpZ2luJzpcbiAgICAgICAgcmV0dXJuIHBhcnNlVXJsRGVwcmVjYXRlZChjYW5vbmljYWxVcmwpLm9yaWdpbjtcbiAgICB9XG4gICAgcmV0dXJuIGNhbm9uaWNhbFVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbml0aWFsR2VvbWV0cnkgdG8gYXNzaWduIHRvIHRoZSBuYW1lIG9mIHRoZSBzYWZlZnJhbWVcbiAgICogZm9yIHJlbmRlcmluZy4gVGhpcyBuZWVkcyB0byBiZSBkb25lIGRpZmZlcmVudGx5IHRoYW4gYWxsIHRoZSBvdGhlclxuICAgKiBnZW9tZXRyeSB1cGRhdGVzLCBiZWNhdXNlIHdlIGRvbid0IGFjdHVhbGx5IGhhdmUgYWNjZXNzIHRvIHRoZVxuICAgKiByZW5kZXJlZCBzYWZlZnJhbWUgeWV0LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRJbml0aWFsR2VvbWV0cnkoKSB7XG4gICAgY29uc3QgYW1wQWRCb3ggPSBnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmcodGhpcy5iYXNlSW5zdGFuY2VfLmVsZW1lbnQpO1xuICAgIGNvbnN0IGhlaWdodE9mZnNldCA9IChhbXBBZEJveC5oZWlnaHQgLSB0aGlzLmNyZWF0aXZlU2l6ZV8uaGVpZ2h0KSAvIDI7XG4gICAgY29uc3Qgd2lkdGhPZmZzZXQgPSAoYW1wQWRCb3gud2lkdGggLSB0aGlzLmNyZWF0aXZlU2l6ZV8ud2lkdGgpIC8gMjtcbiAgICBjb25zdCBpZnJhbWVCb3ggPSAvKiogQHR5cGUgeyEuLi8uLi8uLi9zcmMvbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn0gKi8gKHtcbiAgICAgIHRvcDogYW1wQWRCb3gudG9wICsgaGVpZ2h0T2Zmc2V0LFxuICAgICAgYm90dG9tOiBhbXBBZEJveC5ib3R0b20gLSBoZWlnaHRPZmZzZXQsXG4gICAgICBsZWZ0OiBhbXBBZEJveC5sZWZ0ICsgd2lkdGhPZmZzZXQsXG4gICAgICByaWdodDogYW1wQWRCb3gucmlnaHQgLSB3aWR0aE9mZnNldCxcbiAgICAgIGhlaWdodDogdGhpcy5pbml0aWFsQ3JlYXRpdmVTaXplXy5oZWlnaHQsXG4gICAgICB3aWR0aDogdGhpcy5pbml0aWFsQ3JlYXRpdmVTaXplXy53aWR0aCxcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRHZW9tXyhpZnJhbWVCb3gpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGlzIGluc3RhbmNlIGFzIHRoZSBob3N0IEFQSSBmb3IgdGhlIGN1cnJlbnQgc2VudGluZWwuXG4gICAqIElmIHRoZSBnbG9iYWwgc2FmZWZyYW1lIGxpc3RlbmVyIGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZCwgaXQgY3JlYXRlc1xuICAgKiB0aGF0IGFzIHdlbGwuXG4gICAqL1xuICByZWdpc3RlclNhZmVmcmFtZUhvc3QoKSB7XG4gICAgZGV2QXNzZXJ0KHRoaXMuc2VudGluZWxfKTtcbiAgICBzYWZlZnJhbWVIb3N0c1t0aGlzLnNlbnRpbmVsX10gPSBzYWZlZnJhbWVIb3N0c1t0aGlzLnNlbnRpbmVsX10gfHwgdGhpcztcbiAgICBpZiAoIXNhZmVmcmFtZUxpc3RlbmVyQ3JlYXRlZF8pIHtcbiAgICAgIHNhZmVmcmFtZUxpc3RlbmVyQ3JlYXRlZF8gPSB0cnVlO1xuICAgICAgdGhpcy53aW5fLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBzYWZlZnJhbWVMaXN0ZW5lciwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBpbml0aWFsIGNvbm5lY3Rpb24gbWVzc2FnZSB0byB0aGUgc2FmZWZyYW1lIHRvIGZpbmlzaCBpbml0aWFsaXphdGlvbi5cbiAgICogQWxzbyBpbml0aWFsaXplcyB0aGUgc2VuZGluZyBvZiBnZW9tZXRyeSB1cGRhdGUgbWVzc2FnZXMgdG8gdGhlIGZyYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbm5lbFxuICAgKi9cbiAgY29ubmVjdE1lc3NhZ2luZ0NoYW5uZWwoY2hhbm5lbCkge1xuICAgIC8vIFNldCB0aGUgaWZyYW1lIGhlcmUsIGJlY2F1c2Ugd2hlbiBjbGFzcyBpcyBmaXJzdCBjcmVhdGVkIHRoZSBpZnJhbWVcbiAgICAvLyBlbGVtZW50IGRvZXMgbm90IHlldCBleGlzdCBvbiB0aGlzLmJhc2VJbnN0YW5jZV8uIFRoZSBmaXJzdCB0aW1lXG4gICAgLy8gd2UgcmVjZWl2ZSBhIG1lc3NhZ2Ugd2Uga25vdyB0aGF0IGl0IG5vdyBleGlzdHMuXG4gICAgZGV2QXNzZXJ0KHRoaXMuYmFzZUluc3RhbmNlXy5pZnJhbWUpO1xuICAgIHRoaXMuaWZyYW1lXyA9IHRoaXMuYmFzZUluc3RhbmNlXy5pZnJhbWU7XG4gICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbDtcbiAgICB0aGlzLnNldHVwR2VvbV8oKTtcbiAgICB0aGlzLnNlbmRNZXNzYWdlXyhcbiAgICAgIHtcbiAgICAgICAgJ21lc3NhZ2UnOiAnY29ubmVjdCcsXG4gICAgICAgICdjJzogdGhpcy5jaGFubmVsLFxuICAgICAgfSxcbiAgICAgICcnXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIEludGVyc2VjdGlvbk9ic2VydmVyIGluc3RhbmNlIGZvciB0aGlzIFNhZmVmcmFtZUFQSSBpbnN0YW5jZS5cbiAgICogV2UgdXRpbGl6ZSB0aGUgZXhpc3RpbmcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgY2xhc3MsIGJ5IHBhc3NpbmcgaW4gdGhpc1xuICAgKiBjbGFzcyBmb3IgSU8gdG8gdXNlIGluc3RlYWQgb2YgU3Vic2NyaXB0aW9uQXBpIGZvciBzZW5kaW5nIGl0cyB1cGRhdGVcbiAgICogbWVzc2FnZXMuIFRoZSBtZXRob2QgJ3NlbmQnIGJlbG93IGlzIHRyaWdnZXJlZCBieSBJTyBldmVyeSB0aW1lIHRoYXRcbiAgICogYW4gdXBkYXRlIG9jY3Vycy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldHVwR2VvbV8oKSB7XG4gICAgZGV2QXNzZXJ0KHRoaXMuaWZyYW1lXy5jb250ZW50V2luZG93LCAnRnJhbWUgY29udGVudFdpbmRvdyB1bmF2YWlsYWJsZS4nKTtcbiAgICBjb25zdCB0aHJvdHRsZWRVcGRhdGUgPSB0aHJvdHRsZShcbiAgICAgIHRoaXMud2luXyxcbiAgICAgIHRoaXMudXBkYXRlR2VvbWV0cnlfLmJpbmQodGhpcyksXG4gICAgICAxMDAwXG4gICAgKTtcbiAgICBjb25zdCBzY3JvbGxVbmxpc3RlbmVyID0gdGhpcy52aWV3cG9ydF8ub25TY3JvbGwodGhyb3R0bGVkVXBkYXRlKTtcbiAgICBjb25zdCBjaGFuZ2VkVW5saXN0ZW5lciA9IHRoaXMudmlld3BvcnRfLm9uQ2hhbmdlZCh0aHJvdHRsZWRVcGRhdGUpO1xuICAgIHRoaXMudW5saXN0ZW5fID0gKCkgPT4ge1xuICAgICAgc2Nyb2xsVW5saXN0ZW5lcigpO1xuICAgICAgY2hhbmdlZFVubGlzdGVuZXIoKTtcbiAgICB9O1xuICAgIHRoaXMudXBkYXRlR2VvbWV0cnlfKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBnZW9tZXRyeSB1cGRhdGUgbWVzc2FnZSBpbnRvIHRoZSBzYWZlZnJhbWUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVHZW9tZXRyeV8oKSB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52aWV3cG9ydF9cbiAgICAgIC5nZXRDbGllbnRSZWN0QXN5bmModGhpcy5pZnJhbWVfKVxuICAgICAgLnRoZW4oKGlmcmFtZUJveCkgPT4ge1xuICAgICAgICB0aGlzLmNoZWNrU3RpbGxDdXJyZW50XygpO1xuICAgICAgICBjb25zdCBmb3JtYXR0ZWRHZW9tID0gdGhpcy5mb3JtYXRHZW9tXyhpZnJhbWVCb3gpO1xuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlXyhcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuZXdHZW9tZXRyeTogZm9ybWF0dGVkR2VvbSxcbiAgICAgICAgICAgIHVpZDogdGhpcy51aWRfLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgU0VSVklDRS5HRU9NRVRSWV9VUERBVEVcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4gZGV2KCkuZXJyb3IoVEFHLCBlcnIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgZ2VvbWV0cnkgdXBkYXRlIGZvcm1hdCBleHBlY3RlZCBieSBHUFQgU2FmZWZyYW1lLlxuICAgKiBBbHNvIHNldHMgdGhpcy5jdXJyZW50R2VvbWV0cnkgYXMgc2lkZSBlZmZlY3QuXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfSBpZnJhbWVCb3ggVGhlIGVsZW1lbnRSZWN0IGZvciB0aGUgc2FmZWZyYW1lLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFNhZmVmcmFtZSBmb3JtYXR0ZWQgY2hhbmdlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZvcm1hdEdlb21fKGlmcmFtZUJveCkge1xuICAgIGNvbnN0IHZpZXdwb3J0U2l6ZSA9IHRoaXMudmlld3BvcnRfLmdldFNpemUoKTtcbiAgICBjb25zdCBzY3JvbGxMZWZ0ID0gdGhpcy52aWV3cG9ydF8uZ2V0U2Nyb2xsTGVmdCgpO1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMudmlld3BvcnRfLmdldFNjcm9sbFRvcCgpO1xuICAgIGNvbnN0IGN1cnJlbnRHZW9tZXRyeSA9IC8qKiBAdHlwZSB7SnNvbk9iamVjdH0gKi8gKHtcbiAgICAgICd3aW5kb3dDb29yZHNfdCc6IDAsXG4gICAgICAnd2luZG93Q29vcmRzX3InOiB2aWV3cG9ydFNpemUud2lkdGgsXG4gICAgICAnd2luZG93Q29vcmRzX2InOiB2aWV3cG9ydFNpemUuaGVpZ2h0LFxuICAgICAgJ3dpbmRvd0Nvb3Jkc19sJzogMCxcbiAgICAgICdmcmFtZUNvb3Jkc190JzogaWZyYW1lQm94LnRvcCArIHNjcm9sbFRvcCxcbiAgICAgICdmcmFtZUNvb3Jkc19yJzogaWZyYW1lQm94LnJpZ2h0ICsgc2Nyb2xsTGVmdCxcbiAgICAgICdmcmFtZUNvb3Jkc19iJzogaWZyYW1lQm94LmJvdHRvbSArIHNjcm9sbFRvcCxcbiAgICAgICdmcmFtZUNvb3Jkc19sJzogaWZyYW1lQm94LmxlZnQgKyBzY3JvbGxMZWZ0LFxuICAgICAgJ3Bvc0Nvb3Jkc190JzogaWZyYW1lQm94LnRvcCxcbiAgICAgICdwb3NDb29yZHNfYic6IGlmcmFtZUJveC5ib3R0b20sXG4gICAgICAncG9zQ29vcmRzX3InOiBpZnJhbWVCb3gucmlnaHQsXG4gICAgICAncG9zQ29vcmRzX2wnOiBpZnJhbWVCb3gubGVmdCxcbiAgICAgICdzdHlsZVpJbmRleCc6IGdldFN0eWxlKHRoaXMuYmFzZUluc3RhbmNlXy5lbGVtZW50LCAnekluZGV4JyksXG4gICAgICAvLyBBTVAncyBidWlsdCBpbiByZXNpemUgbWV0aG9kb2xvZ3kgdGhhdCB3ZSB1c2Ugb25seSBhbGxvd3MgZXhwYW5zaW9uXG4gICAgICAvLyB0byB0aGUgcmlnaHQgYW5kIGJvdHRvbSwgc28gd2UgZW5mb3JjZSB0aGF0IGhlcmUuXG4gICAgICAnYWxsb3dlZEV4cGFuc2lvbl9yJzogdmlld3BvcnRTaXplLndpZHRoIC0gaWZyYW1lQm94LndpZHRoLFxuICAgICAgJ2FsbG93ZWRFeHBhbnNpb25fYic6IHZpZXdwb3J0U2l6ZS5oZWlnaHQgLSBpZnJhbWVCb3guaGVpZ2h0LFxuICAgICAgJ2FsbG93ZWRFeHBhbnNpb25fdCc6IDAsXG4gICAgICAnYWxsb3dlZEV4cGFuc2lvbl9sJzogMCxcbiAgICAgICd5SW5WaWV3JzogdGhpcy5nZXRQZXJjSW5WaWV3KFxuICAgICAgICB2aWV3cG9ydFNpemUuaGVpZ2h0LFxuICAgICAgICBpZnJhbWVCb3gudG9wLFxuICAgICAgICBpZnJhbWVCb3guYm90dG9tXG4gICAgICApLFxuICAgICAgJ3hJblZpZXcnOiB0aGlzLmdldFBlcmNJblZpZXcoXG4gICAgICAgIHZpZXdwb3J0U2l6ZS53aWR0aCxcbiAgICAgICAgaWZyYW1lQm94LmxlZnQsXG4gICAgICAgIGlmcmFtZUJveC5yaWdodFxuICAgICAgKSxcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRHZW9tZXRyeV8gPSBjdXJyZW50R2VvbWV0cnk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRHZW9tZXRyeSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBib3RoIHRoZSB4SW5WaWV3IGFuZCB5SW5WaWV3IG9mIHRoZVxuICAgKiBnZW9tZXRyeSB1cGRhdGUgbWVzc2FnZXMuIEluIHRoZSBjYXNlIG9mIGEgNDAwcHggd2lkZSB2aWV3cG9ydCxcbiAgICogd2l0aCBhIDEwMHB4IHdpZGUgY3JlYXRpdmUgdGhhdCBzdGFydHMgYXQgeCBwb3NpdGlvbiA1MCwgaWYgd2VcbiAgICogYXJlIGNhbGN1bGF0aW5nIHhJblZpZXcsIHJvb3RCb3VuZEVuZCBpcyA0MDAsIGJvdW5kaW5nUmVjdFN0YXJ0XG4gICAqIGlzIDUwLCBhbmQgYm91bmRpbmdSZWN0RW5kIGlzIDE1MC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvb3RCb3VuZEVuZFxuICAgKiBAcGFyYW0ge251bWJlcn0gYm91bmRpbmdSZWN0U3RhcnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvdW5kaW5nUmVjdEVuZFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRQZXJjSW5WaWV3KHJvb3RCb3VuZEVuZCwgYm91bmRpbmdSZWN0U3RhcnQsIGJvdW5kaW5nUmVjdEVuZCkge1xuICAgIGNvbnN0IGxlbmd0aEluVmlldyA9XG4gICAgICBib3VuZGluZ1JlY3RFbmQgPj0gcm9vdEJvdW5kRW5kXG4gICAgICAgID8gcm9vdEJvdW5kRW5kIC0gYm91bmRpbmdSZWN0U3RhcnRcbiAgICAgICAgOiBib3VuZGluZ1JlY3RFbmQ7XG4gICAgY29uc3QgcGVyY0luVmlldyA9IGxlbmd0aEluVmlldyAvIChib3VuZGluZ1JlY3RFbmQgLSBib3VuZGluZ1JlY3RTdGFydCk7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHBlcmNJblZpZXcpKSB8fCAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgc2VyaWFsaXppbmcgYW5kIHNlbmRpbmcgbWVzc2FnZXMgdG8gdGhlIHNhZmVmcmFtZS5cbiAgICogQHBhcmFtIHshT2JqZWN0fSBwYXlsb2FkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZXJ2aWNlTmFtZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZE1lc3NhZ2VfKHBheWxvYWQsIHNlcnZpY2VOYW1lKSB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZV8gfHwgIXRoaXMuaWZyYW1lXy5jb250ZW50V2luZG93KSB7XG4gICAgICBkZXYoKS5leHBlY3RlZEVycm9yKFRBRywgJ0ZyYW1lIGNvbnRlbnRXaW5kb3cgdW5hdmFpbGFibGUuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBkaWN0KCk7XG4gICAgbWVzc2FnZVtNRVNTQUdFX0ZJRUxEUy5DSEFOTkVMXSA9IHRoaXMuY2hhbm5lbDtcbiAgICBtZXNzYWdlW01FU1NBR0VfRklFTERTLlBBWUxPQURdID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAocGF5bG9hZClcbiAgICApO1xuICAgIG1lc3NhZ2VbTUVTU0FHRV9GSUVMRFMuU0VSVklDRV0gPSBzZXJ2aWNlTmFtZTtcbiAgICBtZXNzYWdlW01FU1NBR0VfRklFTERTLlNFTlRJTkVMXSA9IHRoaXMuc2VudGluZWxfO1xuICAgIG1lc3NhZ2VbTUVTU0FHRV9GSUVMRFMuRU5EUE9JTlRfSURFTlRJVFldID0gdGhpcy5lbmRwb2ludElkZW50aXR5XztcbiAgICB0aGlzLmlmcmFtZV8uY29udGVudFdpbmRvdy4vKk9LKi8gcG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSksICcqJyk7XG4gIH1cblxuICAvKipcbiAgICogUm91dGVzIG1lc3NhZ2VzIHRvIHRoZWlyIGFwcHJvcHJpYXRlIGhhbmRsZXIuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHBheWxvYWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlcnZpY2VcbiAgICovXG4gIHByb2Nlc3NNZXNzYWdlKHBheWxvYWQsIHNlcnZpY2UpIHtcbiAgICAvLyBXZSBhcmUgbm90IGxvZ2dpbmcgdW5leHBlY3RlZCBtZXNzYWdlcywgYW5kIHNvbWUgZXhwZWN0ZWRcbiAgICAvLyBtZXNzYWdlcyBhcmUgYmVpbmcgZHJvcHBlZCwgbGlrZSBpbml0X2RvbmUsIGFzIHdlIGRvbid0IG5lZWQgdGhlbS5cbiAgICBzd2l0Y2ggKHNlcnZpY2UpIHtcbiAgICAgIGNhc2UgU0VSVklDRS5DUkVBVElWRV9HRU9NRVRSWV9VUERBVEU6XG4gICAgICAgIHRoaXMuaGFuZGxlRmx1aWRNZXNzYWdlXyhwYXlsb2FkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNFUlZJQ0UuRVhQQU5EX1JFUVVFU1Q6XG4gICAgICAgIHRoaXMuaGFuZGxlRXhwYW5kUmVxdWVzdF8ocGF5bG9hZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTRVJWSUNFLlJFR0lTVEVSX0RPTkU6XG4gICAgICAgIHRoaXMuaXNSZWdpc3RlcmVkXyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTRVJWSUNFLkNPTExBUFNFX1JFUVVFU1Q6XG4gICAgICAgIHRoaXMuaGFuZGxlQ29sbGFwc2VSZXF1ZXN0XygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU0VSVklDRS5SRVNJWkVfUkVRVUVTVDpcbiAgICAgICAgdGhpcy5oYW5kbGVSZXNpemVSZXF1ZXN0XyhwYXlsb2FkKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBwYXlsb2FkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVFeHBhbmRSZXF1ZXN0XyhwYXlsb2FkKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVnaXN0ZXJlZF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXhwYW5kSGVpZ2h0ID1cbiAgICAgIE51bWJlcih0aGlzLmNyZWF0aXZlU2l6ZV8uaGVpZ2h0KSArXG4gICAgICBwYXlsb2FkWydleHBhbmRfYiddICtcbiAgICAgIHBheWxvYWRbJ2V4cGFuZF90J107XG4gICAgY29uc3QgZXhwYW5kV2lkdGggPVxuICAgICAgTnVtYmVyKHRoaXMuY3JlYXRpdmVTaXplXy53aWR0aCkgK1xuICAgICAgcGF5bG9hZFsnZXhwYW5kX3InXSArXG4gICAgICBwYXlsb2FkWydleHBhbmRfbCddO1xuICAgIC8vIFZlcmlmeSB0aGF0IGlmIGV4cGFuZGluZyBieSBwdXNoLCB0aGF0IGV4cGFuZEJ5UHVzaCBpcyBhbGxvd2VkLlxuICAgIC8vIElmIGV4cGFuZGluZyBieSBvdmVybGF5LCB2ZXJpZnkgdGhhdCBleHBhbmRCeU92ZXJsYXkgaXMgYWxsb3dlZCxcbiAgICAvLyBhbmQgdGhhdCB3ZSBhcmUgb25seSBleHBhbmRpbmcgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIGFtcC1hZC5cbiAgICBpZiAoXG4gICAgICBpc05hTihleHBhbmRIZWlnaHQpIHx8XG4gICAgICBpc05hTihleHBhbmRXaWR0aCkgfHxcbiAgICAgIChwYXlsb2FkWydwdXNoJ10gJiYgIXRoaXMuZXhwYW5kQnlQdXNoXykgfHxcbiAgICAgICghcGF5bG9hZFsncHVzaCddICYmXG4gICAgICAgICF0aGlzLmV4cGFuZEJ5T3ZlcmxheV8gJiZcbiAgICAgICAgKGV4cGFuZFdpZHRoID4gdGhpcy5jcmVhdGl2ZVNpemVfLndpZHRoIHx8XG4gICAgICAgICAgZXhwYW5kSGVpZ2h0ID4gdGhpcy5jcmVhdGl2ZVNpemVfLmhlaWdodCkpXG4gICAgKSB7XG4gICAgICBkZXYoKS5lcnJvcihUQUcsICdJbnZhbGlkIGV4cGFuZCB2YWx1ZXMuJyk7XG4gICAgICB0aGlzLnNlbmRSZXNpemVSZXNwb25zZSgvKiBTVUNDRVNTPyAqLyBmYWxzZSwgU0VSVklDRS5FWFBBTkRfUkVTUE9OU0UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDYW4ndCBleHBhbmQgdG8gZ3JlYXRlciB0aGFuIHRoZSB2aWV3cG9ydCBzaXplXG4gICAgaWYgKFxuICAgICAgZXhwYW5kSGVpZ2h0ID4gdGhpcy52aWV3cG9ydF8uZ2V0U2l6ZSgpLmhlaWdodCB8fFxuICAgICAgZXhwYW5kV2lkdGggPiB0aGlzLnZpZXdwb3J0Xy5nZXRTaXplKCkud2lkdGhcbiAgICApIHtcbiAgICAgIHRoaXMuc2VuZFJlc2l6ZVJlc3BvbnNlKC8qIFNVQ0NFU1M/ICovIGZhbHNlLCBTRVJWSUNFLkVYUEFORF9SRVNQT05TRSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlU2l6ZUNoYW5nZShleHBhbmRIZWlnaHQsIGV4cGFuZFdpZHRoLCBTRVJWSUNFLkVYUEFORF9SRVNQT05TRSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUNvbGxhcHNlUmVxdWVzdF8oKSB7XG4gICAgLy8gT25seSBjb2xsYXBzZSBpZiBleHBhbmRlZC5cbiAgICBpZiAodGhpcy5pc0NvbGxhcHNlZF8gfHwgIXRoaXMuaXNSZWdpc3RlcmVkXykge1xuICAgICAgdGhpcy5zZW5kUmVzaXplUmVzcG9uc2UoLyogU1VDQ0VTUz8gKi8gZmFsc2UsIFNFUlZJQ0UuQ09MTEFQU0VfUkVTUE9OU0UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZVNpemVDaGFuZ2UoXG4gICAgICB0aGlzLmluaXRpYWxDcmVhdGl2ZVNpemVfLmhlaWdodCxcbiAgICAgIHRoaXMuaW5pdGlhbENyZWF0aXZlU2l6ZV8ud2lkdGgsXG4gICAgICBTRVJWSUNFLkNPTExBUFNFX1JFU1BPTlNFLFxuICAgICAgLyoqIGlzQ29sbGFwc2UgKi8gdHJ1ZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VUeXBlXG4gICAqL1xuICByZXNpemVTYWZlZnJhbWUoaGVpZ2h0LCB3aWR0aCwgbWVzc2FnZVR5cGUpIHtcbiAgICB0aGlzLmlzQ29sbGFwc2VkXyA9IG1lc3NhZ2VUeXBlID09IFNFUlZJQ0UuQ09MTEFQU0VfUkVTUE9OU0U7XG4gICAgdGhpcy5iYXNlSW5zdGFuY2VfLm1lYXN1cmVNdXRhdGVFbGVtZW50KFxuICAgICAgLyoqIE1FQVNVUkVSICovICgpID0+IHtcbiAgICAgICAgdGhpcy5iYXNlSW5zdGFuY2VfLmdldFJlc291cmNlKCkubWVhc3VyZSgpO1xuICAgICAgfSxcbiAgICAgIC8qKiBNVVRBVE9SICovICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaWZyYW1lXykge1xuICAgICAgICAgIHNldFN0eWxlcyh0aGlzLmlmcmFtZV8sIHtcbiAgICAgICAgICAgICdoZWlnaHQnOiBoZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgJ3dpZHRoJzogd2lkdGggKyAncHgnLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuY3JlYXRpdmVTaXplXy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgdGhpcy5jcmVhdGl2ZVNpemVfLndpZHRoID0gd2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZW5kUmVzaXplUmVzcG9uc2UoLyoqIFNVQ0NFU1MgKi8gdHJ1ZSwgbWVzc2FnZVR5cGUpO1xuICAgICAgfSxcbiAgICAgIHRoaXMuaWZyYW1lX1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplcyB0aGUgc2FmZWZyYW1lLCBhbmQgcG90ZW50aWFsbHkgdGhlIGNvbnRhaW5pbmcgYW1wLWFkIGVsZW1lbnQuXG4gICAqIFRoZW4gc2VuZHMgYSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSBTYWZlZnJhbWUgY3JlYXRpdmUuXG4gICAqXG4gICAqIEZvciBleHBhbnNpb246XG4gICAqICBJZiB0aGUgbmV3IHNpemUgaXMgZnVsbHkgY29udGFpbmVkIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBhbXAtYWQsXG4gICAqICB3ZSBjYW4gcmVzaXplIGltbWVkaWF0ZWx5IGFzIHRoZXJlIHdpbGwgYmUgbm8gcmVmbG93LiBIb3dldmVyLCBpZlxuICAgKiAgdGhlIG5ldyBzaXplIGlzIGxhcmdlciB0aGFuIHRoZSBhbXAtYWQsIHRoZW4gZmlyc3Qgd2UgbmVlZCB0byB0cnlcbiAgICogIHRvIHJlc2l6ZSB0aGUgYW1wLWFkLCBhbmQgb25seSByZXNpemUgdGhlIHNhZmVmcmFtZSBpZiB0aGF0IHN1Y2NlZWRzLlxuICAgKiBGb3IgY29sbGFwc2U6XG4gICAqICBXZSBhbHdheXMgZmlyc3Qgd2FudCB0byBhdHRlbXB0IHRvIGNvbGxhcHNlIHRoZSBhbXAtYWQuIFRoZW4sXG4gICAqICByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhhdCBzdWNjZWVkcywgd2UgY29sbGFwc2UgdGhlIHNhZmVmcmFtZSB0b28uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSW4gcGl4ZWxzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggSW4gcGl4ZWxzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVR5cGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0SXNDb2xsYXBzZSBXaGV0aGVyIHRoaXMgaXMgYSBjb2xsYXBzZSBhdHRlbXB0LlxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICovXG4gIGhhbmRsZVNpemVDaGFuZ2UoaGVpZ2h0LCB3aWR0aCwgbWVzc2FnZVR5cGUsIG9wdElzQ29sbGFwc2UpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3cG9ydF9cbiAgICAgIC5nZXRDbGllbnRSZWN0QXN5bmModGhpcy5iYXNlSW5zdGFuY2VfLmVsZW1lbnQpXG4gICAgICAudGhlbigoYm94KSA9PiB7XG4gICAgICAgIGlmICghb3B0SXNDb2xsYXBzZSAmJiB3aWR0aCA8PSBib3gud2lkdGggJiYgaGVpZ2h0IDw9IGJveC5oZWlnaHQpIHtcbiAgICAgICAgICB0aGlzLnJlc2l6ZVNhZmVmcmFtZShoZWlnaHQsIHdpZHRoLCBtZXNzYWdlVHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXNpemVBbXBBZEFuZFNhZmVmcmFtZShcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgbWVzc2FnZVR5cGUsXG4gICAgICAgICAgICBvcHRJc0NvbGxhcHNlXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gcGF5bG9hZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlUmVzaXplUmVxdWVzdF8ocGF5bG9hZCkge1xuICAgIGlmICghdGhpcy5pc1JlZ2lzdGVyZWRfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc2l6ZUhlaWdodCA9XG4gICAgICBOdW1iZXIodGhpcy5jcmVhdGl2ZVNpemVfLmhlaWdodCkgK1xuICAgICAgKHBheWxvYWRbJ3Jlc2l6ZV9iJ10gKyBwYXlsb2FkWydyZXNpemVfdCddKTtcbiAgICBjb25zdCByZXNpemVXaWR0aCA9XG4gICAgICBOdW1iZXIodGhpcy5jcmVhdGl2ZVNpemVfLndpZHRoKSArXG4gICAgICAocGF5bG9hZFsncmVzaXplX3InXSArIHBheWxvYWRbJ3Jlc2l6ZV9sJ10pO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGFyZSBhY3R1YWxseSByZXNpemluZyBoZXJlLlxuICAgIGlmIChpc05hTihyZXNpemVXaWR0aCkgfHwgaXNOYU4ocmVzaXplSGVpZ2h0KSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHLCAnSW52YWxpZCByZXNpemUgdmFsdWVzLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVzaXplQW1wQWRBbmRTYWZlZnJhbWUoXG4gICAgICByZXNpemVIZWlnaHQsXG4gICAgICByZXNpemVXaWR0aCxcbiAgICAgIFNFUlZJQ0UuUkVTSVpFX1JFU1BPTlNFLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBzdWNjZXNzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlVHlwZVxuICAgKi9cbiAgc2VuZFJlc2l6ZVJlc3BvbnNlKHN1Y2Nlc3MsIG1lc3NhZ2VUeXBlKSB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52aWV3cG9ydF9cbiAgICAgIC5nZXRDbGllbnRSZWN0QXN5bmModGhpcy5pZnJhbWVfKVxuICAgICAgLnRoZW4oKGlmcmFtZUJveCkgPT4ge1xuICAgICAgICB0aGlzLmNoZWNrU3RpbGxDdXJyZW50XygpO1xuICAgICAgICBjb25zdCBmb3JtYXR0ZWRHZW9tID0gdGhpcy5mb3JtYXRHZW9tXyhpZnJhbWVCb3gpO1xuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlXyhcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1aWQ6IHRoaXMudWlkXyxcbiAgICAgICAgICAgIHN1Y2Nlc3MsXG4gICAgICAgICAgICBuZXdHZW9tZXRyeTogZm9ybWF0dGVkR2VvbSxcbiAgICAgICAgICAgICdleHBhbmRfdCc6IHRoaXMuY3VycmVudEdlb21ldHJ5X1snYWxsb3dlZEV4cGFuc2lvbl90J10sXG4gICAgICAgICAgICAnZXhwYW5kX2InOiB0aGlzLmN1cnJlbnRHZW9tZXRyeV9bJ2FsbG93ZWRFeHBhbnNpb25fYiddLFxuICAgICAgICAgICAgJ2V4cGFuZF9yJzogdGhpcy5jdXJyZW50R2VvbWV0cnlfWydhbGxvd2VkRXhwYW5zaW9uX3InXSxcbiAgICAgICAgICAgICdleHBhbmRfbCc6IHRoaXMuY3VycmVudEdlb21ldHJ5X1snYWxsb3dlZEV4cGFuc2lvbl9sJ10sXG4gICAgICAgICAgICBwdXNoOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWVzc2FnZVR5cGVcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4gZGV2KCkuZXJyb3IoVEFHLCBlcnIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byByZXNpemUgYm90aCB0aGUgYW1wLWFkIGFuZCB0aGUgU2FmZWZyYW1lLlxuICAgKiBJZiB0aGUgYW1wLWFkIGNhbiBub3QgYmUgcmVzaXplZCwgdGhlbiBpZiBpdCB3YXMgYSBjb2xsYXBzZSByZXF1ZXN0LFxuICAgKiB3ZSB3aWxsIHN0aWxsIGNvbGxhcHNlIGp1c3QgdGhlIHNhZmVmcmFtZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VUeXBlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9pc1Nocmlua2luZyBUcnVlIGlmIGNvbGxhcHNpbmcgb3IgcmVzaXppbmcgc21hbGxlci5cbiAgICovXG4gIHJlc2l6ZUFtcEFkQW5kU2FmZWZyYW1lKGhlaWdodCwgd2lkdGgsIG1lc3NhZ2VUeXBlLCBvcHRfaXNTaHJpbmtpbmcpIHtcbiAgICAvLyBGaXJzdCwgYXR0ZW1wdCB0byByZXNpemUgdGhlIEFtcC1BZCB0aGF0IGlzIHRoZSBwYXJlbnQgb2YgdGhlXG4gICAgLy8gc2FmZWZyYW1lXG4gICAgdGhpcy5iYXNlSW5zdGFuY2VfXG4gICAgICAuYXR0ZW1wdENoYW5nZVNpemUoaGVpZ2h0LCB3aWR0aClcbiAgICAgIC50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jaGVja1N0aWxsQ3VycmVudF8oKTtcbiAgICAgICAgICAvLyBJZiB0aGlzIHJlc2l6ZSBzdWNjZWVkZWQsIHdlIGFsd2F5cyByZXNpemUgdGhlIHNhZmVmcmFtZS5cbiAgICAgICAgICAvLyByZXNpemVTYWZlZnJhbWUgYWxzbyBzZW5kcyB0aGUgcmVzaXplIHJlc3BvbnNlLlxuICAgICAgICAgIHRoaXMucmVzaXplU2FmZWZyYW1lKGhlaWdodCwgd2lkdGgsIG1lc3NhZ2VUeXBlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqIFJFSkVDVCBDQUxMQkFDSyAqLyAoKSA9PiB7XG4gICAgICAgICAgLy8gSWYgdGhlIHJlc2l6ZSBpbml0aWFsbHkgZmFpbGVkLCBpdCBtYXkgaGF2ZSBiZWVuIHF1ZXVlZFxuICAgICAgICAgIC8vIGFzIGEgcGVuZGluZ0NoYW5nZVNpemUsIHdoaWNoIHdpbGwgY2F1c2UgdGhlIHNpemUgY2hhbmdlXG4gICAgICAgICAgLy8gdG8gZXhlY3V0ZSB1cG9uIHRoZSBuZXh0IHVzZXIgaW50ZXJhY3Rpb24uIFdlIGRvbid0IHdhbnRcbiAgICAgICAgICAvLyB0aGF0IGZvciBzYWZlZnJhbWUsIHNvIHdlIHJlc2V0IGl0IGhlcmUuXG4gICAgICAgICAgdGhpcy5iYXNlSW5zdGFuY2VfLmdldFJlc291cmNlKCkucmVzZXRQZW5kaW5nQ2hhbmdlU2l6ZSgpO1xuICAgICAgICAgIGlmIChvcHRfaXNTaHJpbmtpbmcpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBjb2xsYXBzZSBvciByZXNpemUgcmVxdWVzdCwgdGhlbiBldmVuIGlmIHJlc2l6aW5nXG4gICAgICAgICAgICAvLyB0aGUgYW1wLWFkIGZhaWxlZCwgc3RpbGwgcmVzaXplIHRoZSBpZnJhbWUuXG4gICAgICAgICAgICAvLyByZXNpemVTYWZlZnJhbWUgYWxzbyBzZW5kcyB0aGUgcmVzaXplIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gT25seSByZWdpc3RlciBhcyBjb2xsYXBzZWQgaWYgZXhwbGljaXRseSBhIGNvbGxhcHNlIHJlcXVlc3QuXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVNhZmVmcmFtZShoZWlnaHQsIHdpZHRoLCBtZXNzYWdlVHlwZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIHdlcmUgYXR0ZW1wdGluZyB0b1xuICAgICAgICAgICAgLy8gZXhwYW5kIHBhc3QgdGhlIGJvdW5kcyBvZiB0aGUgYW1wLWFkLCBhbmQgaXQgZmFpbGVkLiBUaHVzLFxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBzZW5kIGEgZmFpbHVyZSBtZXNzYWdlLCBhbmQgdGhlIHNhZmVmcmFtZSBpc1xuICAgICAgICAgICAgLy8gbm90IHJlc2l6ZWQuXG4gICAgICAgICAgICB0aGlzLnNlbmRSZXNpemVSZXNwb25zZShmYWxzZSwgbWVzc2FnZVR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVyci5tZXNzYWdlID09ICdDQU5DRUxMRUQnKSB7XG4gICAgICAgICAgZGV2KCkuZXJyb3IoVEFHLCBlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZXYoKS5lcnJvcihUQUcsIGBSZXNpemluZyBmYWlsZWQ6ICR7ZXJyfWApO1xuICAgICAgICB0aGlzLnNlbmRSZXNpemVSZXNwb25zZShmYWxzZSwgbWVzc2FnZVR5cGUpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBGbHVpZC1yZWxhdGVkIG1lc3NhZ2VzIGRpc3BhdGNoZWQgZnJvbSBTYWZlRnJhbWUuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHBheWxvYWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUZsdWlkTWVzc2FnZV8ocGF5bG9hZCkge1xuICAgIGxldCBuZXdIZWlnaHQ7XG4gICAgaWYgKCFwYXlsb2FkIHx8ICEobmV3SGVpZ2h0ID0gcGFyc2VJbnQocGF5bG9hZFsnaGVpZ2h0J10sIDEwKSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5iYXNlSW5zdGFuY2VfXG4gICAgICAuYXR0ZW1wdENoYW5nZUhlaWdodChuZXdIZWlnaHQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hlY2tTdGlsbEN1cnJlbnRfKCk7XG4gICAgICAgIHRoaXMub25GbHVpZFJlc2l6ZV8obmV3SGVpZ2h0KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB1c2VyKCkud2FybihUQUcsIGVycik7XG4gICAgICAgIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IHRoaXMuYmFzZUluc3RhbmNlXy5nZXRTbG90U2l6ZSgpO1xuICAgICAgICBpZiAod2lkdGggJiYgaGVpZ2h0KSB7XG4gICAgICAgICAgdGhpcy5vbkZsdWlkUmVzaXplXyhoZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJlcyBhIGRlbGF5ZWQgaW1wcmVzc2lvbiBhbmQgbm90aWZpZXMgdGhlIEZsdWlkIGNyZWF0aXZlIHRoYXQgaXRzXG4gICAqIGNvbnRhaW5lciBoYXMgYmVlbiByZXNpemVkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3SGVpZ2h0IFRoZSBoZWlnaHQgZXhwYW5kZWQgdG8uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkZsdWlkUmVzaXplXyhuZXdIZWlnaHQpIHtcbiAgICBjb25zdCBpZnJhbWUgPSBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuYmFzZUluc3RhbmNlXy5pZnJhbWUpO1xuICAgIGNvbnN0IGlmcmFtZUhlaWdodCA9IHBhcnNlSW50KGdldFN0eWxlKGlmcmFtZSwgJ2hlaWdodCcpLCAxMCkgfHwgMDtcbiAgICBpZiAoaWZyYW1lSGVpZ2h0ICE9IG5ld0hlaWdodCkge1xuICAgICAgc2V0U3R5bGVzKGlmcmFtZSwge2hlaWdodDogYCR7bmV3SGVpZ2h0fXB4YH0pO1xuICAgIH1cbiAgICB0aGlzLmJhc2VJbnN0YW5jZV8uZmlyZUZsdWlkRGVsYXllZEltcHJlc3Npb24oKTtcbiAgICAvLyBJbiBjYXNlIHdlJ3ZlIHVubG9hZGVkIGluIGEgcmFjZSBjb25kaXRpb24uXG4gICAgaWYgKCF0aGlzLmlmcmFtZV8uY29udGVudFdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmlmcmFtZV8uY29udGVudFdpbmRvdy4vKk9LKi8gcG9zdE1lc3NhZ2UoXG4gICAgICBKU09OLnN0cmluZ2lmeShkaWN0KHsnbWVzc2FnZSc6ICdyZXNpemUtY29tcGxldGUnLCAnYyc6IHRoaXMuY2hhbm5lbH0pKSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlciB0aGlzIEhvc3QgQVBJLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmlmcmFtZV8gPSBudWxsO1xuICAgIGRlbGV0ZSBzYWZlZnJhbWVIb3N0c1t0aGlzLnNlbnRpbmVsX107XG4gICAgaWYgKHRoaXMudW5saXN0ZW5fKSB7XG4gICAgICB0aGlzLnVubGlzdGVuXygpO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoc2FmZWZyYW1lSG9zdHMpLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZW1vdmVTYWZlZnJhbWVMaXN0ZW5lcigpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHNhZmVmcmFtZSBldmVudCBsaXN0ZW5lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVNhZmVmcmFtZUxpc3RlbmVyKCkge1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHNhZmVmcmFtZUxpc3RlbmVyLCBmYWxzZSk7XG4gIHNhZmVmcmFtZUxpc3RlbmVyQ3JlYXRlZF8gPSBmYWxzZTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-network-doubleclick-impl/0.1/safeframe-host.js