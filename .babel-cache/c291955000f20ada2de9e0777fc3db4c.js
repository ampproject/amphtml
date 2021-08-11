function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import { devAssert } from "../assert";
import { map } from "../types/object";

/** @template STATE */
export var FiniteStateMachine = /*#__PURE__*/function () {
  /**
   * Constructs a FSM using the bits defined in initialState as changeable
   * states.
   * @param {STATE} initialState
   */
  function FiniteStateMachine(initialState) {_classCallCheck(this, FiniteStateMachine);
    /**
     * The current state of the FSM
     * @private {STATE}
     */
    this.state_ = initialState;

    /**
     * Callbacks that are invoked when transitioning from an old state
     * to the new.
     * @private {Object<string, function()>}
     */
    this.transitions_ = map();
  }

  /**
   * Adds a transition callback that will be called when the oldState
   * transitions to the newState.
   * @param {STATE} oldState
   * @param {STATE} newState
   * @param {function()} callback
   */_createClass(FiniteStateMachine, [{ key: "addTransition", value:
    function addTransition(oldState, newState, callback) {
      var transition = this.statesToTransition_(oldState, newState);
      devAssert(
      !this.transitions_[transition]);


      this.transitions_[transition] = callback;
    }

    /**
     * Transitions to the newState and invokes the registered transition
     * callback, if one is defined.
     * @param {STATE} newState
     */ }, { key: "setState", value:
    function setState(newState) {
      var oldState = this.state_;
      this.state_ = newState;

      var transition = this.statesToTransition_(oldState, newState);
      var callback = this.transitions_[transition];
      (callback === null || callback === void 0) ? (void 0) : callback();
    }

    /**
     * Transforms the state transition into a key which identifies a callback.
     * @private
     * @param {STATE} oldState
     * @param {STATE} newState
     * @return {string}
     */ }, { key: "statesToTransition_", value:
    function statesToTransition_(oldState, newState) {
      return "".concat(oldState, "|").concat(newState);
    } }]);return FiniteStateMachine;}();
// /Users/mszylkowski/src/amphtml/src/core/data-structures/finite-state-machine.js