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

import {dev} from '../../../src/log';


/**
 * A helper class that implements visibility calculations based on the
 * visibility ratio. It's used for documents, embeds and individual element.
 * @implements {../../../src/service.Disposable}
 */
export class VisibilityHelper {
  /**
   * @param {?VisibilityHelper} parent
   * @param {!Object<string, *>} spec
   * @param {number=} opt_iniVisibility
   * @param {boolean=} opt_factorParent
   */
  constructor(parent, spec, opt_iniVisibility, opt_factorParent) {
    /** @const @private */
    this.parent_ = parent;

    /**
     * Whether this visibility is in the intersection with parent. Thus the
     * final visibility will be this visibility times parent.
     * @const @private {boolean}
     */
    this.factorParent_ = opt_factorParent || false;

    /** @const @private */
    this.eventPromise_ = new Promise(resolve => {
      /** @private {?function()} */
      this.eventResolver_ = resolve;
    });

    /** @private {?Array<!VisibilityHelper>} */
    this.children_ = null;

    /** @private {!Array<!UnsubscribeDef>} */
    this.unsubscribe_ = [];

    // Spec.

    /** @const @private {number} */
    this.visiblePercentageMin_ =
        Number(spec['visiblePercentageMin']) / 100 || 0;

    /** @const @private {number} */
    this.visiblePercentageMax_ =
        Number(spec['visiblePercentageMax']) / 100 || 1;

    /** @const @private {time} */
    this.totalTimeMin_ = Number(spec['totalTimeMin']) || 0;

    /** @const @private {time} */
    this.totalTimeMax_ = Number(spec['totalTimeMax']) || Infinity;

    /** @const @private {time} */
    this.continuousTimeMin_ = Number(spec['continuousTimeMin']) || 0;

    /** @const @private {time} */
    this.continuousTimeMax_ = Number(spec['continuousTimeMax']) || Infinity;

    // Runtime.

    /** @const @private {time} */
    this.createdTime_ = Date.now();

    /** @private {number} */
    this.ownVisibility_ = opt_iniVisibility || 0;

    /** @private {boolean} */
    this.blocked_ = false;

    /** @private {?number} */
    this.scheduledRunId_ = null;

    /** @private {boolean} */
    this.matchesVisibility_ = false;

    /** @private {time} */
    this.continuousTime_ = 0;

    /** @private {time} */
    this.maxContinuousVisibleTime_ = 0;

    /** @private {time} */
    this.totalVisibleTime_ = 0;

    /** @private {time} */
    this.firstSeenTime_ = 0;

    /** @private {time} */
    this.lastSeenTime_ = 0;

    /** @private {time} */
    this.fistVisibleTime_ = 0;

    /** @private {time} */
    this.lastVisibleTime_ = 0;

    /** @private {time} */
    this.loadTimeVisibility_ = 0;

    /** @private {number} */
    this.minVisiblePercentage_ = 0;

    /** @private {number} */
    this.maxVisiblePercentage_ = 0;

    /** @private {time} */
    this.lastVisibleUpdateTime_ = 0;

    if (this.parent_) {
      this.parent_.addChild_(this);
    }

    if (this.getVisibility() > 0) {
      this.update();
    }
  }

