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
import {user} from '../../../src/log';
import {dict} from '../../../src/utils/object';

/**
 * @visibleForTesting
 */
export class IframeTransportIntersectionObserver {
  /**
   * Constructor
   * @param {!Window} win The window element.
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   *     messages (results of observations) to.
   */
  constructor(win, frame) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {!Object} */
    this.intersectionObserverOptions_ = {
      threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5,
        0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0],
    };

    /** @private {!Object<string, !Element>} */
    this.creativeIdToTarget_ = {};

    /** @private {!Object<string, !IntersectionObserver>} */
    this.creativeIdToIntersectionObserver_ = {};

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_,
        MessageType.SEND_INTERSECTION_OBSERVER_EVENTS, true, (req) => {
        if (req && req.creativeId &&
            this.creativeIdToTarget_[req.creativeId] &&
            !this.creativeIdToIntersectionObserver_[req.creativeId]) {
          this.creativeIdToIntersectionObserver_[req.creativeId] =
              new IntersectionObserver(
                  this.onIntersectionObserverEvent_.bind(this, req.creativeId),
                  this.intersectionObserverOptions_);
          this.creativeIdToIntersectionObserver_[req.creativeId].observe(
              this.creativeIdToTarget_[req.creativeId]);
        }
      });
  }

  /**
   * Adds a creativeId to the list of ids we are listening to
   * IntersectionObserver events for.
   * @param {!string} creativeId The creativeId used to identify <the
   *     creative that is being observed, the IframeTransport object that sends
   *     the observations>.
   * @param {!Element} target The element (e.g. an ad) to observe.
   */
  addTarget(creativeId, target) {
    user().assert(creativeId && target,
        'Creative ID and target must be specified');
    this.creativeIdToTarget_[creativeId] = target;
  }

  /**
   * Called when an IntersectionObserver event is received. Posts a message
   * to interested vendor frame.
   * @param {!string} creativeId The creativeId used to identify <the
   *     creative that is being observed, the IframeTransport object that sends
   *     the observations>.
   * @param {!Array<!IntersectionObserverEntry>} entries A list of
   *     IntersectionObserverEntry objects.
   * @param {!IntersectionObserver} unused The observer created in the
   *     anonymous function passed to SubsriptionApi() above.
   * @private
   */
  onIntersectionObserverEvent_(creativeId, entries, unused) {
    /** @type {!JsonObject} */
    const payload = dict({'entries': [], creativeId});
    entries.forEach(entry => {
      payload['entries'].push(
          this.intersectionObserverEntryToJsonObject(entry));
    });
    this.postMessageApi_.send(MessageType.INTERSECTION_OBSERVER_EVENTS,
        payload);
  }

  /**
   * Converts an IntersectionObserverEntry into a
   * JsonObject.
   * Note that JSON.stringify(entry) will return {}. Plus, we want to filter out
   * rootBounds.
   * @param {!IntersectionObserverEntry} entry
   * @returns {!Object}
   */
  intersectionObserverEntryToJsonObject(entry) {
    return {
      time: entry.time,
      boundingClientRect: this.rectToJsonObject(entry.boundingClientRect),
      intersectionRect: this.rectToJsonObject(entry.intersectionRect),
      intersectionRatio: entry.intersectionRatio,
    };
  }

/**
 * Converts a ClientRect IntersectionObserverEntry into a
 * JsonObject.
 * @param {!Object} rect
 * @returns {!Object}
 */
  rectToJsonObject(rect) {
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }
}
