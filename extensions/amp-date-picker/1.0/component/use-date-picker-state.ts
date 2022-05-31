import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';

import {useCallback, useEffect, useRef, useState} from '#preact';

import {noop} from '../constants';
import {DatePickerMode, DatePickerState} from '../types';

export function useDatePickerState(mode: DatePickerMode) {
  const [isOpen, setIsOpen] = useState(mode === 'static');

  const initialState = mode === 'overlay' ? 'overlay-closed' : 'static';

  const stateMachineRef = useRef(
    new FiniteStateMachine<DatePickerState>(initialState)
  );

  const transitionTo = useCallback((state: DatePickerState) => {
    stateMachineRef.current.setState(state);
  }, []);

  useEffect(() => {
    /**
     * Set up the state machine
     */
    const sm = stateMachineRef.current;
    const OVERLAY_CLOSED = 'overlay-closed';
    const OVERLAY_OPEN_INPUT = 'overlay-open-input';
    const STATIC = 'static';
    const OVERLAY_OPEN_PICKER = 'overlay-open-picker';

    sm.addTransition(STATIC, STATIC, noop);

    if (mode === 'overlay') {
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
  }, [mode]);

  return {isOpen, transitionTo};
}
