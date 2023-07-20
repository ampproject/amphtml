import {devAssert} from '#core/assert';
import {map} from '#core/types/object';

/** @template STATE */
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
     * @private {{[key: string]: function():void}}
     */
    this.transitions_ = map();
  }

  /**
   * Adds a transition callback that will be called when the oldState
   * transitions to the newState.
   * @param {STATE} oldState
   * @param {STATE} newState
   * @param {function():void} callback
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
    callback?.();
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
