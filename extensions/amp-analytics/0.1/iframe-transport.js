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

import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  calculateEntryPointScriptUrl,
} from '../../../src/service/extension-location';
import {setStyles} from '../../../src/style';
import {hasOwn} from '../../../src/utils/object';
import {IframeTransportMessageQueue} from './iframe-transport-message-queue';

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
   * @param {!Window} win
   * @param {!string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   */
  constructor(win, type, config) {
    /** @private @const {!Window} win */
    this.win_ = win;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.id_ = IframeTransport.createUniqueId_();

    dev().assert(config && config['iframe'],
        'Must supply iframe URL to constructor!');
    this.frameUrl_ = config['iframe'];
    this.processCrossDomainIframe();
  }

  /**
   * Called when a Transport instance is being removed from the DOM
   */
  detach() {
    IframeTransport.markCrossDomainIframeAsDone(this.win_.document, this.type_);
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
      this.win_.document.body.appendChild(frameData.frame);
    }
    dev().assert(frameData, 'Trying to use non-existent frame');
  }

  /**
   * Create a cross-domain iframe for third-party vendor anaytlics
   * @return {!FrameData}
   * @VisibleForTesting
   */
  createCrossDomainIframe() {
    // Explanation of IDs:
    // Each instance of IframeTransport (owned by a specific amp-analytics
    // tag, in turn owned by a specific creative) has an ID in this._id.
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs are drawn from the same pool of numbers, and
    // are thus mutually unique.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps creatives #1 & #2 might
    // both use xframe #3.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // iframeTransport.id_ -> sentinel relationship is *not* many-to-many.
    const sentinel = IframeTransport.createUniqueId_();
    const useLocal = getMode().localDev || getMode().test;
    const useRtvVersion = !useLocal;
    const scriptSrc = calculateEntryPointScriptUrl(
        this.win_.parent.location, 'ampanalytics-lib', useLocal, useRtvVersion);
    const frameName = JSON.stringify(/** @type {JsonObject} */ ({
      scriptSrc,
      sentinel,
    }));
    const frame = createElementWithAttributes(this.win_.document, 'iframe',
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
      queue: new IframeTransportMessageQueue(this.win_,
          /** @type {!HTMLIFrameElement} */
          (frame)),
    });
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
    dev().assert(frameData.queue, 'Event queue is missing for ' + this.id_);
    frameData.queue.enqueue(
        /**
         * @type {!../../../src/iframe-transport-common.IframeTransportEvent}
         */
        ({transportId: this.id_, message: event}));
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
IframeTransport.crossDomainIframes_ = {};

/** @private {number} */
IframeTransport.nextId_ = 0;
