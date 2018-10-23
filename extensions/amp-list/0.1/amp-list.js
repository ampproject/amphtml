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
import {CommonSignals} from '../../../src/common-signals';
import {Deferred} from '../../../src/utils/promise';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Pass} from '../../../src/pass';
import {
  PositionObserverFidelity,
} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
  requestForBatchFetch,
} from '../../../src/batched-json';
import {childElementByAttr, removeChildren} from '../../../src/dom';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {createLoaderElement} from '../../../src/loader';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getServiceForDoc} from '../../../src/service';
import {getSourceOrigin} from '../../../src/url';
import {getValueForExpr} from '../../../src/json';
import {
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {setStyles, toggle} from '../../../src/style';
import {
  setupAMPCors,
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
    this.loadMoreOverflow_ = null;
    /** @private {?Element} */
    this.loadMoreLoadingOverlay_ = null;
    /** @private {?Element} */
    this.loadMoreLoadingElement_ = null;
    /** @private {?Element} */
    this.loadMoreFailedElement_ = null;
    /** @private {?Element} */
    this.loadMoreOverflowElement_ = null;
    /** @private {?../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = null;

    /** @private {boolean} */
    this.hasResizableChildren_ = false;

    this.registerAction('refresh', () => {
      if (this.layoutCompleted_) {
        this.resetIfNecessary_();
        return this.fetchList_(/*opt_append*/false, /* opt_refresh */ true);
      }
    }, ActionTrust.HIGH);

    /** @private {?../../../src/ssr-template-helper.SsrTemplateHelper} */
    this.ssrTemplateHelper_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
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

    // TODO(aghassemi): New name to be vetted, since under an experiment flag,
    // going with `resizable-children` fo now but we can change it.
    this.hasResizableChildren_ =
      this.element.hasAttribute('resizable-children');
    if (this.hasResizableChildren_) {
      user().assert(isExperimentOn(this.win, 'amp-list-resizable-children'),
          'Experiment amp-list-resizable-children is disabled');
    }

    Services.bindForDocOrNull(this.element).then(bind => {
      this.bind_ = bind;
    });

    if (this.loadMoreEnabled_) {
      this.getLoadMoreOverflowElement_();
      this.getLoadMoreLoadingElement_();
      if (!this.loadMoreLoadingElement_) {
        this.getLoadMoreLoadingOverlay_();
      }
      this.getLoadMoreFailedElement_();
    }
  }

  /**
   * @private
   * @return {!Element|null}
   */
  getLoadMoreOverflowElement_() {
    if (!this.loadMoreOverflow_) {
      this.loadMoreOverflow_ = childElementByAttr(
          this.element, 'load-more-button');
    }
    return this.loadMoreOverflowElement_;
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
    return this.fetchList_();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    dev().info(TAG, 'mutate:', mutations);
    let promise;
    const src = mutations['src'];
    const state = /** @type {!JsonObject} */ (mutations)['state'];
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
    this.applyFillContent(container, true);
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
        let items = getValueForExpr(data, itemsExpr);
        if (this.element.hasAttribute('single-item')) {
          user().assert(typeof items !== 'undefined',
              'Response must contain an array or object at "%s". %s',
              itemsExpr, this.element);
          if (!isArray(items)) {
            items = [items];
          }
        } else if (this.loadMoreEnabled_) {
          const nextExpr = this.element.getAttribute('load-more-bookmark')
            || 'load-more-src';
          this.loadMoreSrc_ = /** @type {string} */
            (getValueForExpr(data, nextExpr));
        }
        user().assert(isArray(items),
            'Response must contain an array at "%s". %s',
            itemsExpr, this.element);
        const maxLen = parseInt(this.element.getAttribute('max-items'), 10);
        if (maxLen < items.length) {
          items = items.slice(0, maxLen);
        }
        return this.scheduleRender_(/** @type {!Array} */(items), !!opt_append);
      }, error => {
        throw user().createError('Error fetching amp-list', error);
      });
    }
    return fetch.catch(error => this.showFallback_(error));
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
        this.getAmpDoc(),
        this.element,
        this.getPolicy_(),
        refresh).then(r => {
      request = r;

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
   * @return {!Promise}
   * @private
   */
  scheduleRender_(data, append) {
    dev().info(TAG, 'schedule:', data);
    const deferred = new Deferred();
    const {promise, resolve: resolver, reject: rejecter} = deferred;

    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }

    this.renderItems_ = {data, append, resolver, rejecter};

    if (this.renderedItems_ && append) {
      this.renderItems_.data = this.renderedItems_.concat(data);
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
    dev().assert(current && current.data, 'Nothing to render.');
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
          .then(element => this.render_([element], current.append))
          .then(onFulfilledCallback, onRejectedCallback);
    } else {
      const array = /** @type {!Array} */ (current.data);
      this.templates_.findAndRenderTemplateArray(this.element, array)
          .then(results => this.updateBindings_(results))
          .then(elements => this.render_(elements, current.append))
          .then(() => this.loadMoreEnabled_ && this.setLoadMore_())
          .then(onFulfilledCallback, onRejectedCallback);
    }
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
      this.attemptToFit_(this.container_);

      if (this.hasResizableChildren_) {
        // If the element's size was changed, change to container layout
        // if the resizable-children attribute is set.
        this.element.signals().whenSignal(CommonSignals.CHANGE_SIZE_END)
            .then(() => this.changeToLayoutContainer_());
      }
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
    this.measureElement(() => {
      const scrollHeight = target./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (scrollHeight > height) {
        this.attemptChangeHeight(scrollHeight).catch(() => {});
      } else if (scrollHeight == height
          && this.hasResizableChildren_) {
        this.changeToLayoutContainer_();
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
    }
    // The changeSize() call removes the sizer element.
    this.element./*OK*/changeSize();
    this.element.classList.remove('i-amphtml-layout-size-defined');
  }

  /**
   * Converts the amp-list to de facto layout container. Must be called in
   * mutation context.
   * @private
   */
  changeToLayoutContainer_() {
    const previousLayout = this.element.getAttribute('layout');
    // If we have already changed to layout container, no need to run again.
    if (previousLayout == Layout.CONTAINER) {
      return;
    }
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
    this.element.setAttribute('layout', 'container');
  }

  /**
   * @private
   */
  setLoadMore_() {
    if (!this.loadMoreSrc_ && !this.loadMoreOverflow_) {
      return;
    }
    const triggerOnScroll = this.element.getAttribute('load-more') === 'auto';
    if (triggerOnScroll) {
      this.maybeSetupLoadMoreAuto_();
    }
    if (this.loadMoreOverflow_) {
      this.mutateElement(() => {
        this.loadMoreOverflow_.classList.toggle('amp-visible', true);
        listen(this.loadMoreOverflow_, 'click', () => this.loadMoreCallback_());
      });
    }
    if (!this.loadMoreOverflow_ && !triggerOnScroll) {
      user().error(TAG,
          'load-more is specified but no means of paging (overflow or ' +
          'load-more=auto) is available', this);
    }
  }

  /**
   * @private
   */
  loadMoreCallback_() {
    if (!this.loadMoreSrc_) {
      return;
    }
    if (this.loadMoreOverflow_) {
      this.loadMoreOverflow_.onclick = null;
    }
    this.element.setAttribute('src', this.loadMoreSrc_);
    this.loadMoreSrc_ = null;
    this.toggleLoadMoreLoading_(true);
    return this.fetchList_(/* opt_append */ true)
        .catch(() => this.setLoadMoreFailed_())
        .then(() => this.toggleLoadMoreLoading_(false));
  }

  /**
   * @private
   */
  getLoadMoreLoadingElement_() {
    if (!this.loadMoreLoadingElement_) {
      this.loadMoreLoadingElement_ = childElementByAttr(
          this.element, 'load-more-loading');
    }
    return this.loadMoreLoadingElement_;
  }

  /**
   * @private
   */
  getLoadMoreLoadingOverlay_() {
    if (!this.loadMoreLoadingOverlay_) {
      this.loadMoreLoadingOverlay_ = createLoaderElement(
          this.win.document, 'load-more-loading');
      this.loadMoreLoadingOverlay_.setAttribute('load-more-loading', '');
      this.loadMoreOverflow_.appendChild(this.loadMoreLoadingOverlay_);
    }
    return this.loadMoreLoadingOverlay_;
  }

  /**
   * @param {boolean} state
   * @private
   */
  toggleLoadMoreLoading_(state) {
    if (this.loadMoreLoadingElement_) {
      this.mutateElement(() => {
        if (state) {
          this.loadMoreOverflow_.classList.toggle('amp-visible', false);
        }
        this.loadMoreLoadingElement_.classList.toggle('amp-visible', state);
      });
    } else if (this.loadMoreOverflow_) {
      this.mutateElement(() => {
        this.loadMoreOverflow_.classList.toggle('amp-load-more-loading', state);
        this.loadMoreLoadingOverlay_.classList.toggle('amp-active', !state);
      });
    }
  }

  /**
   * @private
   */
  setLoadMoreFailed_() {
    if (!this.loadMoreFailedElement_ && !this.loadMoreOverflow_) {
      return;
    }
    this.mutateElement(() => {
      if (this.loadMoreFailedElement_) {
        this.loadMoreFailedElement_.classList.toggle('amp-visible', true);
      }
      if (this.loadMoreOverflow_) {
        this.loadMoreOverflow_.classList.toggle('amp-visible', false);
      }
    });
  }

  /**
   * @private
   */
  getLoadMoreFailedElement_() {
    if (!this.loadMoreFailedElement_) {
      this.loadMoreFailedElement_ = childElementByAttr(
          this.element, 'load-more-failed');
    }
    return this.loadMoreFailedElement_;
  }


  /**
   * @param {boolean} opt_refresh
   * @private
   */
  fetch_(opt_refresh = false) {
    return batchFetchJsonFor(
        this.getAmpDoc(), this.element, '.', this.getPolicy_(), opt_refresh);
  }

  /**
   * @private
   */
  maybeSetupLoadMoreAuto_() {
    if (!this.positionObserver_) {
      installPositionObserverServiceForDoc(this.getAmpDoc());
      this.positionObserver_ = getServiceForDoc(
          this.getAmpDoc(),
          'position-observer'
      );
      this.positionObserver_.observe(this.container_,
          PositionObserverFidelity.LOW,
          ({positionRect, viewportRect}) => {
            const ratio = 1.5;
            if (this.loadMoreSrc_ &&
                positionRect.bottom < ratio * viewportRect.bottom) {
              this.loadMoreCallback_();
            }
          });
    }
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
  AMP.registerElement(TAG, AmpList);
});
