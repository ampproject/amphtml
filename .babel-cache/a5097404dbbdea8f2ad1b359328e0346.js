function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  INACTIVE: 'inactive' };


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
}var

ActivityHistory = /*#__PURE__*/function () {
  /**
   * Creates an instance of ActivityHistory.
   */
  function ActivityHistory() {_classCallCheck(this, ActivityHistory);
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
   */_createClass(ActivityHistory, [{ key: "push", value:
    function push(activityEvent) {
      if (
      this.prevActivityEvent_ &&
      this.prevActivityEvent_.time < activityEvent.time)
      {
        this.totalEngagedTime_ += findEngagedTimeBetween(
        this.prevActivityEvent_,
        activityEvent.time);

      }
      this.prevActivityEvent_ = activityEvent;
    }

    /**
     * Get the total engaged time up to the given time recorded in
     * ActivityHistory.
     * @param {number} time
     * @return {number}
     */ }, { key: "getTotalEngagedTime", value:
    function getTotalEngagedTime(time) {
      var totalEngagedTime = 0;
      if (this.prevActivityEvent_ !== undefined) {
        totalEngagedTime =
        this.totalEngagedTime_ +
        findEngagedTimeBetween(this.prevActivityEvent_, time);
      }
      return totalEngagedTime;
    } }]);return ActivityHistory;}();


/**
 * Array of event types which will be listened for on the document to indicate
 * activity. Other activities are also observed on the AmpDoc and Viewport
 * objects. See {@link setUpActivityListeners_} for listener implementation.
 * @private @const {Array<string>}
 */
var ACTIVE_EVENT_TYPES = [
'mousedown',
'mouseup',
'mousemove',
'keydown',
'keyup'];

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
  function Activity(ampdoc) {_classCallCheck(this, Activity);
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
       */};


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

  /** @private */_createClass(Activity, [{ key: "start_", value:
    function start_() {
      /** @private @const {number} */
      this.startTime_ = Date.now();
      // record an activity since this is when the page became visible
      this.handleActivity_();
      this.setUpActivityListeners_();
    }

    /**
     * @private
     * @return {number}
     */ }, { key: "getTimeSinceStart_", value:
    function getTimeSinceStart_() {
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
     */ }, { key: "stopIgnore_", value:
    function stopIgnore_() {
      this.ignoreActivity_ = false;
      this.ignoreInactive_ = false;
    }

    /** @private */ }, { key: "setUpActivityListeners_", value:
    function setUpActivityListeners_() {
      this.setUpListenersFromArray_(
      this.ampdoc.getRootNode(),
      ACTIVE_EVENT_TYPES,
      this.boundHandleActivity_);


      this.setUpListenersFromArray_(
      this.ampdoc.getRootNode(),
      INACTIVE_EVENT_TYPES,
      this.boundHandleInactive_);


      this.unlistenFuncs_.push(
      this.ampdoc.onVisibilityChanged(this.boundHandleVisibilityChange_));


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
     */ }, { key: "setUpListenersFromArray_", value:
    function setUpListenersFromArray_(target, events, listener) {
      for (var i = 0; i < events.length; i++) {
        this.unlistenFuncs_.push(listen(target, events[i], listener));
      }
    }

    /** @private */ }, { key: "handleActivity_", value:
    function handleActivity_() {
      if (this.ignoreActivity_) {
        return;
      }
      this.ignoreActivity_ = true;
      this.ignoreInactive_ = false;

      this.handleActivityEvent_(ActivityEventType.ACTIVE);
    }

    /** @private */ }, { key: "handleInactive_", value:
    function handleInactive_() {
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
     */ }, { key: "handleActivityEvent_", value:
    function handleActivityEvent_(type) {
      var timeSinceStart = this.getTimeSinceStart_();
      var secondKey = Math.floor(timeSinceStart / 1000);
      var timeToWait = 1000 - (timeSinceStart % 1000);

      // stop ignoring activity at the start of the next activity bucket
      setTimeout(this.boundStopIgnore_, timeToWait);

      this.activityHistory_.push({
        type: type,
        time: secondKey });

    }

    /** @private */ }, { key: "handleVisibilityChange_", value:
    function handleVisibilityChange_() {
      if (this.ampdoc.isVisible()) {
        this.handleActivity_();
      } else {
        this.handleInactive_();
      }
    }

    /**
     * Remove all listeners associated with this Activity instance.
     * @private
     */ }, { key: "unlisten_", value:
    function unlisten_() {
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
     */ }, { key: "cleanup_", value:
    function cleanup_() {
      this.unlisten_();
    }

    /**
     * Get total engaged time since the page became visible.
     * @return {number}
     */ }, { key: "getTotalEngagedTime", value:
    function getTotalEngagedTime() {
      var secondsSinceStart = Math.floor(this.getTimeSinceStart_() / 1000);
      return this.activityHistory_.getTotalEngagedTime(secondsSinceStart);
    }

    /**
     * Get the incremental engaged time since the last push and reset it if asked.
     * @param {string} name
     * @param {boolean=} reset
     * @return {number}
     */ }, { key: "getIncrementalEngagedTime", value:
    function getIncrementalEngagedTime(name) {var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
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
      return (
      this.totalEngagedTimeByTrigger_[name] - currentIncrementalEngagedTime);

    } }]);return Activity;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/activity-impl.js