function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
import { Observable } from "./core/data-structures/observable";
import { supportsPassiveEventListener } from "./core/dom/event-helper-listen";
import { findIndex } from "./core/types/array";
import { toWin } from "./core/window";
import { devAssert } from "./log";
import { Pass } from "./pass";
var PROP_ = '__AMP_Gestures';

/**
 * A gesture object contains the type and data of the gesture such as
 * a tap or a double-tap or a swipe. See {@link GestureRecognizer} for
 * more details.
 * @struct
 * @const
 * @template DATA
 */
export var Gesture =
/**
 * @param {string} type The gesture's string type.
 * @param {DATA} data The data of the gesture.
 * @param {time} time The time that the gesture has been emitted.
 * @param {?Event} event An optional browser event that resulted in the
 *   gesture.
 */
function Gesture(type, data, time, event) {
  _classCallCheck(this, Gesture);

  /** @const {string} */
  this.type = type;

  /** @const {DATA} */
  this.data = data;

  /** @const {number} */
  this.time = time;

  /** @const {?Event} */
  this.event = event;
};

/**
 * Gestures object manages all gestures on a particular element. It listens
 * to all pointer events and delegates them to individual gesture recognizers.
 * When a recognizer has recognized a gesture and ready to start emitting it
 * it requests permission to do so from this class which resolves conflicts
 * between competing recognizers to decide which gesture should go forward.
 */
export var Gestures = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   * @param {boolean} shouldNotPreventDefault
   * @param {boolean} shouldStopPropagation
   */
  function Gestures(element, shouldNotPreventDefault, shouldStopPropagation) {
    _classCallCheck(this, Gestures);

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Array<!GestureRecognizer>} */
    this.recognizers_ = [];

    /** @private {!Array<boolean>} */
    this.tracking_ = [];

    /** @private {!Array<time>} */
    this.ready_ = [];

    /** @private {!Array<time>} */
    this.pending_ = [];

    /** @private {?GestureRecognizer} */
    this.eventing_ = null;

    /** @private {boolean} */
    this.shouldNotPreventDefault_ = shouldNotPreventDefault;

    /** @private {boolean} */
    this.shouldStopPropagation_ = shouldStopPropagation;

    /**
     * This variable indicates that the eventing has stopped on this
     * event cycle.
     * @private {boolean}
     */
    this.wasEventing_ = false;

    /** @private {!Pass} */
    this.pass_ = new Pass(toWin(element.ownerDocument.defaultView), this.doPass_.bind(this));

    /** @private {!Observable} */
    this.pointerDownObservable_ = new Observable();

    /**
     * Observers for each type of registered gesture types.
     * @private {!Object<string, !Observable<!Gesture>>}
     */
    this.overservers_ = Object.create(null);

    /** @private @const {function(!Event)} */
    this.boundOnTouchStart_ = this.onTouchStart_.bind(this);

    /** @private @const {function(!Event)} */
    this.boundOnTouchEnd_ = this.onTouchEnd_.bind(this);

    /** @private @const {function(!Event)} */
    this.boundOnTouchMove_ = this.onTouchMove_.bind(this);

    /** @private @const {function(!Event)} */
    this.boundOnTouchCancel_ = this.onTouchCancel_.bind(this);
    var win = element.ownerDocument.defaultView;
    var passiveSupported = supportsPassiveEventListener(toWin(win));
    this.element_.addEventListener('touchstart', this.boundOnTouchStart_, passiveSupported ? {
      passive: true
    } : false);
    this.element_.addEventListener('touchend', this.boundOnTouchEnd_);
    this.element_.addEventListener('touchmove', this.boundOnTouchMove_, passiveSupported ? {
      passive: true
    } : false);
    this.element_.addEventListener('touchcancel', this.boundOnTouchCancel_);

    /** @private {boolean} */
    this.passAfterEvent_ = false;
  }

  /**
   * Unsubscribes from all pointer events and removes the shared cache instance.
   */
  _createClass(Gestures, [{
    key: "cleanup",
    value: function cleanup() {
      this.element_.removeEventListener('touchstart', this.boundOnTouchStart_);
      this.element_.removeEventListener('touchend', this.boundOnTouchEnd_);
      this.element_.removeEventListener('touchmove', this.boundOnTouchMove_);
      this.element_.removeEventListener('touchcancel', this.boundOnTouchCancel_);
      delete this.element_[PROP_];
      this.pass_.cancel();
    }
    /**
     * Subscribes to a gesture emitted by the specified recognizer. For a first
     * gesture handler registered in this method the recognizer is installed
     * and from that point on it participates in the event processing.
     *
     * @param {function(new:GestureRecognizer, !Gestures)} recognizerConstr
     * @param {function(!Gesture)} handler
     * @return {!UnlistenDef}
     * @template DATA
     */

  }, {
    key: "onGesture",
    value: function onGesture(recognizerConstr, handler) {
      var recognizer = new recognizerConstr(this);
      var type = recognizer.getType();
      var overserver = this.overservers_[type];

      if (!overserver) {
        this.recognizers_.push(recognizer);
        overserver = new Observable();
        this.overservers_[type] = overserver;
      }

      return overserver.add(handler);
    }
    /**
     * Unsubscribes all handlers from the given gesture recognizer. Returns
     * true if anything was done. Returns false if there were no handlers
     * registered on the given gesture recognizer in first place.
     *
     * @param {function(new:GestureRecognizer, !Gestures)} recognizerConstr
     * @return {boolean}
     */

  }, {
    key: "removeGesture",
    value: function removeGesture(recognizerConstr) {
      var type = new recognizerConstr(this).getType();
      var overserver = this.overservers_[type];

      if (overserver) {
        overserver.removeAll();
        var index = findIndex(this.recognizers_, function (e) {
          return e.getType() == type;
        });

        if (index < 0) {
          return false;
        }

        // Remove the recognizer as well as all associated tracking state
        this.recognizers_.splice(index, 1);
        this.ready_.splice(index, 1);
        this.pending_.splice(index, 1);
        this.tracking_.splice(index, 1);
        delete this.overservers_[type];
        return true;
      } else {
        return false;
      }
    }
    /**
     * Subscribes to pointer down events, such as "touchstart" or "mousedown".
     * @param {!Function} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onPointerDown",
    value: function onPointerDown(handler) {
      return this.pointerDownObservable_.add(handler);
    }
    /**
     * Handles all "touchstart" events and dispatches them to the tracking
     * recognizers.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchStart_",
    value: function onTouchStart_(event) {
      var now = Date.now();
      this.wasEventing_ = false;
      this.pointerDownObservable_.fire(event);

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (this.ready_[i]) {
          // If the recognizer is in the "ready" state, it won't receive
          // any more touch series until it's allowed to emit.
          continue;
        }

        if (this.pending_[i] && this.pending_[i] < now) {
          // Pending state expired. Reset.
          this.stopTracking_(i);
        }

        if (this.recognizers_[i].onTouchStart(event)) {
          // When a recognizer is interested in the touch series it returns "true"
          // from its onTouchStart method. For this recognizer we start tracking
          // the whole series of touch events from touchstart to touchend. Other
          // recognizers will not receive them unless they return "true" from
          // onTouchStart.
          this.startTracking_(i);
        }
      }

      this.afterEvent_(event);
    }
    /**
     * Handles all "touchmove" events and dispatches them to the tracking
     * recognizers.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchMove_",
    value: function onTouchMove_(event) {
      var now = Date.now();

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (!this.tracking_[i]) {
          // The whole touch series are ignored for non-tracking recognizers.
          continue;
        }

        if (this.pending_[i] && this.pending_[i] < now) {
          // Pending state expired. Reset.
          this.stopTracking_(i);
          continue;
        }

        if (!this.recognizers_[i].onTouchMove(event)) {
          // Recognizer lost interest in the series. Reset.
          this.stopTracking_(i);
        }
      }

      this.afterEvent_(event);
    }
    /**
     * Handles all "touchend" events and dispatches them to the tracking
     * recognizers.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchEnd_",
    value: function onTouchEnd_(event) {
      var now = Date.now();

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (!this.tracking_[i]) {
          // The whole touch series are ignored for non-tracking recognizers.
          continue;
        }

        if (this.pending_[i] && this.pending_[i] < now) {
          // Pending state expired. Reset.
          this.stopTracking_(i);
          continue;
        }

        this.recognizers_[i].onTouchEnd(event);
        var isReady = !this.pending_[i];
        var isExpired = this.pending_[i] < now;
        var isEventing = this.eventing_ == this.recognizers_[i];

        if (!isEventing && (isReady || isExpired)) {
          this.stopTracking_(i);
        }
      }

      this.afterEvent_(event);
    }
    /**
     * Handles all "touchcancel" events. Cancels all tracking/emitting
     * recognizers.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchCancel_",
    value: function onTouchCancel_(event) {
      for (var i = 0; i < this.recognizers_.length; i++) {
        this.cancelEventing_(i);
      }

      this.afterEvent_(event);
    }
    /**
     * Callback for a gesture recognizer to communicate that it's ready to
     * start emitting gestures. Gestures instance may or may not allow the
     * recognizer to proceed.
     * @param {!GestureRecognizer} recognizer
     * @param {number} offset
     * @private
     * @restricted
     * @visibleForTesting
     */

  }, {
    key: "signalReady_",
    value: function signalReady_(recognizer, offset) {
      // Somebody got here first.
      if (this.eventing_) {
        recognizer.acceptCancel();
        return;
      }

      // Set the recognizer as ready and wait for the pass to
      // make the decision.
      var now = Date.now();

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (this.recognizers_[i] == recognizer) {
          this.ready_[i] = now + offset;
          this.pending_[i] = 0;
        }
      }

      this.passAfterEvent_ = true;
    }
    /**
     * Callback for a gesture recognizer to communicate that it's close to
     * start emitting gestures, but needs more time to see more events. Once
     * this time expires the recognizer should either signal readiness or it
     * will be canceled.
     * @param {!GestureRecognizer} recognizer
     * @param {number} timeLeft
     * @private
     * @restricted
     * @visibleForTesting
     */

  }, {
    key: "signalPending_",
    value: function signalPending_(recognizer, timeLeft) {
      // Somebody got here first.
      if (this.eventing_) {
        recognizer.acceptCancel();
        return;
      }

      var now = Date.now();

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (this.recognizers_[i] == recognizer) {
          this.pending_[i] = now + timeLeft;
        }
      }
    }
    /**
     * Callback for a gesture recognizer to communicate that it's done
     * emitting gestures.
     * @param {!GestureRecognizer} recognizer
     * @private
     * @restricted
     * @visibleForTesting
     */

  }, {
    key: "signalEnd_",
    value: function signalEnd_(recognizer) {
      if (this.eventing_ == recognizer) {
        this.eventing_ = null;
        this.wasEventing_ = true;
      }
    }
    /**
     * Callback for a gesture emit the gesture. Only the currently emitting
     * recognizer is allowed to emit gestures.
     * @param {!GestureRecognizer} recognizer
     * @param {*} data
     * @param {?Event} event
     * @private
     * @restricted
     * @visibleForTesting
     */

  }, {
    key: "signalEmit_",
    value: function signalEmit_(recognizer, data, event) {
      devAssert(this.eventing_ == recognizer, 'Recognizer is not currently allowed: %s', recognizer.getType());
      var overserver = this.overservers_[recognizer.getType()];

      if (overserver) {
        overserver.fire(new Gesture(recognizer.getType(), data, Date.now(), event));
      }
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "afterEvent_",
    value: function afterEvent_(event) {
      var cancelEvent = !!this.eventing_ || this.wasEventing_;
      this.wasEventing_ = false;

      if (!cancelEvent) {
        var now = Date.now();

        for (var i = 0; i < this.recognizers_.length; i++) {
          if (this.ready_[i] || this.pending_[i] && this.pending_[i] >= now) {
            cancelEvent = true;
            break;
          }
        }
      }

      if (cancelEvent) {
        event.stopPropagation();

        if (!this.shouldNotPreventDefault_) {
          event.preventDefault();
        }
      } else if (this.shouldStopPropagation_) {
        event.stopPropagation();
      }

      if (this.passAfterEvent_) {
        this.passAfterEvent_ = false;
        this.doPass_();
      }
    }
    /**
     * The pass that decides which recognizers can start emitting and which
     * are canceled.
     * @private
     */

  }, {
    key: "doPass_",
    value: function doPass_() {
      var now = Date.now();
      // The "most ready" recognizer is the youngest in the "ready" set.
      // Otherwise we wouldn't wait for it at all.
      var readyIndex = -1;

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (!this.ready_[i]) {
          if (this.pending_[i] && this.pending_[i] < now) {
            // Pending state expired. Reset.
            this.stopTracking_(i);
          }

          continue;
        }

        if (readyIndex == -1 || this.ready_[i] > this.ready_[readyIndex]) {
          readyIndex = i;
        }
      }

      if (readyIndex == -1) {
        // Nothing to do.
        return;
      }

      // Look for conflicts.
      var waitTime = 0;

      for (var _i = 0; _i < this.recognizers_.length; _i++) {
        if (this.ready_[_i] || !this.tracking_[_i]) {
          continue;
        }

        waitTime = Math.max(waitTime, this.pending_[_i] - now);
      }

      if (waitTime < 2) {
        // We waited long enough.
        this.startEventing_(readyIndex);
        return;
      }

      // Some conflicts: have to wait to see who wins.
      this.pass_.schedule(waitTime);
    }
    /**
     * This recognizer is given "go ahead" and all others are canceled.
     * @param {number} index
     * @private
     */

  }, {
    key: "startEventing_",
    value: function startEventing_(index) {
      var recognizer = this.recognizers_[index];

      for (var i = 0; i < this.recognizers_.length; i++) {
        if (i != index) {
          this.cancelEventing_(i);
        }
      }

      this.ready_[index] = 0;
      this.pending_[index] = 0;
      this.eventing_ = recognizer;
      recognizer.acceptStart();
    }
    /**
     * @param {number} index
     * @private
     */

  }, {
    key: "startTracking_",
    value: function startTracking_(index) {
      this.tracking_[index] = true;
      this.pending_[index] = 0;
    }
    /**
     * @param {number} index
     * @private
     */

  }, {
    key: "stopTracking_",
    value: function stopTracking_(index) {
      this.tracking_[index] = false;
      this.pending_[index] = 0;

      if (!this.ready_[index]) {
        this.recognizers_[index].acceptCancel();
      }
    }
    /**
     * @param {number} index
     * @private
     */

  }, {
    key: "cancelEventing_",
    value: function cancelEventing_(index) {
      this.ready_[index] = 0;
      this.stopTracking_(index);
    }
  }], [{
    key: "get",
    value:
    /**
     * Creates if not yet created and returns the shared Gestures instance for
     * the specified element.
     * @param {!Element} element
     * @param {boolean=} opt_shouldNotPreventDefault
     * @param {boolean=} opt_shouldStopPropagation
     * @return {!Gestures}
     */
    function get(element, opt_shouldNotPreventDefault, opt_shouldStopPropagation) {
      if (opt_shouldNotPreventDefault === void 0) {
        opt_shouldNotPreventDefault = false;
      }

      if (opt_shouldStopPropagation === void 0) {
        opt_shouldStopPropagation = false;
      }

      var res = element[PROP_];

      if (!res) {
        res = new Gestures(element, opt_shouldNotPreventDefault, opt_shouldStopPropagation);
        element[PROP_] = res;
      }

      return res;
    }
  }]);

  return Gestures;
}();

