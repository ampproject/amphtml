import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _Object$freeze;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Deferred } from "../../../src/core/data-structures/promise";
import { Observable } from "../../../src/core/data-structures/observable";
import { PlayingStates, VideoAnalyticsEvents, videoAnalyticsCustomEventTypeKey } from "../../../src/video-interface";
import { deepMerge, dict, hasOwn } from "../../../src/core/types/object";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { getData } from "../../../src/event-helper";
import { getDataParamsFromAttributes } from "../../../src/core/dom";
import { isAmpElement } from "../../../src/amp-element-helpers";
import { isArray, isEnumValue, isFiniteNumber } from "../../../src/core/types";
var SCROLL_PRECISION_PERCENT = 5;
var VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
var VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';
var MIN_TIMER_INTERVAL_SECONDS = 0.5;
var DEFAULT_MAX_TIMER_LENGTH_SECONDS = 7200;
var VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;

var NO_UNLISTEN = function NO_UNLISTEN() {};

var TAG = 'amp-analytics/events';

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export var AnalyticsEventType = {
  CLICK: 'click',
  CUSTOM: 'custom',
  HIDDEN: 'hidden',
  INI_LOAD: 'ini-load',
  RENDER_START: 'render-start',
  SCROLL: 'scroll',
  STORY: 'story',
  TIMER: 'timer',
  VIDEO: 'video',
  VISIBLE: 'visible'
};
var ALLOWED_FOR_ALL_ROOT_TYPES = ['ampdoc', 'embed'];

/**
 * Events that can result in analytics data to be sent.
 * @const {!Object<string, {
 *     name: string,
 *     allowedFor: !Array<string>,
 *     klass: typeof ./events.EventTracker
 *   }>}
 */
var TRACKER_TYPE = Object.freeze((_Object$freeze = {}, _Object$freeze[AnalyticsEventType.CLICK] = {
  name: AnalyticsEventType.CLICK,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  // Escape the temporal dead zone by not referencing a class directly.
  klass: function klass(root) {
    return new ClickEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.CUSTOM] = {
  name: AnalyticsEventType.CUSTOM,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new CustomEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.HIDDEN] = {
  name: AnalyticsEventType.VISIBLE,
  // Reuse tracker with visibility
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.INI_LOAD] = {
  name: AnalyticsEventType.INI_LOAD,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new IniLoadTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.RENDER_START] = {
  name: AnalyticsEventType.RENDER_START,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new SignalTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.SCROLL] = {
  name: AnalyticsEventType.SCROLL,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new ScrollEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.STORY] = {
  name: AnalyticsEventType.STORY,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new AmpStoryEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.TIMER] = {
  name: AnalyticsEventType.TIMER,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new TimerEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.VIDEO] = {
  name: AnalyticsEventType.VIDEO,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VideoEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.VISIBLE] = {
  name: AnalyticsEventType.VISIBLE,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  }
}, _Object$freeze));

/** @visibleForTesting */
export var trackerTypeForTesting = TRACKER_TYPE;

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isAmpStoryTriggerType(triggerType) {
  return triggerType.startsWith('story');
}

/**
 * Assert that the selectors are all unique
 * @param {!Array<string>|string} selectors
 */
function assertUniqueSelectors(selectors) {
  userAssert(!isArray(selectors) || new Set(selectors).size === selectors.length, 'Cannot have duplicate selectors in selectors list: %s', selectors);
}

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isVideoTriggerType(triggerType) {
  return triggerType.startsWith('video');
}

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isReservedTriggerType(triggerType) {
  return isEnumValue(AnalyticsEventType, triggerType);
}

/**
 * @param {string} eventType
 * @return {string}
 */
export function getTrackerKeyName(eventType) {
  if (isVideoTriggerType(eventType)) {
    return AnalyticsEventType.VIDEO;
  }

  if (isAmpStoryTriggerType(eventType)) {
    return AnalyticsEventType.STORY;
  }

  if (!isReservedTriggerType(eventType)) {
    return AnalyticsEventType.CUSTOM;
  }

  return hasOwn(TRACKER_TYPE, eventType) ? TRACKER_TYPE[eventType].name : eventType;
}

/**
 * @param {string} parentType
 * @return {!Object<string, typeof EventTracker>}
 */
export function getTrackerTypesForParentType(parentType) {
  var filtered = {};
  Object.keys(TRACKER_TYPE).forEach(function (key) {
    if (hasOwn(TRACKER_TYPE, key) && TRACKER_TYPE[key].allowedFor.indexOf(parentType) != -1) {
      filtered[key] = TRACKER_TYPE[key].klass;
    }
  });
  return filtered;
}

/**
 * Expand the event variables to include default data-vars
 * eventVars value will override data-vars value
 * @param {!Element} target
 * @param {!JsonObject} eventVars
 * @return {!JsonObject}
 */
function mergeDataVars(target, eventVars) {
  var vars = getDataParamsFromAttributes(target,
  /* computeParamNameFunc */
  undefined, VARIABLE_DATA_ATTRIBUTE_KEY);
  // Merge eventVars into vars, depth=0 because
  // vars and eventVars are not supposed to contain nested object.
  deepMerge(vars, eventVars, 0);
  return vars;
}

/**
 * @interface
 */
var SignalTrackerDef = /*#__PURE__*/function () {
  function SignalTrackerDef() {
    _classCallCheck(this, SignalTrackerDef);
  }

  _createClass(SignalTrackerDef, [{
    key: "getRootSignal",
    value:
    /**
     * @param {string} unusedEventType
     * @return {!Promise}
     */
    function getRootSignal(unusedEventType) {}
    /**
     * @param {string} unusedEventType
     * @param {!Element} unusedElement
     * @return {!Promise}
     */

  }, {
    key: "getElementSignal",
    value: function getElementSignal(unusedEventType, unusedElement) {}
  }]);

  return SignalTrackerDef;
}();

/**
 * The analytics event.
 * @dict
 */
export var AnalyticsEvent =
/**
 * @param {!Element} target The most relevant target element.
 * @param {string} type The type of event.
 * @param {!JsonObject} vars A map of vars and their values.
 * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
 * attribute value from target element should be included.
 */
function AnalyticsEvent(target, type, vars, enableDataVars) {
  if (vars === void 0) {
    vars = dict();
  }

  if (enableDataVars === void 0) {
    enableDataVars = true;
  }

  _classCallCheck(this, AnalyticsEvent);

  /** @const */
  this['target'] = target;

  /** @const */
  this['type'] = type;

  /** @const */
  this['vars'] = enableDataVars ? mergeDataVars(target, vars) : vars;
};

/**
 * The base class for all trackers. A tracker tracks all events of the same
 * type for a single analytics root.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 * @visibleForTesting
 */
export var EventTracker = /*#__PURE__*/function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function EventTracker(root) {
    _classCallCheck(this, EventTracker);

    /** @const */
    this.root = root;
  }

  /** @override @abstract */
  _createClass(EventTracker, [{
    key: "dispose",
    value: function dispose() {}
    /**
     * @param {!Element} unusedContext
     * @param {string} unusedEventType
     * @param {!JsonObject} unusedConfig
     * @param {function(!AnalyticsEvent)} unusedListener
     * @return {!UnlistenDef}
     * @abstract
     */

  }, {
    key: "add",
    value: function add(unusedContext, unusedEventType, unusedConfig, unusedListener) {}
  }]);

  return EventTracker;
}();

/**
 * Tracks custom events.
 */
export var CustomEventTracker = /*#__PURE__*/function (_EventTracker) {
  _inherits(CustomEventTracker, _EventTracker);

  var _super = _createSuper(CustomEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function CustomEventTracker(root) {
    var _this;

    _classCallCheck(this, CustomEventTracker);

    _this = _super.call(this, root);

    /** @const @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    _this.observables_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    _this.buffer_ = {};

    /**
     * Sandbox events get their own buffer, because handler to those events will
     * be added after parent element's layout. (Time varies, can be later than
     * 10s) sandbox events buffer will never expire but will cleared when
     * handler is ready.
     * @private {!Object<string, !Array<!AnalyticsEvent>|undefined>|undefined}
     */
    _this.sandboxBuffer_ = {};
    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    setTimeout(function () {
      _this.buffer_ = undefined;
    }, 10000);
    return _this;
  }

  /** @override */
  _createClass(CustomEventTracker, [{
    key: "dispose",
    value: function dispose() {
      this.buffer_ = undefined;
      this.sandboxBuffer_ = undefined;

      for (var k in this.observables_) {
        this.observables_[k].removeAll();
      }
    }
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this2 = this;

      var selector = config['selector'];

      if (!selector) {
        selector = ':root';
      }

      var selectionMethod = config['selectionMethod'] || null;
      var targetReady = this.root.getElement(context, selector, selectionMethod);
      var isSandboxEvent = eventType.startsWith('sandbox-');
      // Push recent events if any.
      var buffer = isSandboxEvent ? this.sandboxBuffer_ && this.sandboxBuffer_[eventType] : this.buffer_ && this.buffer_[eventType];

      if (buffer) {
        var bufferLength = buffer.length;
        targetReady.then(function (target) {
          setTimeout(function () {
            for (var i = 0; i < bufferLength; i++) {
              var event = buffer[i];

              if (target.contains(event['target'])) {
                listener(event);
              }
            }

            if (isSandboxEvent) {
              // We assume sandbox event will only has single listener.
              // It is safe to clear buffer once handler is ready.
              _this2.sandboxBuffer_[eventType] = undefined;
            }
          }, 1);
        });
      }

      var observables = this.observables_[eventType];

      if (!observables) {
        observables = new Observable();
        this.observables_[eventType] = observables;
      }

      return this.observables_[eventType].add(function (event) {
        // Wait for target selected
        targetReady.then(function (target) {
          if (target.contains(event['target'])) {
            listener(event);
          }
        });
      });
    }
    /**
     * Triggers a custom event for the associated root.
     * @param {!AnalyticsEvent} event
     */

  }, {
    key: "trigger",
    value: function trigger(event) {
      var eventType = event['type'];
      var isSandboxEvent = eventType.startsWith('sandbox-');
      var observables = this.observables_[eventType];

      // If listeners already present - trigger right away.
      if (observables) {
        observables.fire(event);

        if (isSandboxEvent) {
          // No need to buffer sandbox event if handler ready
          return;
        }
      }

      // Create buffer and enqueue buffer if needed
      if (isSandboxEvent) {
        this.sandboxBuffer_[eventType] = this.sandboxBuffer_[eventType] || [];
        this.sandboxBuffer_[eventType].push(event);
      } else {
        // Check if buffer has expired
        if (this.buffer_) {
          this.buffer_[eventType] = this.buffer_[eventType] || [];
          this.buffer_[eventType].push(event);
        }
      }
    }
  }]);

  return CustomEventTracker;
}(EventTracker);
// TODO(Enriqe): If needed, add support for sandbox story event.
// (e.g. sandbox-story-xxx).
export var AmpStoryEventTracker = /*#__PURE__*/function (_CustomEventTracker) {
  _inherits(AmpStoryEventTracker, _CustomEventTracker);

  var _super2 = _createSuper(AmpStoryEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function AmpStoryEventTracker(root) {
    _classCallCheck(this, AmpStoryEventTracker);

    return _super2.call(this, root);
  }

  /** @override */
  _createClass(AmpStoryEventTracker, [{
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this3 = this;

      var rootTarget = this.root.getRootElement();
      // Fire buffered events if any.
      var buffer = this.buffer_ && this.buffer_[eventType];

      if (buffer) {
        var bufferLength = buffer.length;

        for (var i = 0; i < bufferLength; i++) {
          var event = buffer[i];
          this.fireListener_(event, rootTarget, config, listener);
        }
      }

      var observables = this.observables_[eventType];

      if (!observables) {
        observables = new Observable();
        this.observables_[eventType] = observables;
      }

      return this.observables_[eventType].add(function (event) {
        _this3.fireListener_(event, rootTarget, config, listener);
      });
    }
    /**
     * Fires listener given the specified configuration.
     * @param {!AnalyticsEvent} event
     * @param {!Element} rootTarget
     * @param {!JsonObject} config
     * @param {function(!AnalyticsEvent)} listener
     */

  }, {
    key: "fireListener_",
    value: function fireListener_(event, rootTarget, config, listener) {
      var type = event['type'];
      var vars = event['vars'];
      var storySpec = config['storySpec'] || {};
      var repeat = storySpec['repeat'] === undefined ? true : storySpec['repeat'];
      var eventDetails = vars['eventDetails'];
      var tagName = config['tagName'];

      if (tagName && eventDetails['tagName'] && tagName.toLowerCase() !== eventDetails['tagName']) {
        return;
      }

      if (repeat === false && eventDetails['repeated']) {
        return;
      }

      listener(new AnalyticsEvent(rootTarget, type, vars));
    }
    /**
     * Triggers a custom event for the associated root, or buffers them if the
     * observables aren't present yet.
     * @param {!AnalyticsEvent} event
     */

  }, {
    key: "trigger",
    value: function trigger(event) {
      var eventType = event['type'];
      var observables = this.observables_[eventType];

      // If listeners already present - trigger right away.
      if (observables) {
        observables.fire(event);
      }

      // Create buffer and enqueue event if needed.
      if (this.buffer_) {
        this.buffer_[eventType] = this.buffer_[eventType] || [];
        this.buffer_[eventType].push(event);
      }
    }
  }]);

  return AmpStoryEventTracker;
}(CustomEventTracker);

/**
 * Tracks click events.
 */
export var ClickEventTracker = /*#__PURE__*/function (_EventTracker2) {
  _inherits(ClickEventTracker, _EventTracker2);

  var _super3 = _createSuper(ClickEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ClickEventTracker(root) {
    var _this4;

    _classCallCheck(this, ClickEventTracker);

    _this4 = _super3.call(this, root);

    /** @private {!Observable<!Event>} */
    _this4.clickObservable_ = new Observable();

    /** @private @const {function(!Event)} */
    _this4.boundOnClick_ = _this4.clickObservable_.fire.bind(_this4.clickObservable_);

    _this4.root.getRoot().addEventListener('click', _this4.boundOnClick_);

    return _this4;
  }

  /** @override */
  _createClass(ClickEventTracker, [{
    key: "dispose",
    value: function dispose() {
      this.root.getRoot().removeEventListener('click', this.boundOnClick_);
      this.clickObservable_.removeAll();
    }
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var selector = userAssert(config['selector'], 'Missing required selector on click trigger');
      var selectionMethod = config['selectionMethod'] || null;
      return this.clickObservable_.add(this.root.createSelectiveListener(this.handleClick_.bind(this, listener), context.parentElement || context, selector, selectionMethod));
    }
    /**
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Element} target
     * @param {!Event} unusedEvent
     * @private
     */

  }, {
    key: "handleClick_",
    value: function handleClick_(listener, target, unusedEvent) {
      listener(new AnalyticsEvent(target, 'click'));
    }
  }]);

  return ClickEventTracker;
}(EventTracker);

/**
 * Tracks scroll events.
 */
export var ScrollEventTracker = /*#__PURE__*/function (_EventTracker3) {
  _inherits(ScrollEventTracker, _EventTracker3);

  var _super4 = _createSuper(ScrollEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ScrollEventTracker(root) {
    var _this5;

    _classCallCheck(this, ScrollEventTracker);

    _this5 = _super4.call(this, root);

    /** @private {!./analytics-root.AnalyticsRoot} root */
    _this5.root_ = root;

    /** @private {?function(!Object)} */
    _this5.boundScrollHandler_ = null;
    return _this5;
  }

  /** @override */
  _createClass(ScrollEventTracker, [{
    key: "dispose",
    value: function dispose() {
      if (this.boundScrollHandler_ !== null) {
        this.root_.getScrollManager().removeScrollHandler(this.boundScrollHandler_);
        this.boundScrollHandler_ = null;
      }
    }
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      if (!config['scrollSpec']) {
        user().error(TAG, 'Missing scrollSpec on scroll trigger.');
        return NO_UNLISTEN;
      }

      if (!Array.isArray(config['scrollSpec']['verticalBoundaries']) && !Array.isArray(config['scrollSpec']['horizontalBoundaries'])) {
        user().error(TAG, 'Boundaries are required for the scroll trigger to work.');
        return NO_UNLISTEN;
      }

      var boundsV = this.normalizeBoundaries_(config['scrollSpec']['verticalBoundaries']);
      var boundsH = this.normalizeBoundaries_(config['scrollSpec']['horizontalBoundaries']);
      var useInitialPageSize = !!config['scrollSpec']['useInitialPageSize'];
      this.boundScrollHandler_ = this.scrollHandler_.bind(this, boundsH, boundsV, useInitialPageSize, listener);
      return this.root_.getScrollManager().addScrollHandler(this.boundScrollHandler_);
    }
    /**
     * Function to handle scroll events from the Scroll manager
     * @param {!Object<number,boolean>} boundsH
     * @param {!Object<number,boolean>} boundsV
     * @param {boolean} useInitialPageSize
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Object} e
     * @private
     */

  }, {
    key: "scrollHandler_",
    value: function scrollHandler_(boundsH, boundsV, useInitialPageSize, listener, e) {
      // Calculates percentage scrolled by adding screen height/width to
      // top/left and dividing by the total scroll height/width.
      var _ref = useInitialPageSize ? e.initialSize : e,
          scrollHeight = _ref.scrollHeight,
          scrollWidth = _ref.scrollWidth;

      this.triggerScrollEvents_(boundsV, (e.top + e.height) * 100 / scrollHeight, VAR_V_SCROLL_BOUNDARY, listener);
      this.triggerScrollEvents_(boundsH, (e.left + e.width) * 100 / scrollWidth, VAR_H_SCROLL_BOUNDARY, listener);
    }
    /**
     * Rounds the boundaries for scroll trigger to nearest
     * SCROLL_PRECISION_PERCENT and returns an object with normalized boundaries
     * as keys and false as values.
     *
     * @param {!Array<number>} bounds array of bounds.
     * @return {!JsonObject} Object with normalized bounds as keys
     * and false as value.
     * @private
     */

  }, {
    key: "normalizeBoundaries_",
    value: function normalizeBoundaries_(bounds) {
      var result = dict({});

      if (!bounds || !Array.isArray(bounds)) {
        return result;
      }

      for (var b = 0; b < bounds.length; b++) {
        var bound = bounds[b];

        if (typeof bound !== 'number' || !isFinite(bound)) {
          user().error(TAG, 'Scroll trigger boundaries must be finite.');
          return result;
        }

        bound = Math.min(Math.round(bound / SCROLL_PRECISION_PERCENT) * SCROLL_PRECISION_PERCENT, 100);
        result[bound] = false;
      }

      return result;
    }
    /**
     * @param {!Object<number, boolean>} bounds
     * @param {number} scrollPos Number representing the current scroll
     * @param {string} varName variable name to assign to the bound that
     * @param {function(!AnalyticsEvent)} listener
     * triggers the event position.
     */

  }, {
    key: "triggerScrollEvents_",
    value: function triggerScrollEvents_(bounds, scrollPos, varName, listener) {
      if (!scrollPos) {
        return;
      }

      // Goes through each of the boundaries and fires an event if it has not
      // been fired so far and it should be.
      for (var b in bounds) {
        if (!hasOwn(bounds, b)) {
          continue;
        }

        var bound = parseInt(b, 10);

        if (bound > scrollPos || bounds[bound]) {
          continue;
        }

        bounds[bound] = true;
        var vars = dict();
        vars[varName] = b;
        listener(new AnalyticsEvent(this.root_.getRootElement(), AnalyticsEventType.SCROLL, vars,
        /** enableDataVars */
        false));
      }
    }
  }]);

  return ScrollEventTracker;
}(EventTracker);

/**
 * Tracks events based on signals.
 * @implements {SignalTrackerDef}
 */
