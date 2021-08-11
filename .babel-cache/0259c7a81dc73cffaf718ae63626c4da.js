function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function AnalyticsGroup(root, analyticsElement) {_classCallCheck(this, AnalyticsGroup);
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

  /** @override */_createClass(AnalyticsGroup, [{ key: "dispose", value:
    function dispose() {
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
     */ }, { key: "addTrigger", value:
    function addTrigger(config, handler) {var _this = this;
      var eventType = /** @type {string} */(config['on']);
      var trackerKey = getTrackerKeyName(eventType);
      var trackerAllowlist = getTrackerTypesForParentType(this.root_.getType());

      var tracker = this.root_.getTrackerForAllowlist(
      trackerKey,
      trackerAllowlist);

      userAssert(
      !!tracker,
      'Trigger type "%s" is not allowed in the %s',
      eventType,
      this.root_.getType());

      var unlisten;
      var deferred = new Deferred();
      var task = function task() {
        unlisten = tracker.add(
        _this.analyticsElement_,
        eventType,
        config,
        handler);

        _this.listeners_.push(unlisten);
        deferred.resolve();
      };
      if (
      this.triggerCount_ < IMMEDIATE_TRIGGER_THRES ||
      getMode(this.win_).runtime == 'inabox')
      {
        task();
      } else {
        var priority =
        this.triggerCount_ < HIGH_PRIORITY_TRIGGER_THRES ?
        ChunkPriority.HIGH :
        ChunkPriority.LOW;
        chunk(this.analyticsElement_, task, priority);
      }
      this.triggerCount_++;
      return deferred.promise;
    } }]);return AnalyticsGroup;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/analytics-group.js