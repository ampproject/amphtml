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

import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {parseUrl} from '../../../src/url';
import {setStyles} from '../../../src/style';
import {throttle} from '../../../src/utils/rate-limit';
import {tryParseJson} from '../../../src/json';

/**
 * Used to manage messages for different Safeframe ad slots.
 *
 * Maps a sentinel value to an instance of the SafeframeHostApi to which that
 * sentinel value belongs.
 * @type {!Object<string, !SafeframeHostApi>}
 */
export const safeframeHosts = {};

/** @private {boolean} */
let safeframeListenerCreated_ = false;

/** @enum {string} */
export const MESSAGE_FIELDS = {
  CHANNEL: 'c',
  SENTINEL: 'e',
  ENDPOINT_IDENTITY: 'i',
  PAYLOAD: 'p',
  SERVICE: 's',
  MESSAGE: 'message',
};

/** @enum {string} */
export const SERVICE = {
  GEOMETRY_UPDATE: 'geometry_update',
  CREATIVE_GEOMETRY_UPDATE: 'creative_geometry_update',
  EXPAND_REQUEST: 'expand_request',
  EXPAND_RESPONSE: 'expand_response',
  REGISTER_DONE: 'register_done',
  COLLAPSE_REQUEST: 'collapse_request',
  COLLAPSE_RESPONSE: 'collapse_response',
  SHRINK_REQUEST: 'shrink_request',
  SHRINK_RESPONSE: 'shrink_response',
};

/** @private {string} */
const TAG = 'AMP-DOUBLECLICK-SAFEFRAME';

/** @const {string} */
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/**
 * Event listener callback for message events. If message is a Safeframe message,
 * handles the message.
 * This listener is registered within SafeframeHostApi.
 * @param {!Event} event
 */
export function safeframeListener(event) {
  const data = tryParseJson(getData(event));
  /** Only process messages that are valid Safeframe messages */
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  const payload = tryParseJson(data[MESSAGE_FIELDS.PAYLOAD]) || {};
  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  const sentinel = data[MESSAGE_FIELDS.SENTINEL] || payload['sentinel'];
  const safeframeHost = safeframeHosts[sentinel];
  if (!safeframeHost) {
    dev().warn(TAG, `Safeframe Host for sentinel: ${sentinel} not found.`);
    return;
  }
  if (!safeframeHost.channel) {
    safeframeHost.connectMessagingChannel(data[MESSAGE_FIELDS.CHANNEL]);
  } else if (payload) {
    // Currently we do not expect a payload on initial connection messages.
    safeframeHost.processMessage(/** @type {!JsonObject} */(payload),
        data[MESSAGE_FIELDS.SERVICE]);
  }
}

/**
 * Sets up the host API for DoubleClick Safeframe to allow the following
 * Safeframe container APIs to work:
 *   - $sf.ext.expand()
 *   - $sf.ext.collapse()
 *   - $sf.ext.geom()
 * Expand and collapse are both implemented utilizing AMP's built in element
 * resizing.
 *
 * For geom, the host needs to send geometry updates into the container
 *  whenever a position change happens, at a max frequency of 1 message/second.
 *  To implement this messaging, we are leveraging the existing IntersectionObserver
 *  class that works with AMP elements. However, the safeframe iframe that we
 *  need to monitor is not an AMP element, but rather contained within an amp-ad.
 *  So, we are doing intersection observing on the amp-ad, and calculating
 *  the correct position for the iframe whenever we get an update.
 *
 * We pass an instance of this class into the IntersectionObserver class, which then
 *  calls the instance of send() below whenever an update occurs.
 */
export class SafeframeHostApi {

