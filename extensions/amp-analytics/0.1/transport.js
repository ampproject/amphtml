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
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {loadPromise} from '../../../src/event-helper';
import {timerFor} from '../../../src/services';
import {removeElement} from '../../../src/dom';
import {setStyle, setStyles} from '../../../src/style';
import {hasOwn, map} from '../../../src/utils/object';
import {IframeMessagingClient} from '../../../3p/iframe-messaging-client';

/** @const {string} */
const TAG_ = 'amp-analytics.Transport';

/** @const {number} */
const MESSAGE_THROTTLE_TIME_ = 100;

/**
 * @param {!Window} win
 * @param {string} request
 * @param {!Object<string, string>} transportOptions
 */
export function sendRequest(win, request, transportOptions) {
  if (transportOptions['iframe']) {
    Transport.sendRequestUsingCrossDomainIframe(request, transportOptions,
      event);
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
 * @visibleForTesting
 */
export class Transport {

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
   * Sends an Amp Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {string} request
   * @param {!Object<string, string>} transportOptions
   */
  static sendRequestUsingCrossDomainIframe(request, transportOptions) {
    const frameData = Transport.crossDomainFrames[transportOptions['iframe']];
    user().assert(frameData, 'Trying to send message to non-existent frame');
    frameData.msgQueue.push(request);
    if (frameData.isReady) {
      if (frameData.sendTimer == null) {
        frameData.sendTimer = window.setTimeout(() => {
          this.sendQueuedMessagesToCrossDomainIframe_(frameData);
          frameData.sendTimer = null;
        }, MESSAGE_THROTTLE_TIME_);
      }
    }
  }

  /**
   * If iframe is specified in config/transport, check whether third-party
   * iframe already exists, and if not, create it.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!Object<string,string>} transportOptions The 'transport' portion
   * of the amp-analytics config object
   * @param {?Function<String>=} processResponse An optional function to
   * receive any response messages back from the cross-domain iframe
   */
  static processCrossDomainIframe(ampDoc, transportOptions, processResponse) {
    user().assert(transportOptions['iframe'],
      'Cross-domain frame parameters missing');
    const frameUrl = transportOptions['iframe'];
    // If iframe doesn't exist for this iframe url, create it.
    if (Transport.hasCrossDomainFrame(frameUrl)) {
      this.incrementFrameUsageCount_(frameUrl);
    } else {
      const frame = Transport.createCrossDomainIframe(ampDoc, frameUrl,
        transportOptions['extraData']);
      ampDoc.body.appendChild(frame);
    }
    // Regardless of whether we just created it, or are re-using an existing
    // one, wire up the response callback
    if (processResponse) {
      const iframeClient = Transport.crossDomainFrames[frameUrl].iframeClient;
      iframeClient.registerCallback('ampAnalyticsResponse', msg => {
        if (msg && msg.ampAnalyticsResponse) {
          processResponse(msg.ampAnalyticsResponse);
        }
      });
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
  static doneWithCrossDomainIframe(ampDoc, transportOptions) {
    const frameUrl = transportOptions['iframe'];
    if (Transport.hasCrossDomainFrame(frameUrl) &&
      this.decrementFrameUsageCount_(frameUrl) <= 0) {
      ampDoc.body.removeChild(Transport.crossDomainFrames[frameUrl].frame);
      delete Transport.crossDomainFrames[frameUrl];
    }
  }

  /**
   * Returns whether a url of a cross-domain frame is already known
   * @param {!string} frameUrl
   * @return {!boolean}
   */
  static hasCrossDomainFrame(frameUrl) {
    return hasOwn(Transport.crossDomainFrames, frameUrl);
  }

  /**
   * Create a cross-domain iframe for third-party vendor anaytlics
   * @param {!HTMLDocument} ampDoc  The document node of the parent page
   * @param {!string} frameUrl  The URL of the cross-domain iframe
   * @param {?string=} extraData  An extra string for the cross-domain
   * iframe to use, which will be associated with this creative only
   * @return {!Element}
   */
  static createCrossDomainIframe(ampDoc, frameUrl, extraData) {
    // DO NOT MERGE THIS
    // Warning: the scriptSrc URL below is only temporary. Don't merge
    // before getting resolution on that.
    const frame = createElementWithAttributes(ampDoc, 'iframe', {
      sandbox: 'allow-scripts',
      name: JSON.stringify({
        'scriptSrc': '/examples/analytics-3p-remote-frame-helper.js',
      }),
    });
    const iframeClient = new IframeMessagingClient(window);
    iframeClient.setSentinel(Transport.createSentinel_());
    loadPromise(frame).then(() => {
      iframeClient.setHostWindow(frame.contentWindow);
      if (extraData) {
        iframeClient.sendMessage('ampAnalyticsExtraData',
          {ampAnalyticsExtraData: extraData});
      }
      this.setIsReady_(frameUrl);
    });
    setStyles(frame,
        {width: 0, height: 0, display: 'none',
         position: 'absolute', top: 0, left: 0});
    Transport.crossDomainFrames[frameUrl] = {
      frame,
      isReady: false,
      msgQueue: [],
      usageCount: 1,
      send: messages => {
        iframeClient.sendMessage('ampAnalyticsEvents', {ampAnalyticsEvents: messages});
      },
      iframeClient,
      sendTimer: null,
    };
    frame.src = frameUrl; // Intentionally doing this after creating load
    // promise, rather than in the object supplied to
    // createElementWithAttribute() above. Want to be absolutely
    // certain that we don't lose the loaded event.
    return frame;
  }

  /**
   * Create an almost-certainly-unique value to differentiate messages from
   * this particular creative to the cross-domain iframe
   * @returns {string}
   * @private
   */
  static createSentinel_() {
    return String(Math.random()).substr(2);
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @param {!string} frameUrl The URL of the frame
   * @private
   */
  static setIsReady_(frameUrl) {
    const frameData = Transport.crossDomainFrames[frameUrl];
    frameData.isReady = true;
    this.sendQueuedMessagesToCrossDomainIframe_(frameData);
  }

  /**
   * Record that one more creative is using this cross-domain iframe
   * @param {!string} frameUrl The URL of the frame
   * @return {number}
   * @private
   */
  static incrementFrameUsageCount_(frameUrl) {
    return ++(Transport.crossDomainFrames[frameUrl].usageCount);
  }

  /**
   * Record that one fewer creative is using this cross-domain iframe
   * @param {!string} frameUrl The URL of the frame
   * @return {number}
   * @private
   */
  static decrementFrameUsageCount_(frameUrl) {
    return --(Transport.crossDomainFrames[frameUrl].usageCount);
  }

  /**
   * Send an array of messages to a cross-domain iframe
   * @param {!FrameData} frameData  The cross-domain iframe
   * @param {!Array<string>} messages  The messages to send
   * @private
   */
  static sendQueuedMessagesToCrossDomainIframe_(frameData) {
    dev().assert(frameData && frameData.send,
      'Message bound for frame that does not exist');
    if (frameData.msgQueue && frameData.msgQueue.length > 0) {
      frameData.send(frameData.msgQueue);
      frameData.msgQueue = [];
    }
  }
}
Transport.crossDomainFrames = map();

/**
 * Sends a ping request using an iframe, that is removed 5 seconds after
 * it is loaded.
 * This is not available as a standard transport, but rather used for
 * specific, whitelisted requests.
 * Note that this is unrelated to the cross-domain iframe use case above in
 * sendRequestUsingCrossDomainIframe()
 * @param {!Window} win
 * @param {string} request The request URL.
 */
export function sendRequestUsingIframe(win, request) {
  assertHttpsUrl(request, 'amp-analytics request');
  /** @const {!Element} */
  const iframe = win.document.createElement('iframe');
  setStyle(iframe, 'display', 'none');
  iframe.onload = iframe.onerror = () => {
    timerFor(win).delay(() => {
      removeElement(iframe);
    }, 5000);
  };
  user().assert(
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
