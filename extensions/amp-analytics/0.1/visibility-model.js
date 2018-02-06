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

import {Observable} from '../../../src/observable';
import {dev} from '../../../src/log';

/**
 * This class implements visibility calculations based on the
 * visibility ratio. It's used for documents, embeds and individual element.
 * @implements {../../../src/service.Disposable}
 */
export class VisibilityModel {
  /**
   * @param {!Object<string, *>} spec
   * @param {function():number} calcVisibility
   */
  constructor(spec, calcVisibility) {
    /** @const @private */
    this.calcVisibility_ = calcVisibility;

    /**
     * Spec parameters.
     * @private {{
     *   visiblePercentageMin: number,
     *   visiblePercentageMax: number,
     *   totalTimeMin: number,
     *   totalTimeMax: number,
     *   continuousTimeMin: number,
     *   continuousTimeMax: number,
     * }}
     */
    this.spec_ = {
      visiblePercentageMin: Number(spec['visiblePercentageMin']) / 100 || 0,
      visiblePercentageMax: Number(spec['visiblePercentageMax']) / 100 || 1,
      totalTimeMin: Number(spec['totalTimeMin']) || 0,
      totalTimeMax: Number(spec['totalTimeMax']) || Infinity,
      continuousTimeMin: Number(spec['continuousTimeMin']) || 0,
      continuousTimeMax: Number(spec['continuousTimeMax']) || Infinity,
    };
    // Above, if visiblePercentageMax was not specified, assume 100%.
    // Here, do allow 0% to be the value if that is what was specified.
    if (String(spec['visiblePercentageMax']).trim() === '0') {
      this.spec_.visiblePercentageMax = 0;
    }

    /** @private {boolean} */
    this.repeat_ = spec['repeat'] === true;

    /** @private {?function()} */
    this.eventResolver_ = null;

    /** @private {?Observable} */
    this.onTriggerObservable_ = new Observable();

    /** @private */
    this.eventPromise_ = new Promise(resolve => {
      this.eventResolver_ = resolve;
    });

    this.eventPromise_.then(() => {
      this.onTriggerObservable_.fire();
    });

    /** @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    /** @const @private {time} */
    this.createdTime_ = Date.now();

    /** @private {boolean} */
    this.ready_ = true;

    /** @private {boolean} */
    this.reportReady_ = true;

    /** @private {?function():!Promise} */
    this.createReportReadyPromise_ = null;

    /** @private {?number} */
    this.scheduledUpdateTimeoutId_ = null;

    /** @private {boolean} */
    this.matchesVisibility_ = false;

    /** @private {boolean} */
    this.everMatchedVisibility_ = false;

    /** @private {time} duration in milliseconds */
    this.continuousTime_ = 0;

    /** @private {time} duration in milliseconds */
    this.maxContinuousVisibleTime_ = 0;

    /** @private {time} duration in milliseconds */
    this.totalVisibleTime_ = 0;

    /** @private {time} milliseconds since epoch */
    this.firstSeenTime_ = 0;

    /** @private {time} milliseconds since epoch */
    this.lastSeenTime_ = 0;

    /** @private {time} milliseconds since epoch */
    this.firstVisibleTime_ = 0;

    /** @private {time} milliseconds since epoch */
    this.lastVisibleTime_ = 0;

    /** @private {time} percent value in a [0, 1] range */
    this.loadTimeVisibility_ = 0;

    /** @private {number} percent value in a [0, 1] range */
    this.minVisiblePercentage_ = 0;

    /** @private {number} percent value in a [0, 1] range */
    this.maxVisiblePercentage_ = 0;

    /** @private {time} milliseconds since epoch */
    this.lastVisibleUpdateTime_ = 0;

    /** @private {boolean} */
    this.waitToReset_ = false;

    /** @private {?number} */
    this.scheduleRepeatId_ = null;
  }

