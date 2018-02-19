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

import {IntersectionObserver} from '../../../src/intersection-observer';
import {SimplePostMessageApiDef} from '../../../src/simple-postmessage-api-def';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {tryParseJson} from '../../../src/json';

/**
 * Used to manage messages for different Safeframe ad slots.
 *
 * Maps a sentinel value to an instance of the SafeframeHostApi to which that
 * sentinel value belongs.
 * @type{!Object<string,!SafeframeHostApi>}
 */
const safeframeHosts = {};

let safeframeListenerCreated = false;

export const MESSAGE_FIELDS = {
  CHANNEL: 'c',
  SENTINEL: 'e',
  ENDPOINT_IDENTITY: 'i',
  PAYLOAD: 'p',
  SERVICE: 's',
  MESSAGE: 'message',
};

export const SERVICE = {
  GEOMETRY_UPDATE: 'geometry_update',
  CREATIVE_GEOMETRY_UPDATE: 'creative_geometry_update',
  EXPAND_REQUEST: 'expand_request',
  EXPAND_RESPONSE: 'expand_response',
  REGISTER_DONE: 'register_done',
  COLLAPSE_REQUEST: 'collapse_request',
  COLLAPSE_RESPONSE: 'collapse_response',
};

const TAG = 'AMP-DOUBLECLICK-SAFEFRAME';

/** @const {string} */
export const SAFEFRAME_ORIGIN = /**getMode(window).test ? 'http://localhost:9876' :*/
    'https://tpc.googlesyndication.com';

/**
 * Event listener callback for message events. If message is a Safeframe message,
 * handles the message.
 * This listener is registered within SafeframeHostApi.
 */
