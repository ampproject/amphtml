import {isDocumentHidden} from '#core/document/visibility';

import {listen} from '#utils/event-helper';

/**
 * A singleton tracker for user engagement across all ad units.
 * This tracks focus, visibility, and page state to determine if the user is engaged.
 */
export class EngagementTracker {
  /**
   * @param {!Window} win - Window object
   */
  constructor(win) {
    if (EngagementTracker.instance_) {
      return EngagementTracker.instance_;
    }

    EngagementTracker.instance_ = this;

    /** @private {!Window} */
    this.win_ = win;

    /** @private {Array<function(boolean)>} */
    this.listeners_ = [];

    /** @private {Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @private {boolean} */
    this.isInitialized_ = false;

    /** @private {number} */
    this.instanceCount_ = 0;

    /** @private {?number} */
    this.debounceTimer_ = null;

    /** @private {number} */
    this.debounceDelay_ = 100; // TODO: Needs testing, is this value too high?

    return this;
  }

  /**
   * Returns the singleton instance of EngagementTracker.
   * @param {!Window} win - Window object
   * @return {!EngagementTracker}
   * @public
   */
  static get(win) {
    if (!EngagementTracker.instance_) {
      EngagementTracker.instance_ = new EngagementTracker(win);
      EngagementTracker.instance_.init();
    }
    return EngagementTracker.instance_;
  }

  /**
   * Initialize event listeners
   * @return {!EngagementTracker} this instance for chaining
   */
  init() {
    this.instanceCount_++;

    if (this.isInitialized_) {
      return this;
    }

    /** @private {boolean} */
    this.isFocused_ = this.win.document.hasFocus();
    /** @private {boolean} */
    this.isVisible_ = !isDocumentHidden(this.win.document);
    /** @private {boolean} */
    this.isOpen_ = true;
    /** @private {boolean} */
    this.isEngaged_ = this.calculateEngaged_();

    this.unlisteners_.push(
      listen(this.win_, 'focus', () => {
        this.isFocused_ = true;
        this.updateEngagement_();
      }),
      listen(this.win_, 'blur', () => {
        this.isFocused_ = false;
        this.updateEngagement_();
      }),
      listen(this.win_, 'pageshow', () => {
        this.isOpen_ = true;
        this.updateEngagement_();
      }),
      listen(this.win_, 'pagehide', () => {
        this.isOpen_ = false;
        this.updateEngagement_();
      }),
      listen(this.win_.document, 'visibilitychange', () => {
        this.isVisible_ = !isDocumentHidden(this.win_.document);
        this.updateEngagement_();
      })
    );

    this.isInitialized_ = true;
    return this;
  }

  /**
   * Calculate the current engagement status
   * @return {boolean} Whether the user is currently engaged
   * @private
   */
  calculateEngaged_() {
    return this.isOpen_ && this.isVisible_ && this.isFocused_;
  }

  /**
   * Update engagement status and notify listeners if changed
   * @private
   */
  updateEngagement_() {
    // TODO: Play with debounceDelay_ value to optimize performance
    const newEngaged = this.calculateEngaged_();

    if (newEngaged !== this.isEngaged_) {
      if (this.debounceTimer_ !== null) {
        clearTimeout(this.debounceTimer_);
      }

      this.debounceTimer_ = setTimeout(() => {
        this.debounceTimer_ = null;

        const currentEngaged = this.calculateEngaged_();
        if (currentEngaged !== this.isEngaged_) {
          this.isEngaged_ = currentEngaged;
          this.notifyListeners_();
        }
      }, this.debounceDelay_);
    }
  }

  /**
   * Notify all listeners of the current engagement state
   * @private
   */
  notifyListeners_() {
    this.listeners_.forEach((listener) => {
      try {
        listener(this.isEngaged_);
      } catch (e) {
        console /*OK*/
          .error('Error in engagement listener:', e);
      }
    });
  }

  /**
   * Add a listener for engagement changes
   * @param {function(boolean)} listener - Function called when engagement changes
   * @return {function()} Function to remove the listener
   */
  onEngagementChange(listener) {
    this.listeners_.push(listener);

    try {
      listener(this.isEngaged_);
    } catch (e) {
      console /*OK*/
        .error('Error in initial engagement callback:', e);
    }

    return () => {
      const index = this.listeners_.indexOf(listener);
      if (index !== -1) {
        this.listeners_.splice(index, 1);
      }
    };
  }

  /**
   * Get current engagement state
   * @return {boolean}
   */
  isEngaged() {
    return this.isEngaged_;
  }

  /**
   * Get detailed engagement state
   * @return {!Object}
   */
  getState() {
    return {
      isEngaged: this.isEngaged_,
      isFocused: this.isFocused_,
      isVisible: this.isVisible_,
      isOpen: this.isOpen_,
      instanceCount: this.instanceCount_,
    };
  }

  /**
   * Release one instance reference to the singleton
   */
  release() {
    this.instanceCount_--;

    if (this.instanceCount_ <= 0) {
      this.dispose();
    }
  }

  /**
   * Clean up resources and reset the singleton
   */
  dispose() {
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_ = [];
    this.listeners_ = [];
    this.isInitialized_ = false;
    this.instanceCount_ = 0;

    EngagementTracker.instance_ = null;
  }
}

/** @private {?EngagementTracker} */
EngagementTracker.instance_ = null;
