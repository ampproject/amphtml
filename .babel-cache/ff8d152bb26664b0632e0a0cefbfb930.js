import { resolvedPromise as _resolvedPromise12 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise11 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise10 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise9 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise8 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
var PROTECTED_CSS_CLASS_NAMES = ['i-amphtml-pool-media', 'i-amphtml-pool-audio', 'i-amphtml-pool-video'];

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
    var _fromAttributes$_i = fromAttributes[_i2],
        _attributeName = _fromAttributes$_i.name,
        attributeValue = _fromAttributes$_i.value;

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
  function MediaTask(name, options) {
    if (options === void 0) {
      options = {};
    }

    _classCallCheck(this, MediaTask);

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
   */
  _createClass(MediaTask, [{
    key: "getName",
    value: function getName() {
      return this.name_;
    }
    /**
     * @return {!Promise<*>} A promise that is resolved when the task has
     *     completed execution.
     */

  }, {
    key: "whenComplete",
    value: function whenComplete() {
      return this.completionPromise_;
    }
    /**
     * @param {!HTMLMediaElement} mediaEl The element on which this task should be
     *     executed.
     * @return {!Promise} A promise that is resolved when the task has completed
     *     execution.
     */

  }, {
    key: "execute",
    value: function execute(mediaEl) {
      return this.executeInternal(mediaEl).then(this.resolve_, this.reject_);
    }
    /**
     * @param {!HTMLMediaElement} unusedMediaEl The element on which this task
     *     should be executed.
     * @return {*} TODO(#23582): Specify return type
     * @protected
     */

  }, {
    key: "executeInternal",
    value: function executeInternal(unusedMediaEl) {
      return _resolvedPromise();
    }
    /**
     * @return {boolean} true, if this task must be executed synchronously, e.g.
     *    if it requires a user gesture.
     */

  }, {
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      return false;
    }
    /**
     * @param {*} reason The reason for failing the task.
     * @protected
     */

  }, {
    key: "failTask",
    value: function failTask(reason) {
      this.reject_(reason);
    }
  }]);

  return MediaTask;
}();

/**
 * Plays the specified media element.
 */
export var PlayTask = /*#__PURE__*/function (_MediaTask) {
  _inherits(PlayTask, _MediaTask);

  var _super = _createSuper(PlayTask);

  /**
   * @public
   */
  function PlayTask() {
    _classCallCheck(this, PlayTask);

    return _super.call(this, 'play');
  }

  /** @override */
  _createClass(PlayTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      if (!mediaEl.paused) {
        // We do not want to invoke play() if the media element is already
        // playing, as this can interrupt playback in some browsers.
        return _resolvedPromise2();
      }

      // The play() invocation is wrapped in a Promise.resolve(...) due to the
      // fact that some browsers return a promise from media elements' play()
      // function, while others return a boolean.
      return tryResolve(function () {
        return mediaEl.play();
      });
    }
  }]);

  return PlayTask;
}(MediaTask);

/**
 * Pauses the specified media element.
 */
export var PauseTask = /*#__PURE__*/function (_MediaTask2) {
  _inherits(PauseTask, _MediaTask2);

  var _super2 = _createSuper(PauseTask);

  /**
   * @public
   */
  function PauseTask() {
    _classCallCheck(this, PauseTask);

    return _super2.call(this, 'pause');
  }

  /** @override */
  _createClass(PauseTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      mediaEl.pause();
      return _resolvedPromise3();
    }
  }]);

  return PauseTask;
}(MediaTask);

/**
 * Unmutes the specified media element.
 */
export var UnmuteTask = /*#__PURE__*/function (_MediaTask3) {
  _inherits(UnmuteTask, _MediaTask3);

  var _super3 = _createSuper(UnmuteTask);

  /**
   * @public
   */
  function UnmuteTask() {
    _classCallCheck(this, UnmuteTask);

    return _super3.call(this, 'unmute');
  }

  /** @override */
  _createClass(UnmuteTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      mediaEl.muted = false;
      mediaEl.removeAttribute('muted');
      return _resolvedPromise4();
    }
  }]);

  return UnmuteTask;
}(MediaTask);

/**
 * Mutes the specified media element.
 */
export var MuteTask = /*#__PURE__*/function (_MediaTask4) {
  _inherits(MuteTask, _MediaTask4);

  var _super4 = _createSuper(MuteTask);

  /**
   * @public
   */
  function MuteTask() {
    _classCallCheck(this, MuteTask);

    return _super4.call(this, 'mute');
  }

  /** @override */
  _createClass(MuteTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      mediaEl.muted = true;
      mediaEl.setAttribute('muted', '');
      return _resolvedPromise5();
    }
  }]);

  return MuteTask;
}(MediaTask);

/**
 * Seeks the specified media element to the provided time, in seconds.
 */
