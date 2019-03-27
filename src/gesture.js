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

import {Observable} from './observable';
import {Pass} from './pass';
import {devAssert} from './log';
import {findIndex} from './utils/array';
import {toWin} from './types';


const PROP_ = '__AMP_Gestures';


/**
 * A gesture object contains the type and data of the gesture such as
 * a tap or a double-tap or a swipe. See {@link GestureRecognizer} for
 * more details.
 * @struct
 * @const
 * @template DATA
 */
export class Gesture {
  /**
   * @param {string} type The gesture's string type.
   * @param {DATA} data The data of the gesture.
   * @param {Date} time The time that the gesture has been emitted.
   * @param {?Event} event An optional browser event that resulted in the
   *   gesture.
   */
  constructor(type, data, time, event) {
    /** @const {string} */
    this.type = type;
    /** @const {DATA} */
    this.data = data;
    /** @const {Date} */
    this.time = time;
    /** @const {?Event} */
    this.event = event;
  }
}


/**
 * Gestures object manages all gestures on a particular element. It listens
 * to all pointer events and delegates them to individual gesture recognizers.
 * When a recognizer has recognized a gesture and ready to start emitting it
 * it requests permission to do so from this class which resolves conflicts
 * between competing recognizers to decide which gesture should go forward.
 */
export class Gestures {

  /**
   * Creates if not yet created and returns the shared Gestures instance for
   * the specified element.
   * @param {!Element} element
   * @param {boolean=} opt_shouldNotPreventDefault
   * @return {!Gestures}
   */
  static get(element, opt_shouldNotPreventDefault = false) {
    let res = element[PROP_];
    if (!res) {
      res = new Gestures(element, opt_shouldNotPreventDefault);
      element[PROP_] = res;
    }
    return res;
  }

  /**
   * @param {!Element} element
   * @param {boolean} shouldNotPreventDefault
   */
  constructor(element, shouldNotPreventDefault) {
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

    /**
     * This variable indicates that the eventing has stopped on this
     * event cycle.
     * @private {boolean}
     */
    this.wasEventing_ = false;

    /** @private {!Pass} */
    this.pass_ = new Pass(toWin(element.ownerDocument.defaultView),
        this.doPass_.bind(this));

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

    this.element_.addEventListener('touchstart', this.boundOnTouchStart_);
    this.element_.addEventListener('touchend', this.boundOnTouchEnd_);
    this.element_.addEventListener('touchmove', this.boundOnTouchMove_);
    this.element_.addEventListener('touchcancel', this.boundOnTouchCancel_);

    /** @private {boolean} */
    this.passAfterEvent_ = false;
  }

