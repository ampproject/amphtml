/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {cancellation} from '../../../src/error';
import {dev} from '../../../src/log';
import {listenOnce} from '../../../src/event-helper';

const TAG = 'local-viewer';

export class ViewerTracker {
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {?Promise} */
    this.reportViewPromise_ = null;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   * @param {time} timeToView
   * @returns {Promise}
   */
  scheduleView(timeToView) {
    this.reportViewPromise_ = null;
    return this.ampdoc_.whenReady().then(() => {
      if (this.viewer_.isVisible()) {
        return this.reportWhenViewed_(timeToView);
      }
      this.viewer_.onVisibilityChanged(() => {
        if (this.viewer_.isVisible()) {
          return this.reportWhenViewed_(timeToView);
        }
      });
    });
  }

  /**
   * @param {time} timeToView
   * @return {!Promise}
   * @private
   */
  reportWhenViewed_(timeToView) {
    if (this.reportViewPromise_) {
      return this.reportViewPromise_;
    }
    dev().fine(TAG, 'start view monitoring');
    this.reportViewPromise_ = this.whenViewed_(timeToView)
        .then(() => {
          // Wait for the most recent authorization flow to complete.
          return this.lastAuthorizationPromises_;
        })
        .catch(reason => {
          // Ignore - view has been canceled.
          dev().fine(TAG, 'view cancelled:', reason);
          this.reportViewPromise_ = null;
          throw reason;
        });

    return this.reportViewPromise_;
  }

  /**
   * The promise will be resolved when a view of this document has occurred. It
   * will be rejected if the current impression should not be counted as a view.
   * @param {time} timeToView Pass the value of 0 when this method is called
   *   as the result of the user action.
   * @return {!Promise}
   * @private
   */
  whenViewed_(timeToView) {
    if (timeToView == 0) {
      // Immediate view has been registered. This will happen when this method
      // is called as the result of the user action.
      return Promise.resolve();
    }

    // Viewing kick off: document is visible.
    const unlistenSet = [];
    return new Promise((resolve, reject) => {
      // 1. Document becomes invisible again: cancel.
      unlistenSet.push(this.viewer_.onVisibilityChanged(() => {
        if (!this.viewer_.isVisible()) {
          reject(cancellation());
        }
      }));

      // 2. After a few seconds: register a view.
      const timeoutId = this.timer_.delay(resolve, timeToView);
      unlistenSet.push(() => this.timer_.cancel(timeoutId));

      // 3. If scrolled: register a view.
      unlistenSet.push(this.viewport_.onScroll(resolve));

      // 4. Tap: register a view.
      unlistenSet.push(listenOnce(this.ampdoc_.getRootNode(),
          'click', resolve));
    }).then(() => {
      unlistenSet.forEach(unlisten => unlisten());
    }, reason => {
      unlistenSet.forEach(unlisten => unlisten());
      throw reason;
    });
  }
}
