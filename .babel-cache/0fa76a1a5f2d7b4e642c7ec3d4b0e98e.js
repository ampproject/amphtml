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
import { AmpStoryEventTracker, AnalyticsEvent, AnalyticsEventType, CustomEventTracker, getTrackerKeyName } from "./events";
import { AmpdocAnalyticsRoot, EmbedAnalyticsRoot } from "./analytics-root";
import { AnalyticsGroup } from "./analytics-group";
import { Services } from "../../../src/service";
import { dict } from "../../../src/core/types/object";
import { getFriendlyIframeEmbedOptional } from "../../../src/iframe-helper";
import { getParentWindowFrameElement, getServiceForDoc, getServicePromiseForDoc, registerServiceBuilderForDoc } from "../../../src/service-helpers";
var PROP = '__AMP_AN_ROOT';

/**
 * @implements {../../../src/service.Disposable}
 * @package
 * @visibleForTesting
 */
export var InstrumentationService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function InstrumentationService(ampdoc) {
    _classCallCheck(this, InstrumentationService);

    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.root_ = this.findRoot_(ampdoc.getRootNode());
  }

  /** @override */
  _createClass(InstrumentationService, [{
    key: "dispose",
    value: function dispose() {
      this.root_.dispose();
    }
    /**
     * @param {!Node} context
     * @return {!./analytics-root.AnalyticsRoot}
     */

  }, {
    key: "getAnalyticsRoot",
    value: function getAnalyticsRoot(context) {
      return this.findRoot_(context);
    }
    /**
     * @param {!Element} analyticsElement
     * @return {!AnalyticsGroup}
     */

  }, {
    key: "createAnalyticsGroup",
    value: function createAnalyticsGroup(analyticsElement) {
      var root = this.findRoot_(analyticsElement);
      return new AnalyticsGroup(root, analyticsElement);
    }
    /**
     * @param {string} trackerName
     * @private
     */

  }, {
    key: "getTrackerClass_",
    value: function getTrackerClass_(trackerName) {
      switch (trackerName) {
        case AnalyticsEventType.STORY:
          return AmpStoryEventTracker;

        default:
          return CustomEventTracker;
      }
    }
    /**
     * Triggers the analytics event with the specified type.
     *
     * @param {!Element} target
     * @param {string} eventType
     * @param {!JsonObject} vars A map of vars and their values.
     * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
     * attribute value from target element should be included.
     */

  }, {
    key: "triggerEventForTarget",
    value: function triggerEventForTarget(target, eventType, vars, enableDataVars) {
      if (vars === void 0) {
        vars = dict();
      }

      if (enableDataVars === void 0) {
        enableDataVars = true;
      }

      var event = new AnalyticsEvent(target, eventType, vars, enableDataVars);
      var root = this.findRoot_(target);
      var trackerName = getTrackerKeyName(eventType);
      var tracker =
      /** @type {!CustomEventTracker|!AmpStoryEventTracker} */
      root.getTracker(trackerName, this.getTrackerClass_(trackerName));
      tracker.trigger(event);
    }
    /**
     * @param {!Node} context
     * @return {!./analytics-root.AnalyticsRoot}
     */

  }, {
    key: "findRoot_",
    value: function findRoot_(context) {
      // TODO(#22733): cleanup when ampdoc-fie is launched. Just use
      // `ampdoc.getParent()`.
      var ampdoc = Services.ampdoc(context);
      var frame = getParentWindowFrameElement(context);
      var embed = frame && getFriendlyIframeEmbedOptional(frame);

      if (ampdoc == this.ampdoc && !embed && this.root_) {
        // Main root already exists.
        return this.root_;
      }

      return this.getOrCreateRoot_(embed || ampdoc, function () {
        if (embed) {
          return new EmbedAnalyticsRoot(ampdoc, embed);
        }

        return new AmpdocAnalyticsRoot(ampdoc);
      });
    }
    /**
     * @param {!Object} holder
     * @param {function():!./analytics-root.AnalyticsRoot} factory
     * @return {!./analytics-root.AnalyticsRoot}
     */

  }, {
    key: "getOrCreateRoot_",
    value: function getOrCreateRoot_(holder, factory) {
      var root =
      /** @type {?./analytics-root.AnalyticsRoot} */
      holder[PROP];

      if (!root) {
        root = factory();
        holder[PROP] = root;
      }

      return root;
    }
  }]);

  return InstrumentationService;
}();

