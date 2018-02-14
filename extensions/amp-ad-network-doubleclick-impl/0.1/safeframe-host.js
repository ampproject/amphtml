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
 * @type{!Object<string,SafeframeHostApi>}
 */
const safeframeHosts = {};

let safeframeListenerCreated = false;

const MESSAGE_FIELDS = {
  CHANNEL: 'c',
  SENTINEL: 'e',
  ENDPOINT_IDENTITY: 'i',
  PAYLOAD: 'p',
  SERVICE: 's',
  MESSAGE: 'message',
};

const SERVICE = {
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
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/**
 * Event listener callback for message events. If message is a Safeframe message,
 * handles the message.
 * This listener is registered within SafeframeHostApi.
 */
function safeframeListener() {
  const data = tryParseJson(getData(event));
  /** Only process messages that are valid Safeframe messages */
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  if (data[MESSAGE_FIELDS.SENTINEL]) {
    receiveSetupMessage(data);
  } else {
    receiveStandardMessage(data);
  }
}

/**
 * Handles all non-setup messages.
 * @param {Object} data Message data from the postMessage received from
 *   the safeframe.
 */
function receiveStandardMessage(data) {
  const payload = tryParseJson(data[MESSAGE_FIELDS.PAYLOAD]);
  if (!payload || !payload['sentinel']) {
    return;
  }
  const safeframeHost = safeframeHosts[payload['sentinel']];
  if (!safeframeHost) {
    dev().warn(
        TAG, `Safeframe Host for sentinel ${payload['sentinel']} not found.`);
    return;
  }
  safeframeHost.processMessage(payload, data[MESSAGE_FIELDS.SERVICE]);
}


/**
 * Handles the setup message from the safeframe.
 * @param {Object} data Message data from the postMessage received from
 *   the safeframe.
 */
function receiveSetupMessage(data) {
  const safeframeHost = safeframeHosts[data[MESSAGE_FIELDS.SENTINEL]];
  if (!safeframeHost) {
    dev().warn(TAG, 'Safeframe Host for sentinel ' +
               `${data[MESSAGE_FIELDS.SENTINEL]} not found.`);
    return;
  }
  if (!safeframeHost.channel) {
    safeframeHost.connectMessagingChannel(data[MESSAGE_FIELDS.CHANNEL]);
  }
}

/**
 * Sets up the host for GPT Safeframe.
 * @implements {SimplePostMessageApiDef}
 */
export class SafeframeHostApi {

  /**
   * @param {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl} */
    this.baseInstance_ = baseInstance;

    /** @private {Window} */
    this.win_ = this.baseInstance_.win;

    /** @private {string} */
    this.sentinel_ = this.baseInstance_.sentinel;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?IntersectionObserver} */
    this.IntersectionObserver_ = null;

    /** @type {?string} */
    this.channel = null;

    /** @private {?number} */
    this.initialHeight_ = null;

    /** @private {?number} */
    this.initialWidth_ = null;

    /** @private {?Object} */
    this.currentGeometry_ = null;

    /** @private {number} */
    this.endpointIdentity_ = Math.random();

    /** @type {number} */
    this.uid = Math.random();

    this.registerSafeframeHost();
  }

  /**
   * Returns the Safeframe specific name attributes that are needed for the
   * Safeframe creative to properly setup.
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
    attributes['reportCreativeGeometry'] = this.baseInstance_.isFluid_;
    attributes['isDifferentSourceWindow'] = false;
    attributes['sentinel'] = this.sentinel_;
    return attributes;
  }

  /**
   * @return {string}
   */
  getCurrentGeometry() {
    return this.formatGeom_(
        this.baseInstance_.element.getIntersectionChangeEntry());
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
   */
  connectMessagingChannel(channel) {
    // Set the iframe here, because when class is first created the iframe
    // element does not yet exist on this.baseInstance_. The first time
    // we receive a message we know that it now exists.
    this.iframe_ = this.baseInstance_.iframe;
    this.channel = channel;
    dev().assert(this.iframe_.contentWindow,
        'Frame contentWindow unavailable.');
    this.setupGeom_();
    this.sendMessage_(dict({
      'message': 'connect',
      'c': this.channel,
    }), '');
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
    this.IntersectionObserver_ = new IntersectionObserver(
        this.baseInstance_, this.baseInstance_.element, false, this, 1000);
    // This will send a geometry update message, and then start sending
    // them whenever geometry changes as detected by intersection
    // observer. Make sure we always send this initial update message.
    this.IntersectionObserver_.startSendingIntersectionChanges();
  }

  /**
   * Every time that the IntersectionObserver needs to send an update, this
   * method is triggered. Includes page scroll or other visibility change
   * events.
   * Handles sending the geometry update message to the
   * safeframe container, which allows $sf.ext.geom() to work.
   */
  send(unusedTrash, changes) {
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
   * @param {!Object} changes
   * @return {!Object} Corrected intersection change entry.
   */
  correctChanges(changes) {
    const iframeRect = this.iframe_ ? this.iframe_.getBoundingClientRect() :
      this.baseInstance_.creativeSize_;
    const ampAdRect = this.baseInstance_.element.getBoundingClientRect();
    const widthCorrection = (ampAdRect.width - iframeRect.width) / 2;
    const heightCorrection = (ampAdRect.height - iframeRect.height) / 2;
    changes.boundingClientRect.right -= widthCorrection;
    changes.boundingClientRect.top += heightCorrection;
    changes.boundingClientRect.bottom -= heightCorrection;
    changes.boundingClientRect.left += widthCorrection;
    return changes;
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
    const percInView = (a1, b1, a2, b2) => {
      const lengthInView = (b2 >= b1) ? b1 - a2 : b2;
      const percInView = lengthInView / (b2 - a2);
      if (percInView < 0) {
        return 0;
      } else if (percInView > 1) {
        return 1;
      } else {
        return percInView;
      }
    };
    changes = this.correctChanges(changes);
    const expandBounds = this.getExpandBounds(changes);
    this.currentGeometry_ = {
      'windowCoords_t': changes.rootBounds.top,
      'windowCoords_r': changes.rootBounds.right,
      'windowCoords_b': changes.rootBounds.bottom,
      'windowCoords_l': changes.rootBounds.left,
      'frameCoords_t': changes.boundingClientRect.top,
      'frameCoords_r': changes.boundingClientRect.right,
      'frameCoords_b': changes.boundingClientRect.bottom,
      'frameCoords_l': changes.boundingClientRect.left,
      'styleZIndex': this.baseInstance_.element.style.zIndex,
      'allowedExpansion_t': expandBounds.height,
      'allowedExpansion_r': expandBounds.width,
      'allowedExpansion_b': expandBounds.height,
      'allowedExpansion_l': expandBounds.width,
      'yInView': percInView(changes.rootBounds.top,
          changes.rootBounds.bottom,
          changes.boundingClientRect.top,
          changes.boundingClientRect.bottom),
      'xInView': percInView(changes.rootBounds.left,
          changes.rootBounds.right,
          changes.boundingClientRect.left,
          changes.boundingClientRect.right),
    };
    return JSON.stringify(this.currentGeometry_);
  }

  /**
   * Calculates and returns the allowed expansion values for height and width.
   * @param {!Object} changes Intersection change entry.
   * @returns {!Object<string, number>}
   */
  getExpandBounds(changes) {
    const frameHeight = changes.boundingClientRect.bottom -
          changes.boundingClientRect.top;
    const frameWidth = changes.boundingClientRect.right -
          changes.boundingClientRect.left;
    const viewportHeight = changes.rootBounds.bottom -
          changes.rootBounds.top;
    const viewportWidth = changes.rootBounds.right -
          changes.rootBounds.left;
    return {
      width: (viewportWidth - frameWidth) / 2,
      height: (viewportHeight - frameHeight) / 2,
    };
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
    const message = {};
    message[MESSAGE_FIELDS.CHANNEL] = this.channel;
    message[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify(payload);
    message[MESSAGE_FIELDS.SERVICE] = serviceName;
    message[MESSAGE_FIELDS.SENTINEL] = this.sentinel_;
    message[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = this.endpointIdentity_;
    this.iframe_.contentWindow./*OK*/postMessage(
        JSON.stringify(message), SAFEFRAME_ORIGIN);
  }

  /**
   * Routes messages to their appropriate handler.
   * @param {!Object} payload
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
   * @param {!Object} payload
   * @private
   */
  handleRegisterDone_(payload) {
    this.initialHeight_ = payload['initialHeight'];
    this.initialWidth_ = payload['initialWidth'];
  }

  /**
   * @param {!Object} payload
   * @private
   */
  handleExpandRequest_(payload) {
    let expandHeight = Math.floor(payload.expand_b +
                                 payload.expand_t);
    let expandWidth = Math.floor(payload.expand_r +
                                 payload.expand_l);
    // We assume that a fair amount of usage of this API will try to pass the final
    // size of the iframe that is desired, instead of the correct usage which is
    // specify how much to expand by. We try to protect against this, by detecting
    // if the requested expansion size matches the size of the amp-ad element, and
    // if so we assume that the desired effect was to resize to fill the element.
    if (expandWidth != this.baseInstance_.element.style.width.split('px')[0] ||
       expandHeight != this.baseInstance_.element.style.height.split('px')[0]) {
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
    this.handleSizeChange(this.baseInstance_.initialSize_.height,
        this.baseInstance_.initialSize_.width,
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
        width <= this.baseInstance_.creativeSize_.width &&
        height <= this.baseInstance_.creativeSize_.height) {
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
      'expand_t': this.currentGeometry_.allowedExpansion_t,
      'expand_b': this.currentGeometry_.allowedExpansion_b,
      'expand_r': this.currentGeometry_.allowedExpansion_r,
      'expand_l': this.currentGeometry_.allowedExpansion_l,
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
      this.sendResizeResponse(success, message);
    }).catch(() => {});
  }

  /**
   * Handles Fluid-related messages dispatched from SafeFrame.
   * @param {!Object} payload
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
}
