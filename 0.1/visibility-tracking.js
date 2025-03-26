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

    // Start tracking immediately
    this.setupVisibilityTracking();
  }

  /**
   * Sets up visibility tracking using IntersectionObserver
   */
  setupVisibilityTracking() {
    // [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    const thresholds = Array.from({length: 11}, (_, i) => i / 10);

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

        // Prepare visibility data object
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

        // Dispatch custom event
        this.dispatchVisibilityEvent(visibilityData);

        // Call callback if provided
        if (this.onVisibilityChange_) {
          this.onVisibilityChange_(visibilityData);
        }
      }
    });
  }

  /**
   * Dispatches a custom visibility change event with detailed data
   * @param {!Object} visibilityData - Visibility data to include with event
   */
  dispatchVisibilityEvent(visibilityData) {
    const event = this.createCustomEvent('amp-ad-visibility-change', {
      detail: visibilityData,
      bubbles: true,
    });
    this.element_.dispatchEvent(event);
  }

  /**
   * Returns the current visibility percentage of the ad
   * @return {number} Percentage between 0 and 1
   */
  getVisibilityPercentage() {
    return this.visibilityPercentage_;
  }

  /**
   * Returns whether the ad is currently considered viewable (>= 50% visible)
   * @return {boolean}
   */
  isViewable() {
    return this.visibilityPercentage_ >= 0.5;
  }

  /**
   * Returns whether the ad is currently fully visible (>= 90% visible)
   * @return {boolean}
   */
  isFullyVisible() {
    return this.visibilityPercentage_ >= 0.9;
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
