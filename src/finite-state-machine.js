/**
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

import {devAssert} from './log';

/**
 * @template STATE
 */
export class FiniteStateMachine {
  /**
   * Constructs a FSM using the bits defined in initialState as changeable
   * states.
   * @param {STATE} initialState
   */
  constructor(initialState) {
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
    this.transitions_ = Object.create(null);
  }

  /**
   * Adds a transition callback that will be called when the oldState
   * transitions to the newState.
   * @param {STATE} oldState
   * @param {STATE} newState
   * @param {function()} callback
   */
  addTransition(oldState, newState, callback) {
    const transition = this.statesToTransition_(oldState, newState);
    devAssert(
      !this.transitions_[transition],
      'cannot define a duplicate transition callback'
    );
    this.transitions_[transition] = callback;
  }

  /**
   * Transitions to the newState and invokes the registered transition
   * callback, if one is defined.
   * @param {STATE} newState
   */
  setState(newState) {
    const oldState = this.state_;
    this.state_ = newState;

    const transition = this.statesToTransition_(oldState, newState);
    const callback = this.transitions_[transition];

    if (callback) {
      callback();
    }
  }

  /**
   * Transforms the state transition into a key which identifies a callback.
   * @private
   * @param {STATE} oldState
   * @param {STATE} newState
   * @return {string}
   */
  statesToTransition_(oldState, newState) {
    return `${oldState}|${newState}`;
  }
}
