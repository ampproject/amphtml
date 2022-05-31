import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Deferred} from '#core/data-structures/promise';
import {isAmp4Email} from '#core/document/format';
import {removeChildren, tryFocus} from '#core/dom';
import {
  Layout_Enum,
  applyFillContent,
  getLayoutClass,
  isLayoutSizeDefined,
  parseLayout,
} from '#core/dom/layout';
import {
  childElementByAttr,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {px, setImportantStyles, setStyles, toggle} from '#core/dom/style';
import {isArray, toArray} from '#core/types/array';
import {getValueForExpr} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {
  DIFFABLE_AMP_ELEMENTS,
  DIFF_IGNORE,
  DIFF_KEY,
  markElementForDiffing,
} from '#purifier/sanitation';

import {Services} from '#service';

import {createCustomEvent, listen} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';
import {setupAMPCors, setupInput, setupJsonFetchInit} from '#utils/xhr-utils';

import {setDOM} from '#third_party/set-dom/set-dom';

import {LoadMoreService} from './service/load-more-service';

import {CSS} from '../../../build/amp-list-0.1.css';
import {
  UrlReplacementPolicy_Enum,
  batchFetchJsonFor,
  requestForBatchFetch,
} from '../../../src/batched-json';
import {getMode} from '../../../src/mode';
import {Pass} from '../../../src/pass';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {getSourceOrigin, isAmpScriptUri} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-list';

/** @const {string} */
const TABBABLE_ELEMENTS_QUERY =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

// Technically the ':' is not considered part of the scheme, but it is useful to include.
const AMP_STATE_URI_SCHEME = 'amp-state:';

/**
 * @typedef {{
 *   data:(?JsonObject|string|undefined|!Array),
 *   resolver:!Function,
 *   rejecter:!Function,
 *   append:boolean,
 *   payload: (?JsonObject|Array<JsonObject>)
 * }}
 */
export let RenderItems;

/**
 * The implementation of `amp-list` component. See {@link ../amp-list.md} for
 * the spec.
 */
export class AmpList extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = null;

    /** @private {boolean} */
    this.fallbackDisplayed_ = false;

    /**
     * Maintains invariant that only one fetch result may be processed for
     * render at a time.
     * @const @private {!../../../src/pass.Pass}
     */
    this.renderPass_ = new Pass(this.win, () => this.doRenderPass_());

    /**
     * Latest fetched items to render and the promise resolver and rejecter
     * to be invoked on render success or fail, respectively.
     * @private {?RenderItems}
     */
    this.renderItems_ = null;

    /** @private {?Array} */
    this.renderedItems_ = null;

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /**
     * Has layoutCallback() been called yet?
     * @private {boolean}
     */
    this.layoutCompleted_ = false;

    /**
     * Whether the amp-list has an initial `layout` value of `container`.
     * If so, allow it to manage its own resizing in accordance to
     * (1) requiring a placeholder to detect initial sizing and
     * (2) fixing height on content change to prevent content jumping
     *
     * TODO(#26873): This configuration should eventually allow resizing to
     * contents on user interaction with an AMP action that mimics the
     * spirit of "changeToLayoutContainer" but more aptly named.
     * @private {boolean}
     */
    this.enableManagedResizing_ = false;

    /**
     * The `src` attribute's initial value.
     * @private {?string}
     */
    this.initialSrc_ = null;

    /** @private {?Element} */
    this.diffablePlaceholder_ = null;

    /** @private {?../../../extensions/amp-bind/0.1/bind-impl.Bind} */
    this.bind_ = null;

    /** @private {boolean} */
    this.loadMoreEnabled_ = false;

    /** @private {?./service/load-more-service.LoadMoreService} */
    this.loadMoreService_ = null;

    /** @private {?string} */
    this.loadMoreSrc_ = null;

    /**@private {boolean} */
    this.resizeFailed_ = false;

    /**@private {?UnlistenDef} */
    this.unlistenAutoLoadMore_ = null;

    this.registerAction('refresh', () => {
      if (this.layoutCompleted_) {
        this.resetIfNecessary_();
        return this.fetchList_({refresh: true});
      }
    });

    this.registerAction('changeToLayoutContainer', () =>
      this.changeToLayoutContainer_()
    );

    /** @private {?../../../src/ssr-template-helper.SsrTemplateHelper} */
    this.ssrTemplateHelper_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?../../../src/service/owners-interface.OwnersInterface} */
    this.owners_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    if (layout === Layout_Enum.CONTAINER) {
      const doc = this.element.ownerDocument;
      const isEmail = doc && isAmp4Email(doc);
      const hasPlaceholder =
        this.getPlaceholder() || this.element.hasAttribute('diffable');
      if (isEmail) {
        if (!hasPlaceholder) {
          user().warn(
            TAG,
            'amp-list[layout=container] should have a placeholder to establish an initial size. ' +
              'See https://go.amp.dev/c/amp-list/#placeholder-and-fallback. %s',
            this.element
          );
        }
        return (this.enableManagedResizing_ = true);
      }
      userAssert(
        isExperimentOn(this.win, 'amp-list-layout-container'),
        'Experiment "amp-list-layout-container" is not turned on.'
      );
      userAssert(
        hasPlaceholder,
        'amp-list[layout=container] should have a placeholder to establish an initial size. ' +
          'See https://go.amp.dev/c/amp-list/#placeholder-and-fallback. %s',
        this.element
      );
      return (this.enableManagedResizing_ = true);
    }
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.templates_ = Services.templatesForDoc(this.element);
    this.action_ = Services.actionServiceForDoc(this.element);
    this.owners_ = Services.ownersForDoc(this.element);
    /** If the element is in an email document,
     * allow its `changeToLayoutContainer` and `refresh` actions. */
    this.action_.addToAllowlist(
      'AMP-LIST',
      ['changeToLayoutContainer', 'refresh'],
      ['email']
    );

    this.viewport_ = this.getViewport();
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    this.ssrTemplateHelper_ = new SsrTemplateHelper(
      TAG,
      viewer,
      this.templates_
    );

    this.loadMoreEnabled_ = this.element.hasAttribute('load-more');
    userAssert(
      !(this.loadMoreEnabled_ && this.enableManagedResizing_),
      '%s initialized with layout=container does not support infinite scrolling with [load-more]. %s',
      TAG,
      this.element
    );

    // Store this in buildCallback() because `this.element` sometimes
    // is missing attributes in the constructor.
    this.initialSrc_ = this.element.getAttribute('src');

    if (this.element.hasAttribute('diffable')) {
      // Initialize container to the diffable placeholder, if it exists.
      // This enables DOM diffing with the rendered result.
      this.diffablePlaceholder_ = this.queryDiffablePlaceholder_();
      if (this.diffablePlaceholder_) {
        this.container_ = this.diffablePlaceholder_;
      } else {
        user().warn(TAG, 'Could not find child div for diffing.', this.element);
      }
    }
    if (!this.container_) {
      this.container_ = this.createContainer_();
      this.element.appendChild(this.container_);
    }

    // auto-resize is deprecated and will be removed per deprecation schedule
    // It will relaunched under a new attribute (resizable-children) soon.
    // please see https://github.com/ampproject/amphtml/issues/18849
    if (this.element.hasAttribute('auto-resize')) {
      user().warn(
        TAG,
        'auto-resize attribute is deprecated and its behavior' +
          ' is disabled. This feature will be relaunched under a new name' +
          ' soon. Please see https://github.com/ampproject/amphtml/issues/18849'
      );
    }

    // Override default attributes used for setDOM customization.
    setDOM['KEY'] = DIFF_KEY;
    setDOM['IGNORE'] = DIFF_IGNORE;

    Services.bindForDocOrNull(this.element).then((bind) => {
      this.bind_ = bind;
    });
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  layoutCallback() {
    this.layoutCompleted_ = true;

    // If a placeholder exists and it's taller than amp-list, attempt a resize.
    const placeholder = this.getPlaceholder();
    if (placeholder) {
      this.attemptToFit_(placeholder);
    } else if (this.diffablePlaceholder_) {
      this.attemptToFit_(dev().assertElement(this.container_));
    }

    this.viewport_.onResize(() => {
      this.maybeResizeListToFitItems_();
    });

    if (this.loadMoreEnabled_) {
      this.initializeLoadMoreElements_();
    }

    return this.fetchList_();
  }

  /**
   * A "diffable placeholder" is the child container <div> (which is usually created by the amp-list
   * to hold the rendered children). It serves the same purpose as a placeholder, except it can be diffed.
   *
   * For example:
   * <amp-list>
   *   <div placeholder>I'm displayed before render.</div>
   * </amp-list>
   *
   * <amp-list diffable>
   *   <div role=list>I'm displayed before render.</div>
   * </amp-list>
   *
   * @return {?Element}
   * @private
   */
  queryDiffablePlaceholder_() {
    let selector = this.element.hasAttribute('single-item')
      ? '> div'
      : '> div[role=list]';
    // Don't select other special <div> children used for placeholders/fallback/etc.
    selector += ':not([placeholder]):not([fallback]):not([fetch-error])';
    return scopedQuerySelector(this.element, selector);
  }

  /**
   * @return {!Promise}
   * @private
   */
  initializeLoadMoreElements_() {
    return this.mutateElement(() => {
      this.getLoadMoreService_().initializeLoadMore();
      const overflowElement = this.getOverflowElement();
      if (overflowElement) {
        toggle(overflowElement, false);
      }
      this.element.warnOnMissingOverflow = false;
    }).then(() => {
      this.adjustContainerForLoadMoreButton_();
      listen(
        this.getLoadMoreService_().getLoadMoreFailedClickable(),
        'click',
        () =>
          this.loadMoreCallback_(/*opt_reload*/ true, /*opt_fromClick*/ true)
      );
      listen(
        this.getLoadMoreService_().getLoadMoreButtonClickable(),
        'click',
        () =>
          this.loadMoreCallback_(/*opt_reload*/ false, /*opt_fromClick*/ true)
      );
    });
  }

  /**
   * @private
   * @return {?Promise<boolean>}
   */
  maybeResizeListToFitItems_() {
    if (this.loadMoreEnabled_) {
      this.attemptToFitLoadMore_(dev().assertElement(this.container_));
    } else {
      return this.attemptToFit_(dev().assertElement(this.container_));
    }
  }

  /**
   * @return {!LoadMoreService}
   * @private
   */
  getLoadMoreService_() {
    if (!this.loadMoreService_) {
      this.loadMoreService_ = new LoadMoreService(this.element);
    }
    return this.loadMoreService_;
  }

  /**
   * This function is called at layout time if the amp-list has the
   * load-more attribute. This increases the height of the amp-list by
   * the height of the load-more button and forces the contents to allow
   * space for the button.
   * @private
   * @return {!Promise}
   */
  adjustContainerForLoadMoreButton_() {
    let buttonHeight;
    let listHeight;
    return this.measureMutateElement(
      /* measurer */ () => {
        buttonHeight =
          this.getLoadMoreService_().getLoadMoreButton()./*OK*/ offsetHeight;
        listHeight = this.element./*OK*/ offsetHeight;
      },
      /* mutator */ () => {
        setStyles(dev().assertElement(this.container_), {
          'max-height': `calc(100% - ${px(buttonHeight)})`,
        });
        // TODO(wg-performance): Use Mutator.requestChangeSize.
        this.element./*OK*/ applySize(listHeight + buttonHeight);
      }
    );
  }

  /**
   * Returns true if element's src points to amp-state.
   *
   * @param {string} src
   * @return {boolean}
   * @private
   */
  isAmpStateSrc_(src) {
    return src.startsWith(AMP_STATE_URI_SCHEME);
  }

  /**
   * Gets the json an amp-list that has an "amp-state:" uri. For example,
   * src="amp-state:json.path".
   *
   * @param {string} src
   * @return {Promise<!JsonObject>}
   * @private
   */
  getAmpStateJson_(src) {
    return Services.bindForDocOrNull(this.element)
      .then((bind) => {
        userAssert(bind, '"amp-state:" URLs require amp-bind to be installed.');
        userAssert(
          !this.ssrTemplateHelper_.isEnabled(),
          '[amp-list]: "amp-state" URIs cannot be used in SSR mode.'
        );

        const ampStatePath = src.slice(AMP_STATE_URI_SCHEME.length);
        return bind.getStateAsync(ampStatePath).catch((err) => {
          const stateKey = ampStatePath.split('.')[0];
          user().error(
            TAG,
            `'amp-state' element with id '${stateKey}' was not found.`
          );
          throw err;
        });
      })
      .then((json) => {
        userAssert(
          typeof json !== 'undefined',
          `[amp-list] No data was found at provided uri: ${src}`
        );
        return json;
      });
  }

  /**
   * Gets the json from an amp-script uri.
   *
   * @param {string} src
   * @return {Promise<!JsonObject>}
   * @private
   */
  getAmpScriptJson_(src) {
    return Promise.resolve()
      .then(() => {
        userAssert(
          !this.ssrTemplateHelper_.isEnabled(),
          '[amp-list]: "amp-script" URIs cannot be used in SSR mode.'
        );
        return Services.scriptForDocOrNull(this.element).then(
          (ampScriptService) => ampScriptService.fetch(src)
        );
      })
      .then((json) => {
        userAssert(
          typeof json === 'object',
          `[amp-list] ${src} must return json, but instead returned: ${typeof json}`
        );
        return json;
      });
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    dev().info(TAG, 'mutate:', this.element, mutations);
    let promise;

    /**
     * @param {!Array|!Object} data
     * @return {!Promise}
     */
    const renderLocalData = (data) => {
      // Remove the 'src' now that local data is used to render the list.
      this.element.setAttribute('src', '');
      userAssert(
        !this.ssrTemplateHelper_.isEnabled(),
        '[amp-list] "[src]" may not be bound in SSR mode.'
      );

      const array = /** @type {!Array} */ (isArray(data) ? data : [data]);
      this.resetIfNecessary_(/* isFetch */ false);
      return this.scheduleRender_(array, /* append */ false);
    };

    const src = mutations['src'];
    if (src !== undefined) {
      if (typeof src === 'string') {
        // Defer to fetch in layoutCallback() before first layout.
        if (this.layoutCompleted_) {
          this.resetIfNecessary_();
          promise = this.fetchList_();
        }
      } else if (typeof src === 'object') {
        promise = renderLocalData(/** @type {!Object} */ (src));
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    }

    const isLayoutContainer = mutations['is-layout-container'];
    if (isLayoutContainer) {
      this.changeToLayoutContainer_();
    }

    // Only return the promise for easier testing.
    if (getMode().test) {
      return promise;
    }
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * @return {!Element}
   * @private
   */
  createContainer_() {
    const container = this.win.document.createElement('div');
    this.setRoleAttribute_(container, 'list');
    // In the load-more case, we allow the container to be height auto
    // in order to reasonably make space for the load-more button and
    // load-more related UI elements underneath.
    // In the layout=container case, we allow the container
    // to take the height of its children instead,
    // whereas fill-content forces height:0
    if (!this.loadMoreEnabled_ && !this.enableManagedResizing_) {
      applyFillContent(container, true);
    }
    return container;
  }

  /**
   * Adds template-rendered `elements` as children to `container`.
   * @param {!Array<!Node>} elements
   * @param {!Element} container
   * @private
   */
  addElementsToContainer_(elements, container) {
    elements.forEach((element) => {
      if (!element.hasAttribute('role')) {
        this.setRoleAttribute_(element, 'listitem');
      }
      container.appendChild(element);
    });
  }

  /**
   * Adds the 'role' attribute to the element.
   * For amp-lists with 'single-item' enabled, we should not specify the
   * role of 'list' on the container or listitem on the children as it
   * causes screen readers to read an extra nested list with one item
   * @param {!Node} element
   * @param {string} value
   * @private
   */
  setRoleAttribute_(element, value) {
    if (!this.element.hasAttribute('single-item')) {
      element.setAttribute('role', value);
    }
  }

  /**
   * Wraps `toggleFallback()`. Must be called in a mutate context.
   * @param {boolean} show
   * @private
   */
  toggleFallback_(show) {
    // Early-out if toggling would be a no-op.
    if (!show && !this.fallbackDisplayed_) {
      return;
    }
    this.toggleFallback(show);
    this.fallbackDisplayed_ = show;
  }

  /**
   * Removes any previously rendered children and displays placeholder, loading
   * indicator, etc. depending on the value of `reset-on-refresh` attribute.
   *
   *     <amp-list reset-on-refresh="fetch|always">
   *
   * - "fetch": Reset only on network requests.
   * - "always": Reset on network request OR rendering with local data.
   *
   * Default is "fetch" if no value is specified (boolean attribute).
   *
   * @param {boolean=} isFetch
   */
  resetIfNecessary_(isFetch = true) {
    if (
      (isFetch && this.element.hasAttribute('reset-on-refresh')) ||
      this.element.getAttribute('reset-on-refresh') === 'always'
    ) {
      const reset = () => {
        this.togglePlaceholder(true);
        const forceLoadingIndicator =
          this.element.hasAttribute('reset-on-refresh');
        this.toggleLoading(true, forceLoadingIndicator);
        this.toggleFallback_(false);
        // Clean up bindings in children before removing them from DOM.
        if (this.bind_) {
          const removed = toArray(this.container_.children);
          this.bind_.rescan(/* added */ [], removed, {
            'fast': true,
            'update': false,
          });
        }
        this.owners_./*OK*/ scheduleUnlayout(
          this.element,
          dev().assertElement(this.container_)
        );
        removeChildren(dev().assertElement(this.container_));
      };

      // amp-list[layout=container] can manage resizing.
      if (!this.loadMoreEnabled_ && this.enableManagedResizing_) {
        this.lockHeightAndMutate_(reset);
        return;
      }
      this.mutateElement(() => {
        reset();
        if (this.loadMoreEnabled_) {
          this.getLoadMoreService_().hideAllLoadMoreElements();
        }
      });
    }
  }

  /**
   * Given JSON payload data fetched from the server, modifies the
   * data according to developer-defined parameters. Extracts the correct
   * list items according to the 'items' attribute, asserts that this
   * contains an array or object, put object in an array if the single-item
   * attribute is set, and truncates the list-items to a length defined
   * by max-items.
   * @param {!JsonObject|!Array<JsonObject>} data
   * @throws {!Error} If response is undefined
   * @return {!Array}
   */
  computeListItems_(data) {
    const itemsExpr = this.element.getAttribute('items') || 'items';
    let items = data;
    if (itemsExpr != '.') {
      items = getValueForExpr(/**@type {!JsonObject}*/ (data), itemsExpr);
    }
    userAssert(
      typeof items !== 'undefined',
      'Response must contain an array or object at "%s". %s',
      itemsExpr,
      this.element
    );
    if (this.element.hasAttribute('single-item')) {
      if (!isArray(items)) {
        items = [items];
      } else {
        user().warn(
          TAG,
          'Expected response to contain a non-array Object due to "single-item" attribute.',
          this.element
        );
      }
    }
    items = user().assertArray(items);
    if (this.element.hasAttribute('max-items')) {
      items = this.truncateToMaxLen_(items);
    }
    return items;
  }

  /**
   * Trigger a fetch-error event
   * @param {*} error
   */
  triggerFetchErrorEvent_(error) {
    const event = error
      ? createCustomEvent(this.win, `${TAG}.error`, {
          'response': error.response,
        })
      : null;
    this.action_.trigger(
      this.element,
      'fetch-error',
      event,
      ActionTrust_Enum.LOW
    );
  }

  /**
   * Request list data from `src` and return a promise that resolves when
   * the list has been populated with rendered list items. If the viewer is
   * capable of rendering the templates, then the fetching of the list and
   * transformation of the template is handled by the viewer.
   * @param {{refresh: (boolean|undefined), append: (boolean|undefined)}=} options
   * @return {!Promise}
   * @private
   */
  fetchList_(options = {}) {
    const {append = false, refresh = false} = options;
    const elementSrc = this.element.getAttribute('src');
    if (!elementSrc) {
      return Promise.resolve();
    }

    let fetch;
    if (this.ssrTemplateHelper_.isEnabled()) {
      fetch = this.ssrTemplate_(refresh);
    } else {
      if (this.isAmpStateSrc_(elementSrc)) {
        fetch = this.getAmpStateJson_(elementSrc);
      } else if (isAmpScriptUri(elementSrc)) {
        fetch = this.getAmpScriptJson_(elementSrc);
      } else {
        fetch = this.prepareAndSendFetch_(refresh);
      }
      fetch = fetch.then((data) => {
        // Bail if the src has changed while resolving the xhr request.
        if (elementSrc !== this.element.getAttribute('src')) {
          return;
        }

        const items = this.computeListItems_(data);
        if (this.loadMoreEnabled_) {
          this.updateLoadMoreSrc_(/** @type {!JsonObject} */ (data));
        }

        return this.scheduleRender_(items, append, data).then(() =>
          this.maybeSetLoadMore_()
        );
      });
    }

    return fetch.catch((error) => {
      // Append flow has its own error handling
      if (append) {
        throw error;
      }

      this.triggerFetchErrorEvent_(error);
      this.showFallback_();
      throw error;
    });
  }

  /**
   * @param {!Array<?JsonObject>} items
   * @return {!Array<?JsonObject>}
   * @private
   */
  truncateToMaxLen_(items) {
    const maxLen = parseInt(this.element.getAttribute('max-items'), 10);
    if (maxLen < items.length) {
      items = items.slice(0, maxLen);
    }
    return items;
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  updateLoadMoreSrc_(data) {
    const nextExpr =
      this.element.getAttribute('load-more-bookmark') || 'load-more-src';
    this.loadMoreSrc_ = /** @type {string} */ (getValueForExpr(data, nextExpr));
  }

  /**
   * Proxies the template rendering to the viewer.
   * @param {boolean} refresh
   * @return {!Promise}
   */
  ssrTemplate_(refresh) {
    const elementSrc = this.element.getAttribute('src');
    let request;
    // Construct the fetch init data that would be called by the viewer
    // passed in as the 'originalRequest'.
    return requestForBatchFetch(
      this.element,
      elementSrc,
      this.getPolicy_(),
      refresh
    )
      .then((r) => {
        request = r;

        request.xhrUrl = setupInput(this.win, request.xhrUrl, request.fetchOpt);
        request.fetchOpt = setupAMPCors(
          this.win,
          request.xhrUrl,
          request.fetchOpt
        );
        setupJsonFetchInit(r.fetchOpt);

        const attributes = {
          'ampListAttributes': {
            'items': this.element.getAttribute('items') || 'items',
            'singleItem': this.element.hasAttribute('single-item'),
            'maxItems': this.element.getAttribute('max-items'),
          },
        };
        return this.ssrTemplateHelper_.ssr(
          this.element,
          request,
          /* opt_templates */ null,
          attributes
        );
      })
      .then(
        (response) => {
          userAssert(
            response,
            'Failed fetching JSON data: XHR Failed fetching ' +
              `(${this.buildElidedUrl_(request)}): received no response.`
          );
          const init = response['init'];
          if (init) {
            const status = init['status'];
            if (status >= 300) {
              /** HTTP status codes of 300+ mean redirects and errors. */
              throw user().createError(
                `Failed fetching JSON data (${this.buildElidedUrl_(request)})` +
                  ': HTTP error',
                status
              );
            }
          }
          userAssert(
            typeof response['html'] === 'string',
            'Failed fetching JSON data: XHR Failed fetching ' +
              `(${this.buildElidedUrl_(request)}): Expected response with ` +
              'format {html: <string>}. Received: ',
            response
          );
          request.fetchOpt.responseType = 'application/json';
          return response;
        },
        (error) => {
          throw user().createError(
            'Failed fetching JSON data: XHR Failed fetching ' +
              `(${this.buildElidedUrl_(request)})`,
            error
          );
        }
      )
      .then((data) => {
        // Bail if the src has changed while resolving the xhr request.
        if (elementSrc !== this.element.getAttribute('src')) {
          return;
        }
        return this.scheduleRender_(data, /* append */ false);
      });
  }

  /**
   * Builds an elided, shortened URL suitable for display in error messages from
   * the given request.
   * @param {!FetchRequestDef} request
   * @return {string}
   */
  buildElidedUrl_(request) {
    const url = Services.urlForDoc(this.element).parse(request.xhrUrl);
    return `${url.origin}/...`;
  }

  /**
   * Schedules a fetch result to be rendered in the near future.
   * @param {!Array|!JsonObject|undefined} data
   * @param {boolean=} opt_append
   * @param {JsonObject|Array<JsonObject>=} opt_payload
   * @return {!Promise}
   * @private
   */
  scheduleRender_(data, opt_append, opt_payload) {
    const deferred = new Deferred();
    const {promise, reject: rejecter, resolve: resolver} = deferred;

    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }

    this.renderItems_ = /** @type {?RenderItems} */ ({
      data,
      resolver,
      rejecter,
      append: opt_append,
      payload: opt_payload,
    });

    if (this.renderedItems_ && opt_append) {
      this.renderItems_.payload =
        /** @type {(?JsonObject|Array<JsonObject>)} */ (opt_payload || {});
    }

    return promise;
  }

  /**
   * Renders the items stored in `this.renderItems_`. If its value changes
   * by the time render completes, schedules another render pass.
   * @private
   */
  doRenderPass_() {
    const current = this.renderItems_;

    user().fine(TAG, 'Rendering list', this.element, 'with data', current.data);

    devAssert(current && current.data, 'Nothing to render.');
    const scheduleNextPass = () => {
      // If there's a new `renderItems_`, schedule it for render.
      if (this.renderItems_ !== current) {
        this.renderPass_.schedule(1); // Allow paint frame before next render.
      } else {
        this.renderedItems_ = /** @type {?Array} */ (this.renderItems_.data);
        this.renderItems_ = null;
      }
    };
    const onFulfilledCallback = () => {
      scheduleNextPass();
      current.resolver();
    };
    const onRejectedCallback = () => {
      scheduleNextPass();
      current.rejecter();
    };
    const isSSR = this.ssrTemplateHelper_.isEnabled();
    let renderPromise = this.ssrTemplateHelper_
      .applySsrOrCsrTemplate(this.element, current.data)
      .then((result) => this.updateBindings_(result, current.append))
      .then((elements) => this.render_(elements, current.append));
    if (!isSSR) {
      const payload = /** @type {!JsonObject} */ (current.payload);
      renderPromise = renderPromise.then(() =>
        this.maybeRenderLoadMoreTemplates_(payload)
      );
    }
    renderPromise.then(onFulfilledCallback, onRejectedCallback);
  }

  /**
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  maybeRenderLoadMoreTemplates_(data) {
    if (this.loadMoreEnabled_) {
      const promises = [];
      promises.push(
        this.maybeRenderLoadMoreElement_(
          this.getLoadMoreService_().getLoadMoreButton(),
          data
        )
      );
      promises.push(
        this.maybeRenderLoadMoreElement_(
          this.getLoadMoreService_().getLoadMoreEndElement(),
          data
        )
      );
      return Promise.all(promises);
    } else {
      return Promise.resolve();
    }
  }

  /**
   * @param {?Element} elem
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  maybeRenderLoadMoreElement_(elem, data) {
    if (elem && this.templates_.hasTemplate(elem)) {
      return this.templates_
        .findAndRenderTemplate(elem, data)
        .then((newContents) => {
          return this.mutateElement(() => {
            removeChildren(dev().assertElement(elem));
            elem.appendChild(newContents);
          });
        });
    }
    return Promise.resolve();
  }

  /**
   * Scans for, evaluates and applies any bindings in the given elements.
   * Ensures that rendered content is up-to-date with the latest bindable state.
   * Can be skipped by setting binding="no" or binding="refresh" attribute.
   * @param {!Array<!Element>|!Element} elementOrElements
   * @param {boolean} append
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  updateBindings_(elementOrElements, append) {
    const elements = /** @type {!Array<!Element>} */ (
      isArray(elementOrElements) ? elementOrElements : [elementOrElements]
    );

    // binding=no: Always skip render-blocking update.
    const binding = this.element.getAttribute('binding');
    if (binding === 'no') {
      return Promise.resolve(elements);
    }

    // Early out if elements contain no bindings.
    const hasBindings = elements.some(
      (el) =>
        el.hasAttribute('i-amphtml-binding') ||
        !!el.querySelector('[i-amphtml-binding]')
    );
    if (!hasBindings) {
      return Promise.resolve(elements);
    }

    if (!binding) {
      user().warn(
        TAG,
        'Missing "binding" attribute. Using binding="refresh" is recommended for performance.'
      );
    }

    /**
     * @param {!../../../extensions/amp-bind/0.1/bind-impl.Bind} bind
     * @return {!Promise<!Array<!Element>>}
     */
    const updateWith = (bind) => {
      const removedElements = append ? [] : [this.container_];
      // Forward elements to chained promise on success or failure.
      return bind
        .rescan(elements, removedElements, {
          'fast': true,
          'update': true,
        })
        .then(
          () => elements,
          () => elements
        );
    };

    // binding=refresh: Only do render-blocking update after initial render.
    if (binding && binding.startsWith('refresh')) {
      // Don't bother using bindForDocOrNull() since the Bind service must be available after first mutate.
      const afterFirstMutate =
        this.bind_ && this.bind_.signals().get('FIRST_MUTATE');
      if (afterFirstMutate) {
        return updateWith(this.bind_);
      } else {
        // This must be initial render, so do a non-blocking scan for bindings only.
        // [diffable] is a special case that is handled later in render_(), see comment there.
        if (!this.element.hasAttribute('diffable')) {
          this.scanForBindings_(elements, []);
        }

        // Don't block render and return synchronously.
        return Promise.resolve(elements);
      }
    }
    // binding=always (default): Wait for amp-bind to download and always
    // do render-blocking update.
    return Services.bindForDocOrNull(this.element).then((bind) => {
      if (bind) {
        return updateWith(bind);
      } else {
        return Promise.resolve(elements);
      }
    });
  }

  /**
   * Scans for bindings in `addedElements` and removes bindings in `removedElements`.
   * Unlike updateBindings(), does NOT apply bindings or update DOM.
   * Should only be used for binding="refresh" or binding="refresh-evaluate".
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @private
   */
  scanForBindings_(addedElements, removedElements) {
    const binding = this.element.getAttribute('binding');
    if (!binding || !binding.startsWith('refresh')) {
      return;
    }
    Services.bindForDocOrNull(this.element).then((bind) => {
      if (bind) {
        // For binding="refresh-evaluate", we scan for bindings, evaluate+cache expressions, but skip DOM update.
        // For binding="refresh", we only scan for bindings.
        const update = binding == 'refresh-evaluate' ? 'evaluate' : false;
        bind.rescan(addedElements, removedElements, {
          'fast': true,
          'update': update,
        });
      }
    });
  }

  /**
   * @param {!Array<!Element>} elements
   * @param {boolean=} opt_append
   * @return {!Promise}
   * @private
   */
  render_(elements, opt_append = false) {
    const container = dev().assertElement(this.container_);

    const renderAndResize = () => {
      this.hideFallbackAndPlaceholder_();

      if (this.element.hasAttribute('diffable')) {
        // TODO:(wg-performance)(#28781) Ensure owners_.scheduleUnlayout() is
        // called for diff elements that are removed
        this.diff_(container, elements);

        // For diffable amp-list, we have to wait until DOM diffing is done here to scan for new bindings
        // (vs. asynchronously in updateBindings()), and scan the entire container (vs. just `elements`).
        //
        // This is because instead of replacing the entire DOM subtree, the diffing process removes
        // select children from `elements` and inserts them into the container. This results in a race
        // between diff_() and Bind.rescan(), which we avoid by delaying the latter until now.
        this.scanForBindings_([container], [container]);
      } else {
        if (!opt_append) {
          this.owners_./*OK*/ scheduleUnlayout(this.element, container);
          removeChildren(container);
        }
        this.addElementsToContainer_(elements, container);
      }

      const event = createCustomEvent(
        this.win,
        AmpEvents_Enum.DOM_UPDATE,
        /* detail */ null,
        {bubbles: true}
      );
      this.container_.dispatchEvent(event);

      // Now that new contents have been rendered, clear pending size requests
      // from previous calls to attemptToFit_(). Rejected size requests are
      // saved as "pending" and are fulfilled later on 'focus' event.
      // See resources-impl.checkPendingChangeSize_().
      const r = this.element.getResources().getResourceForElement(this.element);
      r.resetPendingChangeSize();

      return this.maybeResizeListToFitItems_();
    };

    // amp-list[layout=container] can manage resizing.
    if (!this.loadMoreEnabled_ && this.enableManagedResizing_) {
      return this.lockHeightAndMutate_(() => {
        const promise = renderAndResize() || Promise.resolve(true);
        promise.then((resized) =>
          resized ? this.unlockHeightInsideMutate_() : null
        );
      });
    }

    return this.mutateElement(renderAndResize);
  }

  /**
   * Updates `this.container_` by DOM diffing its children against `elements`.
   *
   * TODO(amphtml): The diffing feature is dark-launched and highly complex.
   * See markElementForDiffing() and markContainerForDiffing_() for examples.
   * Validate whether or not this complexity is warranted before fully launching
   * (e.g. in a new version) and pushing documentation.
   *
   * @param {!Element} container
   * @param {!Array<!Element>} elements
   * @private
   */
  diff_(container, elements) {
    const newContainer = this.createContainer_();
    this.addElementsToContainer_(elements, newContainer);

    // On renders N>1, diff-marking happens during template sanitization.
    // For render N=1, the placeholder already exists in DOM and is not
    // sanitized, so mark it manually to enable diffing.
    if (this.diffablePlaceholder_) {
      this.markContainerForDiffing_(container);
    }

    // setDOM does in-place DOM diffing for all non-AMP elements.
    const ignored = setDOM(container, newContainer);

    // Manually process ignored (AMP) elements.
    for (let i = 0; i < ignored.length; i += 2) {
      const before = dev().assertElement(ignored[i]);
      const after = dev().assertElement(ignored[i + 1]);
      this.manuallyDiffElement_(before, after);
    }
  }

  /**
   * @param {!Element} container
   * @private
   */
  markContainerForDiffing_(container) {
    // amp-mustache starts at 1 and increments, so start at -1 and decrement
    // to guarantee uniqueness.
    let key = -1;
    // (1) AMP elements and (2) elements with bindings need diff marking.
    // But, we only need to do (1) here because bindings in the diffable
    // placeholder are inert by design (as are bindings in normal placeholder).
    const elements = toArray(container.querySelectorAll('.i-amphtml-element'));
    elements.forEach((element) => {
      markElementForDiffing(element, () => String(key--));
    });
  }

  /**
   * @param {!Element} before
   * @param {!Element} after
   * @private
   */
  manuallyDiffElement_(before, after) {
    devAssert(before.nodeName == after.nodeName, 'Mismatched nodeName.');
    const replacementAttrs = DIFFABLE_AMP_ELEMENTS[before.nodeName];
    if (!replacementAttrs) {
      return;
    }
    const shouldReplace = replacementAttrs.some(
      (attr) => before.getAttribute(attr) !== after.getAttribute(attr)
    );
    // Use the new element if there's a mismatched attribute value.
    if (shouldReplace) {
      before.parentElement.replaceChild(after, before);
    } else {
      // TODO(#23470): Support more attributes to manually diff.

      // Add new classes.
      for (let i = 0; i < after.classList.length; i++) {
        before.classList.add(after.classList[i]);
      }
      // Remove missing, non-internal classes.
      for (let i = 0; i < before.classList.length; i++) {
        const c = before.classList[i];
        if (!c.startsWith('i-amphtml-') && !after.classList.contains(c)) {
          before.classList.remove(c);
        }
      }
      // Concatenate instead of overwrite [style] since width/height are set
      // by AMP's layout engine.
      if (after.hasAttribute('style')) {
        const afterStyle = after.getAttribute('style');
        before.setAttribute(
          'style',
          `${before.getAttribute('style') || ''};${afterStyle}`
        );
      }
    }
  }

  /**
   * Measure and lock height before performing given mutate fn.
   * Applicable for amp-list initialized with layout=container.
   * @private
   * @param {function():(Promise|undefined)} mutate
   * @return {!Promise}
   */
  lockHeightAndMutate_(mutate) {
    if (!this.enableManagedResizing_ || this.loadMoreEnabled_) {
      dev().error(
        TAG,
        '%s initialized with layout=container does not support infinite scrolling with [load-more]. %s',
        this.element
      );
      return Promise.resolve();
    }
    let currentHeight;
    return this.measureMutateElement(
      () => {
        currentHeight = this.element./*OK*/ offsetHeight;
      },
      () => {
        setImportantStyles(this.element, {
          'height': `${currentHeight}px`,
          'overflow': 'hidden',
        });
        return mutate();
      }
    );
  }

  /**
   * Applicable for amp-list initialized with layout=container.
   * @private
   */
  unlockHeightInsideMutate_() {
    devAssert(
      this.enableManagedResizing_ && !this.loadMoreEnabled_,
      '%s initialized with layout=container does not support infinite scrolling with [load-more]. %s',
      TAG,
      this.element
    );
    setImportantStyles(this.element, {
      'height': '',
      'overflow': '',
    });
  }

  /**
   * Attempts to change the height of the amp-list to fit a target child.
   *
   * If the target's height is greater than the amp-list's height, attempt
   * to change the amp-list's height to fit the target.
   *
   * @param {!Element} target
   * @private
   * @return {!Promise<boolean>}
   */
  attemptToFit_(target) {
    if (
      this.element.getAttribute('layout') == Layout_Enum.CONTAINER &&
      !this.enableManagedResizing_
    ) {
      return Promise.resolve(true);
    }
    return this.measureElement(() => {
      const targetHeight = target./*OK*/ scrollHeight;
      const height = this.element./*OK*/ offsetHeight;
      if (targetHeight > height) {
        return this.attemptChangeHeight(targetHeight).then(
          () => true,
          () => false
        );
      }
      return true;
    });
  }

  /**
   *
   * @param {!Element} target
   * @private
   */
  attemptToFitLoadMore_(target) {
    const element = !!this.loadMoreSrc_
      ? this.getLoadMoreService_().getLoadMoreButton()
      : this.getLoadMoreService_().getLoadMoreEndElement();
    this.attemptToFitLoadMoreElement_(element, target);
  }

  /**
   * @param {?Element} element
   * @param {!Element} target
   * @private
   */
  attemptToFitLoadMoreElement_(element, target) {
    if (this.element.getAttribute('layout') == Layout_Enum.CONTAINER) {
      return;
    }
    this.measureElement(() => {
      const targetHeight = target./*OK*/ scrollHeight;
      const height = this.element./*OK*/ offsetHeight;
      const loadMoreHeight = element ? element./*OK*/ offsetHeight : 0;
      if (targetHeight + loadMoreHeight > height) {
        this.attemptChangeHeight(targetHeight + loadMoreHeight)
          .then(() => {
            this.resizeFailed_ = false;
            // If there were not enough items to fill the list, consider
            // automatically loading more if load-more="auto" is enabled
            if (this.element.getAttribute('load-more') === 'auto') {
              this.maybeLoadMoreItems_();
            }
            setStyles(dev().assertElement(this.container_), {
              'max-height': '',
            });
          })
          .catch(() => {
            this.resizeFailed_ = true;
            this.adjustContainerForLoadMoreButton_();
          });
      }
    });
  }

  /**
   * Undoes previous size-defined layout, must be called in mutation context.
   * @param {string} layoutString
   * @see src/core/dom/layout/index.js
   */
  undoLayout_(layoutString) {
    const layout = parseLayout(layoutString);
    const layoutClass = getLayoutClass(devAssert(layout));
    this.element.classList.remove(layoutClass, 'i-amphtml-layout-size-defined');

    // TODO(amphtml): Remove [width] and [height] attributes too?
    if (
      [
        Layout_Enum.FIXED,
        Layout_Enum.FLEX_ITEM,
        Layout_Enum.FLUID,
        Layout_Enum.INTRINSIC,
        Layout_Enum.RESPONSIVE,
      ].includes(layout)
    ) {
      setStyles(this.element, {width: '', height: ''});
    } else if (layout == Layout_Enum.FIXED_HEIGHT) {
      setStyles(this.element, {height: ''});
    }

    // TODO(wg-performance): Use a new, unprivileged API.
    // The applySize() call removes the sizer element.
    this.element./*OK*/ applySize();
  }

  /**
   * Converts the amp-list to de facto layout container. Called in mutate
   * context.
   * @return {!Promise}
   * @private
   */
  changeToLayoutContainer_() {
    if (this.enableManagedResizing_) {
      // TODO: Link to amp.dev documentation in warning message.
      user().warn(
        TAG,
        '[is-layout-container] and changeToLayoutContainer are ineffective ' +
          'when an amp-list initially sets layout=container',
        this.element
      );
      return Promise.resolve();
    }
    const previousLayout = this.element.getAttribute('i-amphtml-layout');
    // If we have already changed to layout container, no need to run again.
    if (previousLayout == Layout_Enum.CONTAINER) {
      return Promise.resolve();
    }
    return this.mutateElement(() => {
      this.undoLayout_(previousLayout);
      this.container_.classList.remove(
        'i-amphtml-fill-content',
        'i-amphtml-replaced-content'
      );
      // The overflow element is generally hidden with visibility hidden,
      // but after changing to layout container, this causes an undesirable
      // empty white space so we hide it with "display: none" instead.
      const overflowElement = this.getOverflowElement();
      if (overflowElement) {
        toggle(overflowElement, false);
      }
      this.element.setAttribute('layout', 'container');
      this.element.setAttribute('i-amphtml-layout', 'container');
      this.element.classList.add('i-amphtml-layout-container');
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  maybeSetLoadMore_() {
    if (this.loadMoreEnabled_) {
      return this.setLoadMore_();
    }
    return Promise.resolve();
  }

  /**
   * Sets up auto-load-more if automatic load-more is on. Otherwise, sets up
   * manual load-more. In manual, shows the load-more button if there are more
   * elements to load and the load-more-end element if otherwise. Called on
   * the first fetch if load-more is on. Only called once.
   * @return {!Promise}
   * @private
   */
  setLoadMore_() {
    if (this.loadMoreSrc_) {
      const autoLoad = this.element.getAttribute('load-more') === 'auto';
      if (autoLoad) {
        this.setupLoadMoreAuto_();
      }
      return this.mutateElement(() => {
        this.getLoadMoreService_().toggleLoadMoreLoading(false);
        // Set back to visible because there are actually more elements
        // to load. See comment in initializeLoadMoreButton_ for context.
        setStyles(this.getLoadMoreService_().getLoadMoreButton(), {
          visibility: '',
        });
      });
    } else {
      return this.mutateElement(() =>
        this.getLoadMoreService_().setLoadMoreEnded()
      );
    }
  }

  /**
   * Called when 3 viewports above bottom of automatic load-more list, or
   * manually on clicking the load-more-button element. Sets the amp-list
   * src to the bookmarked src and fetches data from it.
   * @param {boolean=} opt_reload
   * @param {boolean=} opt_fromClick
   * @return {!Promise}
   * @private
   */
  loadMoreCallback_(opt_reload = false, opt_fromClick = false) {
    if (!!this.loadMoreSrc_) {
      this.element.setAttribute('src', this.loadMoreSrc_);
      // Clear url to avoid repeated fetches from same url
      this.loadMoreSrc_ = null;
    } else if (!opt_reload) {
      // Nothing more to load or previous fetch still inflight
      return Promise.resolve();
    }
    const container = dev().assertElement(this.container_);
    const lastTabbableChild = this.lastTabbableChild_(container);
    this.mutateElement(() => {
      this.getLoadMoreService_().toggleLoadMoreLoading(true);
    });
    return this.fetchList_({append: true})
      .then(() => {
        return this.mutateElement(() => {
          if (this.loadMoreSrc_) {
            this.getLoadMoreService_().toggleLoadMoreLoading(false);
            if (lastTabbableChild && opt_fromClick) {
              tryFocus(lastTabbableChild);
            }
          } else {
            this.getLoadMoreService_().setLoadMoreEnded();
          }
        });
      })
      .then(() => {
        // Necessary since load-more elements are toggled in the above block
        this.attemptToFitLoadMore_(dev().assertElement(this.container_));
      })
      .catch((error) => {
        this.triggerFetchErrorEvent_(error);
        this.handleLoadMoreFailed_();
      });
  }

  /**
   * @private
   */
  handleLoadMoreFailed_() {
    this.mutateElement(() =>
      this.getLoadMoreService_().setLoadMoreFailed()
    ).then(() => {
      this.attemptToFitLoadMoreElement_(
        this.getLoadMoreService_().getLoadMoreFailedElement(),
        dev().assertElement(this.container_)
      );
    });
  }

  /**
   * @param {boolean=} refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  fetch_(refresh = false) {
    return batchFetchJsonFor(this.getAmpDoc(), this.element, {
      expr: '.',
      urlReplacement: this.getPolicy_(),
      refresh,
      xssiPrefix: this.element.getAttribute('xssi-prefix') || undefined,
    });
  }

  /**
   * Sets up a listener on viewport change to load more items
   * @private
   */
  setupLoadMoreAuto_() {
    if (!this.unlistenAutoLoadMore_) {
      this.unlistenAutoLoadMore_ = this.viewport_.onChanged(() =>
        this.maybeLoadMoreItems_()
      );
    }
  }

  /**
   * If the bottom of the list is visible and
   * within three viewports of the current viewport,
   * then load more items.
   * @private
   */
  maybeLoadMoreItems_() {
    if (this.resizeFailed_) {
      return;
    }
    const endoOfListMarker = this.container_.lastChild || this.container_;

    this.viewport_
      .getClientRectAsync(dev().assertElement(endoOfListMarker))
      .then((positionRect) => {
        const viewportHeight = this.viewport_.getHeight();
        if (
          positionRect.bottom > 0 &&
          3 * viewportHeight > positionRect.bottom
        ) {
          return this.loadMoreCallback_();
        }
      });
  }

  /**
   * @param {boolean=} opt_refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  prepareAndSendFetch_(opt_refresh = false) {
    return this.fetch_(opt_refresh);
  }

  /**
   * @return {!UrlReplacementPolicy_Enum}
   */
  getPolicy_() {
    const src = this.element.getAttribute('src');
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    let policy = UrlReplacementPolicy_Enum.OPT_IN;
    if (
      src == this.initialSrc_ ||
      getSourceOrigin(src) == getSourceOrigin(this.getAmpDoc().win.location)
    ) {
      policy = UrlReplacementPolicy_Enum.ALL;
    }
    return policy;
  }

  /**
   * Must be called in mutate context.
   * @private
   */
  hideFallbackAndPlaceholder_() {
    this.element.classList.remove('i-amphtml-list-fetch-error');
    this.toggleLoading(false);
    if (this.getFallback()) {
      this.toggleFallback_(false);
    }
    this.togglePlaceholder(false);
  }

  /**
   * @private
   */
  showFallback_() {
    this.element.classList.add('i-amphtml-list-fetch-error');
    // Displaying [fetch-error] may offset diffable placeholder, so resize to fit.
    if (childElementByAttr(this.element, 'fetch-error')) {
      // Note that we're measuring against the element instead of the container.
      this.attemptToFit_(this.element);
    }
    this.toggleLoading(false);
    if (this.getFallback()) {
      this.toggleFallback_(true);
      this.togglePlaceholder(false);
    }
  }

  /**
   * @param {!Element} element
   * @return {?Element}
   * @private
   */
  lastTabbableChild_(element) {
    const allTabbableChildren = scopedQuerySelectorAll(
      element,
      TABBABLE_ELEMENTS_QUERY
    );
    return allTabbableChildren
      ? allTabbableChildren[allTabbableChildren.length - 1]
      : null;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpList, CSS);
});
