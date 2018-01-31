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

import {tryParseJson} from '../../../src/json';
import {getData} from '../../../src/event-helper';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {IntersectionObserver} from '../../../src/intersection-observer';
import {SimplePostMessageApiDef} from '../../../src/simple-postmessage-api-def';

/**
 * Used to manage messages for different Safeframe ad slots.
 *
 * Maps a sentinel value to an instance of the SafeframeHostApi to which that
 * sentinel value belongs.
 * @type{!Object<string, !AmpAdNetworkDoubleclickImpl>}
 */
const safeframeHosts = {};

let safeframeListenerCreated = false;

const MESSAGE_FIELDS = {
  CHANNEL: 'c',
  SENTINEL: 'e',
  ENDPOINT_IDENTITY: 'i',
  PAYLOAD: 'p',
  SERVICE: 's',
};

const SERVICE = {
  GEOMETRY_UPDATE: 'geometry_update',
  CREATIVE_GEOMETRY_UPDATE: 'creative_geometry_update',
  EXPAND_REQUEST: 'expand_request',
  EXPAND_RESPONSE: 'expand_response',
  REGISTER_DONE: 'register_done',
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
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }

  /**
   * If the sentinel is provided at the top level, this is a message simply
   * to setup the postMessage channel, so set it up.
   */
  if (data[MESSAGE_FIELDS.SENTINEL]) {
    const safeframeHost = safeframeHosts[data[MESSAGE_FIELDS.SENTINEL]];
    if (!safeframeHost) {
      dev().warn(TAG, 'Safeframe Host for sentinel ' +
                 `${data[MESSAGE_FIELDS.SENTINEL]} not found.`);
      return;
    }
    if (!safeframeHost.channel) {
        safeframeHost.connectMessagingChannel(data[MESSAGE_FIELDS.CHANNEL]);
    }
    return;
  }

  /**
   * If sentinel not provided at top level, parse the payload and process the message.
   */
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
  safeframeHost.processMessage(payload, data['s']);

}

/**
 * This class is sets up the host for GPT Safeframe.
 * @implements {SimplePostMessageApiDef}
 */
export class SafeframeHostApi {

  /**
   * @param {AmpAdNetworkDoubleclickImpl} baseInstance
   */
  constructor(baseInstance) {
    /** @private {AmpAdNetworkDoubleclickImpl} */
    this.baseInstance_ = baseInstance;

    /** @private {Window} */
    this.win_ = this.baseInstance_.win;

    /** @private {string} */
    this.sentinel_ = this.baseInstance_.sentinel;

    /** @private {?IntersectionObserver} */
    this.IntersectionObserver_ = null;

    /** @type {string} */
    this.channel = null;

    /** @private {number} */
    this.initialHeight_ = null;

    /** @private {number} */
    this.initialWidth_ = null;

    /** @private {Object} */
    this.currentGeometry_ = null;

    /** @private {number} */
    this.endpointIdentity_ = Math.random();

    /** @type {number} */
    this.uid = Math.random();

    this.registerSafeframeHost();
  }

  getSafeframeNameAttr() {
    const attributes = dict({});
    // TODO: Some of these options are probably not right.
    attributes['uid'] = this.uid;
    attributes['hostPeerName'] = this.win_.location.origin;
    attributes['initialGeometry'] = this.formatGeom_(
        this.baseInstance_.element.getIntersectionChangeEntry());
    attributes['permissions'] = JSON.stringify(
        dict({
          'expandByOverlay': false,
          'expandByPush': false,
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
    this.channel = channel;
    dev().assert(this.baseInstance_.iframe.contentWindow,
        'Frame contentWindow unavailable.');
    this.setupGeom_();
    this.sendMessage_(dict({
      'message': 'connect',
      'c': this.channel,
    }));
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
        this.baseInstance_, this.baseInstance_.iframe, false, this);
    this.IntersectionObserver_.startSendingIntersectionChanges();
  }

  /**
   * Every time that the IntersectionObserver needs to send an update, this
   * method is triggered. Includes page scroll or other visibility change
   * events.
   * Handles sending the geometry update message to the
   * safeframe container, which allows $sf.ext.geom() to work.
   * @override
   */
  send(unusedTrash, changes) {
    this.sendMessage_(JSON.stringify({
      newGeometry: this.formatGeom_(changes['changes'][0]),
      uid: 1,
    }), SERVICE.GEOMETRY_UPDATE
    );
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
      'allowedExpansion_t': changes.rootBounds.top,
      'allowedExpansion_r': changes.rootBounds.right,
      'allowedExpansion_b': changes.rootBounds.bottom,
      'allowedExpansion_l': changes.rootBounds.left,
      'xInView': percInView(changes.rootBounds.top,
          changes.rootBounds.bottom,
          changes.boundingClientRect.top,
          changes.boundingClientRect.bottom),
      'yInView': percInView(changes.rootBounds.left,
          changes.rootBounds.right,
          changes.boundingClientRect.left,
          changes.boundingClientRect.right),
    };
    return JSON.stringify(this.currentGeometry_);
  }

  /**
   * Handles serializing and sending messages to the safeframe.
   * @param {Object} payload
   * @param {string} serviceName
   * @private
   */
  sendMessage_(payload, serviceName) {
    const message = {};
    message[MESSAGE_FIELDS.CHANNEL] = this.channel;
    message[MESSAGE_FIELDS.PAYLOAD] = payload;
    message[MESSAGE_FIELDS.SERVICE] = serviceName;
    message[MESSAGE_FIELDS.SENTINEL] = this.sentinel_;
    message[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = this.endpointIdentity_;
    this.baseInstance_.iframe.contentWindow./*OK*/postMessage(
        JSON.stringify(message), SAFEFRAME_ORIGIN);
  }

  /**
   * Routes messages to their appropriate handler.
   * @param {Object} payload
   * @param {string} service
   */
  processMessage(payload, service) {
    switch (service) {
      case SERVICE.CREATIVE_GEOMETRY_UPDATE:
        this.handleFluidMessage_(payload);
        break;
      case SERVICE.EXPAND_REQUEST:
        this.handleExpandRequest_(payload);
      case SERVICE.REGISTER_DONE:
        this.handleRegisterDone_(payload);
    }
    return;
  }

  /**
   * @param {!Object} payload
   * @private
   */
  handleRegisterDone_(payload) {
    this.initialHeight_ = payload.initialHeight;
    this.initialWidth_ = payload.initialWidth;
  }

  /**
   * @param {!Object} payload
   * @private
   */
  handleExpandRequest_(payload) {
    const width = payload.expand_r - payload.expand_l;
    const height = payload.expand_b - payload.expand_t;
    this.baseInstance_.attemptChangeSize(height, width).catch(() => {});
    //this.baseInstance_.handleResize_(width, height);
    // TODO : make the response accurate, right now just defaults to success
    const responsePayload = JSON.stringify({
      uid: 1,
      success: true,
      newGeometry: JSON.stringify(this.currentGeometry_),
      'expand_t': this.currentGeometry_.allowedExpansion_t,
      'expand_b': this.currentGeometry_.allowedExpansion_b,
      'expand_r': this.currentGeometry_.allowedExpansion_r,
      'expand_l': this.currentGeometry_.allowedExpansion_l,
      push: true,
    });
    this.sendMessage_(responsePayload, SERVICE.EXPAND_RESPONSE);
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
        .then(() => this.baseInstance_.onFluidResize_())
        .catch(() => {
          // TODO(levitzky) Add more error handling here
          this.baseInstance_.forceCollapse();
        });
  }
}
