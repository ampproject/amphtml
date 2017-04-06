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

import {SubscriptionApi} from './iframe-helper';
import {MessageType} from './3p-frame-messaging.js';
import {rateLimit} from './utils/rate-limit';
import {LayoutRectDef} from './layout-rect';

/** @const */
const MIN_EVENT_INTERVAL_IN_MS = 100;

/**
 * @typedef {{
 *   viewport: !LayoutRectDef,
 *   target: !LayoutRectDef
 * }}
 */
let PositionEntryDef;

export class PositionObserverApi {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe
   * @param {boolean=} opt_is3p
   */
  constructor(baseElement, iframe, opt_is3p) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;

    /** @private @const {!./service/viewport-impl.Viewport} */
    this.viewport_ = baseElement.getViewport();

    /** @private {?SubscriptionApi} */
    this.subscriptionApi_ = new SubscriptionApi(
        iframe, MessageType.SEND_POSITIONS, opt_is3p || false, () => {
          // Sending one immediately
          this.fire();
          this.startSendingPosition_();
        });

    /** @const {function()} */
    this.fire = rateLimit(this.baseElement_.win, () => {
      console.log('ratelimit');
      this.baseElement_.getVsync().measure(() => {
        console.log('eeeee');
        this.subscriptionApi_.send(MessageType.POSITION, this.getPosition_());
      });
    }, MIN_EVENT_INTERVAL_IN_MS);

    /** @private {?Function} */
    this.unlistenOnDestroy_ = null;
  }

  /**
   * Function to start listening to viewport event and observe element position.
   * @private
   */
  startSendingPosition_() {
    // TODO: register element to positionObserver once layer manager supports
    const unlistenViewportScroll = this.viewport_.onScroll(this.fire);
    const unlistenViewportChange = this.viewport_.onChange(this.fire);
    this.unlistenOnDestroy_ = () => {
      unlistenViewportScroll();
      unlistenViewportChange();
    };
  }

  /**
   * Clean all listeners
   */
  destroy() {
    if (this.unlistenOnDestroy_) {
      this.unlistenOnDestroy_();
      this.unlistenOnDestroy_ = null;
    }
    if (this.subscriptionApi_) {
      this.subscriptionApi_.destroy();
      this.subscriptionApi_ = null;
    }
  }

  /**
   * Get the position info.
   * Note: need to call in vsync
   * @return {PositionEntryDef}
   */
  getPosition_() {
    return {
      viewport: this.viewport_.getRect(),
      target: this.baseElement_.getLayoutBox(),
    };
  }
}

