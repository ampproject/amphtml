import {useCallback, useRef} from '#preact';
import {useValueRef} from '#preact/component';

import {useStateSafe} from './useStateSafe';

const initialState = {
  loading: false,
  error: null,
  pages: [],
  hasMore: true,
};

/**
 * @typedef InfiniteQueryConfig
 * @property {function({ pageParam: (TPageParam|undefined) }): Promise<TPage>} fetchPage - Fetches a page of data.  The pageParam is not provided for the first page.
 * @property {function(page: TPage): TPageParam} getNextPageParam - Get the pageParam for fetching the next page.  If returns falsey, then "hasMore' will be false.
 * @template TPage
 * @template TPageParam
 */

/**
 * @typedef InfiniteQueryResponse
 * @property {TPage[]} pages - An array of all pages of data
 * @property {function(): Promise<void>} loadMore - A method to load more data.  If already loading, ignored.
 * @property {boolean} hasMore - True if there is more data that can be loaded
 * @property {function(): Promise<void>>} refresh - Resets all data and loads the first page.  Old data remains available while loading.
 * @property {boolean} loading - True if data is loading
 * @property {Error|null} error - Holds any request errors.  Clears if 'loadMore' or 'refresh' is called.
 * @template TPage
 */

/**
 * Loads multiple pages of data.
 * The async `fetchPage` method determines how a page is fetched.
 * The `getNextPageParam` method determines if there is a next page.  The result is passed to `fetchPage`.
 *
 * @example
 * const query = useInfiniteQuery({
 *   async fetchPage({ pageParam: cursor = '' }) {
 *     return window.fetch(`https://example.com/items?cursor=${cursor}`).then(res => res.json());
 *   },
 *   getNextPageParam(pageData) {
 *     return pageData.nextCursor;
 *   }
 * });
 *
 * @param {InfiniteQueryConfig} config
 * @return {InfiniteQueryResponse}
 * @template TPage
 * @template TPageParam
 */
export function useInfiniteQuery({fetchPage, getNextPageParam}) {
  const [state, setState] = useStateSafe(initialState);

  // Use a ref to keep these current:
  const ref = useValueRef({fetchPage, getNextPageParam, state});

  // Used for ignoring outdated requests:
  const fetchIndexRef = useRef(0);

  // Loads the next page of data
  const loadMore = useCallback(
    async (resetting = false) => {
      const {fetchPage, getNextPageParam, state} = ref.current;

      if (!resetting && state.loading) {
        return;
      }

      const fetchIndex = ++fetchIndexRef.current;

      setState((s) => ({...s, loading: true}));

      const pages = resetting ? [] : state.pages;
      const lastPage = pages.length ? pages[pages.length - 1] : undefined;

      try {
        const newPage = await fetchPage({
          pageParam: lastPage ? getNextPageParam(lastPage) : undefined,
        });

        if (fetchIndex !== fetchIndexRef.current) {
          // A new request has been started; cancel this one:
          return;
        }

        const nextPageParam = getNextPageParam(newPage);

        setState({
          loading: false,
          error: null,
          pages: [...pages, newPage],
          hasMore: nextPageParam !== undefined && nextPageParam !== null,
        });
      } catch (error) {
        if (fetchIndex !== fetchIndexRef.current) {
          // A new request has been started; cancel this one:
          return;
        }

        setState((s) => ({...s, loading: false, error}));
      }
    },
    [ref, setState]
  );

  const reset = useCallback(() => loadMore(true), [loadMore]);

  return {
    ...state,
    loadMore,
    reset,
  };
}
