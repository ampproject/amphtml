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

import {MessageType} from '../../../src/3p-frame-messaging';
import {createElementWithAttributes} from '../../../src/dom';
import {listenFor} from '../../../src/iframe-helper';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  calculateEntryPointScriptUrl,
} from '../../../src/service/extension-location';
import {setStyles} from '../../../src/style';
import {hasOwn} from '../../../src/utils/object';
import {IframeTransportMessageQueue} from './iframe-transport-message-queue';

/** @const {string} */
export const AMP_ANALYTICS_3P_RESPONSES = 'amp-analytics-3p-responses';

/** @const {string} */
const AMP_ANALYTICS_CREATIVE_IDS = 'amp-analytics-creative-ids';

/** @typedef {{
 *    frame: Element,
 *    sentinel: !string,
 *    usageCount: number,
 *    queue: IframeTransportMessageQueue,
 *  }} */
export let FrameData;

/**
 * @visibleForTesting
 */
export class IframeTransport {
  /**
   * @param {!Window} ampWin The window object of the AMP document
   * @param {!Window} win The window object of the innermost document
   * containing the amp-analytics tag (e.g. a creative iframe)
   * @param {!string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   * @param {string} resourceId The result of calling
   * element.getResourceId() on the containing AmpAnalytics instance
   */
  constructor(ampWin, win, type, config, resourceId) {
    /** @private @const {!Window} win */
    this.ampWin_ = ampWin;

    /** @private @const {!Window} win */
    this.win_ = win;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.resourceId_ = resourceId;

    if (!this.win_[AMP_ANALYTICS_CREATIVE_IDS]) {
      this.win_[AMP_ANALYTICS_CREATIVE_IDS] = [];
    }
    this.win_[AMP_ANALYTICS_CREATIVE_IDS].push(this.getId());

    dev().assert(config && config['iframe'],
        'Must supply iframe URL to constructor!');
    this.frameUrl_ = config['iframe'];

    this.processCrossDomainIframe();
  }

  /**
   * Called when a Transport instance is being removed from the DOM
   */
  detach() {
    IframeTransport.markCrossDomainIframeAsDone(this.ampWin_.document,
        this.type_);
  }

  /**
   * If iframe is specified in config/transport, check whether third-party
   * iframe already exists, and if not, create it.
   */
  processCrossDomainIframe() {
    let frameData;
    if (IframeTransport.hasCrossDomainIframe(this.type_)) {
      frameData = IframeTransport.getFrameData(this.type_);
      ++(frameData.usageCount);
    } else {
      frameData = this.createCrossDomainIframe();
      this.ampWin_.document.body.appendChild(frameData.frame);
    }
    dev().assert(frameData, 'Trying to use non-existent frame');
  }

