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

import {IframeTransportMessageQueue} from './iframe-transport-message-queue';
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {hasOwn} from '../../../src/utils/object';
import {isLongTaskApiSupported} from '../../../src/service/jank-meter';
import {setStyles} from '../../../src/style';
import {urls} from '../../../src/config';

/** @private @const {string} */
const TAG_ = 'amp-analytics.IframeTransport';

/** @private @const {number} */
const LONG_TASK_REPORTING_THRESHOLD = 5;

/** @typedef {{
 *    frame: Element,
 *    sentinel: string,
 *    usageCount: number,
 *    queue: IframeTransportMessageQueue,
 *  }} */
export let FrameData;

/**
 * Get the URL of the client lib
 * @param {!Window} ampWin The window object of the AMP document
 * @param {boolean=} opt_forceProdUrl If true, prod URL will be returned even
 *     in local/test modes.
 * @return {string}
 */
export function getIframeTransportScriptUrl(ampWin, opt_forceProdUrl) {
  if ((getMode().localDev || getMode().test) && !opt_forceProdUrl &&
      ampWin.parent && ampWin.parent.location) {
    const loc = ampWin.parent.location;
    return `${loc.protocol}//${loc.host}/dist/iframe-transport-client-lib.js`;
  }
  return urls.thirdParty +
      '/$internalRuntimeVersion$/iframe-transport-client-v0.js';
}

/**
 * @VisibleForTesting
 */
export class IframeTransport {
  /**
   * @param {!Window} ampWin The window object of the AMP document
   * @param {string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   * @param {string} id If (potentially) using sendResponseToCreative(), it
   *     should be something that the recipient can use to identify the
   *     context of the message, e.g. the resourceID of a DOM element.
   */
  constructor(ampWin, type, config, id) {
    /** @private @const {!Window} */
    this.ampWin_ = ampWin;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.creativeId_ = id;

    dev().assert(config && config['iframe'],
        'Must supply iframe URL to constructor!');
    this.frameUrl_ = config['iframe'];

    /** @private {number} */
    this.numLongTasks_ = 0;

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
      this.createPerformanceObserver_();
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
    // tag, in turn owned by a specific creative) has an ID
    // (this.getCreativeId()).
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs have different formats.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps two creatives might
    // both use the same vendor iframe.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // iframeTransport.getCreativeId() -> sentinel relationship is *not*
    // many-to-many.
    const sentinel = IframeTransport.createUniqueId_();
    const frameName = JSON.stringify(/** @type {JsonObject} */ ({
      scriptSrc: getIframeTransportScriptUrl(this.ampWin_),
      sentinel,
      type: this.type_,
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
    IframeTransport.crossDomainIframes_[this.type_] = frameData;
    return frameData;
  }

  /**
   * Uses the Long Task API to create an observer for when 3p vendor frames
   * take more than 50ms of continuous CPU time.
   * Currently the only action in response to that is to log. It will log
   * once per LONG_TASK_REPORTING_THRESHOLD that a long task occurs. (This
   * implies that there is a grace period for the first
   * LONG_TASK_REPORTING_THRESHOLD-1 occurrences.)
   * @VisibleForTesting
   * @private
   */
  createPerformanceObserver_() {
    if (!isLongTaskApiSupported(this.ampWin_)) {
      return;
    }
    // TODO(jonkeller): Consider merging with jank-meter.js
    IframeTransport.performanceObservers_[this.type_] =
        new this.ampWin_.PerformanceObserver(entryList => {
        if (!entryList) {
          return;
        }
        entryList.getEntries().forEach(entry => {
          if (entry && entry['entryType'] == 'longtask' &&
              (entry['name'] == 'cross-origin-descendant') &&
              entry.attribution) {
            entry.attribution.forEach(attrib => {
              if (this.frameUrl_ == attrib.containerSrc &&
                    ++this.numLongTasks_ % LONG_TASK_REPORTING_THRESHOLD == 0) {
                user().error(TAG_,
                    'Long Task: ' +
                      `Vendor: "${this.type_}" ` +
                      `Duration: ${entry.duration}ms ` +
                      `Occurrences: ${this.numLongTasks_}`);
              }
            });
          }
        });
      });
    IframeTransport.performanceObservers_[this.type_].observe({
      entryTypes: ['longtask'],
    });
  }

  /**
   * Called when a creative no longer needs its cross-domain iframe (for
   * instance, because the creative has been removed from the DOM).
   * Once all creatives using a frame are done with it, the frame can be
   * destroyed.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {string} type The type attribute of the amp-analytics tag
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
    if (IframeTransport.performanceObservers_[type]) {
      IframeTransport.performanceObservers_[type].disconnect();
      IframeTransport.performanceObservers_[type] = null;
    }
  }

  /**
   * Returns whether this type of cross-domain frame is already known
   * @param {string} type The type attribute of the amp-analytics tag
   * @return {boolean}
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
   * @param {string} event A string describing the trigger event
   * @VisibleForTesting
   */
  sendRequest(event) {
    const frameData = IframeTransport.getFrameData(this.type_);
    dev().assert(frameData, 'Trying to send message to non-existent frame');
    dev().assert(frameData.queue,
        'Event queue is missing for messages from ' + this.type_ +
        ' to creative ID ' + this.creativeId_);
    frameData.queue.enqueue(
        /**
         * @type {!../../../src/3p-frame-messaging.IframeTransportEvent}
         */
        ({creativeId: this.creativeId_, message: event}));
  }

  /**
   * Gets the FrameData associated with a particular cross-domain frame type.
   * @param {string} type The type attribute of the amp-analytics tag
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
   * @returns {string} Unique ID of this instance of IframeTransport
   * @VisibleForTesting
   */
  getCreativeId() {
    return this.creativeId_;
  }

  /**
   * @returns {string} Type attribute of parent amp-analytics instance
   * @VisibleForTesting
   */
  getType() {
    return this.type_;
  }
}

/** @private {Object<string, FrameData>} */
IframeTransport.crossDomainIframes_ = {};

/** @private {number} */
IframeTransport.nextId_ = 0;

/** @private {Object<string, PerformanceObserver>} */
IframeTransport.performanceObservers_ = {};
