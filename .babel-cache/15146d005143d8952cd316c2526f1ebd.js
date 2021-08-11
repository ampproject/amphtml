function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise12 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise11 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise10 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise9 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise8 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Deferred, tryResolve } from "../../../src/core/data-structures/promise";
import { Sources } from "./sources";
import { isConnectedNode } from "../../../src/core/dom";

/**
 * The name for a boolean property on an element indicating whether that element
 * has already been "blessed".
 * @const {string}
 */
export var ELEMENT_BLESSED_PROPERTY_NAME = '__AMP_MEDIA_IS_BLESSED__';

/**
 * CSS class names that should not be removed from an element when swapping it
 * into/out of the DOM.
 * @const {!Array<string>}
 */
var PROTECTED_CSS_CLASS_NAMES = [
'i-amphtml-pool-media',
'i-amphtml-pool-audio',
'i-amphtml-pool-video'];


/**
 * Attribute names that should not be removed from an element when swapping it
 * into/out of the DOM.
 * @const {!Array<string>}
 */
var PROTECTED_ATTRIBUTES = ['id', 'src', 'class', 'autoplay'];

/**
 * Determines whether a CSS class name is allowed to be removed or copied from
 * media elements.
 * @param {string} cssClassName The CSS class name name to check.
 * @return {boolean} true, if the specified CSS class name is allowed to be
 *     removed or copied from media elements; false otherwise.
 * @private
 */
function isProtectedCssClassName(cssClassName) {
  return PROTECTED_CSS_CLASS_NAMES.indexOf(cssClassName) >= 0;
}

/**
 * Determines whether an attribute is allowed to be removed or copied from
 * media elements.
 * @param {string} attributeName The attribute name to check.
 * @return {boolean} true, if the specified attribute is allowed to be removed
 *     or copied from media elements; false otherwise.
 * @private
 */
function isProtectedAttributeName(attributeName) {
  return PROTECTED_ATTRIBUTES.indexOf(attributeName) >= 0;
}

/**
 * Copies all unprotected CSS classes from fromEl to toEl.
 * @param {!Element} fromEl The element from which CSS classes should
 *     be copied.
 * @param {!Element} toEl The element to which CSS classes should be
 *     copied.
 * @private
 */
function copyCssClasses(fromEl, toEl) {
  // Remove all of the unprotected CSS classes from the toEl.
  for (var i = toEl.classList.length - 1; i >= 0; i--) {
    var cssClass = toEl.classList.item(i);
    if (!isProtectedCssClassName(cssClass)) {
      toEl.classList.remove(cssClass);
    }
  }

  // Copy all of the unprotected CSS classes from the fromEl to the toEl.
  for (var _i = 0; _i < fromEl.classList.length; _i++) {
    var _cssClass = fromEl.classList.item(_i);
    if (!isProtectedCssClassName(_cssClass)) {
      toEl.classList.add(_cssClass);
    }
  }
}

/**
 * Copies all unprotected attributes from fromEl to toEl.
 * @param {!Element} fromEl The element from which attributes should
 *     be copied.
 * @param {!Element} toEl The element to which attributes should be
 *     copied.
 * @private
 */
function copyAttributes(fromEl, toEl) {
  var fromAttributes = fromEl.attributes;
  var toAttributes = toEl.attributes;

  // Remove all of the unprotected attributes from the toEl.
  for (var i = toAttributes.length - 1; i >= 0; i--) {
    var attributeName = toAttributes[i].name;
    if (!isProtectedAttributeName(attributeName)) {
      toEl.removeAttribute(attributeName);
    }
  }

  // Copy all of the unprotected attributes from the fromEl to the toEl.
  for (var _i2 = 0; _i2 < fromAttributes.length; _i2++) {
    var _fromAttributes$_i = fromAttributes[_i2],_attributeName = _fromAttributes$_i.name,attributeValue = _fromAttributes$_i.value;
    if (!isProtectedAttributeName(_attributeName)) {
      toEl.setAttribute(_attributeName, attributeValue);
    }
  }
}

/**
 * Base class for tasks executed in order on HTMLMediaElements.
 */
