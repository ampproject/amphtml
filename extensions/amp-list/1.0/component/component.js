import * as Preact from '#preact';
import {
  Fragment,
  cloneElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useIsInViewport} from '#preact/component/intersection-observer';
import {useAmpContext} from '#preact/context';
import {useInfiniteQuery} from '#preact/hooks/useInfiniteQuery';
import {xhrUtils} from '#preact/utils/xhr';

const defaultItemTemplate = (item) => <p>{String(item)}</p>;
const defaultWrapperTemplate = (list) => <div>{list}</div>;
const defaultErrorTemplate = (error) => `Error: ${error.message}`;
const defaultLoadingTemplate = () => `Loading...`;
const defaultLoadMoreTemplate = () => <button>Load more</button>;

/**
 * Retrieves the key from the object.
 * Supports dot notation.
 * Returns undefined if any segment not found.
 * @example
 *   getValue({ a: 5 }, 'a') === 5
 *   getValue({ a: 5 }, 'a.b.c') === undefined
 *   getValue({ a: { b: { c: 5 } } }, 'a.b.c') === 5
 * @param {object} object
 * @param {string} keys
 * @return {*}
 */
function getValue(object, keys) {
  return keys.split('.').reduce((items, key) => {
    if (!items || key === '') {
      return items;
    }
    return items[key];
  }, object);
}

/**
 * Returns the nextUrl, according to the `loadMoreBookmark` string
 * @param {*} lastPage
 * @param {string} loadMoreBookmark
 * @return {*}
 */
function getNextUrl(lastPage, loadMoreBookmark) {
  return getValue(lastPage, loadMoreBookmark);
}

/**
 * Gathers all items from all pages of data
 * @param {Array<any>>} pages
 * @param {string} itemsKey
 * @return {Array<any>}
 */
function collectItemsFromPages(pages, itemsKey) {
  return pages.reduce((allItems, page) => {
    const pageItems = getItemsFromResults(page, itemsKey);
    return pageItems ? allItems.concat(pageItems) : allItems;
  }, []);
}

/**
 *
 * @param {object} results
 * @param {string} itemsKey
 * @return {*}
 */
function getItemsFromResults(results, itemsKey) {
  if (!results) {
    return null;
  }
  let items = getValue(results, itemsKey);
  if (!items) {
    return null;
  }
  if (!Array.isArray(items)) {
    items = [items];
  }
  return items;
}

/**
 * @param {!BentoListDef.Props} props
 * @param {BentoListDef.BentoListApi} ref
 * @return {PreactDef.Renderable}
 */
export function BentoListWithRef(
  {
    src = null,
    fetchJson = xhrUtils.fetchJson,
    itemsKey = 'items',
    maxItems = 0,
    resetOnRefresh = false,
    loadMore: loadMoreMode = 'none',
    loadMoreBookmark = 'load-more-src',
    viewportBuffer = 2.0, // When loadMore === 'auto', keep loading up to 2 viewports of data
    template: itemTemplate = defaultItemTemplate,
    wrapperTemplate = defaultWrapperTemplate,
    loadingTemplate = defaultLoadingTemplate,
    errorTemplate = defaultErrorTemplate,
    loadMoreTemplate = defaultLoadMoreTemplate,
    ...rest
  },
  ref
) {
  const {renderable} = useAmpContext();

  const ioOptions = useMemo(() => {
    const bufferPct = Math.floor(viewportBuffer * 100);
    return /** @type {IOOptions} */ {
      rootMargin: `0% 0% ${bufferPct}% 0%`,
      threshold: 0,
    };
  }, [viewportBuffer]);

  const bottomRef = useRef(null);
  const isBottomNearingViewport = useIsInViewport(bottomRef, ioOptions);

  const {error, hasMore, loadMore, loading, pages, reset} = useInfiniteQuery({
    fetchPage: async ({pageParam: nextUrl = src}) => {
      if (!renderable) {
        return null;
      }
      const page = await fetchJson(nextUrl);
      return page;
    },
    getNextPageParam(lastPage) {
      return getNextUrl(lastPage, loadMoreBookmark);
    },
  });

  // Reset when these props change:
  useEffect(() => {
    reset();
  }, [src, renderable, loadMoreBookmark, reset]);

  const shouldLoadMore =
    renderable &&
    loadMoreMode === 'auto' &&
    isBottomNearingViewport &&
    !loading &&
    hasMore;

  useEffect(() => {
    if (shouldLoadMore) {
      loadMore();
    }
  }, [shouldLoadMore, loadMore]);

  // Rendering logic:
  const list = useMemo(() => {
    let items = collectItemsFromPages(pages, itemsKey);

    if (maxItems > 0 && items.length > maxItems) {
      items = items.slice(0, maxItems);
    }

    return items.map((item, i) => {
      let renderedItem = itemTemplate(item);

      // The template engine outputs raw HTML:
      if (
        renderedItem &&
        typeof renderedItem === 'object' &&
        typeof renderedItem.__html === 'string'
      ) {
        renderedItem = <span dangerouslySetInnerHTML={renderedItem} />;
      }

      return augment(renderedItem, {'key': i, 'role': 'listitem'});
    });
  }, [pages, itemsKey, maxItems, itemTemplate]);

  const showLoading = loading && (pages.length === 0 || resetOnRefresh);
  const showResults = list.length !== 0 && !showLoading;
  const showLoadMore = loadMoreMode === 'manual' && hasMore;

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoListDef.BentoListApi} */ ({
        refresh: reset,
      }),
    [reset]
  );

  return (
    <ContainWrapper aria-live="polite" {...rest}>
      <Fragment test-id="contents">
        {showLoading && loadingTemplate?.()}
        {showResults && augment(wrapperTemplate(list), {'role': 'list'})}
        {error && errorTemplate?.(error)}
        {showLoadMore &&
          augment(loadMoreTemplate(), {onClick: () => loadMore()})}
        {loadMoreMode === 'auto' && <span ref={bottomRef} />}
      </Fragment>
    </ContainWrapper>
  );
}

const BentoList = forwardRef(BentoListWithRef);
BentoList.displayName = 'List';
export {BentoList};

/**
 * Augments the component with properties
 *
 * @param {PreactDef.Renderable} component
 * @param {object} props
 * @return {!PreactDef.Renderable}
 */
function augment(component, props) {
  if (!Preact.isValidElement(component)) {
    return component;
  }
  return cloneElement(component, {...props, ...component.props});
}