  /**
   * @param {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} baseInstance
   * @param {boolean} isFluid
   * @param {?({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)} initialSize
   * @param {?({width, height}|../../../src/layout-rect.LayoutRectDef)} creativeSize
   * @param {?string} fluidImpressionUrl
   */
  constructor(baseInstance, isFluid, initialSize, creativeSize,
    fluidImpressionUrl) {
    /** @private {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} */
    this.baseInstance_ = baseInstance;

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

    /** @private {?({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)} */
    this.slotSize_ = initialSize;

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.creativeSize_ = creativeSize;

    /** @private {?string} */
    this.fluidImpressionUrl_ = fluidImpressionUrl;

    /** @private {?Promise} */
    this.delay_ = null;

    /** @private {../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = this.baseInstance_.getViewport();

    /** @private {boolean} */
    this.isCollapsed_ = true;

    /** @private {boolean} */
    this.isRegistered_ = false;

    // TODO: Make this page-level.
    const sfConfig = Object(tryParseJson(
        this.baseInstance_.element.getAttribute(
            'data-safeframe-config')) || {});
    /** @private {boolean} */
    this.expandByOverlay_ = sfConfig.hasOwnProperty('expandByOverlay') ?
      sfConfig['expandByOverlay'] : true;

    /** @private {boolean} */
    this.expandByPush_ = sfConfig.hasOwnProperty('expandByPush') ?
      sfConfig['expandByPush'] : true;

    /** @private {?Function} */
    this.unlisten_ = null;

    this.registerSafeframeHost();
  }