export var SignalTracker = /*#__PURE__*/function (_EventTracker4) {
  _inherits(SignalTracker, _EventTracker4);

  var _super5 = _createSuper(SignalTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function SignalTracker(root) {
    _classCallCheck(this, SignalTracker);

    return _super5.call(this, root);
  }

  /** @override */
  _createClass(SignalTracker, [{
    key: "dispose",
    value: function dispose() {}
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this6 = this;

      var target;
      var signalsPromise;
      var selector = config['selector'] || ':root';

      if (selector == ':root' || selector == ':host') {
        // Root selectors are delegated to analytics roots.
        target = this.root.getRootElement();
        signalsPromise = this.getRootSignal(eventType);
      } else {
        // Look for the AMP-element. Wait for DOM to be fully parsed to avoid
        // false missed searches.
        var selectionMethod = config['selectionMethod'];
        signalsPromise = this.root.getAmpElement(context.parentElement || context, selector, selectionMethod).then(function (element) {
          target = element;
          return _this6.getElementSignal(eventType, target);
        });
      }

      // Wait for the target and the event signal.
      signalsPromise.then(function () {
        listener(new AnalyticsEvent(target, eventType));
      });
      return NO_UNLISTEN;
    }
    /** @override */

  }, {
    key: "getRootSignal",
    value: function getRootSignal(eventType) {
      return this.root.signals().whenSignal(eventType);
    }
    /** @override */

  }, {
    key: "getElementSignal",
    value: function getElementSignal(eventType, element) {
      if (typeof element.signals != 'function') {
        return _resolvedPromise();
      }

      return element.signals().whenSignal(eventType);
    }
  }]);

  return SignalTracker;
}(EventTracker);

/**
 * Tracks when the elements in the first viewport has been loaded - "ini-load".
 * @implements {SignalTrackerDef}
 */
export var IniLoadTracker = /*#__PURE__*/function (_EventTracker5) {
  _inherits(IniLoadTracker, _EventTracker5);

  var _super6 = _createSuper(IniLoadTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function IniLoadTracker(root) {
    _classCallCheck(this, IniLoadTracker);

    return _super6.call(this, root);
  }

  /** @override */
  _createClass(IniLoadTracker, [{
    key: "dispose",
    value: function dispose() {}
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this7 = this;

      var target;
      var promise;
      var selector = config['selector'] || ':root';

      if (selector == ':root' || selector == ':host') {
        // Root selectors are delegated to analytics roots.
        target = this.root.getRootElement();
        promise = this.getRootSignal();
      } else {
        // An AMP-element. Wait for DOM to be fully parsed to avoid
        // false missed searches.
        var selectionMethod = config['selectionMethod'];
        promise = this.root.getAmpElement(context.parentElement || context, selector, selectionMethod).then(function (element) {
          target = element;
          return _this7.getElementSignal('ini-load', target);
        });
      }

      // Wait for the target and the event.
      promise.then(function () {
        listener(new AnalyticsEvent(target, eventType));
      });
      return NO_UNLISTEN;
    }
    /** @override */

  }, {
    key: "getRootSignal",
    value: function getRootSignal() {
      return this.root.whenIniLoaded();
    }
    /** @override */

  }, {
    key: "getElementSignal",
    value: function getElementSignal(unusedEventType, element) {
      if (typeof element.signals != 'function') {
        return _resolvedPromise2();
      }

      var signals = element.signals();
      return Promise.race([signals.whenSignal(CommonSignals.INI_LOAD), signals.whenSignal(CommonSignals.LOAD_END)]);
    }
  }]);

  return IniLoadTracker;
}(EventTracker);

/**
 * Timer event handler.
 */
var TimerEventHandler = /*#__PURE__*/function () {
  /**
   * @param {JsonObject} timerSpec The timer specification.
   * @param {function(): UnlistenDef=} opt_startBuilder Factory for building
   *     start trackers for this timer.
   * @param {function(): UnlistenDef=} opt_stopBuilder Factory for building stop
   *     trackers for this timer.
   */
  function TimerEventHandler(timerSpec, opt_startBuilder, opt_stopBuilder) {
    _classCallCheck(this, TimerEventHandler);

    /** @private {number|undefined} */
    this.intervalId_ = undefined;
    userAssert('interval' in timerSpec, 'Timer interval specification required');

    /** @private @const {number} */
    this.intervalLength_ = Number(timerSpec['interval']) || 0;
    userAssert(this.intervalLength_ >= MIN_TIMER_INTERVAL_SECONDS, 'Bad timer interval specification');

    /** @private @const {number} */
    this.maxTimerLength_ = 'maxTimerLength' in timerSpec ? Number(timerSpec['maxTimerLength']) : DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    userAssert(this.maxTimerLength_ > 0, 'Bad maxTimerLength specification');

    /** @private @const {boolean} */
    this.maxTimerInSpec_ = 'maxTimerLength' in timerSpec;

    /** @private @const {boolean} */
    this.callImmediate_ = 'immediate' in timerSpec ? Boolean(timerSpec['immediate']) : true;

    /** @private {?function()} */
    this.intervalCallback_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStart_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStop_ = null;

    /** @private @const {?function(): UnlistenDef} */
    this.startBuilder_ = opt_startBuilder || null;

    /** @private @const {?function(): UnlistenDef} */
    this.stopBuilder_ = opt_stopBuilder || null;

    /** @private {number|undefined} */
    this.startTime_ = undefined;
    // milliseconds

    /** @private {number|undefined} */
    this.lastRequestTime_ = undefined;
  }

  /**
   * @param {function()} startTimer
   */
  _createClass(TimerEventHandler, [{
    key: "init",
    value: function init(startTimer) {
      if (!this.startBuilder_) {
        // Timer starts on load.
        startTimer();
      } else {
        // Timer starts on event.
        this.listenForStart_();
      }
    }
    /**
     * Unlistens for start and stop.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this.unlistenForStop_();
      this.unlistenForStart_();
    }
    /** @private */

  }, {
    key: "listenForStart_",
    value: function listenForStart_() {
      if (this.startBuilder_) {
        this.unlistenStart_ = this.startBuilder_();
      }
    }
    /** @private */

  }, {
    key: "unlistenForStart_",
    value: function unlistenForStart_() {
      if (this.unlistenStart_) {
        this.unlistenStart_();
        this.unlistenStart_ = null;
      }
    }
    /** @private */

  }, {
    key: "listenForStop_",
    value: function listenForStop_() {
      if (this.stopBuilder_) {
        try {
          this.unlistenStop_ = this.stopBuilder_();
        } catch (e) {
          this.dispose();
          // Stop timer and then throw error.
          throw e;
        }
      }
    }
    /** @private */

  }, {
    key: "unlistenForStop_",
    value: function unlistenForStop_() {
      if (this.unlistenStop_) {
        this.unlistenStop_();
        this.unlistenStop_ = null;
      }
    }
    /** @return {boolean} */

  }, {
    key: "isRunning",
    value: function isRunning() {
      return !!this.intervalId_;
    }
    /**
     * @param {!Window} win
     * @param {function()} timerCallback
     * @param {function()} timeoutCallback
     */

  }, {
    key: "startIntervalInWindow",
    value: function startIntervalInWindow(win, timerCallback, timeoutCallback) {
      if (this.isRunning()) {
        return;
      }

      this.startTime_ = Date.now();
      this.lastRequestTime_ = undefined;
      this.intervalCallback_ = timerCallback;
      this.intervalId_ = win.setInterval(function () {
        timerCallback();
      }, this.intervalLength_ * 1000);

      // If there's no way to turn off the timer, cap it.
      if (!this.stopBuilder_ || this.stopBuilder_ && this.maxTimerInSpec_) {
        win.setTimeout(function () {
          timeoutCallback();
        }, this.maxTimerLength_ * 1000);
      }

      this.unlistenForStart_();

      if (this.callImmediate_) {
        timerCallback();
      }

      this.listenForStop_();
    }
    /**
     * @param {!Window} win
     * @restricted
     */

  }, {
    key: "stopTimer_",
    value: function stopTimer_(win) {
      if (!this.isRunning()) {
        return;
      }

      this.intervalCallback_();
      this.intervalCallback_ = null;
      win.clearInterval(this.intervalId_);
      this.intervalId_ = undefined;
      this.lastRequestTime_ = undefined;
      this.unlistenForStop_();
      this.listenForStart_();
    }
    /**
     * @private
     * @return {number}
     */

  }, {
    key: "calculateDuration_",
    value: function calculateDuration_() {
      if (this.startTime_) {
        return Date.now() - (this.lastRequestTime_ || this.startTime_);
      }

      return 0;
    }
    /** @return {!JsonObject} */

  }, {
    key: "getTimerVars",
    value: function getTimerVars() {
      var timerDuration = 0;

      if (this.isRunning()) {
        timerDuration = this.calculateDuration_();
        this.lastRequestTime_ = Date.now();
      }

      return dict({
        'timerDuration': timerDuration,
        'timerStart': this.startTime_ || 0
      });
    }
  }]);

  return TimerEventHandler;
}();

/**
 * Tracks timer events.
 */
export var TimerEventTracker = /*#__PURE__*/function (_EventTracker6) {
  _inherits(TimerEventTracker, _EventTracker6);

  var _super7 = _createSuper(TimerEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function TimerEventTracker(root) {
    var _this8;

    _classCallCheck(this, TimerEventTracker);

    _this8 = _super7.call(this, root);

    /** @const @private {!Object<number, TimerEventHandler>} */
    _this8.trackers_ = {};

    /** @private {number} */
    _this8.timerIdSequence_ = 1;
    return _this8;
  }

  /**
   * @return {!Array<number>}
   * @visibleForTesting
   */
  _createClass(TimerEventTracker, [{
    key: "getTrackedTimerKeys",
    value: function getTrackedTimerKeys() {
      return (
        /** @type {!Array<number>} */
        Object.keys(this.trackers_)
      );
    }
    /** @override */

  }, {
    key: "dispose",
    value: function dispose() {
      var _this9 = this;

      this.getTrackedTimerKeys().forEach(function (timerId) {
        _this9.removeTracker_(timerId);
      });
    }
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this10 = this;

      var timerSpec = config['timerSpec'];
      userAssert(timerSpec && typeof timerSpec == 'object', 'Bad timer specification');
      var timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
      userAssert(!timerStart || typeof timerStart == 'object', 'Bad timer start specification');
      var timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
      userAssert(!timerStart && !timerStop || typeof timerStop == 'object', 'Bad timer stop specification');
      var timerId = this.generateTimerId_();
      var startBuilder;
      var stopBuilder;

      if (timerStart) {
        var startTracker = this.getTracker_(timerStart);
        userAssert(startTracker, 'Cannot track timer start');
        startBuilder = startTracker.add.bind(startTracker, context, timerStart['on'], timerStart, this.handleTimerToggle_.bind(this, timerId, eventType, listener));
      }

      if (timerStop) {
        var stopTracker = this.getTracker_(timerStop);
        userAssert(stopTracker, 'Cannot track timer stop');
        stopBuilder = stopTracker.add.bind(stopTracker, context, timerStop['on'], timerStop, this.handleTimerToggle_.bind(this, timerId, eventType, listener));
      }

      var timerHandler = new TimerEventHandler(
      /** @type {!JsonObject} */
      timerSpec, startBuilder, stopBuilder);
      this.trackers_[timerId] = timerHandler;
      timerHandler.init(this.startTimer_.bind(this, timerId, eventType, listener));
      return function () {
        _this10.removeTracker_(timerId);
      };
    }
    /**
     * @return {number}
     * @private
     */

  }, {
    key: "generateTimerId_",
    value: function generateTimerId_() {
      return ++this.timerIdSequence_;
    }
    /**
     * @param {!JsonObject} config
     * @return {?EventTracker}
     * @private
     */

  }, {
    key: "getTracker_",
    value: function getTracker_(config) {
      var eventType = user().assertString(config['on']);
      var trackerKey = getTrackerKeyName(eventType);
      return this.root.getTrackerForAllowlist(trackerKey, getTrackerTypesForParentType('timer'));
    }
    /**
     * Toggles which listeners are active depending on timer state, so no race
     * conditions can occur in the case where the timer starts and stops on the
     * same event type from the same target.
     * @param {number} timerId
     * @param {string} eventType
     * @param {function(!AnalyticsEvent)} listener
     * @private
     */

  }, {
    key: "handleTimerToggle_",
    value: function handleTimerToggle_(timerId, eventType, listener) {
      var timerHandler = this.trackers_[timerId];

      if (!timerHandler) {
        return;
      }

      if (timerHandler.isRunning()) {
        this.stopTimer_(timerId);
      } else {
        this.startTimer_(timerId, eventType, listener);
      }
    }
    /**
     * @param {number} timerId
     * @param {string} eventType
     * @param {function(!AnalyticsEvent)} listener
     * @private
     */

  }, {
    key: "startTimer_",
    value: function startTimer_(timerId, eventType, listener) {
      var _this11 = this;

      var timerHandler = this.trackers_[timerId];

      var timerCallback = function timerCallback() {
        listener(_this11.createEvent_(timerId, eventType));
      };

      timerHandler.startIntervalInWindow(this.root.ampdoc.win, timerCallback, this.removeTracker_.bind(this, timerId));
    }
    /**
     * @param {number} timerId
     * @private
     */

  }, {
    key: "stopTimer_",
    value: function stopTimer_(timerId) {
      this.trackers_[timerId].stopTimer_(this.root.ampdoc.win);
    }
    /**
     * @param {number} timerId
     * @param {string} eventType
     * @return {!AnalyticsEvent}
     * @private
     */

  }, {
    key: "createEvent_",
    value: function createEvent_(timerId, eventType) {
      return new AnalyticsEvent(this.root.getRootElement(), eventType, this.trackers_[timerId].getTimerVars(),
      /** enableDataVars */
      false);
    }
    /**
     * @param {number} timerId
     * @private
     */

  }, {
    key: "removeTracker_",
    value: function removeTracker_(timerId) {
      if (this.trackers_[timerId]) {
        this.stopTimer_(timerId);
        this.trackers_[timerId].dispose();
        delete this.trackers_[timerId];
      }
    }
  }]);

  return TimerEventTracker;
}(EventTracker);

/**
 * Tracks video session events
 */
export var VideoEventTracker = /*#__PURE__*/function (_EventTracker7) {
  _inherits(VideoEventTracker, _EventTracker7);

  var _super8 = _createSuper(VideoEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VideoEventTracker(root) {
    var _this12;

    _classCallCheck(this, VideoEventTracker);

    _this12 = _super8.call(this, root);

    /** @private {?Observable<!Event>} */
    _this12.sessionObservable_ = new Observable();

    /** @private {?function(!Event)} */
    _this12.boundOnSession_ = _this12.sessionObservable_.fire.bind(_this12.sessionObservable_);
    Object.keys(VideoAnalyticsEvents).forEach(function (key) {
      _this12.root.getRoot().addEventListener(VideoAnalyticsEvents[key], _this12.boundOnSession_);
    });
    return _this12;
  }

  /** @override */
  _createClass(VideoEventTracker, [{
    key: "dispose",
    value: function dispose() {
      var _this13 = this;

      var root = this.root.getRoot();
      Object.keys(VideoAnalyticsEvents).forEach(function (key) {
        root.removeEventListener(VideoAnalyticsEvents[key], _this13.boundOnSession_);
      });
      this.boundOnSession_ = null;
      this.sessionObservable_ = null;
    }
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var videoSpec = config['videoSpec'] || {};
      var selector = userAssert(config['selector'] || videoSpec['selector'], 'Missing required selector on video trigger');
      userAssert(selector.length, 'Missing required selector on video trigger');
      assertUniqueSelectors(selector);
      var selectionMethod = config['selectionMethod'] || null;
      var targetPromises = this.root.getElements(context, selector, selectionMethod, false);
      var endSessionWhenInvisible = videoSpec['end-session-when-invisible'];
      var excludeAutoplay = videoSpec['exclude-autoplay'];
      var interval = videoSpec['interval'];
      var percentages = videoSpec['percentages'];
      var on = config['on'];
      var percentageInterval = 5;
      var intervalCounter = 0;
      var lastPercentage = 0;
      return this.sessionObservable_.add(function (event) {
        var type = event.type;
        var details =
        /** @type {?JsonObject|undefined} */
        getData(event);
        var normalizedType = normalizeVideoEventType(type, details);

        if (normalizedType !== on) {
          return;
        }

        if (normalizedType === VideoAnalyticsEvents.SECONDS_PLAYED && !interval) {
          user().error(TAG, 'video-seconds-played requires interval spec with non-zero value');
          return;
        }

        if (normalizedType === VideoAnalyticsEvents.SECONDS_PLAYED) {
          intervalCounter++;

          if (intervalCounter % interval !== 0) {
            return;
          }
        }

        if (normalizedType === VideoAnalyticsEvents.PERCENTAGE_PLAYED) {
          if (!percentages) {
            user().error(TAG, 'video-percentage-played requires percentages spec.');
            return;
          }

          for (var i = 0; i < percentages.length; i++) {
            var percentage = percentages[i];

            if (percentage <= 0 || percentage % percentageInterval != 0) {
              user().error(TAG, 'Percentages must be set in increments of %s with non-zero ' + 'values', percentageInterval);
              return;
            }
          }

          var normalizedPercentage = details['normalizedPercentage'];
          var normalizedPercentageInt = parseInt(normalizedPercentage, 10);
          devAssert(isFiniteNumber(normalizedPercentageInt));
          devAssert(normalizedPercentageInt % percentageInterval == 0);

          // Don't trigger if current percentage is the same as
          // last triggered percentage
          if (lastPercentage == normalizedPercentageInt && percentages.length > 1) {
            return;
          }

          if (percentages.indexOf(normalizedPercentageInt) < 0) {
            return;
          }

          lastPercentage = normalizedPercentageInt;
        }

        if (type === VideoAnalyticsEvents.SESSION_VISIBLE && !endSessionWhenInvisible) {
          return;
        }

        if (excludeAutoplay && details['state'] === PlayingStates.PLAYING_AUTO) {
          return;
        }

        var el = dev().assertElement(event.target, 'No target specified by video session event.');
        targetPromises.then(function (targets) {
          targets.forEach(function (target) {
            if (!target.contains(el)) {
              return;
            }

            var normalizedDetails = removeInternalVars(details);
            listener(new AnalyticsEvent(target, normalizedType, normalizedDetails));
          });
        });
      });
    }
  }]);

  return VideoEventTracker;
}(EventTracker);

/**
 * Normalize video type from internal representation into the observed string
 * from the analytics configuration.
 * @param {string} type
 * @param {?JsonObject|undefined} details
 * @return {string}
 */
function normalizeVideoEventType(type, details) {
  if (type == VideoAnalyticsEvents.SESSION_VISIBLE) {
    return VideoAnalyticsEvents.SESSION;
  }

  // Custom video analytics events are listened to from one signal type,
  // but they're configured by user with their custom name.
  if (type == VideoAnalyticsEvents.CUSTOM) {
    return dev().assertString(details[videoAnalyticsCustomEventTypeKey]);
  }

  return type;
}

/**
 * @param {?JsonObject|undefined} details
 * @return {!JsonObject|undefined}
 */
function removeInternalVars(details) {
  if (!details) {
    return dict();
  }

  var clean = _extends({}, details);

  delete clean[videoAnalyticsCustomEventTypeKey];
  return (
    /** @type {!JsonObject} */
    clean
  );
}

/**
 * Tracks visibility events.
 */
