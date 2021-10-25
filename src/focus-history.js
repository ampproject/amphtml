import {Observable} from '#core/data-structures/observable';
import {isElement} from '#core/types';

import {Services} from '#service';

import {dev} from '#utils/log';

/**
 * FocusHistory keeps track of recent focused elements. This history can be
 * purged using `purgeBefore` method.
 */
export class FocusHistory {
  /**
   * @param {!Window} win
   * @param {number} purgeTimeout
   */
  constructor(win, purgeTimeout) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {number} */
    this.purgeTimeout_ = purgeTimeout;

    /** @private @const {!Array<!{el: !Element, time: time}>} */
    this.history_ = [];

    /** @private @const {!Observable<!Element>} */
    this.observeFocus_ = new Observable();

    /**
     * @private
     * @param {!Event} e
     */
    this.captureFocus_ = (e) => {
      // Hack (#15079) due to Firefox firing focus events on the entire page
      if (isElement(e.target)) {
        this.pushFocus_(dev().assertElement(e.target));
      }
    };

    /**
     * @private
     * @param {*} unusedE
     */
    this.captureBlur_ = (unusedE) => {
      // IFrame elements do not receive `focus` event. An alternative way is
      // implemented here. We wait for a blur to arrive on the main window
      // and after a short time check which element is active.
      Services.timerFor(win).delay(() => {
        if (this.win.document.activeElement) {
          this.pushFocus_(this.win.document.activeElement);
        }
      }, 500);
    };
    this.win.document.addEventListener('focus', this.captureFocus_, true);
    this.win.addEventListener('blur', this.captureBlur_);
  }

  /** @visibleForTesting */
  cleanup_() {
    this.win.document.removeEventListener('focus', this.captureFocus_, true);
    this.win.removeEventListener('blur', this.captureBlur_);
  }

  /**
   * Add a listener for focus events.
   * @param {function(!Element)} handler
   * @return {!UnlistenDef}
   */
  onFocus(handler) {
    return this.observeFocus_.add(handler);
  }

  /**
   * @param {!Element} element
   * @private
   */
  pushFocus_(element) {
    const now = Date.now();
    if (
      this.history_.length == 0 ||
      this.history_[this.history_.length - 1].el != element
    ) {
      this.history_.push({el: element, time: now});
    } else {
      this.history_[this.history_.length - 1].time = now;
    }
    this.purgeBefore(now - this.purgeTimeout_);
    this.observeFocus_.fire(element);
  }

  /**
   * Returns the element that was focused last.
   * @return {?Element}
   */
  getLast() {
    if (this.history_.length == 0) {
      return null;
    }
    return this.history_[this.history_.length - 1].el;
  }

  /**
   * Removes elements from the history older than the specified time.
   * @param {time} time
   */
  purgeBefore(time) {
    let index = this.history_.length - 1;
    for (let i = 0; i < this.history_.length; i++) {
      if (this.history_[i].time >= time) {
        index = i - 1;
        break;
      }
    }
    if (index != -1) {
      this.history_.splice(0, index + 1);
    }
  }

  /**
   * Returns `true` if the specified element contains any of the elements in
   * the history.
   * @param {!Element} element
   * @return {boolean}
   */
  hasDescendantsOf(element) {
    if (this.win.document.activeElement) {
      this.pushFocus_(this.win.document.activeElement);
    }
    for (let i = 0; i < this.history_.length; i++) {
      if (element.contains(this.history_[i].el)) {
        return true;
      }
    }
    return false;
  }
}
