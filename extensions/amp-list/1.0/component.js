import * as Preact from '#preact';
import {
  Fragment,
  cloneElement,
  isValidElement,
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

import {useStyles} from './component.jss';

const defaultItemTemplate = (item) => <div>{String(item)}</div>;
const defaultWrapperTemplate = (list) => <div>{list}</div>;
const defaultErrorTemplate = (styles, unusedError) => (
  <div>
    {'Unable to Load More '}
    <button load-more-retry>
      <label>
        <span class={styles.loadMoreIcon} /> Retry
      </label>
    </button>
  </div>
);
const defaultLoadMoreTemplate = () => (
  <div>
    <button load-more-button>
      <label>See More</label>
    </button>
  </div>
);
const defaultLoadingTemplate = (styles) => (
  <div>
    <span aria-label="Loading" class={styles.loadMoreSpinner} />
  </div>
);

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
 *
 * @param {object} pageData
 * @param {string} itemsKey
 * @return {*}
 */
function getItemsFromPage(pageData, itemsKey) {
  if (!pageData) {
    return [];
  }
  let items = getValue(pageData, itemsKey);
  if (!items) {
    return [];
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
    errorTemplate = defaultErrorTemplate,
    fetchJson = xhrUtils.fetchJson,
    itemsKey = 'items',
    loadMore: loadMoreMode = 'none',
    loadMoreBookmark = 'load-more-src',
    loadMoreTemplate = defaultLoadMoreTemplate,
    loadingTemplate = defaultLoadingTemplate, // When loadMore === 'auto', keep loading up to 2 viewports of data
    maxItems = 0,
    src = null,
    template: itemTemplate = defaultItemTemplate,
    viewportBuffer = 2.0,
    wrapperTemplate = defaultWrapperTemplate,
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
    let items = pages.flatMap((page) => getItemsFromPage(page, itemsKey));

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

  const handleContainerClick = (ev) => {
    const loadMoreButton = ev.target.closest(
      '[load-more-button], [load-more-retry]'
    );
    if (loadMoreButton) {
      loadMore();
    }
  };

  const showLoading = loading;
  const showResults = list.length !== 0;
  const showLoadMore = loadMoreMode === 'manual' && hasMore && !loading;

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoListDef.BentoListApi} */ ({
        refresh: reset,
      }),
    [reset]
  );

  const styles = useStyles();

  return (
    <ContainWrapper aria-live="polite" {...rest} onClick={handleContainerClick}>
      <Fragment test-id="contents">
        {showResults && augment(wrapperTemplate(list), {'role': 'list'})}
        {showLoading && loadingTemplate(styles)}
        {showLoadMore && loadMoreTemplate(styles)}
        {error && errorTemplate(styles, error)}
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
  if (!isValidElement(component)) {
    return component;
  }
  return cloneElement(component, {...props, ...component.props});
}
