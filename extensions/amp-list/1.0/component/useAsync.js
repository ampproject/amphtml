import {useCallback, useEffect, useRef, useState} from '#preact';

function useAsyncCallback(asyncCallback, dependencies) {
  const [state, setState] = useStateSafe(() => ({
    loading: false,
    error: null,
    results: null,
  }));

  const execute = useCallback(async () => {
    setState((s) => ({...s, loading: true}));
    try {
      const results = await asyncCallback(...dependencies);
      setState((s) => ({...s, loading: false, error: null, results}));
    } catch (error) {
      setState((s) => ({...s, loading: false, error}));
    }
  }, dependencies);

  return {...state, execute};
}

export function useAsync(asyncCallback, dependencies) {
  const state = useAsyncCallback(asyncCallback, dependencies);
  useEffect(() => {
    state.execute();
  }, dependencies);

  return state;
}

function useStateSafe(initial) {
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
