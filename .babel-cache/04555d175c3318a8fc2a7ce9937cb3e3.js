function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Provides an ability to collect data about activities the user
 * has performed on the page.
 */
import { Services } from "../../../src/service";
import { hasOwn } from "../../../src/core/types/object";
import { listen } from "../../../src/event-helper";
import { registerServiceBuilderForDoc } from "../../../src/service-helpers";

/**
 * The amount of time after an activity the user is considered engaged.
 * @private @const {number}
 */
var DEFAULT_ENGAGED_SECONDS = 5;

/**
 * @enum {string}
 */
var ActivityEventType = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

/**
 * @typedef {{
 *   type: string,
 *   time: number
 * }}
 */
var ActivityEventDef;

/**
 * Find the engaged time between the event and the time (exclusive of the time)
 * @param {ActivityEventDef} activityEvent
 * @param {number} time
 * @return {number}
 * @private
 */
function findEngagedTimeBetween(activityEvent, time) {
  var engagementBonus = 0;

  if (activityEvent.type === ActivityEventType.ACTIVE) {
    engagementBonus = DEFAULT_ENGAGED_SECONDS;
  }

  return Math.min(time - activityEvent.time, engagementBonus);
}

var ActivityHistory = /*#__PURE__*/function () {
  /**
   * Creates an instance of ActivityHistory.
   */
  function ActivityHistory() {
    _classCallCheck(this, ActivityHistory);

    /** @private {number} */
    this.totalEngagedTime_ = 0;

    /**
     * prevActivityEvent_ remains undefined until the first valid push call.
     * @private {ActivityEventDef|undefined}
     */
    this.prevActivityEvent_ = undefined;
  }

  /**
   * Indicate that an activity took place at the given time.
   * @param {ActivityEventDef} activityEvent
   */
  _createClass(ActivityHistory, [{
    key: "push",
    value: function push(activityEvent) {
      if (this.prevActivityEvent_ && this.prevActivityEvent_.time < activityEvent.time) {
        this.totalEngagedTime_ += findEngagedTimeBetween(this.prevActivityEvent_, activityEvent.time);
      }

      this.prevActivityEvent_ = activityEvent;
    }
    /**
     * Get the total engaged time up to the given time recorded in
     * ActivityHistory.
     * @param {number} time
     * @return {number}
     */

  }, {
    key: "getTotalEngagedTime",
    value: function getTotalEngagedTime(time) {
      var totalEngagedTime = 0;

      if (this.prevActivityEvent_ !== undefined) {
        totalEngagedTime = this.totalEngagedTime_ + findEngagedTimeBetween(this.prevActivityEvent_, time);
      }

      return totalEngagedTime;
    }
  }]);

  return ActivityHistory;
}();

/**
 * Array of event types which will be listened for on the document to indicate
 * activity. Other activities are also observed on the AmpDoc and Viewport
 * objects. See {@link setUpActivityListeners_} for listener implementation.
 * @private @const {Array<string>}
 */
var ACTIVE_EVENT_TYPES = ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup'];

/**
 * Array of event types which will be listened for on the document to indicate
 * leave from document. Other activities are also observed on the AmpDoc and Viewport
 * objects. See {@link setUpActivityListeners_} for listener implementation.
 * @private @const {Array<string>}
 */
