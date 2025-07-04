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
 * Array of event types which will be listened for on the document to indicate
 * activity. Other activities are also observed on the AmpDoc and Viewport
 * objects. See {@link setUpActivityListeners_} for listener implementation.
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
   * @param {Object=} config - Optional configuration object
   */
  constructor(win, config = {}) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {Array<function(boolean)>} */
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

    /** @private {Object=} */
    this.config_ = config;

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    if (this.config_.idleTimer) {
      this.idleTimeout_ = this.config_.idleTimer * 1000;
    }

    if (this.config_.ivm) {
      this.ivm_ = this.config_.ivm;
    }

    /** @private {boolean} */
    this.isFocused_ = this.win.document.hasFocus();
    /** @private {boolean} */
    this.isVisible_ = !isDocumentHidden(this.win.document);
    /** @private {boolean} */
    this.isOpen_ = true;
    /** @private {boolean} */
    this.isEngaged_ = this.calculateEngaged_();
    /** @private {boolean} */
    this.isIdle_ = false;

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

    this.setUpListenersFromArray_(
      this.ampdoc.getRootNode(),
      ACTIVE_EVENT_TYPES,
      () => {
        this.isFocused_ = true;
        this.isVisible_ = true;
        this.isOpen_ = true;
        this.updateEngagement_();
        this.restartIdleTimer_();
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

    if (isEngaged) {
      this.restartIdleTimer_();
    } else {
      this.isIdle_ = false;
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

    this.isIdle_ = false;
    clearTimeout(this.idleTimer_);

    this.idleTimer_ = setTimeout(() => {
      this.isIdle_ = true;
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
      instanceCount: this.instanceCount_,
    };
  }

  /**
   * Clean up resources and reset the singleton
   */
  destroy() {
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_ = [];
    this.listeners_ = [];

    EngagementTracker.instance_ = null;
  }
}

/** @private {?EngagementTracker} */
EngagementTracker.instance_ = null;
