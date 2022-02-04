import {Services} from '#service';

import {listenOnce} from '#utils/event-helper';
import {dev} from '#utils/log';

import {cancellation} from '../../../src/error-reporting';

const TAG = 'local-viewer';

export class ViewerTracker {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private */
    this.ampdoc_ = ampdoc;

    /** @private {?Promise} */
    this.reportViewPromise_ = null;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   * @param {time} timeToView
   * @return {!Promise}
   */
  scheduleView(timeToView) {
    this.reportViewPromise_ = null;
    return this.ampdoc_.whenReady().then(() => {
      return new Promise((resolve) => {
        if (this.ampdoc_.isVisible()) {
          resolve();
        }
        this.ampdoc_.onVisibilityChanged(() => {
          if (this.ampdoc_.isVisible()) {
            resolve();
          }
        });
      }).then(() => this.reportWhenViewed_(timeToView));
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
    this.reportViewPromise_ = this.whenViewed_(timeToView).catch((reason) => {
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
      unlistenSet.push(
        this.ampdoc_.onVisibilityChanged(() => {
          if (!this.ampdoc_.isVisible()) {
            reject(cancellation());
          }
        })
      );

      // 2. After a few seconds: register a view.
      const timeoutId = this.timer_.delay(resolve, timeToView);
      unlistenSet.push(() => this.timer_.cancel(timeoutId));

      // 3. If scrolled: register a view.
      unlistenSet.push(this.viewport_.onScroll(resolve));

      // 4. Tap: register a view.
      unlistenSet.push(
        listenOnce(this.ampdoc_.getRootNode(), 'click', resolve)
      );
    }).then(
      () => {
        unlistenSet.forEach((unlisten) => unlisten());
      },
      (reason) => {
        unlistenSet.forEach((unlisten) => unlisten());
        throw reason;
      }
    );
  }
}