var INACTIVE_EVENT_TYPES = ['mouseleave'];

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 */
export function installActivityServiceForTesting(ampDoc) {
  registerServiceBuilderForDoc(ampDoc, 'activity', Activity);
}
export var Activity = /*#__PURE__*/function () {
  /**
   * Activity tracks basic user activity on the page.
   *  - Listeners are not registered on the activity event types until the
   *    AmpDoc's `whenFirstVisible` is resolved.
   *  - When the `whenFirstVisible` of AmpDoc is resolved, a first activity
   *    is recorded.
   *  - The first activity in any second causes all other activities to be
   *    ignored. This is similar to debounce functionality since some events
   *    (e.g. scroll) could occur in rapid succession.
   *  - In any one second period, active events or inactive events can override
   *    each other. Whichever type occured last has precedence.
   *  - Active events give a 5 second "bonus" to engaged time.
   *  - Inactive events cause an immediate stop to the engaged time bonus of
   *    any previous activity event.
   *  - At any point after instantiation, `getTotalEngagedTime` can be used
   *    to get the engage time up to the time the function is called. If
   *    `whenFirstVisible` has not yet resolved, engaged time is 0.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function Activity(ampdoc) {
    _classCallCheck(this, Activity);

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc = ampdoc;

    /** @private @const {function()} */
    this.boundStopIgnore_ = this.stopIgnore_.bind(this);

    /** @private @const {function()} */
    this.boundHandleActivity_ = this.handleActivity_.bind(this);

    /** @private @const {function()} */
    this.boundHandleInactive_ = this.handleInactive_.bind(this);

    /** @private @const {function()} */
    this.boundHandleVisibilityChange_ = this.handleVisibilityChange_.bind(this);

    /**
     * Contains the incrementalEngagedTime timestamps for named triggers.
     * @private {Object<string, number>}
     */
    this.totalEngagedTimeByTrigger_ = {
      /*
       * "$triggerName" : ${lastRequestTimestamp}
       */
    };

    /** @private {Array<!UnlistenDef>} */
    this.unlistenFuncs_ = [];

    /** @private {boolean} */
    this.ignoreActivity_ = false;

    /** @private {boolean} */
    this.ignoreInactive_ = false;

    /** @private @const {!ActivityHistory} */
    this.activityHistory_ = new ActivityHistory();

    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);
    this.ampdoc.whenFirstVisible().then(this.start_.bind(this));
  }

  /** @private */
  _createClass(Activity, [{
    key: "start_",
    value: function start_() {
      /** @private @const {number} */
      this.startTime_ = Date.now();
      // record an activity since this is when the page became visible
      this.handleActivity_();
      this.setUpActivityListeners_();
    }
    /**
     * @private
     * @return {number}
     */

  }, {
    key: "getTimeSinceStart_",
    value: function getTimeSinceStart_() {
      var timeSinceStart = Date.now() - this.startTime_;
      // Ensure that a negative time is never returned. This may cause loss of
      // data if there is a time change during the session but it will decrease
      // the likelyhood of errors in that situation.
      return timeSinceStart > 0 ? timeSinceStart : 0;
    }
    /**
     * Return to a state where neither activities or inactivity events are
     * ignored when that event type is fired.
     * @private
     */

  }, {
    key: "stopIgnore_",
    value: function stopIgnore_() {
      this.ignoreActivity_ = false;
      this.ignoreInactive_ = false;
    }
    /** @private */

  }, {
    key: "setUpActivityListeners_",
    value: function setUpActivityListeners_() {
      this.setUpListenersFromArray_(this.ampdoc.getRootNode(), ACTIVE_EVENT_TYPES, this.boundHandleActivity_);
      this.setUpListenersFromArray_(this.ampdoc.getRootNode(), INACTIVE_EVENT_TYPES, this.boundHandleInactive_);
      this.unlistenFuncs_.push(this.ampdoc.onVisibilityChanged(this.boundHandleVisibilityChange_));
      // Viewport.onScroll does not return an unlisten function.
      // TODO(britice): If Viewport is updated to return an unlisten function,
      // update this to capture the unlisten function.
      this.viewport_.onScroll(this.boundHandleActivity_);
    }
    /**
     *  @private
     *  @param {!EventTarget} target
     *  @param {Array<string>} events
     *  @param {function()} listener
     */

  }, {
    key: "setUpListenersFromArray_",
    value: function setUpListenersFromArray_(target, events, listener) {
      for (var i = 0; i < events.length; i++) {
        this.unlistenFuncs_.push(listen(target, events[i], listener));
      }
    }
    /** @private */

  }, {
    key: "handleActivity_",
    value: function handleActivity_() {
      if (this.ignoreActivity_) {
        return;
      }

      this.ignoreActivity_ = true;
      this.ignoreInactive_ = false;
      this.handleActivityEvent_(ActivityEventType.ACTIVE);
    }
    /** @private */

  }, {
    key: "handleInactive_",
    value: function handleInactive_() {
      if (this.ignoreInactive_) {
        return;
      }

      this.ignoreInactive_ = true;
      this.ignoreActivity_ = false;
      this.handleActivityEvent_(ActivityEventType.INACTIVE);
    }
    /**
     * @param {ActivityEventType} type
     * @private
     */

  }, {
    key: "handleActivityEvent_",
    value: function handleActivityEvent_(type) {
      var timeSinceStart = this.getTimeSinceStart_();
      var secondKey = Math.floor(timeSinceStart / 1000);
      var timeToWait = 1000 - timeSinceStart % 1000;
      // stop ignoring activity at the start of the next activity bucket
      setTimeout(this.boundStopIgnore_, timeToWait);
      this.activityHistory_.push({
        type: type,
        time: secondKey
      });
    }
    /** @private */

  }, {
    key: "handleVisibilityChange_",
    value: function handleVisibilityChange_() {
      if (this.ampdoc.isVisible()) {
        this.handleActivity_();
      } else {
        this.handleInactive_();
      }
    }
    /**
     * Remove all listeners associated with this Activity instance.
     * @private
     */

  }, {
    key: "unlisten_",
    value: function unlisten_() {
      for (var i = 0; i < this.unlistenFuncs_.length; i++) {
        var unlistenFunc = this.unlistenFuncs_[i];

        // TODO(britice): Due to eslint typechecking, this check may not be
        // necessary.
        if (typeof unlistenFunc === 'function') {
          unlistenFunc();
        }
      }

      this.unlistenFuncs_ = [];
    }
    /**
     * @private
     * @visibleForTesting
     */

  }, {
    key: "cleanup_",
    value: function cleanup_() {
      this.unlisten_();
    }
    /**
     * Get total engaged time since the page became visible.
     * @return {number}
     */

  }, {
    key: "getTotalEngagedTime",
    value: function getTotalEngagedTime() {
      var secondsSinceStart = Math.floor(this.getTimeSinceStart_() / 1000);
      return this.activityHistory_.getTotalEngagedTime(secondsSinceStart);
    }
    /**
     * Get the incremental engaged time since the last push and reset it if asked.
     * @param {string} name
     * @param {boolean=} reset
     * @return {number}
     */

  }, {
    key: "getIncrementalEngagedTime",
    value: function getIncrementalEngagedTime(name, reset) {
      if (reset === void 0) {
        reset = true;
      }

      if (!hasOwn(this.totalEngagedTimeByTrigger_, name)) {
        if (reset) {
          this.totalEngagedTimeByTrigger_[name] = this.getTotalEngagedTime();
        }

        return this.getTotalEngagedTime();
      }

      var currentIncrementalEngagedTime = this.totalEngagedTimeByTrigger_[name];

      if (reset === false) {
        return this.getTotalEngagedTime() - currentIncrementalEngagedTime;
      }

      this.totalEngagedTimeByTrigger_[name] = this.getTotalEngagedTime();
      return this.totalEngagedTimeByTrigger_[name] - currentIncrementalEngagedTime;
    }
  }]);

  return Activity;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGl2aXR5LWltcGwuanMiXSwibmFtZXMiOlsiU2VydmljZXMiLCJoYXNPd24iLCJsaXN0ZW4iLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiREVGQVVMVF9FTkdBR0VEX1NFQ09ORFMiLCJBY3Rpdml0eUV2ZW50VHlwZSIsIkFDVElWRSIsIklOQUNUSVZFIiwiQWN0aXZpdHlFdmVudERlZiIsImZpbmRFbmdhZ2VkVGltZUJldHdlZW4iLCJhY3Rpdml0eUV2ZW50IiwidGltZSIsImVuZ2FnZW1lbnRCb251cyIsInR5cGUiLCJNYXRoIiwibWluIiwiQWN0aXZpdHlIaXN0b3J5IiwidG90YWxFbmdhZ2VkVGltZV8iLCJwcmV2QWN0aXZpdHlFdmVudF8iLCJ1bmRlZmluZWQiLCJ0b3RhbEVuZ2FnZWRUaW1lIiwiQUNUSVZFX0VWRU5UX1RZUEVTIiwiSU5BQ1RJVkVfRVZFTlRfVFlQRVMiLCJpbnN0YWxsQWN0aXZpdHlTZXJ2aWNlRm9yVGVzdGluZyIsImFtcERvYyIsIkFjdGl2aXR5IiwiYW1wZG9jIiwiYm91bmRTdG9wSWdub3JlXyIsInN0b3BJZ25vcmVfIiwiYmluZCIsImJvdW5kSGFuZGxlQWN0aXZpdHlfIiwiaGFuZGxlQWN0aXZpdHlfIiwiYm91bmRIYW5kbGVJbmFjdGl2ZV8iLCJoYW5kbGVJbmFjdGl2ZV8iLCJib3VuZEhhbmRsZVZpc2liaWxpdHlDaGFuZ2VfIiwiaGFuZGxlVmlzaWJpbGl0eUNoYW5nZV8iLCJ0b3RhbEVuZ2FnZWRUaW1lQnlUcmlnZ2VyXyIsInVubGlzdGVuRnVuY3NfIiwiaWdub3JlQWN0aXZpdHlfIiwiaWdub3JlSW5hY3RpdmVfIiwiYWN0aXZpdHlIaXN0b3J5XyIsInZpZXdwb3J0XyIsInZpZXdwb3J0Rm9yRG9jIiwid2hlbkZpcnN0VmlzaWJsZSIsInRoZW4iLCJzdGFydF8iLCJzdGFydFRpbWVfIiwiRGF0ZSIsIm5vdyIsInNldFVwQWN0aXZpdHlMaXN0ZW5lcnNfIiwidGltZVNpbmNlU3RhcnQiLCJzZXRVcExpc3RlbmVyc0Zyb21BcnJheV8iLCJnZXRSb290Tm9kZSIsInB1c2giLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwib25TY3JvbGwiLCJ0YXJnZXQiLCJldmVudHMiLCJsaXN0ZW5lciIsImkiLCJsZW5ndGgiLCJoYW5kbGVBY3Rpdml0eUV2ZW50XyIsImdldFRpbWVTaW5jZVN0YXJ0XyIsInNlY29uZEtleSIsImZsb29yIiwidGltZVRvV2FpdCIsInNldFRpbWVvdXQiLCJpc1Zpc2libGUiLCJ1bmxpc3RlbkZ1bmMiLCJ1bmxpc3Rlbl8iLCJzZWNvbmRzU2luY2VTdGFydCIsImdldFRvdGFsRW5nYWdlZFRpbWUiLCJuYW1lIiwicmVzZXQiLCJjdXJyZW50SW5jcmVtZW50YWxFbmdhZ2VkVGltZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxNQUFSO0FBQ0EsU0FBUUMsNEJBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyx1QkFBdUIsR0FBRyxDQUFoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxpQkFBaUIsR0FBRztBQUN4QkMsRUFBQUEsTUFBTSxFQUFFLFFBRGdCO0FBRXhCQyxFQUFBQSxRQUFRLEVBQUU7QUFGYyxDQUExQjs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxnQkFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLHNCQUFULENBQWdDQyxhQUFoQyxFQUErQ0MsSUFBL0MsRUFBcUQ7QUFDbkQsTUFBSUMsZUFBZSxHQUFHLENBQXRCOztBQUVBLE1BQUlGLGFBQWEsQ0FBQ0csSUFBZCxLQUF1QlIsaUJBQWlCLENBQUNDLE1BQTdDLEVBQXFEO0FBQ25ETSxJQUFB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LElBQTFCLEVBQWdDQyxLQUFoQyxFQUE4QztBQUFBLFVBQWRBLEtBQWM7QUFBZEEsUUFBQUEsS0FBYyxHQUFOLElBQU07QUFBQTs7QUFDNUMsVUFBSSxDQUFDeEUsTUFBTSxDQUFDLEtBQUttQywwQkFBTixFQUFrQ29DLElBQWxDLENBQVgsRUFBb0Q7QUFDbEQsWUFBSUMsS0FBSixFQUFXO0FBQ1QsZUFBS3JDLDBCQUFMLENBQWdDb0MsSUFBaEMsSUFBd0MsS0FBS0QsbUJBQUwsRUFBeEM7QUFDRDs7QUFDRCxlQUFPLEtBQUtBLG1CQUFMLEVBQVA7QUFDRDs7QUFDRCxVQUFNRyw2QkFBNkIsR0FBRyxLQUFLdEMsMEJBQUwsQ0FBZ0NvQyxJQUFoQyxDQUF0Qzs7QUFDQSxVQUFJQyxLQUFLLEtBQUssS0FBZCxFQUFxQjtBQUNuQixlQUFPLEtBQUtGLG1CQUFMLEtBQTZCRyw2QkFBcEM7QUFDRDs7QUFDRCxXQUFLdEMsMEJBQUwsQ0FBZ0NvQyxJQUFoQyxJQUF3QyxLQUFLRCxtQkFBTCxFQUF4QztBQUNBLGFBQ0UsS0FBS25DLDBCQUFMLENBQWdDb0MsSUFBaEMsSUFBd0NFLDZCQUQxQztBQUdEO0FBMU9IOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFByb3ZpZGVzIGFuIGFiaWxpdHkgdG8gY29sbGVjdCBkYXRhIGFib3V0IGFjdGl2aXRpZXMgdGhlIHVzZXJcbiAqIGhhcyBwZXJmb3JtZWQgb24gdGhlIHBhZ2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2xpc3Rlbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKipcbiAqIFRoZSBhbW91bnQgb2YgdGltZSBhZnRlciBhbiBhY3Rpdml0eSB0aGUgdXNlciBpcyBjb25zaWRlcmVkIGVuZ2FnZWQuXG4gKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgREVGQVVMVF9FTkdBR0VEX1NFQ09ORFMgPSA1O1xuXG4vKipcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmNvbnN0IEFjdGl2aXR5RXZlbnRUeXBlID0ge1xuICBBQ1RJVkU6ICdhY3RpdmUnLFxuICBJTkFDVElWRTogJ2luYWN0aXZlJyxcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgdHlwZTogc3RyaW5nLFxuICogICB0aW1lOiBudW1iZXJcbiAqIH19XG4gKi9cbmxldCBBY3Rpdml0eUV2ZW50RGVmO1xuXG4vKipcbiAqIEZpbmQgdGhlIGVuZ2FnZWQgdGltZSBiZXR3ZWVuIHRoZSBldmVudCBhbmQgdGhlIHRpbWUgKGV4Y2x1c2l2ZSBvZiB0aGUgdGltZSlcbiAqIEBwYXJhbSB7QWN0aXZpdHlFdmVudERlZn0gYWN0aXZpdHlFdmVudFxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGZpbmRFbmdhZ2VkVGltZUJldHdlZW4oYWN0aXZpdHlFdmVudCwgdGltZSkge1xuICBsZXQgZW5nYWdlbWVudEJvbnVzID0gMDtcblxuICBpZiAoYWN0aXZpdHlFdmVudC50eXBlID09PSBBY3Rpdml0eUV2ZW50VHlwZS5BQ1RJVkUpIHtcbiAgICBlbmdhZ2VtZW50Qm9udXMgPSBERUZBVUxUX0VOR0FHRURfU0VDT05EUztcbiAgfVxuXG4gIHJldHVybiBNYXRoLm1pbih0aW1lIC0gYWN0aXZpdHlFdmVudC50aW1lLCBlbmdhZ2VtZW50Qm9udXMpO1xufVxuXG5jbGFzcyBBY3Rpdml0eUhpc3Rvcnkge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBBY3Rpdml0eUhpc3RvcnkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnRvdGFsRW5nYWdlZFRpbWVfID0gMDtcblxuICAgIC8qKlxuICAgICAqIHByZXZBY3Rpdml0eUV2ZW50XyByZW1haW5zIHVuZGVmaW5lZCB1bnRpbCB0aGUgZmlyc3QgdmFsaWQgcHVzaCBjYWxsLlxuICAgICAqIEBwcml2YXRlIHtBY3Rpdml0eUV2ZW50RGVmfHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICB0aGlzLnByZXZBY3Rpdml0eUV2ZW50XyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZSB0aGF0IGFuIGFjdGl2aXR5IHRvb2sgcGxhY2UgYXQgdGhlIGdpdmVuIHRpbWUuXG4gICAqIEBwYXJhbSB7QWN0aXZpdHlFdmVudERlZn0gYWN0aXZpdHlFdmVudFxuICAgKi9cbiAgcHVzaChhY3Rpdml0eUV2ZW50KSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5wcmV2QWN0aXZpdHlFdmVudF8gJiZcbiAgICAgIHRoaXMucHJldkFjdGl2aXR5RXZlbnRfLnRpbWUgPCBhY3Rpdml0eUV2ZW50LnRpbWVcbiAgICApIHtcbiAgICAgIHRoaXMudG90YWxFbmdhZ2VkVGltZV8gKz0gZmluZEVuZ2FnZWRUaW1lQmV0d2VlbihcbiAgICAgICAgdGhpcy5wcmV2QWN0aXZpdHlFdmVudF8sXG4gICAgICAgIGFjdGl2aXR5RXZlbnQudGltZVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5wcmV2QWN0aXZpdHlFdmVudF8gPSBhY3Rpdml0eUV2ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdG90YWwgZW5nYWdlZCB0aW1lIHVwIHRvIHRoZSBnaXZlbiB0aW1lIHJlY29yZGVkIGluXG4gICAqIEFjdGl2aXR5SGlzdG9yeS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0VG90YWxFbmdhZ2VkVGltZSh0aW1lKSB7XG4gICAgbGV0IHRvdGFsRW5nYWdlZFRpbWUgPSAwO1xuICAgIGlmICh0aGlzLnByZXZBY3Rpdml0eUV2ZW50XyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0b3RhbEVuZ2FnZWRUaW1lID1cbiAgICAgICAgdGhpcy50b3RhbEVuZ2FnZWRUaW1lXyArXG4gICAgICAgIGZpbmRFbmdhZ2VkVGltZUJldHdlZW4odGhpcy5wcmV2QWN0aXZpdHlFdmVudF8sIHRpbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWxFbmdhZ2VkVGltZTtcbiAgfVxufVxuXG4vKipcbiAqIEFycmF5IG9mIGV2ZW50IHR5cGVzIHdoaWNoIHdpbGwgYmUgbGlzdGVuZWQgZm9yIG9uIHRoZSBkb2N1bWVudCB0byBpbmRpY2F0ZVxuICogYWN0aXZpdHkuIE90aGVyIGFjdGl2aXRpZXMgYXJlIGFsc28gb2JzZXJ2ZWQgb24gdGhlIEFtcERvYyBhbmQgVmlld3BvcnRcbiAqIG9iamVjdHMuIFNlZSB7QGxpbmsgc2V0VXBBY3Rpdml0eUxpc3RlbmVyc199IGZvciBsaXN0ZW5lciBpbXBsZW1lbnRhdGlvbi5cbiAqIEBwcml2YXRlIEBjb25zdCB7QXJyYXk8c3RyaW5nPn1cbiAqL1xuY29uc3QgQUNUSVZFX0VWRU5UX1RZUEVTID0gW1xuICAnbW91c2Vkb3duJyxcbiAgJ21vdXNldXAnLFxuICAnbW91c2Vtb3ZlJyxcbiAgJ2tleWRvd24nLFxuICAna2V5dXAnLFxuXTtcbi8qKlxuICogQXJyYXkgb2YgZXZlbnQgdHlwZXMgd2hpY2ggd2lsbCBiZSBsaXN0ZW5lZCBmb3Igb24gdGhlIGRvY3VtZW50IHRvIGluZGljYXRlXG4gKiBsZWF2ZSBmcm9tIGRvY3VtZW50LiBPdGhlciBhY3Rpdml0aWVzIGFyZSBhbHNvIG9ic2VydmVkIG9uIHRoZSBBbXBEb2MgYW5kIFZpZXdwb3J0XG4gKiBvYmplY3RzLiBTZWUge0BsaW5rIHNldFVwQWN0aXZpdHlMaXN0ZW5lcnNffSBmb3IgbGlzdGVuZXIgaW1wbGVtZW50YXRpb24uXG4gKiBAcHJpdmF0ZSBAY29uc3Qge0FycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IElOQUNUSVZFX0VWRU5UX1RZUEVTID0gWydtb3VzZWxlYXZlJ107XG5cbi8qKlxuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBEb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxBY3Rpdml0eVNlcnZpY2VGb3JUZXN0aW5nKGFtcERvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKGFtcERvYywgJ2FjdGl2aXR5JywgQWN0aXZpdHkpO1xufVxuXG5leHBvcnQgY2xhc3MgQWN0aXZpdHkge1xuICAvKipcbiAgICogQWN0aXZpdHkgdHJhY2tzIGJhc2ljIHVzZXIgYWN0aXZpdHkgb24gdGhlIHBhZ2UuXG4gICAqICAtIExpc3RlbmVycyBhcmUgbm90IHJlZ2lzdGVyZWQgb24gdGhlIGFjdGl2aXR5IGV2ZW50IHR5cGVzIHVudGlsIHRoZVxuICAgKiAgICBBbXBEb2MncyBgd2hlbkZpcnN0VmlzaWJsZWAgaXMgcmVzb2x2ZWQuXG4gICAqICAtIFdoZW4gdGhlIGB3aGVuRmlyc3RWaXNpYmxlYCBvZiBBbXBEb2MgaXMgcmVzb2x2ZWQsIGEgZmlyc3QgYWN0aXZpdHlcbiAgICogICAgaXMgcmVjb3JkZWQuXG4gICAqICAtIFRoZSBmaXJzdCBhY3Rpdml0eSBpbiBhbnkgc2Vjb25kIGNhdXNlcyBhbGwgb3RoZXIgYWN0aXZpdGllcyB0byBiZVxuICAgKiAgICBpZ25vcmVkLiBUaGlzIGlzIHNpbWlsYXIgdG8gZGVib3VuY2UgZnVuY3Rpb25hbGl0eSBzaW5jZSBzb21lIGV2ZW50c1xuICAgKiAgICAoZS5nLiBzY3JvbGwpIGNvdWxkIG9jY3VyIGluIHJhcGlkIHN1Y2Nlc3Npb24uXG4gICAqICAtIEluIGFueSBvbmUgc2Vjb25kIHBlcmlvZCwgYWN0aXZlIGV2ZW50cyBvciBpbmFjdGl2ZSBldmVudHMgY2FuIG92ZXJyaWRlXG4gICAqICAgIGVhY2ggb3RoZXIuIFdoaWNoZXZlciB0eXBlIG9jY3VyZWQgbGFzdCBoYXMgcHJlY2VkZW5jZS5cbiAgICogIC0gQWN0aXZlIGV2ZW50cyBnaXZlIGEgNSBzZWNvbmQgXCJib251c1wiIHRvIGVuZ2FnZWQgdGltZS5cbiAgICogIC0gSW5hY3RpdmUgZXZlbnRzIGNhdXNlIGFuIGltbWVkaWF0ZSBzdG9wIHRvIHRoZSBlbmdhZ2VkIHRpbWUgYm9udXMgb2ZcbiAgICogICAgYW55IHByZXZpb3VzIGFjdGl2aXR5IGV2ZW50LlxuICAgKiAgLSBBdCBhbnkgcG9pbnQgYWZ0ZXIgaW5zdGFudGlhdGlvbiwgYGdldFRvdGFsRW5nYWdlZFRpbWVgIGNhbiBiZSB1c2VkXG4gICAqICAgIHRvIGdldCB0aGUgZW5nYWdlIHRpbWUgdXAgdG8gdGhlIHRpbWUgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZC4gSWZcbiAgICogICAgYHdoZW5GaXJzdFZpc2libGVgIGhhcyBub3QgeWV0IHJlc29sdmVkLCBlbmdhZ2VkIHRpbWUgaXMgMC5cbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvYyAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kU3RvcElnbm9yZV8gPSB0aGlzLnN0b3BJZ25vcmVfLmJpbmQodGhpcyk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbigpfSAqL1xuICAgIHRoaXMuYm91bmRIYW5kbGVBY3Rpdml0eV8gPSB0aGlzLmhhbmRsZUFjdGl2aXR5Xy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kSGFuZGxlSW5hY3RpdmVfID0gdGhpcy5oYW5kbGVJbmFjdGl2ZV8uYmluZCh0aGlzKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Z1bmN0aW9uKCl9ICovXG4gICAgdGhpcy5ib3VuZEhhbmRsZVZpc2liaWxpdHlDaGFuZ2VfID0gdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogQ29udGFpbnMgdGhlIGluY3JlbWVudGFsRW5nYWdlZFRpbWUgdGltZXN0YW1wcyBmb3IgbmFtZWQgdHJpZ2dlcnMuXG4gICAgICogQHByaXZhdGUge09iamVjdDxzdHJpbmcsIG51bWJlcj59XG4gICAgICovXG4gICAgdGhpcy50b3RhbEVuZ2FnZWRUaW1lQnlUcmlnZ2VyXyA9IHtcbiAgICAgIC8qXG4gICAgICAgKiBcIiR0cmlnZ2VyTmFtZVwiIDogJHtsYXN0UmVxdWVzdFRpbWVzdGFtcH1cbiAgICAgICAqL1xuICAgIH07XG5cbiAgICAvKiogQHByaXZhdGUge0FycmF5PCFVbmxpc3RlbkRlZj59ICovXG4gICAgdGhpcy51bmxpc3RlbkZ1bmNzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaWdub3JlQWN0aXZpdHlfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pZ25vcmVJbmFjdGl2ZV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBY3Rpdml0eUhpc3Rvcnl9ICovXG4gICAgdGhpcy5hY3Rpdml0eUhpc3RvcnlfID0gbmV3IEFjdGl2aXR5SGlzdG9yeSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZpZXdwb3J0L3ZpZXdwb3J0LWludGVyZmFjZS5WaWV3cG9ydEludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdwb3J0XyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jKTtcblxuICAgIHRoaXMuYW1wZG9jLndoZW5GaXJzdFZpc2libGUoKS50aGVuKHRoaXMuc3RhcnRfLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0YXJ0XygpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFRpbWVfID0gRGF0ZS5ub3coKTtcbiAgICAvLyByZWNvcmQgYW4gYWN0aXZpdHkgc2luY2UgdGhpcyBpcyB3aGVuIHRoZSBwYWdlIGJlY2FtZSB2aXNpYmxlXG4gICAgdGhpcy5oYW5kbGVBY3Rpdml0eV8oKTtcbiAgICB0aGlzLnNldFVwQWN0aXZpdHlMaXN0ZW5lcnNfKCk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0VGltZVNpbmNlU3RhcnRfKCkge1xuICAgIGNvbnN0IHRpbWVTaW5jZVN0YXJ0ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnRUaW1lXztcbiAgICAvLyBFbnN1cmUgdGhhdCBhIG5lZ2F0aXZlIHRpbWUgaXMgbmV2ZXIgcmV0dXJuZWQuIFRoaXMgbWF5IGNhdXNlIGxvc3Mgb2ZcbiAgICAvLyBkYXRhIGlmIHRoZXJlIGlzIGEgdGltZSBjaGFuZ2UgZHVyaW5nIHRoZSBzZXNzaW9uIGJ1dCBpdCB3aWxsIGRlY3JlYXNlXG4gICAgLy8gdGhlIGxpa2VseWhvb2Qgb2YgZXJyb3JzIGluIHRoYXQgc2l0dWF0aW9uLlxuICAgIHJldHVybiB0aW1lU2luY2VTdGFydCA+IDAgPyB0aW1lU2luY2VTdGFydCA6IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRvIGEgc3RhdGUgd2hlcmUgbmVpdGhlciBhY3Rpdml0aWVzIG9yIGluYWN0aXZpdHkgZXZlbnRzIGFyZVxuICAgKiBpZ25vcmVkIHdoZW4gdGhhdCBldmVudCB0eXBlIGlzIGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RvcElnbm9yZV8oKSB7XG4gICAgdGhpcy5pZ25vcmVBY3Rpdml0eV8gPSBmYWxzZTtcbiAgICB0aGlzLmlnbm9yZUluYWN0aXZlXyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNldFVwQWN0aXZpdHlMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc2V0VXBMaXN0ZW5lcnNGcm9tQXJyYXlfKFxuICAgICAgdGhpcy5hbXBkb2MuZ2V0Um9vdE5vZGUoKSxcbiAgICAgIEFDVElWRV9FVkVOVF9UWVBFUyxcbiAgICAgIHRoaXMuYm91bmRIYW5kbGVBY3Rpdml0eV9cbiAgICApO1xuXG4gICAgdGhpcy5zZXRVcExpc3RlbmVyc0Zyb21BcnJheV8oXG4gICAgICB0aGlzLmFtcGRvYy5nZXRSb290Tm9kZSgpLFxuICAgICAgSU5BQ1RJVkVfRVZFTlRfVFlQRVMsXG4gICAgICB0aGlzLmJvdW5kSGFuZGxlSW5hY3RpdmVfXG4gICAgKTtcblxuICAgIHRoaXMudW5saXN0ZW5GdW5jc18ucHVzaChcbiAgICAgIHRoaXMuYW1wZG9jLm9uVmlzaWJpbGl0eUNoYW5nZWQodGhpcy5ib3VuZEhhbmRsZVZpc2liaWxpdHlDaGFuZ2VfKVxuICAgICk7XG5cbiAgICAvLyBWaWV3cG9ydC5vblNjcm9sbCBkb2VzIG5vdCByZXR1cm4gYW4gdW5saXN0ZW4gZnVuY3Rpb24uXG4gICAgLy8gVE9ETyhicml0aWNlKTogSWYgVmlld3BvcnQgaXMgdXBkYXRlZCB0byByZXR1cm4gYW4gdW5saXN0ZW4gZnVuY3Rpb24sXG4gICAgLy8gdXBkYXRlIHRoaXMgdG8gY2FwdHVyZSB0aGUgdW5saXN0ZW4gZnVuY3Rpb24uXG4gICAgdGhpcy52aWV3cG9ydF8ub25TY3JvbGwodGhpcy5ib3VuZEhhbmRsZUFjdGl2aXR5Xyk7XG4gIH1cblxuICAvKipcbiAgICogIEBwcml2YXRlXG4gICAqICBAcGFyYW0geyFFdmVudFRhcmdldH0gdGFyZ2V0XG4gICAqICBAcGFyYW0ge0FycmF5PHN0cmluZz59IGV2ZW50c1xuICAgKiAgQHBhcmFtIHtmdW5jdGlvbigpfSBsaXN0ZW5lclxuICAgKi9cbiAgc2V0VXBMaXN0ZW5lcnNGcm9tQXJyYXlfKHRhcmdldCwgZXZlbnRzLCBsaXN0ZW5lcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnVubGlzdGVuRnVuY3NfLnB1c2gobGlzdGVuKHRhcmdldCwgZXZlbnRzW2ldLCBsaXN0ZW5lcikpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBoYW5kbGVBY3Rpdml0eV8oKSB7XG4gICAgaWYgKHRoaXMuaWdub3JlQWN0aXZpdHlfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaWdub3JlQWN0aXZpdHlfID0gdHJ1ZTtcbiAgICB0aGlzLmlnbm9yZUluYWN0aXZlXyA9IGZhbHNlO1xuXG4gICAgdGhpcy5oYW5kbGVBY3Rpdml0eUV2ZW50XyhBY3Rpdml0eUV2ZW50VHlwZS5BQ1RJVkUpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGhhbmRsZUluYWN0aXZlXygpIHtcbiAgICBpZiAodGhpcy5pZ25vcmVJbmFjdGl2ZV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pZ25vcmVJbmFjdGl2ZV8gPSB0cnVlO1xuICAgIHRoaXMuaWdub3JlQWN0aXZpdHlfID0gZmFsc2U7XG5cbiAgICB0aGlzLmhhbmRsZUFjdGl2aXR5RXZlbnRfKEFjdGl2aXR5RXZlbnRUeXBlLklOQUNUSVZFKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0FjdGl2aXR5RXZlbnRUeXBlfSB0eXBlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVBY3Rpdml0eUV2ZW50Xyh0eXBlKSB7XG4gICAgY29uc3QgdGltZVNpbmNlU3RhcnQgPSB0aGlzLmdldFRpbWVTaW5jZVN0YXJ0XygpO1xuICAgIGNvbnN0IHNlY29uZEtleSA9IE1hdGguZmxvb3IodGltZVNpbmNlU3RhcnQgLyAxMDAwKTtcbiAgICBjb25zdCB0aW1lVG9XYWl0ID0gMTAwMCAtICh0aW1lU2luY2VTdGFydCAlIDEwMDApO1xuXG4gICAgLy8gc3RvcCBpZ25vcmluZyBhY3Rpdml0eSBhdCB0aGUgc3RhcnQgb2YgdGhlIG5leHQgYWN0aXZpdHkgYnVja2V0XG4gICAgc2V0VGltZW91dCh0aGlzLmJvdW5kU3RvcElnbm9yZV8sIHRpbWVUb1dhaXQpO1xuXG4gICAgdGhpcy5hY3Rpdml0eUhpc3RvcnlfLnB1c2goe1xuICAgICAgdHlwZSxcbiAgICAgIHRpbWU6IHNlY29uZEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBoYW5kbGVWaXNpYmlsaXR5Q2hhbmdlXygpIHtcbiAgICBpZiAodGhpcy5hbXBkb2MuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuaGFuZGxlQWN0aXZpdHlfKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlSW5hY3RpdmVfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIEFjdGl2aXR5IGluc3RhbmNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdW5saXN0ZW5fKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy51bmxpc3RlbkZ1bmNzXy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdW5saXN0ZW5GdW5jID0gdGhpcy51bmxpc3RlbkZ1bmNzX1tpXTtcbiAgICAgIC8vIFRPRE8oYnJpdGljZSk6IER1ZSB0byBlc2xpbnQgdHlwZWNoZWNraW5nLCB0aGlzIGNoZWNrIG1heSBub3QgYmVcbiAgICAgIC8vIG5lY2Vzc2FyeS5cbiAgICAgIGlmICh0eXBlb2YgdW5saXN0ZW5GdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVubGlzdGVuRnVuYygpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVubGlzdGVuRnVuY3NfID0gW107XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBjbGVhbnVwXygpIHtcbiAgICB0aGlzLnVubGlzdGVuXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0b3RhbCBlbmdhZ2VkIHRpbWUgc2luY2UgdGhlIHBhZ2UgYmVjYW1lIHZpc2libGUuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFRvdGFsRW5nYWdlZFRpbWUoKSB7XG4gICAgY29uc3Qgc2Vjb25kc1NpbmNlU3RhcnQgPSBNYXRoLmZsb29yKHRoaXMuZ2V0VGltZVNpbmNlU3RhcnRfKCkgLyAxMDAwKTtcbiAgICByZXR1cm4gdGhpcy5hY3Rpdml0eUhpc3RvcnlfLmdldFRvdGFsRW5nYWdlZFRpbWUoc2Vjb25kc1NpbmNlU3RhcnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaW5jcmVtZW50YWwgZW5nYWdlZCB0aW1lIHNpbmNlIHRoZSBsYXN0IHB1c2ggYW5kIHJlc2V0IGl0IGlmIGFza2VkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSByZXNldFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRJbmNyZW1lbnRhbEVuZ2FnZWRUaW1lKG5hbWUsIHJlc2V0ID0gdHJ1ZSkge1xuICAgIGlmICghaGFzT3duKHRoaXMudG90YWxFbmdhZ2VkVGltZUJ5VHJpZ2dlcl8sIG5hbWUpKSB7XG4gICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgdGhpcy50b3RhbEVuZ2FnZWRUaW1lQnlUcmlnZ2VyX1tuYW1lXSA9IHRoaXMuZ2V0VG90YWxFbmdhZ2VkVGltZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VG90YWxFbmdhZ2VkVGltZSgpO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50SW5jcmVtZW50YWxFbmdhZ2VkVGltZSA9IHRoaXMudG90YWxFbmdhZ2VkVGltZUJ5VHJpZ2dlcl9bbmFtZV07XG4gICAgaWYgKHJlc2V0ID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VG90YWxFbmdhZ2VkVGltZSgpIC0gY3VycmVudEluY3JlbWVudGFsRW5nYWdlZFRpbWU7XG4gICAgfVxuICAgIHRoaXMudG90YWxFbmdhZ2VkVGltZUJ5VHJpZ2dlcl9bbmFtZV0gPSB0aGlzLmdldFRvdGFsRW5nYWdlZFRpbWUoKTtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy50b3RhbEVuZ2FnZWRUaW1lQnlUcmlnZ2VyX1tuYW1lXSAtIGN1cnJlbnRJbmNyZW1lbnRhbEVuZ2FnZWRUaW1lXG4gICAgKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/activity-impl.js