  /**
   * Refresh counter on visible reset.
   * TODO: Right now all state value are scoped state values that gets reset.
   * We may need to add support to global state values,
   * that never reset like globalTotalVisibleTime.
   * Note: loadTimeVisibility is an exception.
   * @private
   */
  reset_() {
    dev().assert(!this.eventResolver_,
        'Attempt to refresh visible event before previous one resolve');
    this.eventPromise_ = new Promise(resolve => {
      this.eventResolver_ = resolve;
    });
    this.eventPromise_.then(() => {
      this.onTriggerObservable_.fire();
    });
    this.scheduleRepeatId_ = null;
    this.everMatchedVisibility_ = false;
    this.matchesVisibility_ = false;
    this.continuousTime_ = 0;
    this.maxContinuousVisibleTime_ = 0;
    this.totalVisibleTime_ = 0;
    this.firstVisibleTime_ = 0;
    this.firstSeenTime_ = 0;
    this.lastSeenTime_ = 0;
    this.lastVisibleTime_ = 0;
    this.minVisiblePercentage_ = 0;
    this.maxVisiblePercentage_ = 0;
    this.lastVisibleUpdateTime_ = 0;
    this.waitToReset_ = false;
  }

  /**
   * Function that visibilityManager can used to dispose model or reset model
   */
  maybeDispose() {
    if (!this.repeat_) {
      this.dispose();
    }
  }

  /** @override */
  dispose() {
    if (this.scheduledUpdateTimeoutId_) {
      clearTimeout(this.scheduledUpdateTimeoutId_);
      this.scheduledUpdateTimeoutId_ = null;
    }
    if (this.scheduleRepeatId_) {
      clearTimeout(this.scheduleRepeatId_);
      this.scheduleRepeatId_ = null;
    }
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
    this.eventResolver_ = null;
    if (this.onTriggerObservable_) {
      this.onTriggerObservable_.removeAll();
      this.onTriggerObservable_ = null;
    }
  }

