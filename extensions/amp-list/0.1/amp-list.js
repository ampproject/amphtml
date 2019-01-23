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
import {Pass} from '../../../src/pass';
import {Services} from '../../../src/services';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
  requestForBatchFetch,
} from '../../../src/batched-json';
import {childElementByAttr, removeChildren} from '../../../src/dom';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getSourceOrigin} from '../../../src/url';
import {getValueForExpr} from '../../../src/json';
import {htmlFor} from '../../../src/static-template';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {px, setStyles, toggle} from '../../../src/style';
import {
  setupAMPCors,
  setupInput,
  setupJsonFetchInit,
} from '../../../src/utils/xhr-utils';

/** @const {string} */
const TAG = 'amp-list';

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
     * Latest fetched items to render and the promise resolver and rejecter
     * to be invoked on render success or fail, respectively.
     * @private {?{data:(?JsonObject|string|undefined|!Array), resolver:!Function, rejecter:!Function}}
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

    /** @private @const {boolean} */
    this.loadMoreEnabled_ = isExperimentOn(this.win, 'amp-list-load-more') &&
        element.hasAttribute('load-more');

    /** @private {?string} */
    this.loadMoreSrc_ = null;
    /** @private {?Element} */
    this.loadMoreButton_ = null;
    /** @private {?Element} */
    this.loadMoreButtonClickable_ = null;
    /** @private {?Element} */
    this.loadMoreLoadingElement_ = null;
    /** @private {?Element} */
    this.loadMoreFailedElement_ = null;
    /** @private {?Element} */
    this.loadMoreFailedClickable_ = null;
    /** @private {?Element} */
    this.loadMoreEndElement_ = null;
    /**@private {?UnlistenDef} */
    this.unlistenLoadMore_ = null;
    /**@private {boolean} */
    this.loadMoreLoading_ = false;


    this.registerAction('refresh', () => {
      if (this.layoutCompleted_) {
        this.resetIfNecessary_();
        return this.fetchList_(/*opt_append*/false, /* opt_refresh */ true);
      }
    }, ActionTrust.HIGH);

    if (isExperimentOn(this.win, 'amp-list-resizable-children')) {
      this.registerAction('changeToLayoutContainer',
          () => this.changeToLayoutContainer_(),
          ActionTrust.HIGH);
    }

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

  /**
   * @private
   */
  initializeLoadMoreButton_() {
    this.loadMoreButton_ = childElementByAttr(
        this.element, 'load-more-button');

    if (this.loadMoreButton_) {
      this.loadMoreButton_.classList.add('amp-visible');
    } else {
      this.loadMoreButton_ = htmlFor(this.win.document)`
        <amp-list-load-more load-more-button
          class="amp-visible i-amphtml-default-ui">
          <button load-more-clickable class="i-amphtml-list-load-more-button">
            <label>See More</label>
          </button>
        </amp-list-load-more>
      `;
    }
    // Even if it was provided by the user, we would still like to move it
    // to the end of amp-list after the container element.
    this.element.appendChild(this.loadMoreButton_);
    // Hide this so that we can measure its height but not see it.
    setStyles(this.loadMoreButton_, {
      visibility: 'hidden',
    });
  }

  /**
   * @private
   * @return {!Element}
   */
  getLoadMoreButton_() {
    if (!this.loadMoreButton_) {
      this.initializeLoadMoreButton_();
    }
    return dev().assertElement(this.loadMoreButton_);
  }

  /**
   * @private
   */
  initializeLoadMoreLoadingElement_() {
    this.loadMoreLoadingElement_ = childElementByAttr(
        this.element, 'load-more-loading');

    if (!this.loadMoreLoadingElement_) {
      this.loadMoreLoadingElement_ = htmlFor(this.win.document)`
        <amp-list-load-more load-more-loading class="i-amphtml-default-ui">
          <div class="i-amphtml-list-load-more-spinner"></div>
        </amp-list-load-more>
      `;
    }
    // Even if it was provided by the user, we would still like to move it
    // to the end of amp-list after the container element.
    this.element.appendChild(this.loadMoreLoadingElement_);
  }

  /**
   * @return {?Element}
   * @private
   */
  getLoadMoreLoadingElement_() {
    if (!this.loadMoreLoadingElement_) {
      this.initializeLoadMoreLoadingElement_();
    }
    return this.loadMoreLoadingElement_;
  }

  /**
   * @private
   * @return {!Element}
   */
  getLoadMoreButtonClickable_() {
    if (!this.loadMoreButtonClickable_) {
      const loadMoreButton = this.getLoadMoreButton_();
      this.loadMoreButtonClickable_ =
        childElementByAttr(loadMoreButton, 'load-more-clickable') ||
        loadMoreButton;
    }
    return this.loadMoreButtonClickable_;
  }

  /**
   * @private
   */
  initializeLoadMoreFailedElement_() {
    this.loadMoreFailedElement_ = childElementByAttr(
        this.element, 'load-more-failed');

    if (!this.loadMoreFailedElement_) {
      this.loadMoreFailedElement_ = htmlFor(this.win.document)`
        <amp-list-load-more load-more-failed class="i-amphtml-default-ui">
          <div class="i-amphtml-list-load-more-message">
            Unable to Load More
          </div>
          <button load-more-clickable
            class="i-amphtml-list-load-more-button
                  i-amphtml-list-load-more-button-has-icon
                  i-amphtml-list-load-more-button-small"
          >
            <div class="i-amphtml-list-load-more-icon"></div>
            <label>Retry</label>
          </button>
        </amp-list-load-more>
      `;
    }

    this.element.appendChild(this.loadMoreFailedElement_);
  }

  /**
   * @return {!Element}
   * @private
   */
  getLoadMoreFailedElement_() {
    if (!this.loadMoreFailedElement_) {
      this.initializeLoadMoreFailedElement_();
    }
    return dev().assertElement(this.loadMoreFailedElement_);
  }

  /**
   * @private
   * @return {!Element}
   */
  getLoadMoreFailedClickable_() {
    if (!this.loadMoreFailedClickable_) {
      const loadFailedElement = this.getLoadMoreFailedElement_();
      this.loadMoreFailedClickable_ = childElementByAttr(
          loadFailedElement, 'load-more-clickable') ||
        loadFailedElement;
    }
    return this.loadMoreFailedClickable_;
  }

  /**
   * @private
   */
  initializeLoadMoreEndElement_() {
    if (!this.loadMoreEndElement_) {
      this.loadMoreEndElement_ = childElementByAttr(
          this.element, 'load-more-end');
      if (this.loadMoreEndElement_) {
        this.element.appendChild(this.loadMoreEndElement_);
      }
    }
  }
  /**
   * Not guaranteed to return an element because load-more-end elements
   * are not mandatory.
   * @return {?Element}
   * @private
   */
  getLoadMoreEndElement_() {
    return this.loadMoreEndElement_;
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

    if (isExperimentOn(this.win, 'amp-list-viewport-resize')) {
      this.viewport_.onResize(() => {
        this.attemptToFit_(dev().assertElement(this.container_));
      });
    }

    if (this.loadMoreEnabled_) {
      this.mutateElement(() => {
        this.initializeLoadMoreButton_();
        this.initializeLoadMoreLoadingElement_();
        this.initializeLoadMoreFailedElement_();
        this.initializeLoadMoreEndElement_();
        // Hide overflow element
        const overflowElement = this.getOverflowElement();
        if (overflowElement) {
          toggle(overflowElement, false);
        }
      }).then(() => {
        this.adjustContainerForLoadMoreButton_();
      });
    }
    return this.fetchList_();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    dev().info(TAG, 'mutate:', mutations);
    let promise;
    const src = mutations['src'];
    const state = /** @type {!JsonObject} */ (mutations)['state'];
    const isLayoutContainer = mutations['is-layout-container'];
    if (src !== undefined) {
      if (typeof src === 'string') {
        // Defer to fetch in layoutCallback() before first layout.
        if (this.layoutCompleted_) {
          this.resetIfNecessary_();
          promise = this.fetchList_();
        }
      } else if (typeof src === 'object') {
        // Remove the 'src' now that local data is used to render the list.
        this.element.setAttribute('src', '');
        this.resetIfNecessary_(/* isFetch */ false);
        const data = isArray(src) ? src : [src];
        promise = this.scheduleRender_(data, /*append*/ false);
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
      this.resetIfNecessary_(/* isFetch */ false);
      const data = isArray(state) ? state : [state];
      promise = this.scheduleRender_(data, /*append*/ false);
    }
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
      fetch = this.fetch_(opt_refresh).then(data => {
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
          this.updateLoadMoreSrc_(/**@type {!JsonObject} */(data));
        }
        return this.scheduleRender_(items, !!opt_append, data);
      });
    }

    return fetch.catch(error => {
      if (opt_append) {
        throw error;
      }
      this.showFallback_(error);
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
      request.fetchOpt.responseType = 'application/json';
      this.ssrTemplateHelper_.verifySsrResponse(this.win, response, request);
      return response['html'];
    }, error => {
      throw user().createError('Error proxying amp-list templates', error);
    }).then(html => this.scheduleRender_(html, /*append*/ false));
  }

  /**
   * Schedules a fetch result to be rendered in the near future.
   * @param {!Array|?JsonObject|string|undefined} data
   * @param {boolean} append
   * @param {JsonObject|Array<JsonObject>=} opt_payload
   * @return {!Promise}
   * @private
   */
  scheduleRender_(data, append, opt_payload) {
    dev().info(TAG, 'schedule:', data);
    const deferred = new Deferred();
    const {promise, resolve: resolver, reject: rejecter} = deferred;

    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }

    this.renderItems_ = {data, append, resolver, rejecter,
      payload: opt_payload};

    if (this.renderedItems_ && append) {
      this.renderItems_.payload = opt_payload || {};
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
    dev().info(TAG, 'pass:', current);
    const scheduleNextPass = () => {
      // If there's a new `renderItems_`, schedule it for render.
      if (this.renderItems_ !== current) {
        this.renderPass_.schedule(1); // Allow paint frame before next render.
      } else {
        this.renderedItems_ = this.renderItems_.data;
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
    if (this.ssrTemplateHelper_.isSupported()) {
      const html = /** @type {string} */ (current.data);
      this.templates_.findAndSetHtmlForTemplate(this.element, html)
          .then(result => this.updateBindings_([result]))
          .then(element => this.render_(element, current.append))
          .then(onFulfilledCallback, onRejectedCallback);
    } else {
      const array = /** @type {!Array} */ (current.data);
      const payload = /** @type {!JsonObject} */ (current.payload);
      this.templates_.findAndRenderTemplateArray(this.element, array)
          .then(results => this.updateBindings_(results))
          .then(elements => this.render_(elements, current.append))
          .then(() => this.maybeRenderLoadMoreTemplates_(payload))
          .then(() => this.maybeSetLoadMore_())
          .then(onFulfilledCallback, onRejectedCallback);
    }
  }

  /**
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  maybeRenderLoadMoreTemplates_(data) {
    if (!this.loadMoreEnabled_) {
      return Promise.resolve();
    }
    const promises = [];
    promises.push(this.maybeRenderLoadMoreElement_(
        this.getLoadMoreButton_(), data));
    promises.push(this.maybeRenderLoadMoreElement_(
        this.getLoadMoreEndElement_(), data));
    return Promise.all(promises);
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
   * @param {!Array<!Element>} elements
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  updateBindings_(elements) {
    const binding = this.element.getAttribute('binding');
    // "no": Always skip binding update.
    if (binding === 'no') {
      return Promise.resolve(elements);
    }
    const updateWith = bind => {
      // Forward elements to chained promise on success or failure.
      return bind.scanAndApply(elements, [this.container_])
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
    dev().info(TAG, 'render:', elements);
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

      // Attempt to resize to fit new rendered contents.
      this.attemptToFit_(dev().assertElement(this.container_));
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
      if (this.loadMoreEnabled_) {
        const loadMoreHeight = this.getLoadMoreButton_()./*OK*/offsetHeight;
        if (targetHeight + loadMoreHeight > height) {
          this.attemptChangeHeight(targetHeight + loadMoreHeight)
              .catch(() => {});
        }
        const autoLoad = this.element.getAttribute('load-more') === 'auto';
        if (autoLoad) {
          this.maybeLoadMoreItems_();
        }
      } else {
        if (targetHeight > height) {
          this.attemptChangeHeight(targetHeight).catch(() => {});
        }
      }


    });
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
        () => {
          buttonHeight = this.getLoadMoreButton_()./*OK*/offsetHeight;
          listHeight = this.element./*OK*/offsetHeight;
        },
        () => {
          setStyles(dev().assertElement(this.container_), {
            'max-height': `calc(100% - ${px(buttonHeight)})`,
          });
          this.element./*OK*/changeSize(listHeight + buttonHeight);
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
    // TODO (#18875): cleanup resizable-children experiment
    userAssert(isExperimentOn(this.win, 'amp-list-resizable-children'),
        'Experiment amp-list-resizable-children is disabled');

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
    const shouldSetLoadMore = this.loadMoreEnabled_ && this.loadMoreSrc_;
    if (!shouldSetLoadMore) {
      return Promise.resolve();
    }
    const autoLoad = this.element.getAttribute('load-more') === 'auto';
    if (autoLoad) {
      this.setupLoadMoreAuto_();
    }
    const loadMoreEndElement = this.getLoadMoreEndElement_();
    const loadMoreButtonClickable = this.getLoadMoreButtonClickable_();
    return this.mutateElement(() => {
      this.getLoadMoreButton_().classList.toggle('amp-visible', true);
      this.getLoadMoreFailedElement_().classList.toggle('amp-visible', false);
      if (loadMoreEndElement) {
        loadMoreEndElement.classList.toggle('amp-visible', false);
      }
      // Set back to visible because there are actually more elements to load
      // See comment in initializeLoadMoreButton_ for context.
      setStyles(dev().assertElement(this.loadMoreButton_), {
        visibility: '',
      });
      this.unlistenLoadMore_ = listen(
          loadMoreButtonClickable,
          'click', () => this.loadMoreCallback_());
    }).then(() => {
      this.attemptToFit_(dev().assertElement(this.container_));
    });
  }

  /**
   * Called when 3 viewports above bottom of automatic load-more list, or
   * manually on clicking the load-more-button element. Sets the amp-list
   * src to the bookmarked src and fetches data from it.
   * @return {!Promise}
   * @private
   */
  loadMoreCallback_() {
    if (this.loadMoreSrc_) {
      this.element.setAttribute('src', this.loadMoreSrc_);
      this.loadMoreSrc_ = null;
    }

    this.toggleLoadMoreLoading_(true);
    return this.fetchList_(/* opt_append */ true)
        .then(() => {
          if (this.loadMoreSrc_) {
            this.toggleLoadMoreLoading_(false);
          } else {
            this.setLoadMoreEnded_();
          }
          if (this.unlistenLoadMore_) {
            this.unlistenLoadMore_();
            this.unlistenLoadMore_ = null;
          }
        }).catch(() => {
          this.setLoadMoreFailed_();
        });
  }

  /**
   * @return {!Promise}
   * @private
   */
  setLoadMoreEnded_() {
    return this.mutateElement(() => {
      this.getLoadMoreFailedElement_().classList.toggle('amp-visible', false);
      this.getLoadMoreButton_().classList.toggle('amp-visible', false);
      this.getLoadMoreLoadingElement_().classList.toggle('amp-visible', false);
      const loadMoreEndElement = this.getLoadMoreEndElement_();
      if (loadMoreEndElement) {
        loadMoreEndElement.classList.toggle('amp-visible', true);
      }
    });
  }
  /**
   * Toggles the visibility of the load-more-loading element.
   * @param {boolean} state
   * @private
   */
  toggleLoadMoreLoading_(state) {
    this.mutateElement(() => {
      // If it's loading, then it's no longer failed or ended
      if (state) {
        this.getLoadMoreFailedElement_().classList.toggle('amp-visible', false);
        const loadMoreEndElement = this.getLoadMoreEndElement_();
        if (loadMoreEndElement) {
          loadMoreEndElement.classList.toggle('amp-visible', false);
        }
      }
      this.getLoadMoreButton_().classList.toggle('amp-visible', !state);
      this.getLoadMoreLoadingElement_().classList.toggle('amp-visible', state);
    });
  }

  /**
   * Shows the load-more-failed element and hides the load-more-button
   * element.
   * @private
   */
  setLoadMoreFailed_() {
    const loadMoreFailedElement = this.getLoadMoreFailedElement_();
    const loadMoreButton = this.getLoadMoreButton_();
    if (!loadMoreFailedElement && !loadMoreButton) {
      return;
    }
    const loadMoreFailedClickable = this.getLoadMoreFailedClickable_();
    this.mutateElement(() => {
      loadMoreFailedElement.classList.toggle('amp-visible', true);
      this.unlistenLoadMore_ = listen(
          loadMoreFailedClickable,
          'click', () => this.loadMoreCallback_());
      loadMoreButton.classList.toggle('amp-visible', false);
      this.getLoadMoreLoadingElement_().classList.toggle('amp-visible', false);
    });
  }

  /**
   * @param {boolean} opt_refresh
   * @return {!Promise<(!Array<JsonObject>|!JsonObject)>}
   * @private
   */
  fetch_(opt_refresh = false) {
    return batchFetchJsonFor(
        this.getAmpDoc(), this.element, '.', this.getPolicy_(), opt_refresh);
  }

  /**
   * @private
   */
  setupLoadMoreAuto_() {
    this.viewport_.onChanged(() => this.maybeLoadMoreItems_());
  }

  /**
   * If the bottom of the list is within three viewports of the current
   * viewport, then load more items.
   * @private
   */
  maybeLoadMoreItems_() {
    if (this.loadMoreLoading_) {
      return;
    }
    this.loadMoreLoading_ = true;
    const lastItem = dev().assertElement(this.container_.lastChild);
    this.viewport_.getClientRectAsync(lastItem)
        .then(positionRect => {
          const viewportHeight = this.viewport_.getHeight();
          const viewportTop = this.viewport_.getScrollTop();
          if (viewportTop + 3 * viewportHeight > positionRect.bottom) {
            return this.loadMoreCallback_();
          }
        }).then(() => {
          this.loadMoreLoading_ = false;
        });

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
  showFallback_(error) {
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
