/**
 * @fileoverview Support for the CloseWatcher API that fallbacks to the
 * history service.
 * See https://github.com/WICG/close-watcher.
 */

import {Keys_Enum} from '#core/constants/key-codes';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

const TAG = 'CloseWatcherImpl';

export class CloseWatcherImpl {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   * @param {function()} handler
   */
  constructor(ampdoc, handler) {
    const {win} = ampdoc;

    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.handler_ = handler;

    /** @private {?CloseWatcher} */
    this.watcher_ = null;

    /** @private {?../service/history-impl.History} */
    this.history_ = null;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {?function()} */
    this.boundCloseOnEscape_ = null;

    if (typeof win.CloseWatcher === 'function') {
      try {
        this.watcher_ = new win.CloseWatcher();
      } catch (e) {
        dev().error(TAG, 'CloseWatcher failed:', e);
      }
    }
    if (this.watcher_) {
      this.watcher_.onclose = () => {
        handler();
        this.destroy();
      };
    } else {
      this.history_ = Services.historyForDoc(ampdoc);
      this.history_
        .push(() => handler())
        .then((historyId) => {
          this.historyId_ = historyId;
        });
      this.boundCloseOnEscape_ = this.closeOnEscape_.bind(this);
      win.document.documentElement.addEventListener(
        'keydown',
        this.boundCloseOnEscape_
      );
    }
  }

  /**
   * Signals to the close watcher to close the modal.
   * See `CloseWatcher.signalClosed`.
   */
  signalClosed() {
    if (this.watcher_) {
      this.watcher_.signalClosed();
    } else if (this.handler_) {
      const handler = this.handler_;
      handler();
      this.destroy();
    }
  }

  /**
   * Destroys the watcher.
   * See `CloseWatcher.destroy`.
   */
  destroy() {
    this.handler_ = null;
    if (this.watcher_) {
      this.watcher_.destroy();
      this.watcher_ = null;
    } else if (this.historyId_ != -1) {
      devAssert(this.history_).pop(this.historyId_);
      this.historyId_ = -1;
      this.history_ = null;
      this.win_.document.documentElement.removeEventListener(
        'keydown',
        this.boundCloseOnEscape_
      );
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  closeOnEscape_(event) {
    if (event.key == Keys_Enum.ESCAPE) {
      event.preventDefault();
      this.signalClosed();
    }
  }
}
