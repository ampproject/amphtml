import {useCallback, useEffect, useRef, useState} from '#preact';

/**
 *
 * @param {S|function():S} initial
 * @return {{0: S, 1: function((S|function(S):S)):undefined}}
 * @template S
 */
export function useStateSafe(initial) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const [state, setState] = useState(initial);
  const setStateSafe = useCallback(
    (newState) => {
      if (!isMounted.current) {
        return;
      }
      setState(newState);
    },
    [setState]
  );

  return [state, setStateSafe];
}