  /**
   * Returns the Safeframe specific name attributes that are needed for the
   * Safeframe creative to properly setup.
   * @return {!JsonObject}
   */
  getSafeframeNameAttr() {
    const attributes = dict({});
    attributes['uid'] = this.uid_;
    attributes['hostPeerName'] = this.win_.location.origin;
    attributes['initialGeometry'] = this.getInitialGeometry();
    attributes['permissions'] = JSON.stringify(
        dict({
          'expandByOverlay': this.expandByOverlay_,
          'expandByPush': this.expandByPush_,
          'readCookie': false,
          'writeCookie': false,
        }));
    attributes['metadata'] = JSON.stringify(
        dict({
          'shared': {
            'sf_ver': this.baseInstance_.safeframeVersion,
            'ck_on': 1,
            'flash_ver': '26.0.0',
            'canonical_url': this.maybeGetCanonicalUrl(),
          },
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
  maybeGetCanonicalUrl() {
    // Don't allow for referrer policy same-origin,
    // as Safeframe will always be a different origin.
    // Don't allow for no-referrer.
    const canonicalUrl = Services.documentInfoForDoc(
        this.baseInstance_.getAmpDoc()).canonicalUrl;
    const metaReferrer = this.win_.document.querySelector(
        "meta[name='referrer']");
    if (!metaReferrer) {
      return canonicalUrl;
    }
    switch (metaReferrer.getAttribute('content')) {
      case 'same-origin':
        return;
      case 'no-referrer':
        return;
      case 'origin':
        return parseUrl(canonicalUrl).origin;
    }
    return canonicalUrl;
  }

  /**
   * Returns the initialGeometry to assign to the name of the safeframe
   * for rendering. This needs to be done differently than all the other
   * geometry updates, because we don't actually have access to the
   * rendered safeframe yet. Note that we are using getPageLayoutBox,
   * which is not guaranteed to be perfectly accurate as it is from
   * the last measure of the element. This is fine for our use case
   * here, as even if the position is slightly off, we'll send the right
   * size.
   * @return {string}
   */
  getInitialGeometry() {
    const ampAdBox = this.baseInstance_.getPageLayoutBox();
    const heightOffset = (ampAdBox.height - this.creativeSize_.height) / 2;
    const widthOffset = (ampAdBox.width - this.creativeSize_.width) / 2;
    const iframeBox = {
      top: ampAdBox.top + heightOffset,
      bottom: ampAdBox.bottom - heightOffset,
      left: ampAdBox.left + widthOffset,
      right: ampAdBox.right - widthOffset,
      height: this.creativeSize_.height,
      width: this.creativeSize_.width,
    };
    return this.formatGeom_(iframeBox);
  }

  /**
   * Registers this instance as the host API for the current sentinel.
   * If the global safeframe listener has not yet been created, it creates
   * that as well.
   */
  registerSafeframeHost() {
    dev().assert(this.sentinel_);
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
  connectMessagingChannel(channel) {
    // Set the iframe here, because when class is first created the iframe
    // element does not yet exist on this.baseInstance_. The first time
    // we receive a message we know that it now exists.
    dev().assert(this.baseInstance_.iframe);
    this.iframe_ = this.baseInstance_.iframe;
    this.channel = channel;
    this.setupGeom_();
    this.sendMessage_({
      'message': 'connect',
      'c': this.channel,
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
  setupGeom_() {
    dev().assert(this.iframe_.contentWindow,
        'Frame contentWindow unavailable.');
    const throttledUpdate = throttle(
        this.win_, this.updateGeometry_.bind(this), 1000);
    const scrollUnlistener = this.viewport_.onScroll(throttledUpdate);
    const changedUnlistener = this.viewport_.onChanged(throttledUpdate);
    this.unlisten_ = () => {
      scrollUnlistener();
      changedUnlistener();
    };
    this.updateGeometry_();
  }

  /**
   * Sends a geometry update message into the safeframe.
   * @private
   */
  updateGeometry_() {
    if (!this.iframe_) {
      return;
    }
    this.viewport_.getClientRectAsync(this.iframe_).then(iframeBox => {
      const formattedGeom = this.formatGeom_(iframeBox);
      this.sendMessage_({
        newGeometry: formattedGeom,
        uid: this.uid_,
      }, SERVICE.GEOMETRY_UPDATE);
    });
  }

  /**
   * Builds geometry update format expected by GPT Safeframe.
   * Also sets this.currentGeometry as side effect.
   * @param {!Object} iframeBox The elementRect for the safeframe.
   * @return {string} Safeframe formatted changes.
   * @private
   */
  formatGeom_(iframeBox) {
    const ampAdBox = this.baseInstance_.getPageLayoutBox();
    const viewportSize = this.viewport_.getSize();
    const currentGeometry = /** @type {JsonObject} */({
      'windowCoords_t': 0,
      'windowCoords_r': viewportSize.width,
      'windowCoords_b': viewportSize.height,
      'windowCoords_l': 0,
      'frameCoords_t': ampAdBox.top,
      'frameCoords_r': ampAdBox.right,
      'frameCoords_b': ampAdBox.bottom,
      'frameCoords_l': ampAdBox.left,
      'styleZIndex': this.baseInstance_.element.style.zIndex,
      // AMP's built in resize methodology that we use only allows expansion
      // to the right and bottom, so we enforce that here.
      'allowedExpansion_r': viewportSize.width -
          iframeBox.width,
      'allowedExpansion_b': viewportSize.height -
          iframeBox.height,
      'allowedExpansion_t': 0,
      'allowedExpansion_l': 0,
      'yInView': this.getPercInView(viewportSize.height,
          iframeBox.top, iframeBox.bottom),
      'xInView': this.getPercInView(viewportSize.width,
          iframeBox.left, iframeBox.right),
    });
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
  getPercInView(rootBoundEnd, boundingRectStart, boundingRectEnd) {
    const lengthInView = (boundingRectEnd >= rootBoundEnd) ?
      rootBoundEnd - boundingRectStart : boundingRectEnd;
    const percInView = lengthInView / (boundingRectEnd - boundingRectStart);
    return Math.max(0, Math.min(1, percInView)) || 0;
  }

  /**
   * Handles serializing and sending messages to the safeframe.
   * @param {!Object} payload
   * @param {string} serviceName
   * @private
   */
  sendMessage_(payload, serviceName) {
    dev().assert(this.iframe_.contentWindow,
        'Frame contentWindow unavailable.');
    const message = dict();
    message[MESSAGE_FIELDS.CHANNEL] = this.channel;
    message[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify(
        /** @type {!JsonObject} */(payload));
    message[MESSAGE_FIELDS.SERVICE] = serviceName;
    message[MESSAGE_FIELDS.SENTINEL] = this.sentinel_;
    message[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = this.endpointIdentity_;
    this.iframe_.contentWindow./*OK*/postMessage(
        JSON.stringify(message), SAFEFRAME_ORIGIN);
  }

  /**
   * Routes messages to their appropriate handler.
   * @param {!JsonObject} payload
   * @param {string} service
   */
  processMessage(payload, service) {
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
      case SERVICE.SHRINK_REQUEST:
        this.handleShrinkRequest_(payload);
      default:
        break;
    }
  }


  /**
   * @param {!JsonObject} payload
   * @private
   */
  handleExpandRequest_(payload) {
    if (!this.isRegistered_) {
      return;
    }
    if (isNaN(payload['expand_b']) || isNaN(payload['expand_t']) ||
        isNaN(payload['expand_r']) || isNaN(payload['expand_l'])) {
      dev().error(TAG, 'Invalid expand values.');
      return;
    }
    const expandHeight = Number(this.iframe_.height) +
          payload['expand_b'] + payload['expand_t'];
    const expandWidth = Number(this.iframe_.width) +
          payload['expand_r'] + payload['expand_l'];
    // Verify that if expanding by push, that expandByPush is allowed.
    // If expanding by overlay, verify that expandByOverlay is allowed,
    // and that we are only expanding within the bounds of the amp-ad.
    if ((payload['push'] && !this.expandByPush_) ||
        (!payload['push'] && !this.expandByOverlay_ &&
         (expandWidth > this.creativeSize_.width ||
          expandHeight > this.creativeSize_.height))) {
      dev().error(TAG, 'Invalid expand values.');
      return;
    }
    // Can't expand to greater than the viewport size
    if (expandHeight > this.viewport_.getSize().height ||
        expandWidth > this.viewport_.getSize().width) {
      return;
    }
    this.handleSizeChange(expandHeight,
        expandWidth,
        SERVICE.EXPAND_RESPONSE);
  }

  /**
   * @private
   */
  handleCollapseRequest_() {
    // Only collapse if expanded.
    if (this.isCollapsed_ || !this.isRegistered_) {
      return;
    }
    this.handleSizeChange(this.creativeSize_.height,
        this.creativeSize_.width,
        SERVICE.COLLAPSE_RESPONSE,
        /** isCollapse */ true);
  }

  /**
   * @param {number} height
   * @param {number} width
   * @param {boolean} isCollapsed
   * @param {string} messageType
   */
  resizeSafeframe(height, width, isCollapsed, messageType) {
    this.isCollapsed_ = isCollapsed;
    this.baseInstance_.measureMutateElement(
        /** MEASURER */ () => {
          this.baseInstance_.getResource().measure();
        },
        /** MUTATOR */ () => {
          if (this.iframe_) {
            setStyles(this.iframe_, {
              'height': height + 'px',
              'width': width + 'px',
            });
          }
          this.sendResizeResponse(/** SUCCESS */ true, messageType);
        },
        this.iframe_
    );
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
   */
  handleSizeChange(height, width, messageType, optIsCollapse) {
    if (!optIsCollapse &&
        width <= this.slotSize_.width &&
        height <= this.slotSize_.height) {
      this.resizeSafeframe(height, width, !!optIsCollapse, messageType);
    } else {
      this.resizeAmpAdAndSafeframe(
          height, width, messageType);
    }
  }

  /**
   * @param {!JsonObject} payload
   * @private
   */
  handleShrinkRequest_(payload) {
    if (!this.isRegistered_) {
      return;
    }
    if (isNaN(payload['shrink_b']) || isNaN(payload['shrink_t']) ||
        isNaN(payload['shrink_r']) || isNaN(payload['shrink_l'])) {
      dev().error(TAG, 'Invalid shrink values.');
      return;
    }
    const shrinkHeight = Number(this.iframe_.height) -
          payload['shrink_b'] + payload['shrink_t'];
    const shrinkWidth = Number(this.iframe_.width) -
          payload['shrink_r'] + payload['shrink_l'];
    // Make sure we are actually shrinking here.
    if (shrinkWidth > this.creativeSize_.width ||
        shrinkHeight > this.creativeSize_.height) {
      dev().error(TAG, 'Invalid shrink values.');
      return;
    }

    this.resizeAmpAdAndSafeframe(shrinkHeight, shrinkWidth,
        SERVICE.SHRINK_RESPONSE);
  }

  /**
   * @param {boolean} success
   * @param {string} messageType
   */
  sendResizeResponse(success, messageType) {
    if (!this.iframe_) {
      return;
    }
    this.viewport_.getClientRectAsync(this.iframe_).then(iframeBox => {
      const formattedGeom = this.formatGeom_(iframeBox);
      this.sendMessage_({
        uid: this.uid_,
        success,
        newGeometry: formattedGeom,
        'expand_t': this.currentGeometry_['allowedExpansion_t'],
        'expand_b': this.currentGeometry_['allowedExpansion_b'],
        'expand_r': this.currentGeometry_['allowedExpansion_r'],
        'expand_l': this.currentGeometry_['allowedExpansion_l'],
        push: true,
      }, messageType);
    });
  }

  /**
   * Attempts to resize both the amp-ad and the Safeframe.
   * If the amp-ad can not be resized, then if it was a collapse request,
   * we will still collapse just the safeframe.
   * @param {number} height
   * @param {number} width
   * @param {string} messageType
   */
  resizeAmpAdAndSafeframe(height, width, messageType) {
    const isCollapsed = messageType == SERVICE.COLLAPSE_RESPONSE;
    const isReducing = messageType == SERVICE.COLLAPSE_RESPONSE ||
          messageType == SERVICE.SHRINK_RESPONSE;
    // First, attempt to resize the Amp-Ad that is the parent of the
    // safeframe
    this.baseInstance_.attemptChangeSize(height, width).then(() => {
      // If this resize succeeded, we always resize the safeframe.
      // resizeSafeframe also sends the resize response.
      this.resizeSafeframe(height, width, isCollapsed, messageType);
      // Update our stored record of what the amp-ad's size is. This
      // is just for caching. Setting it here doesn't actually change
      // the size of the amp-ad, the attempt change size above did that.
      this.slotSize_.height = height;
      this.slotSize_.width = width;
    }, /** REJECT CALLBACK */ () => {
      // If the resize initially failed, it may have been queued
      // as a pendingChangeSize, which will cause the size change
      // to execute upon the next user interaction. We don't want
      // that for safeframe, so we reset it here.
      this.baseInstance_.getResource().resetPendingChangeSize();
      if (isReducing) {
        // If this is a collapse or shrink request, then even if resizing
        // the amp-ad failed, still resize the iframe.
        // resizeSafeframe also sends the resize response.
        // Only register as collapsed if explicitly a collapse request.
        this.resizeSafeframe(height, width, isCollapsed, messageType);
      } else {
        // We were attempting to
        // expand past the bounds of the amp-ad, and it failed. Thus,
        // we need to send a failure message, and the safeframe is
        // not resized.
        this.sendResizeResponse(false, messageType);
      }
    }).catch(err => {
      dev().error(TAG, `Resizing failed: ${err}`);
      this.sendResizeResponse(false, messageType);
    });
  }

  /**
   * Handles Fluid-related messages dispatched from SafeFrame.
   * @param {!JsonObject} payload
   * @private
   */
  handleFluidMessage_(payload) {
    let newHeight;
    if (!payload || !(newHeight = parseInt(payload['height'], 10))) {
      // TODO(levitzky) Add actual error handling here.
      this.baseInstance_.forceCollapse();
      return;
    }
    this.baseInstance_.attemptChangeHeight(newHeight)
        .then(() => this.onFluidResize_())
        .catch(() => {
          // TODO(levitzky) Add more error handling here
          this.baseInstance_.forceCollapse();
        });
  }

  /**
   * Fires a delayed impression and notifies the Fluid creative that its
   * container has been resized.
   * @private
   */
  onFluidResize_() {
    if (this.fluidImpressionUrl_) {
      this.baseInstance_.fireDelayedImpressions(
          this.fluidImpressionUrl_);
      this.fluidImpressionUrl_ = null;
    }
    this.iframe_.contentWindow./*OK*/postMessage(
        JSON.stringify(dict({'message': 'resize-complete', 'c': this.channel})),
        SAFEFRAME_ORIGIN);
  }

  /**
   * Unregister this Host API.
   */
  destroy() {
    this.iframe_ = null;
    delete safeframeHosts[this.sentinel_];
    if (this.unlisten_) {
      this.unlisten_();
    }
    if (Object.keys(safeframeHosts).length == 0) {
      removeSafeframeListener();
    }
  }
}

/**
 * Removes the safeframe event listener.
 */
export function removeSafeframeListener() {
  window.removeEventListener('message', safeframeListener, false);
  safeframeListenerCreated_ = false;
}