export var MediaTask = /*#__PURE__*/function () {
  /**
   * @param {string} name
   * @param {!Object=} options
   */
  function MediaTask(name) {var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};_classCallCheck(this, MediaTask);
    /** @private @const {string} */
    this.name_ = name;

    var deferred = new Deferred();

    /** @private @const {!Promise} */
    this.completionPromise_ = deferred.promise;

    /** @protected @const {!Object} */
    this.options = options;

    /** @private {?function()} */
    this.resolve_ = deferred.resolve;

    /** @private {?function(*)} */
    this.reject_ = deferred.reject;
  }

  /**
   * @return {string} The name of this task.
   */_createClass(MediaTask, [{ key: "getName", value:
    function getName() {
      return this.name_;
    }

    /**
     * @return {!Promise<*>} A promise that is resolved when the task has
     *     completed execution.
     */ }, { key: "whenComplete", value:
    function whenComplete() {
      return this.completionPromise_;
    }

    /**
     * @param {!HTMLMediaElement} mediaEl The element on which this task should be
     *     executed.
     * @return {!Promise} A promise that is resolved when the task has completed
     *     execution.
     */ }, { key: "execute", value:
    function execute(mediaEl) {
      return this.executeInternal(mediaEl).then(this.resolve_, this.reject_);
    }

    /**
     * @param {!HTMLMediaElement} unusedMediaEl The element on which this task
     *     should be executed.
     * @return {*} TODO(#23582): Specify return type
     * @protected
     */ }, { key: "executeInternal", value:
    function executeInternal(unusedMediaEl) {
      return _resolvedPromise();
    }

    /**
     * @return {boolean} true, if this task must be executed synchronously, e.g.
     *    if it requires a user gesture.
     */ }, { key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      return false;
    }

    /**
     * @param {*} reason The reason for failing the task.
     * @protected
     */ }, { key: "failTask", value:
    function failTask(reason) {
      this.reject_(reason);
    } }]);return MediaTask;}();


/**
 * Plays the specified media element.
 */
export var PlayTask = /*#__PURE__*/function (_MediaTask) {_inherits(PlayTask, _MediaTask);var _super = _createSuper(PlayTask);
  /**
   * @public
   */
  function PlayTask() {_classCallCheck(this, PlayTask);return _super.call(this,
    'play');
  }

  /** @override */_createClass(PlayTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      if (!mediaEl.paused) {
        // We do not want to invoke play() if the media element is already
        // playing, as this can interrupt playback in some browsers.
        return _resolvedPromise2();
      }

      // The play() invocation is wrapped in a Promise.resolve(...) due to the
      // fact that some browsers return a promise from media elements' play()
      // function, while others return a boolean.
      return tryResolve(function () {return mediaEl.play();});
    } }]);return PlayTask;}(MediaTask);


/**
 * Pauses the specified media element.
 */
export var PauseTask = /*#__PURE__*/function (_MediaTask2) {_inherits(PauseTask, _MediaTask2);var _super2 = _createSuper(PauseTask);
  /**
   * @public
   */
  function PauseTask() {_classCallCheck(this, PauseTask);return _super2.call(this,
    'pause');
  }

  /** @override */_createClass(PauseTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      mediaEl.pause();
      return _resolvedPromise3();
    } }]);return PauseTask;}(MediaTask);


/**
 * Unmutes the specified media element.
 */
export var UnmuteTask = /*#__PURE__*/function (_MediaTask3) {_inherits(UnmuteTask, _MediaTask3);var _super3 = _createSuper(UnmuteTask);
  /**
   * @public
   */
  function UnmuteTask() {_classCallCheck(this, UnmuteTask);return _super3.call(this,
    'unmute');
  }

  /** @override */_createClass(UnmuteTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      mediaEl.muted = false;
      mediaEl.removeAttribute('muted');
      return _resolvedPromise4();
    } }]);return UnmuteTask;}(MediaTask);


/**
 * Mutes the specified media element.
 */
export var MuteTask = /*#__PURE__*/function (_MediaTask4) {_inherits(MuteTask, _MediaTask4);var _super4 = _createSuper(MuteTask);
  /**
   * @public
   */
  function MuteTask() {_classCallCheck(this, MuteTask);return _super4.call(this,
    'mute');
  }

  /** @override */_createClass(MuteTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      mediaEl.muted = true;
      mediaEl.setAttribute('muted', '');
      return _resolvedPromise5();
    } }]);return MuteTask;}(MediaTask);


/**
 * Seeks the specified media element to the provided time, in seconds.
 */
export var SetCurrentTimeTask = /*#__PURE__*/function (_MediaTask5) {_inherits(SetCurrentTimeTask, _MediaTask5);var _super5 = _createSuper(SetCurrentTimeTask);
  /**
   * @param {!Object=} options
   */
  function SetCurrentTimeTask() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { currentTime: 0 };_classCallCheck(this, SetCurrentTimeTask);return _super5.call(this,
    'setCurrentTime', options);
  }

  /** @override */_createClass(SetCurrentTimeTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      mediaEl.currentTime = this.options.currentTime;
      return _resolvedPromise6();
    } }]);return SetCurrentTimeTask;}(MediaTask);


/**
 * Loads the specified media element.
 */
