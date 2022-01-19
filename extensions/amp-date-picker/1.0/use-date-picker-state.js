import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';

import {useCallback, useEffect, useRef, useState} from '#preact';

import {DatePickerState, noop} from './constants';

/**
 *
 * @param {Object} initialState
 * @param {DatePickerState} initialStateMachineState
 * @return {{state: object, transitionTo: function}}
 */
export function useDatePickerState(
  initialState = {},
  initialStateMachineState
) {
  const [state, setState] = useState(initialState);
  const stateMachineRef = useRef(
    new FiniteStateMachine(initialStateMachineState)
  );

  /**
   * Transition to a new state
   * @param {!DatePickerState} state
   */
  const transitionTo = useCallback((state) => {
    stateMachineRef.current.setState(state);
  }, []);

  useEffect(() => {
    /**
     * Set up the state machine
     */
    function initializeStateMachine() {
      const sm = stateMachineRef.current;
      const {OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, STATIC} =
        DatePickerState;
      sm.addTransition(STATIC, STATIC, noop);

      sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, () => {
        setState({isOpen: true, isFocused: true, focused: false});
      });

      sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_PICKER, () => {
        setState({isOpen: true, isFocused: true, focused: true});
      });

      sm.addTransition(OVERLAY_CLOSED, OVERLAY_CLOSED, noop);

      sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, () => {
        setState({
          isOpen: true,
          isFocused: true,
          focused: true,
        });
      });

      sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_CLOSED, () => {
        setState({
          isOpen: false,
          isFocused: false,
          focused: false,
        });
      });
    }

    initializeStateMachine();
  }, []);

  return {state, transitionTo};
}