/**
 * The gesture recognizer receives the pointer events from Gestures instance.
 * Based on these events, it can "recognize" the gesture it's responsible for,
 * request to start emitting and emit gestures. Gestures instances manages
 * several competing recognizers and decides which ones get to emit gestures
 * and which do not.
 *
 * The recognizer can be in several main states:
 * 1. Tracking state. In this state the recognizer is receiving the series of
 *    touch events from touchstart to touchend. To get into this state the
 *    recognizer has to return "true" from the {@link onTouchStart}.
 * 2. Pending state (optional). The recognizer matched part of the gesture,
 *    but needs more time to get track more events. It requests more time
 *    by calling {@link signalPending}, By the end of this time the recognizer
 *    has either matched the gesture or has been canceled.
 * 3. Ready state. The recognizer matched the whole gesture and ready to start
 *    emitting. It communicates to the Gestures this readiness by calling
 *    {@link signalReady}.
 * 5. Emitting state. If Gestures decides to go ahead with this recognizer, it
 *    will call {@link acceptStart} method. Otherwise, it will call
 *    {@link acceptCancel} method. Once in the emitting state, the recognizer
 *    can emit any number of events by calling {@link signalEmit}.
 * 6. Complete state. Once done, the recognizer can call {@link signalEnd} to
 *    communicate that it's done.
 *
 * @template DATA
 */