export var SetCurrentTimeTask = /*#__PURE__*/function (_MediaTask5) {
  _inherits(SetCurrentTimeTask, _MediaTask5);

  var _super5 = _createSuper(SetCurrentTimeTask);

  /**
   * @param {!Object=} options
   */
  function SetCurrentTimeTask(options) {
    if (options === void 0) {
      options = {
        currentTime: 0
      };
    }

    _classCallCheck(this, SetCurrentTimeTask);

    return _super5.call(this, 'setCurrentTime', options);
  }

  /** @override */
  _createClass(SetCurrentTimeTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      mediaEl.currentTime = this.options.currentTime;
      return _resolvedPromise6();
    }
  }]);

  return SetCurrentTimeTask;
}(MediaTask);

/**
 * Loads the specified media element.
 */
export var LoadTask = /*#__PURE__*/function (_MediaTask6) {
  _inherits(LoadTask, _MediaTask6);

  var _super6 = _createSuper(LoadTask);

  /**
   * @public
   */
  function LoadTask() {
    _classCallCheck(this, LoadTask);

    return _super6.call(this, 'load');
  }

  /** @override */
  _createClass(LoadTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      mediaEl.load();
      return _resolvedPromise7();
    }
    /** @override */

  }, {
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      // When recycling a media pool element, its sources are removed and the
      // LoadTask runs to reset it (buffered data, readyState, etc). It needs to
      // run synchronously so the media element can't be used in a new context
      // but with old data.
      return true;
    }
  }]);

  return LoadTask;
}(MediaTask);

/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 */
export var BlessTask = /*#__PURE__*/function (_MediaTask7) {
  _inherits(BlessTask, _MediaTask7);

  var _super7 = _createSuper(BlessTask);

  /**
   * @public
   */
  function BlessTask() {
    _classCallCheck(this, BlessTask);

    return _super7.call(this, 'bless');
  }

  /** @override */
  _createClass(BlessTask, [{
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      return true;
    }
    /** @override */

  }, {
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      var isMuted = mediaEl.muted;
      mediaEl.muted = false;

      if (isMuted) {
        mediaEl.muted = true;
      }

      return _resolvedPromise8();
    }
  }]);

  return BlessTask;
}(MediaTask);

/**
 * Updates the sources of the specified media element.
 */
export var UpdateSourcesTask = /*#__PURE__*/function (_MediaTask8) {
  _inherits(UpdateSourcesTask, _MediaTask8);

  var _super8 = _createSuper(UpdateSourcesTask);

  /**
   * @param {!Window} win
   * @param {!Sources} newSources The sources to which the media element should
   *     be updated.
   */
  function UpdateSourcesTask(win, newSources) {
    var _this;

    _classCallCheck(this, UpdateSourcesTask);

    _this = _super8.call(this, 'update-src');

    /** @private {!Window} */
    _this.win_ = win;

    /** @private @const {!Sources} */
    _this.newSources_ = newSources;
    return _this;
  }

  /** @override */
  _createClass(UpdateSourcesTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      Sources.removeFrom(this.win_, mediaEl);
      this.newSources_.applyToElement(this.win_, mediaEl);
      return _resolvedPromise9();
    }
    /** @override */

  }, {
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      return true;
    }
  }]);

  return UpdateSourcesTask;
}(MediaTask);

/**
 * Swaps a media element into the DOM, in the place of a placeholder element.
 */
export var SwapIntoDomTask = /*#__PURE__*/function (_MediaTask9) {
  _inherits(SwapIntoDomTask, _MediaTask9);

  var _super9 = _createSuper(SwapIntoDomTask);

  /**
   * @param {!Element} placeholderEl The element to be replaced by the media
   *     element on which this task is executed.
   */
  function SwapIntoDomTask(placeholderEl) {
    var _this2;

    _classCallCheck(this, SwapIntoDomTask);

    _this2 = _super9.call(this, 'swap-into-dom');

    /** @private @const {!Element} */
    _this2.placeholderEl_ = placeholderEl;
    return _this2;
  }

  /** @override */
  _createClass(SwapIntoDomTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      if (!isConnectedNode(this.placeholderEl_)) {
        this.failTask('Cannot swap media for element that is not in DOM.');
        return _resolvedPromise10();
      }

      copyCssClasses(this.placeholderEl_, mediaEl);
      copyAttributes(this.placeholderEl_, mediaEl);
      this.placeholderEl_.parentElement.replaceChild(mediaEl, this.placeholderEl_);
      return _resolvedPromise11();
    }
    /** @override */

  }, {
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      return true;
    }
  }]);

  return SwapIntoDomTask;
}(MediaTask);

/**
 * Swaps a media element out the DOM, replacing it with a placeholder element.
 */
