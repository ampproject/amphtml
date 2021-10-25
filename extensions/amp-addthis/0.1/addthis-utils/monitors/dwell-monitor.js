export class DwellMonitor {
  /**
   * Creates an instance of DwellMonitor.
   */
  constructor() {
    this.dwellTime_ = 0;
    this.ampdoc_ = null;
  }

  /**
   * Add visibility listener to ampdoc.
   *
   * @param {!../../../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  startForDoc(ampDoc) {
    this.ampdoc_ = ampDoc;
    this.ampdoc_.onVisibilityChanged(this.listener.bind(this));
  }

  /**
   * Calculates dwell time.
   */
  listener() {
    if (!this.ampdoc_.isVisible()) {
      const lastVisibleTime = this.ampdoc_.getLastVisibleTime() || 0;
      this.dwellTime_ += Date.now() - lastVisibleTime;
    }
  }

  /**
   * Returns dwell time.
   *
   * @return {number}
   */
  getDwellTime() {
    return this.dwellTime_;
  }
}
