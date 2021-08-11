import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _Object$freeze;function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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
import {
PlayingStates,
VideoAnalyticsEvents,
videoAnalyticsCustomEventTypeKey } from "../../../src/video-interface";

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
  VISIBLE: 'visible' };


var ALLOWED_FOR_ALL_ROOT_TYPES = ['ampdoc', 'embed'];

/**
 * Events that can result in analytics data to be sent.
 * @const {!Object<string, {
 *     name: string,
 *     allowedFor: !Array<string>,
 *     klass: typeof ./events.EventTracker
 *   }>}
 */
var TRACKER_TYPE = Object.freeze((_Object$freeze = {}, _defineProperty(_Object$freeze,
AnalyticsEventType.CLICK, {
  name: AnalyticsEventType.CLICK,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  // Escape the temporal dead zone by not referencing a class directly.
  klass: function klass(root) {
    return new ClickEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.CUSTOM, {
  name: AnalyticsEventType.CUSTOM,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new CustomEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.HIDDEN, {
  name: AnalyticsEventType.VISIBLE, // Reuse tracker with visibility
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.INI_LOAD, {
  name: AnalyticsEventType.INI_LOAD,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new IniLoadTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.RENDER_START, {
  name: AnalyticsEventType.RENDER_START,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new SignalTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.SCROLL, {
  name: AnalyticsEventType.SCROLL,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new ScrollEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.STORY, {
  name: AnalyticsEventType.STORY,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new AmpStoryEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.TIMER, {
  name: AnalyticsEventType.TIMER,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new TimerEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.VIDEO, {
  name: AnalyticsEventType.VIDEO,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VideoEventTracker(root);
  } }), _defineProperty(_Object$freeze,

AnalyticsEventType.VISIBLE, {
  name: AnalyticsEventType.VISIBLE,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  } }), _Object$freeze));



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
  userAssert(
  !isArray(selectors) || new Set(selectors).size === selectors.length,
  'Cannot have duplicate selectors in selectors list: %s',
  selectors);

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
  return hasOwn(TRACKER_TYPE, eventType) ?
  TRACKER_TYPE[eventType].name :
  eventType;
}

/**
 * @param {string} parentType
 * @return {!Object<string, typeof EventTracker>}
 */
export function getTrackerTypesForParentType(parentType) {
  var filtered = {};
  Object.keys(TRACKER_TYPE).forEach(function (key) {
    if (
    hasOwn(TRACKER_TYPE, key) &&
    TRACKER_TYPE[key].allowedFor.indexOf(parentType) != -1)
    {
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
  var vars = getDataParamsFromAttributes(
  target,
  /* computeParamNameFunc */
  undefined,
  VARIABLE_DATA_ATTRIBUTE_KEY);

  // Merge eventVars into vars, depth=0 because
  // vars and eventVars are not supposed to contain nested object.
  deepMerge(vars, eventVars, 0);
  return vars;
}

/**
 * @interface
 */var
SignalTrackerDef = /*#__PURE__*/function () {function SignalTrackerDef() {_classCallCheck(this, SignalTrackerDef);}_createClass(SignalTrackerDef, [{ key: "getRootSignal", value:
    /**
     * @param {string} unusedEventType
     * @return {!Promise}
     */
    function getRootSignal(unusedEventType) {}

    /**
     * @param {string} unusedEventType
     * @param {!Element} unusedElement
     * @return {!Promise}
     */ }, { key: "getElementSignal", value:
    function getElementSignal(unusedEventType, unusedElement) {} }]);return SignalTrackerDef;}();


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
function AnalyticsEvent(target, type) {var vars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dict();var enableDataVars = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;_classCallCheck(this, AnalyticsEvent);
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
  function EventTracker(root) {_classCallCheck(this, EventTracker);
    /** @const */
    this.root = root;
  }

  /** @override @abstract */_createClass(EventTracker, [{ key: "dispose", value:
    function dispose() {}

    /**
     * @param {!Element} unusedContext
     * @param {string} unusedEventType
     * @param {!JsonObject} unusedConfig
     * @param {function(!AnalyticsEvent)} unusedListener
     * @return {!UnlistenDef}
     * @abstract
     */ }, { key: "add", value:
    function add(unusedContext, unusedEventType, unusedConfig, unusedListener) {} }]);return EventTracker;}();


/**
 * Tracks custom events.
 */
export var CustomEventTracker = /*#__PURE__*/function (_EventTracker) {_inherits(CustomEventTracker, _EventTracker);var _super = _createSuper(CustomEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function CustomEventTracker(root) {var _this;_classCallCheck(this, CustomEventTracker);
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
    }, 10000);return _this;
  }

  /** @override */_createClass(CustomEventTracker, [{ key: "dispose", value:
    function dispose() {
      this.buffer_ = undefined;
      this.sandboxBuffer_ = undefined;
      for (var k in this.observables_) {
        this.observables_[k].removeAll();
      }
    }

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {var _this2 = this;
      var selector = config['selector'];
      if (!selector) {
        selector = ':root';
      }
      var selectionMethod = config['selectionMethod'] || null;

      var targetReady = this.root.getElement(
      context,
      selector,
      selectionMethod);


      var isSandboxEvent = eventType.startsWith('sandbox-');

      // Push recent events if any.
      var buffer = isSandboxEvent ?
      this.sandboxBuffer_ && this.sandboxBuffer_[eventType] :
      this.buffer_ && this.buffer_[eventType];

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
     */ }, { key: "trigger", value:
    function trigger(event) {
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
    } }]);return CustomEventTracker;}(EventTracker);


// TODO(Enriqe): If needed, add support for sandbox story event.
// (e.g. sandbox-story-xxx).
export var AmpStoryEventTracker = /*#__PURE__*/function (_CustomEventTracker) {_inherits(AmpStoryEventTracker, _CustomEventTracker);var _super2 = _createSuper(AmpStoryEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function AmpStoryEventTracker(root) {_classCallCheck(this, AmpStoryEventTracker);return _super2.call(this,
    root);
  }

  /** @override */_createClass(AmpStoryEventTracker, [{ key: "add", value:
    function add(context, eventType, config, listener) {var _this3 = this;
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
     */ }, { key: "fireListener_", value:
    function fireListener_(event, rootTarget, config, listener) {
      var type = event['type'];
      var vars = event['vars'];

      var storySpec = config['storySpec'] || {};
      var repeat =
      storySpec['repeat'] === undefined ? true : storySpec['repeat'];
      var eventDetails = vars['eventDetails'];
      var tagName = config['tagName'];

      if (
      tagName &&
      eventDetails['tagName'] &&
      tagName.toLowerCase() !== eventDetails['tagName'])
      {
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
     */ }, { key: "trigger", value:
    function trigger(event) {
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
    } }]);return AmpStoryEventTracker;}(CustomEventTracker);


/**
 * Tracks click events.
 */
export var ClickEventTracker = /*#__PURE__*/function (_EventTracker2) {_inherits(ClickEventTracker, _EventTracker2);var _super3 = _createSuper(ClickEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ClickEventTracker(root) {var _this4;_classCallCheck(this, ClickEventTracker);
    _this4 = _super3.call(this, root);

    /** @private {!Observable<!Event>} */
    _this4.clickObservable_ = new Observable();

    /** @private @const {function(!Event)} */
    _this4.boundOnClick_ = _this4.clickObservable_.fire.bind(_this4.clickObservable_);
    _this4.root.getRoot().addEventListener('click', _this4.boundOnClick_);return _this4;
  }

  /** @override */_createClass(ClickEventTracker, [{ key: "dispose", value:
    function dispose() {
      this.root.getRoot().removeEventListener('click', this.boundOnClick_);
      this.clickObservable_.removeAll();
    }

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {
      var selector = userAssert(
      config['selector'],
      'Missing required selector on click trigger');

      var selectionMethod = config['selectionMethod'] || null;
      return this.clickObservable_.add(
      this.root.createSelectiveListener(
      this.handleClick_.bind(this, listener),
      context.parentElement || context,
      selector,
      selectionMethod));


    }

    /**
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Element} target
     * @param {!Event} unusedEvent
     * @private
     */ }, { key: "handleClick_", value:
    function handleClick_(listener, target, unusedEvent) {
      listener(new AnalyticsEvent(target, 'click'));
    } }]);return ClickEventTracker;}(EventTracker);


/**
 * Tracks scroll events.
 */
export var ScrollEventTracker = /*#__PURE__*/function (_EventTracker3) {_inherits(ScrollEventTracker, _EventTracker3);var _super4 = _createSuper(ScrollEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ScrollEventTracker(root) {var _this5;_classCallCheck(this, ScrollEventTracker);
    _this5 = _super4.call(this, root);

    /** @private {!./analytics-root.AnalyticsRoot} root */
    _this5.root_ = root;

    /** @private {?function(!Object)} */
    _this5.boundScrollHandler_ = null;return _this5;
  }

  /** @override */_createClass(ScrollEventTracker, [{ key: "dispose", value:
    function dispose() {
      if (this.boundScrollHandler_ !== null) {
        this.root_.
        getScrollManager().
        removeScrollHandler(this.boundScrollHandler_);
        this.boundScrollHandler_ = null;
      }
    }

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {
      if (!config['scrollSpec']) {
        user().error(TAG, 'Missing scrollSpec on scroll trigger.');
        return NO_UNLISTEN;
      }

      if (
      !Array.isArray(config['scrollSpec']['verticalBoundaries']) &&
      !Array.isArray(config['scrollSpec']['horizontalBoundaries']))
      {
        user().error(
        TAG,
        'Boundaries are required for the scroll trigger to work.');

        return NO_UNLISTEN;
      }

      var boundsV = this.normalizeBoundaries_(
      config['scrollSpec']['verticalBoundaries']);

      var boundsH = this.normalizeBoundaries_(
      config['scrollSpec']['horizontalBoundaries']);

      var useInitialPageSize = !!config['scrollSpec']['useInitialPageSize'];

      this.boundScrollHandler_ = this.scrollHandler_.bind(
      this,
      boundsH,
      boundsV,
      useInitialPageSize,
      listener);


      return this.root_.
      getScrollManager().
      addScrollHandler(this.boundScrollHandler_);
    }

    /**
     * Function to handle scroll events from the Scroll manager
     * @param {!Object<number,boolean>} boundsH
     * @param {!Object<number,boolean>} boundsV
     * @param {boolean} useInitialPageSize
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Object} e
     * @private
     */ }, { key: "scrollHandler_", value:
    function scrollHandler_(boundsH, boundsV, useInitialPageSize, listener, e) {
      // Calculates percentage scrolled by adding screen height/width to
      // top/left and dividing by the total scroll height/width.
      var _ref = useInitialPageSize ? e.initialSize : e,scrollHeight = _ref.scrollHeight,scrollWidth = _ref.scrollWidth;

      this.triggerScrollEvents_(
      boundsV,
      ((e.top + e.height) * 100) / scrollHeight,
      VAR_V_SCROLL_BOUNDARY,
      listener);


      this.triggerScrollEvents_(
      boundsH,
      ((e.left + e.width) * 100) / scrollWidth,
      VAR_H_SCROLL_BOUNDARY,
      listener);

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
     */ }, { key: "normalizeBoundaries_", value:
    function normalizeBoundaries_(bounds) {
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

        bound = Math.min(
        Math.round(bound / SCROLL_PRECISION_PERCENT) * SCROLL_PRECISION_PERCENT,
        100);

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
     */ }, { key: "triggerScrollEvents_", value:
    function triggerScrollEvents_(bounds, scrollPos, varName, listener) {
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
        listener(
        new AnalyticsEvent(
        this.root_.getRootElement(),
        AnalyticsEventType.SCROLL,
        vars,
        /** enableDataVars */false));


      }
    } }]);return ScrollEventTracker;}(EventTracker);


/**
 * Tracks events based on signals.
 * @implements {SignalTrackerDef}
 */
export var SignalTracker = /*#__PURE__*/function (_EventTracker4) {_inherits(SignalTracker, _EventTracker4);var _super5 = _createSuper(SignalTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function SignalTracker(root) {_classCallCheck(this, SignalTracker);return _super5.call(this,
    root);
  }

  /** @override */_createClass(SignalTracker, [{ key: "dispose", value:
    function dispose() {}

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {var _this6 = this;
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
        signalsPromise = this.root.
        getAmpElement(
        context.parentElement || context,
        selector,
        selectionMethod).

        then(function (element) {
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

    /** @override */ }, { key: "getRootSignal", value:
    function getRootSignal(eventType) {
      return this.root.signals().whenSignal(eventType);
    }

    /** @override */ }, { key: "getElementSignal", value:
    function getElementSignal(eventType, element) {
      if (typeof element.signals != 'function') {
        return _resolvedPromise();
      }
      return element.signals().whenSignal(eventType);
    } }]);return SignalTracker;}(EventTracker);


/**
 * Tracks when the elements in the first viewport has been loaded - "ini-load".
 * @implements {SignalTrackerDef}
 */
export var IniLoadTracker = /*#__PURE__*/function (_EventTracker5) {_inherits(IniLoadTracker, _EventTracker5);var _super6 = _createSuper(IniLoadTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function IniLoadTracker(root) {_classCallCheck(this, IniLoadTracker);return _super6.call(this,
    root);
  }

  /** @override */_createClass(IniLoadTracker, [{ key: "dispose", value:
    function dispose() {}

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {var _this7 = this;
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
        promise = this.root.
        getAmpElement(
        context.parentElement || context,
        selector,
        selectionMethod).

        then(function (element) {
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

    /** @override */ }, { key: "getRootSignal", value:
    function getRootSignal() {
      return this.root.whenIniLoaded();
    }

    /** @override */ }, { key: "getElementSignal", value:
    function getElementSignal(unusedEventType, element) {
      if (typeof element.signals != 'function') {
        return _resolvedPromise2();
      }
      var signals = element.signals();
      return Promise.race([
      signals.whenSignal(CommonSignals.INI_LOAD),
      signals.whenSignal(CommonSignals.LOAD_END)]);

    } }]);return IniLoadTracker;}(EventTracker);


/**
 * Timer event handler.
 */var
TimerEventHandler = /*#__PURE__*/function () {
  /**
   * @param {JsonObject} timerSpec The timer specification.
   * @param {function(): UnlistenDef=} opt_startBuilder Factory for building
   *     start trackers for this timer.
   * @param {function(): UnlistenDef=} opt_stopBuilder Factory for building stop
   *     trackers for this timer.
   */
  function TimerEventHandler(timerSpec, opt_startBuilder, opt_stopBuilder) {_classCallCheck(this, TimerEventHandler);
    /** @private {number|undefined} */
    this.intervalId_ = undefined;

    userAssert(
    'interval' in timerSpec,
    'Timer interval specification required');

    /** @private @const {number} */
    this.intervalLength_ = Number(timerSpec['interval']) || 0;
    userAssert(
    this.intervalLength_ >= MIN_TIMER_INTERVAL_SECONDS,
    'Bad timer interval specification');


    /** @private @const {number} */
    this.maxTimerLength_ =
    'maxTimerLength' in timerSpec ?
    Number(timerSpec['maxTimerLength']) :
    DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    userAssert(this.maxTimerLength_ > 0, 'Bad maxTimerLength specification');

    /** @private @const {boolean} */
    this.maxTimerInSpec_ = 'maxTimerLength' in timerSpec;

    /** @private @const {boolean} */
    this.callImmediate_ =
    'immediate' in timerSpec ? Boolean(timerSpec['immediate']) : true;

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
    this.startTime_ = undefined; // milliseconds

    /** @private {number|undefined} */
    this.lastRequestTime_ = undefined;
  }

  /**
   * @param {function()} startTimer
   */_createClass(TimerEventHandler, [{ key: "init", value:
    function init(startTimer) {
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
     */ }, { key: "dispose", value:
    function dispose() {
      this.unlistenForStop_();
      this.unlistenForStart_();
    }

    /** @private */ }, { key: "listenForStart_", value:
    function listenForStart_() {
      if (this.startBuilder_) {
        this.unlistenStart_ = this.startBuilder_();
      }
    }

    /** @private */ }, { key: "unlistenForStart_", value:
    function unlistenForStart_() {
      if (this.unlistenStart_) {
        this.unlistenStart_();
        this.unlistenStart_ = null;
      }
    }

    /** @private */ }, { key: "listenForStop_", value:
    function listenForStop_() {
      if (this.stopBuilder_) {
        try {
          this.unlistenStop_ = this.stopBuilder_();
        } catch (e) {
          this.dispose(); // Stop timer and then throw error.
          throw e;
        }
      }
    }

    /** @private */ }, { key: "unlistenForStop_", value:
    function unlistenForStop_() {
      if (this.unlistenStop_) {
        this.unlistenStop_();
        this.unlistenStop_ = null;
      }
    }

    /** @return {boolean} */ }, { key: "isRunning", value:
    function isRunning() {
      return !!this.intervalId_;
    }

    /**
     * @param {!Window} win
     * @param {function()} timerCallback
     * @param {function()} timeoutCallback
     */ }, { key: "startIntervalInWindow", value:
    function startIntervalInWindow(win, timerCallback, timeoutCallback) {
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
      if (!this.stopBuilder_ || (this.stopBuilder_ && this.maxTimerInSpec_)) {
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
     */ }, { key: "stopTimer_", value:
    function stopTimer_(win) {
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
     */ }, { key: "calculateDuration_", value:
    function calculateDuration_() {
      if (this.startTime_) {
        return Date.now() - (this.lastRequestTime_ || this.startTime_);
      }
      return 0;
    }

    /** @return {!JsonObject} */ }, { key: "getTimerVars", value:
    function getTimerVars() {
      var timerDuration = 0;
      if (this.isRunning()) {
        timerDuration = this.calculateDuration_();
        this.lastRequestTime_ = Date.now();
      }
      return dict({
        'timerDuration': timerDuration,
        'timerStart': this.startTime_ || 0 });

    } }]);return TimerEventHandler;}();


/**
 * Tracks timer events.
 */
export var TimerEventTracker = /*#__PURE__*/function (_EventTracker6) {_inherits(TimerEventTracker, _EventTracker6);var _super7 = _createSuper(TimerEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function TimerEventTracker(root) {var _this8;_classCallCheck(this, TimerEventTracker);
    _this8 = _super7.call(this, root);
    /** @const @private {!Object<number, TimerEventHandler>} */
    _this8.trackers_ = {};

    /** @private {number} */
    _this8.timerIdSequence_ = 1;return _this8;
  }

  /**
   * @return {!Array<number>}
   * @visibleForTesting
   */_createClass(TimerEventTracker, [{ key: "getTrackedTimerKeys", value:
    function getTrackedTimerKeys() {
      return (/** @type {!Array<number>} */(Object.keys(this.trackers_)));
    }

    /** @override */ }, { key: "dispose", value:
    function dispose() {var _this9 = this;
      this.getTrackedTimerKeys().forEach(function (timerId) {
        _this9.removeTracker_(timerId);
      });
    }

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {var _this10 = this;
      var timerSpec = config['timerSpec'];
      userAssert(
      timerSpec && _typeof(timerSpec) == 'object',
      'Bad timer specification');

      var timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
      userAssert(
      !timerStart || _typeof(timerStart) == 'object',
      'Bad timer start specification');

      var timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
      userAssert(
      (!timerStart && !timerStop) || _typeof(timerStop) == 'object',
      'Bad timer stop specification');


      var timerId = this.generateTimerId_();
      var startBuilder;
      var stopBuilder;
      if (timerStart) {
        var startTracker = this.getTracker_(timerStart);
        userAssert(startTracker, 'Cannot track timer start');
        startBuilder = startTracker.add.bind(
        startTracker,
        context,
        timerStart['on'],
        timerStart,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener));

      }
      if (timerStop) {
        var stopTracker = this.getTracker_(timerStop);
        userAssert(stopTracker, 'Cannot track timer stop');
        stopBuilder = stopTracker.add.bind(
        stopTracker,
        context,
        timerStop['on'],
        timerStop,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener));

      }

      var timerHandler = new TimerEventHandler(
      /** @type {!JsonObject} */(timerSpec),
      startBuilder,
      stopBuilder);

      this.trackers_[timerId] = timerHandler;

      timerHandler.init(
      this.startTimer_.bind(this, timerId, eventType, listener));

      return function () {
        _this10.removeTracker_(timerId);
      };
    }

    /**
     * @return {number}
     * @private
     */ }, { key: "generateTimerId_", value:
    function generateTimerId_() {
      return ++this.timerIdSequence_;
    }

    /**
     * @param {!JsonObject} config
     * @return {?EventTracker}
     * @private
     */ }, { key: "getTracker_", value:
    function getTracker_(config) {
      var eventType = user().assertString(config['on']);
      var trackerKey = getTrackerKeyName(eventType);

      return this.root.getTrackerForAllowlist(
      trackerKey,
      getTrackerTypesForParentType('timer'));

    }

    /**
     * Toggles which listeners are active depending on timer state, so no race
     * conditions can occur in the case where the timer starts and stops on the
     * same event type from the same target.
     * @param {number} timerId
     * @param {string} eventType
     * @param {function(!AnalyticsEvent)} listener
     * @private
     */ }, { key: "handleTimerToggle_", value:
    function handleTimerToggle_(timerId, eventType, listener) {
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
     */ }, { key: "startTimer_", value:
    function startTimer_(timerId, eventType, listener) {var _this11 = this;
      var timerHandler = this.trackers_[timerId];
      var timerCallback = function timerCallback() {
        listener(_this11.createEvent_(timerId, eventType));
      };
      timerHandler.startIntervalInWindow(
      this.root.ampdoc.win,
      timerCallback,
      this.removeTracker_.bind(this, timerId));

    }

    /**
     * @param {number} timerId
     * @private
     */ }, { key: "stopTimer_", value:
    function stopTimer_(timerId) {
      this.trackers_[timerId].stopTimer_(this.root.ampdoc.win);
    }

    /**
     * @param {number} timerId
     * @param {string} eventType
     * @return {!AnalyticsEvent}
     * @private
     */ }, { key: "createEvent_", value:
    function createEvent_(timerId, eventType) {
      return new AnalyticsEvent(
      this.root.getRootElement(),
      eventType,
      this.trackers_[timerId].getTimerVars(),
      /** enableDataVars */false);

    }

    /**
     * @param {number} timerId
     * @private
     */ }, { key: "removeTracker_", value:
    function removeTracker_(timerId) {
      if (this.trackers_[timerId]) {
        this.stopTimer_(timerId);
        this.trackers_[timerId].dispose();
        delete this.trackers_[timerId];
      }
    } }]);return TimerEventTracker;}(EventTracker);


/**
 * Tracks video session events
 */
export var VideoEventTracker = /*#__PURE__*/function (_EventTracker7) {_inherits(VideoEventTracker, _EventTracker7);var _super8 = _createSuper(VideoEventTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VideoEventTracker(root) {var _this12;_classCallCheck(this, VideoEventTracker);
    _this12 = _super8.call(this, root);

    /** @private {?Observable<!Event>} */
    _this12.sessionObservable_ = new Observable();

    /** @private {?function(!Event)} */
    _this12.boundOnSession_ = _this12.sessionObservable_.fire.bind(
    _this12.sessionObservable_);


    Object.keys(VideoAnalyticsEvents).forEach(function (key) {
      _this12.root.
      getRoot().
      addEventListener(VideoAnalyticsEvents[key], _this12.boundOnSession_);
    });return _this12;
  }

  /** @override */_createClass(VideoEventTracker, [{ key: "dispose", value:
    function dispose() {var _this13 = this;
      var root = this.root.getRoot();
      Object.keys(VideoAnalyticsEvents).forEach(function (key) {
        root.removeEventListener(VideoAnalyticsEvents[key], _this13.boundOnSession_);
      });
      this.boundOnSession_ = null;
      this.sessionObservable_ = null;
    }

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {
      var videoSpec = config['videoSpec'] || {};
      var selector = userAssert(
      config['selector'] || videoSpec['selector'],
      'Missing required selector on video trigger');


      userAssert(selector.length, 'Missing required selector on video trigger');
      assertUniqueSelectors(selector);
      var selectionMethod = config['selectionMethod'] || null;
      var targetPromises = this.root.getElements(
      context,
      selector,
      selectionMethod,
      false);


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
        var details = /** @type {?JsonObject|undefined} */(getData(event));
        var normalizedType = normalizeVideoEventType(type, details);

        if (normalizedType !== on) {
          return;
        }

        if (normalizedType === VideoAnalyticsEvents.SECONDS_PLAYED && !interval) {
          user().error(
          TAG,
          'video-seconds-played requires interval spec with non-zero value');

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
            user().error(
            TAG,
            'video-percentage-played requires percentages spec.');

            return;
          }

          for (var i = 0; i < percentages.length; i++) {
            var percentage = percentages[i];

            if (percentage <= 0 || percentage % percentageInterval != 0) {
              user().error(
              TAG,
              'Percentages must be set in increments of %s with non-zero ' +
              'values',
              percentageInterval);


              return;
            }
          }

          var normalizedPercentage = details['normalizedPercentage'];
          var normalizedPercentageInt = parseInt(normalizedPercentage, 10);

          devAssert(isFiniteNumber(normalizedPercentageInt));
          devAssert(normalizedPercentageInt % percentageInterval == 0);

          // Don't trigger if current percentage is the same as
          // last triggered percentage
          if (
          lastPercentage == normalizedPercentageInt &&
          percentages.length > 1)
          {
            return;
          }

          if (percentages.indexOf(normalizedPercentageInt) < 0) {
            return;
          }

          lastPercentage = normalizedPercentageInt;
        }

        if (
        type === VideoAnalyticsEvents.SESSION_VISIBLE &&
        !endSessionWhenInvisible)
        {
          return;
        }

        if (excludeAutoplay && details['state'] === PlayingStates.PLAYING_AUTO) {
          return;
        }

        var el = /** @type {!Element} */(
        event.target);



        targetPromises.then(function (targets) {
          targets.forEach(function (target) {
            if (!target.contains(el)) {
              return;
            }
            var normalizedDetails = removeInternalVars(details);
            listener(
            new AnalyticsEvent(target, normalizedType, normalizedDetails));

          });
        });
      });
    } }]);return VideoEventTracker;}(EventTracker);


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
    return (/** @type {string} */(details[videoAnalyticsCustomEventTypeKey]));
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
  var clean = _objectSpread({}, details);
  delete clean[videoAnalyticsCustomEventTypeKey];
  return (/** @type {!JsonObject} */(clean));
}

/**
 * Tracks visibility events.
 */
export var VisibilityTracker = /*#__PURE__*/function (_EventTracker8) {_inherits(VisibilityTracker, _EventTracker8);var _super9 = _createSuper(VisibilityTracker);
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VisibilityTracker(root) {var _this14;_classCallCheck(this, VisibilityTracker);
    _this14 = _super9.call(this, root);

    /** @private */
    _this14.waitForTrackers_ = {};return _this14;
  }

  /** @override */_createClass(VisibilityTracker, [{ key: "dispose", value:
    function dispose() {}

    /** @override */ }, { key: "add", value:
    function add(context, eventType, config, listener) {var _this15 = this;
      var visibilitySpec = config['visibilitySpec'] || {};
      var selector = config['selector'] || visibilitySpec['selector'];
      var waitForSpec = visibilitySpec['waitFor'];
      var reportWhenSpec = visibilitySpec['reportWhen'];
      var createReportReadyPromiseFunc = null;
      if (reportWhenSpec) {
        userAssert(
        !visibilitySpec['repeat'],
        'reportWhen and repeat are mutually exclusive.');

      }

      if (eventType === AnalyticsEventType.HIDDEN) {
        if (reportWhenSpec) {
          user().error(
          TAG,
          'ReportWhen should not be defined when eventType is "hidden"');

        }
        // special polyfill for eventType: 'hidden'
        reportWhenSpec = 'documentHidden';
      }

      var visibilityManager = this.root.getVisibilityManager();

      if (reportWhenSpec == 'documentHidden') {
        createReportReadyPromiseFunc =
        this.createReportReadyPromiseForDocumentHidden_.bind(this);
      } else if (reportWhenSpec == 'documentExit') {
        createReportReadyPromiseFunc =
        this.createReportReadyPromiseForDocumentExit_.bind(this);
      } else {
        userAssert(
        !reportWhenSpec,
        'reportWhen value "%s" not supported.',
        reportWhenSpec);

      }

      // Root selectors are delegated to analytics roots.
      if (!selector || selector == ':root' || selector == ':host') {
        // When `selector` is specified, we always use "ini-load" signal as
        // a "ready" signal.
        var readyPromiseWaitForSpec =
        waitForSpec || (selector ? 'ini-load' : 'none');
        return visibilityManager.listenRoot(
        visibilitySpec,
        this.getReadyPromise(readyPromiseWaitForSpec),
        createReportReadyPromiseFunc,
        this.onEvent_.bind(
        this,
        eventType,
        listener,
        this.root.getRootElement()));


      }

      // An element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      // Array selectors do not suppor the special cases: ':host' & ':root'
      var selectionMethod =
      config['selectionMethod'] || visibilitySpec['selectionMethod'];
      assertUniqueSelectors(selector);
      var unlistenPromise = this.root.
      getElements(context.parentElement || context, selector, selectionMethod).
      then(function (elements) {
        var unlistenCallbacks = [];
        for (var i = 0; i < elements.length; i++) {
          unlistenCallbacks.push(
          visibilityManager.listenElement(
          elements[i],
          visibilitySpec,
          _this15.getReadyPromise(waitForSpec, elements[i]),
          createReportReadyPromiseFunc,
          _this15.onEvent_.bind(_this15, eventType, listener, elements[i])));


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
     */ }, { key: "createReportReadyPromiseForDocumentHidden_", value:
    function createReportReadyPromiseForDocumentHidden_() {
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
     */ }, { key: "createReportReadyPromiseForDocumentExit_", value:
    function createReportReadyPromiseForDocumentExit_() {
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
        /*OK*/'unload', (
        _unloadListener = function unloadListener() {
          win.removeEventListener('unload', _unloadListener);
          deferred.resolve();
        }));

      }

      // Note: pagehide is currently not supported on Opera Mini, nor IE<=10.
      // Documentation conflicts as to whether Safari on iOS will also fire it
      // when switching tabs or switching to another app. Chrome does not fire it
      // in this case.
      // Good, but several years old, analysis at:
      // https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
      // Especially note the event table on this page.
      win.addEventListener(
      'pagehide', (
      _pageHideListener = function pageHideListener() {
        win.removeEventListener('pagehide', _pageHideListener);
        deferred.resolve();
      }));

      return deferred.promise;
    }

    /**
     * Detect support for the pagehide event.
     * IE<=10 and Opera Mini do not support the pagehide event and
     * possibly others, so we feature-detect support with this method.
     * This is in a stubbable method for testing.
     * @return {boolean}
     * @private visible for testing
     */ }, { key: "supportsPageHide_", value:
    function supportsPageHide_() {
      return 'onpagehide' in this.root.ampdoc.win;
    }

    /**
     * @param {string|undefined} waitForSpec
     * @param {Element=} opt_element
     * @return {?Promise}
     * @visibleForTesting
     */ }, { key: "getReadyPromise", value:
    function getReadyPromise(waitForSpec, opt_element) {
      if (opt_element) {
        if (!isAmpElement(opt_element)) {
          userAssert(
          !waitForSpec || waitForSpec == 'none',
          'waitFor for non-AMP elements must be none or null. Found %s',
          waitForSpec);

        } else {
          waitForSpec = waitForSpec || 'ini-load';
        }
      }

      if (!waitForSpec || waitForSpec == 'none') {
        // Default case, waitFor selector is not defined, wait for nothing
        return null;
      }

      var trackerAllowlist = getTrackerTypesForParentType('visible');
      userAssert(
      trackerAllowlist[waitForSpec] !== undefined,
      'waitFor value %s not supported',
      waitForSpec);


      var waitForTracker =
      this.waitForTrackers_[waitForSpec] ||
      this.root.getTrackerForAllowlist(waitForSpec, trackerAllowlist);
      if (waitForTracker) {
        this.waitForTrackers_[waitForSpec] = waitForTracker;
      } else {
        return null;
      }

      // Wait for root signal if there's no element selected.
      return opt_element ?
      waitForTracker.getElementSignal(waitForSpec, opt_element) :
      waitForTracker.getRootSignal(waitForSpec);
    }

    /**
     * @param {string} eventType
     * @param {function(!AnalyticsEvent)} listener
     * @param {!Element} target
     * @param {!JsonObject} state
     * @private
     */ }, { key: "onEvent_", value:
    function onEvent_(eventType, listener, target, state) {
      // TODO: Verify usage and change behavior to have state override data-vars
      var attr = getDataParamsFromAttributes(
      target,
      /* computeParamNameFunc */undefined,
      VARIABLE_DATA_ATTRIBUTE_KEY);

      for (var key in attr) {
        state[key] = attr[key];
      }
      listener(
      new AnalyticsEvent(target, eventType, state, /** enableDataVars */false));

    } }]);return VisibilityTracker;}(EventTracker);
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/events.js