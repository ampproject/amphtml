/**
 * Handles visibility tracking for ad elements using IntersectionObserver
 */
export class VisibilityTracker {
  /**
   * @param {!Window} win - Window object
   * @param {!Element} element - Element to track
   * @param {Function=} onVisibilityChange - Optional callback for visibility changes
   */
  constructor(win, element, onVisibilityChange = null) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {Function|null} */
    this.onVisibilityChange_ = onVisibilityChange;

    /** @private {number} */
    this.visibilityPercentage_ = 0;

    /** @private {?IntersectionObserver} */
    this.visibilityObserver_ = null;

    this.setupVisibilityTracking_();
  }

  /**
   * Sets up visibility tracking using IntersectionObserver
   * @private
   */
  setupVisibilityTracking_() {
    const thresholds = [0, 0.5, 1];

    this.visibilityObserver_ = new this.win_.IntersectionObserver(
      (entries) => this.handleVisibilityChange_(entries),
      {
        threshold: thresholds,
      }
    );

    this.visibilityObserver_.observe(this.element_);
  }

  /**
   * Handles intersection changes reported by the IntersectionObserver
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  handleVisibilityChange_(entries) {
    entries.forEach((entry) => {
      const previousVisibility = this.visibilityPercentage_;
      this.visibilityPercentage_ = entry.intersectionRatio;

      const visibilityChanged =
        Math.abs(this.visibilityPercentage_ - previousVisibility) >= 0.1;
      if (visibilityChanged) {
        console /*OK*/
          .log(
            'Ad visibility:',
            Math.round(this.visibilityPercentage_ * 100) + '%'
          );

        const visibilityData = {
          visibilityPercentage: this.visibilityPercentage_,
          isVisible: this.visibilityPercentage_ > 0,
          isViewable: this.visibilityPercentage_ >= 0.5,
          isFullyVisible: this.visibilityPercentage_ >= 0.9,
          visibilityChange: this.visibilityPercentage_ - previousVisibility,
          boundingClientRect: entry.boundingClientRect,
          intersectionRect: entry.intersectionRect,
          timestamp: Date.now(),
        };

        if (this.onVisibilityChange_) {
          this.onVisibilityChange_(visibilityData);
        }
      }
    });
  }

  /**
   * Clean up the observer when no longer needed
   */
  destroy() {
    if (this.visibilityObserver_) {
      this.visibilityObserver_.disconnect();
      this.visibilityObserver_ = null;
    }
  }
}