export var GestureRecognizer = /*#__PURE__*/function () {
  /**
   * @param {string} type
   * @param {!Gestures} manager
   */
  function GestureRecognizer(type, manager) {
    _classCallCheck(this, GestureRecognizer);

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {!Gestures} */
    this.manager_ = manager;
  }

  /**
   * Returns the type of the gesture emitted by the instance of this class.
   * It has to be unique in the scope of the Gestures instance.
   * @return {string}
   */
  _createClass(GestureRecognizer, [{
    key: "getType",
    value: function getType() {
      return this.type_;
    }
    /**
     * The recognizer can call this method to communicate that it's ready to
     * start emitting the gesture. Optionally it can pass a zero, positive or
     * negative offset - a time on how much the gesture should be penalized or
     * given advantage in conflict resolution. The recognizer at this point is
     * in the "ready" state.
     * @param {time} offset
     */

  }, {
    key: "signalReady",
    value: function signalReady(offset) {
      this.manager_.signalReady_(this, offset);
    }
    /**
     * The recognizer can call this method to communicate that it needs more
     * time (timeLeft) to match the gesture. By the end of this time the
     * recognizer has to either transit to the ready state using
     * {@link signalReady} or it will be canceled. The recognizer is in the
     * "pending" state.
     * @param {time} timeLeft
     */

  }, {
    key: "signalPending",
    value: function signalPending(timeLeft) {
      this.manager_.signalPending_(this, timeLeft);
    }
    /**
     * The recognizer can call this method to communicate that it's done
     * emitting the gestures. It will return to the waiting state. Recognizer
     * can only call this method if it has previously received the
     * {@link acceptStart} call.
     */

  }, {
    key: "signalEnd",
    value: function signalEnd() {
      this.manager_.signalEnd_(this);
    }
    /**
     * The recognizer can call this method to emit the gestures while in the
     * "emitting" state. Recognizer can only call this method if it has
     * previously received the {@link acceptStart} call.
     * @param {DATA} data
     * @param {?Event} event
     */

  }, {
    key: "signalEmit",
    value: function signalEmit(data, event) {
      this.manager_.signalEmit_(this, data, event);
    }
    /**
     * The Gestures instance calls this method to allow the recognizer to start
     * emitting the gestures. At this point the recognizer is in the "emitting"
     * state. It will be in this state until it calls {@link signalEnd} or
     * the {@link acceptCancel} is called by the Gestures instance.
     */

  }, {
    key: "acceptStart",
    value: function acceptStart() {}
    /**
     * The Gestures instance calls this method to reset the recognizer. At this
     * point the recognizer is in the initial waiting state.
     */

  }, {
    key: "acceptCancel",
    value: function acceptCancel() {}
    /**
     * The Gestures instance calls this method for each "touchstart" event. If
     * the recognizer wants to receive other touch events in the series, it has
     * to return "true".
     * @param {!Event} unusedEvent
     * @return {boolean}
     */

  }, {
    key: "onTouchStart",
    value: function onTouchStart(unusedEvent) {
      return false;
    }
    /**
     * The Gestures instance calls this method for each "touchmove" event. If
     * the recognizer wants to continue receiving touch events in the series,
     * it has to return "true".
     * @param {!Event} unusedEvent
     * @return {boolean}
     */

  }, {
    key: "onTouchMove",
    value: function onTouchMove(unusedEvent) {
      return false;
    }
    /**
     * The Gestures instance calls this method for the "touchend" event.
     * Somewhere within this touch series the recognizer has to call
     * {@link signalReady} or {@link signalPending} or it will be reset for the
     * next touch series.
     * @param {!Event} unusedEvent
     */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(unusedEvent) {}
  }]);

  return GestureRecognizer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdlc3R1cmUuanMiXSwibmFtZXMiOlsiT2JzZXJ2YWJsZSIsInN1cHBvcnRzUGFzc2l2ZUV2ZW50TGlzdGVuZXIiLCJmaW5kSW5kZXgiLCJ0b1dpbiIsImRldkFzc2VydCIsIlBhc3MiLCJQUk9QXyIsIkdlc3R1cmUiLCJ0eXBlIiwiZGF0YSIsInRpbWUiLCJldmVudCIsIkdlc3R1cmVzIiwiZWxlbWVudCIsInNob3VsZE5vdFByZXZlbnREZWZhdWx0Iiwic2hvdWxkU3RvcFByb3BhZ2F0aW9uIiwiZWxlbWVudF8iLCJyZWNvZ25pemVyc18iLCJ0cmFja2luZ18iLCJyZWFkeV8iLCJwZW5kaW5nXyIsImV2ZW50aW5nXyIsInNob3VsZE5vdFByZXZlbnREZWZhdWx0XyIsInNob3VsZFN0b3BQcm9wYWdhdGlvbl8iLCJ3YXNFdmVudGluZ18iLCJwYXNzXyIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsImRvUGFzc18iLCJiaW5kIiwicG9pbnRlckRvd25PYnNlcnZhYmxlXyIsIm92ZXJzZXJ2ZXJzXyIsIk9iamVjdCIsImNyZWF0ZSIsImJvdW5kT25Ub3VjaFN0YXJ0XyIsIm9uVG91Y2hTdGFydF8iLCJib3VuZE9uVG91Y2hFbmRfIiwib25Ub3VjaEVuZF8iLCJib3VuZE9uVG91Y2hNb3ZlXyIsIm9uVG91Y2hNb3ZlXyIsImJvdW5kT25Ub3VjaENhbmNlbF8iLCJvblRvdWNoQ2FuY2VsXyIsIndpbiIsInBhc3NpdmVTdXBwb3J0ZWQiLCJhZGRFdmVudExpc3RlbmVyIiwicGFzc2l2ZSIsInBhc3NBZnRlckV2ZW50XyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjYW5jZWwiLCJyZWNvZ25pemVyQ29uc3RyIiwiaGFuZGxlciIsInJlY29nbml6ZXIiLCJnZXRUeXBlIiwib3ZlcnNlcnZlciIsInB1c2giLCJhZGQiLCJyZW1vdmVBbGwiLCJpbmRleCIsImUiLCJzcGxpY2UiLCJub3ciLCJEYXRlIiwiZmlyZSIsImkiLCJsZW5ndGgiLCJzdG9wVHJhY2tpbmdfIiwib25Ub3VjaFN0YXJ0Iiwic3RhcnRUcmFja2luZ18iLCJhZnRlckV2ZW50XyIsIm9uVG91Y2hNb3ZlIiwib25Ub3VjaEVuZCIsImlzUmVhZHkiLCJpc0V4cGlyZWQiLCJpc0V2ZW50aW5nIiwiY2FuY2VsRXZlbnRpbmdfIiwib2Zmc2V0IiwiYWNjZXB0Q2FuY2VsIiwidGltZUxlZnQiLCJjYW5jZWxFdmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwicmVhZHlJbmRleCIsIndhaXRUaW1lIiwiTWF0aCIsIm1heCIsInN0YXJ0RXZlbnRpbmdfIiwic2NoZWR1bGUiLCJhY2NlcHRTdGFydCIsIm9wdF9zaG91bGROb3RQcmV2ZW50RGVmYXVsdCIsIm9wdF9zaG91bGRTdG9wUHJvcGFnYXRpb24iLCJyZXMiLCJHZXN0dXJlUmVjb2duaXplciIsIm1hbmFnZXIiLCJ0eXBlXyIsIm1hbmFnZXJfIiwic2lnbmFsUmVhZHlfIiwic2lnbmFsUGVuZGluZ18iLCJzaWduYWxFbmRfIiwic2lnbmFsRW1pdF8iLCJ1bnVzZWRFdmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsVUFBUjtBQUNBLFNBQVFDLDRCQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLEtBQVI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUVBLElBQU1DLEtBQUssR0FBRyxnQkFBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsT0FBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsaUJBQVlDLElBQVosRUFBa0JDLElBQWxCLEVBQXdCQyxJQUF4QixFQUE4QkMsS0FBOUIsRUFBcUM7QUFBQTs7QUFDbkM7QUFDQSxPQUFLSCxJQUFMLEdBQVlBLElBQVo7O0FBQ0E7QUFDQSxPQUFLQyxJQUFMLEdBQVlBLElBQVo7O0FBQ0E7QUFDQSxPQUFLQyxJQUFMLEdBQVlBLElBQVo7O0FBQ0E7QUFDQSxPQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDRCxDQWpCSDs7QUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxRQUFiO0FBMEJFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDRSxvQkFBWUMsT0FBWixFQUFxQkMsdUJBQXJCLEVBQThDQyxxQkFBOUMsRUFBcUU7QUFBQTs7QUFDbkU7QUFDQSxTQUFLQyxRQUFMLEdBQWdCSCxPQUFoQjs7QUFFQTtBQUNBLFNBQUtJLFlBQUwsR0FBb0IsRUFBcEI7O0FBRUE7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEVBQWpCOztBQUVBO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLEVBQWQ7O0FBRUE7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEVBQWhCOztBQUVBO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixJQUFqQjs7QUFFQTtBQUNBLFNBQUtDLHdCQUFMLEdBQWdDUix1QkFBaEM7O0FBRUE7QUFDQSxTQUFLUyxzQkFBTCxHQUE4QlIscUJBQTlCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLUyxZQUFMLEdBQW9CLEtBQXBCOztBQUVBO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLElBQUlwQixJQUFKLENBQ1hGLEtBQUssQ0FBQ1UsT0FBTyxDQUFDYSxhQUFSLENBQXNCQyxXQUF2QixDQURNLEVBRVgsS0FBS0MsT0FBTCxDQUFhQyxJQUFiLENBQWtCLElBQWxCLENBRlcsQ0FBYjs7QUFLQTtBQUNBLFNBQUtDLHNCQUFMLEdBQThCLElBQUk5QixVQUFKLEVBQTlCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0ksU0FBSytCLFlBQUwsR0FBb0JDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLElBQWQsQ0FBcEI7O0FBRUE7QUFDQSxTQUFLQyxrQkFBTCxHQUEwQixLQUFLQyxhQUFMLENBQW1CTixJQUFuQixDQUF3QixJQUF4QixDQUExQjs7QUFDQTtBQUNBLFNBQUtPLGdCQUFMLEdBQXdCLEtBQUtDLFdBQUwsQ0FBaUJSLElBQWpCLENBQXNCLElBQXRCLENBQXhCOztBQUNBO0FBQ0EsU0FBS1MsaUJBQUwsR0FBeUIsS0FBS0MsWUFBTCxDQUFrQlYsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBekI7O0FBQ0E7QUFDQSxTQUFLVyxtQkFBTCxHQUEyQixLQUFLQyxjQUFMLENBQW9CWixJQUFwQixDQUF5QixJQUF6QixDQUEzQjtBQUVBLFFBQU1hLEdBQUcsR0FBRzdCLE9BQU8sQ0FBQ2EsYUFBUixDQUFzQkMsV0FBbEM7QUFDQSxRQUFNZ0IsZ0JBQWdCLEdBQUcxQyw0QkFBNEIsQ0FBQ0UsS0FBSyxDQUFDdUMsR0FBRCxDQUFOLENBQXJEO0FBQ0EsU0FBSzFCLFFBQUwsQ0FBYzRCLGdCQUFkLENBQ0UsWUFERixFQUVFLEtBQUtWLGtCQUZQLEVBR0VTLGdCQUFnQixHQUFHO0FBQUNFLE1BQUFBLE9BQU8sRUFBRTtBQUFWLEtBQUgsR0FBcUIsS0FIdkM7QUFLQSxTQUFLN0IsUUFBTCxDQUFjNEIsZ0JBQWQsQ0FBK0IsVUFBL0IsRUFBMkMsS0FBS1IsZ0JBQWhEO0FBQ0EsU0FBS3BCLFFBQUwsQ0FBYzRCLGdCQUFkLENBQ0UsV0FERixFQUVFLEtBQUtOLGlCQUZQLEVBR0VLLGdCQUFnQixHQUFHO0FBQUNFLE1BQUFBLE9BQU8sRUFBRTtBQUFWLEtBQUgsR0FBcUIsS0FIdkM7QUFLQSxTQUFLN0IsUUFBTCxDQUFjNEIsZ0JBQWQsQ0FBK0IsYUFBL0IsRUFBOEMsS0FBS0osbUJBQW5EOztBQUVBO0FBQ0EsU0FBS00sZUFBTCxHQUF1QixLQUF2QjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQTVHQTtBQUFBO0FBQUEsV0E2R0UsbUJBQVU7QUFDUixXQUFLOUIsUUFBTCxDQUFjK0IsbUJBQWQsQ0FBa0MsWUFBbEMsRUFBZ0QsS0FBS2Isa0JBQXJEO0FBQ0EsV0FBS2xCLFFBQUwsQ0FBYytCLG1CQUFkLENBQWtDLFVBQWxDLEVBQThDLEtBQUtYLGdCQUFuRDtBQUNBLFdBQUtwQixRQUFMLENBQWMrQixtQkFBZCxDQUFrQyxXQUFsQyxFQUErQyxLQUFLVCxpQkFBcEQ7QUFDQSxXQUFLdEIsUUFBTCxDQUFjK0IsbUJBQWQsQ0FBa0MsYUFBbEMsRUFBaUQsS0FBS1AsbUJBQXREO0FBQ0EsYUFBTyxLQUFLeEIsUUFBTCxDQUFjVixLQUFkLENBQVA7QUFDQSxXQUFLbUIsS0FBTCxDQUFXdUIsTUFBWDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL0hBO0FBQUE7QUFBQSxXQWdJRSxtQkFBVUMsZ0JBQVYsRUFBNEJDLE9BQTVCLEVBQXFDO0FBQ25DLFVBQU1DLFVBQVUsR0FBRyxJQUFJRixnQkFBSixDQUFxQixJQUFyQixDQUFuQjtBQUNBLFVBQU16QyxJQUFJLEdBQUcyQyxVQUFVLENBQUNDLE9BQVgsRUFBYjtBQUNBLFVBQUlDLFVBQVUsR0FBRyxLQUFLdEIsWUFBTCxDQUFrQnZCLElBQWxCLENBQWpCOztBQUNBLFVBQUksQ0FBQzZDLFVBQUwsRUFBaUI7QUFDZixhQUFLcEMsWUFBTCxDQUFrQnFDLElBQWxCLENBQXVCSCxVQUF2QjtBQUNBRSxRQUFBQSxVQUFVLEdBQUcsSUFBSXJELFVBQUosRUFBYjtBQUNBLGFBQUsrQixZQUFMLENBQWtCdkIsSUFBbEIsSUFBMEI2QyxVQUExQjtBQUNEOztBQUNELGFBQU9BLFVBQVUsQ0FBQ0UsR0FBWCxDQUFlTCxPQUFmLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbkpBO0FBQUE7QUFBQSxXQW9KRSx1QkFBY0QsZ0JBQWQsRUFBZ0M7QUFDOUIsVUFBTXpDLElBQUksR0FBRyxJQUFJeUMsZ0JBQUosQ0FBcUIsSUFBckIsRUFBMkJHLE9BQTNCLEVBQWI7QUFDQSxVQUFNQyxVQUFVLEdBQUcsS0FBS3RCLFlBQUwsQ0FBa0J2QixJQUFsQixDQUFuQjs7QUFDQSxVQUFJNkMsVUFBSixFQUFnQjtBQUNkQSxRQUFBQSxVQUFVLENBQUNHLFNBQVg7QUFDQSxZQUFNQyxLQUFLLEdBQUd2RCxTQUFTLENBQUMsS0FBS2UsWUFBTixFQUFvQixVQUFDeUMsQ0FBRDtBQUFBLGlCQUFPQSxDQUFDLENBQUNOLE9BQUYsTUFBZTVDLElBQXRCO0FBQUEsU0FBcEIsQ0FBdkI7O0FBQ0EsWUFBSWlELEtBQUssR0FBRyxDQUFaLEVBQWU7QUFDYixpQkFBTyxLQUFQO0FBQ0Q7O0FBQ0Q7QUFDQSxhQUFLeEMsWUFBTCxDQUFrQjBDLE1BQWxCLENBQXlCRixLQUF6QixFQUFnQyxDQUFoQztBQUNBLGFBQUt0QyxNQUFMLENBQVl3QyxNQUFaLENBQW1CRixLQUFuQixFQUEwQixDQUExQjtBQUNBLGFBQUtyQyxRQUFMLENBQWN1QyxNQUFkLENBQXFCRixLQUFyQixFQUE0QixDQUE1QjtBQUNBLGFBQUt2QyxTQUFMLENBQWV5QyxNQUFmLENBQXNCRixLQUF0QixFQUE2QixDQUE3QjtBQUNBLGVBQU8sS0FBSzFCLFlBQUwsQ0FBa0J2QixJQUFsQixDQUFQO0FBQ0EsZUFBTyxJQUFQO0FBQ0QsT0FiRCxNQWFPO0FBQ0wsZUFBTyxLQUFQO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBN0tBO0FBQUE7QUFBQSxXQThLRSx1QkFBYzBDLE9BQWQsRUFBdUI7QUFDckIsYUFBTyxLQUFLcEIsc0JBQUwsQ0FBNEJ5QixHQUE1QixDQUFnQ0wsT0FBaEMsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXZMQTtBQUFBO0FBQUEsV0F3TEUsdUJBQWN2QyxLQUFkLEVBQXFCO0FBQ25CLFVBQU1pRCxHQUFHLEdBQUdDLElBQUksQ0FBQ0QsR0FBTCxFQUFaO0FBQ0EsV0FBS3BDLFlBQUwsR0FBb0IsS0FBcEI7QUFFQSxXQUFLTSxzQkFBTCxDQUE0QmdDLElBQTVCLENBQWlDbkQsS0FBakM7O0FBRUEsV0FBSyxJQUFJb0QsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLOUMsWUFBTCxDQUFrQitDLE1BQXRDLEVBQThDRCxDQUFDLEVBQS9DLEVBQW1EO0FBQ2pELFlBQUksS0FBSzVDLE1BQUwsQ0FBWTRDLENBQVosQ0FBSixFQUFvQjtBQUNsQjtBQUNBO0FBQ0E7QUFDRDs7QUFDRCxZQUFJLEtBQUszQyxRQUFMLENBQWMyQyxDQUFkLEtBQW9CLEtBQUszQyxRQUFMLENBQWMyQyxDQUFkLElBQW1CSCxHQUEzQyxFQUFnRDtBQUM5QztBQUNBLGVBQUtLLGFBQUwsQ0FBbUJGLENBQW5CO0FBQ0Q7O0FBQ0QsWUFBSSxLQUFLOUMsWUFBTCxDQUFrQjhDLENBQWxCLEVBQXFCRyxZQUFyQixDQUFrQ3ZELEtBQWxDLENBQUosRUFBOEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQUt3RCxjQUFMLENBQW9CSixDQUFwQjtBQUNEO0FBQ0Y7O0FBRUQsV0FBS0ssV0FBTCxDQUFpQnpELEtBQWpCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMU5BO0FBQUE7QUFBQSxXQTJORSxzQkFBYUEsS0FBYixFQUFvQjtBQUNsQixVQUFNaUQsR0FBRyxHQUFHQyxJQUFJLENBQUNELEdBQUwsRUFBWjs7QUFFQSxXQUFLLElBQUlHLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzlDLFlBQUwsQ0FBa0IrQyxNQUF0QyxFQUE4Q0QsQ0FBQyxFQUEvQyxFQUFtRDtBQUNqRCxZQUFJLENBQUMsS0FBSzdDLFNBQUwsQ0FBZTZDLENBQWYsQ0FBTCxFQUF3QjtBQUN0QjtBQUNBO0FBQ0Q7O0FBQ0QsWUFBSSxLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxLQUFvQixLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxJQUFtQkgsR0FBM0MsRUFBZ0Q7QUFDOUM7QUFDQSxlQUFLSyxhQUFMLENBQW1CRixDQUFuQjtBQUNBO0FBQ0Q7O0FBQ0QsWUFBSSxDQUFDLEtBQUs5QyxZQUFMLENBQWtCOEMsQ0FBbEIsRUFBcUJNLFdBQXJCLENBQWlDMUQsS0FBakMsQ0FBTCxFQUE4QztBQUM1QztBQUNBLGVBQUtzRCxhQUFMLENBQW1CRixDQUFuQjtBQUNEO0FBQ0Y7O0FBRUQsV0FBS0ssV0FBTCxDQUFpQnpELEtBQWpCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdFBBO0FBQUE7QUFBQSxXQXVQRSxxQkFBWUEsS0FBWixFQUFtQjtBQUNqQixVQUFNaUQsR0FBRyxHQUFHQyxJQUFJLENBQUNELEdBQUwsRUFBWjs7QUFFQSxXQUFLLElBQUlHLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzlDLFlBQUwsQ0FBa0IrQyxNQUF0QyxFQUE4Q0QsQ0FBQyxFQUEvQyxFQUFtRDtBQUNqRCxZQUFJLENBQUMsS0FBSzdDLFNBQUwsQ0FBZTZDLENBQWYsQ0FBTCxFQUF3QjtBQUN0QjtBQUNBO0FBQ0Q7O0FBQ0QsWUFBSSxLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxLQUFvQixLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxJQUFtQkgsR0FBM0MsRUFBZ0Q7QUFDOUM7QUFDQSxlQUFLSyxhQUFMLENBQW1CRixDQUFuQjtBQUNBO0FBQ0Q7O0FBRUQsYUFBSzlDLFlBQUwsQ0FBa0I4QyxDQUFsQixFQUFxQk8sVUFBckIsQ0FBZ0MzRCxLQUFoQztBQUVBLFlBQU00RCxPQUFPLEdBQUcsQ0FBQyxLQUFLbkQsUUFBTCxDQUFjMkMsQ0FBZCxDQUFqQjtBQUNBLFlBQU1TLFNBQVMsR0FBRyxLQUFLcEQsUUFBTCxDQUFjMkMsQ0FBZCxJQUFtQkgsR0FBckM7QUFDQSxZQUFNYSxVQUFVLEdBQUcsS0FBS3BELFNBQUwsSUFBa0IsS0FBS0osWUFBTCxDQUFrQjhDLENBQWxCLENBQXJDOztBQUVBLFlBQUksQ0FBQ1UsVUFBRCxLQUFnQkYsT0FBTyxJQUFJQyxTQUEzQixDQUFKLEVBQTJDO0FBQ3pDLGVBQUtQLGFBQUwsQ0FBbUJGLENBQW5CO0FBQ0Q7QUFDRjs7QUFFRCxXQUFLSyxXQUFMLENBQWlCekQsS0FBakI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4UkE7QUFBQTtBQUFBLFdBeVJFLHdCQUFlQSxLQUFmLEVBQXNCO0FBQ3BCLFdBQUssSUFBSW9ELENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzlDLFlBQUwsQ0FBa0IrQyxNQUF0QyxFQUE4Q0QsQ0FBQyxFQUEvQyxFQUFtRDtBQUNqRCxhQUFLVyxlQUFMLENBQXFCWCxDQUFyQjtBQUNEOztBQUNELFdBQUtLLFdBQUwsQ0FBaUJ6RCxLQUFqQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBelNBO0FBQUE7QUFBQSxXQTBTRSxzQkFBYXdDLFVBQWIsRUFBeUJ3QixNQUF6QixFQUFpQztBQUMvQjtBQUNBLFVBQUksS0FBS3RELFNBQVQsRUFBb0I7QUFDbEI4QixRQUFBQSxVQUFVLENBQUN5QixZQUFYO0FBQ0E7QUFDRDs7QUFFRDtBQUNBO0FBQ0EsVUFBTWhCLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7O0FBQ0EsV0FBSyxJQUFJRyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUs5QyxZQUFMLENBQWtCK0MsTUFBdEMsRUFBOENELENBQUMsRUFBL0MsRUFBbUQ7QUFDakQsWUFBSSxLQUFLOUMsWUFBTCxDQUFrQjhDLENBQWxCLEtBQXdCWixVQUE1QixFQUF3QztBQUN0QyxlQUFLaEMsTUFBTCxDQUFZNEMsQ0FBWixJQUFpQkgsR0FBRyxHQUFHZSxNQUF2QjtBQUNBLGVBQUt2RCxRQUFMLENBQWMyQyxDQUFkLElBQW1CLENBQW5CO0FBQ0Q7QUFDRjs7QUFDRCxXQUFLakIsZUFBTCxHQUF1QixJQUF2QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2VUE7QUFBQTtBQUFBLFdBd1VFLHdCQUFlSyxVQUFmLEVBQTJCMEIsUUFBM0IsRUFBcUM7QUFDbkM7QUFDQSxVQUFJLEtBQUt4RCxTQUFULEVBQW9CO0FBQ2xCOEIsUUFBQUEsVUFBVSxDQUFDeUIsWUFBWDtBQUNBO0FBQ0Q7O0FBRUQsVUFBTWhCLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7O0FBQ0EsV0FBSyxJQUFJRyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUs5QyxZQUFMLENBQWtCK0MsTUFBdEMsRUFBOENELENBQUMsRUFBL0MsRUFBbUQ7QUFDakQsWUFBSSxLQUFLOUMsWUFBTCxDQUFrQjhDLENBQWxCLEtBQXdCWixVQUE1QixFQUF3QztBQUN0QyxlQUFLL0IsUUFBTCxDQUFjMkMsQ0FBZCxJQUFtQkgsR0FBRyxHQUFHaUIsUUFBekI7QUFDRDtBQUNGO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlWQTtBQUFBO0FBQUEsV0ErVkUsb0JBQVcxQixVQUFYLEVBQXVCO0FBQ3JCLFVBQUksS0FBSzlCLFNBQUwsSUFBa0I4QixVQUF0QixFQUFrQztBQUNoQyxhQUFLOUIsU0FBTCxHQUFpQixJQUFqQjtBQUNBLGFBQUtHLFlBQUwsR0FBb0IsSUFBcEI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL1dBO0FBQUE7QUFBQSxXQWdYRSxxQkFBWTJCLFVBQVosRUFBd0IxQyxJQUF4QixFQUE4QkUsS0FBOUIsRUFBcUM7QUFDbkNQLE1BQUFBLFNBQVMsQ0FDUCxLQUFLaUIsU0FBTCxJQUFrQjhCLFVBRFgsRUFFUCx5Q0FGTyxFQUdQQSxVQUFVLENBQUNDLE9BQVgsRUFITyxDQUFUO0FBS0EsVUFBTUMsVUFBVSxHQUFHLEtBQUt0QixZQUFMLENBQWtCb0IsVUFBVSxDQUFDQyxPQUFYLEVBQWxCLENBQW5COztBQUNBLFVBQUlDLFVBQUosRUFBZ0I7QUFDZEEsUUFBQUEsVUFBVSxDQUFDUyxJQUFYLENBQ0UsSUFBSXZELE9BQUosQ0FBWTRDLFVBQVUsQ0FBQ0MsT0FBWCxFQUFaLEVBQWtDM0MsSUFBbEMsRUFBd0NvRCxJQUFJLENBQUNELEdBQUwsRUFBeEMsRUFBb0RqRCxLQUFwRCxDQURGO0FBR0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWpZQTtBQUFBO0FBQUEsV0FrWUUscUJBQVlBLEtBQVosRUFBbUI7QUFDakIsVUFBSW1FLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBS3pELFNBQVAsSUFBb0IsS0FBS0csWUFBM0M7QUFDQSxXQUFLQSxZQUFMLEdBQW9CLEtBQXBCOztBQUNBLFVBQUksQ0FBQ3NELFdBQUwsRUFBa0I7QUFDaEIsWUFBTWxCLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7O0FBQ0EsYUFBSyxJQUFJRyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUs5QyxZQUFMLENBQWtCK0MsTUFBdEMsRUFBOENELENBQUMsRUFBL0MsRUFBbUQ7QUFDakQsY0FBSSxLQUFLNUMsTUFBTCxDQUFZNEMsQ0FBWixLQUFtQixLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxLQUFvQixLQUFLM0MsUUFBTCxDQUFjMkMsQ0FBZCxLQUFvQkgsR0FBL0QsRUFBcUU7QUFDbkVrQixZQUFBQSxXQUFXLEdBQUcsSUFBZDtBQUNBO0FBQ0Q7QUFDRjtBQUNGOztBQUNELFVBQUlBLFdBQUosRUFBaUI7QUFDZm5FLFFBQUFBLEtBQUssQ0FBQ29FLGVBQU47O0FBQ0EsWUFBSSxDQUFDLEtBQUt6RCx3QkFBVixFQUFvQztBQUNsQ1gsVUFBQUEsS0FBSyxDQUFDcUUsY0FBTjtBQUNEO0FBQ0YsT0FMRCxNQUtPLElBQUksS0FBS3pELHNCQUFULEVBQWlDO0FBQ3RDWixRQUFBQSxLQUFLLENBQUNvRSxlQUFOO0FBQ0Q7O0FBQ0QsVUFBSSxLQUFLakMsZUFBVCxFQUEwQjtBQUN4QixhQUFLQSxlQUFMLEdBQXVCLEtBQXZCO0FBQ0EsYUFBS2xCLE9BQUw7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFoYUE7QUFBQTtBQUFBLFdBaWFFLG1CQUFVO0FBQ1IsVUFBTWdDLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7QUFFQTtBQUNBO0FBQ0EsVUFBSXFCLFVBQVUsR0FBRyxDQUFDLENBQWxCOztBQUNBLFdBQUssSUFBSWxCLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzlDLFlBQUwsQ0FBa0IrQyxNQUF0QyxFQUE4Q0QsQ0FBQyxFQUEvQyxFQUFtRDtBQUNqRCxZQUFJLENBQUMsS0FBSzVDLE1BQUwsQ0FBWTRDLENBQVosQ0FBTCxFQUFxQjtBQUNuQixjQUFJLEtBQUszQyxRQUFMLENBQWMyQyxDQUFkLEtBQW9CLEtBQUszQyxRQUFMLENBQWMyQyxDQUFkLElBQW1CSCxHQUEzQyxFQUFnRDtBQUM5QztBQUNBLGlCQUFLSyxhQUFMLENBQW1CRixDQUFuQjtBQUNEOztBQUNEO0FBQ0Q7O0FBQ0QsWUFBSWtCLFVBQVUsSUFBSSxDQUFDLENBQWYsSUFBb0IsS0FBSzlELE1BQUwsQ0FBWTRDLENBQVosSUFBaUIsS0FBSzVDLE1BQUwsQ0FBWThELFVBQVosQ0FBekMsRUFBa0U7QUFDaEVBLFVBQUFBLFVBQVUsR0FBR2xCLENBQWI7QUFDRDtBQUNGOztBQUVELFVBQUlrQixVQUFVLElBQUksQ0FBQyxDQUFuQixFQUFzQjtBQUNwQjtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJQyxRQUFRLEdBQUcsQ0FBZjs7QUFDQSxXQUFLLElBQUluQixFQUFDLEdBQUcsQ0FBYixFQUFnQkEsRUFBQyxHQUFHLEtBQUs5QyxZQUFMLENBQWtCK0MsTUFBdEMsRUFBOENELEVBQUMsRUFBL0MsRUFBbUQ7QUFDakQsWUFBSSxLQUFLNUMsTUFBTCxDQUFZNEMsRUFBWixLQUFrQixDQUFDLEtBQUs3QyxTQUFMLENBQWU2QyxFQUFmLENBQXZCLEVBQTBDO0FBQ3hDO0FBQ0Q7O0FBQ0RtQixRQUFBQSxRQUFRLEdBQUdDLElBQUksQ0FBQ0MsR0FBTCxDQUFTRixRQUFULEVBQW1CLEtBQUs5RCxRQUFMLENBQWMyQyxFQUFkLElBQW1CSCxHQUF0QyxDQUFYO0FBQ0Q7O0FBRUQsVUFBSXNCLFFBQVEsR0FBRyxDQUFmLEVBQWtCO0FBQ2hCO0FBQ0EsYUFBS0csY0FBTCxDQUFvQkosVUFBcEI7QUFDQTtBQUNEOztBQUVEO0FBQ0EsV0FBS3hELEtBQUwsQ0FBVzZELFFBQVgsQ0FBb0JKLFFBQXBCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQWhkQTtBQUFBO0FBQUEsV0FpZEUsd0JBQWV6QixLQUFmLEVBQXNCO0FBQ3BCLFVBQU1OLFVBQVUsR0FBRyxLQUFLbEMsWUFBTCxDQUFrQndDLEtBQWxCLENBQW5COztBQUNBLFdBQUssSUFBSU0sQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLOUMsWUFBTCxDQUFrQitDLE1BQXRDLEVBQThDRCxDQUFDLEVBQS9DLEVBQW1EO0FBQ2pELFlBQUlBLENBQUMsSUFBSU4sS0FBVCxFQUFnQjtBQUNkLGVBQUtpQixlQUFMLENBQXFCWCxDQUFyQjtBQUNEO0FBQ0Y7O0FBQ0QsV0FBSzVDLE1BQUwsQ0FBWXNDLEtBQVosSUFBcUIsQ0FBckI7QUFDQSxXQUFLckMsUUFBTCxDQUFjcUMsS0FBZCxJQUF1QixDQUF2QjtBQUNBLFdBQUtwQyxTQUFMLEdBQWlCOEIsVUFBakI7QUFDQUEsTUFBQUEsVUFBVSxDQUFDb0MsV0FBWDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBamVBO0FBQUE7QUFBQSxXQWtlRSx3QkFBZTlCLEtBQWYsRUFBc0I7QUFDcEIsV0FBS3ZDLFNBQUwsQ0FBZXVDLEtBQWYsSUFBd0IsSUFBeEI7QUFDQSxXQUFLckMsUUFBTCxDQUFjcUMsS0FBZCxJQUF1QixDQUF2QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBMWVBO0FBQUE7QUFBQSxXQTJlRSx1QkFBY0EsS0FBZCxFQUFxQjtBQUNuQixXQUFLdkMsU0FBTCxDQUFldUMsS0FBZixJQUF3QixLQUF4QjtBQUNBLFdBQUtyQyxRQUFMLENBQWNxQyxLQUFkLElBQXVCLENBQXZCOztBQUNBLFVBQUksQ0FBQyxLQUFLdEMsTUFBTCxDQUFZc0MsS0FBWixDQUFMLEVBQXlCO0FBQ3ZCLGFBQUt4QyxZQUFMLENBQWtCd0MsS0FBbEIsRUFBeUJtQixZQUF6QjtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF0ZkE7QUFBQTtBQUFBLFdBdWZFLHlCQUFnQm5CLEtBQWhCLEVBQXVCO0FBQ3JCLFdBQUt0QyxNQUFMLENBQVlzQyxLQUFaLElBQXFCLENBQXJCO0FBQ0EsV0FBS1EsYUFBTCxDQUFtQlIsS0FBbkI7QUFDRDtBQTFmSDtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsaUJBQ0U1QyxPQURGLEVBRUUyRSwyQkFGRixFQUdFQyx5QkFIRixFQUlFO0FBQUEsVUFGQUQsMkJBRUE7QUFGQUEsUUFBQUEsMkJBRUEsR0FGOEIsS0FFOUI7QUFBQTs7QUFBQSxVQURBQyx5QkFDQTtBQURBQSxRQUFBQSx5QkFDQSxHQUQ0QixLQUM1QjtBQUFBOztBQUNBLFVBQUlDLEdBQUcsR0FBRzdFLE9BQU8sQ0FBQ1AsS0FBRCxDQUFqQjs7QUFDQSxVQUFJLENBQUNvRixHQUFMLEVBQVU7QUFDUkEsUUFBQUEsR0FBRyxHQUFHLElBQUk5RSxRQUFKLENBQ0pDLE9BREksRUFFSjJFLDJCQUZJLEVBR0pDLHlCQUhJLENBQU47QUFLQTVFLFFBQUFBLE9BQU8sQ0FBQ1AsS0FBRCxDQUFQLEdBQWlCb0YsR0FBakI7QUFDRDs7QUFDRCxhQUFPQSxHQUFQO0FBQ0Q7QUF4Qkg7O0FBQUE7QUFBQTs7QUE2ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsaUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLDZCQUFZbkYsSUFBWixFQUFrQm9GLE9BQWxCLEVBQTJCO0FBQUE7O0FBQ3pCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhckYsSUFBYjs7QUFFQTtBQUNBLFNBQUtzRixRQUFMLEdBQWdCRixPQUFoQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFqQkE7QUFBQTtBQUFBLFdBa0JFLG1CQUFVO0FBQ1IsYUFBTyxLQUFLQyxLQUFaO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdCQTtBQUFBO0FBQUEsV0E4QkUscUJBQVlsQixNQUFaLEVBQW9CO0FBQ2xCLFdBQUttQixRQUFMLENBQWNDLFlBQWQsQ0FBMkIsSUFBM0IsRUFBaUNwQixNQUFqQztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF6Q0E7QUFBQTtBQUFBLFdBMENFLHVCQUFjRSxRQUFkLEVBQXdCO0FBQ3RCLFdBQUtpQixRQUFMLENBQWNFLGNBQWQsQ0FBNkIsSUFBN0IsRUFBbUNuQixRQUFuQztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5EQTtBQUFBO0FBQUEsV0FvREUscUJBQVk7QUFDVixXQUFLaUIsUUFBTCxDQUFjRyxVQUFkLENBQXlCLElBQXpCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5REE7QUFBQTtBQUFBLFdBK0RFLG9CQUFXeEYsSUFBWCxFQUFpQkUsS0FBakIsRUFBd0I7QUFDdEIsV0FBS21GLFFBQUwsQ0FBY0ksV0FBZCxDQUEwQixJQUExQixFQUFnQ3pGLElBQWhDLEVBQXNDRSxLQUF0QztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhFQTtBQUFBO0FBQUEsV0F5RUUsdUJBQWMsQ0FBRTtBQUVoQjtBQUNGO0FBQ0E7QUFDQTs7QUE5RUE7QUFBQTtBQUFBLFdBK0VFLHdCQUFlLENBQUU7QUFFakI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdkZBO0FBQUE7QUFBQSxXQXdGRSxzQkFBYXdGLFdBQWIsRUFBMEI7QUFDeEIsYUFBTyxLQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFsR0E7QUFBQTtBQUFBLFdBbUdFLHFCQUFZQSxXQUFaLEVBQXlCO0FBQ3ZCLGFBQU8sS0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBN0dBO0FBQUE7QUFBQSxXQThHRSxvQkFBV0EsV0FBWCxFQUF3QixDQUFFO0FBOUc1Qjs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9vYnNlcnZhYmxlJztcbmltcG9ydCB7c3VwcG9ydHNQYXNzaXZlRXZlbnRMaXN0ZW5lcn0gZnJvbSAnLi9jb3JlL2RvbS9ldmVudC1oZWxwZXItbGlzdGVuJztcbmltcG9ydCB7ZmluZEluZGV4fSBmcm9tICcuL2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnLi9jb3JlL3dpbmRvdyc7XG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtQYXNzfSBmcm9tICcuL3Bhc3MnO1xuXG5jb25zdCBQUk9QXyA9ICdfX0FNUF9HZXN0dXJlcyc7XG5cbi8qKlxuICogQSBnZXN0dXJlIG9iamVjdCBjb250YWlucyB0aGUgdHlwZSBhbmQgZGF0YSBvZiB0aGUgZ2VzdHVyZSBzdWNoIGFzXG4gKiBhIHRhcCBvciBhIGRvdWJsZS10YXAgb3IgYSBzd2lwZS4gU2VlIHtAbGluayBHZXN0dXJlUmVjb2duaXplcn0gZm9yXG4gKiBtb3JlIGRldGFpbHMuXG4gKiBAc3RydWN0XG4gKiBAY29uc3RcbiAqIEB0ZW1wbGF0ZSBEQVRBXG4gKi9cbmV4cG9ydCBjbGFzcyBHZXN0dXJlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBnZXN0dXJlJ3Mgc3RyaW5nIHR5cGUuXG4gICAqIEBwYXJhbSB7REFUQX0gZGF0YSBUaGUgZGF0YSBvZiB0aGUgZ2VzdHVyZS5cbiAgICogQHBhcmFtIHt0aW1lfSB0aW1lIFRoZSB0aW1lIHRoYXQgdGhlIGdlc3R1cmUgaGFzIGJlZW4gZW1pdHRlZC5cbiAgICogQHBhcmFtIHs/RXZlbnR9IGV2ZW50IEFuIG9wdGlvbmFsIGJyb3dzZXIgZXZlbnQgdGhhdCByZXN1bHRlZCBpbiB0aGVcbiAgICogICBnZXN0dXJlLlxuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZSwgZGF0YSwgdGltZSwgZXZlbnQpIHtcbiAgICAvKiogQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAvKiogQGNvbnN0IHtEQVRBfSAqL1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMudGltZSA9IHRpbWU7XG4gICAgLyoqIEBjb25zdCB7P0V2ZW50fSAqL1xuICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgfVxufVxuXG4vKipcbiAqIEdlc3R1cmVzIG9iamVjdCBtYW5hZ2VzIGFsbCBnZXN0dXJlcyBvbiBhIHBhcnRpY3VsYXIgZWxlbWVudC4gSXQgbGlzdGVuc1xuICogdG8gYWxsIHBvaW50ZXIgZXZlbnRzIGFuZCBkZWxlZ2F0ZXMgdGhlbSB0byBpbmRpdmlkdWFsIGdlc3R1cmUgcmVjb2duaXplcnMuXG4gKiBXaGVuIGEgcmVjb2duaXplciBoYXMgcmVjb2duaXplZCBhIGdlc3R1cmUgYW5kIHJlYWR5IHRvIHN0YXJ0IGVtaXR0aW5nIGl0XG4gKiBpdCByZXF1ZXN0cyBwZXJtaXNzaW9uIHRvIGRvIHNvIGZyb20gdGhpcyBjbGFzcyB3aGljaCByZXNvbHZlcyBjb25mbGljdHNcbiAqIGJldHdlZW4gY29tcGV0aW5nIHJlY29nbml6ZXJzIHRvIGRlY2lkZSB3aGljaCBnZXN0dXJlIHNob3VsZCBnbyBmb3J3YXJkLlxuICovXG5leHBvcnQgY2xhc3MgR2VzdHVyZXMge1xuICAvKipcbiAgICogQ3JlYXRlcyBpZiBub3QgeWV0IGNyZWF0ZWQgYW5kIHJldHVybnMgdGhlIHNoYXJlZCBHZXN0dXJlcyBpbnN0YW5jZSBmb3JcbiAgICogdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9zaG91bGROb3RQcmV2ZW50RGVmYXVsdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc2hvdWxkU3RvcFByb3BhZ2F0aW9uXG4gICAqIEByZXR1cm4geyFHZXN0dXJlc31cbiAgICovXG4gIHN0YXRpYyBnZXQoXG4gICAgZWxlbWVudCxcbiAgICBvcHRfc2hvdWxkTm90UHJldmVudERlZmF1bHQgPSBmYWxzZSxcbiAgICBvcHRfc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IHJlcyA9IGVsZW1lbnRbUFJPUF9dO1xuICAgIGlmICghcmVzKSB7XG4gICAgICByZXMgPSBuZXcgR2VzdHVyZXMoXG4gICAgICAgIGVsZW1lbnQsXG4gICAgICAgIG9wdF9zaG91bGROb3RQcmV2ZW50RGVmYXVsdCxcbiAgICAgICAgb3B0X3Nob3VsZFN0b3BQcm9wYWdhdGlvblxuICAgICAgKTtcbiAgICAgIGVsZW1lbnRbUFJPUF9dID0gcmVzO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG91bGROb3RQcmV2ZW50RGVmYXVsdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3VsZFN0b3BQcm9wYWdhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgc2hvdWxkTm90UHJldmVudERlZmF1bHQsIHNob3VsZFN0b3BQcm9wYWdhdGlvbikge1xuICAgIC8qKiBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhR2VzdHVyZVJlY29nbml6ZXI+fSAqL1xuICAgIHRoaXMucmVjb2duaXplcnNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTxib29sZWFuPn0gKi9cbiAgICB0aGlzLnRyYWNraW5nXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8dGltZT59ICovXG4gICAgdGhpcy5yZWFkeV8gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PHRpbWU+fSAqL1xuICAgIHRoaXMucGVuZGluZ18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0dlc3R1cmVSZWNvZ25pemVyfSAqL1xuICAgIHRoaXMuZXZlbnRpbmdfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnNob3VsZE5vdFByZXZlbnREZWZhdWx0XyA9IHNob3VsZE5vdFByZXZlbnREZWZhdWx0O1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuc2hvdWxkU3RvcFByb3BhZ2F0aW9uXyA9IHNob3VsZFN0b3BQcm9wYWdhdGlvbjtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgdmFyaWFibGUgaW5kaWNhdGVzIHRoYXQgdGhlIGV2ZW50aW5nIGhhcyBzdG9wcGVkIG9uIHRoaXNcbiAgICAgKiBldmVudCBjeWNsZS5cbiAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLndhc0V2ZW50aW5nXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshUGFzc30gKi9cbiAgICB0aGlzLnBhc3NfID0gbmV3IFBhc3MoXG4gICAgICB0b1dpbihlbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpLFxuICAgICAgdGhpcy5kb1Bhc3NfLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JzZXJ2YWJsZX0gKi9cbiAgICB0aGlzLnBvaW50ZXJEb3duT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqXG4gICAgICogT2JzZXJ2ZXJzIGZvciBlYWNoIHR5cGUgb2YgcmVnaXN0ZXJlZCBnZXN0dXJlIHR5cGVzLlxuICAgICAqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgIU9ic2VydmFibGU8IUdlc3R1cmU+Pn1cbiAgICAgKi9cbiAgICB0aGlzLm92ZXJzZXJ2ZXJzXyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbighRXZlbnQpfSAqL1xuICAgIHRoaXMuYm91bmRPblRvdWNoU3RhcnRfID0gdGhpcy5vblRvdWNoU3RhcnRfLmJpbmQodGhpcyk7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oIUV2ZW50KX0gKi9cbiAgICB0aGlzLmJvdW5kT25Ub3VjaEVuZF8gPSB0aGlzLm9uVG91Y2hFbmRfLmJpbmQodGhpcyk7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oIUV2ZW50KX0gKi9cbiAgICB0aGlzLmJvdW5kT25Ub3VjaE1vdmVfID0gdGhpcy5vblRvdWNoTW92ZV8uYmluZCh0aGlzKTtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbighRXZlbnQpfSAqL1xuICAgIHRoaXMuYm91bmRPblRvdWNoQ2FuY2VsXyA9IHRoaXMub25Ub3VjaENhbmNlbF8uYmluZCh0aGlzKTtcblxuICAgIGNvbnN0IHdpbiA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICBjb25zdCBwYXNzaXZlU3VwcG9ydGVkID0gc3VwcG9ydHNQYXNzaXZlRXZlbnRMaXN0ZW5lcih0b1dpbih3aW4pKTtcbiAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAndG91Y2hzdGFydCcsXG4gICAgICB0aGlzLmJvdW5kT25Ub3VjaFN0YXJ0XyxcbiAgICAgIHBhc3NpdmVTdXBwb3J0ZWQgPyB7cGFzc2l2ZTogdHJ1ZX0gOiBmYWxzZVxuICAgICk7XG4gICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuYm91bmRPblRvdWNoRW5kXyk7XG4gICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3RvdWNobW92ZScsXG4gICAgICB0aGlzLmJvdW5kT25Ub3VjaE1vdmVfLFxuICAgICAgcGFzc2l2ZVN1cHBvcnRlZCA/IHtwYXNzaXZlOiB0cnVlfSA6IGZhbHNlXG4gICAgKTtcbiAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5ib3VuZE9uVG91Y2hDYW5jZWxfKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnBhc3NBZnRlckV2ZW50XyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc3Vic2NyaWJlcyBmcm9tIGFsbCBwb2ludGVyIGV2ZW50cyBhbmQgcmVtb3ZlcyB0aGUgc2hhcmVkIGNhY2hlIGluc3RhbmNlLlxuICAgKi9cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLmJvdW5kT25Ub3VjaFN0YXJ0Xyk7XG4gICAgdGhpcy5lbGVtZW50Xy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuYm91bmRPblRvdWNoRW5kXyk7XG4gICAgdGhpcy5lbGVtZW50Xy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLmJvdW5kT25Ub3VjaE1vdmVfKTtcbiAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5ib3VuZE9uVG91Y2hDYW5jZWxfKTtcbiAgICBkZWxldGUgdGhpcy5lbGVtZW50X1tQUk9QX107XG4gICAgdGhpcy5wYXNzXy5jYW5jZWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGEgZ2VzdHVyZSBlbWl0dGVkIGJ5IHRoZSBzcGVjaWZpZWQgcmVjb2duaXplci4gRm9yIGEgZmlyc3RcbiAgICogZ2VzdHVyZSBoYW5kbGVyIHJlZ2lzdGVyZWQgaW4gdGhpcyBtZXRob2QgdGhlIHJlY29nbml6ZXIgaXMgaW5zdGFsbGVkXG4gICAqIGFuZCBmcm9tIHRoYXQgcG9pbnQgb24gaXQgcGFydGljaXBhdGVzIGluIHRoZSBldmVudCBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG5ldzpHZXN0dXJlUmVjb2duaXplciwgIUdlc3R1cmVzKX0gcmVjb2duaXplckNvbnN0clxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFHZXN0dXJlKX0gaGFuZGxlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqIEB0ZW1wbGF0ZSBEQVRBXG4gICAqL1xuICBvbkdlc3R1cmUocmVjb2duaXplckNvbnN0ciwgaGFuZGxlcikge1xuICAgIGNvbnN0IHJlY29nbml6ZXIgPSBuZXcgcmVjb2duaXplckNvbnN0cih0aGlzKTtcbiAgICBjb25zdCB0eXBlID0gcmVjb2duaXplci5nZXRUeXBlKCk7XG4gICAgbGV0IG92ZXJzZXJ2ZXIgPSB0aGlzLm92ZXJzZXJ2ZXJzX1t0eXBlXTtcbiAgICBpZiAoIW92ZXJzZXJ2ZXIpIHtcbiAgICAgIHRoaXMucmVjb2duaXplcnNfLnB1c2gocmVjb2duaXplcik7XG4gICAgICBvdmVyc2VydmVyID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICAgIHRoaXMub3ZlcnNlcnZlcnNfW3R5cGVdID0gb3ZlcnNlcnZlcjtcbiAgICB9XG4gICAgcmV0dXJuIG92ZXJzZXJ2ZXIuYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc3Vic2NyaWJlcyBhbGwgaGFuZGxlcnMgZnJvbSB0aGUgZ2l2ZW4gZ2VzdHVyZSByZWNvZ25pemVyLiBSZXR1cm5zXG4gICAqIHRydWUgaWYgYW55dGhpbmcgd2FzIGRvbmUuIFJldHVybnMgZmFsc2UgaWYgdGhlcmUgd2VyZSBubyBoYW5kbGVyc1xuICAgKiByZWdpc3RlcmVkIG9uIHRoZSBnaXZlbiBnZXN0dXJlIHJlY29nbml6ZXIgaW4gZmlyc3QgcGxhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24obmV3Okdlc3R1cmVSZWNvZ25pemVyLCAhR2VzdHVyZXMpfSByZWNvZ25pemVyQ29uc3RyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICByZW1vdmVHZXN0dXJlKHJlY29nbml6ZXJDb25zdHIpIHtcbiAgICBjb25zdCB0eXBlID0gbmV3IHJlY29nbml6ZXJDb25zdHIodGhpcykuZ2V0VHlwZSgpO1xuICAgIGNvbnN0IG92ZXJzZXJ2ZXIgPSB0aGlzLm92ZXJzZXJ2ZXJzX1t0eXBlXTtcbiAgICBpZiAob3ZlcnNlcnZlcikge1xuICAgICAgb3ZlcnNlcnZlci5yZW1vdmVBbGwoKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gZmluZEluZGV4KHRoaXMucmVjb2duaXplcnNfLCAoZSkgPT4gZS5nZXRUeXBlKCkgPT0gdHlwZSk7XG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIFJlbW92ZSB0aGUgcmVjb2duaXplciBhcyB3ZWxsIGFzIGFsbCBhc3NvY2lhdGVkIHRyYWNraW5nIHN0YXRlXG4gICAgICB0aGlzLnJlY29nbml6ZXJzXy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5yZWFkeV8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMucGVuZGluZ18uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMudHJhY2tpbmdfLnNwbGljZShpbmRleCwgMSk7XG4gICAgICBkZWxldGUgdGhpcy5vdmVyc2VydmVyc19bdHlwZV07XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIHBvaW50ZXIgZG93biBldmVudHMsIHN1Y2ggYXMgXCJ0b3VjaHN0YXJ0XCIgb3IgXCJtb3VzZWRvd25cIi5cbiAgICogQHBhcmFtIHshRnVuY3Rpb259IGhhbmRsZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25Qb2ludGVyRG93bihoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRlckRvd25PYnNlcnZhYmxlXy5hZGQoaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbGwgXCJ0b3VjaHN0YXJ0XCIgZXZlbnRzIGFuZCBkaXNwYXRjaGVzIHRoZW0gdG8gdGhlIHRyYWNraW5nXG4gICAqIHJlY29nbml6ZXJzLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVG91Y2hTdGFydF8oZXZlbnQpIHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMud2FzRXZlbnRpbmdfID0gZmFsc2U7XG5cbiAgICB0aGlzLnBvaW50ZXJEb3duT2JzZXJ2YWJsZV8uZmlyZShldmVudCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVjb2duaXplcnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeV9baV0pIHtcbiAgICAgICAgLy8gSWYgdGhlIHJlY29nbml6ZXIgaXMgaW4gdGhlIFwicmVhZHlcIiBzdGF0ZSwgaXQgd29uJ3QgcmVjZWl2ZVxuICAgICAgICAvLyBhbnkgbW9yZSB0b3VjaCBzZXJpZXMgdW50aWwgaXQncyBhbGxvd2VkIHRvIGVtaXQuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZ19baV0gJiYgdGhpcy5wZW5kaW5nX1tpXSA8IG5vdykge1xuICAgICAgICAvLyBQZW5kaW5nIHN0YXRlIGV4cGlyZWQuIFJlc2V0LlxuICAgICAgICB0aGlzLnN0b3BUcmFja2luZ18oaSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZWNvZ25pemVyc19baV0ub25Ub3VjaFN0YXJ0KGV2ZW50KSkge1xuICAgICAgICAvLyBXaGVuIGEgcmVjb2duaXplciBpcyBpbnRlcmVzdGVkIGluIHRoZSB0b3VjaCBzZXJpZXMgaXQgcmV0dXJucyBcInRydWVcIlxuICAgICAgICAvLyBmcm9tIGl0cyBvblRvdWNoU3RhcnQgbWV0aG9kLiBGb3IgdGhpcyByZWNvZ25pemVyIHdlIHN0YXJ0IHRyYWNraW5nXG4gICAgICAgIC8vIHRoZSB3aG9sZSBzZXJpZXMgb2YgdG91Y2ggZXZlbnRzIGZyb20gdG91Y2hzdGFydCB0byB0b3VjaGVuZC4gT3RoZXJcbiAgICAgICAgLy8gcmVjb2duaXplcnMgd2lsbCBub3QgcmVjZWl2ZSB0aGVtIHVubGVzcyB0aGV5IHJldHVybiBcInRydWVcIiBmcm9tXG4gICAgICAgIC8vIG9uVG91Y2hTdGFydC5cbiAgICAgICAgdGhpcy5zdGFydFRyYWNraW5nXyhpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFmdGVyRXZlbnRfKGV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFsbCBcInRvdWNobW92ZVwiIGV2ZW50cyBhbmQgZGlzcGF0Y2hlcyB0aGVtIHRvIHRoZSB0cmFja2luZ1xuICAgKiByZWNvZ25pemVycy5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoTW92ZV8oZXZlbnQpIHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY29nbml6ZXJzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLnRyYWNraW5nX1tpXSkge1xuICAgICAgICAvLyBUaGUgd2hvbGUgdG91Y2ggc2VyaWVzIGFyZSBpZ25vcmVkIGZvciBub24tdHJhY2tpbmcgcmVjb2duaXplcnMuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZ19baV0gJiYgdGhpcy5wZW5kaW5nX1tpXSA8IG5vdykge1xuICAgICAgICAvLyBQZW5kaW5nIHN0YXRlIGV4cGlyZWQuIFJlc2V0LlxuICAgICAgICB0aGlzLnN0b3BUcmFja2luZ18oaSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnJlY29nbml6ZXJzX1tpXS5vblRvdWNoTW92ZShldmVudCkpIHtcbiAgICAgICAgLy8gUmVjb2duaXplciBsb3N0IGludGVyZXN0IGluIHRoZSBzZXJpZXMuIFJlc2V0LlxuICAgICAgICB0aGlzLnN0b3BUcmFja2luZ18oaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hZnRlckV2ZW50XyhldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbGwgXCJ0b3VjaGVuZFwiIGV2ZW50cyBhbmQgZGlzcGF0Y2hlcyB0aGVtIHRvIHRoZSB0cmFja2luZ1xuICAgKiByZWNvZ25pemVycy5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoRW5kXyhldmVudCkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVjb2duaXplcnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRoaXMudHJhY2tpbmdfW2ldKSB7XG4gICAgICAgIC8vIFRoZSB3aG9sZSB0b3VjaCBzZXJpZXMgYXJlIGlnbm9yZWQgZm9yIG5vbi10cmFja2luZyByZWNvZ25pemVycy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZW5kaW5nX1tpXSAmJiB0aGlzLnBlbmRpbmdfW2ldIDwgbm93KSB7XG4gICAgICAgIC8vIFBlbmRpbmcgc3RhdGUgZXhwaXJlZC4gUmVzZXQuXG4gICAgICAgIHRoaXMuc3RvcFRyYWNraW5nXyhpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVjb2duaXplcnNfW2ldLm9uVG91Y2hFbmQoZXZlbnQpO1xuXG4gICAgICBjb25zdCBpc1JlYWR5ID0gIXRoaXMucGVuZGluZ19baV07XG4gICAgICBjb25zdCBpc0V4cGlyZWQgPSB0aGlzLnBlbmRpbmdfW2ldIDwgbm93O1xuICAgICAgY29uc3QgaXNFdmVudGluZyA9IHRoaXMuZXZlbnRpbmdfID09IHRoaXMucmVjb2duaXplcnNfW2ldO1xuXG4gICAgICBpZiAoIWlzRXZlbnRpbmcgJiYgKGlzUmVhZHkgfHwgaXNFeHBpcmVkKSkge1xuICAgICAgICB0aGlzLnN0b3BUcmFja2luZ18oaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hZnRlckV2ZW50XyhldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbGwgXCJ0b3VjaGNhbmNlbFwiIGV2ZW50cy4gQ2FuY2VscyBhbGwgdHJhY2tpbmcvZW1pdHRpbmdcbiAgICogcmVjb2duaXplcnMuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaENhbmNlbF8oZXZlbnQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVjb2duaXplcnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmNhbmNlbEV2ZW50aW5nXyhpKTtcbiAgICB9XG4gICAgdGhpcy5hZnRlckV2ZW50XyhldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIGEgZ2VzdHVyZSByZWNvZ25pemVyIHRvIGNvbW11bmljYXRlIHRoYXQgaXQncyByZWFkeSB0b1xuICAgKiBzdGFydCBlbWl0dGluZyBnZXN0dXJlcy4gR2VzdHVyZXMgaW5zdGFuY2UgbWF5IG9yIG1heSBub3QgYWxsb3cgdGhlXG4gICAqIHJlY29nbml6ZXIgdG8gcHJvY2VlZC5cbiAgICogQHBhcmFtIHshR2VzdHVyZVJlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIHNpZ25hbFJlYWR5XyhyZWNvZ25pemVyLCBvZmZzZXQpIHtcbiAgICAvLyBTb21lYm9keSBnb3QgaGVyZSBmaXJzdC5cbiAgICBpZiAodGhpcy5ldmVudGluZ18pIHtcbiAgICAgIHJlY29nbml6ZXIuYWNjZXB0Q2FuY2VsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSByZWNvZ25pemVyIGFzIHJlYWR5IGFuZCB3YWl0IGZvciB0aGUgcGFzcyB0b1xuICAgIC8vIG1ha2UgdGhlIGRlY2lzaW9uLlxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY29nbml6ZXJzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucmVjb2duaXplcnNfW2ldID09IHJlY29nbml6ZXIpIHtcbiAgICAgICAgdGhpcy5yZWFkeV9baV0gPSBub3cgKyBvZmZzZXQ7XG4gICAgICAgIHRoaXMucGVuZGluZ19baV0gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnBhc3NBZnRlckV2ZW50XyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIGEgZ2VzdHVyZSByZWNvZ25pemVyIHRvIGNvbW11bmljYXRlIHRoYXQgaXQncyBjbG9zZSB0b1xuICAgKiBzdGFydCBlbWl0dGluZyBnZXN0dXJlcywgYnV0IG5lZWRzIG1vcmUgdGltZSB0byBzZWUgbW9yZSBldmVudHMuIE9uY2VcbiAgICogdGhpcyB0aW1lIGV4cGlyZXMgdGhlIHJlY29nbml6ZXIgc2hvdWxkIGVpdGhlciBzaWduYWwgcmVhZGluZXNzIG9yIGl0XG4gICAqIHdpbGwgYmUgY2FuY2VsZWQuXG4gICAqIEBwYXJhbSB7IUdlc3R1cmVSZWNvZ25pemVyfSByZWNvZ25pemVyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lTGVmdFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIHNpZ25hbFBlbmRpbmdfKHJlY29nbml6ZXIsIHRpbWVMZWZ0KSB7XG4gICAgLy8gU29tZWJvZHkgZ290IGhlcmUgZmlyc3QuXG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfKSB7XG4gICAgICByZWNvZ25pemVyLmFjY2VwdENhbmNlbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY29nbml6ZXJzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucmVjb2duaXplcnNfW2ldID09IHJlY29nbml6ZXIpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nX1tpXSA9IG5vdyArIHRpbWVMZWZ0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgYSBnZXN0dXJlIHJlY29nbml6ZXIgdG8gY29tbXVuaWNhdGUgdGhhdCBpdCdzIGRvbmVcbiAgICogZW1pdHRpbmcgZ2VzdHVyZXMuXG4gICAqIEBwYXJhbSB7IUdlc3R1cmVSZWNvZ25pemVyfSByZWNvZ25pemVyXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXN0cmljdGVkXG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgc2lnbmFsRW5kXyhyZWNvZ25pemVyKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRpbmdfID09IHJlY29nbml6ZXIpIHtcbiAgICAgIHRoaXMuZXZlbnRpbmdfID0gbnVsbDtcbiAgICAgIHRoaXMud2FzRXZlbnRpbmdfID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIGEgZ2VzdHVyZSBlbWl0IHRoZSBnZXN0dXJlLiBPbmx5IHRoZSBjdXJyZW50bHkgZW1pdHRpbmdcbiAgICogcmVjb2duaXplciBpcyBhbGxvd2VkIHRvIGVtaXQgZ2VzdHVyZXMuXG4gICAqIEBwYXJhbSB7IUdlc3R1cmVSZWNvZ25pemVyfSByZWNvZ25pemVyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YVxuICAgKiBAcGFyYW0gez9FdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICogQHJlc3RyaWN0ZWRcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBzaWduYWxFbWl0XyhyZWNvZ25pemVyLCBkYXRhLCBldmVudCkge1xuICAgIGRldkFzc2VydChcbiAgICAgIHRoaXMuZXZlbnRpbmdfID09IHJlY29nbml6ZXIsXG4gICAgICAnUmVjb2duaXplciBpcyBub3QgY3VycmVudGx5IGFsbG93ZWQ6ICVzJyxcbiAgICAgIHJlY29nbml6ZXIuZ2V0VHlwZSgpXG4gICAgKTtcbiAgICBjb25zdCBvdmVyc2VydmVyID0gdGhpcy5vdmVyc2VydmVyc19bcmVjb2duaXplci5nZXRUeXBlKCldO1xuICAgIGlmIChvdmVyc2VydmVyKSB7XG4gICAgICBvdmVyc2VydmVyLmZpcmUoXG4gICAgICAgIG5ldyBHZXN0dXJlKHJlY29nbml6ZXIuZ2V0VHlwZSgpLCBkYXRhLCBEYXRlLm5vdygpLCBldmVudClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWZ0ZXJFdmVudF8oZXZlbnQpIHtcbiAgICBsZXQgY2FuY2VsRXZlbnQgPSAhIXRoaXMuZXZlbnRpbmdfIHx8IHRoaXMud2FzRXZlbnRpbmdfO1xuICAgIHRoaXMud2FzRXZlbnRpbmdfID0gZmFsc2U7XG4gICAgaWYgKCFjYW5jZWxFdmVudCkge1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWNvZ25pemVyc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlfW2ldIHx8ICh0aGlzLnBlbmRpbmdfW2ldICYmIHRoaXMucGVuZGluZ19baV0gPj0gbm93KSkge1xuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2FuY2VsRXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgaWYgKCF0aGlzLnNob3VsZE5vdFByZXZlbnREZWZhdWx0Xykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zaG91bGRTdG9wUHJvcGFnYXRpb25fKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFzc0FmdGVyRXZlbnRfKSB7XG4gICAgICB0aGlzLnBhc3NBZnRlckV2ZW50XyA9IGZhbHNlO1xuICAgICAgdGhpcy5kb1Bhc3NfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXNzIHRoYXQgZGVjaWRlcyB3aGljaCByZWNvZ25pemVycyBjYW4gc3RhcnQgZW1pdHRpbmcgYW5kIHdoaWNoXG4gICAqIGFyZSBjYW5jZWxlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRvUGFzc18oKSB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIFRoZSBcIm1vc3QgcmVhZHlcIiByZWNvZ25pemVyIGlzIHRoZSB5b3VuZ2VzdCBpbiB0aGUgXCJyZWFkeVwiIHNldC5cbiAgICAvLyBPdGhlcndpc2Ugd2Ugd291bGRuJ3Qgd2FpdCBmb3IgaXQgYXQgYWxsLlxuICAgIGxldCByZWFkeUluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY29nbml6ZXJzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLnJlYWR5X1tpXSkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nX1tpXSAmJiB0aGlzLnBlbmRpbmdfW2ldIDwgbm93KSB7XG4gICAgICAgICAgLy8gUGVuZGluZyBzdGF0ZSBleHBpcmVkLiBSZXNldC5cbiAgICAgICAgICB0aGlzLnN0b3BUcmFja2luZ18oaSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAocmVhZHlJbmRleCA9PSAtMSB8fCB0aGlzLnJlYWR5X1tpXSA+IHRoaXMucmVhZHlfW3JlYWR5SW5kZXhdKSB7XG4gICAgICAgIHJlYWR5SW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWFkeUluZGV4ID09IC0xKSB7XG4gICAgICAvLyBOb3RoaW5nIHRvIGRvLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIExvb2sgZm9yIGNvbmZsaWN0cy5cbiAgICBsZXQgd2FpdFRpbWUgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWNvZ25pemVyc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5X1tpXSB8fCAhdGhpcy50cmFja2luZ19baV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB3YWl0VGltZSA9IE1hdGgubWF4KHdhaXRUaW1lLCB0aGlzLnBlbmRpbmdfW2ldIC0gbm93KTtcbiAgICB9XG5cbiAgICBpZiAod2FpdFRpbWUgPCAyKSB7XG4gICAgICAvLyBXZSB3YWl0ZWQgbG9uZyBlbm91Z2guXG4gICAgICB0aGlzLnN0YXJ0RXZlbnRpbmdfKHJlYWR5SW5kZXgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNvbWUgY29uZmxpY3RzOiBoYXZlIHRvIHdhaXQgdG8gc2VlIHdobyB3aW5zLlxuICAgIHRoaXMucGFzc18uc2NoZWR1bGUod2FpdFRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgcmVjb2duaXplciBpcyBnaXZlbiBcImdvIGFoZWFkXCIgYW5kIGFsbCBvdGhlcnMgYXJlIGNhbmNlbGVkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0RXZlbnRpbmdfKGluZGV4KSB7XG4gICAgY29uc3QgcmVjb2duaXplciA9IHRoaXMucmVjb2duaXplcnNfW2luZGV4XTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVjb2duaXplcnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSAhPSBpbmRleCkge1xuICAgICAgICB0aGlzLmNhbmNlbEV2ZW50aW5nXyhpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZWFkeV9baW5kZXhdID0gMDtcbiAgICB0aGlzLnBlbmRpbmdfW2luZGV4XSA9IDA7XG4gICAgdGhpcy5ldmVudGluZ18gPSByZWNvZ25pemVyO1xuICAgIHJlY29nbml6ZXIuYWNjZXB0U3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0VHJhY2tpbmdfKGluZGV4KSB7XG4gICAgdGhpcy50cmFja2luZ19baW5kZXhdID0gdHJ1ZTtcbiAgICB0aGlzLnBlbmRpbmdfW2luZGV4XSA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdG9wVHJhY2tpbmdfKGluZGV4KSB7XG4gICAgdGhpcy50cmFja2luZ19baW5kZXhdID0gZmFsc2U7XG4gICAgdGhpcy5wZW5kaW5nX1tpbmRleF0gPSAwO1xuICAgIGlmICghdGhpcy5yZWFkeV9baW5kZXhdKSB7XG4gICAgICB0aGlzLnJlY29nbml6ZXJzX1tpbmRleF0uYWNjZXB0Q2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2FuY2VsRXZlbnRpbmdfKGluZGV4KSB7XG4gICAgdGhpcy5yZWFkeV9baW5kZXhdID0gMDtcbiAgICB0aGlzLnN0b3BUcmFja2luZ18oaW5kZXgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGdlc3R1cmUgcmVjb2duaXplciByZWNlaXZlcyB0aGUgcG9pbnRlciBldmVudHMgZnJvbSBHZXN0dXJlcyBpbnN0YW5jZS5cbiAqIEJhc2VkIG9uIHRoZXNlIGV2ZW50cywgaXQgY2FuIFwicmVjb2duaXplXCIgdGhlIGdlc3R1cmUgaXQncyByZXNwb25zaWJsZSBmb3IsXG4gKiByZXF1ZXN0IHRvIHN0YXJ0IGVtaXR0aW5nIGFuZCBlbWl0IGdlc3R1cmVzLiBHZXN0dXJlcyBpbnN0YW5jZXMgbWFuYWdlc1xuICogc2V2ZXJhbCBjb21wZXRpbmcgcmVjb2duaXplcnMgYW5kIGRlY2lkZXMgd2hpY2ggb25lcyBnZXQgdG8gZW1pdCBnZXN0dXJlc1xuICogYW5kIHdoaWNoIGRvIG5vdC5cbiAqXG4gKiBUaGUgcmVjb2duaXplciBjYW4gYmUgaW4gc2V2ZXJhbCBtYWluIHN0YXRlczpcbiAqIDEuIFRyYWNraW5nIHN0YXRlLiBJbiB0aGlzIHN0YXRlIHRoZSByZWNvZ25pemVyIGlzIHJlY2VpdmluZyB0aGUgc2VyaWVzIG9mXG4gKiAgICB0b3VjaCBldmVudHMgZnJvbSB0b3VjaHN0YXJ0IHRvIHRvdWNoZW5kLiBUbyBnZXQgaW50byB0aGlzIHN0YXRlIHRoZVxuICogICAgcmVjb2duaXplciBoYXMgdG8gcmV0dXJuIFwidHJ1ZVwiIGZyb20gdGhlIHtAbGluayBvblRvdWNoU3RhcnR9LlxuICogMi4gUGVuZGluZyBzdGF0ZSAob3B0aW9uYWwpLiBUaGUgcmVjb2duaXplciBtYXRjaGVkIHBhcnQgb2YgdGhlIGdlc3R1cmUsXG4gKiAgICBidXQgbmVlZHMgbW9yZSB0aW1lIHRvIGdldCB0cmFjayBtb3JlIGV2ZW50cy4gSXQgcmVxdWVzdHMgbW9yZSB0aW1lXG4gKiAgICBieSBjYWxsaW5nIHtAbGluayBzaWduYWxQZW5kaW5nfSwgQnkgdGhlIGVuZCBvZiB0aGlzIHRpbWUgdGhlIHJlY29nbml6ZXJcbiAqICAgIGhhcyBlaXRoZXIgbWF0Y2hlZCB0aGUgZ2VzdHVyZSBvciBoYXMgYmVlbiBjYW5jZWxlZC5cbiAqIDMuIFJlYWR5IHN0YXRlLiBUaGUgcmVjb2duaXplciBtYXRjaGVkIHRoZSB3aG9sZSBnZXN0dXJlIGFuZCByZWFkeSB0byBzdGFydFxuICogICAgZW1pdHRpbmcuIEl0IGNvbW11bmljYXRlcyB0byB0aGUgR2VzdHVyZXMgdGhpcyByZWFkaW5lc3MgYnkgY2FsbGluZ1xuICogICAge0BsaW5rIHNpZ25hbFJlYWR5fS5cbiAqIDUuIEVtaXR0aW5nIHN0YXRlLiBJZiBHZXN0dXJlcyBkZWNpZGVzIHRvIGdvIGFoZWFkIHdpdGggdGhpcyByZWNvZ25pemVyLCBpdFxuICogICAgd2lsbCBjYWxsIHtAbGluayBhY2NlcHRTdGFydH0gbWV0aG9kLiBPdGhlcndpc2UsIGl0IHdpbGwgY2FsbFxuICogICAge0BsaW5rIGFjY2VwdENhbmNlbH0gbWV0aG9kLiBPbmNlIGluIHRoZSBlbWl0dGluZyBzdGF0ZSwgdGhlIHJlY29nbml6ZXJcbiAqICAgIGNhbiBlbWl0IGFueSBudW1iZXIgb2YgZXZlbnRzIGJ5IGNhbGxpbmcge0BsaW5rIHNpZ25hbEVtaXR9LlxuICogNi4gQ29tcGxldGUgc3RhdGUuIE9uY2UgZG9uZSwgdGhlIHJlY29nbml6ZXIgY2FuIGNhbGwge0BsaW5rIHNpZ25hbEVuZH0gdG9cbiAqICAgIGNvbW11bmljYXRlIHRoYXQgaXQncyBkb25lLlxuICpcbiAqIEB0ZW1wbGF0ZSBEQVRBXG4gKi9cbmV4cG9ydCBjbGFzcyBHZXN0dXJlUmVjb2duaXplciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0geyFHZXN0dXJlc30gbWFuYWdlclxuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZSwgbWFuYWdlcikge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbiAgICB0aGlzLnR5cGVfID0gdHlwZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFHZXN0dXJlc30gKi9cbiAgICB0aGlzLm1hbmFnZXJfID0gbWFuYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0eXBlIG9mIHRoZSBnZXN0dXJlIGVtaXR0ZWQgYnkgdGhlIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAqIEl0IGhhcyB0byBiZSB1bmlxdWUgaW4gdGhlIHNjb3BlIG9mIHRoZSBHZXN0dXJlcyBpbnN0YW5jZS5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcmVjb2duaXplciBjYW4gY2FsbCB0aGlzIG1ldGhvZCB0byBjb21tdW5pY2F0ZSB0aGF0IGl0J3MgcmVhZHkgdG9cbiAgICogc3RhcnQgZW1pdHRpbmcgdGhlIGdlc3R1cmUuIE9wdGlvbmFsbHkgaXQgY2FuIHBhc3MgYSB6ZXJvLCBwb3NpdGl2ZSBvclxuICAgKiBuZWdhdGl2ZSBvZmZzZXQgLSBhIHRpbWUgb24gaG93IG11Y2ggdGhlIGdlc3R1cmUgc2hvdWxkIGJlIHBlbmFsaXplZCBvclxuICAgKiBnaXZlbiBhZHZhbnRhZ2UgaW4gY29uZmxpY3QgcmVzb2x1dGlvbi4gVGhlIHJlY29nbml6ZXIgYXQgdGhpcyBwb2ludCBpc1xuICAgKiBpbiB0aGUgXCJyZWFkeVwiIHN0YXRlLlxuICAgKiBAcGFyYW0ge3RpbWV9IG9mZnNldFxuICAgKi9cbiAgc2lnbmFsUmVhZHkob2Zmc2V0KSB7XG4gICAgdGhpcy5tYW5hZ2VyXy5zaWduYWxSZWFkeV8odGhpcywgb2Zmc2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcmVjb2duaXplciBjYW4gY2FsbCB0aGlzIG1ldGhvZCB0byBjb21tdW5pY2F0ZSB0aGF0IGl0IG5lZWRzIG1vcmVcbiAgICogdGltZSAodGltZUxlZnQpIHRvIG1hdGNoIHRoZSBnZXN0dXJlLiBCeSB0aGUgZW5kIG9mIHRoaXMgdGltZSB0aGVcbiAgICogcmVjb2duaXplciBoYXMgdG8gZWl0aGVyIHRyYW5zaXQgdG8gdGhlIHJlYWR5IHN0YXRlIHVzaW5nXG4gICAqIHtAbGluayBzaWduYWxSZWFkeX0gb3IgaXQgd2lsbCBiZSBjYW5jZWxlZC4gVGhlIHJlY29nbml6ZXIgaXMgaW4gdGhlXG4gICAqIFwicGVuZGluZ1wiIHN0YXRlLlxuICAgKiBAcGFyYW0ge3RpbWV9IHRpbWVMZWZ0XG4gICAqL1xuICBzaWduYWxQZW5kaW5nKHRpbWVMZWZ0KSB7XG4gICAgdGhpcy5tYW5hZ2VyXy5zaWduYWxQZW5kaW5nXyh0aGlzLCB0aW1lTGVmdCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlY29nbml6ZXIgY2FuIGNhbGwgdGhpcyBtZXRob2QgdG8gY29tbXVuaWNhdGUgdGhhdCBpdCdzIGRvbmVcbiAgICogZW1pdHRpbmcgdGhlIGdlc3R1cmVzLiBJdCB3aWxsIHJldHVybiB0byB0aGUgd2FpdGluZyBzdGF0ZS4gUmVjb2duaXplclxuICAgKiBjYW4gb25seSBjYWxsIHRoaXMgbWV0aG9kIGlmIGl0IGhhcyBwcmV2aW91c2x5IHJlY2VpdmVkIHRoZVxuICAgKiB7QGxpbmsgYWNjZXB0U3RhcnR9IGNhbGwuXG4gICAqL1xuICBzaWduYWxFbmQoKSB7XG4gICAgdGhpcy5tYW5hZ2VyXy5zaWduYWxFbmRfKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByZWNvZ25pemVyIGNhbiBjYWxsIHRoaXMgbWV0aG9kIHRvIGVtaXQgdGhlIGdlc3R1cmVzIHdoaWxlIGluIHRoZVxuICAgKiBcImVtaXR0aW5nXCIgc3RhdGUuIFJlY29nbml6ZXIgY2FuIG9ubHkgY2FsbCB0aGlzIG1ldGhvZCBpZiBpdCBoYXNcbiAgICogcHJldmlvdXNseSByZWNlaXZlZCB0aGUge0BsaW5rIGFjY2VwdFN0YXJ0fSBjYWxsLlxuICAgKiBAcGFyYW0ge0RBVEF9IGRhdGFcbiAgICogQHBhcmFtIHs/RXZlbnR9IGV2ZW50XG4gICAqL1xuICBzaWduYWxFbWl0KGRhdGEsIGV2ZW50KSB7XG4gICAgdGhpcy5tYW5hZ2VyXy5zaWduYWxFbWl0Xyh0aGlzLCBkYXRhLCBldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIEdlc3R1cmVzIGluc3RhbmNlIGNhbGxzIHRoaXMgbWV0aG9kIHRvIGFsbG93IHRoZSByZWNvZ25pemVyIHRvIHN0YXJ0XG4gICAqIGVtaXR0aW5nIHRoZSBnZXN0dXJlcy4gQXQgdGhpcyBwb2ludCB0aGUgcmVjb2duaXplciBpcyBpbiB0aGUgXCJlbWl0dGluZ1wiXG4gICAqIHN0YXRlLiBJdCB3aWxsIGJlIGluIHRoaXMgc3RhdGUgdW50aWwgaXQgY2FsbHMge0BsaW5rIHNpZ25hbEVuZH0gb3JcbiAgICogdGhlIHtAbGluayBhY2NlcHRDYW5jZWx9IGlzIGNhbGxlZCBieSB0aGUgR2VzdHVyZXMgaW5zdGFuY2UuXG4gICAqL1xuICBhY2NlcHRTdGFydCgpIHt9XG5cbiAgLyoqXG4gICAqIFRoZSBHZXN0dXJlcyBpbnN0YW5jZSBjYWxscyB0aGlzIG1ldGhvZCB0byByZXNldCB0aGUgcmVjb2duaXplci4gQXQgdGhpc1xuICAgKiBwb2ludCB0aGUgcmVjb2duaXplciBpcyBpbiB0aGUgaW5pdGlhbCB3YWl0aW5nIHN0YXRlLlxuICAgKi9cbiAgYWNjZXB0Q2FuY2VsKCkge31cblxuICAvKipcbiAgICogVGhlIEdlc3R1cmVzIGluc3RhbmNlIGNhbGxzIHRoaXMgbWV0aG9kIGZvciBlYWNoIFwidG91Y2hzdGFydFwiIGV2ZW50LiBJZlxuICAgKiB0aGUgcmVjb2duaXplciB3YW50cyB0byByZWNlaXZlIG90aGVyIHRvdWNoIGV2ZW50cyBpbiB0aGUgc2VyaWVzLCBpdCBoYXNcbiAgICogdG8gcmV0dXJuIFwidHJ1ZVwiLlxuICAgKiBAcGFyYW0geyFFdmVudH0gdW51c2VkRXZlbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIG9uVG91Y2hTdGFydCh1bnVzZWRFdmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgR2VzdHVyZXMgaW5zdGFuY2UgY2FsbHMgdGhpcyBtZXRob2QgZm9yIGVhY2ggXCJ0b3VjaG1vdmVcIiBldmVudC4gSWZcbiAgICogdGhlIHJlY29nbml6ZXIgd2FudHMgdG8gY29udGludWUgcmVjZWl2aW5nIHRvdWNoIGV2ZW50cyBpbiB0aGUgc2VyaWVzLFxuICAgKiBpdCBoYXMgdG8gcmV0dXJuIFwidHJ1ZVwiLlxuICAgKiBAcGFyYW0geyFFdmVudH0gdW51c2VkRXZlbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIG9uVG91Y2hNb3ZlKHVudXNlZEV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBHZXN0dXJlcyBpbnN0YW5jZSBjYWxscyB0aGlzIG1ldGhvZCBmb3IgdGhlIFwidG91Y2hlbmRcIiBldmVudC5cbiAgICogU29tZXdoZXJlIHdpdGhpbiB0aGlzIHRvdWNoIHNlcmllcyB0aGUgcmVjb2duaXplciBoYXMgdG8gY2FsbFxuICAgKiB7QGxpbmsgc2lnbmFsUmVhZHl9IG9yIHtAbGluayBzaWduYWxQZW5kaW5nfSBvciBpdCB3aWxsIGJlIHJlc2V0IGZvciB0aGVcbiAgICogbmV4dCB0b3VjaCBzZXJpZXMuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSB1bnVzZWRFdmVudFxuICAgKi9cbiAgb25Ub3VjaEVuZCh1bnVzZWRFdmVudCkge31cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/gesture.js