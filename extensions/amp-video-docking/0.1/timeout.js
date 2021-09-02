import {Services} from '#service';

/** Timeout that can be postponed, repeated or cancelled. */
export class Timeout {
  /**
   * @param {!Window} win
   * @param {!Function} handler
   */
  constructor(win, handler) {
    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!Function} */
    this.handler_ = handler;

    /** @private {?number|?string} */
    this.id_ = null;
  }

  /**
   * @param {number} time
   * @param {...*} args
   */
  trigger(time, ...args) {
    this.cancel();
    this.id_ = this.timer_.delay(() => this.handler_.apply(null, args), time);
  }

  /** @public */
  cancel() {
    if (this.id_ !== null) {
      this.timer_.cancel(this.id_);
      this.id_ = null;
    }
  }

  /** @return {boolean} */
  isWaiting() {
    return this.id_ !== null;
  }
}
