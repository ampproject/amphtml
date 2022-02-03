import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';

import {useCallback, useEffect, useRef, useState} from '#preact';

import {DatePickerMode, DatePickerState, noop} from './constants';

export function useDatePickerState(mode: DatePickerMode) {
  const [isOpen, setIsOpen] = useState(mode === DatePickerMode.STATIC);

  const initialState =
    mode === DatePickerMode.OVERLAY
      ? DatePickerState.OVERLAY_CLOSED
      : DatePickerState.STATIC;

  const stateMachineRef = useRef(new FiniteStateMachine(initialState));

  const transitionTo = useCallback((state: DatePickerState) => {
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
        setIsOpen(true);
      });

      sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_PICKER, () => {
        setIsOpen(true);
      });

      sm.addTransition(OVERLAY_CLOSED, OVERLAY_CLOSED, noop);

      sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, () => {
        setIsOpen(true);
      });

      sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_CLOSED, () => {
        setIsOpen(false);
      });
    }

    initializeStateMachine();
  }, []);

  return {isOpen, transitionTo};
}