  /**
   * Create a cross-domain iframe for third-party vendor analytics
   * @return {!FrameData}
   * @VisibleForTesting
   */
  createCrossDomainIframe() {
    // Explanation of IDs:
    // Each instance of IframeTransport (owned by a specific amp-analytics
    // tag, in turn owned by a specific creative) has an ID (this.getId()).
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs have different formats and are thus mutually
    // unique.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps two creatives might
    // both use the same xframe.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // iframeTransport.getId() -> sentinel relationship is *not*
    // many-to-many.
    const sentinel = IframeTransport.createUniqueId_();
    const useLocal = getMode().localDev || getMode().test;
    const useRtvVersion = !useLocal;
    const scriptSrc = calculateEntryPointScriptUrl(
        this.ampWin_.parent.location, 'iframe-transport-client-lib',
        useLocal, useRtvVersion);
    const frameName = JSON.stringify(/** @type {JsonObject} */ ({
      scriptSrc,
      sentinel,
    }));
    const frame = createElementWithAttributes(this.ampWin_.document, 'iframe',
        /** @type {!JsonObject} */ ({
          sandbox: 'allow-scripts allow-same-origin',
          name: frameName,
          'data-amp-3p-sentinel': sentinel,
        }));
    frame.sentinel = sentinel;
    setStyles(frame, {
      display: 'none',
    });
    frame.src = this.frameUrl_;
    const frameData = /** @const {FrameData} */ ({
      frame,
      usageCount: 1,
      queue: new IframeTransportMessageQueue(this.ampWin_,
          /** @type {!HTMLIFrameElement} */
          (frame)),
    });
    frameData.responseMessageUnlisten = listenFor(frameData.frame,
        MessageType.IFRAME_TRANSPORT_RESPONSE, response => {
          dev().assert(response && response['message'],
              'Received empty response from 3p analytics frame');
          /*
           * Beware: Note that due to bug #2942, only the IframeTransport
           * instance that creates the cross-domain iframe can call
           * listenFor on it!
           * So, this response is bound for the IframeTransport instance
           * whose getId() == response['creativeId'], which is not
           * necessarily the instance that we are currently running in.
           * Add this response to the response map on the AMP window, for use by
           * amp-ad-exit which is / may be in the same window as the recipient.
           */
          const creativeId = response['creativeId'];
          dev().assert(creativeId, 'Unrecognized creativeId: ' + creativeId);
          this.ampWin_[AMP_ANALYTICS_3P_RESPONSES] =
              this.ampWin_[AMP_ANALYTICS_3P_RESPONSES] || {};
          this.ampWin_[AMP_ANALYTICS_3P_RESPONSES][this.type_] =
              this.ampWin_[AMP_ANALYTICS_3P_RESPONSES][this.type_] || {};
          this.ampWin_[AMP_ANALYTICS_3P_RESPONSES][this.type_][creativeId] =
              response['message'];
        },
        true);
    IframeTransport.crossDomainIframes_[this.type_] = frameData;
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
    const frameData = IframeTransport.getFrameData(type);
    dev().assert(frameData && frameData.frame && frameData.usageCount,
        'Marked the ' + type + ' frame as done, but there is no' +
        ' record of it existing.');
    if (--(frameData.usageCount)) {
      // Some other instance is still using it
      return;
    }
    ampDoc.body.removeChild(frameData.frame);
    frameData.responseMessageUnlisten();
    delete IframeTransport.crossDomainIframes_[type];
  }

  /**
   * Returns whether this type of cross-domain frame is already known
   * @param {!string} type The type attribute of the amp-analytics tag
   * @return {!boolean}
   * @VisibleForTesting
   */
  static hasCrossDomainIframe(type) {
    return hasOwn(IframeTransport.crossDomainIframes_, type);
  }

  /**
   * Create a unique value to differentiate messages from a particular
   * creative to the cross-domain iframe, or to identify the iframe itself.
   * @returns {string}
   * @private
   */
  static createUniqueId_() {
    return String(++(IframeTransport.nextId_));
  }

  /**
   * Sends an AMP Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {!string} event A string describing the trigger event
   * @VisibleForTesting
   */
  sendRequest(event) {
    const frameData = IframeTransport.getFrameData(this.type_);
    dev().assert(frameData, 'Trying to send message to non-existent frame');
    dev().assert(frameData.queue,
        'Event queue is missing for ' + this.getId());
    frameData.queue.enqueue(
        /**
         * @type {!../../../src/3p-frame-messaging.IframeTransportEvent}
         */
        ({creativeId: this.getId(), message: event}));
  }

  /**
   * Gets the FrameData associated with a particular cross-domain frame type.
   * @param {!string} type The type attribute of the amp-analytics tag
   * @returns {FrameData}
   * @VisibleForTesting
   */
  static getFrameData(type) {
    return IframeTransport.crossDomainIframes_[type];
  }

  /**
   * Removes all knowledge of cross-domain iframes.
   * Does not actually remove them from the DOM.
   * @VisibleForTesting
   */
  static resetCrossDomainIframes() {
    IframeTransport.crossDomainIframes_ = {};
  }

  /**
   * @returns {!string} Unique ID of this instance of IframeTransport
   * @VisibleForTesting
   */
  getId() {
    return this.win_.document.baseURI + '-' + this.resourceId_;
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
IframeTransport.crossDomainIframes_ = {};

/** @private {number} */
IframeTransport.nextId_ = 0;
