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
import {SubscriptionApi} from '../../../src/iframe-helper';

/**
 * @visibleForTesting
 */
export class IframeTransportIntersectionObserver {
  /**
   * Constructor
   * @param {!Window} win The window element.
   * @param {!HTMLElement} target The element (e.g. an ad) to observe.
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   *     messages (results of observations) to.
   */
  constructor(win, target, frame) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!HTMLElement} */
    this.target_ = target;

    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {!Object} */
    this.intersectionObserverOptions_ = {
      root: this.win_.document,
      rootMargin: '0px',
      threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5,
        0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0],
    };

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_,
      MessageType.SEND_INTERSECTION_OBSERVER_EVENTS, true,
      () => {
        const observer = new IntersectionObserver(
            this.onIntersectionObserverEvent_.bind(this),
            this.intersectionObserverOptions_);
        observer.observe(this.target_);
      });
  }

  /**
   * Called when an IntersectionObserver event is received. Posts a message
   * to interested vendor frame.
   * @param {!Array<!Object>} entries A list of IntersectionObserverEntry
   *     objects.
   * @param {!IntersectionObserver} unused The observer created in the
   *     anonymous function passed to SubsriptionApi() above.
   * @private
   */
  onIntersectionObserverEvent_(entries, unused) {
    console.log('Received IntersectionObserver events:');
    console.dir(entries);
    this.postMessageApi_.send(MessageType.INTERSECTION_OBSERVER_EVENTS,
        /** @type {!JsonObject} */ ({entries}));
  }
}
