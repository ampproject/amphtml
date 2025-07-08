import {isDocumentHidden} from '#core/document/visibility';

import {listen} from '#utils/event-helper';

/**
 * Enum for browser/user activity states
 * @enum {number}
 */
export const BrowserState = {
  UNKNOWN: -1,
  INACTIVE: 0,
  ACTIVE: 1,
  IDLE: 2,
};

/**
 * @typedef {{
 *   idleTimer: (number|undefined),
 *   ivm: (boolean|undefined)
 * }} EngagementConfig
 */

/**
 * Array of event types which will be listened for on the document to indicate
 * activity. Other activities are also observed on the AmpDoc and Viewport
 * objects.
 * @private @const {Array<string>}
 */
const ACTIVE_EVENT_TYPES = [
  'mousedown',
  'mouseup',
  'mousemove',
  'keydown',
  'keyup',
];

/**
 * A singleton tracker for user engagement across all ad units.
 * This tracks focus, visibility, and page state to determine if the user is engaged.
 */
export class EngagementTracker {
  /**
   * @param {!Window} win - Window object
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {Array<function(!Object)>} */
    this.listeners_ = [];

    /** @private {Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @private {number} */
    this.idleTimeout_ = 21000; // Default to 21 seconds

    /** @private {?number} */
    this.idleTimer_ = null;

    /** @private {boolean} */
    this.ivm_ = false;

    /** @private {BrowserState} */
    this.currentState_ = BrowserState.UNKNOWN;

    /** @private {boolean} */
    this.isFocused_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.isOpen_ = false;

    /** @private {boolean} */
    this.isEngaged_ = false;

    /** @private {boolean} */
    this.isIdle_ = false;

    /** @private {boolean} */
    this.initialized_ = false;
  }

  /**
   * Initialize event listeners
   * @param {EngagementConfig=} config
   */
  init(config = {}) {
    if (this.initialized_) {
      return;
    }
    this.initialized_ = true;

    if (config.idleTimer !== undefined) {
      this.idleTimeout_ = config.idleTimer * 1000;
    }

    if (config.ivm !== undefined) {
      this.ivm_ = config.ivm;
    }

    this.isFocused_ = this.win_.document.hasFocus();
    this.isVisible_ = !isDocumentHidden(this.win_.document);
    this.isOpen_ = true;
    this.isEngaged_ = this.calculateEngaged_();
    this.isIdle_ = false;

    // Define listeners as const for clarity and possible future removal
    const onFocus = () => {
      this.isFocused_ = true;
      this.updateEngagement_();
    };
    const onBlur = () => {
      this.isFocused_ = false;
      this.updateEngagement_();
    };
    const onPageShow = () => {
      this.isOpen_ = true;
      this.updateEngagement_();
    };
    const onPageHide = () => {
      this.isOpen_ = false;
      this.updateEngagement_();
    };
    const onVisibilityChange = () => {
      this.isVisible_ = !isDocumentHidden(this.win_.document);
      this.updateEngagement_();
    };

    this.unlisteners_.push(
      listen(this.win_, 'focus', onFocus),
      listen(this.win_, 'blur', onBlur),
      listen(this.win_, 'pageshow', onPageShow),
      listen(this.win_, 'pagehide', onPageHide),
      listen(this.win_.document, 'visibilitychange', onVisibilityChange)
    );

    this.setUpListenersFromArray_(
      this.win_.document,
      ACTIVE_EVENT_TYPES,
      () => {
        this.isFocused_ = true;
        this.isVisible_ = true;
        this.isOpen_ = true;
        this.isIdle_ = false;
        this.updateEngagement_();
      }
    );
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
    const isEngaged = this.calculateEngaged_();

    if (isEngaged !== this.isEngaged_) {
      this.isEngaged_ = isEngaged;
      this.currentState_ = isEngaged
        ? BrowserState.ACTIVE
        : BrowserState.INACTIVE;
      this.notifyListeners_();
    }

    if (this.currentState_ === BrowserState.ACTIVE) {
      this.restartIdleTimer_();
    } else if (this.currentState_ === BrowserState.INACTIVE) {
      clearTimeout(this.idleTimer_);
    }
  }

  /**
   * Notify all listeners of the current page state
   * @private
   */
  notifyListeners_() {
    this.listeners_.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (e) {
        console /*OK*/
          .error('Error in engagement listener:', e);
      }
    });
  }

  /**
   * Resets the time until the user state changes to idle
   * @private
   */
  restartIdleTimer_() {
    if (this.ivm_) {
      return;
    }

    clearTimeout(this.idleTimer_);

    this.idleTimer_ = setTimeout(() => {
      this.isIdle_ = true;
      this.currentState_ = BrowserState.IDLE;
    }, this.idleTimeout_);
  }

  /**
   *  @private
   *  @param {!EventTarget} target
   *  @param {Array<string>} events
   *  @param {function()} listener
   */
  setUpListenersFromArray_(target, events, listener) {
    for (let i = 0; i < events.length; i++) {
      this.unlisteners_.push(listen(target, events[i], listener));
    }
  }

  /**
   * Add a listener for engagement changes
   * @param {function(!Object)} listener - Function called when engagement changes
   * @return {function()} Function to remove the listener
   */
  registerListener(listener) {
    this.listeners_.push(listener);

    try {
      const state = this.getState();
      listener(state);
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
      currentState: this.currentState_,
      isEngaged: this.isEngaged_,
      isFocused: this.isFocused_,
      isVisible: this.isVisible_,
      isOpen: this.isOpen_,
      isIdle: this.isIdle_,
    };
  }

  /**
   * Clean up resources and reset the singleton
   */
  destroy() {
    this.unlisteners_.forEach((unlisten) => {
      try {
        unlisten();
      } catch (e) {
        // Ignore errors from already-removed listeners
      }
    });
    this.unlisteners_ = [];
    this.listeners_ = [];
    clearTimeout(this.idleTimer_);
    this.idleTimer_ = null;
    this.initialized_ = false;
  }
}