export var VisibilityTracker = /*#__PURE__*/function (_EventTracker8) {
  _inherits(VisibilityTracker, _EventTracker8);

  var _super9 = _createSuper(VisibilityTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VisibilityTracker(root) {
    var _this14;

    _classCallCheck(this, VisibilityTracker);

    _this14 = _super9.call(this, root);

    /** @private */
    _this14.waitForTrackers_ = {};
    return _this14;
  }

  /** @override */
  _createClass(VisibilityTracker, [{
    key: "dispose",
    value: function dispose() {}
    /** @override */

  }, {
    key: "add",
    value: function add(context, eventType, config, listener) {
      var _this15 = this;

      var visibilitySpec = config['visibilitySpec'] || {};
      var selector = config['selector'] || visibilitySpec['selector'];
      var waitForSpec = visibilitySpec['waitFor'];
      var reportWhenSpec = visibilitySpec['reportWhen'];
      var createReportReadyPromiseFunc = null;

      if (reportWhenSpec) {
        userAssert(!visibilitySpec['repeat'], 'reportWhen and repeat are mutually exclusive.');
      }

      if (eventType === AnalyticsEventType.HIDDEN) {
        if (reportWhenSpec) {
          user().error(TAG, 'ReportWhen should not be defined when eventType is "hidden"');
        }

        // special polyfill for eventType: 'hidden'
        reportWhenSpec = 'documentHidden';
      }

      var visibilityManager = this.root.getVisibilityManager();

      if (reportWhenSpec == 'documentHidden') {
        createReportReadyPromiseFunc = this.createReportReadyPromiseForDocumentHidden_.bind(this);
      } else if (reportWhenSpec == 'documentExit') {
        createReportReadyPromiseFunc = this.createReportReadyPromiseForDocumentExit_.bind(this);
      } else {
        userAssert(!reportWhenSpec, 'reportWhen value "%s" not supported.', reportWhenSpec);
      }

      // Root selectors are delegated to analytics roots.
      if (!selector || selector == ':root' || selector == ':host') {
        // When `selector` is specified, we always use "ini-load" signal as
        // a "ready" signal.
        var readyPromiseWaitForSpec = waitForSpec || (selector ? 'ini-load' : 'none');
        return visibilityManager.listenRoot(visibilitySpec, this.getReadyPromise(readyPromiseWaitForSpec), createReportReadyPromiseFunc, this.onEvent_.bind(this, eventType, listener, this.root.getRootElement()));
      }

      // An element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      // Array selectors do not suppor the special cases: ':host' & ':root'
      var selectionMethod = config['selectionMethod'] || visibilitySpec['selectionMethod'];
      assertUniqueSelectors(selector);
      var unlistenPromise = this.root.getElements(context.parentElement || context, selector, selectionMethod).then(function (elements) {
        var unlistenCallbacks = [];

        for (var i = 0; i < elements.length; i++) {
          unlistenCallbacks.push(visibilityManager.listenElement(elements[i], visibilitySpec, _this15.getReadyPromise(waitForSpec, elements[i]), createReportReadyPromiseFunc, _this15.onEvent_.bind(_this15, eventType, listener, elements[i])));
        }

        return unlistenCallbacks;
      });
      return function () {
        unlistenPromise.then(function (unlistenCallbacks) {
          for (var i = 0; i < unlistenCallbacks.length; i++) {
            unlistenCallbacks[i]();
          }
        });
      };
    }
    /**
     * Returns a Promise indicating that we're ready to report the analytics,
     * in the case of reportWhen: documentHidden
     * @return {!Promise}
     * @private
     */

  }, {
    key: "createReportReadyPromiseForDocumentHidden_",
    value: function createReportReadyPromiseForDocumentHidden_() {
      var ampdoc = this.root.ampdoc;

      if (!ampdoc.isVisible()) {
        return _resolvedPromise3();
      }

      return new Promise(function (resolve) {
        ampdoc.onVisibilityChanged(function () {
          if (!ampdoc.isVisible()) {
            resolve();
          }
        });
      });
    }
    /**
     * Returns a Promise indicating that we're ready to report the analytics,
     * in the case of reportWhen: documentExit
     * @return {!Promise}
     * @private
     */

  }, {
    key: "createReportReadyPromiseForDocumentExit_",
    value: function createReportReadyPromiseForDocumentExit_() {
      var deferred = new Deferred();
      var win = this.root.ampdoc.win;

      var _unloadListener, _pageHideListener;

      // Do not add an unload listener unless pagehide is not available.
      // If an unload listener is present, the back/forward cache will not work.
      // The BFCache saves pages to be instantly loaded when navigating back
      // or forward and pauses their JavaScript. The pagehide event was added
      // to give developers control over the behavior, and the unload listener
      // interferes with it. To allow publishers to use the default BFCache
      // behavior, we should not add an unload listener.
      if (!this.supportsPageHide_()) {
        win.addEventListener(
        /*OK*/
        'unload', _unloadListener = function unloadListener() {
          win.removeEventListener('unload', _unloadListener);
          deferred.resolve();
        });
      }

      // Note: pagehide is currently not supported on Opera Mini, nor IE<=10.
      // Documentation conflicts as to whether Safari on iOS will also fire it
      // when switching tabs or switching to another app. Chrome does not fire it
      // in this case.
      // Good, but several years old, analysis at:
      // https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
      // Especially note the event table on this page.
      win.addEventListener('pagehide', _pageHideListener = function pageHideListener() {
        win.removeEventListener('pagehide', _pageHideListener);
        deferred.resolve();
      });
      return deferred.promise;
    }
    /**
     * Detect support for the pagehide event.
     * IE<=10 and Opera Mini do not support the pagehide event and
     * possibly others, so we feature-detect support with this method.
     * This is in a stubbable method for testing.
     * @return {boolean}
     * @private visible for testing
     */

  }, {
    key: "supportsPageHide_",
    value: function supportsPageHide_() {
      return 'onpagehide' in this.root.ampdoc.win;
    }
    /**
     * @param {string|undefined} waitForSpec
     * @param {Element=} opt_element
     * @return {?Promise}
     * @visibleForTesting
     */

  }, {
    key: "getReadyPromise",
    value: function getReadyPromise(waitForSpec, opt_element) {
      if (opt_element) {
        if (!isAmpElement(opt_element)) {
          userAssert(!waitForSpec || waitForSpec == 'none', 'waitFor for non-AMP elements must be none or null. Found %s', waitForSpec);
        } else {
          waitForSpec = waitForSpec || 'ini-load';
        }
      }

      if (!waitForSpec || waitForSpec == 'none') {
        // Default case, waitFor selector is not defined, wait for nothing
        return null;
      }

      var trackerAllowlist = getTrackerTypesForParentType('visible');
      userAssert(trackerAllowlist[waitForSpec] !== undefined, 'waitFor value %s not supported', waitForSpec);
      var waitForTracker = this.waitForTrackers_[waitForSpec] || this.root.getTrackerForAllowlist(waitForSpec, trackerAllowlist);

      if (waitForTracker) {
        this.waitForTrackers_[waitForSpec] = waitForTracker;
      } else {
        return null;
      }

      // Wait for root signal if there's no element selected.
      return opt_element ? waitForTracker.getElementSignal(waitForSpec, opt_element) : waitForTracker.getRootSignal(waitForSpec);
    }
    /**
     * @param {string} eventType
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Element} target
     * @param {!JsonObject} state
     * @private
     */

  }, {
    key: "onEvent_",
    value: function onEvent_(eventType, listener, target, state) {
      // TODO: Verify usage and change behavior to have state override data-vars
      var attr = getDataParamsFromAttributes(target,
      /* computeParamNameFunc */
      undefined, VARIABLE_DATA_ATTRIBUTE_KEY);

      for (var key in attr) {
        state[key] = attr[key];
      }

      listener(new AnalyticsEvent(target, eventType, state,
      /** enableDataVars */
      false));
    }
  }]);

  return VisibilityTracker;
}(EventTracker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy5qcyJdLCJuYW1lcyI6WyJDb21tb25TaWduYWxzIiwiRGVmZXJyZWQiLCJPYnNlcnZhYmxlIiwiUGxheWluZ1N0YXRlcyIsIlZpZGVvQW5hbHl0aWNzRXZlbnRzIiwidmlkZW9BbmFseXRpY3NDdXN0b21FdmVudFR5cGVLZXkiLCJkZWVwTWVyZ2UiLCJkaWN0IiwiaGFzT3duIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXREYXRhIiwiZ2V0RGF0YVBhcmFtc0Zyb21BdHRyaWJ1dGVzIiwiaXNBbXBFbGVtZW50IiwiaXNBcnJheSIsImlzRW51bVZhbHVlIiwiaXNGaW5pdGVOdW1iZXIiLCJTQ1JPTExfUFJFQ0lTSU9OX1BFUkNFTlQiLCJWQVJfSF9TQ1JPTExfQk9VTkRBUlkiLCJWQVJfVl9TQ1JPTExfQk9VTkRBUlkiLCJNSU5fVElNRVJfSU5URVJWQUxfU0VDT05EUyIsIkRFRkFVTFRfTUFYX1RJTUVSX0xFTkdUSF9TRUNPTkRTIiwiVkFSSUFCTEVfREFUQV9BVFRSSUJVVEVfS0VZIiwiTk9fVU5MSVNURU4iLCJUQUciLCJBbmFseXRpY3NFdmVudFR5cGUiLCJDTElDSyIsIkNVU1RPTSIsIkhJRERFTiIsIklOSV9MT0FEIiwiUkVOREVSX1NUQVJUIiwiU0NST0xMIiwiU1RPUlkiLCJUSU1FUiIsIlZJREVPIiwiVklTSUJMRSIsIkFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTIiwiVFJBQ0tFUl9UWVBFIiwiT2JqZWN0IiwiZnJlZXplIiwibmFtZSIsImFsbG93ZWRGb3IiLCJjb25jYXQiLCJrbGFzcyIsInJvb3QiLCJDbGlja0V2ZW50VHJhY2tlciIsIkN1c3RvbUV2ZW50VHJhY2tlciIsIlZpc2liaWxpdHlUcmFja2VyIiwiSW5pTG9hZFRyYWNrZXIiLCJTaWduYWxUcmFja2VyIiwiU2Nyb2xsRXZlbnRUcmFja2VyIiwiQW1wU3RvcnlFdmVudFRyYWNrZXIiLCJUaW1lckV2ZW50VHJhY2tlciIsIlZpZGVvRXZlbnRUcmFja2VyIiwidHJhY2tlclR5cGVGb3JUZXN0aW5nIiwiaXNBbXBTdG9yeVRyaWdnZXJUeXBlIiwidHJpZ2dlclR5cGUiLCJzdGFydHNXaXRoIiwiYXNzZXJ0VW5pcXVlU2VsZWN0b3JzIiwic2VsZWN0b3JzIiwiU2V0Iiwic2l6ZSIsImxlbmd0aCIsImlzVmlkZW9UcmlnZ2VyVHlwZSIsImlzUmVzZXJ2ZWRUcmlnZ2VyVHlwZSIsImdldFRyYWNrZXJLZXlOYW1lIiwiZXZlbnRUeXBlIiwiZ2V0VHJhY2tlclR5cGVzRm9yUGFyZW50VHlwZSIsInBhcmVudFR5cGUiLCJmaWx0ZXJlZCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiaW5kZXhPZiIsIm1lcmdlRGF0YVZhcnMiLCJ0YXJnZXQiLCJldmVudFZhcnMiLCJ2YXJzIiwidW5kZWZpbmVkIiwiU2lnbmFsVHJhY2tlckRlZiIsInVudXNlZEV2ZW50VHlwZSIsInVudXNlZEVsZW1lbnQiLCJBbmFseXRpY3NFdmVudCIsInR5cGUiLCJlbmFibGVEYXRhVmFycyIsIkV2ZW50VHJhY2tlciIsInVudXNlZENvbnRleHQiLCJ1bnVzZWRDb25maWciLCJ1bnVzZWRMaXN0ZW5lciIsIm9ic2VydmFibGVzXyIsImJ1ZmZlcl8iLCJzYW5kYm94QnVmZmVyXyIsInNldFRpbWVvdXQiLCJrIiwicmVtb3ZlQWxsIiwiY29udGV4dCIsImNvbmZpZyIsImxpc3RlbmVyIiwic2VsZWN0b3IiLCJzZWxlY3Rpb25NZXRob2QiLCJ0YXJnZXRSZWFkeSIsImdldEVsZW1lbnQiLCJpc1NhbmRib3hFdmVudCIsImJ1ZmZlciIsImJ1ZmZlckxlbmd0aCIsInRoZW4iLCJpIiwiZXZlbnQiLCJjb250YWlucyIsIm9ic2VydmFibGVzIiwiYWRkIiwiZmlyZSIsInB1c2giLCJyb290VGFyZ2V0IiwiZ2V0Um9vdEVsZW1lbnQiLCJmaXJlTGlzdGVuZXJfIiwic3RvcnlTcGVjIiwicmVwZWF0IiwiZXZlbnREZXRhaWxzIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY2xpY2tPYnNlcnZhYmxlXyIsImJvdW5kT25DbGlja18iLCJiaW5kIiwiZ2V0Um9vdCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY3JlYXRlU2VsZWN0aXZlTGlzdGVuZXIiLCJoYW5kbGVDbGlja18iLCJwYXJlbnRFbGVtZW50IiwidW51c2VkRXZlbnQiLCJyb290XyIsImJvdW5kU2Nyb2xsSGFuZGxlcl8iLCJnZXRTY3JvbGxNYW5hZ2VyIiwicmVtb3ZlU2Nyb2xsSGFuZGxlciIsImVycm9yIiwiQXJyYXkiLCJib3VuZHNWIiwibm9ybWFsaXplQm91bmRhcmllc18iLCJib3VuZHNIIiwidXNlSW5pdGlhbFBhZ2VTaXplIiwic2Nyb2xsSGFuZGxlcl8iLCJhZGRTY3JvbGxIYW5kbGVyIiwiZSIsImluaXRpYWxTaXplIiwic2Nyb2xsSGVpZ2h0Iiwic2Nyb2xsV2lkdGgiLCJ0cmlnZ2VyU2Nyb2xsRXZlbnRzXyIsInRvcCIsImhlaWdodCIsImxlZnQiLCJ3aWR0aCIsImJvdW5kcyIsInJlc3VsdCIsImIiLCJib3VuZCIsImlzRmluaXRlIiwiTWF0aCIsIm1pbiIsInJvdW5kIiwic2Nyb2xsUG9zIiwidmFyTmFtZSIsInBhcnNlSW50Iiwic2lnbmFsc1Byb21pc2UiLCJnZXRSb290U2lnbmFsIiwiZ2V0QW1wRWxlbWVudCIsImVsZW1lbnQiLCJnZXRFbGVtZW50U2lnbmFsIiwic2lnbmFscyIsIndoZW5TaWduYWwiLCJwcm9taXNlIiwid2hlbkluaUxvYWRlZCIsIlByb21pc2UiLCJyYWNlIiwiTE9BRF9FTkQiLCJUaW1lckV2ZW50SGFuZGxlciIsInRpbWVyU3BlYyIsIm9wdF9zdGFydEJ1aWxkZXIiLCJvcHRfc3RvcEJ1aWxkZXIiLCJpbnRlcnZhbElkXyIsImludGVydmFsTGVuZ3RoXyIsIk51bWJlciIsIm1heFRpbWVyTGVuZ3RoXyIsIm1heFRpbWVySW5TcGVjXyIsImNhbGxJbW1lZGlhdGVfIiwiQm9vbGVhbiIsImludGVydmFsQ2FsbGJhY2tfIiwidW5saXN0ZW5TdGFydF8iLCJ1bmxpc3RlblN0b3BfIiwic3RhcnRCdWlsZGVyXyIsInN0b3BCdWlsZGVyXyIsInN0YXJ0VGltZV8iLCJsYXN0UmVxdWVzdFRpbWVfIiwic3RhcnRUaW1lciIsImxpc3RlbkZvclN0YXJ0XyIsInVubGlzdGVuRm9yU3RvcF8iLCJ1bmxpc3RlbkZvclN0YXJ0XyIsImRpc3Bvc2UiLCJ3aW4iLCJ0aW1lckNhbGxiYWNrIiwidGltZW91dENhbGxiYWNrIiwiaXNSdW5uaW5nIiwiRGF0ZSIsIm5vdyIsInNldEludGVydmFsIiwibGlzdGVuRm9yU3RvcF8iLCJjbGVhckludGVydmFsIiwidGltZXJEdXJhdGlvbiIsImNhbGN1bGF0ZUR1cmF0aW9uXyIsInRyYWNrZXJzXyIsInRpbWVySWRTZXF1ZW5jZV8iLCJnZXRUcmFja2VkVGltZXJLZXlzIiwidGltZXJJZCIsInJlbW92ZVRyYWNrZXJfIiwidGltZXJTdGFydCIsInRpbWVyU3RvcCIsImdlbmVyYXRlVGltZXJJZF8iLCJzdGFydEJ1aWxkZXIiLCJzdG9wQnVpbGRlciIsInN0YXJ0VHJhY2tlciIsImdldFRyYWNrZXJfIiwiaGFuZGxlVGltZXJUb2dnbGVfIiwic3RvcFRyYWNrZXIiLCJ0aW1lckhhbmRsZXIiLCJpbml0Iiwic3RhcnRUaW1lcl8iLCJhc3NlcnRTdHJpbmciLCJ0cmFja2VyS2V5IiwiZ2V0VHJhY2tlckZvckFsbG93bGlzdCIsInN0b3BUaW1lcl8iLCJjcmVhdGVFdmVudF8iLCJzdGFydEludGVydmFsSW5XaW5kb3ciLCJhbXBkb2MiLCJnZXRUaW1lclZhcnMiLCJzZXNzaW9uT2JzZXJ2YWJsZV8iLCJib3VuZE9uU2Vzc2lvbl8iLCJ2aWRlb1NwZWMiLCJ0YXJnZXRQcm9taXNlcyIsImdldEVsZW1lbnRzIiwiZW5kU2Vzc2lvbldoZW5JbnZpc2libGUiLCJleGNsdWRlQXV0b3BsYXkiLCJpbnRlcnZhbCIsInBlcmNlbnRhZ2VzIiwib24iLCJwZXJjZW50YWdlSW50ZXJ2YWwiLCJpbnRlcnZhbENvdW50ZXIiLCJsYXN0UGVyY2VudGFnZSIsImRldGFpbHMiLCJub3JtYWxpemVkVHlwZSIsIm5vcm1hbGl6ZVZpZGVvRXZlbnRUeXBlIiwiU0VDT05EU19QTEFZRUQiLCJQRVJDRU5UQUdFX1BMQVlFRCIsInBlcmNlbnRhZ2UiLCJub3JtYWxpemVkUGVyY2VudGFnZSIsIm5vcm1hbGl6ZWRQZXJjZW50YWdlSW50IiwiU0VTU0lPTl9WSVNJQkxFIiwiUExBWUlOR19BVVRPIiwiZWwiLCJhc3NlcnRFbGVtZW50IiwidGFyZ2V0cyIsIm5vcm1hbGl6ZWREZXRhaWxzIiwicmVtb3ZlSW50ZXJuYWxWYXJzIiwiU0VTU0lPTiIsImNsZWFuIiwid2FpdEZvclRyYWNrZXJzXyIsInZpc2liaWxpdHlTcGVjIiwid2FpdEZvclNwZWMiLCJyZXBvcnRXaGVuU3BlYyIsImNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZ1bmMiLCJ2aXNpYmlsaXR5TWFuYWdlciIsImdldFZpc2liaWxpdHlNYW5hZ2VyIiwiY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlRm9yRG9jdW1lbnRIaWRkZW5fIiwiY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlRm9yRG9jdW1lbnRFeGl0XyIsInJlYWR5UHJvbWlzZVdhaXRGb3JTcGVjIiwibGlzdGVuUm9vdCIsImdldFJlYWR5UHJvbWlzZSIsIm9uRXZlbnRfIiwidW5saXN0ZW5Qcm9taXNlIiwiZWxlbWVudHMiLCJ1bmxpc3RlbkNhbGxiYWNrcyIsImxpc3RlbkVsZW1lbnQiLCJpc1Zpc2libGUiLCJyZXNvbHZlIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImRlZmVycmVkIiwidW5sb2FkTGlzdGVuZXIiLCJwYWdlSGlkZUxpc3RlbmVyIiwic3VwcG9ydHNQYWdlSGlkZV8iLCJvcHRfZWxlbWVudCIsInRyYWNrZXJBbGxvd2xpc3QiLCJ3YWl0Rm9yVHJhY2tlciIsInN0YXRlIiwiYXR0ciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFyQztBQUNELE9BRkQsTUFFTztBQUNMLGVBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0EsYUFBT0YsV0FBVyxHQUNkRSxjQUFjLENBQUMzSCxnQkFBZixDQUFnQ21HLFdBQWhDLEVBQTZDc0IsV0FBN0MsQ0FEYyxHQUVkRSxjQUFjLENBQUM5SCxhQUFmLENBQTZCc0csV0FBN0IsQ0FGSjtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOU9BO0FBQUE7QUFBQSxXQStPRSxrQkFBU3hNLFNBQVQsRUFBb0IrQixRQUFwQixFQUE4QnRCLE1BQTlCLEVBQXNDd04sS0FBdEMsRUFBNkM7QUFDM0M7QUFDQSxVQUFNQyxJQUFJLEdBQUd4UiwyQkFBMkIsQ0FDdEMrRCxNQURzQztBQUV0QztBQUEyQkcsTUFBQUEsU0FGVyxFQUd0Q3hELDJCQUhzQyxDQUF4Qzs7QUFLQSxXQUFLLElBQU1rRCxHQUFYLElBQWtCNE4sSUFBbEIsRUFBd0I7QUFDdEJELFFBQUFBLEtBQUssQ0FBQzNOLEdBQUQsQ0FBTCxHQUFhNE4sSUFBSSxDQUFDNU4sR0FBRCxDQUFqQjtBQUNEOztBQUNEeUIsTUFBQUEsUUFBUSxDQUNOLElBQUlmLGNBQUosQ0FBbUJQLE1BQW5CLEVBQTJCVCxTQUEzQixFQUFzQ2lPLEtBQXRDO0FBQTZDO0FBQXNCLFdBQW5FLENBRE0sQ0FBUjtBQUdEO0FBNVBIOztBQUFBO0FBQUEsRUFBdUM5TSxZQUF2QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb21tb24tc2lnbmFscyc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9vYnNlcnZhYmxlJztcbmltcG9ydCB7XG4gIFBsYXlpbmdTdGF0ZXMsXG4gIFZpZGVvQW5hbHl0aWNzRXZlbnRzLFxuICB2aWRlb0FuYWx5dGljc0N1c3RvbUV2ZW50VHlwZUtleSxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL3ZpZGVvLWludGVyZmFjZSc7XG5pbXBvcnQge2RlZXBNZXJnZSwgZGljdCwgaGFzT3dufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2dldERhdGF9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2lzQW1wRWxlbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL2FtcC1lbGVtZW50LWhlbHBlcnMnO1xuaW1wb3J0IHtpc0FycmF5LCBpc0VudW1WYWx1ZSwgaXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcblxuY29uc3QgU0NST0xMX1BSRUNJU0lPTl9QRVJDRU5UID0gNTtcbmNvbnN0IFZBUl9IX1NDUk9MTF9CT1VOREFSWSA9ICdob3Jpem9udGFsU2Nyb2xsQm91bmRhcnknO1xuY29uc3QgVkFSX1ZfU0NST0xMX0JPVU5EQVJZID0gJ3ZlcnRpY2FsU2Nyb2xsQm91bmRhcnknO1xuY29uc3QgTUlOX1RJTUVSX0lOVEVSVkFMX1NFQ09ORFMgPSAwLjU7XG5jb25zdCBERUZBVUxUX01BWF9USU1FUl9MRU5HVEhfU0VDT05EUyA9IDcyMDA7XG5jb25zdCBWQVJJQUJMRV9EQVRBX0FUVFJJQlVURV9LRVkgPSAvXnZhcnMoLispLztcbmNvbnN0IE5PX1VOTElTVEVOID0gZnVuY3Rpb24gKCkge307XG5jb25zdCBUQUcgPSAnYW1wLWFuYWx5dGljcy9ldmVudHMnO1xuXG4vKipcbiAqIEV2ZW50cyB0aGF0IGNhbiByZXN1bHQgaW4gYW5hbHl0aWNzIGRhdGEgdG8gYmUgc2VudC5cbiAqIEBjb25zdFxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IEFuYWx5dGljc0V2ZW50VHlwZSA9IHtcbiAgQ0xJQ0s6ICdjbGljaycsXG4gIENVU1RPTTogJ2N1c3RvbScsXG4gIEhJRERFTjogJ2hpZGRlbicsXG4gIElOSV9MT0FEOiAnaW5pLWxvYWQnLFxuICBSRU5ERVJfU1RBUlQ6ICdyZW5kZXItc3RhcnQnLFxuICBTQ1JPTEw6ICdzY3JvbGwnLFxuICBTVE9SWTogJ3N0b3J5JyxcbiAgVElNRVI6ICd0aW1lcicsXG4gIFZJREVPOiAndmlkZW8nLFxuICBWSVNJQkxFOiAndmlzaWJsZScsXG59O1xuXG5jb25zdCBBTExPV0VEX0ZPUl9BTExfUk9PVF9UWVBFUyA9IFsnYW1wZG9jJywgJ2VtYmVkJ107XG5cbi8qKlxuICogRXZlbnRzIHRoYXQgY2FuIHJlc3VsdCBpbiBhbmFseXRpY3MgZGF0YSB0byBiZSBzZW50LlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywge1xuICogICAgIG5hbWU6IHN0cmluZyxcbiAqICAgICBhbGxvd2VkRm9yOiAhQXJyYXk8c3RyaW5nPixcbiAqICAgICBrbGFzczogdHlwZW9mIC4vZXZlbnRzLkV2ZW50VHJhY2tlclxuICogICB9Pn1cbiAqL1xuY29uc3QgVFJBQ0tFUl9UWVBFID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFtBbmFseXRpY3NFdmVudFR5cGUuQ0xJQ0tdOiB7XG4gICAgbmFtZTogQW5hbHl0aWNzRXZlbnRUeXBlLkNMSUNLLFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLmNvbmNhdChbJ3RpbWVyJ10pLFxuICAgIC8vIEVzY2FwZSB0aGUgdGVtcG9yYWwgZGVhZCB6b25lIGJ5IG5vdCByZWZlcmVuY2luZyBhIGNsYXNzIGRpcmVjdGx5LlxuICAgIGtsYXNzOiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcmV0dXJuIG5ldyBDbGlja0V2ZW50VHJhY2tlcihyb290KTtcbiAgICB9LFxuICB9LFxuICBbQW5hbHl0aWNzRXZlbnRUeXBlLkNVU1RPTV06IHtcbiAgICBuYW1lOiBBbmFseXRpY3NFdmVudFR5cGUuQ1VTVE9NLFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLmNvbmNhdChbJ3RpbWVyJ10pLFxuICAgIGtsYXNzOiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudFRyYWNrZXIocm9vdCk7XG4gICAgfSxcbiAgfSxcbiAgW0FuYWx5dGljc0V2ZW50VHlwZS5ISURERU5dOiB7XG4gICAgbmFtZTogQW5hbHl0aWNzRXZlbnRUeXBlLlZJU0lCTEUsIC8vIFJldXNlIHRyYWNrZXIgd2l0aCB2aXNpYmlsaXR5XG4gICAgYWxsb3dlZEZvcjogQUxMT1dFRF9GT1JfQUxMX1JPT1RfVFlQRVMuY29uY2F0KFsndGltZXInXSksXG4gICAga2xhc3M6IGZ1bmN0aW9uIChyb290KSB7XG4gICAgICByZXR1cm4gbmV3IFZpc2liaWxpdHlUcmFja2VyKHJvb3QpO1xuICAgIH0sXG4gIH0sXG4gIFtBbmFseXRpY3NFdmVudFR5cGUuSU5JX0xPQURdOiB7XG4gICAgbmFtZTogQW5hbHl0aWNzRXZlbnRUeXBlLklOSV9MT0FELFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLmNvbmNhdChbJ3RpbWVyJywgJ3Zpc2libGUnXSksXG4gICAga2xhc3M6IGZ1bmN0aW9uIChyb290KSB7XG4gICAgICByZXR1cm4gbmV3IEluaUxvYWRUcmFja2VyKHJvb3QpO1xuICAgIH0sXG4gIH0sXG4gIFtBbmFseXRpY3NFdmVudFR5cGUuUkVOREVSX1NUQVJUXToge1xuICAgIG5hbWU6IEFuYWx5dGljc0V2ZW50VHlwZS5SRU5ERVJfU1RBUlQsXG4gICAgYWxsb3dlZEZvcjogQUxMT1dFRF9GT1JfQUxMX1JPT1RfVFlQRVMuY29uY2F0KFsndGltZXInLCAndmlzaWJsZSddKSxcbiAgICBrbGFzczogZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAgIHJldHVybiBuZXcgU2lnbmFsVHJhY2tlcihyb290KTtcbiAgICB9LFxuICB9LFxuICBbQW5hbHl0aWNzRXZlbnRUeXBlLlNDUk9MTF06IHtcbiAgICBuYW1lOiBBbmFseXRpY3NFdmVudFR5cGUuU0NST0xMLFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLmNvbmNhdChbJ3RpbWVyJ10pLFxuICAgIGtsYXNzOiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcmV0dXJuIG5ldyBTY3JvbGxFdmVudFRyYWNrZXIocm9vdCk7XG4gICAgfSxcbiAgfSxcbiAgW0FuYWx5dGljc0V2ZW50VHlwZS5TVE9SWV06IHtcbiAgICBuYW1lOiBBbmFseXRpY3NFdmVudFR5cGUuU1RPUlksXG4gICAgYWxsb3dlZEZvcjogQUxMT1dFRF9GT1JfQUxMX1JPT1RfVFlQRVMsXG4gICAga2xhc3M6IGZ1bmN0aW9uIChyb290KSB7XG4gICAgICByZXR1cm4gbmV3IEFtcFN0b3J5RXZlbnRUcmFja2VyKHJvb3QpO1xuICAgIH0sXG4gIH0sXG4gIFtBbmFseXRpY3NFdmVudFR5cGUuVElNRVJdOiB7XG4gICAgbmFtZTogQW5hbHl0aWNzRXZlbnRUeXBlLlRJTUVSLFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLFxuICAgIGtsYXNzOiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1lckV2ZW50VHJhY2tlcihyb290KTtcbiAgICB9LFxuICB9LFxuICBbQW5hbHl0aWNzRXZlbnRUeXBlLlZJREVPXToge1xuICAgIG5hbWU6IEFuYWx5dGljc0V2ZW50VHlwZS5WSURFTyxcbiAgICBhbGxvd2VkRm9yOiBBTExPV0VEX0ZPUl9BTExfUk9PVF9UWVBFUy5jb25jYXQoWyd0aW1lciddKSxcbiAgICBrbGFzczogZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAgIHJldHVybiBuZXcgVmlkZW9FdmVudFRyYWNrZXIocm9vdCk7XG4gICAgfSxcbiAgfSxcbiAgW0FuYWx5dGljc0V2ZW50VHlwZS5WSVNJQkxFXToge1xuICAgIG5hbWU6IEFuYWx5dGljc0V2ZW50VHlwZS5WSVNJQkxFLFxuICAgIGFsbG93ZWRGb3I6IEFMTE9XRURfRk9SX0FMTF9ST09UX1RZUEVTLmNvbmNhdChbJ3RpbWVyJ10pLFxuICAgIGtsYXNzOiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcmV0dXJuIG5ldyBWaXNpYmlsaXR5VHJhY2tlcihyb290KTtcbiAgICB9LFxuICB9LFxufSk7XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjb25zdCB0cmFja2VyVHlwZUZvclRlc3RpbmcgPSBUUkFDS0VSX1RZUEU7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXJUeXBlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FtcFN0b3J5VHJpZ2dlclR5cGUodHJpZ2dlclR5cGUpIHtcbiAgcmV0dXJuIHRyaWdnZXJUeXBlLnN0YXJ0c1dpdGgoJ3N0b3J5Jyk7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoYXQgdGhlIHNlbGVjdG9ycyBhcmUgYWxsIHVuaXF1ZVxuICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPnxzdHJpbmd9IHNlbGVjdG9yc1xuICovXG5mdW5jdGlvbiBhc3NlcnRVbmlxdWVTZWxlY3RvcnMoc2VsZWN0b3JzKSB7XG4gIHVzZXJBc3NlcnQoXG4gICAgIWlzQXJyYXkoc2VsZWN0b3JzKSB8fCBuZXcgU2V0KHNlbGVjdG9ycykuc2l6ZSA9PT0gc2VsZWN0b3JzLmxlbmd0aCxcbiAgICAnQ2Fubm90IGhhdmUgZHVwbGljYXRlIHNlbGVjdG9ycyBpbiBzZWxlY3RvcnMgbGlzdDogJXMnLFxuICAgIHNlbGVjdG9yc1xuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0cmlnZ2VyVHlwZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNWaWRlb1RyaWdnZXJUeXBlKHRyaWdnZXJUeXBlKSB7XG4gIHJldHVybiB0cmlnZ2VyVHlwZS5zdGFydHNXaXRoKCd2aWRlbycpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0cmlnZ2VyVHlwZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNSZXNlcnZlZFRyaWdnZXJUeXBlKHRyaWdnZXJUeXBlKSB7XG4gIHJldHVybiBpc0VudW1WYWx1ZShBbmFseXRpY3NFdmVudFR5cGUsIHRyaWdnZXJUeXBlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFja2VyS2V5TmFtZShldmVudFR5cGUpIHtcbiAgaWYgKGlzVmlkZW9UcmlnZ2VyVHlwZShldmVudFR5cGUpKSB7XG4gICAgcmV0dXJuIEFuYWx5dGljc0V2ZW50VHlwZS5WSURFTztcbiAgfVxuICBpZiAoaXNBbXBTdG9yeVRyaWdnZXJUeXBlKGV2ZW50VHlwZSkpIHtcbiAgICByZXR1cm4gQW5hbHl0aWNzRXZlbnRUeXBlLlNUT1JZO1xuICB9XG4gIGlmICghaXNSZXNlcnZlZFRyaWdnZXJUeXBlKGV2ZW50VHlwZSkpIHtcbiAgICByZXR1cm4gQW5hbHl0aWNzRXZlbnRUeXBlLkNVU1RPTTtcbiAgfVxuICByZXR1cm4gaGFzT3duKFRSQUNLRVJfVFlQRSwgZXZlbnRUeXBlKVxuICAgID8gVFJBQ0tFUl9UWVBFW2V2ZW50VHlwZV0ubmFtZVxuICAgIDogZXZlbnRUeXBlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRUeXBlXG4gKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgdHlwZW9mIEV2ZW50VHJhY2tlcj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFja2VyVHlwZXNGb3JQYXJlbnRUeXBlKHBhcmVudFR5cGUpIHtcbiAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgT2JqZWN0LmtleXMoVFJBQ0tFUl9UWVBFKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoXG4gICAgICBoYXNPd24oVFJBQ0tFUl9UWVBFLCBrZXkpICYmXG4gICAgICBUUkFDS0VSX1RZUEVba2V5XS5hbGxvd2VkRm9yLmluZGV4T2YocGFyZW50VHlwZSkgIT0gLTFcbiAgICApIHtcbiAgICAgIGZpbHRlcmVkW2tleV0gPSBUUkFDS0VSX1RZUEVba2V5XS5rbGFzcztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZmlsdGVyZWQ7XG59XG5cbi8qKlxuICogRXhwYW5kIHRoZSBldmVudCB2YXJpYWJsZXMgdG8gaW5jbHVkZSBkZWZhdWx0IGRhdGEtdmFyc1xuICogZXZlbnRWYXJzIHZhbHVlIHdpbGwgb3ZlcnJpZGUgZGF0YS12YXJzIHZhbHVlXG4gKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGV2ZW50VmFyc1xuICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gKi9cbmZ1bmN0aW9uIG1lcmdlRGF0YVZhcnModGFyZ2V0LCBldmVudFZhcnMpIHtcbiAgY29uc3QgdmFycyA9IGdldERhdGFQYXJhbXNGcm9tQXR0cmlidXRlcyhcbiAgICB0YXJnZXQsXG4gICAgLyogY29tcHV0ZVBhcmFtTmFtZUZ1bmMgKi9cbiAgICB1bmRlZmluZWQsXG4gICAgVkFSSUFCTEVfREFUQV9BVFRSSUJVVEVfS0VZXG4gICk7XG4gIC8vIE1lcmdlIGV2ZW50VmFycyBpbnRvIHZhcnMsIGRlcHRoPTAgYmVjYXVzZVxuICAvLyB2YXJzIGFuZCBldmVudFZhcnMgYXJlIG5vdCBzdXBwb3NlZCB0byBjb250YWluIG5lc3RlZCBvYmplY3QuXG4gIGRlZXBNZXJnZSh2YXJzLCBldmVudFZhcnMsIDApO1xuICByZXR1cm4gdmFycztcbn1cblxuLyoqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmNsYXNzIFNpZ25hbFRyYWNrZXJEZWYge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZEV2ZW50VHlwZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGdldFJvb3RTaWduYWwodW51c2VkRXZlbnRUeXBlKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkRXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHVudXNlZEVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBnZXRFbGVtZW50U2lnbmFsKHVudXNlZEV2ZW50VHlwZSwgdW51c2VkRWxlbWVudCkge31cbn1cblxuLyoqXG4gKiBUaGUgYW5hbHl0aWNzIGV2ZW50LlxuICogQGRpY3RcbiAqL1xuZXhwb3J0IGNsYXNzIEFuYWx5dGljc0V2ZW50IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldCBUaGUgbW9zdCByZWxldmFudCB0YXJnZXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHZhcnMgQSBtYXAgb2YgdmFycyBhbmQgdGhlaXIgdmFsdWVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZURhdGFWYXJzIEEgYm9vbGVhbiB0byBpbmRpY2F0ZSBpZiBkYXRhLXZhcnMtKlxuICAgKiBhdHRyaWJ1dGUgdmFsdWUgZnJvbSB0YXJnZXQgZWxlbWVudCBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih0YXJnZXQsIHR5cGUsIHZhcnMgPSBkaWN0KCksIGVuYWJsZURhdGFWYXJzID0gdHJ1ZSkge1xuICAgIC8qKiBAY29uc3QgKi9cbiAgICB0aGlzWyd0YXJnZXQnXSA9IHRhcmdldDtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpc1sndHlwZSddID0gdHlwZTtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpc1sndmFycyddID0gZW5hYmxlRGF0YVZhcnMgPyBtZXJnZURhdGFWYXJzKHRhcmdldCwgdmFycykgOiB2YXJzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGJhc2UgY2xhc3MgZm9yIGFsbCB0cmFja2Vycy4gQSB0cmFja2VyIHRyYWNrcyBhbGwgZXZlbnRzIG9mIHRoZSBzYW1lXG4gKiB0eXBlIGZvciBhIHNpbmdsZSBhbmFseXRpY3Mgcm9vdC5cbiAqXG4gKiBAaW1wbGVtZW50cyB7Li4vLi4vLi4vc3JjL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqIEBhYnN0cmFjdFxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudFRyYWNrZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290KSB7XG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlIEBhYnN0cmFjdCAqL1xuICBkaXNwb3NlKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdW51c2VkQ29udGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkRXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHVudXNlZENvbmZpZ1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFBbmFseXRpY3NFdmVudCl9IHVudXNlZExpc3RlbmVyXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBhZGQodW51c2VkQ29udGV4dCwgdW51c2VkRXZlbnRUeXBlLCB1bnVzZWRDb25maWcsIHVudXNlZExpc3RlbmVyKSB7fVxufVxuXG4vKipcbiAqIFRyYWNrcyBjdXN0b20gZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgQ3VzdG9tRXZlbnRUcmFja2VyIGV4dGVuZHMgRXZlbnRUcmFja2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW5hbHl0aWNzLXJvb3QuQW5hbHl0aWNzUm9vdH0gcm9vdFxuICAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCkge1xuICAgIHN1cGVyKHJvb3QpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsICFPYnNlcnZhYmxlPCFBbmFseXRpY3NFdmVudD4+fSAqL1xuICAgIHRoaXMub2JzZXJ2YWJsZXNfID0ge307XG5cbiAgICAvKipcbiAgICAgKiBFYXJseSBldmVudHMgaGF2ZSB0byBiZSBidWZmZXJlZCBiZWNhdXNlIHRoZXJlJ3Mgbm8gd2F5IHRvIHByZWRpY3RcbiAgICAgKiBob3cgZmFzdCBhbGwgYGFtcC1hbmFseXRpY3NgIGVsZW1lbnRzIHdpbGwgYmUgaW5zdHJ1bWVudGVkLlxuICAgICAqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgIUFycmF5PCFBbmFseXRpY3NFdmVudD4+fHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlcl8gPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFNhbmRib3ggZXZlbnRzIGdldCB0aGVpciBvd24gYnVmZmVyLCBiZWNhdXNlIGhhbmRsZXIgdG8gdGhvc2UgZXZlbnRzIHdpbGxcbiAgICAgKiBiZSBhZGRlZCBhZnRlciBwYXJlbnQgZWxlbWVudCdzIGxheW91dC4gKFRpbWUgdmFyaWVzLCBjYW4gYmUgbGF0ZXIgdGhhblxuICAgICAqIDEwcykgc2FuZGJveCBldmVudHMgYnVmZmVyIHdpbGwgbmV2ZXIgZXhwaXJlIGJ1dCB3aWxsIGNsZWFyZWQgd2hlblxuICAgICAqIGhhbmRsZXIgaXMgcmVhZHkuXG4gICAgICogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhQXJyYXk8IUFuYWx5dGljc0V2ZW50Pnx1bmRlZmluZWQ+fHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICB0aGlzLnNhbmRib3hCdWZmZXJfID0ge307XG5cbiAgICAvLyBTdG9wIGJ1ZmZlcmluZyBvZiBjdXN0b20gZXZlbnRzIGFmdGVyIDEwIHNlY29uZHMuIEFzc3VtcHRpb24gaXMgdGhhdCBhbGxcbiAgICAvLyBgYW1wLWFuYWx5dGljc2AgZWxlbWVudHMgd2lsbCBoYXZlIGJlZW4gaW5zdHJ1bWVudGVkIGJ5IHRoaXMgdGltZS5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuYnVmZmVyXyA9IHVuZGVmaW5lZDtcbiAgICB9LCAxMDAwMCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5idWZmZXJfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2FuZGJveEJ1ZmZlcl8gPSB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBrIGluIHRoaXMub2JzZXJ2YWJsZXNfKSB7XG4gICAgICB0aGlzLm9ic2VydmFibGVzX1trXS5yZW1vdmVBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFkZChjb250ZXh0LCBldmVudFR5cGUsIGNvbmZpZywgbGlzdGVuZXIpIHtcbiAgICBsZXQgc2VsZWN0b3IgPSBjb25maWdbJ3NlbGVjdG9yJ107XG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgc2VsZWN0b3IgPSAnOnJvb3QnO1xuICAgIH1cbiAgICBjb25zdCBzZWxlY3Rpb25NZXRob2QgPSBjb25maWdbJ3NlbGVjdGlvbk1ldGhvZCddIHx8IG51bGw7XG5cbiAgICBjb25zdCB0YXJnZXRSZWFkeSA9IHRoaXMucm9vdC5nZXRFbGVtZW50KFxuICAgICAgY29udGV4dCxcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgc2VsZWN0aW9uTWV0aG9kXG4gICAgKTtcblxuICAgIGNvbnN0IGlzU2FuZGJveEV2ZW50ID0gZXZlbnRUeXBlLnN0YXJ0c1dpdGgoJ3NhbmRib3gtJyk7XG5cbiAgICAvLyBQdXNoIHJlY2VudCBldmVudHMgaWYgYW55LlxuICAgIGNvbnN0IGJ1ZmZlciA9IGlzU2FuZGJveEV2ZW50XG4gICAgICA/IHRoaXMuc2FuZGJveEJ1ZmZlcl8gJiYgdGhpcy5zYW5kYm94QnVmZmVyX1tldmVudFR5cGVdXG4gICAgICA6IHRoaXMuYnVmZmVyXyAmJiB0aGlzLmJ1ZmZlcl9bZXZlbnRUeXBlXTtcblxuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgICB0YXJnZXRSZWFkeS50aGVuKCh0YXJnZXQpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXJMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBidWZmZXJbaV07XG4gICAgICAgICAgICBpZiAodGFyZ2V0LmNvbnRhaW5zKGV2ZW50Wyd0YXJnZXQnXSkpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNTYW5kYm94RXZlbnQpIHtcbiAgICAgICAgICAgIC8vIFdlIGFzc3VtZSBzYW5kYm94IGV2ZW50IHdpbGwgb25seSBoYXMgc2luZ2xlIGxpc3RlbmVyLlxuICAgICAgICAgICAgLy8gSXQgaXMgc2FmZSB0byBjbGVhciBidWZmZXIgb25jZSBoYW5kbGVyIGlzIHJlYWR5LlxuICAgICAgICAgICAgdGhpcy5zYW5kYm94QnVmZmVyX1tldmVudFR5cGVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgb2JzZXJ2YWJsZXMgPSB0aGlzLm9ic2VydmFibGVzX1tldmVudFR5cGVdO1xuICAgIGlmICghb2JzZXJ2YWJsZXMpIHtcbiAgICAgIG9ic2VydmFibGVzID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICAgIHRoaXMub2JzZXJ2YWJsZXNfW2V2ZW50VHlwZV0gPSBvYnNlcnZhYmxlcztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlc19bZXZlbnRUeXBlXS5hZGQoKGV2ZW50KSA9PiB7XG4gICAgICAvLyBXYWl0IGZvciB0YXJnZXQgc2VsZWN0ZWRcbiAgICAgIHRhcmdldFJlYWR5LnRoZW4oKHRhcmdldCkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0LmNvbnRhaW5zKGV2ZW50Wyd0YXJnZXQnXSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgY3VzdG9tIGV2ZW50IGZvciB0aGUgYXNzb2NpYXRlZCByb290LlxuICAgKiBAcGFyYW0geyFBbmFseXRpY3NFdmVudH0gZXZlbnRcbiAgICovXG4gIHRyaWdnZXIoZXZlbnQpIHtcbiAgICBjb25zdCBldmVudFR5cGUgPSBldmVudFsndHlwZSddO1xuICAgIGNvbnN0IGlzU2FuZGJveEV2ZW50ID0gZXZlbnRUeXBlLnN0YXJ0c1dpdGgoJ3NhbmRib3gtJyk7XG4gICAgY29uc3Qgb2JzZXJ2YWJsZXMgPSB0aGlzLm9ic2VydmFibGVzX1tldmVudFR5cGVdO1xuXG4gICAgLy8gSWYgbGlzdGVuZXJzIGFscmVhZHkgcHJlc2VudCAtIHRyaWdnZXIgcmlnaHQgYXdheS5cbiAgICBpZiAob2JzZXJ2YWJsZXMpIHtcbiAgICAgIG9ic2VydmFibGVzLmZpcmUoZXZlbnQpO1xuICAgICAgaWYgKGlzU2FuZGJveEV2ZW50KSB7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gYnVmZmVyIHNhbmRib3ggZXZlbnQgaWYgaGFuZGxlciByZWFkeVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGJ1ZmZlciBhbmQgZW5xdWV1ZSBidWZmZXIgaWYgbmVlZGVkXG4gICAgaWYgKGlzU2FuZGJveEV2ZW50KSB7XG4gICAgICB0aGlzLnNhbmRib3hCdWZmZXJfW2V2ZW50VHlwZV0gPSB0aGlzLnNhbmRib3hCdWZmZXJfW2V2ZW50VHlwZV0gfHwgW107XG4gICAgICB0aGlzLnNhbmRib3hCdWZmZXJfW2V2ZW50VHlwZV0ucHVzaChldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENoZWNrIGlmIGJ1ZmZlciBoYXMgZXhwaXJlZFxuICAgICAgaWYgKHRoaXMuYnVmZmVyXykge1xuICAgICAgICB0aGlzLmJ1ZmZlcl9bZXZlbnRUeXBlXSA9IHRoaXMuYnVmZmVyX1tldmVudFR5cGVdIHx8IFtdO1xuICAgICAgICB0aGlzLmJ1ZmZlcl9bZXZlbnRUeXBlXS5wdXNoKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETyhFbnJpcWUpOiBJZiBuZWVkZWQsIGFkZCBzdXBwb3J0IGZvciBzYW5kYm94IHN0b3J5IGV2ZW50LlxuLy8gKGUuZy4gc2FuZGJveC1zdG9yeS14eHgpLlxuZXhwb3J0IGNsYXNzIEFtcFN0b3J5RXZlbnRUcmFja2VyIGV4dGVuZHMgQ3VzdG9tRXZlbnRUcmFja2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW5hbHl0aWNzLXJvb3QuQW5hbHl0aWNzUm9vdH0gcm9vdFxuICAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCkge1xuICAgIHN1cGVyKHJvb3QpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhZGQoY29udGV4dCwgZXZlbnRUeXBlLCBjb25maWcsIGxpc3RlbmVyKSB7XG4gICAgY29uc3Qgcm9vdFRhcmdldCA9IHRoaXMucm9vdC5nZXRSb290RWxlbWVudCgpO1xuXG4gICAgLy8gRmlyZSBidWZmZXJlZCBldmVudHMgaWYgYW55LlxuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuYnVmZmVyXyAmJiB0aGlzLmJ1ZmZlcl9bZXZlbnRUeXBlXTtcbiAgICBpZiAoYnVmZmVyKSB7XG4gICAgICBjb25zdCBidWZmZXJMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1ZmZlckxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gYnVmZmVyW2ldO1xuICAgICAgICB0aGlzLmZpcmVMaXN0ZW5lcl8oZXZlbnQsIHJvb3RUYXJnZXQsIGNvbmZpZywgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBvYnNlcnZhYmxlcyA9IHRoaXMub2JzZXJ2YWJsZXNfW2V2ZW50VHlwZV07XG4gICAgaWYgKCFvYnNlcnZhYmxlcykge1xuICAgICAgb2JzZXJ2YWJsZXMgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuICAgICAgdGhpcy5vYnNlcnZhYmxlc19bZXZlbnRUeXBlXSA9IG9ic2VydmFibGVzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9ic2VydmFibGVzX1tldmVudFR5cGVdLmFkZCgoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuZmlyZUxpc3RlbmVyXyhldmVudCwgcm9vdFRhcmdldCwgY29uZmlnLCBsaXN0ZW5lcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmlyZXMgbGlzdGVuZXIgZ2l2ZW4gdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uLlxuICAgKiBAcGFyYW0geyFBbmFseXRpY3NFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFRhcmdldFxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHBhcmFtIHtmdW5jdGlvbighQW5hbHl0aWNzRXZlbnQpfSBsaXN0ZW5lclxuICAgKi9cbiAgZmlyZUxpc3RlbmVyXyhldmVudCwgcm9vdFRhcmdldCwgY29uZmlnLCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IHR5cGUgPSBldmVudFsndHlwZSddO1xuICAgIGNvbnN0IHZhcnMgPSBldmVudFsndmFycyddO1xuXG4gICAgY29uc3Qgc3RvcnlTcGVjID0gY29uZmlnWydzdG9yeVNwZWMnXSB8fCB7fTtcbiAgICBjb25zdCByZXBlYXQgPVxuICAgICAgc3RvcnlTcGVjWydyZXBlYXQnXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHN0b3J5U3BlY1sncmVwZWF0J107XG4gICAgY29uc3QgZXZlbnREZXRhaWxzID0gdmFyc1snZXZlbnREZXRhaWxzJ107XG4gICAgY29uc3QgdGFnTmFtZSA9IGNvbmZpZ1sndGFnTmFtZSddO1xuXG4gICAgaWYgKFxuICAgICAgdGFnTmFtZSAmJlxuICAgICAgZXZlbnREZXRhaWxzWyd0YWdOYW1lJ10gJiZcbiAgICAgIHRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gZXZlbnREZXRhaWxzWyd0YWdOYW1lJ11cbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocmVwZWF0ID09PSBmYWxzZSAmJiBldmVudERldGFpbHNbJ3JlcGVhdGVkJ10pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcihuZXcgQW5hbHl0aWNzRXZlbnQocm9vdFRhcmdldCwgdHlwZSwgdmFycykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgY3VzdG9tIGV2ZW50IGZvciB0aGUgYXNzb2NpYXRlZCByb290LCBvciBidWZmZXJzIHRoZW0gaWYgdGhlXG4gICAqIG9ic2VydmFibGVzIGFyZW4ndCBwcmVzZW50IHlldC5cbiAgICogQHBhcmFtIHshQW5hbHl0aWNzRXZlbnR9IGV2ZW50XG4gICAqL1xuICB0cmlnZ2VyKGV2ZW50KSB7XG4gICAgY29uc3QgZXZlbnRUeXBlID0gZXZlbnRbJ3R5cGUnXTtcbiAgICBjb25zdCBvYnNlcnZhYmxlcyA9IHRoaXMub2JzZXJ2YWJsZXNfW2V2ZW50VHlwZV07XG5cbiAgICAvLyBJZiBsaXN0ZW5lcnMgYWxyZWFkeSBwcmVzZW50IC0gdHJpZ2dlciByaWdodCBhd2F5LlxuICAgIGlmIChvYnNlcnZhYmxlcykge1xuICAgICAgb2JzZXJ2YWJsZXMuZmlyZShldmVudCk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGJ1ZmZlciBhbmQgZW5xdWV1ZSBldmVudCBpZiBuZWVkZWQuXG4gICAgaWYgKHRoaXMuYnVmZmVyXykge1xuICAgICAgdGhpcy5idWZmZXJfW2V2ZW50VHlwZV0gPSB0aGlzLmJ1ZmZlcl9bZXZlbnRUeXBlXSB8fCBbXTtcbiAgICAgIHRoaXMuYnVmZmVyX1tldmVudFR5cGVdLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBjbGljayBldmVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGlja0V2ZW50VHJhY2tlciBleHRlbmRzIEV2ZW50VHJhY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FuYWx5dGljcy1yb290LkFuYWx5dGljc1Jvb3R9IHJvb3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3QpIHtcbiAgICBzdXBlcihyb290KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9ic2VydmFibGU8IUV2ZW50Pn0gKi9cbiAgICB0aGlzLmNsaWNrT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oIUV2ZW50KX0gKi9cbiAgICB0aGlzLmJvdW5kT25DbGlja18gPSB0aGlzLmNsaWNrT2JzZXJ2YWJsZV8uZmlyZS5iaW5kKHRoaXMuY2xpY2tPYnNlcnZhYmxlXyk7XG4gICAgdGhpcy5yb290LmdldFJvb3QoKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYm91bmRPbkNsaWNrXyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5yb290LmdldFJvb3QoKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYm91bmRPbkNsaWNrXyk7XG4gICAgdGhpcy5jbGlja09ic2VydmFibGVfLnJlbW92ZUFsbCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhZGQoY29udGV4dCwgZXZlbnRUeXBlLCBjb25maWcsIGxpc3RlbmVyKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSB1c2VyQXNzZXJ0KFxuICAgICAgY29uZmlnWydzZWxlY3RvciddLFxuICAgICAgJ01pc3NpbmcgcmVxdWlyZWQgc2VsZWN0b3Igb24gY2xpY2sgdHJpZ2dlcidcbiAgICApO1xuICAgIGNvbnN0IHNlbGVjdGlvbk1ldGhvZCA9IGNvbmZpZ1snc2VsZWN0aW9uTWV0aG9kJ10gfHwgbnVsbDtcbiAgICByZXR1cm4gdGhpcy5jbGlja09ic2VydmFibGVfLmFkZChcbiAgICAgIHRoaXMucm9vdC5jcmVhdGVTZWxlY3RpdmVMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5oYW5kbGVDbGlja18uYmluZCh0aGlzLCBsaXN0ZW5lciksXG4gICAgICAgIGNvbnRleHQucGFyZW50RWxlbWVudCB8fCBjb250ZXh0LFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgc2VsZWN0aW9uTWV0aG9kXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFBbmFseXRpY3NFdmVudCl9IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0geyFFdmVudH0gdW51c2VkRXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUNsaWNrXyhsaXN0ZW5lciwgdGFyZ2V0LCB1bnVzZWRFdmVudCkge1xuICAgIGxpc3RlbmVyKG5ldyBBbmFseXRpY3NFdmVudCh0YXJnZXQsICdjbGljaycpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBzY3JvbGwgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgU2Nyb2xsRXZlbnRUcmFja2VyIGV4dGVuZHMgRXZlbnRUcmFja2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW5hbHl0aWNzLXJvb3QuQW5hbHl0aWNzUm9vdH0gcm9vdFxuICAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCkge1xuICAgIHN1cGVyKHJvb3QpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290ICovXG4gICAgdGhpcy5yb290XyA9IHJvb3Q7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbighT2JqZWN0KX0gKi9cbiAgICB0aGlzLmJvdW5kU2Nyb2xsSGFuZGxlcl8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLmJvdW5kU2Nyb2xsSGFuZGxlcl8gIT09IG51bGwpIHtcbiAgICAgIHRoaXMucm9vdF9cbiAgICAgICAgLmdldFNjcm9sbE1hbmFnZXIoKVxuICAgICAgICAucmVtb3ZlU2Nyb2xsSGFuZGxlcih0aGlzLmJvdW5kU2Nyb2xsSGFuZGxlcl8pO1xuICAgICAgdGhpcy5ib3VuZFNjcm9sbEhhbmRsZXJfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFkZChjb250ZXh0LCBldmVudFR5cGUsIGNvbmZpZywgbGlzdGVuZXIpIHtcbiAgICBpZiAoIWNvbmZpZ1snc2Nyb2xsU3BlYyddKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnTWlzc2luZyBzY3JvbGxTcGVjIG9uIHNjcm9sbCB0cmlnZ2VyLicpO1xuICAgICAgcmV0dXJuIE5PX1VOTElTVEVOO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICFBcnJheS5pc0FycmF5KGNvbmZpZ1snc2Nyb2xsU3BlYyddWyd2ZXJ0aWNhbEJvdW5kYXJpZXMnXSkgJiZcbiAgICAgICFBcnJheS5pc0FycmF5KGNvbmZpZ1snc2Nyb2xsU3BlYyddWydob3Jpem9udGFsQm91bmRhcmllcyddKVxuICAgICkge1xuICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgICdCb3VuZGFyaWVzIGFyZSByZXF1aXJlZCBmb3IgdGhlIHNjcm9sbCB0cmlnZ2VyIHRvIHdvcmsuJ1xuICAgICAgKTtcbiAgICAgIHJldHVybiBOT19VTkxJU1RFTjtcbiAgICB9XG5cbiAgICBjb25zdCBib3VuZHNWID0gdGhpcy5ub3JtYWxpemVCb3VuZGFyaWVzXyhcbiAgICAgIGNvbmZpZ1snc2Nyb2xsU3BlYyddWyd2ZXJ0aWNhbEJvdW5kYXJpZXMnXVxuICAgICk7XG4gICAgY29uc3QgYm91bmRzSCA9IHRoaXMubm9ybWFsaXplQm91bmRhcmllc18oXG4gICAgICBjb25maWdbJ3Njcm9sbFNwZWMnXVsnaG9yaXpvbnRhbEJvdW5kYXJpZXMnXVxuICAgICk7XG4gICAgY29uc3QgdXNlSW5pdGlhbFBhZ2VTaXplID0gISFjb25maWdbJ3Njcm9sbFNwZWMnXVsndXNlSW5pdGlhbFBhZ2VTaXplJ107XG5cbiAgICB0aGlzLmJvdW5kU2Nyb2xsSGFuZGxlcl8gPSB0aGlzLnNjcm9sbEhhbmRsZXJfLmJpbmQoXG4gICAgICB0aGlzLFxuICAgICAgYm91bmRzSCxcbiAgICAgIGJvdW5kc1YsXG4gICAgICB1c2VJbml0aWFsUGFnZVNpemUsXG4gICAgICBsaXN0ZW5lclxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5yb290X1xuICAgICAgLmdldFNjcm9sbE1hbmFnZXIoKVxuICAgICAgLmFkZFNjcm9sbEhhbmRsZXIodGhpcy5ib3VuZFNjcm9sbEhhbmRsZXJfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBoYW5kbGUgc2Nyb2xsIGV2ZW50cyBmcm9tIHRoZSBTY3JvbGwgbWFuYWdlclxuICAgKiBAcGFyYW0geyFPYmplY3Q8bnVtYmVyLGJvb2xlYW4+fSBib3VuZHNIXG4gICAqIEBwYXJhbSB7IU9iamVjdDxudW1iZXIsYm9vbGVhbj59IGJvdW5kc1ZcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VJbml0aWFsUGFnZVNpemVcbiAgICogQHBhcmFtIHtmdW5jdGlvbighQW5hbHl0aWNzRXZlbnQpfSBsaXN0ZW5lclxuICAgKiBAcGFyYW0geyFPYmplY3R9IGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNjcm9sbEhhbmRsZXJfKGJvdW5kc0gsIGJvdW5kc1YsIHVzZUluaXRpYWxQYWdlU2l6ZSwgbGlzdGVuZXIsIGUpIHtcbiAgICAvLyBDYWxjdWxhdGVzIHBlcmNlbnRhZ2Ugc2Nyb2xsZWQgYnkgYWRkaW5nIHNjcmVlbiBoZWlnaHQvd2lkdGggdG9cbiAgICAvLyB0b3AvbGVmdCBhbmQgZGl2aWRpbmcgYnkgdGhlIHRvdGFsIHNjcm9sbCBoZWlnaHQvd2lkdGguXG4gICAgY29uc3Qge3Njcm9sbEhlaWdodCwgc2Nyb2xsV2lkdGh9ID0gdXNlSW5pdGlhbFBhZ2VTaXplID8gZS5pbml0aWFsU2l6ZSA6IGU7XG5cbiAgICB0aGlzLnRyaWdnZXJTY3JvbGxFdmVudHNfKFxuICAgICAgYm91bmRzVixcbiAgICAgICgoZS50b3AgKyBlLmhlaWdodCkgKiAxMDApIC8gc2Nyb2xsSGVpZ2h0LFxuICAgICAgVkFSX1ZfU0NST0xMX0JPVU5EQVJZLFxuICAgICAgbGlzdGVuZXJcbiAgICApO1xuXG4gICAgdGhpcy50cmlnZ2VyU2Nyb2xsRXZlbnRzXyhcbiAgICAgIGJvdW5kc0gsXG4gICAgICAoKGUubGVmdCArIGUud2lkdGgpICogMTAwKSAvIHNjcm9sbFdpZHRoLFxuICAgICAgVkFSX0hfU0NST0xMX0JPVU5EQVJZLFxuICAgICAgbGlzdGVuZXJcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdW5kcyB0aGUgYm91bmRhcmllcyBmb3Igc2Nyb2xsIHRyaWdnZXIgdG8gbmVhcmVzdFxuICAgKiBTQ1JPTExfUFJFQ0lTSU9OX1BFUkNFTlQgYW5kIHJldHVybnMgYW4gb2JqZWN0IHdpdGggbm9ybWFsaXplZCBib3VuZGFyaWVzXG4gICAqIGFzIGtleXMgYW5kIGZhbHNlIGFzIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXk8bnVtYmVyPn0gYm91bmRzIGFycmF5IG9mIGJvdW5kcy5cbiAgICogQHJldHVybiB7IUpzb25PYmplY3R9IE9iamVjdCB3aXRoIG5vcm1hbGl6ZWQgYm91bmRzIGFzIGtleXNcbiAgICogYW5kIGZhbHNlIGFzIHZhbHVlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbm9ybWFsaXplQm91bmRhcmllc18oYm91bmRzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZGljdCh7fSk7XG4gICAgaWYgKCFib3VuZHMgfHwgIUFycmF5LmlzQXJyYXkoYm91bmRzKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBiID0gMDsgYiA8IGJvdW5kcy5sZW5ndGg7IGIrKykge1xuICAgICAgbGV0IGJvdW5kID0gYm91bmRzW2JdO1xuICAgICAgaWYgKHR5cGVvZiBib3VuZCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKGJvdW5kKSkge1xuICAgICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnU2Nyb2xsIHRyaWdnZXIgYm91bmRhcmllcyBtdXN0IGJlIGZpbml0ZS4nKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgYm91bmQgPSBNYXRoLm1pbihcbiAgICAgICAgTWF0aC5yb3VuZChib3VuZCAvIFNDUk9MTF9QUkVDSVNJT05fUEVSQ0VOVCkgKiBTQ1JPTExfUFJFQ0lTSU9OX1BFUkNFTlQsXG4gICAgICAgIDEwMFxuICAgICAgKTtcbiAgICAgIHJlc3VsdFtib3VuZF0gPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFPYmplY3Q8bnVtYmVyLCBib29sZWFuPn0gYm91bmRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JvbGxQb3MgTnVtYmVyIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBzY3JvbGxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhck5hbWUgdmFyaWFibGUgbmFtZSB0byBhc3NpZ24gdG8gdGhlIGJvdW5kIHRoYXRcbiAgICogQHBhcmFtIHtmdW5jdGlvbighQW5hbHl0aWNzRXZlbnQpfSBsaXN0ZW5lclxuICAgKiB0cmlnZ2VycyB0aGUgZXZlbnQgcG9zaXRpb24uXG4gICAqL1xuICB0cmlnZ2VyU2Nyb2xsRXZlbnRzXyhib3VuZHMsIHNjcm9sbFBvcywgdmFyTmFtZSwgbGlzdGVuZXIpIHtcbiAgICBpZiAoIXNjcm9sbFBvcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEdvZXMgdGhyb3VnaCBlYWNoIG9mIHRoZSBib3VuZGFyaWVzIGFuZCBmaXJlcyBhbiBldmVudCBpZiBpdCBoYXMgbm90XG4gICAgLy8gYmVlbiBmaXJlZCBzbyBmYXIgYW5kIGl0IHNob3VsZCBiZS5cbiAgICBmb3IgKGNvbnN0IGIgaW4gYm91bmRzKSB7XG4gICAgICBpZiAoIWhhc093bihib3VuZHMsIGIpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYm91bmQgPSBwYXJzZUludChiLCAxMCk7XG4gICAgICBpZiAoYm91bmQgPiBzY3JvbGxQb3MgfHwgYm91bmRzW2JvdW5kXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJvdW5kc1tib3VuZF0gPSB0cnVlO1xuICAgICAgY29uc3QgdmFycyA9IGRpY3QoKTtcbiAgICAgIHZhcnNbdmFyTmFtZV0gPSBiO1xuICAgICAgbGlzdGVuZXIoXG4gICAgICAgIG5ldyBBbmFseXRpY3NFdmVudChcbiAgICAgICAgICB0aGlzLnJvb3RfLmdldFJvb3RFbGVtZW50KCksXG4gICAgICAgICAgQW5hbHl0aWNzRXZlbnRUeXBlLlNDUk9MTCxcbiAgICAgICAgICB2YXJzLFxuICAgICAgICAgIC8qKiBlbmFibGVEYXRhVmFycyAqLyBmYWxzZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBldmVudHMgYmFzZWQgb24gc2lnbmFscy5cbiAqIEBpbXBsZW1lbnRzIHtTaWduYWxUcmFja2VyRGVmfVxuICovXG5leHBvcnQgY2xhc3MgU2lnbmFsVHJhY2tlciBleHRlbmRzIEV2ZW50VHJhY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FuYWx5dGljcy1yb290LkFuYWx5dGljc1Jvb3R9IHJvb3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3QpIHtcbiAgICBzdXBlcihyb290KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzcG9zZSgpIHt9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhZGQoY29udGV4dCwgZXZlbnRUeXBlLCBjb25maWcsIGxpc3RlbmVyKSB7XG4gICAgbGV0IHRhcmdldDtcbiAgICBsZXQgc2lnbmFsc1Byb21pc2U7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBjb25maWdbJ3NlbGVjdG9yJ10gfHwgJzpyb290JztcbiAgICBpZiAoc2VsZWN0b3IgPT0gJzpyb290JyB8fCBzZWxlY3RvciA9PSAnOmhvc3QnKSB7XG4gICAgICAvLyBSb290IHNlbGVjdG9ycyBhcmUgZGVsZWdhdGVkIHRvIGFuYWx5dGljcyByb290cy5cbiAgICAgIHRhcmdldCA9IHRoaXMucm9vdC5nZXRSb290RWxlbWVudCgpO1xuICAgICAgc2lnbmFsc1Byb21pc2UgPSB0aGlzLmdldFJvb3RTaWduYWwoZXZlbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTG9vayBmb3IgdGhlIEFNUC1lbGVtZW50LiBXYWl0IGZvciBET00gdG8gYmUgZnVsbHkgcGFyc2VkIHRvIGF2b2lkXG4gICAgICAvLyBmYWxzZSBtaXNzZWQgc2VhcmNoZXMuXG4gICAgICBjb25zdCBzZWxlY3Rpb25NZXRob2QgPSBjb25maWdbJ3NlbGVjdGlvbk1ldGhvZCddO1xuICAgICAgc2lnbmFsc1Byb21pc2UgPSB0aGlzLnJvb3RcbiAgICAgICAgLmdldEFtcEVsZW1lbnQoXG4gICAgICAgICAgY29udGV4dC5wYXJlbnRFbGVtZW50IHx8IGNvbnRleHQsXG4gICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgc2VsZWN0aW9uTWV0aG9kXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRTaWduYWwoZXZlbnRUeXBlLCB0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgdGFyZ2V0IGFuZCB0aGUgZXZlbnQgc2lnbmFsLlxuICAgIHNpZ25hbHNQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgbGlzdGVuZXIobmV3IEFuYWx5dGljc0V2ZW50KHRhcmdldCwgZXZlbnRUeXBlKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE5PX1VOTElTVEVOO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290U2lnbmFsKGV2ZW50VHlwZSkge1xuICAgIHJldHVybiB0aGlzLnJvb3Quc2lnbmFscygpLndoZW5TaWduYWwoZXZlbnRUeXBlKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0RWxlbWVudFNpZ25hbChldmVudFR5cGUsIGVsZW1lbnQpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQuc2lnbmFscyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50LnNpZ25hbHMoKS53aGVuU2lnbmFsKGV2ZW50VHlwZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFja3Mgd2hlbiB0aGUgZWxlbWVudHMgaW4gdGhlIGZpcnN0IHZpZXdwb3J0IGhhcyBiZWVuIGxvYWRlZCAtIFwiaW5pLWxvYWRcIi5cbiAqIEBpbXBsZW1lbnRzIHtTaWduYWxUcmFja2VyRGVmfVxuICovXG5leHBvcnQgY2xhc3MgSW5pTG9hZFRyYWNrZXIgZXh0ZW5kcyBFdmVudFRyYWNrZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290KSB7XG4gICAgc3VwZXIocm9vdCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7fVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWRkKGNvbnRleHQsIGV2ZW50VHlwZSwgY29uZmlnLCBsaXN0ZW5lcikge1xuICAgIGxldCB0YXJnZXQ7XG4gICAgbGV0IHByb21pc2U7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBjb25maWdbJ3NlbGVjdG9yJ10gfHwgJzpyb290JztcbiAgICBpZiAoc2VsZWN0b3IgPT0gJzpyb290JyB8fCBzZWxlY3RvciA9PSAnOmhvc3QnKSB7XG4gICAgICAvLyBSb290IHNlbGVjdG9ycyBhcmUgZGVsZWdhdGVkIHRvIGFuYWx5dGljcyByb290cy5cbiAgICAgIHRhcmdldCA9IHRoaXMucm9vdC5nZXRSb290RWxlbWVudCgpO1xuICAgICAgcHJvbWlzZSA9IHRoaXMuZ2V0Um9vdFNpZ25hbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbiBBTVAtZWxlbWVudC4gV2FpdCBmb3IgRE9NIHRvIGJlIGZ1bGx5IHBhcnNlZCB0byBhdm9pZFxuICAgICAgLy8gZmFsc2UgbWlzc2VkIHNlYXJjaGVzLlxuICAgICAgY29uc3Qgc2VsZWN0aW9uTWV0aG9kID0gY29uZmlnWydzZWxlY3Rpb25NZXRob2QnXTtcbiAgICAgIHByb21pc2UgPSB0aGlzLnJvb3RcbiAgICAgICAgLmdldEFtcEVsZW1lbnQoXG4gICAgICAgICAgY29udGV4dC5wYXJlbnRFbGVtZW50IHx8IGNvbnRleHQsXG4gICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgc2VsZWN0aW9uTWV0aG9kXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRTaWduYWwoJ2luaS1sb2FkJywgdGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFdhaXQgZm9yIHRoZSB0YXJnZXQgYW5kIHRoZSBldmVudC5cbiAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgbGlzdGVuZXIobmV3IEFuYWx5dGljc0V2ZW50KHRhcmdldCwgZXZlbnRUeXBlKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE5PX1VOTElTVEVOO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290U2lnbmFsKCkge1xuICAgIHJldHVybiB0aGlzLnJvb3Qud2hlbkluaUxvYWRlZCgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRFbGVtZW50U2lnbmFsKHVudXNlZEV2ZW50VHlwZSwgZWxlbWVudCkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudC5zaWduYWxzICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3Qgc2lnbmFscyA9IGVsZW1lbnQuc2lnbmFscygpO1xuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW1xuICAgICAgc2lnbmFscy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuSU5JX0xPQUQpLFxuICAgICAgc2lnbmFscy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpLFxuICAgIF0pO1xuICB9XG59XG5cbi8qKlxuICogVGltZXIgZXZlbnQgaGFuZGxlci5cbiAqL1xuY2xhc3MgVGltZXJFdmVudEhhbmRsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtKc29uT2JqZWN0fSB0aW1lclNwZWMgVGhlIHRpbWVyIHNwZWNpZmljYXRpb24uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTogVW5saXN0ZW5EZWY9fSBvcHRfc3RhcnRCdWlsZGVyIEZhY3RvcnkgZm9yIGJ1aWxkaW5nXG4gICAqICAgICBzdGFydCB0cmFja2VycyBmb3IgdGhpcyB0aW1lci5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiBVbmxpc3RlbkRlZj19IG9wdF9zdG9wQnVpbGRlciBGYWN0b3J5IGZvciBidWlsZGluZyBzdG9wXG4gICAqICAgICB0cmFja2VycyBmb3IgdGhpcyB0aW1lci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRpbWVyU3BlYywgb3B0X3N0YXJ0QnVpbGRlciwgb3B0X3N0b3BCdWlsZGVyKSB7XG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuaW50ZXJ2YWxJZF8gPSB1bmRlZmluZWQ7XG5cbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgJ2ludGVydmFsJyBpbiB0aW1lclNwZWMsXG4gICAgICAnVGltZXIgaW50ZXJ2YWwgc3BlY2lmaWNhdGlvbiByZXF1aXJlZCdcbiAgICApO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbiAgICB0aGlzLmludGVydmFsTGVuZ3RoXyA9IE51bWJlcih0aW1lclNwZWNbJ2ludGVydmFsJ10pIHx8IDA7XG4gICAgdXNlckFzc2VydChcbiAgICAgIHRoaXMuaW50ZXJ2YWxMZW5ndGhfID49IE1JTl9USU1FUl9JTlRFUlZBTF9TRUNPTkRTLFxuICAgICAgJ0JhZCB0aW1lciBpbnRlcnZhbCBzcGVjaWZpY2F0aW9uJ1xuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG4gICAgdGhpcy5tYXhUaW1lckxlbmd0aF8gPVxuICAgICAgJ21heFRpbWVyTGVuZ3RoJyBpbiB0aW1lclNwZWNcbiAgICAgICAgPyBOdW1iZXIodGltZXJTcGVjWydtYXhUaW1lckxlbmd0aCddKVxuICAgICAgICA6IERFRkFVTFRfTUFYX1RJTUVSX0xFTkdUSF9TRUNPTkRTO1xuICAgIHVzZXJBc3NlcnQodGhpcy5tYXhUaW1lckxlbmd0aF8gPiAwLCAnQmFkIG1heFRpbWVyTGVuZ3RoIHNwZWNpZmljYXRpb24nKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5tYXhUaW1lckluU3BlY18gPSAnbWF4VGltZXJMZW5ndGgnIGluIHRpbWVyU3BlYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5jYWxsSW1tZWRpYXRlXyA9XG4gICAgICAnaW1tZWRpYXRlJyBpbiB0aW1lclNwZWMgPyBCb29sZWFuKHRpbWVyU3BlY1snaW1tZWRpYXRlJ10pIDogdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCl9ICovXG4gICAgdGhpcy5pbnRlcnZhbENhbGxiYWNrXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9Vbmxpc3RlbkRlZn0gKi9cbiAgICB0aGlzLnVubGlzdGVuU3RhcnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1VubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMudW5saXN0ZW5TdG9wXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHs/ZnVuY3Rpb24oKTogVW5saXN0ZW5EZWZ9ICovXG4gICAgdGhpcy5zdGFydEJ1aWxkZXJfID0gb3B0X3N0YXJ0QnVpbGRlciB8fCBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7P2Z1bmN0aW9uKCk6IFVubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMuc3RvcEJ1aWxkZXJfID0gb3B0X3N0b3BCdWlsZGVyIHx8IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcnx1bmRlZmluZWR9ICovXG4gICAgdGhpcy5zdGFydFRpbWVfID0gdW5kZWZpbmVkOyAvLyBtaWxsaXNlY29uZHNcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmxhc3RSZXF1ZXN0VGltZV8gPSB1bmRlZmluZWQ7IC8vIG1pbGxpc2Vjb25kc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gc3RhcnRUaW1lclxuICAgKi9cbiAgaW5pdChzdGFydFRpbWVyKSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0QnVpbGRlcl8pIHtcbiAgICAgIC8vIFRpbWVyIHN0YXJ0cyBvbiBsb2FkLlxuICAgICAgc3RhcnRUaW1lcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaW1lciBzdGFydHMgb24gZXZlbnQuXG4gICAgICB0aGlzLmxpc3RlbkZvclN0YXJ0XygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbmxpc3RlbnMgZm9yIHN0YXJ0IGFuZCBzdG9wLlxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnVubGlzdGVuRm9yU3RvcF8oKTtcbiAgICB0aGlzLnVubGlzdGVuRm9yU3RhcnRfKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgbGlzdGVuRm9yU3RhcnRfKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0QnVpbGRlcl8pIHtcbiAgICAgIHRoaXMudW5saXN0ZW5TdGFydF8gPSB0aGlzLnN0YXJ0QnVpbGRlcl8oKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgdW5saXN0ZW5Gb3JTdGFydF8oKSB7XG4gICAgaWYgKHRoaXMudW5saXN0ZW5TdGFydF8pIHtcbiAgICAgIHRoaXMudW5saXN0ZW5TdGFydF8oKTtcbiAgICAgIHRoaXMudW5saXN0ZW5TdGFydF8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBsaXN0ZW5Gb3JTdG9wXygpIHtcbiAgICBpZiAodGhpcy5zdG9wQnVpbGRlcl8pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMudW5saXN0ZW5TdG9wXyA9IHRoaXMuc3RvcEJ1aWxkZXJfKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZGlzcG9zZSgpOyAvLyBTdG9wIHRpbWVyIGFuZCB0aGVuIHRocm93IGVycm9yLlxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICB1bmxpc3RlbkZvclN0b3BfKCkge1xuICAgIGlmICh0aGlzLnVubGlzdGVuU3RvcF8pIHtcbiAgICAgIHRoaXMudW5saXN0ZW5TdG9wXygpO1xuICAgICAgdGhpcy51bmxpc3RlblN0b3BfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgaXNSdW5uaW5nKCkge1xuICAgIHJldHVybiAhIXRoaXMuaW50ZXJ2YWxJZF87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSB0aW1lckNhbGxiYWNrXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdGltZW91dENhbGxiYWNrXG4gICAqL1xuICBzdGFydEludGVydmFsSW5XaW5kb3cod2luLCB0aW1lckNhbGxiYWNrLCB0aW1lb3V0Q2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnN0YXJ0VGltZV8gPSBEYXRlLm5vdygpO1xuICAgIHRoaXMubGFzdFJlcXVlc3RUaW1lXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmludGVydmFsQ2FsbGJhY2tfID0gdGltZXJDYWxsYmFjaztcbiAgICB0aGlzLmludGVydmFsSWRfID0gd2luLnNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRpbWVyQ2FsbGJhY2soKTtcbiAgICB9LCB0aGlzLmludGVydmFsTGVuZ3RoXyAqIDEwMDApO1xuXG4gICAgLy8gSWYgdGhlcmUncyBubyB3YXkgdG8gdHVybiBvZmYgdGhlIHRpbWVyLCBjYXAgaXQuXG4gICAgaWYgKCF0aGlzLnN0b3BCdWlsZGVyXyB8fCAodGhpcy5zdG9wQnVpbGRlcl8gJiYgdGhpcy5tYXhUaW1lckluU3BlY18pKSB7XG4gICAgICB3aW4uc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRpbWVvdXRDYWxsYmFjaygpO1xuICAgICAgfSwgdGhpcy5tYXhUaW1lckxlbmd0aF8gKiAxMDAwKTtcbiAgICB9XG5cbiAgICB0aGlzLnVubGlzdGVuRm9yU3RhcnRfKCk7XG4gICAgaWYgKHRoaXMuY2FsbEltbWVkaWF0ZV8pIHtcbiAgICAgIHRpbWVyQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5Gb3JTdG9wXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBzdG9wVGltZXJfKHdpbikge1xuICAgIGlmICghdGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmludGVydmFsQ2FsbGJhY2tfKCk7XG4gICAgdGhpcy5pbnRlcnZhbENhbGxiYWNrXyA9IG51bGw7XG4gICAgd2luLmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkXyk7XG4gICAgdGhpcy5pbnRlcnZhbElkXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmxhc3RSZXF1ZXN0VGltZV8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy51bmxpc3RlbkZvclN0b3BfKCk7XG4gICAgdGhpcy5saXN0ZW5Gb3JTdGFydF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBjYWxjdWxhdGVEdXJhdGlvbl8oKSB7XG4gICAgaWYgKHRoaXMuc3RhcnRUaW1lXykge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSAodGhpcy5sYXN0UmVxdWVzdFRpbWVfIHx8IHRoaXMuc3RhcnRUaW1lXyk7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqIEByZXR1cm4geyFKc29uT2JqZWN0fSAqL1xuICBnZXRUaW1lclZhcnMoKSB7XG4gICAgbGV0IHRpbWVyRHVyYXRpb24gPSAwO1xuICAgIGlmICh0aGlzLmlzUnVubmluZygpKSB7XG4gICAgICB0aW1lckR1cmF0aW9uID0gdGhpcy5jYWxjdWxhdGVEdXJhdGlvbl8oKTtcbiAgICAgIHRoaXMubGFzdFJlcXVlc3RUaW1lXyA9IERhdGUubm93KCk7XG4gICAgfVxuICAgIHJldHVybiBkaWN0KHtcbiAgICAgICd0aW1lckR1cmF0aW9uJzogdGltZXJEdXJhdGlvbixcbiAgICAgICd0aW1lclN0YXJ0JzogdGhpcy5zdGFydFRpbWVfIHx8IDAsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFja3MgdGltZXIgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGltZXJFdmVudFRyYWNrZXIgZXh0ZW5kcyBFdmVudFRyYWNrZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbmFseXRpY3Mtcm9vdC5BbmFseXRpY3NSb290fSByb290XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290KSB7XG4gICAgc3VwZXIocm9vdCk7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU9iamVjdDxudW1iZXIsIFRpbWVyRXZlbnRIYW5kbGVyPn0gKi9cbiAgICB0aGlzLnRyYWNrZXJzXyA9IHt9O1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy50aW1lcklkU2VxdWVuY2VfID0gMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshQXJyYXk8bnVtYmVyPn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBnZXRUcmFja2VkVGltZXJLZXlzKCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFBcnJheTxudW1iZXI+fSAqLyAoT2JqZWN0LmtleXModGhpcy50cmFja2Vyc18pKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmdldFRyYWNrZWRUaW1lcktleXMoKS5mb3JFYWNoKCh0aW1lcklkKSA9PiB7XG4gICAgICB0aGlzLnJlbW92ZVRyYWNrZXJfKHRpbWVySWQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhZGQoY29udGV4dCwgZXZlbnRUeXBlLCBjb25maWcsIGxpc3RlbmVyKSB7XG4gICAgY29uc3QgdGltZXJTcGVjID0gY29uZmlnWyd0aW1lclNwZWMnXTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgdGltZXJTcGVjICYmIHR5cGVvZiB0aW1lclNwZWMgPT0gJ29iamVjdCcsXG4gICAgICAnQmFkIHRpbWVyIHNwZWNpZmljYXRpb24nXG4gICAgKTtcbiAgICBjb25zdCB0aW1lclN0YXJ0ID0gJ3N0YXJ0U3BlYycgaW4gdGltZXJTcGVjID8gdGltZXJTcGVjWydzdGFydFNwZWMnXSA6IG51bGw7XG4gICAgdXNlckFzc2VydChcbiAgICAgICF0aW1lclN0YXJ0IHx8IHR5cGVvZiB0aW1lclN0YXJ0ID09ICdvYmplY3QnLFxuICAgICAgJ0JhZCB0aW1lciBzdGFydCBzcGVjaWZpY2F0aW9uJ1xuICAgICk7XG4gICAgY29uc3QgdGltZXJTdG9wID0gJ3N0b3BTcGVjJyBpbiB0aW1lclNwZWMgPyB0aW1lclNwZWNbJ3N0b3BTcGVjJ10gOiBudWxsO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICAoIXRpbWVyU3RhcnQgJiYgIXRpbWVyU3RvcCkgfHwgdHlwZW9mIHRpbWVyU3RvcCA9PSAnb2JqZWN0JyxcbiAgICAgICdCYWQgdGltZXIgc3RvcCBzcGVjaWZpY2F0aW9uJ1xuICAgICk7XG5cbiAgICBjb25zdCB0aW1lcklkID0gdGhpcy5nZW5lcmF0ZVRpbWVySWRfKCk7XG4gICAgbGV0IHN0YXJ0QnVpbGRlcjtcbiAgICBsZXQgc3RvcEJ1aWxkZXI7XG4gICAgaWYgKHRpbWVyU3RhcnQpIHtcbiAgICAgIGNvbnN0IHN0YXJ0VHJhY2tlciA9IHRoaXMuZ2V0VHJhY2tlcl8odGltZXJTdGFydCk7XG4gICAgICB1c2VyQXNzZXJ0KHN0YXJ0VHJhY2tlciwgJ0Nhbm5vdCB0cmFjayB0aW1lciBzdGFydCcpO1xuICAgICAgc3RhcnRCdWlsZGVyID0gc3RhcnRUcmFja2VyLmFkZC5iaW5kKFxuICAgICAgICBzdGFydFRyYWNrZXIsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIHRpbWVyU3RhcnRbJ29uJ10sXG4gICAgICAgIHRpbWVyU3RhcnQsXG4gICAgICAgIHRoaXMuaGFuZGxlVGltZXJUb2dnbGVfLmJpbmQodGhpcywgdGltZXJJZCwgZXZlbnRUeXBlLCBsaXN0ZW5lcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aW1lclN0b3ApIHtcbiAgICAgIGNvbnN0IHN0b3BUcmFja2VyID0gdGhpcy5nZXRUcmFja2VyXyh0aW1lclN0b3ApO1xuICAgICAgdXNlckFzc2VydChzdG9wVHJhY2tlciwgJ0Nhbm5vdCB0cmFjayB0aW1lciBzdG9wJyk7XG4gICAgICBzdG9wQnVpbGRlciA9IHN0b3BUcmFja2VyLmFkZC5iaW5kKFxuICAgICAgICBzdG9wVHJhY2tlcixcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgdGltZXJTdG9wWydvbiddLFxuICAgICAgICB0aW1lclN0b3AsXG4gICAgICAgIHRoaXMuaGFuZGxlVGltZXJUb2dnbGVfLmJpbmQodGhpcywgdGltZXJJZCwgZXZlbnRUeXBlLCBsaXN0ZW5lcilcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdGltZXJIYW5kbGVyID0gbmV3IFRpbWVyRXZlbnRIYW5kbGVyKFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHRpbWVyU3BlYyksXG4gICAgICBzdGFydEJ1aWxkZXIsXG4gICAgICBzdG9wQnVpbGRlclxuICAgICk7XG4gICAgdGhpcy50cmFja2Vyc19bdGltZXJJZF0gPSB0aW1lckhhbmRsZXI7XG5cbiAgICB0aW1lckhhbmRsZXIuaW5pdChcbiAgICAgIHRoaXMuc3RhcnRUaW1lcl8uYmluZCh0aGlzLCB0aW1lcklkLCBldmVudFR5cGUsIGxpc3RlbmVyKVxuICAgICk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlVHJhY2tlcl8odGltZXJJZCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZW5lcmF0ZVRpbWVySWRfKCkge1xuICAgIHJldHVybiArK3RoaXMudGltZXJJZFNlcXVlbmNlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHJldHVybiB7P0V2ZW50VHJhY2tlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFRyYWNrZXJfKGNvbmZpZykge1xuICAgIGNvbnN0IGV2ZW50VHlwZSA9IHVzZXIoKS5hc3NlcnRTdHJpbmcoY29uZmlnWydvbiddKTtcbiAgICBjb25zdCB0cmFja2VyS2V5ID0gZ2V0VHJhY2tlcktleU5hbWUoZXZlbnRUeXBlKTtcblxuICAgIHJldHVybiB0aGlzLnJvb3QuZ2V0VHJhY2tlckZvckFsbG93bGlzdChcbiAgICAgIHRyYWNrZXJLZXksXG4gICAgICBnZXRUcmFja2VyVHlwZXNGb3JQYXJlbnRUeXBlKCd0aW1lcicpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHdoaWNoIGxpc3RlbmVycyBhcmUgYWN0aXZlIGRlcGVuZGluZyBvbiB0aW1lciBzdGF0ZSwgc28gbm8gcmFjZVxuICAgKiBjb25kaXRpb25zIGNhbiBvY2N1ciBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgdGltZXIgc3RhcnRzIGFuZCBzdG9wcyBvbiB0aGVcbiAgICogc2FtZSBldmVudCB0eXBlIGZyb20gdGhlIHNhbWUgdGFyZ2V0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXJJZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUFuYWx5dGljc0V2ZW50KX0gbGlzdGVuZXJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZVRpbWVyVG9nZ2xlXyh0aW1lcklkLCBldmVudFR5cGUsIGxpc3RlbmVyKSB7XG4gICAgY29uc3QgdGltZXJIYW5kbGVyID0gdGhpcy50cmFja2Vyc19bdGltZXJJZF07XG4gICAgaWYgKCF0aW1lckhhbmRsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRpbWVySGFuZGxlci5pc1J1bm5pbmcoKSkge1xuICAgICAgdGhpcy5zdG9wVGltZXJfKHRpbWVySWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZXJfKHRpbWVySWQsIGV2ZW50VHlwZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXJJZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUFuYWx5dGljc0V2ZW50KX0gbGlzdGVuZXJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0VGltZXJfKHRpbWVySWQsIGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgICBjb25zdCB0aW1lckhhbmRsZXIgPSB0aGlzLnRyYWNrZXJzX1t0aW1lcklkXTtcbiAgICBjb25zdCB0aW1lckNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgbGlzdGVuZXIodGhpcy5jcmVhdGVFdmVudF8odGltZXJJZCwgZXZlbnRUeXBlKSk7XG4gICAgfTtcbiAgICB0aW1lckhhbmRsZXIuc3RhcnRJbnRlcnZhbEluV2luZG93KFxuICAgICAgdGhpcy5yb290LmFtcGRvYy53aW4sXG4gICAgICB0aW1lckNhbGxiYWNrLFxuICAgICAgdGhpcy5yZW1vdmVUcmFja2VyXy5iaW5kKHRoaXMsIHRpbWVySWQpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXJJZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RvcFRpbWVyXyh0aW1lcklkKSB7XG4gICAgdGhpcy50cmFja2Vyc19bdGltZXJJZF0uc3RvcFRpbWVyXyh0aGlzLnJvb3QuYW1wZG9jLndpbik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVySWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcmV0dXJuIHshQW5hbHl0aWNzRXZlbnR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVFdmVudF8odGltZXJJZCwgZXZlbnRUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBBbmFseXRpY3NFdmVudChcbiAgICAgIHRoaXMucm9vdC5nZXRSb290RWxlbWVudCgpLFxuICAgICAgZXZlbnRUeXBlLFxuICAgICAgdGhpcy50cmFja2Vyc19bdGltZXJJZF0uZ2V0VGltZXJWYXJzKCksXG4gICAgICAvKiogZW5hYmxlRGF0YVZhcnMgKi8gZmFsc2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lcklkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVUcmFja2VyXyh0aW1lcklkKSB7XG4gICAgaWYgKHRoaXMudHJhY2tlcnNfW3RpbWVySWRdKSB7XG4gICAgICB0aGlzLnN0b3BUaW1lcl8odGltZXJJZCk7XG4gICAgICB0aGlzLnRyYWNrZXJzX1t0aW1lcklkXS5kaXNwb3NlKCk7XG4gICAgICBkZWxldGUgdGhpcy50cmFja2Vyc19bdGltZXJJZF07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVHJhY2tzIHZpZGVvIHNlc3Npb24gZXZlbnRzXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWRlb0V2ZW50VHJhY2tlciBleHRlbmRzIEV2ZW50VHJhY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FuYWx5dGljcy1yb290LkFuYWx5dGljc1Jvb3R9IHJvb3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3QpIHtcbiAgICBzdXBlcihyb290KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P09ic2VydmFibGU8IUV2ZW50Pn0gKi9cbiAgICB0aGlzLnNlc3Npb25PYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbighRXZlbnQpfSAqL1xuICAgIHRoaXMuYm91bmRPblNlc3Npb25fID0gdGhpcy5zZXNzaW9uT2JzZXJ2YWJsZV8uZmlyZS5iaW5kKFxuICAgICAgdGhpcy5zZXNzaW9uT2JzZXJ2YWJsZV9cbiAgICApO1xuXG4gICAgT2JqZWN0LmtleXMoVmlkZW9BbmFseXRpY3NFdmVudHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgdGhpcy5yb290XG4gICAgICAgIC5nZXRSb290KClcbiAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoVmlkZW9BbmFseXRpY3NFdmVudHNba2V5XSwgdGhpcy5ib3VuZE9uU2Vzc2lvbl8pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIGNvbnN0IHJvb3QgPSB0aGlzLnJvb3QuZ2V0Um9vdCgpO1xuICAgIE9iamVjdC5rZXlzKFZpZGVvQW5hbHl0aWNzRXZlbnRzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihWaWRlb0FuYWx5dGljc0V2ZW50c1trZXldLCB0aGlzLmJvdW5kT25TZXNzaW9uXyk7XG4gICAgfSk7XG4gICAgdGhpcy5ib3VuZE9uU2Vzc2lvbl8gPSBudWxsO1xuICAgIHRoaXMuc2Vzc2lvbk9ic2VydmFibGVfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWRkKGNvbnRleHQsIGV2ZW50VHlwZSwgY29uZmlnLCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IHZpZGVvU3BlYyA9IGNvbmZpZ1sndmlkZW9TcGVjJ10gfHwge307XG4gICAgY29uc3Qgc2VsZWN0b3IgPSB1c2VyQXNzZXJ0KFxuICAgICAgY29uZmlnWydzZWxlY3RvciddIHx8IHZpZGVvU3BlY1snc2VsZWN0b3InXSxcbiAgICAgICdNaXNzaW5nIHJlcXVpcmVkIHNlbGVjdG9yIG9uIHZpZGVvIHRyaWdnZXInXG4gICAgKTtcblxuICAgIHVzZXJBc3NlcnQoc2VsZWN0b3IubGVuZ3RoLCAnTWlzc2luZyByZXF1aXJlZCBzZWxlY3RvciBvbiB2aWRlbyB0cmlnZ2VyJyk7XG4gICAgYXNzZXJ0VW5pcXVlU2VsZWN0b3JzKHNlbGVjdG9yKTtcbiAgICBjb25zdCBzZWxlY3Rpb25NZXRob2QgPSBjb25maWdbJ3NlbGVjdGlvbk1ldGhvZCddIHx8IG51bGw7XG4gICAgY29uc3QgdGFyZ2V0UHJvbWlzZXMgPSB0aGlzLnJvb3QuZ2V0RWxlbWVudHMoXG4gICAgICBjb250ZXh0LFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBzZWxlY3Rpb25NZXRob2QsXG4gICAgICBmYWxzZVxuICAgICk7XG5cbiAgICBjb25zdCBlbmRTZXNzaW9uV2hlbkludmlzaWJsZSA9IHZpZGVvU3BlY1snZW5kLXNlc3Npb24td2hlbi1pbnZpc2libGUnXTtcbiAgICBjb25zdCBleGNsdWRlQXV0b3BsYXkgPSB2aWRlb1NwZWNbJ2V4Y2x1ZGUtYXV0b3BsYXknXTtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHZpZGVvU3BlY1snaW50ZXJ2YWwnXTtcbiAgICBjb25zdCBwZXJjZW50YWdlcyA9IHZpZGVvU3BlY1sncGVyY2VudGFnZXMnXTtcbiAgICBjb25zdCBvbiA9IGNvbmZpZ1snb24nXTtcblxuICAgIGNvbnN0IHBlcmNlbnRhZ2VJbnRlcnZhbCA9IDU7XG5cbiAgICBsZXQgaW50ZXJ2YWxDb3VudGVyID0gMDtcbiAgICBsZXQgbGFzdFBlcmNlbnRhZ2UgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbk9ic2VydmFibGVfLmFkZCgoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHt0eXBlfSA9IGV2ZW50O1xuICAgICAgY29uc3QgZGV0YWlscyA9IC8qKiBAdHlwZSB7P0pzb25PYmplY3R8dW5kZWZpbmVkfSAqLyAoZ2V0RGF0YShldmVudCkpO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFR5cGUgPSBub3JtYWxpemVWaWRlb0V2ZW50VHlwZSh0eXBlLCBkZXRhaWxzKTtcblxuICAgICAgaWYgKG5vcm1hbGl6ZWRUeXBlICE9PSBvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChub3JtYWxpemVkVHlwZSA9PT0gVmlkZW9BbmFseXRpY3NFdmVudHMuU0VDT05EU19QTEFZRUQgJiYgIWludGVydmFsKSB7XG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ3ZpZGVvLXNlY29uZHMtcGxheWVkIHJlcXVpcmVzIGludGVydmFsIHNwZWMgd2l0aCBub24temVybyB2YWx1ZSdcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobm9ybWFsaXplZFR5cGUgPT09IFZpZGVvQW5hbHl0aWNzRXZlbnRzLlNFQ09ORFNfUExBWUVEKSB7XG4gICAgICAgIGludGVydmFsQ291bnRlcisrO1xuICAgICAgICBpZiAoaW50ZXJ2YWxDb3VudGVyICUgaW50ZXJ2YWwgIT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG5vcm1hbGl6ZWRUeXBlID09PSBWaWRlb0FuYWx5dGljc0V2ZW50cy5QRVJDRU5UQUdFX1BMQVlFRCkge1xuICAgICAgICBpZiAoIXBlcmNlbnRhZ2VzKSB7XG4gICAgICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgJ3ZpZGVvLXBlcmNlbnRhZ2UtcGxheWVkIHJlcXVpcmVzIHBlcmNlbnRhZ2VzIHNwZWMuJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwZXJjZW50YWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBwZXJjZW50YWdlc1tpXTtcblxuICAgICAgICAgIGlmIChwZXJjZW50YWdlIDw9IDAgfHwgcGVyY2VudGFnZSAlIHBlcmNlbnRhZ2VJbnRlcnZhbCAhPSAwKSB7XG4gICAgICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICAgJ1BlcmNlbnRhZ2VzIG11c3QgYmUgc2V0IGluIGluY3JlbWVudHMgb2YgJXMgd2l0aCBub24temVybyAnICtcbiAgICAgICAgICAgICAgICAndmFsdWVzJyxcbiAgICAgICAgICAgICAgcGVyY2VudGFnZUludGVydmFsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBlcmNlbnRhZ2UgPSBkZXRhaWxzWydub3JtYWxpemVkUGVyY2VudGFnZSddO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkUGVyY2VudGFnZUludCA9IHBhcnNlSW50KG5vcm1hbGl6ZWRQZXJjZW50YWdlLCAxMCk7XG5cbiAgICAgICAgZGV2QXNzZXJ0KGlzRmluaXRlTnVtYmVyKG5vcm1hbGl6ZWRQZXJjZW50YWdlSW50KSk7XG4gICAgICAgIGRldkFzc2VydChub3JtYWxpemVkUGVyY2VudGFnZUludCAlIHBlcmNlbnRhZ2VJbnRlcnZhbCA9PSAwKTtcblxuICAgICAgICAvLyBEb24ndCB0cmlnZ2VyIGlmIGN1cnJlbnQgcGVyY2VudGFnZSBpcyB0aGUgc2FtZSBhc1xuICAgICAgICAvLyBsYXN0IHRyaWdnZXJlZCBwZXJjZW50YWdlXG4gICAgICAgIGlmIChcbiAgICAgICAgICBsYXN0UGVyY2VudGFnZSA9PSBub3JtYWxpemVkUGVyY2VudGFnZUludCAmJlxuICAgICAgICAgIHBlcmNlbnRhZ2VzLmxlbmd0aCA+IDFcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBlcmNlbnRhZ2VzLmluZGV4T2Yobm9ybWFsaXplZFBlcmNlbnRhZ2VJbnQpIDwgMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RQZXJjZW50YWdlID0gbm9ybWFsaXplZFBlcmNlbnRhZ2VJbnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdHlwZSA9PT0gVmlkZW9BbmFseXRpY3NFdmVudHMuU0VTU0lPTl9WSVNJQkxFICYmXG4gICAgICAgICFlbmRTZXNzaW9uV2hlbkludmlzaWJsZVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4Y2x1ZGVBdXRvcGxheSAmJiBkZXRhaWxzWydzdGF0ZSddID09PSBQbGF5aW5nU3RhdGVzLlBMQVlJTkdfQVVUTykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAnTm8gdGFyZ2V0IHNwZWNpZmllZCBieSB2aWRlbyBzZXNzaW9uIGV2ZW50LidcbiAgICAgICk7XG5cbiAgICAgIHRhcmdldFByb21pc2VzLnRoZW4oKHRhcmdldHMpID0+IHtcbiAgICAgICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQpID0+IHtcbiAgICAgICAgICBpZiAoIXRhcmdldC5jb250YWlucyhlbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZERldGFpbHMgPSByZW1vdmVJbnRlcm5hbFZhcnMoZGV0YWlscyk7XG4gICAgICAgICAgbGlzdGVuZXIoXG4gICAgICAgICAgICBuZXcgQW5hbHl0aWNzRXZlbnQodGFyZ2V0LCBub3JtYWxpemVkVHlwZSwgbm9ybWFsaXplZERldGFpbHMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB2aWRlbyB0eXBlIGZyb20gaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gaW50byB0aGUgb2JzZXJ2ZWQgc3RyaW5nXG4gKiBmcm9tIHRoZSBhbmFseXRpY3MgY29uZmlndXJhdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0gez9Kc29uT2JqZWN0fHVuZGVmaW5lZH0gZGV0YWlsc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVWaWRlb0V2ZW50VHlwZSh0eXBlLCBkZXRhaWxzKSB7XG4gIGlmICh0eXBlID09IFZpZGVvQW5hbHl0aWNzRXZlbnRzLlNFU1NJT05fVklTSUJMRSkge1xuICAgIHJldHVybiBWaWRlb0FuYWx5dGljc0V2ZW50cy5TRVNTSU9OO1xuICB9XG5cbiAgLy8gQ3VzdG9tIHZpZGVvIGFuYWx5dGljcyBldmVudHMgYXJlIGxpc3RlbmVkIHRvIGZyb20gb25lIHNpZ25hbCB0eXBlLFxuICAvLyBidXQgdGhleSdyZSBjb25maWd1cmVkIGJ5IHVzZXIgd2l0aCB0aGVpciBjdXN0b20gbmFtZS5cbiAgaWYgKHR5cGUgPT0gVmlkZW9BbmFseXRpY3NFdmVudHMuQ1VTVE9NKSB7XG4gICAgcmV0dXJuIGRldigpLmFzc2VydFN0cmluZyhkZXRhaWxzW3ZpZGVvQW5hbHl0aWNzQ3VzdG9tRXZlbnRUeXBlS2V5XSk7XG4gIH1cblxuICByZXR1cm4gdHlwZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gez9Kc29uT2JqZWN0fHVuZGVmaW5lZH0gZGV0YWlsc1xuICogQHJldHVybiB7IUpzb25PYmplY3R8dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiByZW1vdmVJbnRlcm5hbFZhcnMoZGV0YWlscykge1xuICBpZiAoIWRldGFpbHMpIHtcbiAgICByZXR1cm4gZGljdCgpO1xuICB9XG4gIGNvbnN0IGNsZWFuID0gey4uLmRldGFpbHN9O1xuICBkZWxldGUgY2xlYW5bdmlkZW9BbmFseXRpY3NDdXN0b21FdmVudFR5cGVLZXldO1xuICByZXR1cm4gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKGNsZWFuKTtcbn1cblxuLyoqXG4gKiBUcmFja3MgdmlzaWJpbGl0eSBldmVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5VHJhY2tlciBleHRlbmRzIEV2ZW50VHJhY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FuYWx5dGljcy1yb290LkFuYWx5dGljc1Jvb3R9IHJvb3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3QpIHtcbiAgICBzdXBlcihyb290KTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMud2FpdEZvclRyYWNrZXJzXyA9IHt9O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge31cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFkZChjb250ZXh0LCBldmVudFR5cGUsIGNvbmZpZywgbGlzdGVuZXIpIHtcbiAgICBjb25zdCB2aXNpYmlsaXR5U3BlYyA9IGNvbmZpZ1sndmlzaWJpbGl0eVNwZWMnXSB8fCB7fTtcbiAgICBjb25zdCBzZWxlY3RvciA9IGNvbmZpZ1snc2VsZWN0b3InXSB8fCB2aXNpYmlsaXR5U3BlY1snc2VsZWN0b3InXTtcbiAgICBjb25zdCB3YWl0Rm9yU3BlYyA9IHZpc2liaWxpdHlTcGVjWyd3YWl0Rm9yJ107XG4gICAgbGV0IHJlcG9ydFdoZW5TcGVjID0gdmlzaWJpbGl0eVNwZWNbJ3JlcG9ydFdoZW4nXTtcbiAgICBsZXQgY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlRnVuYyA9IG51bGw7XG4gICAgaWYgKHJlcG9ydFdoZW5TcGVjKSB7XG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAhdmlzaWJpbGl0eVNwZWNbJ3JlcGVhdCddLFxuICAgICAgICAncmVwb3J0V2hlbiBhbmQgcmVwZWF0IGFyZSBtdXR1YWxseSBleGNsdXNpdmUuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnRUeXBlID09PSBBbmFseXRpY3NFdmVudFR5cGUuSElEREVOKSB7XG4gICAgICBpZiAocmVwb3J0V2hlblNwZWMpIHtcbiAgICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICAgIFRBRyxcbiAgICAgICAgICAnUmVwb3J0V2hlbiBzaG91bGQgbm90IGJlIGRlZmluZWQgd2hlbiBldmVudFR5cGUgaXMgXCJoaWRkZW5cIidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vIHNwZWNpYWwgcG9seWZpbGwgZm9yIGV2ZW50VHlwZTogJ2hpZGRlbidcbiAgICAgIHJlcG9ydFdoZW5TcGVjID0gJ2RvY3VtZW50SGlkZGVuJztcbiAgICB9XG5cbiAgICBjb25zdCB2aXNpYmlsaXR5TWFuYWdlciA9IHRoaXMucm9vdC5nZXRWaXNpYmlsaXR5TWFuYWdlcigpO1xuXG4gICAgaWYgKHJlcG9ydFdoZW5TcGVjID09ICdkb2N1bWVudEhpZGRlbicpIHtcbiAgICAgIGNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZ1bmMgPVxuICAgICAgICB0aGlzLmNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZvckRvY3VtZW50SGlkZGVuXy5iaW5kKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAocmVwb3J0V2hlblNwZWMgPT0gJ2RvY3VtZW50RXhpdCcpIHtcbiAgICAgIGNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZ1bmMgPVxuICAgICAgICB0aGlzLmNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZvckRvY3VtZW50RXhpdF8uYmluZCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgIXJlcG9ydFdoZW5TcGVjLFxuICAgICAgICAncmVwb3J0V2hlbiB2YWx1ZSBcIiVzXCIgbm90IHN1cHBvcnRlZC4nLFxuICAgICAgICByZXBvcnRXaGVuU3BlY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSb290IHNlbGVjdG9ycyBhcmUgZGVsZWdhdGVkIHRvIGFuYWx5dGljcyByb290cy5cbiAgICBpZiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yID09ICc6cm9vdCcgfHwgc2VsZWN0b3IgPT0gJzpob3N0Jykge1xuICAgICAgLy8gV2hlbiBgc2VsZWN0b3JgIGlzIHNwZWNpZmllZCwgd2UgYWx3YXlzIHVzZSBcImluaS1sb2FkXCIgc2lnbmFsIGFzXG4gICAgICAvLyBhIFwicmVhZHlcIiBzaWduYWwuXG4gICAgICBjb25zdCByZWFkeVByb21pc2VXYWl0Rm9yU3BlYyA9XG4gICAgICAgIHdhaXRGb3JTcGVjIHx8IChzZWxlY3RvciA/ICdpbmktbG9hZCcgOiAnbm9uZScpO1xuICAgICAgcmV0dXJuIHZpc2liaWxpdHlNYW5hZ2VyLmxpc3RlblJvb3QoXG4gICAgICAgIHZpc2liaWxpdHlTcGVjLFxuICAgICAgICB0aGlzLmdldFJlYWR5UHJvbWlzZShyZWFkeVByb21pc2VXYWl0Rm9yU3BlYyksXG4gICAgICAgIGNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZ1bmMsXG4gICAgICAgIHRoaXMub25FdmVudF8uYmluZChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIGV2ZW50VHlwZSxcbiAgICAgICAgICBsaXN0ZW5lcixcbiAgICAgICAgICB0aGlzLnJvb3QuZ2V0Um9vdEVsZW1lbnQoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEFuIGVsZW1lbnQuIFdhaXQgZm9yIERPTSB0byBiZSBmdWxseSBwYXJzZWQgdG8gYXZvaWRcbiAgICAvLyBmYWxzZSBtaXNzZWQgc2VhcmNoZXMuXG4gICAgLy8gQXJyYXkgc2VsZWN0b3JzIGRvIG5vdCBzdXBwb3IgdGhlIHNwZWNpYWwgY2FzZXM6ICc6aG9zdCcgJiAnOnJvb3QnXG4gICAgY29uc3Qgc2VsZWN0aW9uTWV0aG9kID1cbiAgICAgIGNvbmZpZ1snc2VsZWN0aW9uTWV0aG9kJ10gfHwgdmlzaWJpbGl0eVNwZWNbJ3NlbGVjdGlvbk1ldGhvZCddO1xuICAgIGFzc2VydFVuaXF1ZVNlbGVjdG9ycyhzZWxlY3Rvcik7XG4gICAgY29uc3QgdW5saXN0ZW5Qcm9taXNlID0gdGhpcy5yb290XG4gICAgICAuZ2V0RWxlbWVudHMoY29udGV4dC5wYXJlbnRFbGVtZW50IHx8IGNvbnRleHQsIHNlbGVjdG9yLCBzZWxlY3Rpb25NZXRob2QpXG4gICAgICAudGhlbigoZWxlbWVudHMpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW5DYWxsYmFja3MgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHVubGlzdGVuQ2FsbGJhY2tzLnB1c2goXG4gICAgICAgICAgICB2aXNpYmlsaXR5TWFuYWdlci5saXN0ZW5FbGVtZW50KFxuICAgICAgICAgICAgICBlbGVtZW50c1tpXSxcbiAgICAgICAgICAgICAgdmlzaWJpbGl0eVNwZWMsXG4gICAgICAgICAgICAgIHRoaXMuZ2V0UmVhZHlQcm9taXNlKHdhaXRGb3JTcGVjLCBlbGVtZW50c1tpXSksXG4gICAgICAgICAgICAgIGNyZWF0ZVJlcG9ydFJlYWR5UHJvbWlzZUZ1bmMsXG4gICAgICAgICAgICAgIHRoaXMub25FdmVudF8uYmluZCh0aGlzLCBldmVudFR5cGUsIGxpc3RlbmVyLCBlbGVtZW50c1tpXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmxpc3RlbkNhbGxiYWNrcztcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHVubGlzdGVuUHJvbWlzZS50aGVuKCh1bmxpc3RlbkNhbGxiYWNrcykgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVubGlzdGVuQ2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdW5saXN0ZW5DYWxsYmFja3NbaV0oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgUHJvbWlzZSBpbmRpY2F0aW5nIHRoYXQgd2UncmUgcmVhZHkgdG8gcmVwb3J0IHRoZSBhbmFseXRpY3MsXG4gICAqIGluIHRoZSBjYXNlIG9mIHJlcG9ydFdoZW46IGRvY3VtZW50SGlkZGVuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlRm9yRG9jdW1lbnRIaWRkZW5fKCkge1xuICAgIGNvbnN0IHthbXBkb2N9ID0gdGhpcy5yb290O1xuXG4gICAgaWYgKCFhbXBkb2MuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGFtcGRvYy5vblZpc2liaWxpdHlDaGFuZ2VkKCgpID0+IHtcbiAgICAgICAgaWYgKCFhbXBkb2MuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBQcm9taXNlIGluZGljYXRpbmcgdGhhdCB3ZSdyZSByZWFkeSB0byByZXBvcnQgdGhlIGFuYWx5dGljcyxcbiAgICogaW4gdGhlIGNhc2Ugb2YgcmVwb3J0V2hlbjogZG9jdW1lbnRFeGl0XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUmVwb3J0UmVhZHlQcm9taXNlRm9yRG9jdW1lbnRFeGl0XygpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIGNvbnN0IHt3aW59ID0gdGhpcy5yb290LmFtcGRvYztcbiAgICBsZXQgdW5sb2FkTGlzdGVuZXIsIHBhZ2VIaWRlTGlzdGVuZXI7XG5cbiAgICAvLyBEbyBub3QgYWRkIGFuIHVubG9hZCBsaXN0ZW5lciB1bmxlc3MgcGFnZWhpZGUgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAvLyBJZiBhbiB1bmxvYWQgbGlzdGVuZXIgaXMgcHJlc2VudCwgdGhlIGJhY2svZm9yd2FyZCBjYWNoZSB3aWxsIG5vdCB3b3JrLlxuICAgIC8vIFRoZSBCRkNhY2hlIHNhdmVzIHBhZ2VzIHRvIGJlIGluc3RhbnRseSBsb2FkZWQgd2hlbiBuYXZpZ2F0aW5nIGJhY2tcbiAgICAvLyBvciBmb3J3YXJkIGFuZCBwYXVzZXMgdGhlaXIgSmF2YVNjcmlwdC4gVGhlIHBhZ2VoaWRlIGV2ZW50IHdhcyBhZGRlZFxuICAgIC8vIHRvIGdpdmUgZGV2ZWxvcGVycyBjb250cm9sIG92ZXIgdGhlIGJlaGF2aW9yLCBhbmQgdGhlIHVubG9hZCBsaXN0ZW5lclxuICAgIC8vIGludGVyZmVyZXMgd2l0aCBpdC4gVG8gYWxsb3cgcHVibGlzaGVycyB0byB1c2UgdGhlIGRlZmF1bHQgQkZDYWNoZVxuICAgIC8vIGJlaGF2aW9yLCB3ZSBzaG91bGQgbm90IGFkZCBhbiB1bmxvYWQgbGlzdGVuZXIuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzUGFnZUhpZGVfKCkpIHtcbiAgICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAvKk9LKi8gJ3VubG9hZCcsXG4gICAgICAgICh1bmxvYWRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgICAgICB3aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdW5sb2FkTGlzdGVuZXIpO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gTm90ZTogcGFnZWhpZGUgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgb24gT3BlcmEgTWluaSwgbm9yIElFPD0xMC5cbiAgICAvLyBEb2N1bWVudGF0aW9uIGNvbmZsaWN0cyBhcyB0byB3aGV0aGVyIFNhZmFyaSBvbiBpT1Mgd2lsbCBhbHNvIGZpcmUgaXRcbiAgICAvLyB3aGVuIHN3aXRjaGluZyB0YWJzIG9yIHN3aXRjaGluZyB0byBhbm90aGVyIGFwcC4gQ2hyb21lIGRvZXMgbm90IGZpcmUgaXRcbiAgICAvLyBpbiB0aGlzIGNhc2UuXG4gICAgLy8gR29vZCwgYnV0IHNldmVyYWwgeWVhcnMgb2xkLCBhbmFseXNpcyBhdDpcbiAgICAvLyBodHRwczovL3d3dy5pZ3ZpdGEuY29tLzIwMTUvMTEvMjAvZG9udC1sb3NlLXVzZXItYW5kLWFwcC1zdGF0ZS11c2UtcGFnZS12aXNpYmlsaXR5L1xuICAgIC8vIEVzcGVjaWFsbHkgbm90ZSB0aGUgZXZlbnQgdGFibGUgb24gdGhpcyBwYWdlLlxuICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3BhZ2VoaWRlJyxcbiAgICAgIChwYWdlSGlkZUxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICB3aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGFnZWhpZGUnLCBwYWdlSGlkZUxpc3RlbmVyKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfSlcbiAgICApO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVjdCBzdXBwb3J0IGZvciB0aGUgcGFnZWhpZGUgZXZlbnQuXG4gICAqIElFPD0xMCBhbmQgT3BlcmEgTWluaSBkbyBub3Qgc3VwcG9ydCB0aGUgcGFnZWhpZGUgZXZlbnQgYW5kXG4gICAqIHBvc3NpYmx5IG90aGVycywgc28gd2UgZmVhdHVyZS1kZXRlY3Qgc3VwcG9ydCB3aXRoIHRoaXMgbWV0aG9kLlxuICAgKiBUaGlzIGlzIGluIGEgc3R1YmJhYmxlIG1ldGhvZCBmb3IgdGVzdGluZy5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGUgdmlzaWJsZSBmb3IgdGVzdGluZ1xuICAgKi9cbiAgc3VwcG9ydHNQYWdlSGlkZV8oKSB7XG4gICAgcmV0dXJuICdvbnBhZ2VoaWRlJyBpbiB0aGlzLnJvb3QuYW1wZG9jLndpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHdhaXRGb3JTcGVjXG4gICAqIEBwYXJhbSB7RWxlbWVudD19IG9wdF9lbGVtZW50XG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGdldFJlYWR5UHJvbWlzZSh3YWl0Rm9yU3BlYywgb3B0X2VsZW1lbnQpIHtcbiAgICBpZiAob3B0X2VsZW1lbnQpIHtcbiAgICAgIGlmICghaXNBbXBFbGVtZW50KG9wdF9lbGVtZW50KSkge1xuICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgICF3YWl0Rm9yU3BlYyB8fCB3YWl0Rm9yU3BlYyA9PSAnbm9uZScsXG4gICAgICAgICAgJ3dhaXRGb3IgZm9yIG5vbi1BTVAgZWxlbWVudHMgbXVzdCBiZSBub25lIG9yIG51bGwuIEZvdW5kICVzJyxcbiAgICAgICAgICB3YWl0Rm9yU3BlY1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FpdEZvclNwZWMgPSB3YWl0Rm9yU3BlYyB8fCAnaW5pLWxvYWQnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghd2FpdEZvclNwZWMgfHwgd2FpdEZvclNwZWMgPT0gJ25vbmUnKSB7XG4gICAgICAvLyBEZWZhdWx0IGNhc2UsIHdhaXRGb3Igc2VsZWN0b3IgaXMgbm90IGRlZmluZWQsIHdhaXQgZm9yIG5vdGhpbmdcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRyYWNrZXJBbGxvd2xpc3QgPSBnZXRUcmFja2VyVHlwZXNGb3JQYXJlbnRUeXBlKCd2aXNpYmxlJyk7XG4gICAgdXNlckFzc2VydChcbiAgICAgIHRyYWNrZXJBbGxvd2xpc3Rbd2FpdEZvclNwZWNdICE9PSB1bmRlZmluZWQsXG4gICAgICAnd2FpdEZvciB2YWx1ZSAlcyBub3Qgc3VwcG9ydGVkJyxcbiAgICAgIHdhaXRGb3JTcGVjXG4gICAgKTtcblxuICAgIGNvbnN0IHdhaXRGb3JUcmFja2VyID1cbiAgICAgIHRoaXMud2FpdEZvclRyYWNrZXJzX1t3YWl0Rm9yU3BlY10gfHxcbiAgICAgIHRoaXMucm9vdC5nZXRUcmFja2VyRm9yQWxsb3dsaXN0KHdhaXRGb3JTcGVjLCB0cmFja2VyQWxsb3dsaXN0KTtcbiAgICBpZiAod2FpdEZvclRyYWNrZXIpIHtcbiAgICAgIHRoaXMud2FpdEZvclRyYWNrZXJzX1t3YWl0Rm9yU3BlY10gPSB3YWl0Rm9yVHJhY2tlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3Igcm9vdCBzaWduYWwgaWYgdGhlcmUncyBubyBlbGVtZW50IHNlbGVjdGVkLlxuICAgIHJldHVybiBvcHRfZWxlbWVudFxuICAgICAgPyB3YWl0Rm9yVHJhY2tlci5nZXRFbGVtZW50U2lnbmFsKHdhaXRGb3JTcGVjLCBvcHRfZWxlbWVudClcbiAgICAgIDogd2FpdEZvclRyYWNrZXIuZ2V0Um9vdFNpZ25hbCh3YWl0Rm9yU3BlYyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFBbmFseXRpY3NFdmVudCl9IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBzdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25FdmVudF8oZXZlbnRUeXBlLCBsaXN0ZW5lciwgdGFyZ2V0LCBzdGF0ZSkge1xuICAgIC8vIFRPRE86IFZlcmlmeSB1c2FnZSBhbmQgY2hhbmdlIGJlaGF2aW9yIHRvIGhhdmUgc3RhdGUgb3ZlcnJpZGUgZGF0YS12YXJzXG4gICAgY29uc3QgYXR0ciA9IGdldERhdGFQYXJhbXNGcm9tQXR0cmlidXRlcyhcbiAgICAgIHRhcmdldCxcbiAgICAgIC8qIGNvbXB1dGVQYXJhbU5hbWVGdW5jICovIHVuZGVmaW5lZCxcbiAgICAgIFZBUklBQkxFX0RBVEFfQVRUUklCVVRFX0tFWVxuICAgICk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cikge1xuICAgICAgc3RhdGVba2V5XSA9IGF0dHJba2V5XTtcbiAgICB9XG4gICAgbGlzdGVuZXIoXG4gICAgICBuZXcgQW5hbHl0aWNzRXZlbnQodGFyZ2V0LCBldmVudFR5cGUsIHN0YXRlLCAvKiogZW5hYmxlRGF0YVZhcnMgKi8gZmFsc2UpXG4gICAgKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/events.js