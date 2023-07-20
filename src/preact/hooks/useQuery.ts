import {useCallback, useEffect} from '#preact';
import {useValueRef} from '#preact/component';

import {useStateSafe} from './useStateSafe';

const noop = () => {};

type SuccessState<TData> = {
  loading: false;
  data: TData;
  error: null;
};

type ErrorState = {
  loading: false;
  data: null;
  error: Error;
};

type LoadingState<TData> = {
  loading: true;
  data: TData | null;
  error: null;
};

type InitialState<TData> = {
  loading: false;
  data: TData;
  error: null;
};

export type QueryState<TData = unknown> =
  | SuccessState<TData>
  | ErrorState
  | LoadingState<TData>
  | InitialState<TData>;

export type QueryConfig<TData = unknown> = {
  initialData: TData;
  enabled?: boolean;
  onSettled?: (data: TData | null, error: Error | null) => void;
  onError?: (error: Error) => void;
  onSuccess?: (data: TData) => void;
};

const DEFAULT_STATE_VALUES = {
  loading: false,
  error: null,
};

/**
 * Loads data asynchronously.
 * If `enabled` is true (default), then the `fetch` method is called
 * when the component is mounted.
 * Note: This API mimics react-query, but does not include any caching.
 *
 * @example
 * const {data, error, loading} = useQuery(
 *  () => fetchJson('https://example.com/items').then(data => data.items),
 *  {
 *   enabled: shouldFetchItems,
 *   initialData: [],
 *   onSettled: () => setShouldFetchItems(false)
 *  }
 * )
 */
export function useQuery<TData>(
  queryFn: () => Promise<TData>,
  {
    enabled,
    initialData,
    onError = noop,
    onSettled = noop,
    onSuccess = noop,
  }: QueryConfig<TData>
) {
  const [state, setState] = useStateSafe<QueryState<TData>>({
    ...DEFAULT_STATE_VALUES,
    data: initialData,
  });

  // This ref ensures that the fetch function is not called more than once with the same props.
  const ref = useValueRef({
    initialData,
    onSettled,
    onError,
    onSuccess,
    state,
    queryFn,
  });

  const fetchQueryData = useCallback(() => {
    const {onError, onSettled, onSuccess, queryFn, state} = ref.current!;
    setState((s) => ({...s, error: null, loading: true}));
    // This function intentionally does not use async/await in order to avoid
    // issues with regenerator-runtime in bento components.
    queryFn().then(
      (data) => {
        setState((s) => ({...s, error: null, loading: false, data}));
        onSuccess(data);
        onSettled(state.data, state.error);
      },
      (error) => {
        setState((s) => ({...s, data: null, loading: false, error}));
        onError(error);
        onSettled(state.data, state.error);
      }
    );
  }, [ref, setState]);

  useEffect(() => {
    if (enabled) {
      fetchQueryData();
    }
  }, [enabled, fetchQueryData]);

  return {...state, refetch: fetchQueryData};
}