/**
 * It's important to resolve instrumentation asynchronously in elements that
 * depends on it in multi-doc scope. Otherwise an element life-cycle could
 * resolve way before we have the service available.
 *
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<InstrumentationService>}
 */
export function instrumentationServicePromiseForDoc(elementOrAmpDoc) {
  return (
    /** @type {!Promise<InstrumentationService>} */
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation')
  );
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!InstrumentationService}
 */
export function instrumentationServiceForDocForTesting(elementOrAmpDoc) {
  registerServiceBuilderForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation', InstrumentationService);
  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluc3RydW1lbnRhdGlvbi5qcyJdLCJuYW1lcyI6WyJBbXBTdG9yeUV2ZW50VHJhY2tlciIsIkFuYWx5dGljc0V2ZW50IiwiQW5hbHl0aWNzRXZlbnRUeXBlIiwiQ3VzdG9tRXZlbnRUcmFja2VyIiwiZ2V0VHJhY2tlcktleU5hbWUiLCJBbXBkb2NBbmFseXRpY3NSb290IiwiRW1iZWRBbmFseXRpY3NSb290IiwiQW5hbHl0aWNzR3JvdXAiLCJTZXJ2aWNlcyIsImRpY3QiLCJnZXRGcmllbmRseUlmcmFtZUVtYmVkT3B0aW9uYWwiLCJnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQiLCJnZXRTZXJ2aWNlRm9yRG9jIiwiZ2V0U2VydmljZVByb21pc2VGb3JEb2MiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiUFJPUCIsIkluc3RydW1lbnRhdGlvblNlcnZpY2UiLCJhbXBkb2MiLCJyb290XyIsImZpbmRSb290XyIsImdldFJvb3ROb2RlIiwiZGlzcG9zZSIsImNvbnRleHQiLCJhbmFseXRpY3NFbGVtZW50Iiwicm9vdCIsInRyYWNrZXJOYW1lIiwiU1RPUlkiLCJ0YXJnZXQiLCJldmVudFR5cGUiLCJ2YXJzIiwiZW5hYmxlRGF0YVZhcnMiLCJldmVudCIsInRyYWNrZXIiLCJnZXRUcmFja2VyIiwiZ2V0VHJhY2tlckNsYXNzXyIsInRyaWdnZXIiLCJmcmFtZSIsImVtYmVkIiwiZ2V0T3JDcmVhdGVSb290XyIsImhvbGRlciIsImZhY3RvcnkiLCJpbnN0cnVtZW50YXRpb25TZXJ2aWNlUHJvbWlzZUZvckRvYyIsImVsZW1lbnRPckFtcERvYyIsImluc3RydW1lbnRhdGlvblNlcnZpY2VGb3JEb2NGb3JUZXN0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxvQkFERixFQUVFQyxjQUZGLEVBR0VD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UCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBbXBTdG9yeUV2ZW50VHJhY2tlcixcbiAgQW5hbHl0aWNzRXZlbnQsXG4gIEFuYWx5dGljc0V2ZW50VHlwZSxcbiAgQ3VzdG9tRXZlbnRUcmFja2VyLFxuICBnZXRUcmFja2VyS2V5TmFtZSxcbn0gZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHtBbXBkb2NBbmFseXRpY3NSb290LCBFbWJlZEFuYWx5dGljc1Jvb3R9IGZyb20gJy4vYW5hbHl0aWNzLXJvb3QnO1xuaW1wb3J0IHtBbmFseXRpY3NHcm91cH0gZnJvbSAnLi9hbmFseXRpY3MtZ3JvdXAnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRGcmllbmRseUlmcmFtZUVtYmVkT3B0aW9uYWx9IGZyb20gJy4uLy4uLy4uL3NyYy9pZnJhbWUtaGVscGVyJztcbmltcG9ydCB7XG4gIGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudCxcbiAgZ2V0U2VydmljZUZvckRvYyxcbiAgZ2V0U2VydmljZVByb21pc2VGb3JEb2MsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuXG5jb25zdCBQUk9QID0gJ19fQU1QX0FOX1JPT1QnO1xuXG4vKipcbiAqIEBpbXBsZW1lbnRzIHsuLi8uLi8uLi9zcmMvc2VydmljZS5EaXNwb3NhYmxlfVxuICogQHBhY2thZ2VcbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgSW5zdHJ1bWVudGF0aW9uU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMucm9vdF8gPSB0aGlzLmZpbmRSb290XyhhbXBkb2MuZ2V0Um9vdE5vZGUoKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5yb290Xy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTm9kZX0gY29udGV4dFxuICAgKiBAcmV0dXJuIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fVxuICAgKi9cbiAgZ2V0QW5hbHl0aWNzUm9vdChjb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb3RfKGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGFuYWx5dGljc0VsZW1lbnRcbiAgICogQHJldHVybiB7IUFuYWx5dGljc0dyb3VwfVxuICAgKi9cbiAgY3JlYXRlQW5hbHl0aWNzR3JvdXAoYW5hbHl0aWNzRWxlbWVudCkge1xuICAgIGNvbnN0IHJvb3QgPSB0aGlzLmZpbmRSb290XyhhbmFseXRpY3NFbGVtZW50KTtcbiAgICByZXR1cm4gbmV3IEFuYWx5dGljc0dyb3VwKHJvb3QsIGFuYWx5dGljc0VsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFja2VyTmFtZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VHJhY2tlckNsYXNzXyh0cmFja2VyTmFtZSkge1xuICAgIHN3aXRjaCAodHJhY2tlck5hbWUpIHtcbiAgICAgIGNhc2UgQW5hbHl0aWNzRXZlbnRUeXBlLlNUT1JZOlxuICAgICAgICByZXR1cm4gQW1wU3RvcnlFdmVudFRyYWNrZXI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQ3VzdG9tRXZlbnRUcmFja2VyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB0aGUgYW5hbHl0aWNzIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCB0eXBlLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSB2YXJzIEEgbWFwIG9mIHZhcnMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICogQHBhcmFtIHtib29sZWFufSBlbmFibGVEYXRhVmFycyBBIGJvb2xlYW4gdG8gaW5kaWNhdGUgaWYgZGF0YS12YXJzLSpcbiAgICogYXR0cmlidXRlIHZhbHVlIGZyb20gdGFyZ2V0IGVsZW1lbnQgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgKi9cbiAgdHJpZ2dlckV2ZW50Rm9yVGFyZ2V0KFxuICAgIHRhcmdldCxcbiAgICBldmVudFR5cGUsXG4gICAgdmFycyA9IGRpY3QoKSxcbiAgICBlbmFibGVEYXRhVmFycyA9IHRydWVcbiAgKSB7XG4gICAgY29uc3QgZXZlbnQgPSBuZXcgQW5hbHl0aWNzRXZlbnQodGFyZ2V0LCBldmVudFR5cGUsIHZhcnMsIGVuYWJsZURhdGFWYXJzKTtcbiAgICBjb25zdCByb290ID0gdGhpcy5maW5kUm9vdF8odGFyZ2V0KTtcbiAgICBjb25zdCB0cmFja2VyTmFtZSA9IGdldFRyYWNrZXJLZXlOYW1lKGV2ZW50VHlwZSk7XG4gICAgY29uc3QgdHJhY2tlciA9IC8qKiBAdHlwZSB7IUN1c3RvbUV2ZW50VHJhY2tlcnwhQW1wU3RvcnlFdmVudFRyYWNrZXJ9ICovIChcbiAgICAgIHJvb3QuZ2V0VHJhY2tlcih0cmFja2VyTmFtZSwgdGhpcy5nZXRUcmFja2VyQ2xhc3NfKHRyYWNrZXJOYW1lKSlcbiAgICApO1xuICAgIHRyYWNrZXIudHJpZ2dlcihldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTm9kZX0gY29udGV4dFxuICAgKiBAcmV0dXJuIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fVxuICAgKi9cbiAgZmluZFJvb3RfKGNvbnRleHQpIHtcbiAgICAvLyBUT0RPKCMyMjczMyk6IGNsZWFudXAgd2hlbiBhbXBkb2MtZmllIGlzIGxhdW5jaGVkLiBKdXN0IHVzZVxuICAgIC8vIGBhbXBkb2MuZ2V0UGFyZW50KClgLlxuICAgIGNvbnN0IGFtcGRvYyA9IFNlcnZpY2VzLmFtcGRvYyhjb250ZXh0KTtcbiAgICBjb25zdCBmcmFtZSA9IGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudChjb250ZXh0KTtcbiAgICBjb25zdCBlbWJlZCA9IGZyYW1lICYmIGdldEZyaWVuZGx5SWZyYW1lRW1iZWRPcHRpb25hbChmcmFtZSk7XG4gICAgaWYgKGFtcGRvYyA9PSB0aGlzLmFtcGRvYyAmJiAhZW1iZWQgJiYgdGhpcy5yb290Xykge1xuICAgICAgLy8gTWFpbiByb290IGFscmVhZHkgZXhpc3RzLlxuICAgICAgcmV0dXJuIHRoaXMucm9vdF87XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldE9yQ3JlYXRlUm9vdF8oZW1iZWQgfHwgYW1wZG9jLCAoKSA9PiB7XG4gICAgICBpZiAoZW1iZWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFbWJlZEFuYWx5dGljc1Jvb3QoYW1wZG9jLCBlbWJlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEFtcGRvY0FuYWx5dGljc1Jvb3QoYW1wZG9jKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFPYmplY3R9IGhvbGRlclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6IS4vYW5hbHl0aWNzLXJvb3QuQW5hbHl0aWNzUm9vdH0gZmFjdG9yeVxuICAgKiBAcmV0dXJuIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fVxuICAgKi9cbiAgZ2V0T3JDcmVhdGVSb290Xyhob2xkZXIsIGZhY3RvcnkpIHtcbiAgICBsZXQgcm9vdCA9IC8qKiBAdHlwZSB7Py4vYW5hbHl0aWNzLXJvb3QuQW5hbHl0aWNzUm9vdH0gKi8gKGhvbGRlcltQUk9QXSk7XG4gICAgaWYgKCFyb290KSB7XG4gICAgICByb290ID0gZmFjdG9yeSgpO1xuICAgICAgaG9sZGVyW1BST1BdID0gcm9vdDtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cbn1cblxuLyoqXG4gKiBJdCdzIGltcG9ydGFudCB0byByZXNvbHZlIGluc3RydW1lbnRhdGlvbiBhc3luY2hyb25vdXNseSBpbiBlbGVtZW50cyB0aGF0XG4gKiBkZXBlbmRzIG9uIGl0IGluIG11bHRpLWRvYyBzY29wZS4gT3RoZXJ3aXNlIGFuIGVsZW1lbnQgbGlmZS1jeWNsZSBjb3VsZFxuICogcmVzb2x2ZSB3YXkgYmVmb3JlIHdlIGhhdmUgdGhlIHNlcnZpY2UgYXZhaWxhYmxlLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR8IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gKiBAcmV0dXJuIHshUHJvbWlzZTxJbnN0cnVtZW50YXRpb25TZXJ2aWNlPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RydW1lbnRhdGlvblNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTxJbnN0cnVtZW50YXRpb25TZXJ2aWNlPn0gKi8gKFxuICAgIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJylcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHJldHVybiB7IUluc3RydW1lbnRhdGlvblNlcnZpY2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0cnVtZW50YXRpb25TZXJ2aWNlRm9yRG9jRm9yVGVzdGluZyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBlbGVtZW50T3JBbXBEb2MsXG4gICAgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJyxcbiAgICBJbnN0cnVtZW50YXRpb25TZXJ2aWNlXG4gICk7XG4gIHJldHVybiBnZXRTZXJ2aWNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJyk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/instrumentation.js