import type {StateUpdater} from 'preact/compat';

import {useCallback, useEffect, useRef, useState} from '#preact';

/**
 * Same as useState, but ignores setState once the component is unmounted.
 *
 * This avoids React's "Can't perform a React state update on an unmounted component" console error
 */
export function useStateSafe<S>(
  initialState: S | (() => S)
): readonly [S, StateUpdater<S>] {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const [state, setState] = useState(initialState);
  const setStateSafe = useCallback<StateUpdater<S>>(
    (newState) => {
      if (!isMounted.current) {
        return;
      }
      setState(newState);
    },
    [setState]
  );

  return [state, setStateSafe] as const;
}
