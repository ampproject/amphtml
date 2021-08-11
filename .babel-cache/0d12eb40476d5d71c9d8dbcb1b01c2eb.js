function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { ChunkPriority, chunk } from "../../../src/chunk";
import { Deferred } from "../../../src/core/data-structures/promise";
import { dev, userAssert } from "../../../src/log";
import { getMode } from "../../../src/mode";
import { getTrackerKeyName, getTrackerTypesForParentType } from "./events";
import { toWin } from "../../../src/core/window";

/**
 * @const {number}
 * We want to execute the first trigger immediately to reduce the viewability
 * delay as much as possible.
 */
var IMMEDIATE_TRIGGER_THRES = 1;

/** @const {number} */
var HIGH_PRIORITY_TRIGGER_THRES = 3;

/**
 * Represents the group of analytics triggers for a single config. All triggers
 * are declared and released at the same time.
 *
 * @implements {../../../src/service.Disposable}
 */
export var AnalyticsGroup = /*#__PURE__*/function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   * @param {!Element} analyticsElement
   */
  function AnalyticsGroup(root, analyticsElement) {
    _classCallCheck(this, AnalyticsGroup);

    /** @const */
    this.root_ = root;

    /** @const */
    this.analyticsElement_ = analyticsElement;

    /** @private @const {!Array<!UnlistenDef>} */
    this.listeners_ = [];

    /** @private {number} */
    this.triggerCount_ = 0;

    /** @private @const {!Window} */
    this.win_ = toWin(analyticsElement.ownerDocument.defaultView);
  }

  /** @override */
  _createClass(AnalyticsGroup, [{
    key: "dispose",
    value: function dispose() {
      this.listeners_.forEach(function (listener) {
        listener();
      });
    }
    /**
     * Adds a trigger with the specified config and listener. The config must
     * contain `on` property specifying the type of the event.
     *
     * Triggers registered on a group are automatically released when the
     * group is disposed.
     *
     * @param {!JsonObject} config
     * @param {function(!./events.AnalyticsEvent)} handler
     * @return {!Promise}
     */

  }, {
    key: "addTrigger",
    value: function addTrigger(config, handler) {
      var _this = this;

      var eventType = dev().assertString(config['on']);
      var trackerKey = getTrackerKeyName(eventType);
      var trackerAllowlist = getTrackerTypesForParentType(this.root_.getType());
      var tracker = this.root_.getTrackerForAllowlist(trackerKey, trackerAllowlist);
      userAssert(!!tracker, 'Trigger type "%s" is not allowed in the %s', eventType, this.root_.getType());
      var unlisten;
      var deferred = new Deferred();

      var task = function task() {
        unlisten = tracker.add(_this.analyticsElement_, eventType, config, handler);

        _this.listeners_.push(unlisten);

        deferred.resolve();
      };

      if (this.triggerCount_ < IMMEDIATE_TRIGGER_THRES || getMode(this.win_).runtime == 'inabox') {
        task();
      } else {
        var priority = this.triggerCount_ < HIGH_PRIORITY_TRIGGER_THRES ? ChunkPriority.HIGH : ChunkPriority.LOW;
        chunk(this.analyticsElement_, task, priority);
      }

      this.triggerCount_++;
      return deferred.promise;
    }
  }]);

  return AnalyticsGroup;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuYWx5dGljcy1ncm91cC5qcyJdLCJuYW1lcyI6WyJDaHVua1ByaW9yaXR5IiwiY2h1bmsiLCJEZWZlcnJlZCIsImRldiIsInVzZXJBc3NlcnQiLCJnZXRNb2RlIiwiZ2V0VHJhY2tlcktleU5hbWUiLCJnZXRUcmFja2VyVHlwZXNGb3JQYXJlbnRUeXBlIiwidG9XaW4iLCJJTU1FRElBVEVfVFJJR0dFUl9USFJFUyIsIkhJR0hfUFJJT1JJVFlfVFJJR0dFUl9USFJFUyIsIkFuYWx5dGljc0dyb3VwIiwicm9vdCIsImFuYWx5dGljc0VsZW1lbnQiLCJyb290XyIsImFuYWx5dGljc0VsZW1lbnRfIiwibGlzdGVuZXJzXyIsInRyaWdnZXJDb3VudF8iLCJ3aW5fIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiY29uZmlnIiwiaGFuZGxlciIsImV2ZW50VHlwZSIsImFzc2VydFN0cmluZyIsInRyYWNrZXJLZXkiLCJ0cmFja2VyQWxsb3dsaXN0IiwiZ2V0VHlwZSIsInRyYWNrZXIiLCJnZXRUcmFja2VyRm9yQWxsb3dsaXN0IiwidW5saXN0ZW4iLCJkZWZlcnJlZCIsInRhc2siLCJhZGQiLCJwdXNoIiwicmVzb2x2ZSIsInJ1bnRpbWUiLCJwcmlvcml0eSIsIkhJR0giLCJMT1ciLCJwcm9taXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSLEVBQXVCQyxLQUF2QjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFVBQWI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsaUJBQVIsRUFBMkJDLDRCQUEzQjtBQUNBLFNBQVFDLEtBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLHVCQUF1QixHQUFHLENBQWhDOztBQUVBO0FBQ0EsSUFBTUMsMkJBQTJCLEdBQUcsQ0FBcEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsY0FBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsMEJBQVlDLElBQVosRUFBa0JDLGdCQUFsQixFQUFvQztBQUFBOztBQUNsQztBQUNBLFNBQUtDLEtBQUwsR0FBYUYsSUFBYjs7QUFDQTtBQUNBLFNBQUtHLGlCQUFMLEdBQXlCRixnQkFBekI7O0FBRUE7QUFDQSxTQUFLRyxVQUFMLEdBQWtCLEVBQWxCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixDQUFyQjs7QUFFQTtBQUNBLFNBQUtDLElBQUwsR0FBWVYsS0FBSyxDQUFDSyxnQkFBZ0IsQ0FBQ00sYUFBakIsQ0FBK0JDLFdBQWhDLENBQWpCO0FBQ0Q7O0FBRUQ7QUFyQkY7QUFBQTtBQUFBLFdBc0JFLG1CQUFVO0FBQ1IsV0FBS0osVUFBTCxDQUFnQkssT0FBaEIsQ0FBd0IsVUFBQ0MsUUFBRCxFQUFjO0FBQ3BDQSxRQUFBQSxRQUFRO0FBQ1QsT0FGRDtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF0Q0E7QUFBQTtBQUFBLFdBdUNFLG9CQUFXQyxNQUFYLEVBQW1CQyxPQUFuQixFQUE0QjtBQUFBOztBQUMxQixVQUFNQyxTQUFTLEdBQUd0QixHQUFHLEdBQUd1QixZQUFOLENBQW1CSCxNQUFNLENBQUMsSUFBRCxDQUF6QixDQUFsQjtBQUNBLFVBQU1JLFVBQVUsR0FBR3JCLGlCQUFpQixDQUFDbUIsU0FBRCxDQUFwQztBQUNBLFVBQU1HLGdCQUFnQixHQUFHckIsNEJBQTRCLENBQUMsS0FBS08sS0FBTCxDQUFXZSxPQUFYLEVBQUQsQ0FBckQ7QUFFQSxVQUFNQyxPQUFPLEdBQUcsS0FBS2hCLEtBQUwsQ0FBV2lCLHNCQUFYLENBQ2RKLFVBRGMsRUFFZEMsZ0JBRmMsQ0FBaEI7QUFJQXhCLE1BQUFBLFVBQVUsQ0FDUixDQUFDLENBQUMwQixPQURNLEVBRVIsNENBRlEsRUFHUkwsU0FIUSxFQUlSLEtBQUtYLEtBQUwsQ0FBV2UsT0FBWCxFQUpRLENBQVY7QUFNQSxVQUFJRyxRQUFKO0FBQ0EsVUFBTUMsUUFBUSxHQUFHLElBQUkvQixRQUFKLEVBQWpCOztBQUNBLFVBQU1nQyxJQUFJLEdBQUcsU0FBUEEsSUFBTyxHQUFNO0FBQ2pCRixRQUFBQSxRQUFRLEdBQUdGLE9BQU8sQ0FBQ0ssR0FBUixDQUNULEtBQUksQ0FBQ3BCLGlCQURJLEVBRVRVLFNBRlMsRUFHVEYsTUFIUyxFQUlUQyxPQUpTLENBQVg7O0FBTUEsUUFBQSxLQUFJLENBQUNSLFVBQUwsQ0FBZ0JvQixJQUFoQixDQUFxQkosUUFBckI7O0FBQ0FDLFFBQUFBLFFBQVEsQ0FBQ0ksT0FBVDtBQUNELE9BVEQ7O0FBVUEsVUFDRSxLQUFLcEIsYUFBTCxHQUFxQlIsdUJBQXJCLElBQ0FKLE9BQU8sQ0FBQyxLQUFLYSxJQUFOLENBQVAsQ0FBbUJvQixPQUFuQixJQUE4QixRQUZoQyxFQUdFO0FBQ0FKLFFBQUFBLElBQUk7QUFDTCxPQUxELE1BS087QUFDTCxZQUFNSyxRQUFRLEdBQ1osS0FBS3RCLGFBQUwsR0FBcUJQLDJCQUFyQixHQUNJVixhQUFhLENBQUN3QyxJQURsQixHQUVJeEMsYUFBYSxDQUFDeUMsR0FIcEI7QUFJQXhDLFFBQUFBLEtBQUssQ0FBQyxLQUFLYyxpQkFBTixFQUF5Qm1CLElBQXpCLEVBQStCSyxRQUEvQixDQUFMO0FBQ0Q7O0FBQ0QsV0FBS3RCLGFBQUw7QUFDQSxhQUFPZ0IsUUFBUSxDQUFDUyxPQUFoQjtBQUNEO0FBaEZIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtDaHVua1ByaW9yaXR5LCBjaHVua30gZnJvbSAnLi4vLi4vLi4vc3JjL2NodW5rJztcbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7ZGV2LCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtnZXRUcmFja2VyS2V5TmFtZSwgZ2V0VHJhY2tlclR5cGVzRm9yUGFyZW50VHlwZX0gZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnI2NvcmUvd2luZG93JztcblxuLyoqXG4gKiBAY29uc3Qge251bWJlcn1cbiAqIFdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgZmlyc3QgdHJpZ2dlciBpbW1lZGlhdGVseSB0byByZWR1Y2UgdGhlIHZpZXdhYmlsaXR5XG4gKiBkZWxheSBhcyBtdWNoIGFzIHBvc3NpYmxlLlxuICovXG5jb25zdCBJTU1FRElBVEVfVFJJR0dFUl9USFJFUyA9IDE7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IEhJR0hfUFJJT1JJVFlfVFJJR0dFUl9USFJFUyA9IDM7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgZ3JvdXAgb2YgYW5hbHl0aWNzIHRyaWdnZXJzIGZvciBhIHNpbmdsZSBjb25maWcuIEFsbCB0cmlnZ2Vyc1xuICogYXJlIGRlY2xhcmVkIGFuZCByZWxlYXNlZCBhdCB0aGUgc2FtZSB0aW1lLlxuICpcbiAqIEBpbXBsZW1lbnRzIHsuLi8uLi8uLi9zcmMvc2VydmljZS5EaXNwb3NhYmxlfVxuICovXG5leHBvcnQgY2xhc3MgQW5hbHl0aWNzR3JvdXAge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290XG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGFuYWx5dGljc0VsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3QsIGFuYWx5dGljc0VsZW1lbnQpIHtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy5yb290XyA9IHJvb3Q7XG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMuYW5hbHl0aWNzRWxlbWVudF8gPSBhbmFseXRpY3NFbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PCFVbmxpc3RlbkRlZj59ICovXG4gICAgdGhpcy5saXN0ZW5lcnNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnRyaWdnZXJDb3VudF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB0b1dpbihhbmFseXRpY3NFbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMubGlzdGVuZXJzXy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdHJpZ2dlciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnIGFuZCBsaXN0ZW5lci4gVGhlIGNvbmZpZyBtdXN0XG4gICAqIGNvbnRhaW4gYG9uYCBwcm9wZXJ0eSBzcGVjaWZ5aW5nIHRoZSB0eXBlIG9mIHRoZSBldmVudC5cbiAgICpcbiAgICogVHJpZ2dlcnMgcmVnaXN0ZXJlZCBvbiBhIGdyb3VwIGFyZSBhdXRvbWF0aWNhbGx5IHJlbGVhc2VkIHdoZW4gdGhlXG4gICAqIGdyb3VwIGlzIGRpc3Bvc2VkLlxuICAgKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHBhcmFtIHtmdW5jdGlvbighLi9ldmVudHMuQW5hbHl0aWNzRXZlbnQpfSBoYW5kbGVyXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgYWRkVHJpZ2dlcihjb25maWcsIGhhbmRsZXIpIHtcbiAgICBjb25zdCBldmVudFR5cGUgPSBkZXYoKS5hc3NlcnRTdHJpbmcoY29uZmlnWydvbiddKTtcbiAgICBjb25zdCB0cmFja2VyS2V5ID0gZ2V0VHJhY2tlcktleU5hbWUoZXZlbnRUeXBlKTtcbiAgICBjb25zdCB0cmFja2VyQWxsb3dsaXN0ID0gZ2V0VHJhY2tlclR5cGVzRm9yUGFyZW50VHlwZSh0aGlzLnJvb3RfLmdldFR5cGUoKSk7XG5cbiAgICBjb25zdCB0cmFja2VyID0gdGhpcy5yb290Xy5nZXRUcmFja2VyRm9yQWxsb3dsaXN0KFxuICAgICAgdHJhY2tlcktleSxcbiAgICAgIHRyYWNrZXJBbGxvd2xpc3RcbiAgICApO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICAhIXRyYWNrZXIsXG4gICAgICAnVHJpZ2dlciB0eXBlIFwiJXNcIiBpcyBub3QgYWxsb3dlZCBpbiB0aGUgJXMnLFxuICAgICAgZXZlbnRUeXBlLFxuICAgICAgdGhpcy5yb290Xy5nZXRUeXBlKClcbiAgICApO1xuICAgIGxldCB1bmxpc3RlbjtcbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIGNvbnN0IHRhc2sgPSAoKSA9PiB7XG4gICAgICB1bmxpc3RlbiA9IHRyYWNrZXIuYWRkKFxuICAgICAgICB0aGlzLmFuYWx5dGljc0VsZW1lbnRfLFxuICAgICAgICBldmVudFR5cGUsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgaGFuZGxlclxuICAgICAgKTtcbiAgICAgIHRoaXMubGlzdGVuZXJzXy5wdXNoKHVubGlzdGVuKTtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICB9O1xuICAgIGlmIChcbiAgICAgIHRoaXMudHJpZ2dlckNvdW50XyA8IElNTUVESUFURV9UUklHR0VSX1RIUkVTIHx8XG4gICAgICBnZXRNb2RlKHRoaXMud2luXykucnVudGltZSA9PSAnaW5hYm94J1xuICAgICkge1xuICAgICAgdGFzaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmlvcml0eSA9XG4gICAgICAgIHRoaXMudHJpZ2dlckNvdW50XyA8IEhJR0hfUFJJT1JJVFlfVFJJR0dFUl9USFJFU1xuICAgICAgICAgID8gQ2h1bmtQcmlvcml0eS5ISUdIXG4gICAgICAgICAgOiBDaHVua1ByaW9yaXR5LkxPVztcbiAgICAgIGNodW5rKHRoaXMuYW5hbHl0aWNzRWxlbWVudF8sIHRhc2ssIHByaW9yaXR5KTtcbiAgICB9XG4gICAgdGhpcy50cmlnZ2VyQ291bnRfKys7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/analytics-group.js