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
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {getSourceOrigin} from '../../../src/url';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {removeChildren} from '../../../src/dom';
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

    this.registerAction('refresh', () => {
      if (this.layoutCompleted_) {
        this.resetIfNecessary_();
        return this.fetchList_();
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
        promise = this.scheduleRender_(isArray(src) ? src : [src]);
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
      this.resetIfNecessary_(/* isFetch */ false);
      promise = this.scheduleRender_(isArray(state) ? state : [state]);
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
   * @return {!Promise}
   * @private
   */
  fetchList_() {
    if (!this.element.getAttribute('src')) {
      return Promise.resolve();
    }
    let fetch;
    if (this.ssrTemplateHelper_.isSupported()) {
      fetch = this.ssrTemplate_();
    } else {
      const itemsExpr = this.element.getAttribute('items') || 'items';
      fetch = this.fetch_(itemsExpr).then(items => {
        if (this.element.hasAttribute('single-item')) {
          user().assert(typeof items !== 'undefined',
              'Response must contain an array or object at "%s". %s',
              itemsExpr, this.element);
          if (!isArray(items)) {
            items = [items];
          }
        }
        user().assert(isArray(items),
            'Response must contain an array at "%s". %s',
            itemsExpr, this.element);
        const maxLen = parseInt(this.element.getAttribute('max-items'), 10);
        if (maxLen < items.length) {
          items = items.slice(0, maxLen);
        }
        return this.scheduleRender_(items);
      }, error => {
        throw user().createError('Error fetching amp-list', error);
      });
    }
    return fetch.catch(error => this.showFallback_(error));
  }

  /**
   * Proxies the template rendering to the viewer.
   * @return {!Promise}
   */
  ssrTemplate_() {
    let request;
    // Construct the fetch init data that would be called by the viewer
    // passed in as the 'originalRequest'.
    return requestForBatchFetch(
        this.getAmpDoc(),
        this.element,
        this.getPolicy_()).then(r => {
      request = r;

      request.fetchOpt = setupAMPCors(
          this.win, request.xhrUrl, request.fetchOpt);
      setupJsonFetchInit(r.fetchOpt);

      const attributes = dict({
        'ampListAttributes': {
          'items': this.element.getAttribute('items') || 'items',
          'singleItem': this.element.getAttribute('single-item'),
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
    }).then(html => this.scheduleRender_(html));
  }

  /**
   * Schedules a fetch result to be rendered in the near future.
   * @param {!Array|?JsonObject|string|undefined} data
   * @return {!Promise}
   * @private
   */
  scheduleRender_(data) {
    dev().info(TAG, 'schedule:', data);
    const deferred = new Deferred();
    const {promise, resolve: resolver, reject: rejecter} = deferred;
    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }
    this.renderItems_ = {data, resolver, rejecter};
    return promise;
  }

  /**
   * Renders the items stored in `this.renderItems_`. If its value changes
   * by the time render completes, schedules another render pass.
   * @private
   */
  doRenderPass_() {
    const current = this.renderItems_;
    dev().assert(current, 'Nothing to render.');
    dev().info(TAG, 'pass:', current);
    const scheduleNextPass = () => {
      // If there's a new `renderItems_`, schedule it for render.
      if (this.renderItems_ !== current) {
        this.renderPass_.schedule(1); // Allow paint frame before next render.
      } else {
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
      // TODO(alabiaga): This is a misleading type cast. Instead, we should use
      // a new API on template-impl.js and amp-mustache.js as discussed.
      const html = /** @type {!JsonObject} */ (current.data);
      this.templates_.findAndRenderTemplate(this.element, html)
          .then(element => this.render_([element]))
          .then(onFulfilledCallback, onRejectedCallback);
    } else {
      const array = /** @type {!Array} */ (current.data);
      this.templates_.findAndRenderTemplateArray(this.element, array)
          .then(results => this.updateBindings_(results))
          .then(elements => this.render_(elements))
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
   * @private
   */
  render_(elements) {
    dev().info(TAG, 'render:', elements);
    const container = dev().assertElement(this.container_);

    this.mutateElement(() => {
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
        removeChildren(container);
        this.addElementsToContainer_(elements, container);
      }

      const event = createCustomEvent(this.win,
          AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
      this.container_.dispatchEvent(event);

      // Attempt to resize to fit new rendered contents.
      this.attemptToFit_(this.container_, () => {
        // If auto-resize is set, then change to container layout instead of
        // changing height (with one exception).
        if (this.element.hasAttribute('auto-resize')) {
          const layout = this.element.getAttribute('layout');
          if (layout == Layout.FLEX_ITEM) {
            // TODO(cathyxz, #17824): Flex-item + reset-on-refresh will add
            // an invisible loader that fills the amp-list and shoves all
            // list items out of the amp-list.
            return true;
          } else if (layout !== Layout.CONTAINER) {
            this.changeToLayoutContainer_(layout);
          }
          return false;
        }
        return true;
      });
    });
  }

  /**
   * Attempts to change the height of the amp-list to fit a target child.
   *
   * If the target's height is greater than the amp-list's height, and
   * opt_decider returns truthy (or is not provided), then attempt to change the
   * amp-list's height to fit the target.
   *
   * @param {!Element} target
   * @param {function():boolean=} opt_decider
   * @private
   */
  attemptToFit_(target, opt_decider) {
    this.measureElement(() => {
      const scrollHeight = target./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (scrollHeight > height) {
        const shouldResize = !opt_decider || opt_decider();
        if (shouldResize) {
          this.attemptChangeHeight(scrollHeight).catch(() => {});
        }
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
   * @param {string} previousLayout
   * @private
   */
  changeToLayoutContainer_(previousLayout) {
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
   * @param {string} itemsExpr
   * @private
   */
  fetch_(itemsExpr) {
    return batchFetchJsonFor(
        this.getAmpDoc(), this.element, itemsExpr, this.getPolicy_());
  }

  /**
   * return {!UrlReplacementPolicy}
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
