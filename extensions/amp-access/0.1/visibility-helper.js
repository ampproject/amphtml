/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const HELPER_PROP = '__AMP_AN_VIS';


/**
 */
export class VisibilityHelper {

  /**
   */
  constructor(parent, shouldBeVisible, config, callback) {

    /** @const @private {?VisibilityHelper} */
    this.parent_ = parent;

    /** @const @private {boolean} */
    this.shouldBeVisible_ = shouldBeVisible;

    /** @const @private {!Object} */
    this.config_ = config;

    /** @const @private {function()} */
    this.callback_ = callback;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.selfVisible_ = false;

    /** @private {?Array<!VisibilityHelper>} */
    this.children_ = null;

    /** @private {time} */
    this.timeLoaded_ = Date.now();

    /** @private {?Object} */
    this.lastChangeEntry_ = null;

    if (this.parent_) {
      this.parent_.addChild_(this);
    }
  }

  /** @override */
  dispose() {
    if (this.scheduledRunId_) {
      this.timer_.cancel(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
  }

  /**
   * @param {!VisibilityHelper} child
   * @private
   */
  addChild_(child) {
    if (!this.children_) {
      this.children_ = [];
    }
    this.children_.push(child);
    child.updateVisible_();
  }

  /**
   * @param {boolean} visible
   * @param {!Object=} opt_change
   */
  setVisible(visible, opt_change) {
    this.selfVisible_ = visible;
    if (opt_change) {
      this.lastChangeEntry_ = opt_change;
    }
    this.updateVisible_();
  }

  /** @private */
  updateVisible_() {
    const isVisible = this.selfVisible_ &&
        (!this.parent_ || this.parent_.isVisible_);
    if (isVisible != this.isVisible_) {
      this.isVisible_ = isVisible;
      this.visibleChanged_(isVisible);
      if (this.children_) {
        for (let i = 0; i < this.children_.length; i++) {
          this.children_[i].updateVisible_();
        }
      }
    }
  }

  /**
   * @param {boolean} visible
   * @private
   */
  visibleChanged_(visible) {
    // QQQ: change vs ping

    // Update states and check if all conditions are satisfied
    const conditionsMet =
        this.updateCounters_(visible, listener, shouldBeVisible); //QQQ

    // QQQ: is this right?
    if (!shouldBeVisible) {
      // For "hidden" trigger, only update state, don't trigger.
      continue;
    }

    if (conditionsMet) {
      if (state.scheduledRunId_) {
        this.timer_.cancel(state.scheduledRunId_);
        state.scheduledRunId_ = null;
      }
      this.callback_(this.createState_());
    } else if (this.inViewport_ && !state.scheduledRunId_) {
      // There is unmet duration condition, schedule a check
      const timeToWait = this.computeTimeToWait_(state, config);
      if (timeToWait <= 0) {
        continue;
      }
      state.scheduledRunId_ = this.timer_.delay(() => {
        dev().assert(this.inViewport_, 'should have been in viewport');
        this.visibleChanged_();
        const lastChange = state.lastChangeEntry_;
        this.visibleChanged_(lastChange);
      }, timeToWait);
    } else if (!this.inViewport_ && state.scheduledRunId_) {
      this.timer_.cancel(state.scheduledRunId_);
      state.scheduledRunId_ = null;
    }
  }

  /**
   * Updates counters for a given listener.
   * @param {number} visible Percentage of element visible in viewport.
   * @return {boolean} true if all visibility conditions are satisfied
   * @private
   */
  updateCounters_(visible) {
    const config = this.config_;
    const triggerType = this.shouldBeVisible_;
    if (visible > 0) {
      const timeElapsed = Date.now() - this.timeLoaded_;
      this.firstSeenTime_ = this.firstSeenTime_ || timeElapsed;
      this.loadSeenTime_ = timeElapsed;
      // Consider it as load time visibility if this happens within 300ms of
      // page load.
      if (this.loadTimeVisibility_ == null && timeElapsed < 300) {
        this.loadTimeVisibility_ = visible;
      }
    }

    // QQQ
    const wasInViewport = this.inViewport_;
    const timeSinceLastUpdate = Date.now() - this.lastUpdate_;
    this.inViewport_ = this.isInViewport_(visible,
        config[VISIBLE_PERCENTAGE_MIN], config[VISIBLE_PERCENTAGE_MAX]);

    if (this.inViewport_ && wasInViewport) {
      // Keep counting.
      this.setState_(state, visible, timeSinceLastUpdate);
    } else if (!this.inViewport_ && wasInViewport) {
      // The resource went out of view. Do final calculations and reset state.
      dev().assert(state[LAST_UPDATE] > 0, 'lastUpdated time in weird state.');

      state[MAX_CONTINUOUS_TIME] = Math.max(state[MAX_CONTINUOUS_TIME],
          state[CONTINUOUS_TIME] + timeSinceLastUpdate);

      state[LAST_UPDATE] = -1;
      state[TOTAL_VISIBLE_TIME] += timeSinceLastUpdate;
      state[CONTINUOUS_TIME] = 0;  // Clear only after max is calculated above.
      state[LAST_VISIBLE_TIME] = Date.now() - state[TIME_LOADED];
    } else if (this.inViewport_ && !wasInViewport) {
      // The resource came into view. start counting.
      dev().assert(state[LAST_UPDATE] == undefined ||
          state[LAST_UPDATE] == -1, 'lastUpdated time in weird state.');
      state[FIRST_VISIBLE_TIME] = state[FIRST_VISIBLE_TIME] ||
          Date.now() - state[TIME_LOADED];
      this.setState_(state, visible, 0);
    }

    return ((triggerType && this.inViewport_) || !triggerType) &&
        (config[TOTAL_TIME_MIN] === undefined ||
            state[TOTAL_VISIBLE_TIME] >= config[TOTAL_TIME_MIN]) &&
        (config[TOTAL_TIME_MAX] === undefined ||
            state[TOTAL_VISIBLE_TIME] <= config[TOTAL_TIME_MAX]) &&
        (config[CONTINUOUS_TIME_MIN] === undefined ||
            (state[MAX_CONTINUOUS_TIME] || 0) >= config[CONTINUOUS_TIME_MIN]) &&
        (config[CONTINUOUS_TIME_MAX] === undefined ||
            (state[MAX_CONTINUOUS_TIME] || 0) <= config[CONTINUOUS_TIME_MAX]);
  }
}


export class VisibilityTracker {

  trackViaInOb(element, helper) {
    element[HELPER_PROP] = helper;

    if (!this.intersectionObserver_) {
      const onIntersectionChange = this.onIntersectionChange_.bind(this);
      this.intersectionObserver_ =
          // TODO: polyfill IntersectionObserver
          new this.ampdoc.win.IntersectionObserver(entries => {
            entries.forEach(onIntersectionChange);
          }, {threshold: DEFAULT_THRESHOLD});
    }
    this.intersectionObserver_.observe(element);

    /* QQQQ
    // Hidden trigger
    if (!shouldBeVisible && !this.visibilityListenerRegistered_) {
      this.viewer_.onVisibilityChanged(() => {
        if (!this.viewer_.isVisible()) {
          this.onDocumentHidden_();
        }
      });
    }
    */
  }

  /**
   * @param {!IntersectionObserverEntry} change
   * @private
   */
  onIntersectionChange_(change) {
    const helper = /** @type {?VisibilityHelper} */ (element[HELPER_PROP]);
    if (!helper) {
      // Has already been removed.
      return;
    }

    const visible = change.intersectionRatio * 100;
    helper.setVisible(visible, change);

    // QQQQ
    for (let c = listeners.length - 1; c >= 0; c--) {

    }

    // Remove target that have no listeners.
    if (listeners.length == 0) {
      this.intersectionObserver_.unobserve(change.target);
    }
  }

}