export var SwapOutOfDomTask = /*#__PURE__*/function (_MediaTask10) {
  _inherits(SwapOutOfDomTask, _MediaTask10);

  var _super10 = _createSuper(SwapOutOfDomTask);

  /**
   * @param {!Element} placeholderEl The element to replace the media element on
   *     which this task is executed.
   */
  function SwapOutOfDomTask(placeholderEl) {
    var _this3;

    _classCallCheck(this, SwapOutOfDomTask);

    _this3 = _super10.call(this, 'swap-out-of-dom');

    /** @private @const {!Element} */
    _this3.placeholderEl_ = placeholderEl;
    return _this3;
  }

  /** @override */
  _createClass(SwapOutOfDomTask, [{
    key: "executeInternal",
    value: function executeInternal(mediaEl) {
      copyCssClasses(mediaEl, this.placeholderEl_);
      copyAttributes(mediaEl, this.placeholderEl_);
      mediaEl.parentElement.replaceChild(this.placeholderEl_, mediaEl);
      return _resolvedPromise12();
    }
    /** @override */

  }, {
    key: "requiresSynchronousExecution",
    value: function requiresSynchronousExecution() {
      return true;
    }
  }]);

  return SwapOutOfDomTask;
}(MediaTask);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lZGlhLXRhc2tzLmpzIl0sIm5hbWVzIjpbIkRlZmVycmVkIiwidHJ5UmVzb2x2ZSIsIlNvdXJjZXMiLCJpc0Nvbm5lY3RlZE5vZGUiLCJFTEVNRU5UX0JMRVNTRURfUFJPUEVSVFlfTkFNRSIsIlBST1RFQ1RFRF9DU1NfQ0xBU1NfTkFNRVMiLCJQUk9URUNURURfQVRUUklCVVRFUyIsImlzUHJvdGVjdGVkQ3NzQ2xhc3NOYW1lIiwiY3NzQ2xhc3NOYW1lIiwiaW5kZXhPZiIsImlzUHJvdGVjdGVkQXR0cmlidXRlTmFtZSIsImF0dHJpYnV0ZU5hbWUiLCJjb3B5Q3NzQ2xhc3NlcyIsImZyb21FbCIsInRvRWwiLCJpIiwiY2xhc3NMaXN0IiwibGVuZ3RoIiwiY3NzQ2xhc3MiLCJpdGVtIiwicmVtb3ZlIiwiYWRkIiwiY29weUF0dHJpYnV0ZXMiLCJmcm9tQXR0cmlidXRlcyIsImF0dHJpYnV0ZXMiLCJ0b0F0dHJpYnV0ZXMiLCJuYW1lIiwicmVtb3ZlQXR0cmlidXRlIiwiYXR0cmlidXRlVmFsdWUiLCJ2YWx1ZSIsInNldEF0dHJpYnV0ZSIsIk1lZGlhVGFzayIsIm9wdGlvbnMiLCJuYW1lXyIsImRlZmVycmVkIiwiY29tcGxldGlvblByb21pc2VfIiwicHJvbWlzZSIsInJlc29sdmVfIiwicmVzb2x2ZSIsInJlamVjdF8iLCJyZWplY3QiLCJtZWRpYUVsIiwiZXhlY3V0ZUludGVybmFsIiwidGhlbiIsInVudXNlZE1lZGlhRWwiLCJyZWFzb24iLCJQbGF5VGFzayIsInBhdXNlZCIsInBsYXkiLCJQYXVzZVRhc2siLCJwYXVzZSIsIlVubXV0ZVRhc2siLCJtdXRlZCIsIk11dGVUYXNrIiwiU2V0Q3VycmVudFRpbWVUYXNrIiwiY3VycmVudFRpbWUiLCJMb2FkVGFzayIsImxvYWQiLCJCbGVzc1Rhc2siLCJpc011dGVkIiwiVXBkYXRlU291cmNlc1Rhc2siLCJ3aW4iLCJuZXdTb3VyY2VzIiwid2luXyIsIm5ld1NvdXJjZXNfIiwicmVtb3ZlRnJvbSIsImFwcGx5VG9FbGVtZW50IiwiU3dhcEludG9Eb21UYXNrIiwicGxhY2Vob2xkZXJFbCIsInBsYWNlaG9sZGVyRWxfIiwiZmFpbFRhc2siLCJwYXJlbnRFbGVtZW50IiwicmVwbGFjZUNoaWxkIiwiU3dhcE91dE9mRG9tVGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUixFQUFrQkMsVUFBbEI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyw2QkFBNkIsR0FBRywwQkFBdEM7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLHlCQUF5QixHQUFHLENBQ2hDLHNCQURnQyxFQUVoQyxzQkFGZ0MsRUFHaEMsc0JBSGdDLENBQWxDOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxvQkFBb0IsR0FBRyxDQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsT0FBZCxFQUF1QixVQUF2QixDQUE3Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsdUJBQVQsQ0FBaUNDLFlBQWpDLEVBQStDO0FBQzdDLFNBQU9ILHlCQUF5QixDQUFDSSxPQUExQixDQUFrQ0QsWUFBbEMsS0FBbUQsQ0FBMUQ7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0Usd0JBQVQsQ0FBa0NDLGFBQWxDLEVBQWlEO0FBQy9DLFNBQU9MLG9CQUFvQixDQUFDRyxPQUFyQixDQUE2QkUsYUFBN0IsS0FBK0MsQ0FBdEQ7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsY0FBVCxDQUF3QkMs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c0I1QixPQUF0QixDQUFkO0FBQ0FuQixNQUFBQSxjQUFjLENBQUMsS0FBSytDLGNBQU4sRUFBc0I1QixPQUF0QixDQUFkO0FBQ0EsV0FBSzRCLGNBQUwsQ0FBb0JFLGFBQXBCLENBQWtDQyxZQUFsQyxDQUNFL0IsT0FERixFQUVFLEtBQUs0QixjQUZQO0FBSUEsYUFBTyxvQkFBUDtBQUNEO0FBRUQ7O0FBNUJGO0FBQUE7QUFBQSxXQTZCRSx3Q0FBK0I7QUFDN0IsYUFBTyxJQUFQO0FBQ0Q7QUEvQkg7O0FBQUE7QUFBQSxFQUFxQ3RDLFNBQXJDOztBQWtDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhMEMsZ0JBQWI7QUFBQTs7QUFBQTs7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLDRCQUFZTCxhQUFaLEVBQTJCO0FBQUE7O0FBQUE7O0FBQ3pCLGlDQUFNLGlCQUFOOztBQUVBO0FBQ0EsV0FBS0MsY0FBTCxHQUFzQkQsYUFBdEI7QUFKeUI7QUFLMUI7O0FBRUQ7QUFaRjtBQUFBO0FBQUEsV0FhRSx5QkFBZ0IzQixPQUFoQixFQUF5QjtBQUN2QjdCLE1BQUFBLGNBQWMsQ0FBQzZCLE9BQUQsRUFBVSxLQUFLNEIsY0FBZixDQUFkO0FBQ0EvQyxNQUFBQSxjQUFjLENBQUNtQixPQUFELEVBQVUsS0FBSzRCLGNBQWYsQ0FBZDtBQUNBNUIsTUFBQUEsT0FBTyxDQUFDOEIsYUFBUixDQUFzQkMsWUFBdEIsQ0FBbUMsS0FBS0gsY0FBeEMsRUFBd0Q1QixPQUF4RDtBQUNBLGFBQU8sb0JBQVA7QUFDRDtBQUVEOztBQXBCRjtBQUFBO0FBQUEsV0FxQkUsd0NBQStCO0FBQzdCLGFBQU8sSUFBUDtBQUNEO0FBdkJIOztBQUFBO0FBQUEsRUFBc0NWLFNBQXRDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWQsIHRyeVJlc29sdmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7U291cmNlc30gZnJvbSAnLi9zb3VyY2VzJztcbmltcG9ydCB7aXNDb25uZWN0ZWROb2RlfSBmcm9tICcjY29yZS9kb20nO1xuXG4vKipcbiAqIFRoZSBuYW1lIGZvciBhIGJvb2xlYW4gcHJvcGVydHkgb24gYW4gZWxlbWVudCBpbmRpY2F0aW5nIHdoZXRoZXIgdGhhdCBlbGVtZW50XG4gKiBoYXMgYWxyZWFkeSBiZWVuIFwiYmxlc3NlZFwiLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBFTEVNRU5UX0JMRVNTRURfUFJPUEVSVFlfTkFNRSA9ICdfX0FNUF9NRURJQV9JU19CTEVTU0VEX18nO1xuXG4vKipcbiAqIENTUyBjbGFzcyBuYW1lcyB0aGF0IHNob3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tIGFuIGVsZW1lbnQgd2hlbiBzd2FwcGluZyBpdFxuICogaW50by9vdXQgb2YgdGhlIERPTS5cbiAqIEBjb25zdCB7IUFycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IFBST1RFQ1RFRF9DU1NfQ0xBU1NfTkFNRVMgPSBbXG4gICdpLWFtcGh0bWwtcG9vbC1tZWRpYScsXG4gICdpLWFtcGh0bWwtcG9vbC1hdWRpbycsXG4gICdpLWFtcGh0bWwtcG9vbC12aWRlbycsXG5dO1xuXG4vKipcbiAqIEF0dHJpYnV0ZSBuYW1lcyB0aGF0IHNob3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tIGFuIGVsZW1lbnQgd2hlbiBzd2FwcGluZyBpdFxuICogaW50by9vdXQgb2YgdGhlIERPTS5cbiAqIEBjb25zdCB7IUFycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IFBST1RFQ1RFRF9BVFRSSUJVVEVTID0gWydpZCcsICdzcmMnLCAnY2xhc3MnLCAnYXV0b3BsYXknXTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBDU1MgY2xhc3MgbmFtZSBpcyBhbGxvd2VkIHRvIGJlIHJlbW92ZWQgb3IgY29waWVkIGZyb21cbiAqIG1lZGlhIGVsZW1lbnRzLlxuICogQHBhcmFtIHtzdHJpbmd9IGNzc0NsYXNzTmFtZSBUaGUgQ1NTIGNsYXNzIG5hbWUgbmFtZSB0byBjaGVjay5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUsIGlmIHRoZSBzcGVjaWZpZWQgQ1NTIGNsYXNzIG5hbWUgaXMgYWxsb3dlZCB0byBiZVxuICogICAgIHJlbW92ZWQgb3IgY29waWVkIGZyb20gbWVkaWEgZWxlbWVudHM7IGZhbHNlIG90aGVyd2lzZS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdGVjdGVkQ3NzQ2xhc3NOYW1lKGNzc0NsYXNzTmFtZSkge1xuICByZXR1cm4gUFJPVEVDVEVEX0NTU19DTEFTU19OQU1FUy5pbmRleE9mKGNzc0NsYXNzTmFtZSkgPj0gMDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gYXR0cmlidXRlIGlzIGFsbG93ZWQgdG8gYmUgcmVtb3ZlZCBvciBjb3BpZWQgZnJvbVxuICogbWVkaWEgZWxlbWVudHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlTmFtZSBUaGUgYXR0cmlidXRlIG5hbWUgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlLCBpZiB0aGUgc3BlY2lmaWVkIGF0dHJpYnV0ZSBpcyBhbGxvd2VkIHRvIGJlIHJlbW92ZWRcbiAqICAgICBvciBjb3BpZWQgZnJvbSBtZWRpYSBlbGVtZW50czsgZmFsc2Ugb3RoZXJ3aXNlLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNQcm90ZWN0ZWRBdHRyaWJ1dGVOYW1lKGF0dHJpYnV0ZU5hbWUpIHtcbiAgcmV0dXJuIFBST1RFQ1RFRF9BVFRSSUJVVEVTLmluZGV4T2YoYXR0cmlidXRlTmFtZSkgPj0gMDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgYWxsIHVucHJvdGVjdGVkIENTUyBjbGFzc2VzIGZyb20gZnJvbUVsIHRvIHRvRWwuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBmcm9tRWwgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCBDU1MgY2xhc3NlcyBzaG91bGRcbiAqICAgICBiZSBjb3BpZWQuXG4gKiBAcGFyYW0geyFFbGVtZW50fSB0b0VsIFRoZSBlbGVtZW50IHRvIHdoaWNoIENTUyBjbGFzc2VzIHNob3VsZCBiZVxuICogICAgIGNvcGllZC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNvcHlDc3NDbGFzc2VzKGZyb21FbCwgdG9FbCkge1xuICAvLyBSZW1vdmUgYWxsIG9mIHRoZSB1bnByb3RlY3RlZCBDU1MgY2xhc3NlcyBmcm9tIHRoZSB0b0VsLlxuICBmb3IgKGxldCBpID0gdG9FbC5jbGFzc0xpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBjc3NDbGFzcyA9IHRvRWwuY2xhc3NMaXN0Lml0ZW0oaSk7XG4gICAgaWYgKCFpc1Byb3RlY3RlZENzc0NsYXNzTmFtZShjc3NDbGFzcykpIHtcbiAgICAgIHRvRWwuY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29weSBhbGwgb2YgdGhlIHVucHJvdGVjdGVkIENTUyBjbGFzc2VzIGZyb20gdGhlIGZyb21FbCB0byB0aGUgdG9FbC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcm9tRWwuY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY3NzQ2xhc3MgPSBmcm9tRWwuY2xhc3NMaXN0Lml0ZW0oaSk7XG4gICAgaWYgKCFpc1Byb3RlY3RlZENzc0NsYXNzTmFtZShjc3NDbGFzcykpIHtcbiAgICAgIHRvRWwuY2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29waWVzIGFsbCB1bnByb3RlY3RlZCBhdHRyaWJ1dGVzIGZyb20gZnJvbUVsIHRvIHRvRWwuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBmcm9tRWwgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCBhdHRyaWJ1dGVzIHNob3VsZFxuICogICAgIGJlIGNvcGllZC5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHRvRWwgVGhlIGVsZW1lbnQgdG8gd2hpY2ggYXR0cmlidXRlcyBzaG91bGQgYmVcbiAqICAgICBjb3BpZWQuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjb3B5QXR0cmlidXRlcyhmcm9tRWwsIHRvRWwpIHtcbiAgY29uc3QgZnJvbUF0dHJpYnV0ZXMgPSBmcm9tRWwuYXR0cmlidXRlcztcbiAgY29uc3QgdG9BdHRyaWJ1dGVzID0gdG9FbC5hdHRyaWJ1dGVzO1xuXG4gIC8vIFJlbW92ZSBhbGwgb2YgdGhlIHVucHJvdGVjdGVkIGF0dHJpYnV0ZXMgZnJvbSB0aGUgdG9FbC5cbiAgZm9yIChsZXQgaSA9IHRvQXR0cmlidXRlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSB0b0F0dHJpYnV0ZXNbaV0ubmFtZTtcbiAgICBpZiAoIWlzUHJvdGVjdGVkQXR0cmlidXRlTmFtZShhdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgdG9FbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29weSBhbGwgb2YgdGhlIHVucHJvdGVjdGVkIGF0dHJpYnV0ZXMgZnJvbSB0aGUgZnJvbUVsIHRvIHRoZSB0b0VsLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZyb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qge25hbWU6IGF0dHJpYnV0ZU5hbWUsIHZhbHVlOiBhdHRyaWJ1dGVWYWx1ZX0gPSBmcm9tQXR0cmlidXRlc1tpXTtcbiAgICBpZiAoIWlzUHJvdGVjdGVkQXR0cmlidXRlTmFtZShhdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgdG9FbC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlVmFsdWUpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHRhc2tzIGV4ZWN1dGVkIGluIG9yZGVyIG9uIEhUTUxNZWRpYUVsZW1lbnRzLlxuICovXG5leHBvcnQgY2xhc3MgTWVkaWFUYXNrIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7IU9iamVjdD19IG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbiAgICB0aGlzLm5hbWVfID0gbmFtZTtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLmNvbXBsZXRpb25Qcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQHByb3RlY3RlZCBAY29uc3QgeyFPYmplY3R9ICovXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCl9ICovXG4gICAgdGhpcy5yZXNvbHZlXyA9IGRlZmVycmVkLnJlc29sdmU7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbigqKX0gKi9cbiAgICB0aGlzLnJlamVjdF8gPSBkZWZlcnJlZC5yZWplY3Q7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgbmFtZSBvZiB0aGlzIHRhc2suXG4gICAqL1xuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWVfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCo+fSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSB0YXNrIGhhc1xuICAgKiAgICAgY29tcGxldGVkIGV4ZWN1dGlvbi5cbiAgICovXG4gIHdoZW5Db21wbGV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wbGV0aW9uUHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gbWVkaWFFbCBUaGUgZWxlbWVudCBvbiB3aGljaCB0aGlzIHRhc2sgc2hvdWxkIGJlXG4gICAqICAgICBleGVjdXRlZC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHRhc2sgaGFzIGNvbXBsZXRlZFxuICAgKiAgICAgZXhlY3V0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZShtZWRpYUVsKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUludGVybmFsKG1lZGlhRWwpLnRoZW4odGhpcy5yZXNvbHZlXywgdGhpcy5yZWplY3RfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFIVE1MTWVkaWFFbGVtZW50fSB1bnVzZWRNZWRpYUVsIFRoZSBlbGVtZW50IG9uIHdoaWNoIHRoaXMgdGFza1xuICAgKiAgICAgc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgZXhlY3V0ZUludGVybmFsKHVudXNlZE1lZGlhRWwpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSwgaWYgdGhpcyB0YXNrIG11c3QgYmUgZXhlY3V0ZWQgc3luY2hyb25vdXNseSwgZS5nLlxuICAgKiAgICBpZiBpdCByZXF1aXJlcyBhIHVzZXIgZ2VzdHVyZS5cbiAgICovXG4gIHJlcXVpcmVzU3luY2hyb25vdXNFeGVjdXRpb24oKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gcmVhc29uIFRoZSByZWFzb24gZm9yIGZhaWxpbmcgdGhlIHRhc2suXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGZhaWxUYXNrKHJlYXNvbikge1xuICAgIHRoaXMucmVqZWN0XyhyZWFzb24pO1xuICB9XG59XG5cbi8qKlxuICogUGxheXMgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgUGxheVRhc2sgZXh0ZW5kcyBNZWRpYVRhc2sge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ3BsYXknKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZXhlY3V0ZUludGVybmFsKG1lZGlhRWwpIHtcbiAgICBpZiAoIW1lZGlhRWwucGF1c2VkKSB7XG4gICAgICAvLyBXZSBkbyBub3Qgd2FudCB0byBpbnZva2UgcGxheSgpIGlmIHRoZSBtZWRpYSBlbGVtZW50IGlzIGFscmVhZHlcbiAgICAgIC8vIHBsYXlpbmcsIGFzIHRoaXMgY2FuIGludGVycnVwdCBwbGF5YmFjayBpbiBzb21lIGJyb3dzZXJzLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIC8vIFRoZSBwbGF5KCkgaW52b2NhdGlvbiBpcyB3cmFwcGVkIGluIGEgUHJvbWlzZS5yZXNvbHZlKC4uLikgZHVlIHRvIHRoZVxuICAgIC8vIGZhY3QgdGhhdCBzb21lIGJyb3dzZXJzIHJldHVybiBhIHByb21pc2UgZnJvbSBtZWRpYSBlbGVtZW50cycgcGxheSgpXG4gICAgLy8gZnVuY3Rpb24sIHdoaWxlIG90aGVycyByZXR1cm4gYSBib29sZWFuLlxuICAgIHJldHVybiB0cnlSZXNvbHZlKCgpID0+IG1lZGlhRWwucGxheSgpKTtcbiAgfVxufVxuXG4vKipcbiAqIFBhdXNlcyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXVzZVRhc2sgZXh0ZW5kcyBNZWRpYVRhc2sge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ3BhdXNlJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4ZWN1dGVJbnRlcm5hbChtZWRpYUVsKSB7XG4gICAgbWVkaWFFbC5wYXVzZSgpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFVubXV0ZXMgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgVW5tdXRlVGFzayBleHRlbmRzIE1lZGlhVGFzayB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigndW5tdXRlJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4ZWN1dGVJbnRlcm5hbChtZWRpYUVsKSB7XG4gICAgbWVkaWFFbC5tdXRlZCA9IGZhbHNlO1xuICAgIG1lZGlhRWwucmVtb3ZlQXR0cmlidXRlKCdtdXRlZCcpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIE11dGVzIHRoZSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIE11dGVUYXNrIGV4dGVuZHMgTWVkaWFUYXNrIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdtdXRlJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4ZWN1dGVJbnRlcm5hbChtZWRpYUVsKSB7XG4gICAgbWVkaWFFbC5tdXRlZCA9IHRydWU7XG4gICAgbWVkaWFFbC5zZXRBdHRyaWJ1dGUoJ211dGVkJywgJycpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlZWtzIHRoZSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCB0byB0aGUgcHJvdmlkZWQgdGltZSwgaW4gc2Vjb25kcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNldEN1cnJlbnRUaW1lVGFzayBleHRlbmRzIE1lZGlhVGFzayB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFPYmplY3Q9fSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge2N1cnJlbnRUaW1lOiAwfSkge1xuICAgIHN1cGVyKCdzZXRDdXJyZW50VGltZScsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBleGVjdXRlSW50ZXJuYWwobWVkaWFFbCkge1xuICAgIG1lZGlhRWwuY3VycmVudFRpbWUgPSB0aGlzLm9wdGlvbnMuY3VycmVudFRpbWU7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG59XG5cbi8qKlxuICogTG9hZHMgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgTG9hZFRhc2sgZXh0ZW5kcyBNZWRpYVRhc2sge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ2xvYWQnKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZXhlY3V0ZUludGVybmFsKG1lZGlhRWwpIHtcbiAgICBtZWRpYUVsLmxvYWQoKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlcXVpcmVzU3luY2hyb25vdXNFeGVjdXRpb24oKSB7XG4gICAgLy8gV2hlbiByZWN5Y2xpbmcgYSBtZWRpYSBwb29sIGVsZW1lbnQsIGl0cyBzb3VyY2VzIGFyZSByZW1vdmVkIGFuZCB0aGVcbiAgICAvLyBMb2FkVGFzayBydW5zIHRvIHJlc2V0IGl0IChidWZmZXJlZCBkYXRhLCByZWFkeVN0YXRlLCBldGMpLiBJdCBuZWVkcyB0b1xuICAgIC8vIHJ1biBzeW5jaHJvbm91c2x5IHNvIHRoZSBtZWRpYSBlbGVtZW50IGNhbid0IGJlIHVzZWQgaW4gYSBuZXcgY29udGV4dFxuICAgIC8vIGJ1dCB3aXRoIG9sZCBkYXRhLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogXCJCbGVzc2VzXCIgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50IGZvciBmdXR1cmUgcGxheWJhY2sgd2l0aG91dCBhIHVzZXJcbiAqIGdlc3R1cmUuICBJbiBvcmRlciBmb3IgdGhpcyB0byBibGVzcyB0aGUgbWVkaWEgZWxlbWVudCwgdGhpcyBmdW5jdGlvbiBtdXN0XG4gKiBiZSBpbnZva2VkIGluIHJlc3BvbnNlIHRvIGEgdXNlciBnZXN0dXJlLlxuICovXG5leHBvcnQgY2xhc3MgQmxlc3NUYXNrIGV4dGVuZHMgTWVkaWFUYXNrIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdibGVzcycpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZXF1aXJlc1N5bmNocm9ub3VzRXhlY3V0aW9uKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBleGVjdXRlSW50ZXJuYWwobWVkaWFFbCkge1xuICAgIGNvbnN0IGlzTXV0ZWQgPSBtZWRpYUVsLm11dGVkO1xuICAgIG1lZGlhRWwubXV0ZWQgPSBmYWxzZTtcbiAgICBpZiAoaXNNdXRlZCkge1xuICAgICAgbWVkaWFFbC5tdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHNvdXJjZXMgb2YgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgVXBkYXRlU291cmNlc1Rhc2sgZXh0ZW5kcyBNZWRpYVRhc2sge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshU291cmNlc30gbmV3U291cmNlcyBUaGUgc291cmNlcyB0byB3aGljaCB0aGUgbWVkaWEgZWxlbWVudCBzaG91bGRcbiAgICogICAgIGJlIHVwZGF0ZWQuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIG5ld1NvdXJjZXMpIHtcbiAgICBzdXBlcigndXBkYXRlLXNyYycpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFTb3VyY2VzfSAqL1xuICAgIHRoaXMubmV3U291cmNlc18gPSBuZXdTb3VyY2VzO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBleGVjdXRlSW50ZXJuYWwobWVkaWFFbCkge1xuICAgIFNvdXJjZXMucmVtb3ZlRnJvbSh0aGlzLndpbl8sIG1lZGlhRWwpO1xuICAgIHRoaXMubmV3U291cmNlc18uYXBwbHlUb0VsZW1lbnQodGhpcy53aW5fLCBtZWRpYUVsKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlcXVpcmVzU3luY2hyb25vdXNFeGVjdXRpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBTd2FwcyBhIG1lZGlhIGVsZW1lbnQgaW50byB0aGUgRE9NLCBpbiB0aGUgcGxhY2Ugb2YgYSBwbGFjZWhvbGRlciBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU3dhcEludG9Eb21UYXNrIGV4dGVuZHMgTWVkaWFUYXNrIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBsYWNlaG9sZGVyRWwgVGhlIGVsZW1lbnQgdG8gYmUgcmVwbGFjZWQgYnkgdGhlIG1lZGlhXG4gICAqICAgICBlbGVtZW50IG9uIHdoaWNoIHRoaXMgdGFzayBpcyBleGVjdXRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBsYWNlaG9sZGVyRWwpIHtcbiAgICBzdXBlcignc3dhcC1pbnRvLWRvbScpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5wbGFjZWhvbGRlckVsXyA9IHBsYWNlaG9sZGVyRWw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4ZWN1dGVJbnRlcm5hbChtZWRpYUVsKSB7XG4gICAgaWYgKCFpc0Nvbm5lY3RlZE5vZGUodGhpcy5wbGFjZWhvbGRlckVsXykpIHtcbiAgICAgIHRoaXMuZmFpbFRhc2soJ0Nhbm5vdCBzd2FwIG1lZGlhIGZvciBlbGVtZW50IHRoYXQgaXMgbm90IGluIERPTS4nKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBjb3B5Q3NzQ2xhc3Nlcyh0aGlzLnBsYWNlaG9sZGVyRWxfLCBtZWRpYUVsKTtcbiAgICBjb3B5QXR0cmlidXRlcyh0aGlzLnBsYWNlaG9sZGVyRWxfLCBtZWRpYUVsKTtcbiAgICB0aGlzLnBsYWNlaG9sZGVyRWxfLnBhcmVudEVsZW1lbnQucmVwbGFjZUNoaWxkKFxuICAgICAgbWVkaWFFbCxcbiAgICAgIHRoaXMucGxhY2Vob2xkZXJFbF9cbiAgICApO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVxdWlyZXNTeW5jaHJvbm91c0V4ZWN1dGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFN3YXBzIGEgbWVkaWEgZWxlbWVudCBvdXQgdGhlIERPTSwgcmVwbGFjaW5nIGl0IHdpdGggYSBwbGFjZWhvbGRlciBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU3dhcE91dE9mRG9tVGFzayBleHRlbmRzIE1lZGlhVGFzayB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwbGFjZWhvbGRlckVsIFRoZSBlbGVtZW50IHRvIHJlcGxhY2UgdGhlIG1lZGlhIGVsZW1lbnQgb25cbiAgICogICAgIHdoaWNoIHRoaXMgdGFzayBpcyBleGVjdXRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBsYWNlaG9sZGVyRWwpIHtcbiAgICBzdXBlcignc3dhcC1vdXQtb2YtZG9tJyk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnBsYWNlaG9sZGVyRWxfID0gcGxhY2Vob2xkZXJFbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZXhlY3V0ZUludGVybmFsKG1lZGlhRWwpIHtcbiAgICBjb3B5Q3NzQ2xhc3NlcyhtZWRpYUVsLCB0aGlzLnBsYWNlaG9sZGVyRWxfKTtcbiAgICBjb3B5QXR0cmlidXRlcyhtZWRpYUVsLCB0aGlzLnBsYWNlaG9sZGVyRWxfKTtcbiAgICBtZWRpYUVsLnBhcmVudEVsZW1lbnQucmVwbGFjZUNoaWxkKHRoaXMucGxhY2Vob2xkZXJFbF8sIG1lZGlhRWwpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVxdWlyZXNTeW5jaHJvbm91c0V4ZWN1dGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-tasks.js