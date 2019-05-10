/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as setDOM from 'set-dom/src/index';
import {ActionTrust} from '../../../src/action-constants';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-list-0.1.css';
import {Deferred} from '../../../src/utils/promise';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {LoadMoreService} from './service/load-more-service';
import {Pass} from '../../../src/pass';
import {Services} from '../../../src/services';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
  requestForBatchFetch,
} from '../../../src/batched-json';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getSourceOrigin} from '../../../src/url';
import {getValueForExpr} from '../../../src/json';
import {
  getViewerAuthTokenIfAvailable,
  setupAMPCors,
  setupInput,
  setupJsonFetchInit,
} from '../../../src/utils/xhr-utils';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {px, setStyles, toggle} from '../../../src/style';
import {removeChildren} from '../../../src/dom';

/** @const {string} */
const TAG = 'amp-list';


/** @typedef {{
  data:(?JsonObject|string|undefined|!Array),
  resolver:!Function,
  rejecter:!Function,
  append:boolean,
  payload: (?JsonObject|Array<JsonObject>),
}} */
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

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
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
     * Local data queued for render (from `src` mutation before layoutCallbacK).
     * @private {?Array}
     */
    this.pendingLocalData_ = null;

    /**
     * Latest fetched items to render and the promise resolver and rejecter
     * to be invoked on render success or fail, respectively.
     * @private {?RenderItems}
     */
    this.renderItems_ = null;

    /** @private {?Array} */
    this.renderedItems_ = null;

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /**
     * Has layoutCallback() been called yet?
     * @private {boolean}
     */
    this.layoutCompleted_ = false;

    /**
     * The `src` attribute's initial value.
     * @private {?string}
     */
    this.initialSrc_ = null;

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
        return this.fetchList_(/* opt_append */ false, /* opt_refresh */ true);
      }
    }, ActionTrust.HIGH);

    this.registerAction('changeToLayoutContainer',
        () => this.changeToLayoutContainer_(),
        ActionTrust.HIGH);

    /** @private {?../../../src/ssr-template-helper.SsrTemplateHelper} */
    this.ssrTemplateHelper_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    this.ssrTemplateHelper_ = new SsrTemplateHelper(
        TAG, viewer, this.templates_);

    this.loadMoreEnabled_ = this.element.hasAttribute('load-more');

    // Store this in buildCallback() because `this.element` sometimes
    // is missing attributes in the constructor.
    this.initialSrc_ = this.element.getAttribute('src');

    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);

    if (!this.element.hasAttribute('aria-live')) {
      this.element.setAttribute('aria-live', 'polite');
    }

    // auto-resize is deprecated and will be removed per deprecation schedule
    // It will relaunched under a new attribute (resizable-children) soon.
    // please see https://github.com/ampproject/amphtml/issues/18849
    if (this.element.hasAttribute('auto-resize')) {
      user().warn(TAG, 'auto-resize attribute is deprecated and its behavior' +
          ' is disabled. This feature will be relaunched under a new name' +
          ' soon. Please see https://github.com/ampproject/amphtml/issues/18849'
      );
    }

    Services.bindForDocOrNull(this.element).then(bind => {
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
    }

    this.viewport_.onResize(() => {
      this.maybeResizeListToFitItems_();
    });

    if (this.loadMoreEnabled_) {
      this.initializeLoadMoreElements_();
    }

    // Don't fetch if `src` is empty string.
    if (!!this.element.getAttribute('src')) {
      return this.fetchList_();
    } else if (this.pendingLocalData_) {
      return this.scheduleRender_(this.pendingLocalData_);
    }
    return Promise.resolve();
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
      listen(this.getLoadMoreService_().getLoadMoreFailedClickable(),
          'click', () => this.loadMoreCallback_(/*opt_reload*/ true));
      listen(this.getLoadMoreService_().getLoadMoreButtonClickable(),
          'click', () => this.loadMoreCallback_());
    });
  }

  /**
   * @private
   */
  maybeResizeListToFitItems_() {
    if (this.loadMoreEnabled_) {
      this.attemptToFitLoadMore_(dev().assertElement(this.container_));
    } else {
      this.attemptToFit_(dev().assertElement(this.container_));
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
    return this.measureMutateElement(/* measurer */ () => {
      buttonHeight = this.getLoadMoreService_()
          .getLoadMoreButton()./*OK*/offsetHeight;
      listHeight = this.element./*OK*/offsetHeight;
    }, /* mutator */ () => {
      setStyles(dev().assertElement(this.container_), {
        'max-height': `calc(100% - ${px(buttonHeight)})`,
      });
      this.element./*OK*/changeSize(listHeight + buttonHeight);
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
    const renderLocalData = data => {
      // Remove the 'src' now that local data is used to render the list.
      this.element.setAttribute('src', '');
      const array = isArray(data) ? data : [data];
      // Defer to render in layoutCallback() before first layout.
      if (this.layoutCompleted_) {
        this.resetIfNecessary_(/* isFetch */ false);
        return this.scheduleRender_(array);
      } else {
        this.pendingLocalData_ = array;
      }
      return Promise.resolve();
    };

    const src = mutations['src'];
    const state = mutations['state'];
    if (src !== undefined) {
      if (typeof src === 'string') {
        // Defer to fetch in layoutCallback() before first layout.
        if (this.layoutCompleted_) {
          this.resetIfNecessary_();
          promise = this.fetchList_();
        }
      } else if (typeof src === 'object') {
        promise = renderLocalData(src);
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
      promise = renderLocalData(state);
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
   * amp-list reuses the loading indicator when the list is fetched again via
   * bind mutation or refresh action
   * @override
   */
  isLoadingReused() {
    return this.element.hasAttribute('reset-on-refresh');
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * @return {!Element}
   * @private
   */
  createContainer_() {
    const container = this.win.document.createElement('div');
    container.setAttribute('role', 'list');
    // In the load-more case, we allow the container to be height auto
    // in order to reasonably make space for the load-more button and
    // load-more related UI elements underneath.
    if (!this.loadMoreEnabled_) {
      this.applyFillContent(container, true);
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
    elements.forEach(element => {
      if (!element.hasAttribute('role')) {
        element.setAttribute('role', 'listitem');
      }
      container.appendChild(element);
    });
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
    if ((isFetch && this.element.hasAttribute('reset-on-refresh'))
      || this.element.getAttribute('reset-on-refresh') === 'always') {
      // Placeholder and loading don't need a mutate context.
      this.togglePlaceholder(true);
      this.toggleLoading(true, /* opt_force */ true);
      this.mutateElement(() => {
        this.toggleFallback_(false);
        // Clean up bindings in children before removing them from DOM.
        if (this.bind_) {
          const removed = toArray(this.container_.children);
          this.bind_.scanAndApply(/* added */ [], removed);
        }
        removeChildren(dev().assertElement(this.container_));
      });
    }
  }

  /**
   * Request list data from `src` and return a promise that resolves when
   * the list has been populated with rendered list items. If the viewer is
   * capable of rendering the templates, then the fetching of the list and
   * transformation of the template is handled by the viewer.
   * @param {boolean=} opt_append
   * @param {boolean=} opt_refresh
   * @return {!Promise}
   * @private
   */
  fetchList_(opt_append = false, opt_refresh = false) {
    if (!this.element.getAttribute('src')) {
      return Promise.resolve();
    }
    let fetch;
    if (this.ssrTemplateHelper_.isSupported()) {
      fetch = this.ssrTemplate_(opt_refresh);
    } else {
      const itemsExpr = this.element.getAttribute('items') || 'items';
      fetch = this.prepareAndSendFetch_(opt_refresh).then(data => {
        let items = data;
        if (itemsExpr != '.') {
          items = getValueForExpr(/**@type {!JsonObject}*/ (data), itemsExpr);
        }
        userAssert(typeof items !== 'undefined',
            'Response must contain an array or object at "%s". %s',
            itemsExpr, this.element);
        if (this.element.hasAttribute('single-item') && !isArray(items)) {
          items = [items];
        }
        items = user().assertArray(items);
        if (this.element.hasAttribute('max-items')) {
          items = this.truncateToMaxLen_(items);
        }
        if (this.loadMoreEnabled_) {
          this.updateLoadMoreSrc_(/** @type {!JsonObject} */ (data));
        }
        return this.scheduleRender_(items, opt_append, /* opt_payload */ data);
      });
    }

    return fetch.catch(error => {
      const event = error
        ? createCustomEvent(this.win, `${TAG}.error`,
            dict({'response': error.response}))
        : null;
      const actions = Services.actionServiceForDoc(this.element);
      actions.trigger(this.element, 'fetch-error', event, ActionTrust.LOW);

      if (opt_append) {
        throw error;
      }
      this.showFallbackOrThrow_(error);
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
    const nextExpr = this.element.getAttribute('load-more-bookmark')
      || 'load-more-src';
    this.loadMoreSrc_ = /** @type {string} */ (getValueForExpr(data, nextExpr));
  }

  /**
   * Proxies the template rendering to the viewer.
   * @param {boolean} refresh
   * @return {!Promise}
   */
  ssrTemplate_(refresh) {
    let request;
    // Construct the fetch init data that would be called by the viewer
    // passed in as the 'originalRequest'.
    return requestForBatchFetch(
        this.element,
        this.getPolicy_(),
        refresh).then(r => {
      request = r;

      request.xhrUrl =
         setupInput(this.win, request.xhrUrl, request.fetchOpt);
      request.fetchOpt = setupAMPCors(
          this.win, request.xhrUrl, request.fetchOpt);
      setupJsonFetchInit(r.fetchOpt);

      const attributes = dict({
        'ampListAttributes': {
          'items': this.element.getAttribute('items') || 'items',
          'singleItem': this.element.hasAttribute('single-item'),
          'maxItems': this.element.getAttribute('max-items'),
        },
      });
      return this.ssrTemplateHelper_.fetchAndRenderTemplate(
          this.element, request, /* opt_templates */ null, attributes);
    }).then(response => {
      userAssert(response && response['html'], 'Expected response with ' +
          'format {html: <string>}. Received: ', response);
      request.fetchOpt.responseType = 'application/json';
      this.ssrTemplateHelper_.verifySsrResponse(this.win, response, request);
      return response;
    }, error => {
      throw user().createError('Error proxying amp-list templates', error);
    }).then(data => this.scheduleRender_(data, /* append */ false));
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
    devAssert(this.layoutCompleted_);
    dev().info(TAG, 'schedule:', this.element, data);

    const deferred = new Deferred();
    const {promise, resolve: resolver, reject: rejecter} = deferred;

    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }

    this.renderItems_ = /** @type {?RenderItems} */ (
      {data, resolver, rejecter, append: opt_append, payload: opt_payload});

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

    devAssert(current && current.data, 'Nothing to render.');
    dev().info(TAG, 'pass:', this.element, current);
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
    const isSSR = this.ssrTemplateHelper_.isSupported();
    let renderPromise = this.ssrTemplateHelper_.renderTemplate(
        this.element, current.data)
        .then(result => this.updateBindings_(result, current.append))
        .then(elements => this.render_(elements, current.append));
    if (!isSSR) {
      const payload = /** @type {!JsonObject} */ (current.payload);
      renderPromise = renderPromise
          .then(() => this.maybeRenderLoadMoreTemplates_(payload))
          .then(() => this.maybeSetLoadMore_());
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
      promises.push(this.maybeRenderLoadMoreElement_(
          this.getLoadMoreService_().getLoadMoreButton(), data));
      promises.push(this.maybeRenderLoadMoreElement_(
          this.getLoadMoreService_().getLoadMoreEndElement(), data));
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
      return this.templates_.findAndRenderTemplate(elem, data)
          .then(newContents => {
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
    const elements = /** @type {!Array<!Element>} */
      (isArray(elementOrElements) ? elementOrElements : [elementOrElements]);
    const binding = this.element.getAttribute('binding');
    // "no": Always skip binding update.
    if (binding === 'no') {
      return Promise.resolve(elements);
    }
    const updateWith = bind => {
      const removedElements = append ? [] : [this.container_];
      // Forward elements to chained promise on success or failure.
      return bind.scanAndApply(elements, removedElements)
          .then(() => elements, () => elements);
    };
    // "refresh": Do _not_ block on retrieval of the Bind service before the
    // first mutation (AMP.setState).
    if (binding === 'refresh') {
      if (this.bind_ && this.bind_.signals().get('FIRST_MUTATE')) {
        return updateWith(this.bind_);
      } else {
        return Promise.resolve(elements);
      }
    }
    // "always" (default): Wait for Bind to scan for and evalute any bindings
    // in the newly rendered `elements`.
    return Services.bindForDocOrNull(this.element).then(bind => {
      if (bind) {
        return updateWith(bind);
      } else {
        return Promise.resolve(elements);
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
    dev().info(TAG, 'render:', this.element, elements);
    const container = dev().assertElement(this.container_);

    return this.mutateElement(() => {
      this.hideFallbackAndPlaceholder_();

      const diffing = isExperimentOn(this.win, 'amp-list-diffing');
      if (diffing && container.hasChildNodes()) {
        const newContainer = this.createContainer_();
        this.addElementsToContainer_(elements, newContainer);

        // Necessary to support both browserify and CC import semantics.
        const diff = (setDOM.default || setDOM);
        // Use `i-amphtml-key` as a node key for identifying when to skip
        // DOM diffing and replace. Needed for AMP elements, for example.
        diff.KEY = 'i-amphtml-key';
        diff(container, newContainer);
      } else {
        if (!opt_append) {
          removeChildren(container);
        }
        this.addElementsToContainer_(elements, container);
      }

      const event = createCustomEvent(this.win,
          AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
      this.container_.dispatchEvent(event);

      // Now that new contents have been rendered, clear pending size requests
      // from previous calls to attemptToFit_(). Rejected size requests are
      // saved as "pending" and are fulfilled later on 'focus' event.
      // See resources-impl.checkPendingChangeSize_().
      const r = this.element.getResources().getResourceForElement(this.element);
      r.resetPendingChangeSize();

      this.maybeResizeListToFitItems_();
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
   */
  attemptToFit_(target) {
    if (this.element.getAttribute('layout') == Layout.CONTAINER) {
      return;
    }
    this.measureElement(() => {
      const targetHeight = target./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (targetHeight > height) {
        this.attemptChangeHeight(targetHeight).catch(() => {});
      }
    });
  }

  /**
   *
   * @param {!Element} target
   * @private
   */
  attemptToFitLoadMore_(target) {
    const element = !!this.loadMoreSrc_ ?
      this.getLoadMoreService_().getLoadMoreButton() :
      this.getLoadMoreService_().getLoadMoreEndElement();
    this.attemptToFitLoadMoreElement_(element, target);
  }

  /**
   * @param {?Element} element
   * @param {!Element} target
   * @private
   */
  attemptToFitLoadMoreElement_(element, target) {
    if (this.element.getAttribute('layout') == Layout.CONTAINER) {
      return;
    }
    this.measureElement(() => {
      const targetHeight = target./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      const loadMoreHeight = element ? element./*OK*/offsetHeight : 0;
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
   * @param {string} previousLayout
   */
  undoPreviousLayout_(previousLayout) {
    switch (previousLayout) {
      case Layout.RESPONSIVE:
        this.element.classList.remove('i-amphtml-layout-responsive');
        setStyles(this.element, {
          height: '',
          width: '',
        });
        break;
      case Layout.FLEX_ITEM:
        setStyles(this.element, {
          height: '',
          width: '',
        });
        break;
      case Layout.FIXED:
        this.element.classList.remove('i-amphtml-layout-fixed');
        setStyles(this.element, {
          height: '',
        });
        break;
      case Layout.FIXED_HEIGHT:
        this.element.classList.remove('i-amphtml-layout-fixed-height');
        setStyles(this.element, {
          height: '',
          width: '',
        });
        break;
      case Layout.INTRINSIC:
        this.element.classList.remove('i-amphtml-layout-intrinsic');
        break;
      default:
        // fall through, always remove sizer and size-defined class
    }
    // The changeSize() call removes the sizer element.
    this.element./*OK*/changeSize();
    this.element.classList.remove('i-amphtml-layout-size-defined');
  }

  /**
   * Converts the amp-list to de facto layout container. Called in mutate
   * context.
   * @return {!Promise}
   * @private
   */
  changeToLayoutContainer_() {
    const previousLayout = this.element.getAttribute('layout');
    // If we have already changed to layout container, no need to run again.
    if (previousLayout == Layout.CONTAINER) {
      return Promise.resolve();
    }

    return this.mutateElement(() => {
      this.undoPreviousLayout_(previousLayout);
      this.container_.classList.remove(
          'i-amphtml-fill-content',
          'i-amphtml-replaced-content'
      );
      // The overflow element is generally hidden with visibility hidden,
      // but after changing to layout container, this causes an undesirable
      // empty white space so we hide it with display none instead.
      const overflowElement = this.getOverflowElement();
      if (overflowElement) {
        toggle(overflowElement, false);
      }
      this.element.classList.add('i-amphtml-layout-container');
      this.element.setAttribute('layout', 'container');
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
      return this.mutateElement(
          () => this.getLoadMoreService_().setLoadMoreEnded());
    }
  }

  /**
   * Called when 3 viewports above bottom of automatic load-more list, or
   * manually on clicking the load-more-button element. Sets the amp-list
   * src to the bookmarked src and fetches data from it.
   * @param {boolean=} opt_reload
   * @return {!Promise}
   * @private
   */
  loadMoreCallback_(opt_reload = false) {
    if (!!this.loadMoreSrc_) {
      this.element.setAttribute('src', this.loadMoreSrc_);
      // Clear url to avoid repeated fetches from same url
      this.loadMoreSrc_ = null;
    } else if (!opt_reload) {
      // Nothing more to load or previous fetch still inflight
      return Promise.resolve();
    }
    this.mutateElement(() => {
      this.getLoadMoreService_().toggleLoadMoreLoading(true);
    });
    return this.fetchList_(/* opt_append */ true)
        .then(() => {
          return this.mutateElement(() => {
            if (this.loadMoreSrc_) {
              this.getLoadMoreService_().toggleLoadMoreLoading(false);
            } else {
              this.getLoadMoreService_().setLoadMoreEnded();
            }
          });
        }).then(() => {
          // Necessary since load-more elements are toggled in the above block
          this.attemptToFitLoadMore_(dev().assertElement(this.container_));
        }).catch(() => {
          this.handleLoadMoreFailed_();
        });
  }

  /**
   * @private
   */
  handleLoadMoreFailed_() {
    this.mutateElement(() => this.getLoadMoreService_().setLoadMoreFailed())
        .then(() => {
          this.attemptToFitLoadMoreElement_(
              this.getLoadMoreService_().getLoadMoreFailedElement(),
              dev().assertElement(this.container_));
        });
  }

  /**
   * @param {boolean=} opt_refresh
   * @param {string=} token
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  fetch_(opt_refresh = false, token = undefined) {
    return batchFetchJsonFor(this.getAmpDoc(), this.element, '.',
        this.getPolicy_(), opt_refresh, token);
  }

  /**
   * @private
   */
  setupLoadMoreAuto_() {
    if (!this.unlistenAutoLoadMore_) {
      this.unlistenAutoLoadMore_ = this.viewport_.onChanged(
          () => this.maybeLoadMoreItems_());
    }
  }

  /**
   * If the bottom of the list is within three viewports of the current
   * viewport, then load more items.
   * @private
   */
  maybeLoadMoreItems_() {
    if (this.resizeFailed_) {
      return;
    }
    const endoOfListMarker = this.container_.lastChild || this.container_;

    this.viewport_.getClientRectAsync(dev().assertElement(endoOfListMarker))
        .then(positionRect => {
          const viewportHeight = this.viewport_.getHeight();
          const viewportTop = this.viewport_.getScrollTop();
          if (viewportTop + 3 * viewportHeight > positionRect.bottom) {
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
    return getViewerAuthTokenIfAvailable(this.element).then(token =>
      this.fetch_(opt_refresh, token)
    );
  }

  /**
   * @return {!UrlReplacementPolicy}
   */
  getPolicy_() {
    const src = this.element.getAttribute('src');
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    let policy = UrlReplacementPolicy.OPT_IN;
    if (src == this.initialSrc_ ||
       (getSourceOrigin(src)
           == getSourceOrigin(this.getAmpDoc().win.location))) {
      policy = UrlReplacementPolicy.ALL;
    }
    return policy;
  }

  /**
   * Must be called in mutate context.
   * @private
   */
  hideFallbackAndPlaceholder_() {
    this.toggleLoading(false);
    if (this.getFallback()) {
      this.toggleFallback_(false);
    }
    this.togglePlaceholder(false);
  }

  /**
   * @param {*=} error
   * @throws {!Error} If fallback element is not present.
   * @private
   */
  showFallbackOrThrow_(error) {
    this.toggleLoading(false);
    if (this.getFallback()) {
      this.toggleFallback_(true);
      this.togglePlaceholder(false);
    } else {
      throw error;
    }
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpList, CSS);
});
