function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
export var TapRecognizer = /*#__PURE__*/function (_GestureRecognizer) {
  _inherits(TapRecognizer, _GestureRecognizer);

  var _super = _createSuper(TapRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function TapRecognizer(manager) {
    var _this;

    _classCallCheck(this, TapRecognizer);

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
    _this.target_ = null;
    return _this;
  }

  /** @override */
  _createClass(TapRecognizer, [{
    key: "onTouchStart",
    value: function onTouchStart(e) {
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
    /** @override */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
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
    /** @override */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(unusedE) {
      this.signalReady(0);
    }
    /** @override */

  }, {
    key: "acceptStart",
    value: function acceptStart() {
      this.signalEmit({
        clientX: this.lastX_,
        clientY: this.lastY_,
        target: this.target_
      }, null);
      this.signalEnd();
    }
  }]);

  return TapRecognizer;
}(GestureRecognizer);

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
export var DoubletapRecognizer = /*#__PURE__*/function (_GestureRecognizer2) {
  _inherits(DoubletapRecognizer, _GestureRecognizer2);

  var _super2 = _createSuper(DoubletapRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function DoubletapRecognizer(manager) {
    var _this2;

    _classCallCheck(this, DoubletapRecognizer);

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
    _this2.event_ = null;
    return _this2;
  }

  /** @override */
  _createClass(DoubletapRecognizer, [{
    key: "onTouchStart",
    value: function onTouchStart(e) {
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
    /** @override */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
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
    /** @override */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      this.tapCount_++;

      if (this.tapCount_ < 2) {
        this.signalPending(DOUBLETAP_DELAY);
      } else {
        this.event_ = e;
        this.signalReady(0);
      }
    }
    /** @override */

  }, {
    key: "acceptStart",
    value: function acceptStart() {
      this.tapCount_ = 0;
      this.signalEmit({
        clientX: this.lastX_,
        clientY: this.lastY_
      }, this.event_);
      this.signalEnd();
    }
    /** @override */

  }, {
    key: "acceptCancel",
    value: function acceptCancel() {
      this.tapCount_ = 0;
    }
  }]);

  return DoubletapRecognizer;
}(GestureRecognizer);

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
 */
var SwipeRecognizer = /*#__PURE__*/function (_GestureRecognizer3) {
  _inherits(SwipeRecognizer, _GestureRecognizer3);

  var _super3 = _createSuper(SwipeRecognizer);

  /**
   * @param {string} type
   * @param {!./gesture.Gestures} manager
   * @param {boolean} horiz
   * @param {boolean} vert
   */
  function SwipeRecognizer(type, manager, horiz, vert) {
    var _this3;

    _classCallCheck(this, SwipeRecognizer);

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
    _this3.velocityY_ = 0;
    return _this3;
  }

  /** @override */
  _createClass(SwipeRecognizer, [{
    key: "onTouchStart",
    value: function onTouchStart(e) {
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
    /** @override */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      var touches = e.touches;

      if (touches && touches.length >= 1) {
        var _touches$ = touches[0],
            x = _touches$.clientX,
            y = _touches$.clientY;
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
    /** @override */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      var touches = e.touches;

      // Number of current touches on the page
      if (touches && touches.length == 0) {
        this.end_(e);
      }
    }
    /** @override */

  }, {
    key: "acceptStart",
    value: function acceptStart() {
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
    /** @override */

  }, {
    key: "acceptCancel",
    value: function acceptCancel() {
      this.eventing_ = false;
    }
    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */

  }, {
    key: "emit_",
    value: function emit_(first, last, event) {
      this.lastTime_ = Date.now();
      var deltaTime = this.lastTime_ - this.prevTime_;

      // It's often that `touchend` arrives on the next frame. These should
      // be ignored to avoid a significant velocity downgrade.
      if (!last && deltaTime > 4 || last && deltaTime > 16) {
        var velocityX = calcVelocity(this.lastX_ - this.prevX_, deltaTime, this.velocityX_);
        var velocityY = calcVelocity(this.lastY_ - this.prevY_, deltaTime, this.velocityY_);

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

      this.signalEmit({
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
        velocityY: this.velocityY_
      }, event);
    }
    /**
     * @param {?Event} event
     * @private
     */

  }, {
    key: "end_",
    value: function end_(event) {
      if (this.eventing_) {
        this.eventing_ = false;
        this.emit_(false, true, event);
        this.signalEnd();
      }
    }
  }]);

  return SwipeRecognizer;
}(GestureRecognizer);

/**
 * Recognizes "swipe-xy" gesture. Yields about 10ms to other gestures.
 */
export var SwipeXYRecognizer = /*#__PURE__*/function (_SwipeRecognizer) {
  _inherits(SwipeXYRecognizer, _SwipeRecognizer);

  var _super4 = _createSuper(SwipeXYRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeXYRecognizer(manager) {
    _classCallCheck(this, SwipeXYRecognizer);

    return _super4.call(this, 'swipe-xy', manager, true, true);
  }

  return SwipeXYRecognizer;
}(SwipeRecognizer);

/**
 * Recognizes "swipe-x" gesture. Yields about 10ms to other gestures.
 */
export var SwipeXRecognizer = /*#__PURE__*/function (_SwipeRecognizer2) {
  _inherits(SwipeXRecognizer, _SwipeRecognizer2);

  var _super5 = _createSuper(SwipeXRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeXRecognizer(manager) {
    _classCallCheck(this, SwipeXRecognizer);

    return _super5.call(this, 'swipe-x', manager, true, false);
  }

  return SwipeXRecognizer;
}(SwipeRecognizer);

/**
 * Recognizes "swipe-y" gesture. Yields about 10ms to other gestures.
 */
export var SwipeYRecognizer = /*#__PURE__*/function (_SwipeRecognizer3) {
  _inherits(SwipeYRecognizer, _SwipeRecognizer3);

  var _super6 = _createSuper(SwipeYRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function SwipeYRecognizer(manager) {
    _classCallCheck(this, SwipeYRecognizer);

    return _super6.call(this, 'swipe-y', manager, false, true);
  }

  return SwipeYRecognizer;
}(SwipeRecognizer);

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
export var TapzoomRecognizer = /*#__PURE__*/function (_GestureRecognizer4) {
  _inherits(TapzoomRecognizer, _GestureRecognizer4);

  var _super7 = _createSuper(TapzoomRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function TapzoomRecognizer(manager) {
    var _this4;

    _classCallCheck(this, TapzoomRecognizer);

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
    _this4.velocityY_ = 0;
    return _this4;
  }

  /** @override */
  _createClass(TapzoomRecognizer, [{
    key: "onTouchStart",
    value: function onTouchStart(e) {
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
    /** @override */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
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
    /** @override */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
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
    /** @override */

  }, {
    key: "acceptStart",
    value: function acceptStart() {
      this.tapCount_ = 0;
      this.eventing_ = true;
      this.emit_(true, false, null);
    }
    /** @override */

  }, {
    key: "acceptCancel",
    value: function acceptCancel() {
      this.tapCount_ = 0;
      this.eventing_ = false;
    }
    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */

  }, {
    key: "emit_",
    value: function emit_(first, last, event) {
      this.lastTime_ = Date.now();

      if (first) {
        this.velocityX_ = this.velocityY_ = 0;
      } else if (this.lastTime_ - this.prevTime_ > 2) {
        this.velocityX_ = calcVelocity(this.lastX_ - this.prevX_, this.lastTime_ - this.prevTime_, this.velocityX_);
        this.velocityY_ = calcVelocity(this.lastY_ - this.prevY_, this.lastTime_ - this.prevTime_, this.velocityY_);
      }

      this.prevX_ = this.lastX_;
      this.prevY_ = this.lastY_;
      this.prevTime_ = this.lastTime_;
      this.signalEmit({
        first: first,
        last: last,
        centerClientX: this.startX_,
        centerClientY: this.startY_,
        deltaX: this.lastX_ - this.startX_,
        deltaY: this.lastY_ - this.startY_,
        velocityX: this.velocityX_,
        velocityY: this.velocityY_
      }, event);
    }
    /**
     * @param {?Event} event
     * @private
     */

  }, {
    key: "end_",
    value: function end_(event) {
      if (this.eventing_) {
        this.eventing_ = false;
        this.emit_(false, true, event);
        this.signalEnd();
      }
    }
  }]);

  return TapzoomRecognizer;
}(GestureRecognizer);

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
export var PinchRecognizer = /*#__PURE__*/function (_GestureRecognizer5) {
  _inherits(PinchRecognizer, _GestureRecognizer5);

  var _super8 = _createSuper(PinchRecognizer);

  /**
   * @param {!./gesture.Gestures} manager
   */
  function PinchRecognizer(manager) {
    var _this5;

    _classCallCheck(this, PinchRecognizer);

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
    _this5.velocityY_ = 0;
    return _this5;
  }

  /** @override */
  _createClass(PinchRecognizer, [{
    key: "onTouchStart",
    value: function onTouchStart(e) {
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
    /** @override */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
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
     */

  }, {
    key: "isPinchReady_",
    value: function isPinchReady_() {
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
     */

  }, {
    key: "isPinchRejected_",
    value: function isPinchRejected_() {
      var dx1 = this.lastX1_ - this.startX1_;
      var dy1 = this.lastY1_ - this.startY1_;
      var dx2 = this.lastX2_ - this.startX2_;
      var dy2 = this.lastY2_ - this.startY2_;
      var pinchDirectionIncorrect = dx1 * dx2 > 0 || dy1 * dy2 > 0;
      var xPinchRejected = Math.abs(dx1 + dx2) >= PINCH_REJECT_THRESHOLD;
      var yPinchRejected = Math.abs(dy1 + dy2) >= PINCH_REJECT_THRESHOLD;
      return pinchDirectionIncorrect && (xPinchRejected || yPinchRejected);
    }
    /** @override */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      // Pinch requires at least two touches on the page
      var touches = e.touches;

      if (touches && touches.length < 2) {
        this.end_(e);
      }
    }
    /** @override */

  }, {
    key: "acceptStart",
    value: function acceptStart() {
      this.eventing_ = true;
      this.prevTime_ = this.startTime_;
      this.prevDeltaX_ = 0;
      this.prevDeltaY_ = 0;
      this.centerClientX_ = (this.startX1_ + this.startX2_) * 0.5;
      this.centerClientY_ = (this.startY1_ + this.startY2_) * 0.5;
      this.emit_(true, false, null);
    }
    /** @override */

  }, {
    key: "acceptCancel",
    value: function acceptCancel() {
      this.eventing_ = false;
    }
    /**
     * @param {boolean} first
     * @param {boolean} last
     * @param {?Event} event
     * @private
     */

  }, {
    key: "emit_",
    value: function emit_(first, last, event) {
      this.lastTime_ = Date.now();
      var deltaTime = this.lastTime_ - this.prevTime_;
      var deltaX = this.deltaX_();
      var deltaY = this.deltaY_();

      // It's often that `touchend` arrives on the next frame. These should
      // be ignored to avoid a significant velocity downgrade.
      if (!last && deltaTime > 4 || last && deltaTime > 16) {
        this.velocityX_ = calcVelocity(deltaX - this.prevDeltaX_, deltaTime, this.velocityX_);
        this.velocityY_ = calcVelocity(deltaY - this.prevDeltaY_, deltaTime, this.velocityY_);
        this.velocityX_ = Math.abs(this.velocityX_) > 1e-4 ? this.velocityX_ : 0;
        this.velocityY_ = Math.abs(this.velocityY_) > 1e-4 ? this.velocityY_ : 0;
        this.prevDeltaX_ = deltaX;
        this.prevDeltaY_ = deltaY;
        this.prevTime_ = this.lastTime_;
      }

      var startSq = this.sqDist_(this.startX1_, this.startX2_, this.startY1_, this.startY2_);
      var lastSq = this.sqDist_(this.lastX1_, this.lastX2_, this.lastY1_, this.lastY2_);
      this.signalEmit({
        first: first,
        last: last,
        time: this.lastTime_,
        centerClientX: this.centerClientX_,
        centerClientY: this.centerClientY_,
        dir: Math.sign(lastSq - startSq),
        deltaX: deltaX * 0.5,
        deltaY: deltaY * 0.5,
        velocityX: this.velocityX_ * 0.5,
        velocityY: this.velocityY_ * 0.5
      }, event);
    }
    /**
     * @param {?Event} event
     * @private
     */

  }, {
    key: "end_",
    value: function end_(event) {
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
     */

  }, {
    key: "sqDist_",
    value: function sqDist_(x1, x2, y1, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }
    /**
     * @return {number}
     * @private
     */

  }, {
    key: "deltaX_",
    value: function deltaX_() {
      return Math.abs(this.lastX1_ - this.startX1_ - (this.lastX2_ - this.startX2_));
    }
    /**
     * @return {number}
     * @private
     */

  }, {
    key: "deltaY_",
    value: function deltaY_() {
      return Math.abs(this.lastY1_ - this.startY1_ - (this.lastY2_ - this.startY2_));
    }
  }]);

  return PinchRecognizer;
}(GestureRecognizer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdlc3R1cmUtcmVjb2duaXplcnMuanMiXSwibmFtZXMiOlsiR2VzdHVyZVJlY29nbml6ZXIiLCJjYWxjVmVsb2NpdHkiLCJET1VCTEVUQVBfREVMQVkiLCJUYXBEZWYiLCJUYXBSZWNvZ25pemVyIiwibWFuYWdlciIsInN0YXJ0WF8iLCJzdGFydFlfIiwibGFzdFhfIiwibGFzdFlfIiwidGFyZ2V0XyIsImUiLCJ0b3VjaGVzIiwidGFyZ2V0IiwibGVuZ3RoIiwiY2xpZW50WCIsImNsaWVudFkiLCJjaGFuZ2VkVG91Y2hlcyIsImR4IiwiTWF0aCIsImFicyIsImR5IiwidW51c2VkRSIsInNpZ25hbFJlYWR5Iiwic2lnbmFsRW1pdCIsInNpZ25hbEVuZCIsIkRvdWJsZXRhcERlZiIsIkRvdWJsZXRhcFJlY29nbml6ZXIiLCJ0YXBDb3VudF8iLCJldmVudF8iLCJhY2NlcHRDYW5jZWwiLCJzaWduYWxQZW5kaW5nIiwiU3dpcGVEZWYiLCJTd2lwZVJlY29nbml6ZXIiLCJ0eXBlIiwiaG9yaXoiLCJ2ZXJ0IiwiaG9yaXpfIiwidmVydF8iLCJldmVudGluZ18iLCJwcmV2WF8iLCJwcmV2WV8iLCJzdGFydFRpbWVfIiwibGFzdFRpbWVfIiwicHJldlRpbWVfIiwidmVsb2NpdHlYXyIsInZlbG9jaXR5WV8iLCJEYXRlIiwibm93IiwieCIsInkiLCJlbWl0XyIsImVuZF8iLCJmaXJzdCIsImxhc3QiLCJldmVudCIsImRlbHRhVGltZSIsInZlbG9jaXR5WCIsInZlbG9jaXR5WSIsInRpbWUiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJsYXN0WCIsImxhc3RZIiwiU3dpcGVYWVJlY29nbml6ZXIiLCJTd2lwZVhSZWNvZ25pemVyIiwiU3dpcGVZUmVjb2duaXplciIsIlRhcHpvb21EZWYiLCJUYXB6b29tUmVjb2duaXplciIsImNlbnRlckNsaWVudFgiLCJjZW50ZXJDbGllbnRZIiwiUGluY2hEZWYiLCJQSU5DSF9BQ0NFUFRfVEhSRVNIT0xEIiwiUElOQ0hfUkVKRUNUX1RIUkVTSE9MRCIsIlBpbmNoUmVjb2duaXplciIsInN0YXJ0WDFfIiwic3RhcnRZMV8iLCJzdGFydFgyXyIsInN0YXJ0WTJfIiwibGFzdFgxXyIsImxhc3RZMV8iLCJsYXN0WDJfIiwibGFzdFkyXyIsInByZXZEZWx0YVhfIiwicHJldkRlbHRhWV8iLCJjZW50ZXJDbGllbnRYXyIsImNlbnRlckNsaWVudFlfIiwiaXNQaW5jaFJlamVjdGVkXyIsImlzUGluY2hSZWFkeV8iLCJkeDEiLCJkeTEiLCJkeDIiLCJkeTIiLCJwaW5jaERpcmVjdGlvbkNvcnJlY3QiLCJ4UGluY2hSZWNvZ25pemVkIiwieVBpbmNoUmVjb2duaXplZCIsInBpbmNoRGlyZWN0aW9uSW5jb3JyZWN0IiwieFBpbmNoUmVqZWN0ZWQiLCJ5UGluY2hSZWplY3RlZCIsImRlbHRhWF8iLCJkZWx0YVlfIiwic3RhcnRTcSIsInNxRGlzdF8iLCJsYXN0U3EiLCJkaXIiLCJzaWduIiwieDEiLCJ4MiIsInkxIiwieTIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsaUJBQVI7QUFDQSxTQUFRQyxZQUFSO0FBRUEsSUFBTUMsZUFBZSxHQUFHLEdBQXhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxNQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsYUFBYjtBQUFBOztBQUFBOztBQUNFO0FBQ0Y7QUFDQTtBQUNFLHlCQUFZQyxPQUFaLEVBQXFCO0FBQUE7O0FBQUE7O0FBQ25CLDhCQUFNLEtBQU4sRUFBYUEsT0FBYjs7QUFFQTtBQUNBLFVBQUtDLE9BQUwsR0FBZSxDQUFmOztBQUVBO0FBQ0EsVUFBS0MsT0FBTCxHQUFlLENBQWY7O0FBRUE7QUFDQSxVQUFLQyxNQUFMLEdBQWMsQ0FBZDs7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QUtBLEtBQUwsRUFBWTtBQUNWLFVBQUksS0FBS2hCLFNBQVQsRUFBb0I7QUFDbEIsYUFBS0EsU0FBTCxHQUFpQixLQUFqQjtBQUNBLGFBQUtZLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCSSxLQUF4QjtBQUNBLGFBQUs5QixTQUFMO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNVBBO0FBQUE7QUFBQSxXQTZQRSxpQkFBUW1GLEVBQVIsRUFBWUMsRUFBWixFQUFnQkMsRUFBaEIsRUFBb0JDLEVBQXBCLEVBQXdCO0FBQ3RCLGFBQU8sQ0FBQ0gsRUFBRSxHQUFHQyxFQUFOLEtBQWFELEVBQUUsR0FBR0MsRUFBbEIsSUFBd0IsQ0FBQ0MsRUFBRSxHQUFHQyxFQUFOLEtBQWFELEVBQUUsR0FBR0MsRUFBbEIsQ0FBL0I7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXBRQTtBQUFBO0FBQUEsV0FxUUUsbUJBQVU7QUFDUixhQUFPNUYsSUFBSSxDQUFDQyxHQUFMLENBQ0wsS0FBSzZELE9BQUwsR0FBZSxLQUFLSixRQUFwQixJQUFnQyxLQUFLTSxPQUFMLEdBQWUsS0FBS0osUUFBcEQsQ0FESyxDQUFQO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE5UUE7QUFBQTtBQUFBLFdBK1FFLG1CQUFVO0FBQ1IsYUFBTzVELElBQUksQ0FBQ0MsR0FBTCxDQUNMLEtBQUs4RCxPQUFMLEdBQWUsS0FBS0osUUFBcEIsSUFBZ0MsS0FBS00sT0FBTCxHQUFlLEtBQUtKLFFBQXBELENBREssQ0FBUDtBQUdEO0FBblJIOztBQUFBO0FBQUEsRUFBcUNoRixpQkFBckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtHZXN0dXJlUmVjb2duaXplcn0gZnJvbSAnLi9nZXN0dXJlJztcbmltcG9ydCB7Y2FsY1ZlbG9jaXR5fSBmcm9tICcuL21vdGlvbic7XG5cbmNvbnN0IERPVUJMRVRBUF9ERUxBWSA9IDIwMDtcblxuLyoqXG4gKiBBIFwidGFwXCIgZ2VzdHVyZS5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGNsaWVudFg6IG51bWJlcixcbiAqICAgY2xpZW50WTogbnVtYmVyXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFRhcERlZjtcblxuLyoqXG4gKiBSZWNvZ25pemVzIFwidGFwXCIgZ2VzdHVyZXMuXG4gKiBAZXh0ZW5kcyB7R2VzdHVyZVJlY29nbml6ZXI8VGFwRGVmPn1cbiAqL1xuZXhwb3J0IGNsYXNzIFRhcFJlY29nbml6ZXIgZXh0ZW5kcyBHZXN0dXJlUmVjb2duaXplciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2dlc3R1cmUuR2VzdHVyZXN9IG1hbmFnZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1hbmFnZXIpIHtcbiAgICBzdXBlcigndGFwJywgbWFuYWdlcik7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnN0YXJ0WF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFlfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFlfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0V2ZW50VGFyZ2V0fSAqL1xuICAgIHRoaXMudGFyZ2V0XyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVG91Y2hTdGFydChlKSB7XG4gICAgY29uc3Qge3RvdWNoZXN9ID0gZTtcbiAgICB0aGlzLnRhcmdldF8gPSBlLnRhcmdldDtcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICB0aGlzLnN0YXJ0WF8gPSB0b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICB0aGlzLnN0YXJ0WV8gPSB0b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Ub3VjaE1vdmUoZSkge1xuICAgIGNvbnN0IHRvdWNoZXMgPSBlLmNoYW5nZWRUb3VjaGVzIHx8IGUudG91Y2hlcztcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICB0aGlzLmxhc3RYXyA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIHRoaXMubGFzdFlfID0gdG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgY29uc3QgZHggPSBNYXRoLmFicyh0aGlzLmxhc3RYXyAtIHRoaXMuc3RhcnRYXykgPj0gODtcbiAgICAgIGNvbnN0IGR5ID0gTWF0aC5hYnModGhpcy5sYXN0WV8gLSB0aGlzLnN0YXJ0WV8pID49IDg7XG4gICAgICBpZiAoZHggfHwgZHkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Ub3VjaEVuZCh1bnVzZWRFKSB7XG4gICAgdGhpcy5zaWduYWxSZWFkeSgwKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0U3RhcnQoKSB7XG4gICAgdGhpcy5zaWduYWxFbWl0KFxuICAgICAge1xuICAgICAgICBjbGllbnRYOiB0aGlzLmxhc3RYXyxcbiAgICAgICAgY2xpZW50WTogdGhpcy5sYXN0WV8sXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXRfLFxuICAgICAgfSxcbiAgICAgIG51bGxcbiAgICApO1xuICAgIHRoaXMuc2lnbmFsRW5kKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIFwiZG91YmxldGFwXCIgZ2VzdHVyZS5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGNsaWVudFg6IG51bWJlcixcbiAqICAgY2xpZW50WTogbnVtYmVyXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IERvdWJsZXRhcERlZjtcblxuLyoqXG4gKiBSZWNvZ25pemVzIGEgXCJkb3VibGV0YXBcIiBnZXN0dXJlLiBUaGlzIGdlc3R1cmUgd2lsbCBibG9jayBhIHNpbmdsZSBcInRhcFwiXG4gKiBmb3IgYWJvdXQgMjAwbXMgd2hpbGUgaXQncyBleHBlY3RpbmcgdGhlIHNlY29uZCBcInRhcFwiLlxuICogQGV4dGVuZHMge0dlc3R1cmVSZWNvZ25pemVyPERvdWJsZXRhcERlZj59XG4gKi9cbmV4cG9ydCBjbGFzcyBEb3VibGV0YXBSZWNvZ25pemVyIGV4dGVuZHMgR2VzdHVyZVJlY29nbml6ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9nZXN0dXJlLkdlc3R1cmVzfSBtYW5hZ2VyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtYW5hZ2VyKSB7XG4gICAgc3VwZXIoJ2RvdWJsZXRhcCcsIG1hbmFnZXIpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRZXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RYXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RZXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnRhcENvdW50XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgez9FdmVudH0gKi9cbiAgICB0aGlzLmV2ZW50XyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKHRoaXMudGFwQ291bnRfID4gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB7dG91Y2hlc30gPSBlO1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMuc3RhcnRYXyA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIHRoaXMuc3RhcnRZXyA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgIHRoaXMubGFzdFhfID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgdGhpcy5sYXN0WV8gPSB0b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Ub3VjaE1vdmUoZSkge1xuICAgIGNvbnN0IHt0b3VjaGVzfSA9IGU7XG4gICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5sYXN0WF8gPSB0b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICB0aGlzLmxhc3RZXyA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnModGhpcy5sYXN0WF8gLSB0aGlzLnN0YXJ0WF8pID49IDg7XG4gICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHRoaXMubGFzdFlfIC0gdGhpcy5zdGFydFlfKSA+PSA4O1xuICAgICAgaWYgKGR4IHx8IGR5KSB7XG4gICAgICAgIHRoaXMuYWNjZXB0Q2FuY2VsKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRvdWNoRW5kKGUpIHtcbiAgICB0aGlzLnRhcENvdW50XysrO1xuICAgIGlmICh0aGlzLnRhcENvdW50XyA8IDIpIHtcbiAgICAgIHRoaXMuc2lnbmFsUGVuZGluZyhET1VCTEVUQVBfREVMQVkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmV2ZW50XyA9IGU7XG4gICAgICB0aGlzLnNpZ25hbFJlYWR5KDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0U3RhcnQoKSB7XG4gICAgdGhpcy50YXBDb3VudF8gPSAwO1xuICAgIHRoaXMuc2lnbmFsRW1pdCh7Y2xpZW50WDogdGhpcy5sYXN0WF8sIGNsaWVudFk6IHRoaXMubGFzdFlffSwgdGhpcy5ldmVudF8pO1xuICAgIHRoaXMuc2lnbmFsRW5kKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFjY2VwdENhbmNlbCgpIHtcbiAgICB0aGlzLnRhcENvdW50XyA9IDA7XG4gIH1cbn1cblxuLyoqXG4gKiBBIFwic3dpcGUteHlcIiwgXCJzd2lwZS14XCIgb3IgXCJzd2lwZS15XCIgZ2VzdHVyZS4gQSBudW1iZXIgb2YgdGhlc2UgZ2VzdHVyZXNcbiAqIG1heSBiZSBlbWl0dGVkIGZvciBhIHNpbmdsZSB0b3VjaCBzZXJpZXMuXG4gKiBAdHlwZWRlZiB7e1xuICogICBmaXJzdDogYm9vbGVhbixcbiAqICAgbGFzdDogYm9vbGVhbixcbiAqICAgZGVsdGFYOiBudW1iZXIsXG4gKiAgIGRlbHRhWTogbnVtYmVyLFxuICogICB2ZWxvY2l0eVg6IG51bWJlcixcbiAqICAgdmVsb2NpdHlZOiBudW1iZXJcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgU3dpcGVEZWY7XG5cbi8qKlxuICogUmVjb2duaXplcyBzd2lwZSBnZXN0dXJlcy4gVGhpcyBnZXN0dXJlIHdpbGwgeWllbGQgYWJvdXQgMTBtcyB0byBvdGhlclxuICogZ2VzdHVyZXMuXG4gKiBAZXh0ZW5kcyB7R2VzdHVyZVJlY29nbml6ZXI8U3dpcGVEZWY+fVxuICovXG5jbGFzcyBTd2lwZVJlY29nbml6ZXIgZXh0ZW5kcyBHZXN0dXJlUmVjb2duaXplciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0geyEuL2dlc3R1cmUuR2VzdHVyZXN9IG1hbmFnZXJcbiAgICogQHBhcmFtIHtib29sZWFufSBob3JpelxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZlcnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHR5cGUsIG1hbmFnZXIsIGhvcml6LCB2ZXJ0KSB7XG4gICAgc3VwZXIodHlwZSwgbWFuYWdlcik7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5ob3Jpel8gPSBob3JpejtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnZlcnRfID0gdmVydDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmV2ZW50aW5nXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRZXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RYXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RZXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnByZXZYXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnByZXZZXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge3RpbWV9ICovXG4gICAgdGhpcy5zdGFydFRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gKi9cbiAgICB0aGlzLmxhc3RUaW1lXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge3RpbWV9ICovXG4gICAgdGhpcy5wcmV2VGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy52ZWxvY2l0eVhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudmVsb2NpdHlZXyA9IDA7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVG91Y2hTdGFydChlKSB7XG4gICAgY29uc3Qge3RvdWNoZXN9ID0gZTtcbiAgICAvLyBJZiBhbHJlYWR5IGV2ZW50aW5nLCBpZ25vcmUgYWRkaXRpb25hbCB0b3VjaGVzXG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfICYmIHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5zdGFydFRpbWVfID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMuc3RhcnRYXyA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIHRoaXMuc3RhcnRZXyA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRvdWNoTW92ZShlKSB7XG4gICAgY29uc3Qge3RvdWNoZXN9ID0gZTtcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA+PSAxKSB7XG4gICAgICBjb25zdCB7Y2xpZW50WDogeCwgY2xpZW50WTogeX0gPSB0b3VjaGVzWzBdO1xuICAgICAgdGhpcy5sYXN0WF8gPSB4O1xuICAgICAgdGhpcy5sYXN0WV8gPSB5O1xuICAgICAgaWYgKHRoaXMuZXZlbnRpbmdfKSB7XG4gICAgICAgIC8vIElmIGFscmVhZHkgZXZlbnRpbmcsIGFsd2F5cyBlbWl0IG5ldyBjb29yZGluYXRlc1xuICAgICAgICB0aGlzLmVtaXRfKGZhbHNlLCBmYWxzZSwgZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaWd1cmUgb3V0IHdoZXRoZXIgb3Igbm90IHdlIHNob3VsZCBzdGFydCBldmVudGluZ1xuICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHggLSB0aGlzLnN0YXJ0WF8pO1xuICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHkgLSB0aGlzLnN0YXJ0WV8pO1xuICAgICAgICAvLyBTd2lwZSBpcyBwZW5hbGl6ZWQgc2xpZ2h0bHkgc2luY2UgaXQncyBvbmUgb2YgdGhlIGxlYXN0IGRlbWFuZGluZ1xuICAgICAgICAvLyBnZXN0dXJlLCB0aHVzIC0xMCBpbiBzaWduYWxSZWFkeS5cbiAgICAgICAgaWYgKHRoaXMuaG9yaXpfICYmIHRoaXMudmVydF8pIHtcbiAgICAgICAgICBpZiAoZHggPj0gOCB8fCBkeSA+PSA4KSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbFJlYWR5KC0xMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaG9yaXpfKSB7XG4gICAgICAgICAgaWYgKGR4ID49IDggJiYgZHggPiBkeSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxSZWFkeSgtMTApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZHkgPj0gOCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZlcnRfKSB7XG4gICAgICAgICAgaWYgKGR5ID49IDggJiYgZHkgPiBkeCkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxSZWFkeSgtMTApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZHggPj0gOCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRvdWNoRW5kKGUpIHtcbiAgICBjb25zdCB7dG91Y2hlc30gPSBlO1xuICAgIC8vIE51bWJlciBvZiBjdXJyZW50IHRvdWNoZXMgb24gdGhlIHBhZ2VcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aGlzLmVuZF8oZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhY2NlcHRTdGFydCgpIHtcbiAgICB0aGlzLmV2ZW50aW5nXyA9IHRydWU7XG4gICAgLy8gUmVzZXQgc3RhcnQgY29vcmRpbmF0ZXMgdG8gd2hlcmUgdGhlIGdlc3R1cmUgYmVnYW4gdG8gYXZvaWQgdmlzaWJsZVxuICAgIC8vIGp1bXAsIGJ1dCBwcmVzZXJ2ZSB0aGVtIGFzIFwicHJldlwiIGNvb3JkaW5hdGVzIHRvIGNhbGN1bGF0ZSB0aGUgcmlnaHRcbiAgICAvLyB2ZWxvY2l0eS5cbiAgICB0aGlzLnByZXZYXyA9IHRoaXMuc3RhcnRYXztcbiAgICB0aGlzLnByZXZZXyA9IHRoaXMuc3RhcnRZXztcbiAgICB0aGlzLnByZXZUaW1lXyA9IHRoaXMuc3RhcnRUaW1lXztcbiAgICB0aGlzLnN0YXJ0WF8gPSB0aGlzLmxhc3RYXztcbiAgICB0aGlzLnN0YXJ0WV8gPSB0aGlzLmxhc3RZXztcbiAgICB0aGlzLmVtaXRfKHRydWUsIGZhbHNlLCBudWxsKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0Q2FuY2VsKCkge1xuICAgIHRoaXMuZXZlbnRpbmdfID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBmaXJzdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxhc3RcbiAgICogQHBhcmFtIHs/RXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0XyhmaXJzdCwgbGFzdCwgZXZlbnQpIHtcbiAgICB0aGlzLmxhc3RUaW1lXyA9IERhdGUubm93KCk7XG4gICAgY29uc3QgZGVsdGFUaW1lID0gdGhpcy5sYXN0VGltZV8gLSB0aGlzLnByZXZUaW1lXztcbiAgICAvLyBJdCdzIG9mdGVuIHRoYXQgYHRvdWNoZW5kYCBhcnJpdmVzIG9uIHRoZSBuZXh0IGZyYW1lLiBUaGVzZSBzaG91bGRcbiAgICAvLyBiZSBpZ25vcmVkIHRvIGF2b2lkIGEgc2lnbmlmaWNhbnQgdmVsb2NpdHkgZG93bmdyYWRlLlxuICAgIGlmICgoIWxhc3QgJiYgZGVsdGFUaW1lID4gNCkgfHwgKGxhc3QgJiYgZGVsdGFUaW1lID4gMTYpKSB7XG4gICAgICBjb25zdCB2ZWxvY2l0eVggPSBjYWxjVmVsb2NpdHkoXG4gICAgICAgIHRoaXMubGFzdFhfIC0gdGhpcy5wcmV2WF8sXG4gICAgICAgIGRlbHRhVGltZSxcbiAgICAgICAgdGhpcy52ZWxvY2l0eVhfXG4gICAgICApO1xuICAgICAgY29uc3QgdmVsb2NpdHlZID0gY2FsY1ZlbG9jaXR5KFxuICAgICAgICB0aGlzLmxhc3RZXyAtIHRoaXMucHJldllfLFxuICAgICAgICBkZWx0YVRpbWUsXG4gICAgICAgIHRoaXMudmVsb2NpdHlZX1xuICAgICAgKTtcblxuICAgICAgLy8gT24gaU9TLCB0aGUgdG91Y2hlbmQgd2lsbCBhbHdheXMgaGF2ZSB0aGUgc2FtZSB4L3kgcG9zaXRpb24gYXMgdGhlXG4gICAgICAvLyBsYXN0IHRvdWNobW92ZSwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmUgd2UgZG8gbm90IHJlbW92ZSB0aGUgdmVsb2NpdHkuXG4gICAgICAvLyBUaGUgdG91Y2hlbmQgZXZlbnQgd2l0aCB6ZXJvIHZlbG9jaXR5IGNhbiBvY2N1ciB3aXRoaW4gYSBjb3VwbGUgb2ZcbiAgICAgIC8vIGZyYW1lcyBvZiB0aGUgbGFzdCB0b3VjaG1vdmUuXG4gICAgICBpZiAoIWxhc3QgfHwgZGVsdGFUaW1lID4gMzIgfHwgdmVsb2NpdHlYICE9IDAgfHwgdmVsb2NpdHlZICE9IDApIHtcbiAgICAgICAgdGhpcy52ZWxvY2l0eVhfID0gTWF0aC5hYnModmVsb2NpdHlYKSA+IDFlLTQgPyB2ZWxvY2l0eVggOiAwO1xuICAgICAgICB0aGlzLnZlbG9jaXR5WV8gPSBNYXRoLmFicyh2ZWxvY2l0eVkpID4gMWUtNCA/IHZlbG9jaXR5WSA6IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJldlhfID0gdGhpcy5sYXN0WF87XG4gICAgICB0aGlzLnByZXZZXyA9IHRoaXMubGFzdFlfO1xuICAgICAgdGhpcy5wcmV2VGltZV8gPSB0aGlzLmxhc3RUaW1lXztcbiAgICB9XG5cbiAgICB0aGlzLnNpZ25hbEVtaXQoXG4gICAgICB7XG4gICAgICAgIGZpcnN0LFxuICAgICAgICBsYXN0LFxuICAgICAgICB0aW1lOiB0aGlzLmxhc3RUaW1lXyxcbiAgICAgICAgZGVsdGFYOiB0aGlzLmxhc3RYXyAtIHRoaXMuc3RhcnRYXyxcbiAgICAgICAgZGVsdGFZOiB0aGlzLmxhc3RZXyAtIHRoaXMuc3RhcnRZXyxcbiAgICAgICAgc3RhcnRYOiB0aGlzLnN0YXJ0WF8sXG4gICAgICAgIHN0YXJ0WTogdGhpcy5zdGFydFlfLFxuICAgICAgICBsYXN0WDogdGhpcy5sYXN0WF8sXG4gICAgICAgIGxhc3RZOiB0aGlzLmxhc3RZXyxcbiAgICAgICAgdmVsb2NpdHlYOiB0aGlzLnZlbG9jaXR5WF8sXG4gICAgICAgIHZlbG9jaXR5WTogdGhpcy52ZWxvY2l0eVlfLFxuICAgICAgfSxcbiAgICAgIGV2ZW50XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9FdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVuZF8oZXZlbnQpIHtcbiAgICBpZiAodGhpcy5ldmVudGluZ18pIHtcbiAgICAgIHRoaXMuZXZlbnRpbmdfID0gZmFsc2U7XG4gICAgICB0aGlzLmVtaXRfKGZhbHNlLCB0cnVlLCBldmVudCk7XG4gICAgICB0aGlzLnNpZ25hbEVuZCgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlY29nbml6ZXMgXCJzd2lwZS14eVwiIGdlc3R1cmUuIFlpZWxkcyBhYm91dCAxMG1zIHRvIG90aGVyIGdlc3R1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgU3dpcGVYWVJlY29nbml6ZXIgZXh0ZW5kcyBTd2lwZVJlY29nbml6ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9nZXN0dXJlLkdlc3R1cmVzfSBtYW5hZ2VyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtYW5hZ2VyKSB7XG4gICAgc3VwZXIoJ3N3aXBlLXh5JywgbWFuYWdlciwgdHJ1ZSwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWNvZ25pemVzIFwic3dpcGUteFwiIGdlc3R1cmUuIFlpZWxkcyBhYm91dCAxMG1zIHRvIG90aGVyIGdlc3R1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgU3dpcGVYUmVjb2duaXplciBleHRlbmRzIFN3aXBlUmVjb2duaXplciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2dlc3R1cmUuR2VzdHVyZXN9IG1hbmFnZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1hbmFnZXIpIHtcbiAgICBzdXBlcignc3dpcGUteCcsIG1hbmFnZXIsIHRydWUsIGZhbHNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY29nbml6ZXMgXCJzd2lwZS15XCIgZ2VzdHVyZS4gWWllbGRzIGFib3V0IDEwbXMgdG8gb3RoZXIgZ2VzdHVyZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTd2lwZVlSZWNvZ25pemVyIGV4dGVuZHMgU3dpcGVSZWNvZ25pemVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vZ2VzdHVyZS5HZXN0dXJlc30gbWFuYWdlclxuICAgKi9cbiAgY29uc3RydWN0b3IobWFuYWdlcikge1xuICAgIHN1cGVyKCdzd2lwZS15JywgbWFuYWdlciwgZmFsc2UsIHRydWUpO1xuICB9XG59XG5cbi8qKlxuICogQSBcInRhcHpvb21cIiBnZXN0dXJlLiBJdCBoYXMgYSBjZW50ZXIsIGRlbHRhIG9mZiB0aGUgY2VudGVyIGNlbnRlciBhbmRcbiAqIHRoZSB2ZWxvY2l0eSBvZiBtb3ZpbmcgYXdheSBmcm9tIHRoZSBjZW50ZXIuXG4gKiBAdHlwZWRlZiB7e1xuICogICBmaXJzdDogYm9vbGVhbixcbiAqICAgbGFzdDogYm9vbGVhbixcbiAqICAgY2VudGVyQ2xpZW50WDogbnVtYmVyLFxuICogICBjZW50ZXJDbGllbnRZOiBudW1iZXIsXG4gKiAgIGRlbHRhWDogbnVtYmVyLFxuICogICBkZWx0YVk6IG51bWJlcixcbiAqICAgdmVsb2NpdHlYOiBudW1iZXIsXG4gKiAgIHZlbG9jaXR5WTogbnVtYmVyXG4gKiB9fVxuICovXG5sZXQgVGFwem9vbURlZjtcblxuLyoqXG4gKiBSZWNvZ25pemVzIGEgXCJ0YXB6b29tXCIgZ2VzdHVyZS4gVGhpcyBnZXN0dXJlIHdpbGwgYmxvY2sgb3RoZXIgZ2VzdHVyZXNcbiAqIGZvciBhYm91dCA0MDBtcyBhZnRlciBmaXJzdCBcInRhcFwiIHdoaWxlIGl0J3MgZXhwZWN0aW5nIHN3aXBlLlxuICogQGV4dGVuZHMge0dlc3R1cmVSZWNvZ25pemVyPFRhcHpvb21EZWY+fVxuICovXG5leHBvcnQgY2xhc3MgVGFwem9vbVJlY29nbml6ZXIgZXh0ZW5kcyBHZXN0dXJlUmVjb2duaXplciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2dlc3R1cmUuR2VzdHVyZXN9IG1hbmFnZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1hbmFnZXIpIHtcbiAgICBzdXBlcigndGFwem9vbScsIG1hbmFnZXIpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuZXZlbnRpbmdfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnN0YXJ0WF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFlfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFlfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudGFwQ291bnRfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucHJldlhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucHJldllfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7dGltZX0gKi9cbiAgICB0aGlzLmxhc3RUaW1lXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge3RpbWV9ICovXG4gICAgdGhpcy5wcmV2VGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy52ZWxvY2l0eVhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudmVsb2NpdHlZXyA9IDA7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHt0b3VjaGVzfSA9IGU7XG4gICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5zdGFydFhfID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgdGhpcy5zdGFydFlfID0gdG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBjb25zdCB7dG91Y2hlc30gPSBlO1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMubGFzdFhfID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgdGhpcy5sYXN0WV8gPSB0b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICBpZiAodGhpcy5ldmVudGluZ18pIHtcbiAgICAgICAgdGhpcy5lbWl0XyhmYWxzZSwgZmFsc2UsIGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZHggPSBNYXRoLmFicyh0aGlzLmxhc3RYXyAtIHRoaXMuc3RhcnRYXykgPj0gODtcbiAgICAgICAgY29uc3QgZHkgPSBNYXRoLmFicyh0aGlzLmxhc3RZXyAtIHRoaXMuc3RhcnRZXykgPj0gODtcbiAgICAgICAgaWYgKGR4IHx8IGR5KSB7XG4gICAgICAgICAgaWYgKHRoaXMudGFwQ291bnRfID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZXB0Q2FuY2VsKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsUmVhZHkoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Ub3VjaEVuZChlKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfKSB7XG4gICAgICB0aGlzLmVuZF8oZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy50YXBDb3VudF8rKztcbiAgICBpZiAodGhpcy50YXBDb3VudF8gPT0gMSkge1xuICAgICAgdGhpcy5zaWduYWxQZW5kaW5nKDQwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hY2NlcHRDYW5jZWwoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0U3RhcnQoKSB7XG4gICAgdGhpcy50YXBDb3VudF8gPSAwO1xuICAgIHRoaXMuZXZlbnRpbmdfID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXRfKHRydWUsIGZhbHNlLCBudWxsKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0Q2FuY2VsKCkge1xuICAgIHRoaXMudGFwQ291bnRfID0gMDtcbiAgICB0aGlzLmV2ZW50aW5nXyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlyc3RcbiAgICogQHBhcmFtIHtib29sZWFufSBsYXN0XG4gICAqIEBwYXJhbSB7P0V2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdF8oZmlyc3QsIGxhc3QsIGV2ZW50KSB7XG4gICAgdGhpcy5sYXN0VGltZV8gPSBEYXRlLm5vdygpO1xuICAgIGlmIChmaXJzdCkge1xuICAgICAgdGhpcy52ZWxvY2l0eVhfID0gdGhpcy52ZWxvY2l0eVlfID0gMDtcbiAgICB9IGVsc2UgaWYgKHRoaXMubGFzdFRpbWVfIC0gdGhpcy5wcmV2VGltZV8gPiAyKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5WF8gPSBjYWxjVmVsb2NpdHkoXG4gICAgICAgIHRoaXMubGFzdFhfIC0gdGhpcy5wcmV2WF8sXG4gICAgICAgIHRoaXMubGFzdFRpbWVfIC0gdGhpcy5wcmV2VGltZV8sXG4gICAgICAgIHRoaXMudmVsb2NpdHlYX1xuICAgICAgKTtcbiAgICAgIHRoaXMudmVsb2NpdHlZXyA9IGNhbGNWZWxvY2l0eShcbiAgICAgICAgdGhpcy5sYXN0WV8gLSB0aGlzLnByZXZZXyxcbiAgICAgICAgdGhpcy5sYXN0VGltZV8gLSB0aGlzLnByZXZUaW1lXyxcbiAgICAgICAgdGhpcy52ZWxvY2l0eVlfXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLnByZXZYXyA9IHRoaXMubGFzdFhfO1xuICAgIHRoaXMucHJldllfID0gdGhpcy5sYXN0WV87XG4gICAgdGhpcy5wcmV2VGltZV8gPSB0aGlzLmxhc3RUaW1lXztcblxuICAgIHRoaXMuc2lnbmFsRW1pdChcbiAgICAgIHtcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGxhc3QsXG4gICAgICAgIGNlbnRlckNsaWVudFg6IHRoaXMuc3RhcnRYXyxcbiAgICAgICAgY2VudGVyQ2xpZW50WTogdGhpcy5zdGFydFlfLFxuICAgICAgICBkZWx0YVg6IHRoaXMubGFzdFhfIC0gdGhpcy5zdGFydFhfLFxuICAgICAgICBkZWx0YVk6IHRoaXMubGFzdFlfIC0gdGhpcy5zdGFydFlfLFxuICAgICAgICB2ZWxvY2l0eVg6IHRoaXMudmVsb2NpdHlYXyxcbiAgICAgICAgdmVsb2NpdHlZOiB0aGlzLnZlbG9jaXR5WV8sXG4gICAgICB9LFxuICAgICAgZXZlbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0V2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW5kXyhldmVudCkge1xuICAgIGlmICh0aGlzLmV2ZW50aW5nXykge1xuICAgICAgdGhpcy5ldmVudGluZ18gPSBmYWxzZTtcbiAgICAgIHRoaXMuZW1pdF8oZmFsc2UsIHRydWUsIGV2ZW50KTtcbiAgICAgIHRoaXMuc2lnbmFsRW5kKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSBcInBpbmNoXCIgZ2VzdHVyZS4gSXQgaGFzIGEgY2VudGVyLCBkZWx0YSBvZmYgdGhlIGNlbnRlciBjZW50ZXIgYW5kXG4gKiB0aGUgdmVsb2NpdHkgb2YgbW92aW5nIGF3YXkgZnJvbSB0aGUgY2VudGVyLiBcImRpclwiIGNvbXBvbmVudCBvZiBgMWBcbiAqIGluZGljYXRlcyB0aGF0IGl0J3MgYSBleHBhbmQgbW90aW9uIGFuZCBgLTFgIGluZGljYXRlcyBwaW5jaCBtb3Rpb24uXG4gKiBAdHlwZWRlZiB7e1xuICogICBmaXJzdDogYm9vbGVhbixcbiAqICAgbGFzdDogYm9vbGVhbixcbiAqICAgY2VudGVyQ2xpZW50WDogbnVtYmVyLFxuICogICBjZW50ZXJDbGllbnRZOiBudW1iZXIsXG4gKiAgIGRpcjogbnVtYmVyLFxuICogICBkZWx0YVg6IG51bWJlcixcbiAqICAgZGVsdGFZOiBudW1iZXIsXG4gKiAgIHZlbG9jaXR5WDogbnVtYmVyLFxuICogICB2ZWxvY2l0eVk6IG51bWJlclxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBQaW5jaERlZjtcblxuLyoqXG4gKiBUaHJlc2hvbGQgaW4gcGl4ZWxzIGZvciBob3cgbXVjaCB0d28gdG91Y2hlcyBtb3ZlIGF3YXkgZnJvbVxuICogZWFjaCBvdGhlciBiZWZvcmUgd2UgcmVjb2duaXplIHRoZSBnZXN0dXJlIGFzIGEgcGluY2guXG4gKi9cbmNvbnN0IFBJTkNIX0FDQ0VQVF9USFJFU0hPTEQgPSA0O1xuXG4vKipcbiAqIFRocmVzaG9sZCBpbiBwaXhlbHMgZm9yIGhvdyBtdWNoIHR3byB0b3VjaGVzIG1vdmUgaW4gdGhlIHNhbWVcbiAqIGRpcmVjdGlvbiBiZWZvcmUgd2UgcmVqZWN0IHRoZSBnZXN0dXJlIGFzIGEgcGluY2guXG4gKi9cbmNvbnN0IFBJTkNIX1JFSkVDVF9USFJFU0hPTEQgPSAxMDtcblxuLyoqXG4gKiBSZWNvZ25pemVzIGEgXCJwaW5jaFwiIGdlc3R1cmUuXG4gKiBAZXh0ZW5kcyB7R2VzdHVyZVJlY29nbml6ZXI8UGluY2hEZWY+fVxuICovXG5leHBvcnQgY2xhc3MgUGluY2hSZWNvZ25pemVyIGV4dGVuZHMgR2VzdHVyZVJlY29nbml6ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9nZXN0dXJlLkdlc3R1cmVzfSBtYW5hZ2VyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtYW5hZ2VyKSB7XG4gICAgc3VwZXIoJ3BpbmNoJywgbWFuYWdlcik7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5ldmVudGluZ18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRYMV8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRZMV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFgyXyA9IDA7XG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zdGFydFkyXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RYMV8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFkxXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmxhc3RYMl8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFkyXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnByZXZEZWx0YVhfID0gMDtcbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnByZXZEZWx0YVlfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuY2VudGVyQ2xpZW50WF8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuY2VudGVyQ2xpZW50WV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSAqL1xuICAgIHRoaXMuc3RhcnRUaW1lXyA9IDA7XG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSAqL1xuICAgIHRoaXMubGFzdFRpbWVfID0gMDtcbiAgICAvKiogQHByaXZhdGUge3RpbWV9ICovXG4gICAgdGhpcy5wcmV2VGltZV8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy52ZWxvY2l0eVhfID0gMDtcbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnZlbG9jaXR5WV8gPSAwO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRvdWNoU3RhcnQoZSkge1xuICAgIGNvbnN0IHt0b3VjaGVzfSA9IGU7XG4gICAgaWYgKCF0b3VjaGVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFBpbmNoIHRvdWNoZXMgYXJlIG5vdCBhbHdheXMgc2ltdWx0YW5lb3VzLCBjb250aW51ZSB0byBsaXN0ZW5cbiAgICAvLyBmb3Igc2Vjb25kIHRvdWNoLlxuICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgYWxyZWFkeSBpbiB0aGUgbWlkZGxlIG9mIGEgcGluY2ggZXZlbnQsIGlnbm9yZSBhZGRpdGlvbmFsIHRvdWNoZXMuXG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfICYmIHRvdWNoZXMubGVuZ3RoID4gMikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZV8gPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5zdGFydFgxXyA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIHRoaXMuc3RhcnRZMV8gPSB0b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICB0aGlzLnN0YXJ0WDJfID0gdG91Y2hlc1sxXS5jbGllbnRYO1xuICAgICAgdGhpcy5zdGFydFkyXyA9IHRvdWNoZXNbMV0uY2xpZW50WTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRvdWNoTW92ZShlKSB7XG4gICAgY29uc3Qge3RvdWNoZXN9ID0gZTtcbiAgICBpZiAoIXRvdWNoZXMgfHwgdG91Y2hlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBQaW5jaCB0b3VjaGVzIGFyZSBub3QgYWx3YXlzIHNpbXVsdGFuZW91cywgY29udGludWUgdG8gbGlzdGVuXG4gICAgLy8gZm9yIHNlY29uZCB0b3VjaC5cbiAgICBpZiAodG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gSGF2ZSAyKyB0b3VjaGVzXG4gICAgdGhpcy5sYXN0WDFfID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgIHRoaXMubGFzdFkxXyA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICB0aGlzLmxhc3RYMl8gPSB0b3VjaGVzWzFdLmNsaWVudFg7XG4gICAgdGhpcy5sYXN0WTJfID0gdG91Y2hlc1sxXS5jbGllbnRZO1xuXG4gICAgLy8gSWYgZXZlbnRpbmcsIGFsd2F5cyBlbWl0IGdlc3R1cmUgd2l0aCBuZXcgY29vcmRpbmF0ZXNcbiAgICBpZiAodGhpcy5ldmVudGluZ18pIHtcbiAgICAgIHRoaXMuZW1pdF8oZmFsc2UsIGZhbHNlLCBlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEdlc3R1cmUgaXMgMisgdG91Y2ggYnV0IGRpcmVjdGlvbiBpbmRpY2F0ZXMgbm90IGEgcGluY2hcbiAgICBpZiAodGhpcy5pc1BpbmNoUmVqZWN0ZWRfKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1BpbmNoUmVhZHlfKCkpIHtcbiAgICAgIHRoaXMuc2lnbmFsUmVhZHkoMCk7XG4gICAgfVxuICAgIC8vIFBpbmNoIGdlc3R1cmUgZGV0ZWN0ZWQgYnV0IHRocmVzaG9sZCBub3QgcmVhY2hlZCwgY29udGludWUgbGlzdGVuaW5nXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzUGluY2hSZWFkeV8oKSB7XG4gICAgY29uc3QgZHgxID0gdGhpcy5sYXN0WDFfIC0gdGhpcy5zdGFydFgxXztcbiAgICBjb25zdCBkeTEgPSB0aGlzLmxhc3RZMV8gLSB0aGlzLnN0YXJ0WTFfO1xuICAgIGNvbnN0IGR4MiA9IHRoaXMubGFzdFgyXyAtIHRoaXMuc3RhcnRYMl87XG4gICAgY29uc3QgZHkyID0gdGhpcy5sYXN0WTJfIC0gdGhpcy5zdGFydFkyXztcblxuICAgIGNvbnN0IHBpbmNoRGlyZWN0aW9uQ29ycmVjdCA9IGR4MSAqIGR4MiA8PSAwICYmIGR5MSAqIGR5MiA8PSAwO1xuICAgIGNvbnN0IHhQaW5jaFJlY29nbml6ZWQgPSBNYXRoLmFicyhkeDEgLSBkeDIpID49IFBJTkNIX0FDQ0VQVF9USFJFU0hPTEQ7XG4gICAgY29uc3QgeVBpbmNoUmVjb2duaXplZCA9IE1hdGguYWJzKGR5MSAtIGR5MikgPj0gUElOQ0hfQUNDRVBUX1RIUkVTSE9MRDtcbiAgICByZXR1cm4gcGluY2hEaXJlY3Rpb25Db3JyZWN0ICYmICh4UGluY2hSZWNvZ25pemVkIHx8IHlQaW5jaFJlY29nbml6ZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc1BpbmNoUmVqZWN0ZWRfKCkge1xuICAgIGNvbnN0IGR4MSA9IHRoaXMubGFzdFgxXyAtIHRoaXMuc3RhcnRYMV87XG4gICAgY29uc3QgZHkxID0gdGhpcy5sYXN0WTFfIC0gdGhpcy5zdGFydFkxXztcbiAgICBjb25zdCBkeDIgPSB0aGlzLmxhc3RYMl8gLSB0aGlzLnN0YXJ0WDJfO1xuICAgIGNvbnN0IGR5MiA9IHRoaXMubGFzdFkyXyAtIHRoaXMuc3RhcnRZMl87XG5cbiAgICBjb25zdCBwaW5jaERpcmVjdGlvbkluY29ycmVjdCA9IGR4MSAqIGR4MiA+IDAgfHwgZHkxICogZHkyID4gMDtcbiAgICBjb25zdCB4UGluY2hSZWplY3RlZCA9IE1hdGguYWJzKGR4MSArIGR4MikgPj0gUElOQ0hfUkVKRUNUX1RIUkVTSE9MRDtcbiAgICBjb25zdCB5UGluY2hSZWplY3RlZCA9IE1hdGguYWJzKGR5MSArIGR5MikgPj0gUElOQ0hfUkVKRUNUX1RIUkVTSE9MRDtcbiAgICByZXR1cm4gcGluY2hEaXJlY3Rpb25JbmNvcnJlY3QgJiYgKHhQaW5jaFJlamVjdGVkIHx8IHlQaW5jaFJlamVjdGVkKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Ub3VjaEVuZChlKSB7XG4gICAgLy8gUGluY2ggcmVxdWlyZXMgYXQgbGVhc3QgdHdvIHRvdWNoZXMgb24gdGhlIHBhZ2VcbiAgICBjb25zdCB7dG91Y2hlc30gPSBlO1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoIDwgMikge1xuICAgICAgdGhpcy5lbmRfKGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYWNjZXB0U3RhcnQoKSB7XG4gICAgdGhpcy5ldmVudGluZ18gPSB0cnVlO1xuICAgIHRoaXMucHJldlRpbWVfID0gdGhpcy5zdGFydFRpbWVfO1xuICAgIHRoaXMucHJldkRlbHRhWF8gPSAwO1xuICAgIHRoaXMucHJldkRlbHRhWV8gPSAwO1xuICAgIHRoaXMuY2VudGVyQ2xpZW50WF8gPSAodGhpcy5zdGFydFgxXyArIHRoaXMuc3RhcnRYMl8pICogMC41O1xuICAgIHRoaXMuY2VudGVyQ2xpZW50WV8gPSAodGhpcy5zdGFydFkxXyArIHRoaXMuc3RhcnRZMl8pICogMC41O1xuICAgIHRoaXMuZW1pdF8odHJ1ZSwgZmFsc2UsIG51bGwpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhY2NlcHRDYW5jZWwoKSB7XG4gICAgdGhpcy5ldmVudGluZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZpcnN0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGFzdFxuICAgKiBAcGFyYW0gez9FdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVtaXRfKGZpcnN0LCBsYXN0LCBldmVudCkge1xuICAgIHRoaXMubGFzdFRpbWVfID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBkZWx0YVRpbWUgPSB0aGlzLmxhc3RUaW1lXyAtIHRoaXMucHJldlRpbWVfO1xuICAgIGNvbnN0IGRlbHRhWCA9IHRoaXMuZGVsdGFYXygpO1xuICAgIGNvbnN0IGRlbHRhWSA9IHRoaXMuZGVsdGFZXygpO1xuICAgIC8vIEl0J3Mgb2Z0ZW4gdGhhdCBgdG91Y2hlbmRgIGFycml2ZXMgb24gdGhlIG5leHQgZnJhbWUuIFRoZXNlIHNob3VsZFxuICAgIC8vIGJlIGlnbm9yZWQgdG8gYXZvaWQgYSBzaWduaWZpY2FudCB2ZWxvY2l0eSBkb3duZ3JhZGUuXG4gICAgaWYgKCghbGFzdCAmJiBkZWx0YVRpbWUgPiA0KSB8fCAobGFzdCAmJiBkZWx0YVRpbWUgPiAxNikpIHtcbiAgICAgIHRoaXMudmVsb2NpdHlYXyA9IGNhbGNWZWxvY2l0eShcbiAgICAgICAgZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYXyxcbiAgICAgICAgZGVsdGFUaW1lLFxuICAgICAgICB0aGlzLnZlbG9jaXR5WF9cbiAgICAgICk7XG4gICAgICB0aGlzLnZlbG9jaXR5WV8gPSBjYWxjVmVsb2NpdHkoXG4gICAgICAgIGRlbHRhWSAtIHRoaXMucHJldkRlbHRhWV8sXG4gICAgICAgIGRlbHRhVGltZSxcbiAgICAgICAgdGhpcy52ZWxvY2l0eVlfXG4gICAgICApO1xuICAgICAgdGhpcy52ZWxvY2l0eVhfID0gTWF0aC5hYnModGhpcy52ZWxvY2l0eVhfKSA+IDFlLTQgPyB0aGlzLnZlbG9jaXR5WF8gOiAwO1xuICAgICAgdGhpcy52ZWxvY2l0eVlfID0gTWF0aC5hYnModGhpcy52ZWxvY2l0eVlfKSA+IDFlLTQgPyB0aGlzLnZlbG9jaXR5WV8gOiAwO1xuICAgICAgdGhpcy5wcmV2RGVsdGFYXyA9IGRlbHRhWDtcbiAgICAgIHRoaXMucHJldkRlbHRhWV8gPSBkZWx0YVk7XG4gICAgICB0aGlzLnByZXZUaW1lXyA9IHRoaXMubGFzdFRpbWVfO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0U3EgPSB0aGlzLnNxRGlzdF8oXG4gICAgICB0aGlzLnN0YXJ0WDFfLFxuICAgICAgdGhpcy5zdGFydFgyXyxcbiAgICAgIHRoaXMuc3RhcnRZMV8sXG4gICAgICB0aGlzLnN0YXJ0WTJfXG4gICAgKTtcbiAgICBjb25zdCBsYXN0U3EgPSB0aGlzLnNxRGlzdF8oXG4gICAgICB0aGlzLmxhc3RYMV8sXG4gICAgICB0aGlzLmxhc3RYMl8sXG4gICAgICB0aGlzLmxhc3RZMV8sXG4gICAgICB0aGlzLmxhc3RZMl9cbiAgICApO1xuICAgIHRoaXMuc2lnbmFsRW1pdChcbiAgICAgIHtcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGxhc3QsXG4gICAgICAgIHRpbWU6IHRoaXMubGFzdFRpbWVfLFxuICAgICAgICBjZW50ZXJDbGllbnRYOiB0aGlzLmNlbnRlckNsaWVudFhfLFxuICAgICAgICBjZW50ZXJDbGllbnRZOiB0aGlzLmNlbnRlckNsaWVudFlfLFxuICAgICAgICBkaXI6IE1hdGguc2lnbihsYXN0U3EgLSBzdGFydFNxKSxcbiAgICAgICAgZGVsdGFYOiBkZWx0YVggKiAwLjUsXG4gICAgICAgIGRlbHRhWTogZGVsdGFZICogMC41LFxuICAgICAgICB2ZWxvY2l0eVg6IHRoaXMudmVsb2NpdHlYXyAqIDAuNSxcbiAgICAgICAgdmVsb2NpdHlZOiB0aGlzLnZlbG9jaXR5WV8gKiAwLjUsXG4gICAgICB9LFxuICAgICAgZXZlbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0V2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW5kXyhldmVudCkge1xuICAgIGlmICh0aGlzLmV2ZW50aW5nXykge1xuICAgICAgdGhpcy5ldmVudGluZ18gPSBmYWxzZTtcbiAgICAgIHRoaXMuZW1pdF8oZmFsc2UsIHRydWUsIGV2ZW50KTtcbiAgICAgIHRoaXMuc2lnbmFsRW5kKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxuICAgKiBAcGFyYW0ge251bWJlcn0geDJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzcURpc3RfKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgcmV0dXJuICh4MSAtIHgyKSAqICh4MSAtIHgyKSArICh5MSAtIHkyKSAqICh5MSAtIHkyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWx0YVhfKCkge1xuICAgIHJldHVybiBNYXRoLmFicyhcbiAgICAgIHRoaXMubGFzdFgxXyAtIHRoaXMuc3RhcnRYMV8gLSAodGhpcy5sYXN0WDJfIC0gdGhpcy5zdGFydFgyXylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlbHRhWV8oKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKFxuICAgICAgdGhpcy5sYXN0WTFfIC0gdGhpcy5zdGFydFkxXyAtICh0aGlzLmxhc3RZMl8gLSB0aGlzLnN0YXJ0WTJfKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/gesture-recognizers.js