  /**
   * Unsubscribes from all pointer events and removes the shared cache instance.
   */
  cleanup() {
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
   * @param {function(new:GestureRecognizer<DATA>, !Gestures)} recognizerConstr
   * @param {function(!Gesture<DATA>)} handler
   * @return {!UnlistenDef}
   * @template DATA
   */
  onGesture(recognizerConstr, handler) {
    const recognizer = new recognizerConstr(this);
    const type = recognizer.getType();
    let overserver = this.overservers_[type];
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
   * @param {function(new:GestureRecognizer<DATA>, !Gestures)} recognizerConstr
   * @return {boolean}
   */
  removeGesture(recognizerConstr) {
    const type = new recognizerConstr(this).getType();
    const overserver = this.overservers_[type];
    if (overserver) {
      overserver.removeAll();
      const index = findIndex(this.recognizers_, e => e.getType() == type);
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
  onPointerDown(handler) {
    return this.pointerDownObservable_.add(handler);
  }

  /**
   * Handles all "touchstart" events and dispatches them to the tracking
   * recognizers.
   * @param {!Event} event
   * @private
   */
  onTouchStart_(event) {
    const now = Date.now();
    this.wasEventing_ = false;

    this.pointerDownObservable_.fire(event);

    for (let i = 0; i < this.recognizers_.length; i++) {
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
  onTouchMove_(event) {
    const now = Date.now();

    for (let i = 0; i < this.recognizers_.length; i++) {
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
  onTouchEnd_(event) {
    const now = Date.now();

    for (let i = 0; i < this.recognizers_.length; i++) {
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

      const isReady = !this.pending_[i];
      const isExpired = this.pending_[i] < now;
      const isEventing = this.eventing_ == this.recognizers_[i];

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
  onTouchCancel_(event) {
    for (let i = 0; i < this.recognizers_.length; i++) {
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
  signalReady_(recognizer, offset) {
    // Somebody got here first.
    if (this.eventing_) {
      recognizer.acceptCancel();
      return;
    }

    // Set the recognizer as ready and wait for the pass to
    // make the decision.
    const now = Date.now();
    for (let i = 0; i < this.recognizers_.length; i++) {
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
  signalPending_(recognizer, timeLeft) {
    // Somebody got here first.
    if (this.eventing_) {
      recognizer.acceptCancel();
      return;
    }

    const now = Date.now();
    for (let i = 0; i < this.recognizers_.length; i++) {
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
  signalEnd_(recognizer) {
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
  signalEmit_(recognizer, data, event) {
    devAssert(this.eventing_ == recognizer,
        'Recognizer is not currently allowed: %s', recognizer.getType());
    const overserver = this.overservers_[recognizer.getType()];
    if (overserver) {
      overserver.fire(new Gesture(recognizer.getType(), data, new Date(),
          event));
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  afterEvent_(event) {
    let cancelEvent = !!this.eventing_ || this.wasEventing_;
    this.wasEventing_ = false;
    if (!cancelEvent) {
      const now = Date.now();
      for (let i = 0; i < this.recognizers_.length; i++) {
        if (this.ready_[i] ||
                (this.pending_[i] && this.pending_[i] >= now)) {
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
  doPass_() {
    const now = Date.now();

    // The "most ready" recognizer is the youngest in the "ready" set.
    // Otherwise we wouldn't wait for it at all.
    let readyIndex = -1;
    for (let i = 0; i < this.recognizers_.length; i++) {
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
    let waitTime = 0;
    for (let i = 0; i < this.recognizers_.length; i++) {
      if (this.ready_[i] || !this.tracking_[i]) {
        continue;
      }
      waitTime = Math.max(waitTime, this.pending_[i] - now);
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
  startEventing_(index) {
    const recognizer = this.recognizers_[index];
    for (let i = 0; i < this.recognizers_.length; i++) {
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
  startTracking_(index) {
    this.tracking_[index] = true;
    this.pending_[index] = 0;
  }

  /**
   * @param {number} index
   * @private
   */
  stopTracking_(index) {
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
  cancelEventing_(index) {
    this.ready_[index] = 0;
    this.stopTracking_(index);
  }
}


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
export class GestureRecognizer {

  /**
   * @param {string} type
   * @param {!Gestures} manager
   */
  constructor(type, manager) {
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
  getType() {
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
  signalReady(offset) {
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
  signalPending(timeLeft) {
    this.manager_.signalPending_(this, timeLeft);
  }

  /**
   * The recognizer can call this method to communicate that it's done
   * emitting the gestures. It will return to the waiting state. Recognizer
   * can only call this method if it has previously received the
   * {@link acceptStart} call.
   */
  signalEnd() {
    this.manager_.signalEnd_(this);
  }

  /**
   * The recognizer can call this method to emit the gestures while in the
   * "emitting" state. Recognizer can only call this method if it has
   * previously received the {@link acceptStart} call.
   * @param {DATA} data
   * @param {?Event} event
   */
  signalEmit(data, event) {
    this.manager_.signalEmit_(this, data, event);
  }

  /**
   * The Gestures instance calls this method to allow the recognizer to start
   * emitting the gestures. At this point the recognizer is in the "emitting"
   * state. It will be in this state until it calls {@link signalEnd} or
   * the {@link acceptCancel} is called by the Gestures instance.
   */
  acceptStart() {
  }

  /**
   * The Gestures instance calls this method to reset the recognizer. At this
   * point the recognizer is in the initial waiting state.
   */
  acceptCancel() {
  }

  /**
   * The Gestures instance calls this method for each "touchstart" event. If
   * the recognizer wants to receive other touch events in the series, it has
   * to return "true".
   * @param {!Event} unusedEvent
   * @return {boolean}
   */
  onTouchStart(unusedEvent) {
    return false;
  }

  /**
   * The Gestures instance calls this method for each "touchmove" event. If
   * the recognizer wants to continue receiving touch events in the series,
   * it has to return "true".
   * @param {!Event} unusedEvent
   * @return {boolean}
   */
  onTouchMove(unusedEvent) {
    return false;
  }

  /**
   * The Gestures instance calls this method for the "touchend" event.
   * Somewhere within this touch series the recognizer has to call
   * {@link signalReady} or {@link signalPending} or it will be reset for the
   * next touch series.
   * @param {!Event} unusedEvent
   */
  onTouchEnd(unusedEvent) {
  }
}
