function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import { GestureRecognizer } from "./gesture";
import { calcVelocity } from "./motion";

var DOUBLETAP_DELAY = 200;

/**
 * A "tap" gesture.
 * @typedef {{
 *   clientX: number,
 *   clientY: number
 * }}
 */
export var TapDef;

/**
 * Recognizes "tap" gestures.
 * @extends {GestureRecognizer<TapDef>}
 */
export var TapRecognizer = /*#__PURE__*/function (_GestureRecognizer) {_inherits(TapRecognizer, _GestureRecognizer);var _super = _createSuper(TapRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function TapRecognizer(manager) {var _this;_classCallCheck(this, TapRecognizer);
    _this = _super.call(this, 'tap', manager);

    /** @private {number} */
    _this.startX_ = 0;

    /** @private {number} */
    _this.startY_ = 0;

    /** @private {number} */
    _this.lastX_ = 0;

    /** @private {number} */
    _this.lastY_ = 0;

    /** @private {?EventTarget} */
    _this.target_ = null;return _this;
  }

  /** @override */_createClass(TapRecognizer, [{ key: "onTouchStart", value:
    function onTouchStart(e) {
      var touches = e.touches;
      this.target_ = e.target;
      if (touches && touches.length == 1) {
        this.startX_ = touches[0].clientX;
        this.startY_ = touches[0].clientY;
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchMove", value:
    function onTouchMove(e) {
      var touches = e.changedTouches || e.touches;
      if (touches && touches.length == 1) {
        this.lastX_ = touches[0].clientX;
        this.lastY_ = touches[0].clientY;
        var dx = Math.abs(this.lastX_ - this.startX_) >= 8;
        var dy = Math.abs(this.lastY_ - this.startY_) >= 8;
        if (dx || dy) {
          return false;
        }
      }
      return true;
    }

    /** @override */ }, { key: "onTouchEnd", value:
    function onTouchEnd(unusedE) {
      this.signalReady(0);
    }

    /** @override */ }, { key: "acceptStart", value:
    function acceptStart() {
      this.signalEmit(
      {
        clientX: this.lastX_,
        clientY: this.lastY_,
        target: this.target_ },

      null);

      this.signalEnd();
    } }]);return TapRecognizer;}(GestureRecognizer);


/**
 * A "doubletap" gesture.
 * @typedef {{
 *   clientX: number,
 *   clientY: number
 * }}
 */
export var DoubletapDef;

/**
 * Recognizes a "doubletap" gesture. This gesture will block a single "tap"
 * for about 200ms while it's expecting the second "tap".
 * @extends {GestureRecognizer<DoubletapDef>}
 */
export var DoubletapRecognizer = /*#__PURE__*/function (_GestureRecognizer2) {_inherits(DoubletapRecognizer, _GestureRecognizer2);var _super2 = _createSuper(DoubletapRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function DoubletapRecognizer(manager) {var _this2;_classCallCheck(this, DoubletapRecognizer);
    _this2 = _super2.call(this, 'doubletap', manager);

    /** @private {number} */
    _this2.startX_ = 0;

    /** @private {number} */
    _this2.startY_ = 0;

    /** @private {number} */
    _this2.lastX_ = 0;

    /** @private {number} */
    _this2.lastY_ = 0;

    /** @private {number} */
    _this2.tapCount_ = 0;

    /** @private {?Event} */
    _this2.event_ = null;return _this2;
  }

  /** @override */_createClass(DoubletapRecognizer, [{ key: "onTouchStart", value:
    function onTouchStart(e) {
      if (this.tapCount_ > 1) {
        return false;
      }
      var touches = e.touches;
      if (touches && touches.length == 1) {
        this.startX_ = touches[0].clientX;
        this.startY_ = touches[0].clientY;
        this.lastX_ = touches[0].clientX;
        this.lastY_ = touches[0].clientY;
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchMove", value:
    function onTouchMove(e) {
      var touches = e.touches;
      if (touches && touches.length == 1) {
        this.lastX_ = touches[0].clientX;
        this.lastY_ = touches[0].clientY;
        var dx = Math.abs(this.lastX_ - this.startX_) >= 8;
        var dy = Math.abs(this.lastY_ - this.startY_) >= 8;
        if (dx || dy) {
          this.acceptCancel();
          return false;
        }
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchEnd", value:
    function onTouchEnd(e) {
      this.tapCount_++;
      if (this.tapCount_ < 2) {
        this.signalPending(DOUBLETAP_DELAY);
      } else {
        this.event_ = e;
        this.signalReady(0);
      }
    }

    /** @override */ }, { key: "acceptStart", value:
    function acceptStart() {
      this.tapCount_ = 0;
      this.signalEmit({ clientX: this.lastX_, clientY: this.lastY_ }, this.event_);
      this.signalEnd();
    }

    /** @override */ }, { key: "acceptCancel", value:
    function acceptCancel() {
      this.tapCount_ = 0;
    } }]);return DoubletapRecognizer;}(GestureRecognizer);


/**
 * A "swipe-xy", "swipe-x" or "swipe-y" gesture. A number of these gestures
 * may be emitted for a single touch series.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
export var SwipeDef;

/**
 * Recognizes swipe gestures. This gesture will yield about 10ms to other
 * gestures.
 * @extends {GestureRecognizer<SwipeDef>}
 */var
SwipeRecognizer = /*#__PURE__*/function (_GestureRecognizer3) {_inherits(SwipeRecognizer, _GestureRecognizer3);var _super3 = _createSuper(SwipeRecognizer);
  /**
   * @param {string} type
   * @param {!./gesture.Gestures} manager
   * @param {boolean} horiz
   * @param {boolean} vert
   */
  function SwipeRecognizer(type, manager, horiz, vert) {var _this3;_classCallCheck(this, SwipeRecognizer);
    _this3 = _super3.call(this, type, manager);

    /** @private {boolean} */
    _this3.horiz_ = horiz;

    /** @private {boolean} */
    _this3.vert_ = vert;

    /** @private {boolean} */
    _this3.eventing_ = false;

    /** @private {number} */
    _this3.startX_ = 0;

    /** @private {number} */
    _this3.startY_ = 0;

    /** @private {number} */
    _this3.lastX_ = 0;

    /** @private {number} */
    _this3.lastY_ = 0;

    /** @private {number} */
    _this3.prevX_ = 0;

    /** @private {number} */
    _this3.prevY_ = 0;

    /** @private {time} */
    _this3.startTime_ = 0;

    /** @private {time} */
    _this3.lastTime_ = 0;

    /** @private {time} */
    _this3.prevTime_ = 0;

    /** @private {number} */
    _this3.velocityX_ = 0;

    /** @private {number} */
    _this3.velocityY_ = 0;return _this3;
  }

  /** @override */_createClass(SwipeRecognizer, [{ key: "onTouchStart", value:
    function onTouchStart(e) {
      var touches = e.touches;
      // If already eventing, ignore additional touches
      if (this.eventing_ && touches && touches.length > 1) {
        return true;
      }
      if (touches && touches.length == 1) {
        this.startTime_ = Date.now();
        this.startX_ = touches[0].clientX;
        this.startY_ = touches[0].clientY;
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchMove", value:
    function onTouchMove(e) {
      var touches = e.touches;
      if (touches && touches.length >= 1) {
        var _touches$ = touches[0],x = _touches$.clientX,y = _touches$.clientY;
        this.lastX_ = x;
        this.lastY_ = y;
        if (this.eventing_) {
          // If already eventing, always emit new coordinates
          this.emit_(false, false, e);
        } else {
          // Figure out whether or not we should start eventing
          var dx = Math.abs(x - this.startX_);
          var dy = Math.abs(y - this.startY_);
          // Swipe is penalized slightly since it's one of the least demanding
          // gesture, thus -10 in signalReady.
          if (this.horiz_ && this.vert_) {
            if (dx >= 8 || dy >= 8) {
              this.signalReady(-10);
            }
          } else if (this.horiz_) {
            if (dx >= 8 && dx > dy) {
              this.signalReady(-10);
            } else if (dy >= 8) {
              return false;
            }
          } else if (this.vert_) {
            if (dy >= 8 && dy > dx) {
              this.signalReady(-10);
            } else if (dx >= 8) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchEnd", value:
    function onTouchEnd(e) {
      var touches = e.touches;
      // Number of current touches on the page
      if (touches && touches.length == 0) {
        this.end_(e);
      }
    }

    /** @override */ }, { key: "acceptStart", value:
    function acceptStart() {
      this.eventing_ = true;
      // Reset start coordinates to where the gesture began to avoid visible
      // jump, but preserve them as "prev" coordinates to calculate the right
      // velocity.
      this.prevX_ = this.startX_;
      this.prevY_ = this.startY_;
      this.prevTime_ = this.startTime_;
      this.startX_ = this.lastX_;
      this.startY_ = this.lastY_;
      this.emit_(true, false, null);
    }

    /** @override */ }, { key: "acceptCancel", value:
    function acceptCancel() {
      this.eventing_ = false;
    }

    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */ }, { key: "emit_", value:
    function emit_(first, last, event) {
      this.lastTime_ = Date.now();
      var deltaTime = this.lastTime_ - this.prevTime_;
      // It's often that `touchend` arrives on the next frame. These should
      // be ignored to avoid a significant velocity downgrade.
      if ((!last && deltaTime > 4) || (last && deltaTime > 16)) {
        var velocityX = calcVelocity(
        this.lastX_ - this.prevX_,
        deltaTime,
        this.velocityX_);

        var velocityY = calcVelocity(
        this.lastY_ - this.prevY_,
        deltaTime,
        this.velocityY_);


        // On iOS, the touchend will always have the same x/y position as the
        // last touchmove, so we want to make sure we do not remove the velocity.
        // The touchend event with zero velocity can occur within a couple of
        // frames of the last touchmove.
        if (!last || deltaTime > 32 || velocityX != 0 || velocityY != 0) {
          this.velocityX_ = Math.abs(velocityX) > 1e-4 ? velocityX : 0;
          this.velocityY_ = Math.abs(velocityY) > 1e-4 ? velocityY : 0;
        }

        this.prevX_ = this.lastX_;
        this.prevY_ = this.lastY_;
        this.prevTime_ = this.lastTime_;
      }

      this.signalEmit(
      {
        first: first,
        last: last,
        time: this.lastTime_,
        deltaX: this.lastX_ - this.startX_,
        deltaY: this.lastY_ - this.startY_,
        startX: this.startX_,
        startY: this.startY_,
        lastX: this.lastX_,
        lastY: this.lastY_,
        velocityX: this.velocityX_,
        velocityY: this.velocityY_ },

      event);

    }

    /**
     * @param {?Event} event
     * @private
     */ }, { key: "end_", value:
    function end_(event) {
      if (this.eventing_) {
        this.eventing_ = false;
        this.emit_(false, true, event);
        this.signalEnd();
      }
    } }]);return SwipeRecognizer;}(GestureRecognizer);


/**
 * Recognizes "swipe-xy" gesture. Yields about 10ms to other gestures.
 */
export var SwipeXYRecognizer = /*#__PURE__*/function (_SwipeRecognizer) {_inherits(SwipeXYRecognizer, _SwipeRecognizer);var _super4 = _createSuper(SwipeXYRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeXYRecognizer(manager) {_classCallCheck(this, SwipeXYRecognizer);return _super4.call(this,
    'swipe-xy', manager, true, true);
  }return SwipeXYRecognizer;}(SwipeRecognizer);


/**
 * Recognizes "swipe-x" gesture. Yields about 10ms to other gestures.
 */
export var SwipeXRecognizer = /*#__PURE__*/function (_SwipeRecognizer2) {_inherits(SwipeXRecognizer, _SwipeRecognizer2);var _super5 = _createSuper(SwipeXRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeXRecognizer(manager) {_classCallCheck(this, SwipeXRecognizer);return _super5.call(this,
    'swipe-x', manager, true, false);
  }return SwipeXRecognizer;}(SwipeRecognizer);


/**
 * Recognizes "swipe-y" gesture. Yields about 10ms to other gestures.
 */
export var SwipeYRecognizer = /*#__PURE__*/function (_SwipeRecognizer3) {_inherits(SwipeYRecognizer, _SwipeRecognizer3);var _super6 = _createSuper(SwipeYRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeYRecognizer(manager) {_classCallCheck(this, SwipeYRecognizer);return _super6.call(this,
    'swipe-y', manager, false, true);
  }return SwipeYRecognizer;}(SwipeRecognizer);


/**
 * A "tapzoom" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   centerClientX: number,
 *   centerClientY: number,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
var TapzoomDef;

/**
 * Recognizes a "tapzoom" gesture. This gesture will block other gestures
 * for about 400ms after first "tap" while it's expecting swipe.
 * @extends {GestureRecognizer<TapzoomDef>}
 */
export var TapzoomRecognizer = /*#__PURE__*/function (_GestureRecognizer4) {_inherits(TapzoomRecognizer, _GestureRecognizer4);var _super7 = _createSuper(TapzoomRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function TapzoomRecognizer(manager) {var _this4;_classCallCheck(this, TapzoomRecognizer);
    _this4 = _super7.call(this, 'tapzoom', manager);

    /** @private {boolean} */
    _this4.eventing_ = false;

    /** @private {number} */
    _this4.startX_ = 0;

    /** @private {number} */
    _this4.startY_ = 0;

    /** @private {number} */
    _this4.lastX_ = 0;

    /** @private {number} */
    _this4.lastY_ = 0;

    /** @private {number} */
    _this4.tapCount_ = 0;

    /** @private {number} */
    _this4.prevX_ = 0;

    /** @private {number} */
    _this4.prevY_ = 0;

    /** @private {time} */
    _this4.lastTime_ = 0;

    /** @private {time} */
    _this4.prevTime_ = 0;

    /** @private {number} */
    _this4.velocityX_ = 0;

    /** @private {number} */
    _this4.velocityY_ = 0;return _this4;
  }

  /** @override */_createClass(TapzoomRecognizer, [{ key: "onTouchStart", value:
    function onTouchStart(e) {
      if (this.eventing_) {
        return false;
      }
      var touches = e.touches;
      if (touches && touches.length == 1) {
        this.startX_ = touches[0].clientX;
        this.startY_ = touches[0].clientY;
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchMove", value:
    function onTouchMove(e) {
      var touches = e.touches;
      if (touches && touches.length == 1) {
        this.lastX_ = touches[0].clientX;
        this.lastY_ = touches[0].clientY;
        if (this.eventing_) {
          this.emit_(false, false, e);
        } else {
          var dx = Math.abs(this.lastX_ - this.startX_) >= 8;
          var dy = Math.abs(this.lastY_ - this.startY_) >= 8;
          if (dx || dy) {
            if (this.tapCount_ == 0) {
              this.acceptCancel();
              return false;
            } else {
              this.signalReady(0);
            }
          }
        }
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchEnd", value:
    function onTouchEnd(e) {
      if (this.eventing_) {
        this.end_(e);
        return;
      }

      this.tapCount_++;
      if (this.tapCount_ == 1) {
        this.signalPending(400);
        return;
      }

      this.acceptCancel();
    }

    /** @override */ }, { key: "acceptStart", value:
    function acceptStart() {
      this.tapCount_ = 0;
      this.eventing_ = true;
      this.emit_(true, false, null);
    }

    /** @override */ }, { key: "acceptCancel", value:
    function acceptCancel() {
      this.tapCount_ = 0;
      this.eventing_ = false;
    }

    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */ }, { key: "emit_", value:
    function emit_(first, last, event) {
      this.lastTime_ = Date.now();
      if (first) {
        this.velocityX_ = this.velocityY_ = 0;
      } else if (this.lastTime_ - this.prevTime_ > 2) {
        this.velocityX_ = calcVelocity(
        this.lastX_ - this.prevX_,
        this.lastTime_ - this.prevTime_,
        this.velocityX_);

        this.velocityY_ = calcVelocity(
        this.lastY_ - this.prevY_,
        this.lastTime_ - this.prevTime_,
        this.velocityY_);

      }
      this.prevX_ = this.lastX_;
      this.prevY_ = this.lastY_;
      this.prevTime_ = this.lastTime_;

      this.signalEmit(
      {
        first: first,
        last: last,
        centerClientX: this.startX_,
        centerClientY: this.startY_,
        deltaX: this.lastX_ - this.startX_,
        deltaY: this.lastY_ - this.startY_,
        velocityX: this.velocityX_,
        velocityY: this.velocityY_ },

      event);

    }

    /**
     * @param {?Event} event
     * @private
     */ }, { key: "end_", value:
    function end_(event) {
      if (this.eventing_) {
        this.eventing_ = false;
        this.emit_(false, true, event);
        this.signalEnd();
      }
    } }]);return TapzoomRecognizer;}(GestureRecognizer);


/**
 * A "pinch" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center. "dir" component of `1`
 * indicates that it's a expand motion and `-1` indicates pinch motion.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   centerClientX: number,
 *   centerClientY: number,
 *   dir: number,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
export var PinchDef;

/**
 * Threshold in pixels for how much two touches move away from
 * each other before we recognize the gesture as a pinch.
 */
var PINCH_ACCEPT_THRESHOLD = 4;

/**
 * Threshold in pixels for how much two touches move in the same
 * direction before we reject the gesture as a pinch.
 */
var PINCH_REJECT_THRESHOLD = 10;

/**
 * Recognizes a "pinch" gesture.
 * @extends {GestureRecognizer<PinchDef>}
 */
export var PinchRecognizer = /*#__PURE__*/function (_GestureRecognizer5) {_inherits(PinchRecognizer, _GestureRecognizer5);var _super8 = _createSuper(PinchRecognizer);
  /**
   * @param {!./gesture.Gestures} manager
   */
  function PinchRecognizer(manager) {var _this5;_classCallCheck(this, PinchRecognizer);
    _this5 = _super8.call(this, 'pinch', manager);

    /** @private {boolean} */
    _this5.eventing_ = false;

    /** @private {number} */
    _this5.startX1_ = 0;
    /** @private {number} */
    _this5.startY1_ = 0;

    /** @private {number} */
    _this5.startX2_ = 0;
    /** @private {number} */
    _this5.startY2_ = 0;

    /** @private {number} */
    _this5.lastX1_ = 0;
    /** @private {number} */
    _this5.lastY1_ = 0;

    /** @private {number} */
    _this5.lastX2_ = 0;
    /** @private {number} */
    _this5.lastY2_ = 0;

    /** @private {number} */
    _this5.prevDeltaX_ = 0;
    /** @private {number} */
    _this5.prevDeltaY_ = 0;

    /** @private {number} */
    _this5.centerClientX_ = 0;
    /** @private {number} */
    _this5.centerClientY_ = 0;

    /** @private {time} */
    _this5.startTime_ = 0;
    /** @private {time} */
    _this5.lastTime_ = 0;
    /** @private {time} */
    _this5.prevTime_ = 0;

    /** @private {number} */
    _this5.velocityX_ = 0;
    /** @private {number} */
    _this5.velocityY_ = 0;return _this5;
  }

  /** @override */_createClass(PinchRecognizer, [{ key: "onTouchStart", value:
    function onTouchStart(e) {
      var touches = e.touches;
      if (!touches) {
        return false;
      }
      // Pinch touches are not always simultaneous, continue to listen
      // for second touch.
      if (touches.length == 1) {
        return true;
      }
      // If already in the middle of a pinch event, ignore additional touches.
      if (this.eventing_ && touches.length > 2) {
        return true;
      }
      if (touches.length == 2) {
        this.startTime_ = Date.now();
        this.startX1_ = touches[0].clientX;
        this.startY1_ = touches[0].clientY;
        this.startX2_ = touches[1].clientX;
        this.startY2_ = touches[1].clientY;
        return true;
      } else {
        return false;
      }
    }

    /** @override */ }, { key: "onTouchMove", value:
    function onTouchMove(e) {
      var touches = e.touches;
      if (!touches || touches.length == 0) {
        return false;
      }
      // Pinch touches are not always simultaneous, continue to listen
      // for second touch.
      if (touches.length == 1) {
        return true;
      }

      // Have 2+ touches
      this.lastX1_ = touches[0].clientX;
      this.lastY1_ = touches[0].clientY;
      this.lastX2_ = touches[1].clientX;
      this.lastY2_ = touches[1].clientY;

      // If eventing, always emit gesture with new coordinates
      if (this.eventing_) {
        this.emit_(false, false, e);
        return true;
      }

      // Gesture is 2+ touch but direction indicates not a pinch
      if (this.isPinchRejected_()) {
        return false;
      }

      if (this.isPinchReady_()) {
        this.signalReady(0);
      }
      // Pinch gesture detected but threshold not reached, continue listening
      return true;
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "isPinchReady_", value:
    function isPinchReady_() {
      var dx1 = this.lastX1_ - this.startX1_;
      var dy1 = this.lastY1_ - this.startY1_;
      var dx2 = this.lastX2_ - this.startX2_;
      var dy2 = this.lastY2_ - this.startY2_;

      var pinchDirectionCorrect = dx1 * dx2 <= 0 && dy1 * dy2 <= 0;
      var xPinchRecognized = Math.abs(dx1 - dx2) >= PINCH_ACCEPT_THRESHOLD;
      var yPinchRecognized = Math.abs(dy1 - dy2) >= PINCH_ACCEPT_THRESHOLD;
      return pinchDirectionCorrect && (xPinchRecognized || yPinchRecognized);
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "isPinchRejected_", value:
    function isPinchRejected_() {
      var dx1 = this.lastX1_ - this.startX1_;
      var dy1 = this.lastY1_ - this.startY1_;
      var dx2 = this.lastX2_ - this.startX2_;
      var dy2 = this.lastY2_ - this.startY2_;

      var pinchDirectionIncorrect = dx1 * dx2 > 0 || dy1 * dy2 > 0;
      var xPinchRejected = Math.abs(dx1 + dx2) >= PINCH_REJECT_THRESHOLD;
      var yPinchRejected = Math.abs(dy1 + dy2) >= PINCH_REJECT_THRESHOLD;
      return pinchDirectionIncorrect && (xPinchRejected || yPinchRejected);
    }

    /** @override */ }, { key: "onTouchEnd", value:
    function onTouchEnd(e) {
      // Pinch requires at least two touches on the page
      var touches = e.touches;
      if (touches && touches.length < 2) {
        this.end_(e);
      }
    }

    /** @override */ }, { key: "acceptStart", value:
    function acceptStart() {
      this.eventing_ = true;
      this.prevTime_ = this.startTime_;
      this.prevDeltaX_ = 0;
      this.prevDeltaY_ = 0;
      this.centerClientX_ = (this.startX1_ + this.startX2_) * 0.5;
      this.centerClientY_ = (this.startY1_ + this.startY2_) * 0.5;
      this.emit_(true, false, null);
    }

    /** @override */ }, { key: "acceptCancel", value:
    function acceptCancel() {
      this.eventing_ = false;
    }

    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */ }, { key: "emit_", value:
    function emit_(first, last, event) {
      this.lastTime_ = Date.now();
      var deltaTime = this.lastTime_ - this.prevTime_;
      var deltaX = this.deltaX_();
      var deltaY = this.deltaY_();
      // It's often that `touchend` arrives on the next frame. These should
      // be ignored to avoid a significant velocity downgrade.
      if ((!last && deltaTime > 4) || (last && deltaTime > 16)) {
        this.velocityX_ = calcVelocity(
        deltaX - this.prevDeltaX_,
        deltaTime,
        this.velocityX_);

        this.velocityY_ = calcVelocity(
        deltaY - this.prevDeltaY_,
        deltaTime,
        this.velocityY_);

        this.velocityX_ = Math.abs(this.velocityX_) > 1e-4 ? this.velocityX_ : 0;
        this.velocityY_ = Math.abs(this.velocityY_) > 1e-4 ? this.velocityY_ : 0;
        this.prevDeltaX_ = deltaX;
        this.prevDeltaY_ = deltaY;
        this.prevTime_ = this.lastTime_;
      }

      var startSq = this.sqDist_(
      this.startX1_,
      this.startX2_,
      this.startY1_,
      this.startY2_);

      var lastSq = this.sqDist_(
      this.lastX1_,
      this.lastX2_,
      this.lastY1_,
      this.lastY2_);

      this.signalEmit(
      {
        first: first,
        last: last,
        time: this.lastTime_,
        centerClientX: this.centerClientX_,
        centerClientY: this.centerClientY_,
        dir: Math.sign(lastSq - startSq),
        deltaX: deltaX * 0.5,
        deltaY: deltaY * 0.5,
        velocityX: this.velocityX_ * 0.5,
        velocityY: this.velocityY_ * 0.5 },

      event);

    }

    /**
     * @param {?Event} event
     * @private
     */ }, { key: "end_", value:
    function end_(event) {
      if (this.eventing_) {
        this.eventing_ = false;
        this.emit_(false, true, event);
        this.signalEnd();
      }
    }

    /**
     * @param {number} x1
     * @param {number} x2
     * @param {number} y1
     * @param {number} y2
     * @return {number}
     * @private
     */ }, { key: "sqDist_", value:
    function sqDist_(x1, x2, y1, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }

    /**
     * @return {number}
     * @private
     */ }, { key: "deltaX_", value:
    function deltaX_() {
      return Math.abs(
      this.lastX1_ - this.startX1_ - (this.lastX2_ - this.startX2_));

    }

    /**
     * @return {number}
     * @private
     */ }, { key: "deltaY_", value:
    function deltaY_() {
      return Math.abs(
      this.lastY1_ - this.startY1_ - (this.lastY2_ - this.startY2_));

    } }]);return PinchRecognizer;}(GestureRecognizer);
// /Users/mszylkowski/src/amphtml/src/gesture-recognizers.js