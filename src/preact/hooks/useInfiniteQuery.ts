import {useCallback, useRef} from '#preact';
import {useValueRef} from '#preact/component';

import {useStateSafe} from './useStateSafe';

const initialState = {
  loading: false,
  error: null,
  pages: [],
  hasMore: true,
};

export type InfiniteQueryConfig<TPage, TPageParam> = {
  // Fetches a page of data.  The pageParam is not provided for the first page.
  fetchPage(pageInfo: {pageParam?: TPageParam}): Promise<TPage>;
  // Get the pageParam for fetching the next page.  If returns falsy, then "hasMore' will be false.
  getNextPageParam(page: TPage): TPageParam;
};

export type InfiniteQueryState<TPage> = {
  // An array of all pages of data
  pages: TPage[];
  // true if there is more data that can be loaded
  hasMore: boolean;
  // true if data is loading
  loading: boolean;
  // Holds any request errors.  Clears if 'loadMore' or 'reset' is called.
  error: Error | null;
};

export type InfiniteQueryResponse<TPage> = InfiniteQueryState<TPage> & {
  // A method to load more data.  If already loading, ignored.
  loadMore(): Promise<void>;
  // Resets all data and loads the first page.  Old data remains available while loading.
  reset(): Promise<void>;
};

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
 */
export function useInfiniteQuery<TPage, TPageParam>({
  fetchPage,
  getNextPageParam,
}: InfiniteQueryConfig<TPage, TPageParam>): InfiniteQueryResponse<TPage> {
  const [state, setState] =
    useStateSafe<InfiniteQueryState<TPage>>(initialState);

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

      const pages: TPage[] = resetting ? [] : state.pages;
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
