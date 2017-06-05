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

import {
  assertHttpsUrl,
  parseUrl,
  checkCorsUrl,
} from '../../../src/url';
import {urls} from '../../../src/config';
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {loadPromise} from '../../../src/event-helper';
import {timerFor} from '../../../src/services';
import {removeElement} from '../../../src/dom';
import {setStyle, setStyles} from '../../../src/style';
import {hasOwn, map} from '../../../src/utils/object';
import {IframeMessagingClient} from '../../../3p/iframe-messaging-client';

/** @private @const {string} */
const TAG_ = 'amp-analytics.Transport';

/** @private @const {number} */
const MESSAGE_THROTTLE_TIME_ = 100;

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export class Transport {
  /**
   * @param {!string} type The value of the amp-analytics tag's type attribute
   */
  constructor(type) {
    /** @private @const {string} */
    this.id_ = Transport.createUniqueId_();

    /** @private @const {string} */
    this.type_ = type;
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @param {Object<string, string>=} transportOptions
   */
  sendRequest(win, request, transportOptions) {
    if (transportOptions && transportOptions['iframe']) {
      this.sendRequestUsingCrossDomainIframe_(request, transportOptions);
      return;
    }
    assertHttpsUrl(request, 'amp-analytics request');
    checkCorsUrl(request);
    if (transportOptions['beacon'] &&
      Transport.sendRequestUsingBeacon(win, request)) {
      return;
    }
    if (transportOptions['xhrpost'] &&
      Transport.sendRequestUsingXhr(win, request)) {
      return;
    }
    if (transportOptions['image']) {
      Transport.sendRequestUsingImage(win, request);
      return;
    }
    user().warn(TAG_, 'Failed to send request', request, transportOptions);
  }

  /**
   * @param {!Window} unusedWin
   * @param {string} request
   */
  static sendRequestUsingImage(unusedWin, request) {
    const image = new Image();
    image.src = request;
    image.width = 1;
    image.height = 1;
    loadPromise(image).then(() => {
      dev().fine(TAG_, 'Sent image request', request);
    }).catch(() => {
      user().warn(TAG_, 'Response unparseable or failed to send image ' +
          'request', request);
    });
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports navigator.sendBeacon.
   */
  static sendRequestUsingBeacon(win, request) {
    if (!win.navigator.sendBeacon) {
      return false;
    }
    const result = win.navigator.sendBeacon(request, '');
    if (result) {
      dev().fine(TAG_, 'Sent beacon request', request);
    }
    return result;
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports cross-domain XHR.
   */
  static sendRequestUsingXhr(win, request) {
    if (!win.XMLHttpRequest) {
      return false;
    }
    /** @const {XMLHttpRequest} */
    const xhr = new win.XMLHttpRequest();
    if (!('withCredentials' in xhr)) {
      return false; // Looks like XHR level 1 - CORS is not supported.
    }
    xhr.open('POST', request, true);
    xhr.withCredentials = true;

    // Prevent pre-flight HEAD request.
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        dev().fine(TAG_, 'Sent XHR request', request);
      }
    };

    xhr.send('');
    return true;
  }

  /**
   * If iframe is specified in config/transport, check whether third-party
   * iframe already exists, and if not, create it.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!Object<string,string>} transportOptions The 'transport' portion
   * of the amp-analytics config object
   * @param {function(!string,string)=} opt_processResponse An optional
   * function to receive any response messages back from the cross-domain iframe
   */
  processCrossDomainIframe(ampDoc, transportOptions, opt_processResponse) {
    dev().assert(transportOptions['iframe'],
      'Cross-domain frame parameters missing');
    const frameUrl = transportOptions['iframe'];
    this.beginUsingCrossDomainIframe_(ampDoc, frameUrl,
      transportOptions['extraData']);
    const frameData = Transport.crossDomainIframes_[frameUrl];
    const iframeMessagingClient = frameData.iframeMessagingClient;
    iframeMessagingClient.registerCallback(
      'ampAnalytics3pReady', () => {
        iframeMessagingClient.setHostWindow(frameData.frame.contentWindow);
        Transport.setIsReady_(frameUrl);
      });
    if (!opt_processResponse) {
      return;
    }
    iframeMessagingClient.registerCallback(
      'ampAnalytics3pResponse', response => {
        if (!response || !response.ampAnalytics3pResponse) {
          return;
        }
        opt_processResponse(this.type_, response.ampAnalytics3pResponse);
      });
  }

  /**
   * If iframe doesn't exist for this iframe url, create it.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!string} frameUrl The URL of the frame to send the data to
   * @param {string=} opt_extraData The data to send to the frame
   * @private
   */
  beginUsingCrossDomainIframe_(ampDoc, frameUrl, opt_extraData) {
    if (Transport.hasCrossDomainIframe_(frameUrl)) {
      Transport.incrementIframeUsageCount_(frameUrl);
      this.sendExtraData_(frameUrl, opt_extraData);
    } else {
      const frame = this.createCrossDomainIframe_(ampDoc, frameUrl,
        opt_extraData);
      ampDoc.body.appendChild(frame);
    }
  }
  /**
   * Called when a creative no longer needs its cross-domain iframe (for
   * instance, because the creative has been removed from the DOM).
   * Once all creatives using a frame are done with it, the frame can be
   * destroyed.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!Object<string,string>} transportOptions The 'transport' portion
   * of the amp-analytics config object
   */
  static doneUsingCrossDomainIframe(ampDoc, transportOptions) {
    const frameUrl = transportOptions['iframe'];
    if (!Transport.hasCrossDomainIframe_(frameUrl) ||
      Transport.decrementIframeUsageCount_(frameUrl) > 0) {
      return;
    }
    ampDoc.body.removeChild(Transport.crossDomainIframes_[frameUrl].frame);
    delete Transport.crossDomainIframes_[frameUrl];
  }

  /**
   * Record that one more creative is using this cross-domain iframe
   * @param {!string} frameUrl The URL of the frame
   * @return {number}
   * @private
   */
  static incrementIframeUsageCount_(frameUrl) {
    return ++(Transport.crossDomainIframes_[frameUrl].usageCount);
  }

  /**
   * Record that one fewer creative is using this cross-domain iframe
   * @param {!string} frameUrl The URL of the frame
   * @return {number}
   * @private
   */
  static decrementIframeUsageCount_(frameUrl) {
    return --(Transport.crossDomainIframes_[frameUrl].usageCount);
  }

  /**
   * Returns whether a url of a cross-domain frame is already known
   * @param {!string} frameUrl
   * @return {!boolean}
   * @private
   */
  static hasCrossDomainIframe_(frameUrl) {
    return hasOwn(Transport.crossDomainIframes_, frameUrl);
  }

  /**
   * Create a cross-domain iframe for third-party vendor anaytlics
   * @param {!HTMLDocument} ampDoc  The document node of the parent page
   * @param {!string} frameUrl  The URL of the cross-domain iframe
   * @param {string=} opt_extraData The data to send to the frame
   * @return {!Element}
   */
  createCrossDomainIframe_(ampDoc, frameUrl, opt_extraData) {
    const sentinel = Transport.createUniqueId_();
    const scriptSrc = getMode().localDev
      ? '/dist.3p/current/ampanalytics-lib.js'
      : `${urls.thirdParty}/$internalRuntimeVersion$/ampanalytics-v0.js`;
    const frame = createElementWithAttributes(ampDoc, 'iframe', {
      sandbox: 'allow-scripts',
      name: JSON.stringify({
        scriptSrc,
        sentinel,
      }),
    });
    const iframeMessagingClient = new IframeMessagingClient(window);
    iframeMessagingClient.setSentinel(sentinel);
    iframeMessagingClient.setHostWindow(frame);
    setStyles(frame,
        {width: 0, height: 0, display: 'none',
         position: 'absolute', top: 0, left: 0});
    Transport.crossDomainIframes_[frameUrl] = {
      frame,
      sentinel,
      isReady: false,
      messageQueue: [],
      usageCount: 1,
      send: messages => {
        iframeMessagingClient.sendMessage('ampAnalytics3pMessages',
          {ampAnalytics3pMessages: messages});
      },
      iframeMessagingClient,
      sendTimer: null,
    };
    this.sendExtraData_(frameUrl, opt_extraData);
    frame.src = frameUrl; // Intentionally doing this after creating load
    // promise, rather than in the object supplied to
    // createElementWithAttribute() above. Want to be absolutely
    // certain that we don't lose the loaded event.
    return frame;
  }

  /**
   * Create a unique value to differentiate messages from
   * this particular creative to the cross-domain iframe
   * @returns {string}
   * @private
   */
  static createUniqueId_() {
    let newId;
    do {
      newId = String(Math.random()).substr(2);
    } while (Transport.usedIds_[newId]);
    Transport.usedIds_[newId] = true;
    return newId;
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @param {!string} frameUrl The URL of the frame
   * @private
   */
  static setIsReady_(frameUrl) {
    const frameData = Transport.crossDomainIframes_[frameUrl];
    frameData.isReady = true;
    Transport.sendQueuedMessagesToCrossDomainIframe_(frameData);
  }

  /**
   * Sends an Amp Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {string} request
   * @param {!Object<string, string>} transportOptions
   * @private
   */
  sendRequestUsingCrossDomainIframe_(request, transportOptions) {
    const frameData = Transport.crossDomainIframes_[transportOptions['iframe']];
    dev().assert(frameData, 'Trying to send message to non-existent frame');
    this.enqueueMessageForCrossDomainIframe_(frameData,
      'ampAnalytics3pEvent', request);
  }

  /**
   * Sends extra data (from the amp-analytics config object) to the
   * cross-domain iframe.
   * @param {!string} frameUrl The URL of the frame to send the data to
   * @param {string=} opt_extraData The data to send to the frame
   */
  sendExtraData_(frameUrl, opt_extraData) {
    if (!opt_extraData) {
      return;
    }
    const frameData = Transport.crossDomainIframes_[frameUrl];
    this.enqueueMessageForCrossDomainIframe_(frameData,
      'ampAnalytics3pExtraData', opt_extraData);
  }

  enqueueMessageForCrossDomainIframe_(frameData, messageType, message) {
    if (frameData.messageQueue.length > MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Queue has exceeded maximum size');
    }
    const messageObject = {
      senderId: this.id_,
      type: messageType,
    };
    messageObject[messageType] = message;
    frameData.messageQueue.push(messageObject);
    if (frameData.sendTimer) {
      return; // Timer is already about to fire, no need to set a new one
    }
    frameData.sendTimer = Transport.timer_.delay(() => {
      if (frameData.isReady) {
        Transport.sendQueuedMessagesToCrossDomainIframe_(frameData);
      }
      frameData.sendTimer = null;
    }, MESSAGE_THROTTLE_TIME_);
  }

  /**
   * Send an array of messages to a cross-domain iframe
   * @param {!Object} frameData  The cross-domain iframe
   * @private
   */
  static sendQueuedMessagesToCrossDomainIframe_(frameData) {
    dev().assert(frameData && frameData.send,
      'Message bound for frame that does not exist');
    if (!frameData.messageQueue || frameData.messageQueue.length < 0) {
      return;
    }
    frameData.send(frameData.messageQueue);
    frameData.messageQueue = [];
  }
}

/** @private @const {!Map} */
Transport.usedIds_ = map();

/** @private @const {!Map} */
Transport.crossDomainIframes_ = map();

/** @private @const {!Timer} */
Transport.timer_ = timerFor(AMP.win);

/**
 * Sends a ping request using an iframe, that is removed 5 seconds after
 * it is loaded.
 * This is not available as a standard transport, but rather used for
 * specific, whitelisted requests.
 * Note that this is unrelated to the cross-domain iframe use case above in
 * sendRequestUsingCrossDomainIframe_()
 * @param {!Window} win
 * @param {string} request The request URL.
 */
export function sendRequestUsingIframe(win, request) {
  assertHttpsUrl(request, 'amp-analytics request');
  /** @const {!Element} */
  const iframe = win.document.createElement('iframe');
  setStyle(iframe, 'display', 'none');
  iframe.onload = iframe.onerror = () => {
    Transport.timer_(win).delay(() => {
      removeElement(iframe);
    }, 5000);
  };
  dev().assert(
      parseUrl(request).origin != parseUrl(win.location.href).origin,
      'Origin of iframe request must not be equal to the doc' +
      'ument origin. See https://github.com/ampproject/' +
      'amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.');
  iframe.setAttribute('amp-analytics', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.src = request;
  win.document.body.appendChild(iframe);
  return iframe;
}