  /** @override */
  dispose() {
    if (this.parent_) {
      this.parent_.removeChild_(this);
    }
    if (this.scheduledRunId_) {
      clearTimeout(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
    this.eventResolver_ = null;
  }

  /**
   * Adds the unsubscribe handler that will be called when this visibility
   * helper is destroyed.
   * @param {!UnsubscribeDef} handler
   */
  unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }

  /**
   * Adds the event handler that will be called when all visibility conditions
   * have been met.
   * @param {function()} handler
   */
  onEvent(handler) {
    this.eventPromise_.then(handler);
  }

  /**
   * Sets visibility of this object. See `getVisibility()` for the final
   * visibility calculations.
   * @param {number} visibility
   */
  setVisibility(visibility) {
    this.ownVisibility_ = visibility;
    this.update();
  }

  /**
   * Sets whether this object is blocked. Blocking means that visibility is
   * not ready to be calculated, e.g. because an element has not yet
   * sufficiently rendered. See `getVisibility()` for the final
   * visibility calculations.
   * @param {boolean} blocked
   */
  setBlocked(blocked) {
    this.blocked_ = blocked;
    this.update();
  }

  /**
   * Returns the final visibility. It depends on the following factors:
   *  1. This object's visibility.
   *  2. Whether the object is blocked.
   *  3. The parent's visibility.
   * @return {number}
   */
  getVisibility() {
    const ownVisibility = this.ownVisibility_ * (this.blocked_ ? 0 : 1);
    if (!this.parent_) {
      return ownVisibility;
    }
    if (this.factorParent_) {
      return ownVisibility * this.parent_.getVisibility();
    }
    return ownVisibility * (this.parent_.getVisibility() > 0 ? 1 : 0);
  }

  /**
   * Runs the calculation cycle.
   */
  update() {
    const visibility = this.getVisibility();
    this.update_(visibility);
    if (this.children_) {
      for (let i = 0; i < this.children_.length; i++) {
        this.children_[i].update();
      }
    }
  }

  /**
   * Returns the calculated state of visibility.
   * @param {time} startTime
   * @return {!Object<string, string|number>}
   */
  getState(startTime) {
    return {
      // Observed times, relative to the `startTime`.
      firstSeenTime: timeBase(this.firstSeenTime_, startTime),
      lastSeenTime: timeBase(this.lastSeenTime_, startTime),
      lastVisibleTime: timeBase(this.lastVisibleTime_, startTime),
      fistVisibleTime: timeBase(this.fistVisibleTime_, startTime),

      // Durations.
      maxContinuousVisibleTime: this.maxContinuousVisibleTime_,
      totalVisibleTime: this.totalVisibleTime_,

      // Visibility percents.
      loadTimeVisibility: this.loadTimeVisibility_ * 100 || 0,
      minVisiblePercentage: this.minVisiblePercentage_ * 100,
      maxVisiblePercentage: this.maxVisiblePercentage_ * 100,
    };
  }

  /**
   * @param {number} visibility
   * @private
   */
  update_(visibility) {
    if (!this.eventResolver_) {
      return;
    }
    // Update state and check if all conditions are satisfied
    const conditionsMet = this.updateCounters_(visibility);
    if (conditionsMet) {
      if (this.scheduledRunId_) {
        clearTimeout(this.scheduledRunId_);
        this.scheduledRunId_ = null;
      }
      this.eventResolver_();
    } else if (this.matchesVisibility_ && !this.scheduledRunId_) {
      // There is unmet duration condition, schedule a check
      const timeToWait = this.computeTimeToWait_();
      if (timeToWait > 0) {
        this.scheduledRunId_ = setTimeout(() => {
          this.scheduledRunId_ = null;
          this.update();
        }, timeToWait);
      }
    } else if (!this.matchesVisibility_ && this.scheduledRunId_) {
      clearTimeout(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
  }

  /**
   * @param {number} visibility
   * @return {boolean} true
   * @private
   */
  updateCounters_(visibility) {
    const now = Date.now();

    if (visibility > 0) {
      this.firstSeenTime_ = this.firstSeenTime_ || now;
      this.lastSeenTime_ = now;
      // Consider it as load time visibility if this happens within 300ms of
      // page load.
      if (!this.loadTimeVisibility_ && (now - this.createdTime_) < 300) {
        this.loadTimeVisibility_ = visibility;
      }
    }

    const prevMatchesVisibility = this.matchesVisibility_;
    const timeSinceLastUpdate =
        this.lastVisibleUpdateTime_ ? now - this.lastVisibleUpdateTime_ : 0;
    this.matchesVisibility_ = (
        visibility > this.visiblePercentageMin_ &&
        visibility <= this.visiblePercentageMax_);

    if (this.matchesVisibility_) {
      if (!prevMatchesVisibility) {
        // The resource came into view: start counting.
        dev().assert(!this.lastVisibleUpdateTime_);
        this.fistVisibleTime_ = this.fistVisibleTime_ || now;
      } else {
        // Keep counting.
        this.totalVisibleTime_ += timeSinceLastUpdate;
        this.continuousTime_ += timeSinceLastUpdate;
        this.maxContinuousVisibleTime_ =
            Math.max(this.maxContinuousVisibleTime_, this.continuousTime_);
      }
      this.lastVisibleUpdateTime_ = now;
      this.minVisiblePercentage_ =
          this.minVisiblePercentage_ > 0 ?
          Math.min(this.minVisiblePercentage_, visibility) :
          visibility;
      this.maxVisiblePercentage_ =
          Math.max(this.maxVisiblePercentage_, visibility);
      this.lastVisibleTime_ = now;
    } else if (!this.matchesVisibility_ && prevMatchesVisibility) {
      // The resource went out of view. Do final calculations and reset state.
      dev().assert(this.lastVisibleUpdateTime_ > 0);

      this.maxContinuousVisibleTime_ = Math.max(
          this.maxContinuousVisibleTime_,
          this.continuousTime_ + timeSinceLastUpdate);

      // Reset for next visibility event.
      this.lastVisibleUpdateTime_ = 0;
      this.totalVisibleTime_ += timeSinceLastUpdate;
      this.continuousTime_ = 0;  // Clear only after max is calculated above.
      this.lastVisibleTime_ = now;
    }

    return this.matchesVisibility_ &&
        (this.totalVisibleTime_ >= this.totalTimeMin_) &&
        (this.totalVisibleTime_ <= this.totalTimeMax_) &&
        (this.maxContinuousVisibleTime_ >= this.continuousTimeMin_) &&
        (this.maxContinuousVisibleTime_ <= this.continuousTimeMax_);
  }

  /**
   * Computes time, assuming the object is currently visible, that it'd take
   * it to match all timing requirements.
   * @return {time}
   * @private
   */
  computeTimeToWait_() {
    const waitForContinuousTime = Math.max(
        this.continuousTimeMin_ - this.continuousTime_, 0);
    const waitForTotalTime = Math.max(
        this.totalTimeMin_ - this.totalVisibleTime_, 0);
    const maxWaitTime = Math.max(waitForContinuousTime, waitForTotalTime);
    return Math.min(
        maxWaitTime,
        waitForContinuousTime || Infinity,
        waitForTotalTime || Infinity);
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
  }

  /**
   * @param {!VisibilityHelper} child
   * @private
   */
  removeChild_(child) {
    if (this.children_) {
      const index = this.children_.indexOf(child);
      if (index != -1) {
        this.children_.splice(index, 1);
      }
    }
  }
}


/**
 * Calculates the specified time based on the given `baseTime`.
 * @param {time} time
 * @param {time} baseTime
 * @return {time}
 */
function timeBase(time, baseTime) {
  return time >= baseTime ? time - baseTime : 0;
}
