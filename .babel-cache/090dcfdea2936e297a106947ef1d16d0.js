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
import { Services } from "../../../src/service";
import { devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";

/**
 * - visibilePercentageMin: The percentage of pixels that need to be on screen
 *   for the creative to be considered "visible".
 * - continuousTimeMin: The amount of continuous time, in milliseconds, that
 *   the creative must be on screen for in order to be considered "visible".
 *
 * @typedef {{
 *   visiblePercentageMin: number,
 *   continuousTimeMin: number,
 * }}
 */
export var RefreshConfig;
export var MIN_REFRESH_INTERVAL = 30;
export var DATA_ATTR_NAME = 'data-enable-refresh';
export var DATA_MANAGER_ID_NAME = 'data-amp-ad-refresh-id';
export var METATAG_NAME = 'amp-ad-enable-refresh';
var TAG = 'AMP-AD';

/**
 * Retrieves the publisher-specified refresh interval, if one were set. This
 * function first checks for appropriate slot attributes and then for
 * metadata tags, preferring whichever it finds first.
 * @param {!AmpElement} element
 * @param {!Window} unusedWin
 * @return {?number}
 * @visibleForTesting
 */
export function getPublisherSpecifiedRefreshInterval(element, unusedWin) {
  var refreshInterval = element.getAttribute(DATA_ATTR_NAME);

  if (refreshInterval) {
    return checkAndSanitizeRefreshInterval(refreshInterval);
  }

  var metaTagContent = element.getAmpDoc().getMetaByName(METATAG_NAME);

  if (!metaTagContent) {
    return null;
  }

  var networkIntervalPairs = metaTagContent.split(',');

  for (var i = 0; i < networkIntervalPairs.length; i++) {
    var pair = networkIntervalPairs[i].split('=');
    userAssert(pair.length == 2, 'refresh metadata config must be of ' + 'the form `network_type=refresh_interval`');

    if (pair[0].toLowerCase() == element.getAttribute('type').toLowerCase()) {
      return checkAndSanitizeRefreshInterval(pair[1]);
    }
  }

  return null;
}

/**
 * Ensures that refreshInterval is a number no less than 30. Returns null if
 * the given input fails to meet these criteria. This also converts from
 * seconds to milliseconds.
 *
 * @param {(number|string)} refreshInterval
 * @return {?number}
 */
function checkAndSanitizeRefreshInterval(refreshInterval) {
  if (refreshInterval === 'false') {
    return null;
  }

  var refreshIntervalNum = Number(refreshInterval);

  if (isNaN(refreshIntervalNum) || refreshIntervalNum < MIN_REFRESH_INTERVAL) {
    user().warn(TAG, 'invalid refresh interval, must be a number no less than ' + (MIN_REFRESH_INTERVAL + ": " + refreshInterval));
    return null;
  }

  return refreshIntervalNum * 1000;
}

/**
 * Defines the DFA states for the refresh cycle.
 *
 * 1. All newly registered elements begin in the INITIAL state.
 * 2. Only when the element enters the viewport with the specified
 *    intersection ratio does it transition into the VIEW_PENDING state.
 * 3. If the element remains in the viewport for the specified duration, it
 *    will then transition into the REFRESH_PENDING state, otherwise it will
 *    transition back into the INITIAL state.
 * 4. The element will remain in REFRESH_PENDING state until the refresh
 *    interval expires.
 * 5. Once the interval expires, the element will return to the INITIAL state.
 *
 * @enum {string}
 */
var RefreshLifecycleState = {
  /**
   * Element has been registered, but not yet seen on screen.
   */
  INITIAL: 'initial',

  /**
   * The element has appeared in the viewport, but not yet for the required
   * duration.
   */
  VIEW_PENDING: 'view_pending',

  /**
   * The element has been in the viewport for the required duration; the
   * refresh interval for the element has begun.
   */
  REFRESH_PENDING: 'refresh_pending'
};

/**
 * An object containing the IntersectionObservers used to monitor elements.
 * Each IO is configured to a different threshold, and all elements that
 * share the same visiblePercentageMin will be monitored by the same IO.
 *
 * @const {!Object<string, (!IntersectionObserver)>}
 */
var observers = {};

/**
 * An object containing all currently active RefreshManagers. This is used in
 * the IntersectionOberserver callback function to find the appropriate element
 * target.
 *
 * @const {!Object<string, !RefreshManager>}
 */
var managers = {};

/**
 * Used to generate unique IDs for each RefreshManager.
 * @type {number}
 */
var refreshManagerIdCounter = 0;

/**
 * Returns an instance of RefreshManager, if refresh is enabled on the page or
 * slot. An optional predicate for eligibility may be passed. If refresh is not
 * enabled, or fails the optional predicate, null will be returned.
 *
 * @param {!./amp-a4a.AmpA4A} a4a
 * @param {function():boolean=} opt_predicate
 * @return {?RefreshManager}
 */
export function getRefreshManager(a4a, opt_predicate) {
  var refreshInterval = getPublisherSpecifiedRefreshInterval(a4a.element, a4a.win);

  if (!refreshInterval || opt_predicate && !opt_predicate()) {
    return null;
  }

  return new RefreshManager(a4a, dict({
    'visiblePercentageMin': 50,
    'continuousTimeMin': 1
  }), refreshInterval);
}
export var RefreshManager = /*#__PURE__*/function () {
  /**
   * @param {!./amp-a4a.AmpA4A} a4a The AmpA4A instance to be refreshed.
   * @param {!JsonObject} config
   * @param {number} refreshInterval
   */
  function RefreshManager(a4a, config, refreshInterval) {
    _classCallCheck(this, RefreshManager);

    /** @private {string} */
    this.state_ = RefreshLifecycleState.INITIAL;

    /** @const @private {!./amp-a4a.AmpA4A} */
    this.a4a_ = a4a;

    /** @const @private {!Window} */
    this.win_ = a4a.win;

    /** @const @private {!Element} */
    this.element_ = a4a.element;

    /** @const @protected {string} */
    this.adType_ = this.element_.getAttribute('type').toLowerCase();

    /** @const @private {?number} */
    this.refreshInterval_ = refreshInterval;

    /** @const @private {!JsonObject} */
    this.config_ = this.convertAndSanitizeConfiguration_(config);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @protected {?(number|string)} */
    this.refreshTimeoutId_ = null;

    /** @private {?(number|string)} */
    this.visibilityTimeoutId_ = null;
    var managerId = String(refreshManagerIdCounter++);
    this.element_.setAttribute(DATA_MANAGER_ID_NAME, managerId);
    managers[managerId] = this;
    this.initiateRefreshCycle();
  }

  /**
   * Returns an IntersectionObserver configured to the given threshold, creating
   * one if one does not yet exist.
   *
   * @param {number} threshold
   * @return {!IntersectionObserver}
   */
  _createClass(RefreshManager, [{
    key: "getIntersectionObserverWithThreshold_",
    value: function getIntersectionObserverWithThreshold_(threshold) {
      var thresholdString = String(threshold);
      return observers[thresholdString] || (observers[thresholdString] = new this.win_.IntersectionObserver(this.ioCallback_, {
        threshold: threshold
      }));
    }
    /**
     * Returns a function that will be invoked directly by the
     * IntersectionObserver implementation. It will implement the core logic of
     * the refresh lifecycle, including the transitions of the DFA.
     *
     * @param {!Array<!IntersectionObserverEntry>} entries
     */

  }, {
    key: "ioCallback_",
    value: function ioCallback_(entries) {
      entries.forEach(function (entry) {
        var refreshManagerId = entry.target.getAttribute(DATA_MANAGER_ID_NAME);
        devAssert(refreshManagerId);
        var refreshManager = managers[refreshManagerId];

        if (entry.target != refreshManager.element_) {
          return;
        }

        switch (refreshManager.state_) {
          case RefreshLifecycleState.INITIAL:
            // First check if the element qualifies as "being on screen", i.e.,
            // that at least a minimum threshold of pixels is on screen. If so,
            // begin a timer, set for the duration of the minimum time on screen
            // threshold. If this timer runs out without interruption, then all
            // viewability conditions have been met, and we can begin the refresh
            // timer.
            if (entry.intersectionRatio >= refreshManager.config_['visiblePercentageMin']) {
              refreshManager.state_ = RefreshLifecycleState.VIEW_PENDING;
              refreshManager.visibilityTimeoutId_ = refreshManager.timer_.delay(function () {
                refreshManager.state_ = RefreshLifecycleState.REFRESH_PENDING;
                refreshManager.startRefreshTimer_();
              }, refreshManager.config_['continuousTimeMin']);
            }

            break;

          case RefreshLifecycleState.VIEW_PENDING:
            // If the element goes off screen before the minimum on screen time
            // duration elapses, place it back into INITIAL state.
            if (entry.intersectionRatio < refreshManager.config_['visiblePercentageMin']) {
              refreshManager.timer_.cancel(refreshManager.visibilityTimeoutId_);
              refreshManager.visibilityTimeoutId_ = null;
              refreshManager.state_ = RefreshLifecycleState.INITIAL;
            }

            break;

          case RefreshLifecycleState.REFRESH_PENDING:
          default:
            break;
        }
      });
    }
    /**
     * Initiates the refresh cycle by initiating the visibility manager on the
     * element.
     */

  }, {
    key: "initiateRefreshCycle",
    value: function initiateRefreshCycle() {
      switch (this.state_) {
        case RefreshLifecycleState.INITIAL:
          this.getIntersectionObserverWithThreshold_(this.config_['visiblePercentageMin']).observe(this.element_);
          break;

        case RefreshLifecycleState.REFRESH_PENDING:
        case RefreshLifecycleState.VIEW_PENDING:
        default:
          break;
      }
    }
    /**
     * Starts the refresh timer for the given monitored element.
     *
     * @return {!Promise<boolean>} A promise that resolves to true when the
     *    refresh timer elapses successfully.
     */

  }, {
    key: "startRefreshTimer_",
    value: function startRefreshTimer_() {
      var _this = this;

      return new Promise(function (resolve) {
        _this.refreshTimeoutId_ = _this.timer_.delay(function () {
          _this.state_ = RefreshLifecycleState.INITIAL;

          _this.unobserve();

          _this.a4a_.refresh(function () {
            return _this.initiateRefreshCycle();
          });

          resolve(true);
        },
        /** @type {number} */
        _this.refreshInterval_);
      });
    }
    /**
     * Converts config to appropriate units, modifying the argument in place. This
     * also ensures that visiblePercentageMin is in the range of [0, 100].
     * @param {!JsonObject} config
     * @return {!JsonObject}
     */

  }, {
    key: "convertAndSanitizeConfiguration_",
    value: function convertAndSanitizeConfiguration_(config) {
      devAssert(config['visiblePercentageMin'] >= 0 && config['visiblePercentageMin'] <= 100, 'visiblePercentageMin for refresh must be in the range [0, 100]');
      // Convert seconds to milliseconds.
      config['continuousTimeMin'] *= 1000;
      config['visiblePercentageMin'] /= 100;
      return config;
    }
    /**
     * Stops the intersection observer from observing the element.
     */

  }, {
    key: "unobserve",
    value: function unobserve() {
      this.getIntersectionObserverWithThreshold_(this.config_['visiblePercentageMin']).unobserve(this.element_);
    }
  }]);

  return RefreshManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZnJlc2gtbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZGljdCIsIlJlZnJlc2hDb25maWciLCJNSU5fUkVGUkVTSF9JTlRFUlZBTCIsIkRBVEFfQVRUUl9OQU1FIiwiREFUQV9NQU5BR0VSX0lEX05BTUUiLCJNRVRBVEFHX05BTUUiLCJUQUciLCJnZXRQdWJsaXNoZXJTcGVjaWZpZWRSZWZyZXNoSW50ZXJ2YWwiLCJlbGVtZW50IiwidW51c2VkV2luIiwicmVmcmVzaEludGVydmFsIiwiZ2V0QXR0cmlidXRlIiwiY2hlY2tBbmRTYW5pdGl6ZVJlZnJlc2hJbnRlcnZhbCIsIm1ldGFUYWdDb250ZW50IiwiZ2V0QW1wRG9jIiwiZ2V0TWV0YUJ5TmFtZSIsIm5ldHdvcmtJbnRlcnZhbFBhaXJzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwicGFpciIsInRvTG93ZXJDYXNlIiwicmVmcmVzaEludGVydmFsTnVtIiwiTnVtYmVyIiwiaXNOYU4iLCJ3YXJuIiwiUmVmcmVzaExpZmVjeWNsZVN0YXRlIiwiSU5JVElBTCIsIlZJRVdfUEVORElORyIsIlJFRlJFU0hfUEVORElORyIsIm9ic2VydmVycyIsIm1hbmFnZXJzIiwicmVmcmVzaE1hbmFnZXJJZENvdW50ZXIiLCJnZXRSZWZyZXNoTWFuYWdlciIsImE0YSIsIm9wdF9wcmVkaWNhdGUiLCJ3aW4iLCJSZWZyZXNoTWFuYWdlciIsImNvbmZpZyIsInN0YXRlXyIsImE0YV8iLCJ3aW5fIiwiZWxlbWVudF8iLCJhZFR5cGVfIiwicmVmcmVzaEludGVydmFsXyIsImNvbmZpZ18iLCJjb252ZXJ0QW5kU2FuaXRpemVDb25maWd1cmF0aW9uXyIsInRpbWVyXyIsInRpbWVyRm9yIiwicmVmcmVzaFRpbWVvdXRJZF8iLCJ2aXNpYmlsaXR5VGltZW91dElkXyIsIm1hbmFnZXJJZCIsIlN0cmluZyIsInNldEF0dHJpYnV0ZSIsImluaXRpYXRlUmVmcmVzaEN5Y2xlIiwidGhyZXNob2xkIiwidGhyZXNob2xkU3RyaW5nIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJpb0NhbGxiYWNrXyIsImVudHJpZXMiLCJmb3JFYWNoIiwiZW50cnkiLCJyZWZyZXNoTWFuYWdlcklkIiwidGFyZ2V0IiwicmVmcmVzaE1hbmFnZXIiLCJpbnRlcnNlY3Rpb25SYXRpbyIsImRlbGF5Iiwic3RhcnRSZWZyZXNoVGltZXJfIiwiY2FuY2VsIiwiZ2V0SW50ZXJzZWN0aW9uT2JzZXJ2ZXJXaXRoVGhyZXNob2xkXyIsIm9ic2VydmUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInVub2JzZXJ2ZSIsInJlZnJlc2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7QUFDQSxTQUFRQyxTQUFSLEVBQW1CQyxJQUFuQixFQUF5QkMsVUFBekI7QUFDQSxTQUFRQyxJQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLGFBQUo7QUFFUCxPQUFPLElBQU1DLG9CQUFvQixHQUFHLEVBQTdCO0FBQ1AsT0FBTyxJQUFNQyxjQUFjLEdBQUcscUJBQXZCO0FBQ1AsT0FBTyxJQUFNQyxvQkFBb0IsR0FBRyx3QkFBN0I7QUFDUCxPQUFPLElBQU1DLFlBQVksR0FBRyx1QkFBckI7QUFFUCxJQUFNQyxHQUFHLEdBQUcsUUFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLG9DQUFULENBQThDQyxPQUE5QyxFQUF1REMsU0FBdkQsRUFBa0U7QUFDdkUsTUFBTUMsZUFBZSxHQUFHRixPQUFPLENBQUNHLFlBQVIsQ0FBcUJSLGNBQXJCLENBQXhCOztBQUNBLE1BQUlPLGVBQUosRUFBcUI7QUFDbkIsV0FBT0UsK0JB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WixDQUFrQixZQUFNO0FBQy9DLFVBQUEsS0FBSSxDQUFDM0IsTUFBTCxHQUFjYixxQkFBcUIsQ0FBQ0MsT0FBcEM7O0FBQ0EsVUFBQSxLQUFJLENBQUM4QyxTQUFMOztBQUNBLFVBQUEsS0FBSSxDQUFDakMsSUFBTCxDQUFVa0MsT0FBVixDQUFrQjtBQUFBLG1CQUFNLEtBQUksQ0FBQ3BCLG9CQUFMLEVBQU47QUFBQSxXQUFsQjs7QUFDQWtCLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQUx3QjtBQUt0QjtBQUF1QixRQUFBLEtBQUksQ0FBQzVCLGdCQUxOLENBQXpCO0FBTUQsT0FQTSxDQUFQO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBN0pBO0FBQUE7QUFBQSxXQThKRSwwQ0FBaUNOLE1BQWpDLEVBQXlDO0FBQ3ZDekMsTUFBQUEsU0FBUyxDQUNQeUMsTUFBTSxDQUFDLHNCQUFELENBQU4sSUFBa0MsQ0FBbEMsSUFDRUEsTUFBTSxDQUFDLHNCQUFELENBQU4sSUFBa0MsR0FGN0IsRUFHUCxnRUFITyxDQUFUO0FBS0E7QUFDQUEsTUFBQUEsTUFBTSxDQUFDLG1CQUFELENBQU4sSUFBK0IsSUFBL0I7QUFDQUEsTUFBQUEsTUFBTSxDQUFDLHNCQUFELENBQU4sSUFBa0MsR0FBbEM7QUFDQSxhQUFPQSxNQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBNUtBO0FBQUE7QUFBQSxXQTZLRSxxQkFBWTtBQUNWLFdBQUsrQixxQ0FBTCxDQUNFLEtBQUt4QixPQUFMLENBQWEsc0JBQWIsQ0FERixFQUVFNEIsU0FGRixDQUVZLEtBQUsvQixRQUZqQjtBQUdEO0FBakxIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG4vKipcbiAqIC0gdmlzaWJpbGVQZXJjZW50YWdlTWluOiBUaGUgcGVyY2VudGFnZSBvZiBwaXhlbHMgdGhhdCBuZWVkIHRvIGJlIG9uIHNjcmVlblxuICogICBmb3IgdGhlIGNyZWF0aXZlIHRvIGJlIGNvbnNpZGVyZWQgXCJ2aXNpYmxlXCIuXG4gKiAtIGNvbnRpbnVvdXNUaW1lTWluOiBUaGUgYW1vdW50IG9mIGNvbnRpbnVvdXMgdGltZSwgaW4gbWlsbGlzZWNvbmRzLCB0aGF0XG4gKiAgIHRoZSBjcmVhdGl2ZSBtdXN0IGJlIG9uIHNjcmVlbiBmb3IgaW4gb3JkZXIgdG8gYmUgY29uc2lkZXJlZCBcInZpc2libGVcIi5cbiAqXG4gKiBAdHlwZWRlZiB7e1xuICogICB2aXNpYmxlUGVyY2VudGFnZU1pbjogbnVtYmVyLFxuICogICBjb250aW51b3VzVGltZU1pbjogbnVtYmVyLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBSZWZyZXNoQ29uZmlnO1xuXG5leHBvcnQgY29uc3QgTUlOX1JFRlJFU0hfSU5URVJWQUwgPSAzMDtcbmV4cG9ydCBjb25zdCBEQVRBX0FUVFJfTkFNRSA9ICdkYXRhLWVuYWJsZS1yZWZyZXNoJztcbmV4cG9ydCBjb25zdCBEQVRBX01BTkFHRVJfSURfTkFNRSA9ICdkYXRhLWFtcC1hZC1yZWZyZXNoLWlkJztcbmV4cG9ydCBjb25zdCBNRVRBVEFHX05BTUUgPSAnYW1wLWFkLWVuYWJsZS1yZWZyZXNoJztcblxuY29uc3QgVEFHID0gJ0FNUC1BRCc7XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBwdWJsaXNoZXItc3BlY2lmaWVkIHJlZnJlc2ggaW50ZXJ2YWwsIGlmIG9uZSB3ZXJlIHNldC4gVGhpc1xuICogZnVuY3Rpb24gZmlyc3QgY2hlY2tzIGZvciBhcHByb3ByaWF0ZSBzbG90IGF0dHJpYnV0ZXMgYW5kIHRoZW4gZm9yXG4gKiBtZXRhZGF0YSB0YWdzLCBwcmVmZXJyaW5nIHdoaWNoZXZlciBpdCBmaW5kcyBmaXJzdC5cbiAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IVdpbmRvd30gdW51c2VkV2luXG4gKiBAcmV0dXJuIHs/bnVtYmVyfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaXNoZXJTcGVjaWZpZWRSZWZyZXNoSW50ZXJ2YWwoZWxlbWVudCwgdW51c2VkV2luKSB7XG4gIGNvbnN0IHJlZnJlc2hJbnRlcnZhbCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUl9OQU1FKTtcbiAgaWYgKHJlZnJlc2hJbnRlcnZhbCkge1xuICAgIHJldHVybiBjaGVja0FuZFNhbml0aXplUmVmcmVzaEludGVydmFsKHJlZnJlc2hJbnRlcnZhbCk7XG4gIH1cbiAgY29uc3QgbWV0YVRhZ0NvbnRlbnQgPSBlbGVtZW50LmdldEFtcERvYygpLmdldE1ldGFCeU5hbWUoTUVUQVRBR19OQU1FKTtcbiAgaWYgKCFtZXRhVGFnQ29udGVudCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IG5ldHdvcmtJbnRlcnZhbFBhaXJzID0gbWV0YVRhZ0NvbnRlbnQuc3BsaXQoJywnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXR3b3JrSW50ZXJ2YWxQYWlycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBhaXIgPSBuZXR3b3JrSW50ZXJ2YWxQYWlyc1tpXS5zcGxpdCgnPScpO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICBwYWlyLmxlbmd0aCA9PSAyLFxuICAgICAgJ3JlZnJlc2ggbWV0YWRhdGEgY29uZmlnIG11c3QgYmUgb2YgJyArXG4gICAgICAgICd0aGUgZm9ybSBgbmV0d29ya190eXBlPXJlZnJlc2hfaW50ZXJ2YWxgJ1xuICAgICk7XG4gICAgaWYgKHBhaXJbMF0udG9Mb3dlckNhc2UoKSA9PSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIHJldHVybiBjaGVja0FuZFNhbml0aXplUmVmcmVzaEludGVydmFsKHBhaXJbMV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgcmVmcmVzaEludGVydmFsIGlzIGEgbnVtYmVyIG5vIGxlc3MgdGhhbiAzMC4gUmV0dXJucyBudWxsIGlmXG4gKiB0aGUgZ2l2ZW4gaW5wdXQgZmFpbHMgdG8gbWVldCB0aGVzZSBjcml0ZXJpYS4gVGhpcyBhbHNvIGNvbnZlcnRzIGZyb21cbiAqIHNlY29uZHMgdG8gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7KG51bWJlcnxzdHJpbmcpfSByZWZyZXNoSW50ZXJ2YWxcbiAqIEByZXR1cm4gez9udW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGNoZWNrQW5kU2FuaXRpemVSZWZyZXNoSW50ZXJ2YWwocmVmcmVzaEludGVydmFsKSB7XG4gIGlmIChyZWZyZXNoSW50ZXJ2YWwgPT09ICdmYWxzZScpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCByZWZyZXNoSW50ZXJ2YWxOdW0gPSBOdW1iZXIocmVmcmVzaEludGVydmFsKTtcbiAgaWYgKGlzTmFOKHJlZnJlc2hJbnRlcnZhbE51bSkgfHwgcmVmcmVzaEludGVydmFsTnVtIDwgTUlOX1JFRlJFU0hfSU5URVJWQUwpIHtcbiAgICB1c2VyKCkud2FybihcbiAgICAgIFRBRyxcbiAgICAgICdpbnZhbGlkIHJlZnJlc2ggaW50ZXJ2YWwsIG11c3QgYmUgYSBudW1iZXIgbm8gbGVzcyB0aGFuICcgK1xuICAgICAgICBgJHtNSU5fUkVGUkVTSF9JTlRFUlZBTH06ICR7cmVmcmVzaEludGVydmFsfWBcbiAgICApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiByZWZyZXNoSW50ZXJ2YWxOdW0gKiAxMDAwO1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhlIERGQSBzdGF0ZXMgZm9yIHRoZSByZWZyZXNoIGN5Y2xlLlxuICpcbiAqIDEuIEFsbCBuZXdseSByZWdpc3RlcmVkIGVsZW1lbnRzIGJlZ2luIGluIHRoZSBJTklUSUFMIHN0YXRlLlxuICogMi4gT25seSB3aGVuIHRoZSBlbGVtZW50IGVudGVycyB0aGUgdmlld3BvcnQgd2l0aCB0aGUgc3BlY2lmaWVkXG4gKiAgICBpbnRlcnNlY3Rpb24gcmF0aW8gZG9lcyBpdCB0cmFuc2l0aW9uIGludG8gdGhlIFZJRVdfUEVORElORyBzdGF0ZS5cbiAqIDMuIElmIHRoZSBlbGVtZW50IHJlbWFpbnMgaW4gdGhlIHZpZXdwb3J0IGZvciB0aGUgc3BlY2lmaWVkIGR1cmF0aW9uLCBpdFxuICogICAgd2lsbCB0aGVuIHRyYW5zaXRpb24gaW50byB0aGUgUkVGUkVTSF9QRU5ESU5HIHN0YXRlLCBvdGhlcndpc2UgaXQgd2lsbFxuICogICAgdHJhbnNpdGlvbiBiYWNrIGludG8gdGhlIElOSVRJQUwgc3RhdGUuXG4gKiA0LiBUaGUgZWxlbWVudCB3aWxsIHJlbWFpbiBpbiBSRUZSRVNIX1BFTkRJTkcgc3RhdGUgdW50aWwgdGhlIHJlZnJlc2hcbiAqICAgIGludGVydmFsIGV4cGlyZXMuXG4gKiA1LiBPbmNlIHRoZSBpbnRlcnZhbCBleHBpcmVzLCB0aGUgZWxlbWVudCB3aWxsIHJldHVybiB0byB0aGUgSU5JVElBTCBzdGF0ZS5cbiAqXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5jb25zdCBSZWZyZXNoTGlmZWN5Y2xlU3RhdGUgPSB7XG4gIC8qKlxuICAgKiBFbGVtZW50IGhhcyBiZWVuIHJlZ2lzdGVyZWQsIGJ1dCBub3QgeWV0IHNlZW4gb24gc2NyZWVuLlxuICAgKi9cbiAgSU5JVElBTDogJ2luaXRpYWwnLFxuXG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCBoYXMgYXBwZWFyZWQgaW4gdGhlIHZpZXdwb3J0LCBidXQgbm90IHlldCBmb3IgdGhlIHJlcXVpcmVkXG4gICAqIGR1cmF0aW9uLlxuICAgKi9cbiAgVklFV19QRU5ESU5HOiAndmlld19wZW5kaW5nJyxcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgaGFzIGJlZW4gaW4gdGhlIHZpZXdwb3J0IGZvciB0aGUgcmVxdWlyZWQgZHVyYXRpb247IHRoZVxuICAgKiByZWZyZXNoIGludGVydmFsIGZvciB0aGUgZWxlbWVudCBoYXMgYmVndW4uXG4gICAqL1xuICBSRUZSRVNIX1BFTkRJTkc6ICdyZWZyZXNoX3BlbmRpbmcnLFxufTtcblxuLyoqXG4gKiBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJzIHVzZWQgdG8gbW9uaXRvciBlbGVtZW50cy5cbiAqIEVhY2ggSU8gaXMgY29uZmlndXJlZCB0byBhIGRpZmZlcmVudCB0aHJlc2hvbGQsIGFuZCBhbGwgZWxlbWVudHMgdGhhdFxuICogc2hhcmUgdGhlIHNhbWUgdmlzaWJsZVBlcmNlbnRhZ2VNaW4gd2lsbCBiZSBtb25pdG9yZWQgYnkgdGhlIHNhbWUgSU8uXG4gKlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgKCFJbnRlcnNlY3Rpb25PYnNlcnZlcik+fVxuICovXG5jb25zdCBvYnNlcnZlcnMgPSB7fTtcblxuLyoqXG4gKiBBbiBvYmplY3QgY29udGFpbmluZyBhbGwgY3VycmVudGx5IGFjdGl2ZSBSZWZyZXNoTWFuYWdlcnMuIFRoaXMgaXMgdXNlZCBpblxuICogdGhlIEludGVyc2VjdGlvbk9iZXJzZXJ2ZXIgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmluZCB0aGUgYXBwcm9wcmlhdGUgZWxlbWVudFxuICogdGFyZ2V0LlxuICpcbiAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFSZWZyZXNoTWFuYWdlcj59XG4gKi9cbmNvbnN0IG1hbmFnZXJzID0ge307XG5cbi8qKlxuICogVXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgSURzIGZvciBlYWNoIFJlZnJlc2hNYW5hZ2VyLlxuICogQHR5cGUge251bWJlcn1cbiAqL1xubGV0IHJlZnJlc2hNYW5hZ2VySWRDb3VudGVyID0gMDtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIFJlZnJlc2hNYW5hZ2VyLCBpZiByZWZyZXNoIGlzIGVuYWJsZWQgb24gdGhlIHBhZ2Ugb3JcbiAqIHNsb3QuIEFuIG9wdGlvbmFsIHByZWRpY2F0ZSBmb3IgZWxpZ2liaWxpdHkgbWF5IGJlIHBhc3NlZC4gSWYgcmVmcmVzaCBpcyBub3RcbiAqIGVuYWJsZWQsIG9yIGZhaWxzIHRoZSBvcHRpb25hbCBwcmVkaWNhdGUsIG51bGwgd2lsbCBiZSByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0geyEuL2FtcC1hNGEuQW1wQTRBfSBhNGFcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpib29sZWFuPX0gb3B0X3ByZWRpY2F0ZVxuICogQHJldHVybiB7P1JlZnJlc2hNYW5hZ2VyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVmcmVzaE1hbmFnZXIoYTRhLCBvcHRfcHJlZGljYXRlKSB7XG4gIGNvbnN0IHJlZnJlc2hJbnRlcnZhbCA9IGdldFB1Ymxpc2hlclNwZWNpZmllZFJlZnJlc2hJbnRlcnZhbChcbiAgICBhNGEuZWxlbWVudCxcbiAgICBhNGEud2luXG4gICk7XG4gIGlmICghcmVmcmVzaEludGVydmFsIHx8IChvcHRfcHJlZGljYXRlICYmICFvcHRfcHJlZGljYXRlKCkpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIG5ldyBSZWZyZXNoTWFuYWdlcihcbiAgICBhNGEsXG4gICAgZGljdCh7XG4gICAgICAndmlzaWJsZVBlcmNlbnRhZ2VNaW4nOiA1MCxcbiAgICAgICdjb250aW51b3VzVGltZU1pbic6IDEsXG4gICAgfSksXG4gICAgcmVmcmVzaEludGVydmFsXG4gICk7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZyZXNoTWFuYWdlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcC1hNGEuQW1wQTRBfSBhNGEgVGhlIEFtcEE0QSBpbnN0YW5jZSB0byBiZSByZWZyZXNoZWQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICAgKiBAcGFyYW0ge251bWJlcn0gcmVmcmVzaEludGVydmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhNGEsIGNvbmZpZywgcmVmcmVzaEludGVydmFsKSB7XG4gICAgLyoqIEBwcml2YXRlIHtzdHJpbmd9ICovXG4gICAgdGhpcy5zdGF0ZV8gPSBSZWZyZXNoTGlmZWN5Y2xlU3RhdGUuSU5JVElBTDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL2FtcC1hNGEuQW1wQTRBfSAqL1xuICAgIHRoaXMuYTRhXyA9IGE0YTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gYTRhLndpbjtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudF8gPSBhNGEuZWxlbWVudDtcblxuICAgIC8qKiBAY29uc3QgQHByb3RlY3RlZCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuYWRUeXBlXyA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCd0eXBlJykudG9Mb3dlckNhc2UoKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgez9udW1iZXJ9ICovXG4gICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWxfID0gcmVmcmVzaEludGVydmFsO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUpzb25PYmplY3R9ICovXG4gICAgdGhpcy5jb25maWdfID0gdGhpcy5jb252ZXJ0QW5kU2FuaXRpemVDb25maWd1cmF0aW9uXyhjb25maWcpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez8obnVtYmVyfHN0cmluZyl9ICovXG4gICAgdGhpcy5yZWZyZXNoVGltZW91dElkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8obnVtYmVyfHN0cmluZyl9ICovXG4gICAgdGhpcy52aXNpYmlsaXR5VGltZW91dElkXyA9IG51bGw7XG5cbiAgICBjb25zdCBtYW5hZ2VySWQgPSBTdHJpbmcocmVmcmVzaE1hbmFnZXJJZENvdW50ZXIrKyk7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoREFUQV9NQU5BR0VSX0lEX05BTUUsIG1hbmFnZXJJZCk7XG4gICAgbWFuYWdlcnNbbWFuYWdlcklkXSA9IHRoaXM7XG4gICAgdGhpcy5pbml0aWF0ZVJlZnJlc2hDeWNsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgY29uZmlndXJlZCB0byB0aGUgZ2l2ZW4gdGhyZXNob2xkLCBjcmVhdGluZ1xuICAgKiBvbmUgaWYgb25lIGRvZXMgbm90IHlldCBleGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRocmVzaG9sZFxuICAgKiBAcmV0dXJuIHshSW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9XG4gICAqL1xuICBnZXRJbnRlcnNlY3Rpb25PYnNlcnZlcldpdGhUaHJlc2hvbGRfKHRocmVzaG9sZCkge1xuICAgIGNvbnN0IHRocmVzaG9sZFN0cmluZyA9IFN0cmluZyh0aHJlc2hvbGQpO1xuICAgIHJldHVybiAoXG4gICAgICBvYnNlcnZlcnNbdGhyZXNob2xkU3RyaW5nXSB8fFxuICAgICAgKG9ic2VydmVyc1t0aHJlc2hvbGRTdHJpbmddID0gbmV3IHRoaXMud2luXy5JbnRlcnNlY3Rpb25PYnNlcnZlcihcbiAgICAgICAgdGhpcy5pb0NhbGxiYWNrXyxcbiAgICAgICAge3RocmVzaG9sZH1cbiAgICAgICkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGludm9rZWQgZGlyZWN0bHkgYnkgdGhlXG4gICAqIEludGVyc2VjdGlvbk9ic2VydmVyIGltcGxlbWVudGF0aW9uLiBJdCB3aWxsIGltcGxlbWVudCB0aGUgY29yZSBsb2dpYyBvZlxuICAgKiB0aGUgcmVmcmVzaCBsaWZlY3ljbGUsIGluY2x1ZGluZyB0aGUgdHJhbnNpdGlvbnMgb2YgdGhlIERGQS5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXk8IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnk+fSBlbnRyaWVzXG4gICAqL1xuICBpb0NhbGxiYWNrXyhlbnRyaWVzKSB7XG4gICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgY29uc3QgcmVmcmVzaE1hbmFnZXJJZCA9IGVudHJ5LnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9NQU5BR0VSX0lEX05BTUUpO1xuICAgICAgZGV2QXNzZXJ0KHJlZnJlc2hNYW5hZ2VySWQpO1xuICAgICAgY29uc3QgcmVmcmVzaE1hbmFnZXIgPSBtYW5hZ2Vyc1tyZWZyZXNoTWFuYWdlcklkXTtcbiAgICAgIGlmIChlbnRyeS50YXJnZXQgIT0gcmVmcmVzaE1hbmFnZXIuZWxlbWVudF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChyZWZyZXNoTWFuYWdlci5zdGF0ZV8pIHtcbiAgICAgICAgY2FzZSBSZWZyZXNoTGlmZWN5Y2xlU3RhdGUuSU5JVElBTDpcbiAgICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGUgZWxlbWVudCBxdWFsaWZpZXMgYXMgXCJiZWluZyBvbiBzY3JlZW5cIiwgaS5lLixcbiAgICAgICAgICAvLyB0aGF0IGF0IGxlYXN0IGEgbWluaW11bSB0aHJlc2hvbGQgb2YgcGl4ZWxzIGlzIG9uIHNjcmVlbi4gSWYgc28sXG4gICAgICAgICAgLy8gYmVnaW4gYSB0aW1lciwgc2V0IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIG1pbmltdW0gdGltZSBvbiBzY3JlZW5cbiAgICAgICAgICAvLyB0aHJlc2hvbGQuIElmIHRoaXMgdGltZXIgcnVucyBvdXQgd2l0aG91dCBpbnRlcnJ1cHRpb24sIHRoZW4gYWxsXG4gICAgICAgICAgLy8gdmlld2FiaWxpdHkgY29uZGl0aW9ucyBoYXZlIGJlZW4gbWV0LCBhbmQgd2UgY2FuIGJlZ2luIHRoZSByZWZyZXNoXG4gICAgICAgICAgLy8gdGltZXIuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPj1cbiAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLmNvbmZpZ19bJ3Zpc2libGVQZXJjZW50YWdlTWluJ11cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLnN0YXRlXyA9IFJlZnJlc2hMaWZlY3ljbGVTdGF0ZS5WSUVXX1BFTkRJTkc7XG4gICAgICAgICAgICByZWZyZXNoTWFuYWdlci52aXNpYmlsaXR5VGltZW91dElkXyA9IHJlZnJlc2hNYW5hZ2VyLnRpbWVyXy5kZWxheShcbiAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLnN0YXRlXyA9IFJlZnJlc2hMaWZlY3ljbGVTdGF0ZS5SRUZSRVNIX1BFTkRJTkc7XG4gICAgICAgICAgICAgICAgcmVmcmVzaE1hbmFnZXIuc3RhcnRSZWZyZXNoVGltZXJfKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLmNvbmZpZ19bJ2NvbnRpbnVvdXNUaW1lTWluJ11cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlZnJlc2hMaWZlY3ljbGVTdGF0ZS5WSUVXX1BFTkRJTkc6XG4gICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgZ29lcyBvZmYgc2NyZWVuIGJlZm9yZSB0aGUgbWluaW11bSBvbiBzY3JlZW4gdGltZVxuICAgICAgICAgIC8vIGR1cmF0aW9uIGVsYXBzZXMsIHBsYWNlIGl0IGJhY2sgaW50byBJTklUSUFMIHN0YXRlLlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGVudHJ5LmludGVyc2VjdGlvblJhdGlvIDxcbiAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLmNvbmZpZ19bJ3Zpc2libGVQZXJjZW50YWdlTWluJ11cbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJlZnJlc2hNYW5hZ2VyLnRpbWVyXy5jYW5jZWwocmVmcmVzaE1hbmFnZXIudmlzaWJpbGl0eVRpbWVvdXRJZF8pO1xuICAgICAgICAgICAgcmVmcmVzaE1hbmFnZXIudmlzaWJpbGl0eVRpbWVvdXRJZF8gPSBudWxsO1xuICAgICAgICAgICAgcmVmcmVzaE1hbmFnZXIuc3RhdGVfID0gUmVmcmVzaExpZmVjeWNsZVN0YXRlLklOSVRJQUw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlZnJlc2hMaWZlY3ljbGVTdGF0ZS5SRUZSRVNIX1BFTkRJTkc6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGVzIHRoZSByZWZyZXNoIGN5Y2xlIGJ5IGluaXRpYXRpbmcgdGhlIHZpc2liaWxpdHkgbWFuYWdlciBvbiB0aGVcbiAgICogZWxlbWVudC5cbiAgICovXG4gIGluaXRpYXRlUmVmcmVzaEN5Y2xlKCkge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0ZV8pIHtcbiAgICAgIGNhc2UgUmVmcmVzaExpZmVjeWNsZVN0YXRlLklOSVRJQUw6XG4gICAgICAgIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2JzZXJ2ZXJXaXRoVGhyZXNob2xkXyhcbiAgICAgICAgICB0aGlzLmNvbmZpZ19bJ3Zpc2libGVQZXJjZW50YWdlTWluJ11cbiAgICAgICAgKS5vYnNlcnZlKHRoaXMuZWxlbWVudF8pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUmVmcmVzaExpZmVjeWNsZVN0YXRlLlJFRlJFU0hfUEVORElORzpcbiAgICAgIGNhc2UgUmVmcmVzaExpZmVjeWNsZVN0YXRlLlZJRVdfUEVORElORzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHJlZnJlc2ggdGltZXIgZm9yIHRoZSBnaXZlbiBtb25pdG9yZWQgZWxlbWVudC5cbiAgICpcbiAgICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRydWUgd2hlbiB0aGVcbiAgICogICAgcmVmcmVzaCB0aW1lciBlbGFwc2VzIHN1Y2Nlc3NmdWxseS5cbiAgICovXG4gIHN0YXJ0UmVmcmVzaFRpbWVyXygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpbWVvdXRJZF8gPSB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGVfID0gUmVmcmVzaExpZmVjeWNsZVN0YXRlLklOSVRJQUw7XG4gICAgICAgIHRoaXMudW5vYnNlcnZlKCk7XG4gICAgICAgIHRoaXMuYTRhXy5yZWZyZXNoKCgpID0+IHRoaXMuaW5pdGlhdGVSZWZyZXNoQ3ljbGUoKSk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9LCAvKiogQHR5cGUge251bWJlcn0gKi8gKHRoaXMucmVmcmVzaEludGVydmFsXykpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGNvbmZpZyB0byBhcHByb3ByaWF0ZSB1bml0cywgbW9kaWZ5aW5nIHRoZSBhcmd1bWVudCBpbiBwbGFjZS4gVGhpc1xuICAgKiBhbHNvIGVuc3VyZXMgdGhhdCB2aXNpYmxlUGVyY2VudGFnZU1pbiBpcyBpbiB0aGUgcmFuZ2Ugb2YgWzAsIDEwMF0uXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAgICovXG4gIGNvbnZlcnRBbmRTYW5pdGl6ZUNvbmZpZ3VyYXRpb25fKGNvbmZpZykge1xuICAgIGRldkFzc2VydChcbiAgICAgIGNvbmZpZ1sndmlzaWJsZVBlcmNlbnRhZ2VNaW4nXSA+PSAwICYmXG4gICAgICAgIGNvbmZpZ1sndmlzaWJsZVBlcmNlbnRhZ2VNaW4nXSA8PSAxMDAsXG4gICAgICAndmlzaWJsZVBlcmNlbnRhZ2VNaW4gZm9yIHJlZnJlc2ggbXVzdCBiZSBpbiB0aGUgcmFuZ2UgWzAsIDEwMF0nXG4gICAgKTtcbiAgICAvLyBDb252ZXJ0IHNlY29uZHMgdG8gbWlsbGlzZWNvbmRzLlxuICAgIGNvbmZpZ1snY29udGludW91c1RpbWVNaW4nXSAqPSAxMDAwO1xuICAgIGNvbmZpZ1sndmlzaWJsZVBlcmNlbnRhZ2VNaW4nXSAvPSAxMDA7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGZyb20gb2JzZXJ2aW5nIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgdW5vYnNlcnZlKCkge1xuICAgIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2JzZXJ2ZXJXaXRoVGhyZXNob2xkXyhcbiAgICAgIHRoaXMuY29uZmlnX1sndmlzaWJsZVBlcmNlbnRhZ2VNaW4nXVxuICAgICkudW5vYnNlcnZlKHRoaXMuZWxlbWVudF8pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/refresh-manager.js