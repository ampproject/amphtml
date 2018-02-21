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
import {setStyles} from '../../../src/style';
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

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

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
    this.initialSize_ = initialSize;

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.creativeSize_ = creativeSize;

    /** @private {?string} */
    this.fluidImpressionUrl_ = fluidImpressionUrl;

    /** @private {boolean} */
    this.sendPositionUpdate_ = false;

    /** @private {?Promise} */
    this.delay_ = null;

    /** @private {../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = this.baseInstance_.getViewport();

    /** @private {boolean} */
    this.isCollapsed_ = true;

    /** @private {boolean} */
    this.isRegistered_ = false;

    const sfConfig = Object(tryParseJson(
        this.baseInstance_.element.getAttribute(
            'data-safeframe-config')) || {});
    /** @private {boolean} */
    this.expandByOverlay_ = (sfConfig.hasOwnProperty('expandByOverlay') &&
                             !!sfConfig['expandByOverlay']) || true;

    /** @private {boolean} */
    this.expandByPush_ = (sfConfig.hasOwnProperty('expandByPush') &&
                          !!sfConfig['expandByPush']) || true;

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
          },
        }));
    attributes['reportCreativeGeometry'] = this.isFluid_;
    attributes['isDifferentSourceWindow'] = false;
    attributes['sentinel'] = this.sentinel_;
    return attributes;
  }

  /**
   * Returns the initialGeometry to assign to the name of the safeframe
   * for rendering. This needs to be done differently than all the other
   * geometry updates, because we don't actually have access to the
   * rendered safeframe yet.
   * @return {string}
   */
  getInitialGeometry() {
    const ampAdBox = this.baseInstance_.element.getBoundingClientRect();
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
    this.viewport_.onScroll(this.maybeUpdateGeometry_.bind(this));
    this.viewport_.onChanged(this.maybeUpdateGeometry_.bind(this));
    this.updateGeometry_();
  }

  /**
   * Attempts to call updateGeometry_ to send a geometry update into the
   * safeframe. If it has been less than 1 second since the last update
   * and there is still an active delay, instead it registers that
   * a geometry update is required.
   * @private
   */
  maybeUpdateGeometry_() {
    this.sendPositionUpdate_ = true;
    if (!this.delay_) {
      this.updateGeometry_();
    }
  }

  /**
   * Sends a geometry update message into the safeframe, and sets a timer
   * to prevent another update being sent for 1 second. When the timer is
   * up, if this.sendPositionUpdate_ is set, then it sends another update.
   * @private
   */
  updateGeometry_() {
    if (!this.iframe_) {
      return;
    }
    this.delay_ = Services.timerFor(this.win_).promise(1000).then(() => {
      this.delay_ = null;
      if (this.sendPositionUpdate_) {
        this.updateGeometry_();
      }
    });
    this.sendPositionUpdate_ = false;
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
    const viewportSize = this.viewport_.getSize();
    const currentGeometry = /** @type {JsonObject} */({
      'windowCoords_t': 0,
      'windowCoords_r': viewportSize.width,
      'windowCoords_b': viewportSize.height,
      'windowCoords_l': 0,
      'frameCoords_t': iframeBox.top,
      'frameCoords_r': iframeBox.right,
      'frameCoords_b': iframeBox.bottom,
      'frameCoords_l': iframeBox.left,
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
      default:
        break;
    }
  }

  /**
   * @param {!JsonObject} payload
   * @private
   */
  handleExpandRequest_(payload) {
    if (!this.isCollapsed_ || !this.isRegistered_) {
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
      return;
    }
    // We only allow expand by push if the requested expansion size
    // is greater than the bounds of the amp-ad element.
    if (!payload['push'] && (expandWidth > this.creativeSize_.width ||
                             expandHeight > this.creativeSize_.height)) {
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
    if (this.isCollapsed_ || !this.isRegistered_) {
      return;
    }
    this.handleSizeChange(this.initialSize_.height,
        this.initialSize_.width,
        SERVICE.COLLAPSE_RESPONSE,
        /** isCollapse */ true);
  }

  /**
   * @param {number} height
   * @param {number} width
   */
  resizeIframe(height, width) {
    if (this.iframe_) {
      setStyles(this.iframe_, {
        'height': height + 'px',
        'width': width + 'px',
      });
    }
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
        width <= this.creativeSize_.width &&
        height <= this.creativeSize_.height) {
      this.resizeIframe(height, width);
      this.isCollapsed_ = !!optIsCollapse;
      this.sendResizeResponse(/** SUCCESS */ true, messageType);
    } else {
      this.resizeAmpAdAndSafeframe(
          height, width, messageType, optIsCollapse);
    }
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
   *
   * @param {number} height
   * @param {number} width
   * @param {string} messageType
   * @param {boolean=} optIsCollapse
   */
  resizeAmpAdAndSafeframe(height, width, messageType, optIsCollapse) {
    this.baseInstance_.attemptChangeSize(height, width).then(() => {
      const success = !!this.baseInstance_.element.style.height.match(height)
              && !!this.baseInstance_.element.style.width.match(width);
      // If the amp-ad element was successfully resized, always update
      // the size of the safeframe as well. If the amp-ad element could not
      // be resized, but this is a collapse request, then only collapse
      // the safeframe.
      if (success || optIsCollapse) {
        this.resizeIframe(height, width);
        this.isCollapsed_ = !!optIsCollapse;
        this.baseInstance_.element.getResources().resources_.forEach(
            resource => {
              if (resource.element == this.baseInstance_.element) {
                // Need to force a measure event, as measure won't happen immediately
                // if the element was above the viewport when resize occured, and
                // without a measure, we'll send the wrong size for the creative
                // on the geometry update message.
                resource.measure();
              }
            });
      } else {
        // attemptChangeSize automatically registers a pendingChangeSize if
        // the initial attempt failed. We do not want to do that, so clear it.
        this.baseInstance_.element.getResources().resources_.forEach(
            resource => {
              if (resource.element == this.baseInstance_.element) {
                resource.pendingChangeSize_ = undefined;
              }
            });
      }
      this.sendResizeResponse(success || !!optIsCollapse, messageType);
    }).catch(() => {});
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
    delete safeframeHosts[this.sentinel_];
  }
}

/**
 * Removes the safeframe event listener.
 */
export function removeSafeframeListener() {
  window.removeEventListener('message', safeframeListener, false);
  safeframeListenerCreated_ = false;
}
