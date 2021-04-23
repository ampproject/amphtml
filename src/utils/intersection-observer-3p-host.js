/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {MessageType} from '../3p-frame-messaging';
import {SubscriptionApi} from '../iframe-helper';
import {dict} from '../core/types/object';
import {intersectionEntryToJson} from './intersection';

export const DEFAULT_THRESHOLD = [
  0,
  0.05,
  0.1,
  0.15,
  0.2,
  0.25,
  0.3,
  0.35,
  0.4,
  0.45,
  0.5,
  0.55,
  0.6,
  0.65,
  0.7,
  0.75,
  0.8,
  0.85,
  0.9,
  0.95,
  1,
];

/**
 * A class to help amp-iframe and amp-ad nested iframe listen to intersection
 * change.
 */
export class IntersectionObserver3pHost {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe
   */
  constructor(baseElement, iframe) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {?SubscriptionApi} */
    this.subscriptionApi_ = new SubscriptionApi(
      iframe,
      MessageType.SEND_INTERSECTIONS,
      false, // is3P
      () => {
        this.startSendingIntersection_();
      }
    );

    this.intersectionObserver_ = new IntersectionObserver(
      (entries) => {
        this.subscriptionApi_.send(
          MessageType.INTERSECTION,
          dict({'changes': entries.map(intersectionEntryToJson)})
        );
      },
      {threshold: DEFAULT_THRESHOLD}
    );
  }

  /**
   * Function to start listening to viewport event. and observer intersection
   * change on the element.
   */
  startSendingIntersection_() {
    this.intersectionObserver_.observe(this.baseElement_.element);
  }

  /**
   * Clean all listenrs
   */
  destroy() {
    this.intersectionObserver_.disconnect();
    this.intersectionObserver_ = null;
    this.subscriptionApi_.destroy();
    this.subscriptionApi_ = null;
  }
}
