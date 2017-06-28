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
import {timerFor} from '../../../src/services';
import {removeElement} from '../../../src/dom';
import {setStyle, setStyles} from '../../../src/style';
import {hasOwn} from '../../../src/utils/object';
import {IframeMessagingClient} from '../../../3p/iframe-messaging-client';
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../../../src/3p-analytics-common';
import {
  AmpAnalytics3pEventMessageQueue,
  AmpAnalytics3pNewCreativeMessageQueue,
} from './amp-analytics-3p-message-queue';

/** @private @const {string} */
const TAG_ = 'amp-analytics.Transport';

/** @typedef {{
 *    frame: Element,
 *    sentinel: !string,
 *    usageCount: number,
 *    iframeMessagingClient: IframeMessagingClient,
 *    newCreativeMessageQueue: AmpAnalytics3pNewCreativeMessageQueue,
 *    eventQueue: AmpAnalytics3pEventMessageQueue,
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
      this.sendRequestUsingCrossDomainIframe(request, transportOptions);
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
   * @param {!Object<string,string>} transportOptions The 'transport' portion
   * of the amp-analytics config object
   * @param {function(!string,
   *   !../../../src/3p-analytics-common.AmpAnalytics3pResponse)=}
   *   opt_processResponse An optional function to receive any response
   *   messages back from the cross-domain iframe
   */
  processCrossDomainIframe(win, transportOptions, opt_processResponse) {
    const frameUrl = dev().assertString(transportOptions['iframe'],
        'Cross-domain frame parameters missing ${this.type_}');
    const frameData = this.useExistingOrCreateCrossDomainIframe(
        win, frameUrl, transportOptions['extraData']);
    const iframeMessagingClient = frameData.iframeMessagingClient;
    iframeMessagingClient.registerCallback(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.READY, () => {
          iframeMessagingClient.setHostWindow(frameData.frame.contentWindow);
          frameData.newCreativeMessageQueue.setIsReady();
          frameData.eventQueue.setIsReady();
        });
    if (!opt_processResponse) {
      return;
    }
    iframeMessagingClient.registerCallback(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE,
        response => {
          dev().assert(response && response['data'],
              'Received empty response from 3p analytics frame');
          dev().assert(opt_processResponse,
              'Received response from 3p analytics frame when none was' +
              ' expected');
          opt_processResponse(
              this.type_,
              /** @type
               * {!../../../src/3p-analytics-common.AmpAnalytics3pResponse}
               */ (response));
        });
  }

  /**
   * If iframe doesn't exist for this iframe url, create it.
   * @param {!Window} win The window element
   * @param {!string} frameUrl The URL of the frame to send the data to
   * @param {string=} opt_extraData The data to send to the frame
   * @return {!FrameData}
   * @VisibleForTesting
   */
  useExistingOrCreateCrossDomainIframe(win, frameUrl, opt_extraData) {
    let frameData;
    if (Transport.hasCrossDomainIframe(frameUrl)) {
      frameData = Transport.getFrameData(frameUrl);
      Transport.incrementIframeUsageCount_(
        /** @type{!FrameData} */ (frameData));
    } else {
      frameData = this.createCrossDomainIframe(win, frameUrl);
      win.document.body.appendChild(frameData.frame);
    }
    dev().assert(frameData, 'Trying to use non-existent frame');
    const assuredNonNullFrameData = /** @type{!FrameData} */ (frameData);
    assuredNonNullFrameData.newCreativeMessageQueue.enqueue(
        this.id_, opt_extraData);
    return assuredNonNullFrameData;
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
    const frameData = Transport.getFrameData(frameUrl);
    if (Transport.decrementIframeUsageCount_(frameData)) {
      // Some other instance is still using it
      return;
    }
    ampDoc.body.removeChild(frameData.frame);
    delete Transport.crossDomainIframes_[frameUrl];
  }

  /**
   * Record that one more creative is using this cross-domain iframe
   * @param {!FrameData} frameData  The cross-domain iframe and
   * associated data
   * @return {number}
   * @private
   */
  static incrementIframeUsageCount_(frameData) {
    return ++(frameData.usageCount);
  }

  /**
   * Record that one fewer creative is using this cross-domain iframe
   * @param {!FrameData} frameData  The cross-domain iframe and
   * associated data
   * @return {number}
   * @private
   */
  static decrementIframeUsageCount_(frameData) {
    return --(frameData.usageCount);
  }

  /**
   * Returns whether a url of a cross-domain frame is already known
   * @param {!string} frameUrl
   * @return {!boolean}
   * @VisibleForTesting
   */
  static hasCrossDomainIframe(frameUrl) {
    return hasOwn(Transport.crossDomainIframes_, frameUrl);
  }

  /**
   * Create a cross-domain iframe for third-party vendor anaytlics
   * @param {!Window} win The window element
   * @param {!string} frameUrl  The URL of the cross-domain iframe
   * @return {!FrameData}
   * @VisibleForTesting
   */
  createCrossDomainIframe(win, frameUrl) {
    const sentinel = Transport.createUniqueId_();
    const scriptSrc = getMode().localDev
      ? '/dist.3p/current/ampanalytics-lib.js'
      : '/$internalRuntimeVersion$/ampanalytics-v0.js';
    const frameName = JSON.stringify(/** @type {JsonObject} */ ({
      scriptSrc,
      sentinel,
    }));
    const frame = createElementWithAttributes(win.document, 'iframe',
      /** @type {!JsonObject} */ ({
        sandbox: 'allow-scripts',
        name: frameName,
      }));
    const iframeMessagingClient = new IframeMessagingClient(window);
    iframeMessagingClient.setSentinel(sentinel);
    iframeMessagingClient.setHostWindow(
      /** @type {!HTMLIFrameElement} */ (frame));
    setStyles(frame,
        {width: 0, height: 0, display: 'none',
          position: 'absolute', top: 0, left: 0});
    const frameData = /** @const {FrameData} */ ({
      frame,
      sentinel,
      usageCount: 1,
      iframeMessagingClient,
      newCreativeMessageQueue: new AmpAnalytics3pNewCreativeMessageQueue(
        win, iframeMessagingClient),
      eventQueue: new AmpAnalytics3pEventMessageQueue(
        win, iframeMessagingClient),
    });
    Transport.crossDomainIframes_[frameUrl] = frameData;
    frame.src = frameUrl;
    return frameData;
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
   * @param {!Object<string, string>} transportOptions
   * @VisibleForTesting
   */
  sendRequestUsingCrossDomainIframe(event, transportOptions) {
    const frameData = Transport.getFrameData(transportOptions['iframe']);
    dev().assert(frameData, 'Trying to send message to non-existent frame');
    dev().assert(frameData.eventQueue,
        'Event queue is missing for ' + this.id_);
    frameData.eventQueue.enqueue(this.id_, event);
  }

  /**
   * Gets the FrameData associated with a particular cross-domain frame URL.
   * @param frameUrl
   * @returns {FrameData}
   * @VisibleForTesting
   */
  static getFrameData(frameUrl) {
    return Transport.crossDomainIframes_[frameUrl];
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
}

/** @private {Object<string,FrameData>} */
Transport.crossDomainIframes_ = {};

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
    timerFor(win).delay(() => {
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
