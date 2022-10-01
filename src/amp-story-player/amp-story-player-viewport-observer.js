import {throttle} from '#core/types/function';

/** @const {number} */
const SCROLL_THROTTLE_MS = 500;

/**
 * Creates an IntersectionObserver or fallback using scroll events.
 * Fires viewportCb when criteria is met and unobserves immediately after.
 */
export class AmpStoryPlayerViewportObserver {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function():void} viewportCb
   */
  constructor(win, element, viewportCb) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {function():void} */
    this.cb_ = viewportCb;

    /** @private {?function():void} */
    this.scrollHandler_ = null;

    this.initializeInObOrFallback_();
  }

  /** @private */
  initializeInObOrFallback_() {
    if (!this.win_.IntersectionObserver || this.win_ !== this.win_.parent) {
      this.createInObFallback_();
      return;
    }

    this.createInOb_();
  }

  /**
   * Creates an IntersectionObserver.
   * @private
   */
  createInOb_() {
    const inObCallback = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.cb_();
        observer.unobserve(this.element_);
      });
    };

    const observer = new this.win_.IntersectionObserver(inObCallback);

    observer.observe(this.element_);
  }

  /**
   * Fallback for when IntersectionObserver is not supported. Calls
   * layoutPlayer on the element when it is close to the viewport.
   * @private
   */
  createInObFallback_() {
    this.scrollHandler_ = throttle(
      this.win_,
      this.checkIfVisibleFallback_.bind(this),
      SCROLL_THROTTLE_MS
    );

    this.win_.addEventListener('scroll', this.scrollHandler_);

    this.checkIfVisibleFallback_(this.element_);
  }

  /**
   * Checks if element is close to the viewport and calls the callback when it
   * is.
   * @private
   */
  checkIfVisibleFallback_() {
    const elTop = this.element_./*OK*/ getBoundingClientRect().top;
    const winInnerHeight = this.win_./*OK*/ innerHeight;

    if (winInnerHeight > elTop) {
      this.cb_();
      this.win_.removeEventListener('scroll', this.scrollHandler_);
    }
  }
}