export function safeframeListener(event) {
  const data = tryParseJson(getData(event));
  /** Only process messages that are valid Safeframe messages */
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  let payload;
  if (!data[MESSAGE_FIELDS.SENTINEL]) {
    payload = tryParseJson(data[MESSAGE_FIELDS.PAYLOAD]);
  }
  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  const sentinel = data[MESSAGE_FIELDS.SENTINEL] || (payload || {})['sentinel'];
  const safeframeHost = safeframeHosts[sentinel];
  if (!safeframeHost) {
    dev().warn(TAG, `Safeframe Host for sentinel: ${sentinel} not found.`);
    return;
  }
  if (!safeframeHost.channel) {
    safeframeHost.connectMessagingChannel(data[MESSAGE_FIELDS.CHANNEL]);
  } else if (payload) {
    safeframeHost.processMessage(payload, data[MESSAGE_FIELDS.SERVICE]);
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
 * @implements {SimplePostMessageApiDef}
 */
export class SafeframeHostApi {

  /**
   * @param {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} baseInstance
   * @param {boolean} isFluid
   * @param {?({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)} initialSize
   * @param {?({width, height}|../../../src/layout-rect.LayoutRectDef)} creativeSize
   */
  constructor(baseInstance, isFluid, initialSize, creativeSize) {
    /** @private {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} */
    this.baseInstance_ = baseInstance;

    /** @private {Window} */
    this.win_ = this.baseInstance_.win;

    /** @private {string} */
    this.sentinel_ = this.baseInstance_.sentinel;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @type {?string} */
    this.channel = null;

    /** @private {?number} */
    this.initialHeight_ = null;

    /** @private {?number} */
    this.initialWidth_ = null;

    /** @private {?JsonObject} */
    this.currentGeometry_ = null;

    /** @private {number} */
    this.endpointIdentity_ = Math.random();

    /** @type {number} */
    this.uid = Math.random();

    /** @private {boolean} */
    this.isFluid_ = isFluid;

    /** @private {?({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)} */
    this.initialSize_ = initialSize;

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.creativeSize_ = creativeSize;

    /** @private {!Object} */
    this.iframeOffsets_ = {};

    this.registerSafeframeHost();
  }

  /**
   * Returns the Safeframe specific name attributes that are needed for the
   * Safeframe creative to properly setup.
   * @return {!JsonObject}
   */
  getSafeframeNameAttr() {
    const attributes = dict({});
    // TODO: Some of these options are probably not right.
    attributes['uid'] = this.uid;
    attributes['hostPeerName'] = this.win_.location.origin;
    attributes['initialGeometry'] = this.getCurrentGeometry();
    attributes['permissions'] = JSON.stringify(
        dict({
          'expandByOverlay': false,
          'expandByPush': true,
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
   * Gets the current intersection change entry, and returns the
   *   SafeFrame formatted change. See formatGeom_() for details on what
   *   that format looks like.
   * @return {string}
   */
  getCurrentGeometry() {
    const changes = this.baseInstance_.element.getIntersectionChangeEntry();
    this.updateIframeOffsets(changes);
    return this.formatGeom_(changes);
  }

  /**
   * Registers this instance as the host API for the current sentinel.
   * If the global safeframe listener has not yet been created, it creates
   * that as well.
   */
  registerSafeframeHost() {
    safeframeHosts[this.sentinel_] = safeframeHosts[this.sentinel_] || this;
    if (!safeframeListenerCreated) {
      safeframeListenerCreated = true;
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
    dev().assert(this.iframe_.contentWindow,
        'Frame contentWindow unavailable.');
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
    this.intersectionObserver_ = new IntersectionObserver(
        this.baseInstance_, this.baseInstance_.element, false, this, 1000);
    // This will send a geometry update message, and then start sending
    // them whenever geometry changes as detected by intersection
    // observer. Make sure we always send this initial update message.
    this.intersectionObserver_.startSendingIntersectionChanges();
  }

  /**
   * Every time that the IntersectionObserver needs to send an update, this
   * method is triggered. Includes page scroll or other visibility change
   * events.
   * Handles sending the geometry update message to the
   * safeframe container, which allows $sf.ext.geom() to work.
   * @param {string} unused
   * @param {!JsonObject} changes Intersection change entry.
   * @override
   */
  send(unused, changes) {
    this.sendMessage_({
      newGeometry: this.formatGeom_(changes['changes'][0]),
      uid: this.uid,
    }, SERVICE.GEOMETRY_UPDATE);
  }

  /**
   * The IntersectionObserver class is monitoring the amp-ad element,
   * not the Safeframe. The Safeframe is not necessarily the exact
   * same size as the amp-ad element, so calculate the width and height
   * correction between the amp-ad element and the safeframe iframe, and then
   * modify the change entry to be correct.
   * @param {!JsonObject} changes
   */
  updateIframeOffsets(changes) {
    let iframeRect;
    if (this.iframe_) {
      iframeRect = this.iframe_.getBoundingClientRect();
      this.iframeOffsets_['dT'] = iframeRect.top -
          changes['boundingClientRect']['top'];
      this.iframeOffsets_['dR'] = iframeRect.right -
          changes['boundingClientRect']['right'];
      this.iframeOffsets_['dL'] = iframeRect.left -
          changes['boundingClientRect']['left'];
      this.iframeOffsets_['dB'] = iframeRect.bottom -
          changes['boundingClientRect']['bottom'];
      this.iframeOffsets_['width'] = iframeRect.width;
      this.iframeOffsets_['height'] = iframeRect.height;
    } else {
      iframeRect = this.creativeSize_;
      this.iframeOffsets_['dL'] = (changes['boundingClientRect']['width'] -
                                  iframeRect.width) / 2;
      this.iframeOffsets_['dB'] = (changes['boundingClientRect']['height'] -
                                  iframeRect.height) / 2;
      this.iframeOffsets_['dR'] = -this.iframeOffsets_['dL'];
      this.iframeOffsets_['dT'] = -this.iframeOffsets_['dB'];
      this.iframeOffsets_['width'] = iframeRect.width;
      this.iframeOffsets_['height'] = iframeRect.height;
    }
  }

  /**
   * Converts an IntersectionObserver-formatted change message to the
   * geometry update format expected by GPT Safeframe.
   * @param {!Object} changes IntersectionObserver formatted
   *   changes.
   * @return {string} Safeframe formatted changes.
   * @private
   */
  formatGeom_(changes) {
    changes.boundingClientRect.right += this.iframeOffsets_['dR'];
    changes.boundingClientRect.top += this.iframeOffsets_['dT'];
    changes.boundingClientRect.bottom += this.iframeOffsets_['dB'];
    changes.boundingClientRect.left += this.iframeOffsets_['dL'];
    this.currentGeometry_ = /** @type {JsonObject} */({
      'windowCoords_t': changes.rootBounds.top,
      'windowCoords_r': changes.rootBounds.right,
      'windowCoords_b': changes.rootBounds.bottom,
      'windowCoords_l': changes.rootBounds.left,
      'frameCoords_t': changes.boundingClientRect.top,
      'frameCoords_r': changes.boundingClientRect.right,
      'frameCoords_b': changes.boundingClientRect.bottom,
      'frameCoords_l': changes.boundingClientRect.left,
      'styleZIndex': this.baseInstance_.element.style.zIndex,
      // AMP's built in resize methodology that we use only allows expansion
      // to the right and bottom, so we enforce that here.
      'allowedExpansion_r': changes.rootBounds.width -
          this.iframeOffsets_['width'],
      'allowedExpansion_b': changes.rootBounds.height -
          this.iframeOffsets_['height'],
      'allowedExpansion_t': 0,
      'allowedExpansion_l': 0,
      'yInView': this.getPercInView(
          changes.rootBounds.bottom,
          changes.boundingClientRect.top,
          changes.boundingClientRect.bottom),
      'xInView': this.getPercInView(
          changes.rootBounds.right,
          changes.boundingClientRect.left,
          changes.boundingClientRect.right),
    });
    return JSON.stringify(this.currentGeometry_);
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
    if (percInView < 0) {
      return 0;
    } else if (percInView > 1) {
      return 1;
    } else {
      return percInView;
    }
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
    switch (service) {
      case SERVICE.CREATIVE_GEOMETRY_UPDATE:
        this.handleFluidMessage_(payload);
        break;
      case SERVICE.EXPAND_REQUEST:
        this.handleExpandRequest_(payload);
        break;
      case SERVICE.REGISTER_DONE:
        this.handleRegisterDone_(payload);
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
  handleRegisterDone_(payload) {
    this.initialHeight_ = payload['initialHeight'];
    this.initialWidth_ = payload['initialWidth'];
  }

  /**
   * @param {!JsonObject} payload
   * @private
   */
  handleExpandRequest_(payload) {
    let expandHeight = payload['expand_b'] + payload['expand_t'];
    let expandWidth = payload['expand_r'] + payload['expand_l'];
    // We assume that a fair amount of usage of this API will try to pass the final
    // size of the iframe that is desired, instead of the correct usage which is
    // specify how much to expand by. We try to protect against this, by detecting
    // if the requested expansion size matches the size of the amp-ad element, and
    // if so we assume that the desired effect was to resize to fill the element.
    if (expandWidth != this.initialWidth_ ||
        expandHeight != this.initialHeight_) {
      expandWidth += Number(this.iframe_.width);
      expandHeight += Number(this.iframe_.height);
    }
    this.handleSizeChange(expandHeight,
        expandWidth,
        SERVICE.EXPAND_RESPONSE);
  }

  /**
   * @private
   */
  handleCollapseRequest_() {
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
    this.iframe_.style.height = height + 'px';
    this.iframe_.style.width = width + 'px';
  }

  /**
   * Resizes the safeframe, and potentially the containing amp-ad element.
   * Then sends a response message to the Safeframe creative.
   * @param {number} height In pixels.
   * @param {number} width In pixels.
   * @param {string} message
   * @param {boolean=} optIsCollapse Whether this is a collapse attempt.
   */
  handleSizeChange(height, width, message, optIsCollapse) {
    // If the new size is fully contained within the bounds of the amp-ad,
    // we can resize immediately as there will be no reflow.
    if (!optIsCollapse &&
        width <= this.creativeSize_.width &&
        height <= this.creativeSize_.height) {
      this.resizeIframe(height, width);
      this.sendResizeResponse(/** SUCCESS */ true, message);
    } else {
      this.resizeAmpAdAndSafeframe(
          height, width, message, optIsCollapse);
    }
  }

  /**
   * @param {boolean} success
   * @param {string} message
   */
  sendResizeResponse(success, message) {
    this.sendMessage_({
      uid: this.uid,
      success,
      newGeometry: this.getCurrentGeometry(),
      'expand_t': this.currentGeometry_['allowedExpansion_t'],
      'expand_b': this.currentGeometry_['allowedExpansion_b'],
      'expand_r': this.currentGeometry_['allowedExpansion_r'],
      'expand_l': this.currentGeometry_['allowedExpansion_l'],
      push: true,
    }, message);
  }

  /**
   *
   * @param {number} height
   * @param {number} width
   * @param {string} message
   * @param {boolean=} optIsCollapse
   */
  resizeAmpAdAndSafeframe(height, width, message, optIsCollapse) {
    this.baseInstance_.attemptChangeSize(height, width).then(() => {
      const success = !!this.baseInstance_.element.style.height.match(height)
              && !!this.baseInstance_.element.style.width.match(width);
      // If the amp-ad element was successfully resized, always update
      // the size of the safeframe as well. If the amp-ad element could not
      // be resized, but this is a collapse request, then only collapse
      // the safeframe.
      if (success || optIsCollapse) {
        this.resizeIframe(height, width);
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
      this.sendResizeResponse(success || !!optIsCollapse, message);
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
    if (this.baseInstance_.fluidImpressionUrl) {
      this.baseInstance_.fireDelayedImpressions(
          this.baseInstance_.fluidImpressionUrl);
      this.baseInstance_.fluidImpressionUrl = null;
    }
    this.iframe_.contentWindow./*OK*/postMessage(
        JSON.stringify(dict({'message': 'resize-complete', 'c': this.channel})),
        SAFEFRAME_ORIGIN);
  }

  /**
   * Unregister this Host API.
   */
  destroy() {
    safeframeHosts[this.sentinel] = undefined;
  }
}
