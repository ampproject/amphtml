import {useCallback, useEffect} from '#preact';

import {useStateSafe} from './useStateSafe';

export function useAsyncCallback(asyncCallback, dependencies) {
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