  /**
   * Adds the unsubscribe handler that will be called when this visibility
   * model is destroyed.
   * @param {!UnlistenDef} handler
   */
  unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }

  /**
   * Adds the event handler that will be called when all visibility conditions
   * have been met.
   * @param {function()} handler
   */
  onTriggerEvent(handler) {
    if (this.onTriggerObservable_) {
      this.onTriggerObservable_.add(handler);
    }
    if (this.eventPromise_ && !this.eventResolver_) {
      // If eventPromise has already resolved, need to call handler manually.
      handler();
    }
  }

  /**
   * Sets whether this object is ready. Ready means that visibility is
   * ready to be calculated, e.g. because an element has been
   * sufficiently rendered.
   * @param {boolean} ready
   */
  setReady(ready) {
    this.ready_ = ready;
    this.update();
  }

  /**
   * Sets that the model needs to wait on extra report ready promise
   * after all visibility conditions have been met to call report handler
   * @param {function():!Promise} callback
   */
  setReportReady(callback) {
    this.reportReady_ = false;
    this.createReportReadyPromise_ = callback;
  }

  /**
   * @return {number}
   * @private
   */
  getVisibility_() {
    return this.ready_ ? this.calcVisibility_() : 0;
  }

  /**
   * Runs the calculation cycle.
   */
  update() {
    this.update_(this.getVisibility_());
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
      firstVisibleTime: timeBase(this.firstVisibleTime_, startTime),

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
    // Update state and check if all conditions are satisfied
    if (this.waitToReset_) {
      if (!this.isVisibilityMatch_(visibility)) {
        // We were waiting for a condition to become unmet, and now it has
        this.reset_();
      }
      return;
    }
    if (!this.eventResolver_) {
      return;
    }
    const conditionsMet = this.updateCounters_(visibility);
    if (conditionsMet) {
      if (this.scheduledUpdateTimeoutId_) {
        clearTimeout(this.scheduledUpdateTimeoutId_);
        this.scheduledUpdateTimeoutId_ = null;
      }
      if (this.reportReady_) {
        // TODO(jonkeller): Can we eliminate eventResolver_?
        this.eventResolver_();
        this.eventResolver_ = null;
        if (this.repeat_) {
          this.waitToReset_ = true;
          this.continuousTime_ = 0;
        }
      } else if (this.createReportReadyPromise_) {
        // Report when report ready promise resolve
        const reportReadyPromise = this.createReportReadyPromise_();
        this.createReportReadyPromise_ = null;
        reportReadyPromise.then(() => {
          this.reportReady_ = true;
          // Need to update one more time in case time exceeds
          // maxContinuousVisibleTime.
          this.update();
        });
      }
    } else if (this.matchesVisibility_ && !this.scheduledUpdateTimeoutId_) {
      // There is unmet duration condition, schedule a check
      const timeToWait = this.computeTimeToWait_();
      if (timeToWait > 0) {
        this.scheduledUpdateTimeoutId_ = setTimeout(() => {
          this.scheduledUpdateTimeoutId_ = null;
          this.update();
        }, timeToWait);
      }
    } else if (!this.matchesVisibility_ && this.scheduledUpdateTimeoutId_) {
      clearTimeout(this.scheduledUpdateTimeoutId_);
      this.scheduledUpdateTimeoutId_ = null;
    }
  }

  /**
   * Check if visibility fall into the percentage range
   * @param {number} visibility
   * @return {boolean}
   */
  isVisibilityMatch_(visibility) {
    dev().assert(visibility >= 0 && visibility <= 1,
        'invalid visibility value: %s', visibility);
    // Special case: If visiblePercentageMin is 100%, then it doesn't make
    // sense to do the usual (min, max] since that would never be true.
    if (this.spec_.visiblePercentageMin == 1) {
      return visibility == 1;
    }
    // Special case: If visiblePercentageMax is 0%, then we
    // want to ping when the creative becomes not visible.
    if (this.spec_.visiblePercentageMax == 0) {
      return visibility == 0;
    }
    return visibility > this.spec_.visiblePercentageMin &&
        visibility <= this.spec_.visiblePercentageMax;
  }

  /**
   * @param {number} visibility
   * @return {boolean} true
   * @private
   */
  updateCounters_(visibility) {
    dev().assert(visibility >= 0 && visibility <= 1,
        'invalid visibility value: %s', visibility);
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
    this.matchesVisibility_ = this.isVisibilityMatch_(visibility);
    if (this.matchesVisibility_) {
      this.everMatchedVisibility_ = true;
      if (prevMatchesVisibility) {
        // Keep counting.
        this.totalVisibleTime_ += timeSinceLastUpdate;
        this.continuousTime_ += timeSinceLastUpdate;
        this.maxContinuousVisibleTime_ =
            Math.max(this.maxContinuousVisibleTime_, this.continuousTime_);
      } else {
        // The resource came into view: start counting.
        dev().assert(!this.lastVisibleUpdateTime_);
        this.firstVisibleTime_ = this.firstVisibleTime_ || now;
      }
      this.lastVisibleUpdateTime_ = now;
      this.minVisiblePercentage_ =
          this.minVisiblePercentage_ > 0 ?
            Math.min(this.minVisiblePercentage_, visibility) :
            visibility;
      this.maxVisiblePercentage_ =
          Math.max(this.maxVisiblePercentage_, visibility);
      this.lastVisibleTime_ = now;
    } else if (prevMatchesVisibility) {
      // The resource went out of view. Do final calculations and reset state.
      dev().assert(this.lastVisibleUpdateTime_ > 0);

      this.maxContinuousVisibleTime_ = Math.max(
          this.maxContinuousVisibleTime_,
          this.continuousTime_ + timeSinceLastUpdate);

      // Reset for next visibility event.
      this.lastVisibleUpdateTime_ = 0;
      this.totalVisibleTime_ += timeSinceLastUpdate;
      this.continuousTime_ = 0; // Clear only after max is calculated above.
      this.lastVisibleTime_ = now;
    }

    return this.everMatchedVisibility_ &&
        (this.totalVisibleTime_ >= this.spec_.totalTimeMin) &&
        (this.totalVisibleTime_ <= this.spec_.totalTimeMax) &&
        (this.maxContinuousVisibleTime_ >= this.spec_.continuousTimeMin) &&
        (this.maxContinuousVisibleTime_ <= this.spec_.continuousTimeMax);
  }

  /**
   * Computes time, assuming the object is currently visible, that it'd take
   * it to match all timing requirements.
   * @return {time}
   * @private
   */
  computeTimeToWait_() {
    const waitForContinuousTime = Math.max(
        this.spec_.continuousTimeMin - this.continuousTime_, 0);
    const waitForTotalTime = Math.max(
        this.spec_.totalTimeMin - this.totalVisibleTime_, 0);
    const maxWaitTime = Math.max(waitForContinuousTime, waitForTotalTime);
    return Math.min(
        maxWaitTime,
        waitForContinuousTime || Infinity,
        waitForTotalTime || Infinity);
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
