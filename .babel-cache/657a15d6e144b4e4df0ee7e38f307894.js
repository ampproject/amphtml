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

import {
AmpStoryEventTracker,
AnalyticsEvent,
AnalyticsEventType,
CustomEventTracker,
getTrackerKeyName } from "./events";

import { AmpdocAnalyticsRoot, EmbedAnalyticsRoot } from "./analytics-root";
import { AnalyticsGroup } from "./analytics-group";
import { Services } from "../../../src/service";
import { dict } from "../../../src/core/types/object";
import { getFriendlyIframeEmbedOptional } from "../../../src/iframe-helper";
import {
getParentWindowFrameElement,
getServiceForDoc,
getServicePromiseForDoc,
registerServiceBuilderForDoc } from "../../../src/service-helpers";


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
  function InstrumentationService(ampdoc) {_classCallCheck(this, InstrumentationService);
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.root_ = this.findRoot_(ampdoc.getRootNode());
  }

  /** @override */_createClass(InstrumentationService, [{ key: "dispose", value:
    function dispose() {
      this.root_.dispose();
    }

    /**
     * @param {!Node} context
     * @return {!./analytics-root.AnalyticsRoot}
     */ }, { key: "getAnalyticsRoot", value:
    function getAnalyticsRoot(context) {
      return this.findRoot_(context);
    }

    /**
     * @param {!Element} analyticsElement
     * @return {!AnalyticsGroup}
     */ }, { key: "createAnalyticsGroup", value:
    function createAnalyticsGroup(analyticsElement) {
      var root = this.findRoot_(analyticsElement);
      return new AnalyticsGroup(root, analyticsElement);
    }

    /**
     * @param {string} trackerName
     * @private
     */ }, { key: "getTrackerClass_", value:
    function getTrackerClass_(trackerName) {
      switch (trackerName) {
        case AnalyticsEventType.STORY:
          return AmpStoryEventTracker;
        default:
          return CustomEventTracker;}

    }

    /**
     * Triggers the analytics event with the specified type.
     *
     * @param {!Element} target
     * @param {string} eventType
     * @param {!JsonObject} vars A map of vars and their values.
     * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
     * attribute value from target element should be included.
     */ }, { key: "triggerEventForTarget", value:
    function triggerEventForTarget(
    target,
    eventType)


    {var vars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dict();var enableDataVars = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var event = new AnalyticsEvent(target, eventType, vars, enableDataVars);
      var root = this.findRoot_(target);
      var trackerName = getTrackerKeyName(eventType);
      var tracker = /** @type {!CustomEventTracker|!AmpStoryEventTracker} */(
      root.getTracker(trackerName, this.getTrackerClass_(trackerName)));

      tracker.trigger(event);
    }

    /**
     * @param {!Node} context
     * @return {!./analytics-root.AnalyticsRoot}
     */ }, { key: "findRoot_", value:
    function findRoot_(context) {
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
     */ }, { key: "getOrCreateRoot_", value:
    function getOrCreateRoot_(holder, factory) {
      var root = /** @type {?./analytics-root.AnalyticsRoot} */(holder[PROP]);
      if (!root) {
        root = factory();
        holder[PROP] = root;
      }
      return root;
    } }]);return InstrumentationService;}();


/**
 * It's important to resolve instrumentation asynchronously in elements that
 * depends on it in multi-doc scope. Otherwise an element life-cycle could
 * resolve way before we have the service available.
 *
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<InstrumentationService>}
 */
export function instrumentationServicePromiseForDoc(elementOrAmpDoc) {
  return (/** @type {!Promise<InstrumentationService>} */(
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation')));

}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!InstrumentationService}
 */
export function instrumentationServiceForDocForTesting(elementOrAmpDoc) {
  registerServiceBuilderForDoc(
  elementOrAmpDoc,
  'amp-analytics-instrumentation',
  InstrumentationService);

  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation');
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/instrumentation.js