export var LoadTask = /*#__PURE__*/function (_MediaTask6) {_inherits(LoadTask, _MediaTask6);var _super6 = _createSuper(LoadTask);
  /**
   * @public
   */
  function LoadTask() {_classCallCheck(this, LoadTask);return _super6.call(this,
    'load');
  }

  /** @override */_createClass(LoadTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      mediaEl.load();
      return _resolvedPromise7();
    }

    /** @override */ }, { key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      // When recycling a media pool element, its sources are removed and the
      // LoadTask runs to reset it (buffered data, readyState, etc). It needs to
      // run synchronously so the media element can't be used in a new context
      // but with old data.
      return true;
    } }]);return LoadTask;}(MediaTask);


/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 */
export var BlessTask = /*#__PURE__*/function (_MediaTask7) {_inherits(BlessTask, _MediaTask7);var _super7 = _createSuper(BlessTask);
  /**
   * @public
   */
  function BlessTask() {_classCallCheck(this, BlessTask);return _super7.call(this,
    'bless');
  }

  /** @override */_createClass(BlessTask, [{ key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      return true;
    }

    /** @override */ }, { key: "executeInternal", value:
    function executeInternal(mediaEl) {
      var isMuted = mediaEl.muted;
      mediaEl.muted = false;
      if (isMuted) {
        mediaEl.muted = true;
      }
      return _resolvedPromise8();
    } }]);return BlessTask;}(MediaTask);


/**
 * Updates the sources of the specified media element.
 */
export var UpdateSourcesTask = /*#__PURE__*/function (_MediaTask8) {_inherits(UpdateSourcesTask, _MediaTask8);var _super8 = _createSuper(UpdateSourcesTask);
  /**
   * @param {!Window} win
   * @param {!Sources} newSources The sources to which the media element should
   *     be updated.
   */
  function UpdateSourcesTask(win, newSources) {var _this;_classCallCheck(this, UpdateSourcesTask);
    _this = _super8.call(this, 'update-src');

    /** @private {!Window} */
    _this.win_ = win;

    /** @private @const {!Sources} */
    _this.newSources_ = newSources;return _this;
  }

  /** @override */_createClass(UpdateSourcesTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      Sources.removeFrom(this.win_, mediaEl);
      this.newSources_.applyToElement(this.win_, mediaEl);
      return _resolvedPromise9();
    }

    /** @override */ }, { key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      return true;
    } }]);return UpdateSourcesTask;}(MediaTask);


/**
 * Swaps a media element into the DOM, in the place of a placeholder element.
 */
export var SwapIntoDomTask = /*#__PURE__*/function (_MediaTask9) {_inherits(SwapIntoDomTask, _MediaTask9);var _super9 = _createSuper(SwapIntoDomTask);
  /**
   * @param {!Element} placeholderEl The element to be replaced by the media
   *     element on which this task is executed.
   */
  function SwapIntoDomTask(placeholderEl) {var _this2;_classCallCheck(this, SwapIntoDomTask);
    _this2 = _super9.call(this, 'swap-into-dom');

    /** @private @const {!Element} */
    _this2.placeholderEl_ = placeholderEl;return _this2;
  }

  /** @override */_createClass(SwapIntoDomTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      if (!isConnectedNode(this.placeholderEl_)) {
        this.failTask('Cannot swap media for element that is not in DOM.');
        return _resolvedPromise10();
      }

      copyCssClasses(this.placeholderEl_, mediaEl);
      copyAttributes(this.placeholderEl_, mediaEl);
      this.placeholderEl_.parentElement.replaceChild(
      mediaEl,
      this.placeholderEl_);

      return _resolvedPromise11();
    }

    /** @override */ }, { key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      return true;
    } }]);return SwapIntoDomTask;}(MediaTask);


/**
 * Swaps a media element out the DOM, replacing it with a placeholder element.
 */
export var SwapOutOfDomTask = /*#__PURE__*/function (_MediaTask10) {_inherits(SwapOutOfDomTask, _MediaTask10);var _super10 = _createSuper(SwapOutOfDomTask);
  /**
   * @param {!Element} placeholderEl The element to replace the media element on
   *     which this task is executed.
   */
  function SwapOutOfDomTask(placeholderEl) {var _this3;_classCallCheck(this, SwapOutOfDomTask);
    _this3 = _super10.call(this, 'swap-out-of-dom');

    /** @private @const {!Element} */
    _this3.placeholderEl_ = placeholderEl;return _this3;
  }

  /** @override */_createClass(SwapOutOfDomTask, [{ key: "executeInternal", value:
    function executeInternal(mediaEl) {
      copyCssClasses(mediaEl, this.placeholderEl_);
      copyAttributes(mediaEl, this.placeholderEl_);
      mediaEl.parentElement.replaceChild(this.placeholderEl_, mediaEl);
      return _resolvedPromise12();
    }

    /** @override */ }, { key: "requiresSynchronousExecution", value:
    function requiresSynchronousExecution() {
      return true;
    } }]);return SwapOutOfDomTask;}(MediaTask);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-tasks.js