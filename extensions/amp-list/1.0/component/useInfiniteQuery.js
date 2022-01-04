import {useRef} from '#preact';

import {useStateSafe} from './useStateSafe';

const initialState = {
  loading: false,
  error: null,
  pages: [],
  hasMore: true,
};

/**
 *
 * @param {function({ pageParam: TPageParam }): Promise<TPage>} fetchPage
 * @param {object} getNextPageParam
 * @param {function(page: TPage): TPageParam} getNextPageParam.getNextPageParam
 * @return {{pages: *[], loadMore: ((function(*=): Promise<void>)|*), hasMore: boolean, refresh: refresh, loading: boolean, error: null}}
 * @template TPage
 * @template TPageParam
 */
export function useInfiniteQuery(fetchPage, {getNextPageParam}) {
  const [state, setState] = useStateSafe(initialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const loadMore = async (resetting = false) => {
    // const state = reset ? initialState : stateRef.current;
    const state = stateRef.current;
    if (!resetting && state.loading) {
      return;
    }

    setState({...state, loading: true});

    try {
      const lastPage =
        !resetting && state.pages.length
          ? state.pages[state.pages.length - 1]
          : undefined;

      const newPage = await fetchPage({
        pageParam: getNextPageParam(lastPage),
      });

      const nextPageParam = getNextPageParam(newPage);

      setState((s) => ({
        loading: false,
        error: null,
        pages: resetting ? [newPage] : s.pages.concat(newPage),
        hasMore: nextPageParam !== undefined && nextPageParam !== null,
      }));
    } catch (error) {
      setState((s) => ({...s, loading: false, error}));
    }
  };

  const refresh = () => {
    loadMore(true);
  };

  return {
    ...state,
    loadMore,
    refresh,
  };
}
