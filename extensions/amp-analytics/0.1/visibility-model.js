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

import {dev, user} from '../../../src/log';
import {isFiniteNumber} from '../../../src/types';
import {Observable} from '../../../src/observable';

const MIN_RESET_INTERVAL = 200;


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

    /** @private {boolean} */
    this.reset_ = false;

    /** @private {?number} */
    this.resetInterval_ = null;

    let reset = spec['reset'];
    if (reset === true) {
      this.reset_ = true;
    } else {
      reset = Number(spec['reset']);
      if (isFiniteNumber(reset)) {
        const resetInterval = Math.max(
            this.spec_.totalTimeMin,
            this.spec_.continuousTimeMin,
            reset);
        if (resetInterval >= MIN_RESET_INTERVAL) {
          this.reset_ = true;
          this.resetInterval_ = resetInterval;
        } else {
          user().error(
              'AMP-ANALYTICS',
              `Cannot reset with interval less than ${MIN_RESET_INTERVAL}, ` +
              ' reset set to false');
        }
      }
    }

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
    this.scheduledRunId_ = null;

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
    this.waitToRefresh_ = false;

    /** @private {?number} */
    this.scheduleResetId_ = null;
  }

  /**
   * Refresh counter on visible reset.
   * TODO: Right now all state value are scoped state values that gets reset.
   * We may need to add support to global state values,
   * that never reset like globalTotalVisibleTime.
   * Note: loadTimeVisibility is an exception.
   * @private
   */
  refresh_() {
    dev().assert(!this.eventResolver_,
        'Attempt to refresh visible event before previous one resolve');
    this.eventPromise_ = new Promise(resolve => {
      this.eventResolver_ = resolve;
    });
    this.eventPromise_.then(() => {
      this.onTriggerObservable_.fire();
    });
    this.waitToRefresh_ = false;
    this.scheduleResetId_ = null;
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
    this.waitToRefresh_ = false;
  }

  /**
   * Function that visibilityManager can used to dispose model or reset model
   */
  disposeOrReset() {
    // We may need a maxIntervalWindow to stop visible event even with reset true
    if (!this.reset_) {
      this.dispose();
      return;
    }
    if (this.resetInterval_) {
      const now = Date.now();
      const interval = now - this.firstVisibleTime_;

      // Unit in milliseconds
      const timeUntilReset = Math.max(0, this.resetInterval_ - interval);
      this.ready_ = false;
      dev().assert(!this.scheduleResetId_, 'Should not reset twice');
      this.scheduleResetId_ = setTimeout(() => {
        this.refresh_();
        this.setReady(true);
      }, timeUntilReset);
    } else {
      // Reset after element falls out of (minPercentage, maxPercentage]
      this.waitToRefresh_ = true;
    }
  }

  /** @override */
  dispose() {
    if (this.scheduledRunId_) {
      clearTimeout(this.scheduledRunId_);
      this.scheduledRunId_ = null;
    }
    if (this.scheduleResetId_) {
      clearTimeout(this.scheduleResetId_);
      this.scheduleResetId_ = null;
    }
    this.unsubscribe_.forEach(unsubscribe => {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
    this.eventResolver_ = null;
    this.onTriggerObservable_.removeAll();
    this.onTriggerObservable_ = null;
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
    this.onTriggerObservable_.add(handler);
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
   * @param {!function():!Promise} callback
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
    if (this.waitToRefresh_) {
      if (!this.isVisibilityMatch_(visibility)) {
        this.refresh_();
      }
      return;
    }
    if (!this.eventResolver_) {
      return;
    }
    const conditionsMet = this.updateCounters_(visibility);
    if (conditionsMet) {
      if (this.scheduledRunId_) {
        clearTimeout(this.scheduledRunId_);
        this.scheduledRunId_ = null;
      }
      if (this.reportReady_) {
        this.eventResolver_();
        this.eventResolver_ = null;
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
   * Check if visibility fall into the percentage range
   * @param {number} visibility
   * @return {boolean}
   */
  isVisibilityMatch_(visibility) {
    dev().assert(visibility >= 0 && visibility <= 1,
        'invalid visibility value: %s', visibility);
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
      this.continuousTime_ = 0;  // Clear only after max is calculated above.
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
