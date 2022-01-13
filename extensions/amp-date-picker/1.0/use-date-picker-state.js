import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';

import {useCallback, useEffect, useRef, useState} from '#preact';

/**
 * @enum {string}
 * @private visible for testing
 */
export const DatePickerState = {
  OVERLAY_CLOSED: 'overlay-closed',
  OVERLAY_OPEN_INPUT: 'overlay-open-input',
  OVERLAY_OPEN_PICKER: 'overlay-open-picker',
  STATIC: 'static',
};

/**
 * Configure the states and transitions in the state machine.
 * @param {string} initialState
 * @return {*} TODO: Specify return type
 */
export function useDatePickerState(initialState) {
  const stateMachineRef = useRef(new FiniteStateMachine(initialState));
  const [state, _setState] = useState({});
  const noop = () => {};

  const setState = useCallback(
    (newValues) => {
      const newState = Object.assign(state, newValues);
      _setState(newState);
    },
    [state]
  );

  const initializeStateMachine = useCallback(() => {
    const {OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, STATIC} =
      DatePickerState;
    stateMachineRef.current.addTransition(STATIC, STATIC, noop);

    stateMachineRef.current.addTransition(
      OVERLAY_CLOSED,
      OVERLAY_OPEN_INPUT,
      () => {
        setState({isOpen: true, isFocused: true, focused: false});
      }
    );

    stateMachineRef.current.addTransition(
      OVERLAY_CLOSED,
      OVERLAY_OPEN_PICKER,
      () => {
        setState({isOpen: true, isFocused: true, focused: true});
      }
    );
  }, [setState]);

  useEffect(() => {
    initializeStateMachine();
    // This is only called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Transition to a new state
   * @param {!DatePickerState} state
   */
  const transitionTo = useCallback((state) => {
    stateMachineRef.current.setState(state);
  }, []);

  return {state, transitionTo};
}
