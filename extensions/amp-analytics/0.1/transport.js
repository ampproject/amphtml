/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {getMode} from '../../../src/mode';
import {loadPromise} from '../../../src/event-helper';
import {Services} from '../../../src/services';
import {
  calculateEntryPointScriptUrl,
} from '../../../src/service/extension-location';
import {removeElement} from '../../../src/dom';
import {setStyle, setStyles} from '../../../src/style';
import {hasOwn} from '../../../src/utils/object';
import {listenFor} from '../../../src/iframe-helper';
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../../../src/3p-analytics-common';
import {
  AmpIframeTransportMessageQueue,
} from './amp-iframe-transport-message-queue';

/** @private @const {string} */
const TAG_ = 'amp-analytics.Transport';

/** @typedef {{
 *    frame: Element,
 *    sentinel: !string,
 *    usageCount: number,
 *    queue: AmpIframeTransportMessageQueue,
 *  }} */
export let FrameData;

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
    assertHttpsUrl(request, 'amp-analytics request');
    if (transportOptions && transportOptions['iframe']) {
      this.sendRequestUsingCrossDomainIframe(request);
      return;
    }
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
   * @param {!Window} win The window element
   * @param {!string} frameUrl  The URL of the cross-domain iframe
   * @param {function(!string,
   *   !../../../src/3p-analytics-common.AmpAnalytics3pResponse)=}
   *   opt_processResponse An optional function to receive any response
   *   messages back from the cross-domain iframe
   */
  processCrossDomainIframe(win, frameUrl, opt_processResponse) {
    let frameData;
    if (Transport.hasCrossDomainIframe(this.type_)) {
      frameData = Transport.getFrameData(this.type_);
      ++(frameData.usageCount);
    } else {
      frameData = this.createCrossDomainIframe(win, frameUrl);
      win.document.body.appendChild(frameData.frame);
    }
    dev().assert(frameData, 'Trying to use non-existent frame');
    if (opt_processResponse) {
      Transport.responseProcessors_[this.id_] = opt_processResponse;
    }
  }

  /**
   * Create a cross-domain iframe for third-party vendor anaytlics
   * @param {!Window} win The window element
   * @param {!string} frameUrl  The URL of the cross-domain iframe
   * @return {!FrameData}
   * @VisibleForTesting
   */
  createCrossDomainIframe(win, frameUrl) {
    // Explanation of IDs:
    // Each instance of Transport (owned by a specific amp-analytics tag, in
    // turn owned by a specific creative) has an ID in this._id.
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs are drawn from the same pool of numbers, and
    // are thus mutually unique.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps creatives #1 & #2 might
    // both use xframe #3.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // transport.id_ -> sentinel relationship is *not* many-to-many.
    const sentinel = Transport.createUniqueId_();
    const useLocal = getMode().localDev || getMode().test;
    const useRtvVersion = !useLocal;
    const scriptSrc = calculateEntryPointScriptUrl(
        window.location, 'ampanalytics-lib', useLocal, useRtvVersion);
    const frameName = JSON.stringify(/** @type {JsonObject} */ ({
      scriptSrc,
      sentinel,
    }));
    const frame = createElementWithAttributes(win.document, 'iframe',
        /** @type {!JsonObject} */ ({
          sandbox: 'allow-scripts allow-same-origin',
          name: frameName,
          src: frameUrl,
          'data-amp-3p-sentinel': sentinel,
        }));
    frame.sentinel = sentinel;
    setStyles(frame, {
      width: 0,
      height: 0,
      display: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
    });
    const frameData = /** @const {FrameData} */ ({
      frame,
      usageCount: 1,
      queue: new AmpIframeTransportMessageQueue(win,
          /** @type {!HTMLIFrameElement} */
          (frame)),
    });
    Transport.crossDomainIframes_[this.type_] = frameData;
    // Note: this is a listener for responses from the frame, regardless of
    // which transport instance a response is intended for. This is because
    // the listener may only be created prior to the iframe being attached
    // to the DOM - see assert in listenFor which references #2942.
    // This is why listenFor() is called here in createCrossDomainIframe(),
    // rather than in processCrossDomainIframe().
    frameData.responseMessageUnlisten = listenFor(frameData.frame,
        AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE,
        response => {
          dev().assert(response && response['data'],
              'Received empty response from 3p analytics frame');
          const responseProcessor = Transport.responseProcessors_[
            response['transport']];
          if (!responseProcessor) {
            dev().warn(TAG_,'Received a response, but no response processor' +
              ' was configured');
            return;
          }
          responseProcessor(
              this.type_,
              /** @type
               * {!../../../src/3p-analytics-common.AmpAnalytics3pResponse}
               */ (response));
        },
        true);
    return frameData;
  }

  /**
   * Called when a creative no longer needs its cross-domain iframe (for
   * instance, because the creative has been removed from the DOM).
   * Once all creatives using a frame are done with it, the frame can be
   * destroyed.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {!string} type The type attribute of the amp-analytics tag
   */
  static markCrossDomainIframeAsDone(ampDoc, type) {
    const frameData = Transport.getFrameData(type);
    dev().assert(frameData && frameData.frame && frameData.usageCount,
        'Marked the ' + type + ' frame as done, but there is no' +
        ' record of it existing.');
    if (--(frameData.usageCount)) {
      // Some other instance is still using it
      return;
    }
    ampDoc.body.removeChild(frameData.frame);
    frameData.responseMessageUnlisten();
    delete Transport.crossDomainIframes_[type];
  }

  /**
   * Returns whether a url of a cross-domain frame is already known
   * @param {!string} type The type attribute of the amp-analytics tag
   * @return {!boolean}
   * @VisibleForTesting
   */
  static hasCrossDomainIframe(type) {
    return hasOwn(Transport.crossDomainIframes_, type);
  }

  /**
   * Create a unique value to differentiate messages from
   * this particular creative to the cross-domain iframe
   * @returns {string}
   * @private
   */
  static createUniqueId_() {
    return String(++(Transport.nextId_));
  }

  /**
   * Sends an Amp Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {!string} event A string describing the trigger event
   * @VisibleForTesting
   */
  sendRequestUsingCrossDomainIframe(event) {
    const frameData = Transport.getFrameData(this.type_);
    dev().assert(frameData, 'Trying to send message to non-existent frame');
    dev().assert(frameData.queue,
        'Event queue is missing for ' + this.id_);
    frameData.queue.enqueue(this.id_, event);
  }

  /**
   * Gets the FrameData associated with a particular cross-domain frame URL.
   * @param {!string} type The type attribute of the amp-analytics tag
   * @returns {FrameData}
   * @VisibleForTesting
   */
  static getFrameData(type) {
    return Transport.crossDomainIframes_[type];
  }

  /**
   * Removes all knowledge of cross-domain iframes.
   * Does not actually remove them from the DOM.
   * @VisibleForTesting
   */
  static resetCrossDomainIframes() {
    Transport.crossDomainIframes_ = {};
  }

  /**
   * @returns {!string} Unique ID of this instance of Transport
   * @VisibleForTesting
   */
  getId() {
    return this.id_;
  }

  /**
   * @returns {!string} Type attribute of parent amp-analytics instance
   * @VisibleForTesting
   */
  getType() {
    return this.type_;
  }
}

/** @private {Object<string,FrameData>} */
Transport.crossDomainIframes_ = {};

/** @private {Object<string,
 * function(!string,!../../../src/3p-analytics-common.AmpAnalytics3pResponse)>}
 */
Transport.responseProcessors_ = {};

/** @private {number} */
Transport.nextId_ = 0;

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
    Services.timerFor(win).delay(() => {
      removeElement(iframe);
    }, 5000);
  };
  user().assert(
      parseUrl(request).origin != parseUrl(win.location.href).origin,
      'Origin of iframe request must not be equal to the document origin.' +
      ' See https://github.com/ampproject/' +
      ' amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.');
  iframe.setAttribute('amp-analytics', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.src = request;
  win.document.body.appendChild(iframe);
  return iframe;
}
