import {Services} from '#service';

/**
 * Installs "pull-to-refresh" (P2R) blocker if viewer has requested. P2R can
 * be very disruptive for different viewer scenarios. This is currently only
 * done on Chrome (both Android and iOS).
 * @param {!Window} win
 */
export function installPullToRefreshBlocker(win) {
  // Only do when requested and don't even try it on Safari!
  // This mode is only executed in the single-doc mode.
  const {documentElement} = win.document;
  if (
    Services.viewerForDoc(documentElement).getParam('p2r') == '0' &&
    Services.platformFor(win).isChrome()
  ) {
    new PullToRefreshBlocker(
      win.document,
      Services.viewportForDoc(documentElement)
    );
  }
}

/**
 * Visible for testing only.
 * @private
 */
export class PullToRefreshBlocker {
  /**
   * @param {!Document} doc
   * @param {!./service/viewport/viewport-interface.ViewportInterface} viewport
   */
  constructor(doc, viewport) {
    /** @private {!Document} */
    this.doc_ = doc;

    /** @private @const */
    this.viewport_ = viewport;

    /** @private {boolean} */
    this.tracking_ = false;

    /** @private {number} */
    this.startPos_ = 0;

    /** @private {!Function} */
    this.boundTouchStart_ = this.onTouchStart_.bind(this);
    /** @private {!Function} */
    this.boundTouchMove_ = this.onTouchMove_.bind(this);
    /** @private {!Function} */
    this.boundTouchEnd_ = this.onTouchEnd_.bind(this);
    /** @private {!Function} */
    this.boundTouchCancel_ = this.onTouchCancel_.bind(this);

    this.doc_.addEventListener('touchstart', this.boundTouchStart_, true);
  }

  /** */
  cleanup() {
    this.stopTracking_();
    this.doc_.removeEventListener('touchstart', this.boundTouchStart_, true);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onTouchStart_(event) {
    // P2R won't trigger when document is scrolled. Also can ignore when we are
    // already tracking this touch and for non-single-touch events.
    if (
      this.tracking_ ||
      !(event.touches && event.touches.length == 1) ||
      this.viewport_.getScrollTop() > 0
    ) {
      return;
    }

    this.startTracking_(event.touches[0].clientY);
  }

  /**
   * @param {number} startPos
   * @private
   */
  startTracking_(startPos) {
    this.tracking_ = true;
    this.startPos_ = startPos;
    this.doc_.addEventListener('touchmove', this.boundTouchMove_, true);
    this.doc_.addEventListener('touchend', this.boundTouchEnd_, true);
    this.doc_.addEventListener('touchcancel', this.boundTouchCancel_, true);
  }

  /** @private */
  stopTracking_() {
    this.tracking_ = false;
    this.startPos_ = 0;
    this.doc_.removeEventListener('touchmove', this.boundTouchMove_, true);
    this.doc_.removeEventListener('touchend', this.boundTouchEnd_, true);
    this.doc_.removeEventListener('touchcancel', this.boundTouchCancel_, true);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onTouchMove_(event) {
    if (!this.tracking_) {
      return;
    }

    const dy = event.touches[0].clientY - this.startPos_;

    // Immediately cancel the P2R if dragging down.
    if (dy > 0) {
      event.preventDefault();
    }

    // Stop tracking if there was any motion at all.
    if (dy != 0) {
      this.stopTracking_();
    }
  }

  /**
   * @param {!Event} unusedEvent
   * @private
   */
  onTouchEnd_(unusedEvent) {
    this.stopTracking_();
  }

  /**
   * @param {!Event} unusedEvent
   * @private
   */
  onTouchCancel_(unusedEvent) {
    this.stopTracking_();
  }
}
