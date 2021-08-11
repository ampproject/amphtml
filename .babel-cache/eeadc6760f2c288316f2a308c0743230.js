function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Deferred } from "../../../src/core/data-structures/promise";
import { Observable } from "../../../src/core/data-structures/observable";
import { devAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";

/**
 * This class implements visibility calculations based on the
 * visibility ratio. It's used for documents, embeds and individual element.
 * @implements {../../../src/service.Disposable}
 */
export var VisibilityModel = /*#__PURE__*/function () {
  /**
   * @param {!JsonObject} spec
   * @param {function():number} calcVisibility
   */
  function VisibilityModel(spec, calcVisibility) {
    var _this = this;

    _classCallCheck(this, VisibilityModel);

    /** @const @private */
    this.calcVisibility_ = calcVisibility;

    /**
     * Spec parameters.
     * @private {!JsonObject}
     */
    this.spec_ = dict({
      'visiblePercentageMin': Number(spec['visiblePercentageMin']) / 100 || 0,
      'visiblePercentageMax': Number(spec['visiblePercentageMax']) / 100 || 1,
      'totalTimeMin': Number(spec['totalTimeMin']) || 0,
      'totalTimeMax': Number(spec['totalTimeMax']) || Infinity,
      'continuousTimeMin': Number(spec['continuousTimeMin']) || 0,
      'continuousTimeMax': Number(spec['continuousTimeMax']) || Infinity
    });

    // Above, if visiblePercentageMax was not specified, assume 100%.
    // Here, do allow 0% to be the value if that is what was specified.
    if (String(spec['visiblePercentageMax']).trim() === '0') {
      this.spec_['visiblePercentageMax'] = 0;
    }

    /**
     * Accumulate visibility counters but do not fire the trigger until the
     * ready promise resolves.
     * @private @const {boolean}
     */
    this.ignoreVisibilityForReport_ = spec['reportWhen'] !== undefined;

    /** @private {boolean} */
    this.repeat_ = spec['repeat'] === true;

    /** @private {?Observable} */
    this.onTriggerObservable_ = new Observable();
    var deferred = new Deferred();

    /** @private */
    this.eventPromise_ = deferred.promise;

    /** @private {?function()} */
    this.eventResolver_ = deferred.resolve;
    this.eventPromise_.then(function () {
      _this.onTriggerObservable_.fire();
    });

    /** @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    /** @const @private {time} */
    this.createdTime_ = Date.now();
    // TODO(warrengm): Consider refactoring so that the ready defaults are
    // false.

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

    /** @private {number} Scroll position at ini-load time */
    this.initialScrollDepth_ = 0;

    /**
     * @private {boolean} Whether scroll position at ini-load time has
     * been set
     */
    this.initialScrollDepthAlreadySet_ = false;

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
  _createClass(VisibilityModel, [{
    key: "reset_",
    value: function reset_() {
      var _this2 = this;

      devAssert(!this.eventResolver_, 'Attempt to refresh visible event before previous one resolve');
      var deferred = new Deferred();
      this.eventPromise_ = deferred.promise;
      this.eventResolver_ = deferred.resolve;
      this.eventPromise_.then(function () {
        _this2.onTriggerObservable_.fire();
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

  }, {
    key: "maybeDispose",
    value: function maybeDispose() {
      if (!this.repeat_) {
        this.dispose();
      }
    }
    /** @override */

  }, {
    key: "dispose",
    value: function dispose() {
      if (this.scheduledUpdateTimeoutId_) {
        clearTimeout(this.scheduledUpdateTimeoutId_);
        this.scheduledUpdateTimeoutId_ = null;
      }

      if (this.scheduleRepeatId_) {
        clearTimeout(this.scheduleRepeatId_);
        this.scheduleRepeatId_ = null;
      }

      this.unsubscribe_.forEach(function (unsubscribe) {
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

  }, {
    key: "unsubscribe",
    value: function unsubscribe(handler) {
      this.unsubscribe_.push(handler);
    }
    /**
     * Adds the event handler that will be called when all visibility conditions
     * have been met.
     * @param {function()} handler
     */

  }, {
    key: "onTriggerEvent",
    value: function onTriggerEvent(handler) {
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

  }, {
    key: "setReady",
    value: function setReady(ready) {
      this.ready_ = ready;
      this.update();
    }
    /**
     * Sets that the model needs to wait on extra report ready promise
     * after all visibility conditions have been met to call report handler
     * @param {function():!Promise} callback
     */

  }, {
    key: "setReportReady",
    value: function setReportReady(callback) {
      this.reportReady_ = false;
      this.createReportReadyPromise_ = callback;
    }
    /**
     * @return {number}
     * @private
     */

  }, {
    key: "getVisibility_",
    value: function getVisibility_() {
      return this.ready_ ? this.calcVisibility_() : 0;
    }
    /**
     * Runs the calculation cycle.
     */

  }, {
    key: "update",
    value: function update() {
      this.update_(this.getVisibility_());
    }
    /**
     * Returns the calculated state of visibility.
     * @param {time} startTime
     * @return {!JsonObject}
     */

  }, {
    key: "getState",
    value: function getState(startTime) {
      return dict({
        // Observed times, relative to the `startTime`.
        'firstSeenTime': timeBase(this.firstSeenTime_, startTime),
        'lastSeenTime': timeBase(this.lastSeenTime_, startTime),
        'lastVisibleTime': timeBase(this.lastVisibleTime_, startTime),
        'firstVisibleTime': timeBase(this.firstVisibleTime_, startTime),
        // Durations.
        'maxContinuousVisibleTime': this.maxContinuousVisibleTime_,
        'totalVisibleTime': this.totalVisibleTime_,
        // Visibility percents.
        'loadTimeVisibility': this.loadTimeVisibility_ * 100 || 0,
        'minVisiblePercentage': this.minVisiblePercentage_ * 100,
        'maxVisiblePercentage': this.maxVisiblePercentage_ * 100
      });
    }
    /**
     * @param {number} visibility
     * @private
     */

  }, {
    key: "update_",
    value: function update_(visibility) {
      var _this3 = this;

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

      // When ignoreVisibilityForReport_ is true, we update counters but fire the
      // event when the report ready promise is resolved.
      var conditionsMet = this.updateCounters_(visibility) || this.ignoreVisibilityForReport_;

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
          var reportReadyPromise = this.createReportReadyPromise_();
          this.createReportReadyPromise_ = null;
          reportReadyPromise.then(function () {
            _this3.reportReady_ = true;

            // Need to update one more time in case time exceeds
            // maxContinuousVisibleTime.
            _this3.update();
          });
        }
      } else if (this.matchesVisibility_ && !this.scheduledUpdateTimeoutId_) {
        // There is unmet duration condition, schedule a check
        var timeToWait = this.computeTimeToWait_();

        if (timeToWait > 0) {
          this.scheduledUpdateTimeoutId_ = setTimeout(function () {
            _this3.scheduledUpdateTimeoutId_ = null;

            _this3.update();
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

  }, {
    key: "isVisibilityMatch_",
    value: function isVisibilityMatch_(visibility) {
      devAssert(visibility >= 0 && visibility <= 1, 'invalid visibility value: %s', visibility);

      // Special case: If visiblePercentageMin is 100%, then it doesn't make
      // sense to do the usual (min, max] since that would never be true.
      if (this.spec_['visiblePercentageMin'] == 1) {
        return visibility == 1;
      }

      // Special case: If visiblePercentageMax is 0%, then we
      // want to ping when the creative becomes not visible.
      if (this.spec_['visiblePercentageMax'] == 0) {
        return visibility == 0;
      }

      return visibility > this.spec_['visiblePercentageMin'] && visibility <= this.spec_['visiblePercentageMax'];
    }
    /**
     * @param {number} visibility
     * @return {boolean} true
     * @private
     */

  }, {
    key: "updateCounters_",
    value: function updateCounters_(visibility) {
      devAssert(visibility >= 0 && visibility <= 1, 'invalid visibility value: %s', visibility);
      var now = Date.now();

      if (visibility > 0) {
        this.firstSeenTime_ = this.firstSeenTime_ || now;
        this.lastSeenTime_ = now;

        // Consider it as load time visibility if this happens within 300ms of
        // page load.
        if (!this.loadTimeVisibility_ && now - this.createdTime_ < 300) {
          this.loadTimeVisibility_ = visibility;
        }
      }

      var prevMatchesVisibility = this.matchesVisibility_;
      var timeSinceLastUpdate = this.lastVisibleUpdateTime_ ? now - this.lastVisibleUpdateTime_ : 0;
      this.matchesVisibility_ = this.isVisibilityMatch_(visibility);

      if (this.matchesVisibility_) {
        this.everMatchedVisibility_ = true;

        if (prevMatchesVisibility) {
          // Keep counting.
          this.totalVisibleTime_ += timeSinceLastUpdate;
          this.continuousTime_ += timeSinceLastUpdate;
          this.maxContinuousVisibleTime_ = Math.max(this.maxContinuousVisibleTime_, this.continuousTime_);
        } else {
          // The resource came into view: start counting.
          devAssert(!this.lastVisibleUpdateTime_);
          this.firstVisibleTime_ = this.firstVisibleTime_ || now;
        }

        this.lastVisibleUpdateTime_ = now;
        this.minVisiblePercentage_ = this.minVisiblePercentage_ > 0 ? Math.min(this.minVisiblePercentage_, visibility) : visibility;
        this.maxVisiblePercentage_ = Math.max(this.maxVisiblePercentage_, visibility);
        this.lastVisibleTime_ = now;
      } else if (prevMatchesVisibility) {
        // The resource went out of view. Do final calculations and reset state.
        devAssert(this.lastVisibleUpdateTime_ > 0);
        this.maxContinuousVisibleTime_ = Math.max(this.maxContinuousVisibleTime_, this.continuousTime_ + timeSinceLastUpdate);
        // Reset for next visibility event.
        this.lastVisibleUpdateTime_ = 0;
        this.totalVisibleTime_ += timeSinceLastUpdate;
        this.continuousTime_ = 0;
        // Clear only after max is calculated above.
        this.lastVisibleTime_ = now;
      }

      return this.everMatchedVisibility_ && this.totalVisibleTime_ >= this.spec_['totalTimeMin'] && this.totalVisibleTime_ <= this.spec_['totalTimeMax'] && this.maxContinuousVisibleTime_ >= this.spec_['continuousTimeMin'] && this.maxContinuousVisibleTime_ <= this.spec_['continuousTimeMax'];
    }
    /**
     * Set the amount that the user had scrolled down the page at the time of
     * page loading.
     * @param {number} depth
     */

  }, {
    key: "maybeSetInitialScrollDepth",
    value: function maybeSetInitialScrollDepth(depth) {
      if (!this.initialScrollDepthAlreadySet_) {
        this.initialScrollDepth_ = depth;
        this.initialScrollDepthAlreadySet_ = true;
      }
    }
    /**
     * Gets the amount that the user had scrolled down the page, at the time of
     * ini-load.
     * @return {number} depth
     */

  }, {
    key: "getInitialScrollDepth",
    value: function getInitialScrollDepth() {
      return this.initialScrollDepth_;
    }
    /**
     * Computes time, assuming the object is currently visible, that it'd take
     * it to match all timing requirements.
     * @return {time}
     * @private
     */

  }, {
    key: "computeTimeToWait_",
    value: function computeTimeToWait_() {
      var waitForContinuousTime = Math.max(this.spec_['continuousTimeMin'] - this.continuousTime_, 0);
      var waitForTotalTime = Math.max(this.spec_['totalTimeMin'] - this.totalVisibleTime_, 0);
      var maxWaitTime = Math.max(waitForContinuousTime, waitForTotalTime);
      return Math.min(maxWaitTime, waitForContinuousTime || Infinity, waitForTotalTime || Infinity);
    }
  }]);

  return VisibilityModel;
}();

/**
 * Calculates the specified time based on the given `baseTime`.
 * @param {time} time
 * @param {time} baseTime
 * @return {time}
 */
function timeBase(time, baseTime) {
  return time >= baseTime ? time - baseTime : 0;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpc2liaWxpdHktbW9kZWwuanMiXSwibmFtZXMiOlsiRGVmZXJyZWQiLCJPYnNlcnZhYmxlIiwiZGV2QXNzZXJ0IiwiZGljdCIsIlZpc2liaWxpdHlNb2RlbCIsInNwZWMiLCJjYWxjVmlzaWJpbGl0eSIsImNhbGNWaXNpYmlsaXR5XyIsInNwZWNfIiwiTnVtYmVyIiwiSW5maW5pdHkiLCJTdHJpbmciLCJ0cmltIiwiaWdub3JlVmlzaWJpbGl0eUZvclJlcG9ydF8iLCJ1bmRlZmluZWQiLCJyZXBlYXRfIiwib25UcmlnZ2VyT2JzZXJ2YWJsZV8iLCJkZWZlcnJlZCIsImV2ZW50UHJvbWlzZV8iLCJwcm9taXNlIiwiZXZlbnRSZXNvbHZlcl8iLCJyZXNvbHZlIiwidGhlbiIsImZpcmUiLCJ1bnN1YnNjcmliZV8iLCJjcmVhdGVkVGltZV8iLCJEYXRlIiwibm93IiwicmVhZHlfIiwicmVwb3J0UmVhZHlfIiwiY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlXyIsInNjaGVkdWxlZFVwZGF0ZVRpbWVvdXRJZF8iLCJtYXRjaGVzVmlzaWJpbGl0eV8iLCJldmVyTWF0Y2hlZFZpc2liaWxpdHlfIiwiY29udGludW91c1RpbWVfIiwibWF4Q29udGludW91c1Zpc2libGVUaW1lXyIsInRvdGFsVmlzaWJsZVRpbWVfIiwiZmlyc3RTZWVuVGltZV8iLCJsYXN0U2VlblRpbWVfIiwiZmlyc3RWaXNpYmxlVGltZV8iLCJsYXN0VmlzaWJsZVRpbWVfIiwibG9hZFRpbWVWaXNpYmlsaXR5XyIsIm1pblZpc2libGVQZXJjZW50YWdlXyIsIm1heFZpc2libGVQZXJjZW50YWdlXyIsImxhc3RWaXNpYmxlVXBkYXRlVGltZV8iLCJpbml0aWFsU2Nyb2xsRGVwdGhfIiwiaW5pdGlhbFNjcm9sbERlcHRoQWxyZWFkeVNldF8iLCJ3YWl0VG9SZXNldF8iLCJzY2hlZHVsZVJlcGVhdElkXyIsImRpc3Bvc2UiLCJjbGVhclRpbWVvdXQiLCJmb3JFYWNoIiwidW5zdWJzY3JpYmUiLCJsZW5ndGgiLCJyZW1vdmVBbGwiLCJoYW5kbGVyIiwicHVzaCIsImFkZCIsInJlYWR5IiwidXBkYXRlIiwiY2FsbGJhY2siLCJ1cGRhdGVfIiwiZ2V0VmlzaWJpbGl0eV8iLCJzdGFydFRpbWUiLCJ0aW1lQmFzZSIsInZpc2liaWxpdHkiLCJpc1Zpc2liaWxpdHlNYXRjaF8iLCJyZXNldF8iLCJjb25kaXRpb25zTWV0IiwidXBkYXRlQ291bnRlcnNfIiwicmVwb3J0UmVhZHlQcm9taXNlIiwidGltZVRvV2FpdCIsImNvbXB1dGVUaW1lVG9XYWl0XyIsInNldFRpbWVvdXQiLCJwcmV2TWF0Y2hlc1Zpc2liaWxpdHkiLCJ0aW1lU2luY2VMYXN0VXBkYXRlIiwiTWF0aCIsIm1heCIsIm1pbiIsImRlcHRoIiwid2FpdEZvckNvbnRpbnVvdXNUaW1lIiwid2FpdEZvclRvdGFsVGltZSIsIm1heFdhaXRUaW1lIiwidGltZSIsImJhc2VUaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsVUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxJQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxlQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSwyQkFBWUMsSUFBWixFQUFrQkMsY0FBbEIsRUFBa0M7QUFBQTs7QUFBQTs7QUFDaEM7QUFDQSxTQUFLQyxlQUFMLEdBQXVCRCxjQUF2Qjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNJLFNBQUtFLEtBQUwsR0FBYUwsSUFBSSxDQUFDO0FBQ2hCLDhCQUF3Qk0sTUFBTSxDQUFDSixJQUFJLENBQUMsc0JBQUQsQ0FBTCxDQUFOLEdBQXVDLEdBQXZDLElBQThDLENBRHREO0FBRWhCLDhCQUF3QkksTUFBTSxDQUFDSixJQUFJLENBQUMsc0JBQUQsQ0FBTCxDQUFOLEdBQXVDLEdB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QUE1Y0E7QUFBQTtBQUFBLFdBNmNFLGlDQUF3QjtBQUN0QixhQUFPLEtBQUtELG1CQUFaO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdGRBO0FBQUE7QUFBQSxXQXVkRSw4QkFBcUI7QUFDbkIsVUFBTW1DLHFCQUFxQixHQUFHSixJQUFJLENBQUNDLEdBQUwsQ0FDNUIsS0FBS3JFLEtBQUwsQ0FBVyxtQkFBWCxJQUFrQyxLQUFLMEIsZUFEWCxFQUU1QixDQUY0QixDQUE5QjtBQUlBLFVBQU0rQyxnQkFBZ0IsR0FBR0wsSUFBSSxDQUFDQyxHQUFMLENBQ3ZCLEtBQUtyRSxLQUFMLENBQVcsY0FBWCxJQUE2QixLQUFLNEIsaUJBRFgsRUFFdkIsQ0FGdUIsQ0FBekI7QUFJQSxVQUFNOEMsV0FBVyxHQUFHTixJQUFJLENBQUNDLEdBQUwsQ0FBU0cscUJBQVQsRUFBZ0NDLGdCQUFoQyxDQUFwQjtBQUNBLGFBQU9MLElBQUksQ0FBQ0UsR0FBTCxDQUNMSSxXQURLLEVBRUxGLHFCQUFxQixJQUFJdEUsUUFGcEIsRUFHTHVFLGdCQUFnQixJQUFJdkUsUUFIZixDQUFQO0FBS0Q7QUF0ZUg7O0FBQUE7QUFBQTs7QUF5ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU3NELFFBQVQsQ0FBa0JtQixJQUFsQixFQUF3QkMsUUFBeEIsRUFBa0M7QUFDaEMsU0FBT0QsSUFBSSxJQUFJQyxRQUFSLEdBQW1CRCxJQUFJLEdBQUdDLFFBQTFCLEdBQXFDLENBQTVDO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBpbXBsZW1lbnRzIHZpc2liaWxpdHkgY2FsY3VsYXRpb25zIGJhc2VkIG9uIHRoZVxuICogdmlzaWJpbGl0eSByYXRpby4gSXQncyB1c2VkIGZvciBkb2N1bWVudHMsIGVtYmVkcyBhbmQgaW5kaXZpZHVhbCBlbGVtZW50LlxuICogQGltcGxlbWVudHMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlLkRpc3Bvc2FibGV9XG4gKi9cbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5TW9kZWwge1xuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gc3BlY1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6bnVtYmVyfSBjYWxjVmlzaWJpbGl0eVxuICAgKi9cbiAgY29uc3RydWN0b3Ioc3BlYywgY2FsY1Zpc2liaWxpdHkpIHtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5jYWxjVmlzaWJpbGl0eV8gPSBjYWxjVmlzaWJpbGl0eTtcblxuICAgIC8qKlxuICAgICAqIFNwZWMgcGFyYW1ldGVycy5cbiAgICAgKiBAcHJpdmF0ZSB7IUpzb25PYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5zcGVjXyA9IGRpY3Qoe1xuICAgICAgJ3Zpc2libGVQZXJjZW50YWdlTWluJzogTnVtYmVyKHNwZWNbJ3Zpc2libGVQZXJjZW50YWdlTWluJ10pIC8gMTAwIHx8IDAsXG4gICAgICAndmlzaWJsZVBlcmNlbnRhZ2VNYXgnOiBOdW1iZXIoc3BlY1sndmlzaWJsZVBlcmNlbnRhZ2VNYXgnXSkgLyAxMDAgfHwgMSxcbiAgICAgICd0b3RhbFRpbWVNaW4nOiBOdW1iZXIoc3BlY1sndG90YWxUaW1lTWluJ10pIHx8IDAsXG4gICAgICAndG90YWxUaW1lTWF4JzogTnVtYmVyKHNwZWNbJ3RvdGFsVGltZU1heCddKSB8fCBJbmZpbml0eSxcbiAgICAgICdjb250aW51b3VzVGltZU1pbic6IE51bWJlcihzcGVjWydjb250aW51b3VzVGltZU1pbiddKSB8fCAwLFxuICAgICAgJ2NvbnRpbnVvdXNUaW1lTWF4JzogTnVtYmVyKHNwZWNbJ2NvbnRpbnVvdXNUaW1lTWF4J10pIHx8IEluZmluaXR5LFxuICAgIH0pO1xuICAgIC8vIEFib3ZlLCBpZiB2aXNpYmxlUGVyY2VudGFnZU1heCB3YXMgbm90IHNwZWNpZmllZCwgYXNzdW1lIDEwMCUuXG4gICAgLy8gSGVyZSwgZG8gYWxsb3cgMCUgdG8gYmUgdGhlIHZhbHVlIGlmIHRoYXQgaXMgd2hhdCB3YXMgc3BlY2lmaWVkLlxuICAgIGlmIChTdHJpbmcoc3BlY1sndmlzaWJsZVBlcmNlbnRhZ2VNYXgnXSkudHJpbSgpID09PSAnMCcpIHtcbiAgICAgIHRoaXMuc3BlY19bJ3Zpc2libGVQZXJjZW50YWdlTWF4J10gPSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY3VtdWxhdGUgdmlzaWJpbGl0eSBjb3VudGVycyBidXQgZG8gbm90IGZpcmUgdGhlIHRyaWdnZXIgdW50aWwgdGhlXG4gICAgICogcmVhZHkgcHJvbWlzZSByZXNvbHZlcy5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pZ25vcmVWaXNpYmlsaXR5Rm9yUmVwb3J0XyA9IHNwZWNbJ3JlcG9ydFdoZW4nXSAhPT0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMucmVwZWF0XyA9IHNwZWNbJ3JlcGVhdCddID09PSB0cnVlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/T2JzZXJ2YWJsZX0gKi9cbiAgICB0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLmV2ZW50UHJvbWlzZV8gPSBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmV2ZW50UmVzb2x2ZXJfID0gZGVmZXJyZWQucmVzb2x2ZTtcblxuICAgIHRoaXMuZXZlbnRQcm9taXNlXy50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMub25UcmlnZ2VyT2JzZXJ2YWJsZV8uZmlyZSgpO1xuICAgIH0pO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IVVubGlzdGVuRGVmPn0gKi9cbiAgICB0aGlzLnVuc3Vic2NyaWJlXyA9IFtdO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7dGltZX0gKi9cbiAgICB0aGlzLmNyZWF0ZWRUaW1lXyA9IERhdGUubm93KCk7XG5cbiAgICAvLyBUT0RPKHdhcnJlbmdtKTogQ29uc2lkZXIgcmVmYWN0b3Jpbmcgc28gdGhhdCB0aGUgcmVhZHkgZGVmYXVsdHMgYXJlXG4gICAgLy8gZmFsc2UuXG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5yZWFkeV8gPSB0cnVlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMucmVwb3J0UmVhZHlfID0gdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCk6IVByb21pc2V9ICovXG4gICAgdGhpcy5jcmVhdGVSZXBvcnRSZWFkeVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLnNjaGVkdWxlZFVwZGF0ZVRpbWVvdXRJZF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMubWF0Y2hlc1Zpc2liaWxpdHlfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5ldmVyTWF0Y2hlZFZpc2liaWxpdHlfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge3RpbWV9IGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIHRoaXMuY29udGludW91c1RpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzICovXG4gICAgdGhpcy5tYXhDb250aW51b3VzVmlzaWJsZVRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzICovXG4gICAgdGhpcy50b3RhbFZpc2libGVUaW1lXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge3RpbWV9IG1pbGxpc2Vjb25kcyBzaW5jZSBlcG9jaCAqL1xuICAgIHRoaXMuZmlyc3RTZWVuVGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSBtaWxsaXNlY29uZHMgc2luY2UgZXBvY2ggKi9cbiAgICB0aGlzLmxhc3RTZWVuVGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSBtaWxsaXNlY29uZHMgc2luY2UgZXBvY2ggKi9cbiAgICB0aGlzLmZpcnN0VmlzaWJsZVRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gbWlsbGlzZWNvbmRzIHNpbmNlIGVwb2NoICovXG4gICAgdGhpcy5sYXN0VmlzaWJsZVRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gcGVyY2VudCB2YWx1ZSBpbiBhIFswLCAxXSByYW5nZSAqL1xuICAgIHRoaXMubG9hZFRpbWVWaXNpYmlsaXR5XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gcGVyY2VudCB2YWx1ZSBpbiBhIFswLCAxXSByYW5nZSAqL1xuICAgIHRoaXMubWluVmlzaWJsZVBlcmNlbnRhZ2VfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSBwZXJjZW50IHZhbHVlIGluIGEgWzAsIDFdIHJhbmdlICovXG4gICAgdGhpcy5tYXhWaXNpYmxlUGVyY2VudGFnZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSBtaWxsaXNlY29uZHMgc2luY2UgZXBvY2ggKi9cbiAgICB0aGlzLmxhc3RWaXNpYmxlVXBkYXRlVGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9IFNjcm9sbCBwb3NpdGlvbiBhdCBpbmktbG9hZCB0aW1lICovXG4gICAgdGhpcy5pbml0aWFsU2Nyb2xsRGVwdGhfID0gMDtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHNjcm9sbCBwb3NpdGlvbiBhdCBpbmktbG9hZCB0aW1lIGhhc1xuICAgICAqIGJlZW4gc2V0XG4gICAgICovXG4gICAgdGhpcy5pbml0aWFsU2Nyb2xsRGVwdGhBbHJlYWR5U2V0XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMud2FpdFRvUmVzZXRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez9udW1iZXJ9ICovXG4gICAgdGhpcy5zY2hlZHVsZVJlcGVhdElkXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVmcmVzaCBjb3VudGVyIG9uIHZpc2libGUgcmVzZXQuXG4gICAqIFRPRE86IFJpZ2h0IG5vdyBhbGwgc3RhdGUgdmFsdWUgYXJlIHNjb3BlZCBzdGF0ZSB2YWx1ZXMgdGhhdCBnZXRzIHJlc2V0LlxuICAgKiBXZSBtYXkgbmVlZCB0byBhZGQgc3VwcG9ydCB0byBnbG9iYWwgc3RhdGUgdmFsdWVzLFxuICAgKiB0aGF0IG5ldmVyIHJlc2V0IGxpa2UgZ2xvYmFsVG90YWxWaXNpYmxlVGltZS5cbiAgICogTm90ZTogbG9hZFRpbWVWaXNpYmlsaXR5IGlzIGFuIGV4Y2VwdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc2V0XygpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICAhdGhpcy5ldmVudFJlc29sdmVyXyxcbiAgICAgICdBdHRlbXB0IHRvIHJlZnJlc2ggdmlzaWJsZSBldmVudCBiZWZvcmUgcHJldmlvdXMgb25lIHJlc29sdmUnXG4gICAgKTtcbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIHRoaXMuZXZlbnRQcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgdGhpcy5ldmVudFJlc29sdmVyXyA9IGRlZmVycmVkLnJlc29sdmU7XG5cbiAgICB0aGlzLmV2ZW50UHJvbWlzZV8udGhlbigoKSA9PiB7XG4gICAgICB0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfLmZpcmUoKTtcbiAgICB9KTtcbiAgICB0aGlzLnNjaGVkdWxlUmVwZWF0SWRfID0gbnVsbDtcbiAgICB0aGlzLmV2ZXJNYXRjaGVkVmlzaWJpbGl0eV8gPSBmYWxzZTtcbiAgICB0aGlzLm1hdGNoZXNWaXNpYmlsaXR5XyA9IGZhbHNlO1xuICAgIHRoaXMuY29udGludW91c1RpbWVfID0gMDtcbiAgICB0aGlzLm1heENvbnRpbnVvdXNWaXNpYmxlVGltZV8gPSAwO1xuICAgIHRoaXMudG90YWxWaXNpYmxlVGltZV8gPSAwO1xuICAgIHRoaXMuZmlyc3RWaXNpYmxlVGltZV8gPSAwO1xuICAgIHRoaXMuZmlyc3RTZWVuVGltZV8gPSAwO1xuICAgIHRoaXMubGFzdFNlZW5UaW1lXyA9IDA7XG4gICAgdGhpcy5sYXN0VmlzaWJsZVRpbWVfID0gMDtcbiAgICB0aGlzLm1pblZpc2libGVQZXJjZW50YWdlXyA9IDA7XG4gICAgdGhpcy5tYXhWaXNpYmxlUGVyY2VudGFnZV8gPSAwO1xuICAgIHRoaXMubGFzdFZpc2libGVVcGRhdGVUaW1lXyA9IDA7XG4gICAgdGhpcy53YWl0VG9SZXNldF8gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHZpc2liaWxpdHlNYW5hZ2VyIGNhbiB1c2VkIHRvIGRpc3Bvc2UgbW9kZWwgb3IgcmVzZXQgbW9kZWxcbiAgICovXG4gIG1heWJlRGlzcG9zZSgpIHtcbiAgICBpZiAoIXRoaXMucmVwZWF0Xykge1xuICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLnNjaGVkdWxlZFVwZGF0ZVRpbWVvdXRJZF8pIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlZFVwZGF0ZVRpbWVvdXRJZF8pO1xuICAgICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2NoZWR1bGVSZXBlYXRJZF8pIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlUmVwZWF0SWRfKTtcbiAgICAgIHRoaXMuc2NoZWR1bGVSZXBlYXRJZF8gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnVuc3Vic2NyaWJlXy5mb3JFYWNoKCh1bnN1YnNjcmliZSkgPT4ge1xuICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICB9KTtcbiAgICB0aGlzLnVuc3Vic2NyaWJlXy5sZW5ndGggPSAwO1xuICAgIHRoaXMuZXZlbnRSZXNvbHZlcl8gPSBudWxsO1xuICAgIGlmICh0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfKSB7XG4gICAgICB0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfLnJlbW92ZUFsbCgpO1xuICAgICAgdGhpcy5vblRyaWdnZXJPYnNlcnZhYmxlXyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIHVuc3Vic2NyaWJlIGhhbmRsZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoaXMgdmlzaWJpbGl0eVxuICAgKiBtb2RlbCBpcyBkZXN0cm95ZWQuXG4gICAqIEBwYXJhbSB7IVVubGlzdGVuRGVmfSBoYW5kbGVyXG4gICAqL1xuICB1bnN1YnNjcmliZShoYW5kbGVyKSB7XG4gICAgdGhpcy51bnN1YnNjcmliZV8ucHVzaChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBldmVudCBoYW5kbGVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiBhbGwgdmlzaWJpbGl0eSBjb25kaXRpb25zXG4gICAqIGhhdmUgYmVlbiBtZXQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gaGFuZGxlclxuICAgKi9cbiAgb25UcmlnZ2VyRXZlbnQoaGFuZGxlcikge1xuICAgIGlmICh0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfKSB7XG4gICAgICB0aGlzLm9uVHJpZ2dlck9ic2VydmFibGVfLmFkZChoYW5kbGVyKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZXZlbnRQcm9taXNlXyAmJiAhdGhpcy5ldmVudFJlc29sdmVyXykge1xuICAgICAgLy8gSWYgZXZlbnRQcm9taXNlIGhhcyBhbHJlYWR5IHJlc29sdmVkLCBuZWVkIHRvIGNhbGwgaGFuZGxlciBtYW51YWxseS5cbiAgICAgIGhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoaXMgb2JqZWN0IGlzIHJlYWR5LiBSZWFkeSBtZWFucyB0aGF0IHZpc2liaWxpdHkgaXNcbiAgICogcmVhZHkgdG8gYmUgY2FsY3VsYXRlZCwgZS5nLiBiZWNhdXNlIGFuIGVsZW1lbnQgaGFzIGJlZW5cbiAgICogc3VmZmljaWVudGx5IHJlbmRlcmVkLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlYWR5XG4gICAqL1xuICBzZXRSZWFkeShyZWFkeSkge1xuICAgIHRoaXMucmVhZHlfID0gcmVhZHk7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoYXQgdGhlIG1vZGVsIG5lZWRzIHRvIHdhaXQgb24gZXh0cmEgcmVwb3J0IHJlYWR5IHByb21pc2VcbiAgICogYWZ0ZXIgYWxsIHZpc2liaWxpdHkgY29uZGl0aW9ucyBoYXZlIGJlZW4gbWV0IHRvIGNhbGwgcmVwb3J0IGhhbmRsZXJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiFQcm9taXNlfSBjYWxsYmFja1xuICAgKi9cbiAgc2V0UmVwb3J0UmVhZHkoY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlcG9ydFJlYWR5XyA9IGZhbHNlO1xuICAgIHRoaXMuY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlXyA9IGNhbGxiYWNrO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFZpc2liaWxpdHlfKCkge1xuICAgIHJldHVybiB0aGlzLnJlYWR5XyA/IHRoaXMuY2FsY1Zpc2liaWxpdHlfKCkgOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGNhbGN1bGF0aW9uIGN5Y2xlLlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMudXBkYXRlXyh0aGlzLmdldFZpc2liaWxpdHlfKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNhbGN1bGF0ZWQgc3RhdGUgb2YgdmlzaWJpbGl0eS5cbiAgICogQHBhcmFtIHt0aW1lfSBzdGFydFRpbWVcbiAgICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZShzdGFydFRpbWUpIHtcbiAgICByZXR1cm4gZGljdCh7XG4gICAgICAvLyBPYnNlcnZlZCB0aW1lcywgcmVsYXRpdmUgdG8gdGhlIGBzdGFydFRpbWVgLlxuICAgICAgJ2ZpcnN0U2VlblRpbWUnOiB0aW1lQmFzZSh0aGlzLmZpcnN0U2VlblRpbWVfLCBzdGFydFRpbWUpLFxuICAgICAgJ2xhc3RTZWVuVGltZSc6IHRpbWVCYXNlKHRoaXMubGFzdFNlZW5UaW1lXywgc3RhcnRUaW1lKSxcbiAgICAgICdsYXN0VmlzaWJsZVRpbWUnOiB0aW1lQmFzZSh0aGlzLmxhc3RWaXNpYmxlVGltZV8sIHN0YXJ0VGltZSksXG4gICAgICAnZmlyc3RWaXNpYmxlVGltZSc6IHRpbWVCYXNlKHRoaXMuZmlyc3RWaXNpYmxlVGltZV8sIHN0YXJ0VGltZSksXG5cbiAgICAgIC8vIER1cmF0aW9ucy5cbiAgICAgICdtYXhDb250aW51b3VzVmlzaWJsZVRpbWUnOiB0aGlzLm1heENvbnRpbnVvdXNWaXNpYmxlVGltZV8sXG4gICAgICAndG90YWxWaXNpYmxlVGltZSc6IHRoaXMudG90YWxWaXNpYmxlVGltZV8sXG5cbiAgICAgIC8vIFZpc2liaWxpdHkgcGVyY2VudHMuXG4gICAgICAnbG9hZFRpbWVWaXNpYmlsaXR5JzogdGhpcy5sb2FkVGltZVZpc2liaWxpdHlfICogMTAwIHx8IDAsXG4gICAgICAnbWluVmlzaWJsZVBlcmNlbnRhZ2UnOiB0aGlzLm1pblZpc2libGVQZXJjZW50YWdlXyAqIDEwMCxcbiAgICAgICdtYXhWaXNpYmxlUGVyY2VudGFnZSc6IHRoaXMubWF4VmlzaWJsZVBlcmNlbnRhZ2VfICogMTAwLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2aXNpYmlsaXR5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVfKHZpc2liaWxpdHkpIHtcbiAgICAvLyBVcGRhdGUgc3RhdGUgYW5kIGNoZWNrIGlmIGFsbCBjb25kaXRpb25zIGFyZSBzYXRpc2ZpZWRcbiAgICBpZiAodGhpcy53YWl0VG9SZXNldF8pIHtcbiAgICAgIGlmICghdGhpcy5pc1Zpc2liaWxpdHlNYXRjaF8odmlzaWJpbGl0eSkpIHtcbiAgICAgICAgLy8gV2Ugd2VyZSB3YWl0aW5nIGZvciBhIGNvbmRpdGlvbiB0byBiZWNvbWUgdW5tZXQsIGFuZCBub3cgaXQgaGFzXG4gICAgICAgIHRoaXMucmVzZXRfKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5ldmVudFJlc29sdmVyXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdoZW4gaWdub3JlVmlzaWJpbGl0eUZvclJlcG9ydF8gaXMgdHJ1ZSwgd2UgdXBkYXRlIGNvdW50ZXJzIGJ1dCBmaXJlIHRoZVxuICAgIC8vIGV2ZW50IHdoZW4gdGhlIHJlcG9ydCByZWFkeSBwcm9taXNlIGlzIHJlc29sdmVkLlxuICAgIGNvbnN0IGNvbmRpdGlvbnNNZXQgPVxuICAgICAgdGhpcy51cGRhdGVDb3VudGVyc18odmlzaWJpbGl0eSkgfHwgdGhpcy5pZ25vcmVWaXNpYmlsaXR5Rm9yUmVwb3J0XztcbiAgICBpZiAoY29uZGl0aW9uc01ldCkge1xuICAgICAgaWYgKHRoaXMuc2NoZWR1bGVkVXBkYXRlVGltZW91dElkXykge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlcG9ydFJlYWR5Xykge1xuICAgICAgICAvLyBUT0RPKGpvbmtlbGxlcik6IENhbiB3ZSBlbGltaW5hdGUgZXZlbnRSZXNvbHZlcl8/XG4gICAgICAgIHRoaXMuZXZlbnRSZXNvbHZlcl8oKTtcbiAgICAgICAgdGhpcy5ldmVudFJlc29sdmVyXyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnJlcGVhdF8pIHtcbiAgICAgICAgICB0aGlzLndhaXRUb1Jlc2V0XyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5jb250aW51b3VzVGltZV8gPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlXykge1xuICAgICAgICAvLyBSZXBvcnQgd2hlbiByZXBvcnQgcmVhZHkgcHJvbWlzZSByZXNvbHZlXG4gICAgICAgIGNvbnN0IHJlcG9ydFJlYWR5UHJvbWlzZSA9IHRoaXMuY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlXygpO1xuICAgICAgICB0aGlzLmNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZV8gPSBudWxsO1xuICAgICAgICByZXBvcnRSZWFkeVByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZXBvcnRSZWFkeV8gPSB0cnVlO1xuICAgICAgICAgIC8vIE5lZWQgdG8gdXBkYXRlIG9uZSBtb3JlIHRpbWUgaW4gY2FzZSB0aW1lIGV4Y2VlZHNcbiAgICAgICAgICAvLyBtYXhDb250aW51b3VzVmlzaWJsZVRpbWUuXG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLm1hdGNoZXNWaXNpYmlsaXR5XyAmJiAhdGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfKSB7XG4gICAgICAvLyBUaGVyZSBpcyB1bm1ldCBkdXJhdGlvbiBjb25kaXRpb24sIHNjaGVkdWxlIGEgY2hlY2tcbiAgICAgIGNvbnN0IHRpbWVUb1dhaXQgPSB0aGlzLmNvbXB1dGVUaW1lVG9XYWl0XygpO1xuICAgICAgaWYgKHRpbWVUb1dhaXQgPiAwKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkVXBkYXRlVGltZW91dElkXyA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2NoZWR1bGVkVXBkYXRlVGltZW91dElkXyA9IG51bGw7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSwgdGltZVRvV2FpdCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5tYXRjaGVzVmlzaWJpbGl0eV8gJiYgdGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5zY2hlZHVsZWRVcGRhdGVUaW1lb3V0SWRfKTtcbiAgICAgIHRoaXMuc2NoZWR1bGVkVXBkYXRlVGltZW91dElkXyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHZpc2liaWxpdHkgZmFsbCBpbnRvIHRoZSBwZXJjZW50YWdlIHJhbmdlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2aXNpYmlsaXR5XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1Zpc2liaWxpdHlNYXRjaF8odmlzaWJpbGl0eSkge1xuICAgIGRldkFzc2VydChcbiAgICAgIHZpc2liaWxpdHkgPj0gMCAmJiB2aXNpYmlsaXR5IDw9IDEsXG4gICAgICAnaW52YWxpZCB2aXNpYmlsaXR5IHZhbHVlOiAlcycsXG4gICAgICB2aXNpYmlsaXR5XG4gICAgKTtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IElmIHZpc2libGVQZXJjZW50YWdlTWluIGlzIDEwMCUsIHRoZW4gaXQgZG9lc24ndCBtYWtlXG4gICAgLy8gc2Vuc2UgdG8gZG8gdGhlIHVzdWFsIChtaW4sIG1heF0gc2luY2UgdGhhdCB3b3VsZCBuZXZlciBiZSB0cnVlLlxuICAgIGlmICh0aGlzLnNwZWNfWyd2aXNpYmxlUGVyY2VudGFnZU1pbiddID09IDEpIHtcbiAgICAgIHJldHVybiB2aXNpYmlsaXR5ID09IDE7XG4gICAgfVxuICAgIC8vIFNwZWNpYWwgY2FzZTogSWYgdmlzaWJsZVBlcmNlbnRhZ2VNYXggaXMgMCUsIHRoZW4gd2VcbiAgICAvLyB3YW50IHRvIHBpbmcgd2hlbiB0aGUgY3JlYXRpdmUgYmVjb21lcyBub3QgdmlzaWJsZS5cbiAgICBpZiAodGhpcy5zcGVjX1sndmlzaWJsZVBlcmNlbnRhZ2VNYXgnXSA9PSAwKSB7XG4gICAgICByZXR1cm4gdmlzaWJpbGl0eSA9PSAwO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgdmlzaWJpbGl0eSA+IHRoaXMuc3BlY19bJ3Zpc2libGVQZXJjZW50YWdlTWluJ10gJiZcbiAgICAgIHZpc2liaWxpdHkgPD0gdGhpcy5zcGVjX1sndmlzaWJsZVBlcmNlbnRhZ2VNYXgnXVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZpc2liaWxpdHlcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQ291bnRlcnNfKHZpc2liaWxpdHkpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICB2aXNpYmlsaXR5ID49IDAgJiYgdmlzaWJpbGl0eSA8PSAxLFxuICAgICAgJ2ludmFsaWQgdmlzaWJpbGl0eSB2YWx1ZTogJXMnLFxuICAgICAgdmlzaWJpbGl0eVxuICAgICk7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIGlmICh2aXNpYmlsaXR5ID4gMCkge1xuICAgICAgdGhpcy5maXJzdFNlZW5UaW1lXyA9IHRoaXMuZmlyc3RTZWVuVGltZV8gfHwgbm93O1xuICAgICAgdGhpcy5sYXN0U2VlblRpbWVfID0gbm93O1xuICAgICAgLy8gQ29uc2lkZXIgaXQgYXMgbG9hZCB0aW1lIHZpc2liaWxpdHkgaWYgdGhpcyBoYXBwZW5zIHdpdGhpbiAzMDBtcyBvZlxuICAgICAgLy8gcGFnZSBsb2FkLlxuICAgICAgaWYgKCF0aGlzLmxvYWRUaW1lVmlzaWJpbGl0eV8gJiYgbm93IC0gdGhpcy5jcmVhdGVkVGltZV8gPCAzMDApIHtcbiAgICAgICAgdGhpcy5sb2FkVGltZVZpc2liaWxpdHlfID0gdmlzaWJpbGl0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2TWF0Y2hlc1Zpc2liaWxpdHkgPSB0aGlzLm1hdGNoZXNWaXNpYmlsaXR5XztcbiAgICBjb25zdCB0aW1lU2luY2VMYXN0VXBkYXRlID0gdGhpcy5sYXN0VmlzaWJsZVVwZGF0ZVRpbWVfXG4gICAgICA/IG5vdyAtIHRoaXMubGFzdFZpc2libGVVcGRhdGVUaW1lX1xuICAgICAgOiAwO1xuICAgIHRoaXMubWF0Y2hlc1Zpc2liaWxpdHlfID0gdGhpcy5pc1Zpc2liaWxpdHlNYXRjaF8odmlzaWJpbGl0eSk7XG4gICAgaWYgKHRoaXMubWF0Y2hlc1Zpc2liaWxpdHlfKSB7XG4gICAgICB0aGlzLmV2ZXJNYXRjaGVkVmlzaWJpbGl0eV8gPSB0cnVlO1xuICAgICAgaWYgKHByZXZNYXRjaGVzVmlzaWJpbGl0eSkge1xuICAgICAgICAvLyBLZWVwIGNvdW50aW5nLlxuICAgICAgICB0aGlzLnRvdGFsVmlzaWJsZVRpbWVfICs9IHRpbWVTaW5jZUxhc3RVcGRhdGU7XG4gICAgICAgIHRoaXMuY29udGludW91c1RpbWVfICs9IHRpbWVTaW5jZUxhc3RVcGRhdGU7XG4gICAgICAgIHRoaXMubWF4Q29udGludW91c1Zpc2libGVUaW1lXyA9IE1hdGgubWF4KFxuICAgICAgICAgIHRoaXMubWF4Q29udGludW91c1Zpc2libGVUaW1lXyxcbiAgICAgICAgICB0aGlzLmNvbnRpbnVvdXNUaW1lX1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIHJlc291cmNlIGNhbWUgaW50byB2aWV3OiBzdGFydCBjb3VudGluZy5cbiAgICAgICAgZGV2QXNzZXJ0KCF0aGlzLmxhc3RWaXNpYmxlVXBkYXRlVGltZV8pO1xuICAgICAgICB0aGlzLmZpcnN0VmlzaWJsZVRpbWVfID0gdGhpcy5maXJzdFZpc2libGVUaW1lXyB8fCBub3c7XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RWaXNpYmxlVXBkYXRlVGltZV8gPSBub3c7XG4gICAgICB0aGlzLm1pblZpc2libGVQZXJjZW50YWdlXyA9XG4gICAgICAgIHRoaXMubWluVmlzaWJsZVBlcmNlbnRhZ2VfID4gMFxuICAgICAgICAgID8gTWF0aC5taW4odGhpcy5taW5WaXNpYmxlUGVyY2VudGFnZV8sIHZpc2liaWxpdHkpXG4gICAgICAgICAgOiB2aXNpYmlsaXR5O1xuXG4gICAgICB0aGlzLm1heFZpc2libGVQZXJjZW50YWdlXyA9IE1hdGgubWF4KFxuICAgICAgICB0aGlzLm1heFZpc2libGVQZXJjZW50YWdlXyxcbiAgICAgICAgdmlzaWJpbGl0eVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdFZpc2libGVUaW1lXyA9IG5vdztcbiAgICB9IGVsc2UgaWYgKHByZXZNYXRjaGVzVmlzaWJpbGl0eSkge1xuICAgICAgLy8gVGhlIHJlc291cmNlIHdlbnQgb3V0IG9mIHZpZXcuIERvIGZpbmFsIGNhbGN1bGF0aW9ucyBhbmQgcmVzZXQgc3RhdGUuXG4gICAgICBkZXZBc3NlcnQodGhpcy5sYXN0VmlzaWJsZVVwZGF0ZVRpbWVfID4gMCk7XG5cbiAgICAgIHRoaXMubWF4Q29udGludW91c1Zpc2libGVUaW1lXyA9IE1hdGgubWF4KFxuICAgICAgICB0aGlzLm1heENvbnRpbnVvdXNWaXNpYmxlVGltZV8sXG4gICAgICAgIHRoaXMuY29udGludW91c1RpbWVfICsgdGltZVNpbmNlTGFzdFVwZGF0ZVxuICAgICAgKTtcblxuICAgICAgLy8gUmVzZXQgZm9yIG5leHQgdmlzaWJpbGl0eSBldmVudC5cbiAgICAgIHRoaXMubGFzdFZpc2libGVVcGRhdGVUaW1lXyA9IDA7XG4gICAgICB0aGlzLnRvdGFsVmlzaWJsZVRpbWVfICs9IHRpbWVTaW5jZUxhc3RVcGRhdGU7XG4gICAgICB0aGlzLmNvbnRpbnVvdXNUaW1lXyA9IDA7IC8vIENsZWFyIG9ubHkgYWZ0ZXIgbWF4IGlzIGNhbGN1bGF0ZWQgYWJvdmUuXG4gICAgICB0aGlzLmxhc3RWaXNpYmxlVGltZV8gPSBub3c7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZXZlck1hdGNoZWRWaXNpYmlsaXR5XyAmJlxuICAgICAgdGhpcy50b3RhbFZpc2libGVUaW1lXyA+PSB0aGlzLnNwZWNfWyd0b3RhbFRpbWVNaW4nXSAmJlxuICAgICAgdGhpcy50b3RhbFZpc2libGVUaW1lXyA8PSB0aGlzLnNwZWNfWyd0b3RhbFRpbWVNYXgnXSAmJlxuICAgICAgdGhpcy5tYXhDb250aW51b3VzVmlzaWJsZVRpbWVfID49IHRoaXMuc3BlY19bJ2NvbnRpbnVvdXNUaW1lTWluJ10gJiZcbiAgICAgIHRoaXMubWF4Q29udGludW91c1Zpc2libGVUaW1lXyA8PSB0aGlzLnNwZWNfWydjb250aW51b3VzVGltZU1heCddXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGFtb3VudCB0aGF0IHRoZSB1c2VyIGhhZCBzY3JvbGxlZCBkb3duIHRoZSBwYWdlIGF0IHRoZSB0aW1lIG9mXG4gICAqIHBhZ2UgbG9hZGluZy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXG4gICAqL1xuICBtYXliZVNldEluaXRpYWxTY3JvbGxEZXB0aChkZXB0aCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsU2Nyb2xsRGVwdGhBbHJlYWR5U2V0Xykge1xuICAgICAgdGhpcy5pbml0aWFsU2Nyb2xsRGVwdGhfID0gZGVwdGg7XG4gICAgICB0aGlzLmluaXRpYWxTY3JvbGxEZXB0aEFscmVhZHlTZXRfID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgYW1vdW50IHRoYXQgdGhlIHVzZXIgaGFkIHNjcm9sbGVkIGRvd24gdGhlIHBhZ2UsIGF0IHRoZSB0aW1lIG9mXG4gICAqIGluaS1sb2FkLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IGRlcHRoXG4gICAqL1xuICBnZXRJbml0aWFsU2Nyb2xsRGVwdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5pdGlhbFNjcm9sbERlcHRoXztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aW1lLCBhc3N1bWluZyB0aGUgb2JqZWN0IGlzIGN1cnJlbnRseSB2aXNpYmxlLCB0aGF0IGl0J2QgdGFrZVxuICAgKiBpdCB0byBtYXRjaCBhbGwgdGltaW5nIHJlcXVpcmVtZW50cy5cbiAgICogQHJldHVybiB7dGltZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXB1dGVUaW1lVG9XYWl0XygpIHtcbiAgICBjb25zdCB3YWl0Rm9yQ29udGludW91c1RpbWUgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuc3BlY19bJ2NvbnRpbnVvdXNUaW1lTWluJ10gLSB0aGlzLmNvbnRpbnVvdXNUaW1lXyxcbiAgICAgIDBcbiAgICApO1xuICAgIGNvbnN0IHdhaXRGb3JUb3RhbFRpbWUgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuc3BlY19bJ3RvdGFsVGltZU1pbiddIC0gdGhpcy50b3RhbFZpc2libGVUaW1lXyxcbiAgICAgIDBcbiAgICApO1xuICAgIGNvbnN0IG1heFdhaXRUaW1lID0gTWF0aC5tYXgod2FpdEZvckNvbnRpbnVvdXNUaW1lLCB3YWl0Rm9yVG90YWxUaW1lKTtcbiAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICBtYXhXYWl0VGltZSxcbiAgICAgIHdhaXRGb3JDb250aW51b3VzVGltZSB8fCBJbmZpbml0eSxcbiAgICAgIHdhaXRGb3JUb3RhbFRpbWUgfHwgSW5maW5pdHlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3BlY2lmaWVkIHRpbWUgYmFzZWQgb24gdGhlIGdpdmVuIGBiYXNlVGltZWAuXG4gKiBAcGFyYW0ge3RpbWV9IHRpbWVcbiAqIEBwYXJhbSB7dGltZX0gYmFzZVRpbWVcbiAqIEByZXR1cm4ge3RpbWV9XG4gKi9cbmZ1bmN0aW9uIHRpbWVCYXNlKHRpbWUsIGJhc2VUaW1lKSB7XG4gIHJldHVybiB0aW1lID49IGJhc2VUaW1lID8gdGltZSAtIGJhc2VUaW1lIDogMDtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/visibility-model.js