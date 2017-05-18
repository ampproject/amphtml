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
import {startsWith} from '../../../src/string';
import {removeElement} from '../../../src/dom';
import {setStyle, setStyles} from '../../../src/style';
import {hasOwn, map} from '../../../src/utils/object';

/** @const {string} */
const TAG_ = 'amp-analytics.Transport';

/**
 * @param {!Window} win
 * @param {string} request
 * @param {!Object<string, string>} transportOptions
 */
export function sendRequest(win, request, transportOptions) {
  if (transportOptions['iframe']) {
    Transport.sendRequestUsingCrossDomainIframe(request, transportOptions);
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
   * TODO: Implement throttling if messages are sent too rapidly.
   * @param {string} request
   * @param {!Object<string, string>} transportOptions
   */
  static sendRequestUsingCrossDomainIframe(request, transportOptions) {
    const frameUrl = Transport.appendHashToUrl_(transportOptions['iframe'],
      transportOptions['dataHash']);
    const frameData = Transport.crossDomainFrames[frameUrl];
    if (frameData.isReady) {
      this.sendToCrossDomainIframe_(frameData.frame, [request]);
    } else {
      frameData.msgQueue.push(request);
    }
  }

  /**
   * Takes a URL and a data hash (the part that comes after the '#',
   * optionally including the '#' itself) and concatenates them, adding the
   * '#' if necessary
   * @param {!string} url
   * @param {string=} dataHash
   * @return {!string}
   * @private
   */
  static appendHashToUrl_(url, dataHash) {
    if (dataHash) {
      return url + (startsWith(dataHash, '#') ? dataHash : '#' + dataHash);
    }
    return url;
  }

  /**
   * If iframe (and optionally dataHash as well) are specified in
   * config/transport, check whether third-party iframe already exists, and if
   * not, create it.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!Object<string,string>} transportOptions The 'transport' portion
   * of the amp-analytics
   * config object
   */
  static processCrossDomainIframe(ampDoc, transportOptions) {
    user().assert(!(transportOptions['beacon'] || transportOptions['xhrpost'] ||
      transportOptions['image']), 'Cross-domain frame cannot coexist with' +
      ' other transport methods');
    const frameUrl = Transport.appendHashToUrl_(transportOptions['iframe'],
        transportOptions['dataHash']);
    // If iframe doesn't exist for this iframe url (and data hash), create it.
    if (!Transport.hasCrossDomainFrame(frameUrl)) {
      const frame = Transport.createCrossDomainFrame(ampDoc, frameUrl);
      ampDoc.body.appendChild(frame);
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
   * @param {!string} frameUrl  The URL, including data hash if
   * applicable, of the cross-domain iframe
   * @return {!Element}
   */
  static createCrossDomainFrame(ampDoc, frameUrl) {
    // DO NOT MERGE THIS
    // Warning: the scriptSrc URL below is only temporary. Don't merge
    // before getting resolution on that.
    const frame = createElementWithAttributes(ampDoc, 'iframe', {
      sandbox: 'allow-scripts',
      name: JSON.stringify({
        'scriptSrc': '/examples/analytics-3p-remote-frame-helper.js',
      }),
    });
    loadPromise(frame).then(() => {
      this.setIsReady_(frameUrl);
    });
    setStyles(frame,
        { width: 0, height: 0, display: 'none',
          position: 'absolute', top: 0, left: 0 });
    Transport.crossDomainFrames[frameUrl] = {
      frame,
      isReady: false,
      msgQueue: [],
    };
    frame.src = frameUrl; // Intentionally doing this after creating load
    // promise, rather than in the object supplied to
    // createElementWithAttribute() above. Want to be absolutely
    // certain that we don't lose the loaded event.
    return frame;
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @param {!string} frameUrl The URL (including any data hash) of the frame
   * @private
   */
  static setIsReady_(frameUrl) {
    const frameData = Transport.crossDomainFrames[frameUrl];
    frameData.isReady = true;
    this.sendToCrossDomainIframe_(frameData.frame, frameData.msgQueue);
    delete frameData.msgQueue;
  }

  /**
   * Send an array of messages to a cross-domain iframe
   * @param {!Element} frame  The cross-domain iframe
   * @param {!Array<string>} messages  The messages to send
   * @private
   */
  static sendToCrossDomainIframe_(frame, messages) {
    // DO NOT MERGE THIS
    // Warning: the following code is likely only temporary. Don't check
    // in before getting resolution on that.
    frame && frame.contentWindow &&
    frame.contentWindow.postMessage({ampAnalyticsEvents: messages}, '*');
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
