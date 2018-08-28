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

import {ActionTrust} from '../../../src/action-constants';
import {AmpEvents} from '../../../src/amp-events';
import {Deferred} from '../../../src/utils/promise';
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
import {getSourceOrigin} from '../../../src/url';
import {isArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeChildren} from '../../../src/dom';
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

    this.container_ = this.win.document.createElement('div');
    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);

    if (!this.container_.hasAttribute('role')) {
      this.container_.setAttribute('role', 'list');
    }

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
    return this.fetchList_();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    dev().info(TAG, 'mutate:', mutations);
    const src = mutations['src'];
    const state = mutations['state'];
    if (src !== undefined) {
      if (typeof src === 'string') {
        // Defer to fetch in layoutCallback() before first layout.
        if (this.layoutCompleted_) {
          this.resetIfNecessary_();
          this.fetchList_();
        }
      } else if (typeof src === 'object') {
        // Remove the 'src' now that local data is used to render the list.
        this.element.setAttribute('src', '');
        this.resetIfNecessary_(/* isFetch */ false);
        this.scheduleRender_(isArray(src) ? src : [src]);
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
      this.resetIfNecessary_(/* isFetch */ false);
      this.scheduleRender_(isArray(state) ? state : [state]);
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
    if (this.ssrTemplateHelper_.isSupported()) {
      return this.ssrTemplate_();
    } else {
      const itemsExpr = this.element.getAttribute('items') || 'items';
      return this.fetch_(itemsExpr).then(items => {
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
      }).catch(error => this.showFallback_(error));
    }
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
        this.getPolicy_()).then(batchFetchDef => {
      request = batchFetchDef;
      batchFetchDef.fetchOpt = setupAMPCors(
          this.win, batchFetchDef.xhrUrl, batchFetchDef.fetchOpt);
      setupJsonFetchInit(batchFetchDef.fetchOpt);
      const ampListAttributes = dict({
        'ampListAttributes': {
          'items': this.element.getAttribute('items') || 'items',
          'singleItem': this.element.getAttribute('single-item'),
          'maxItems': this.element.getAttribute('max-items'),
        },
      });
      return this.ssrTemplateHelper_.fetchAndRenderTemplate(
          this.element, batchFetchDef, null, ampListAttributes);
    }).then(response => {
      request.fetchOpt.responseType = 'application/json';
      this.ssrTemplateHelper_.verifySsrResponse(
          this.win, response, request);
      return response['html'];
    }, error => {
      throw user().createError('Error proxying amp-list templates', error);
    }).then(html => this.scheduleRender_(html))
        .then(() => this.onFetchSuccess_(),
            error => this.onFetchError_(error));
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
      const json = /** @type {!JsonObject} */ (current.data);
      this.templates_.findAndRenderTemplate(this.element, json)
          .then(element => this.container_.appendChild(element))
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
    this.mutateElement(() => {
      this.hideFallbackAndPlaceholder_();

      removeChildren(dev().assertElement(this.container_));
      elements.forEach(element => {
        if (!element.hasAttribute('role')) {
          element.setAttribute('role', 'listitem');
        }
        this.container_.appendChild(element);
      });

      const event = createCustomEvent(this.win,
          AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
      this.container_.dispatchEvent(event);

      // Change height if needed.
      this.measureElement(() => {
        const scrollHeight = this.container_./*OK*/scrollHeight;
        const height = this.element./*OK*/offsetHeight;
        if (scrollHeight > height) {
          this.attemptChangeHeight(scrollHeight).catch(() => {});
        }
      });
    }, this.container_);
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

  /** @private */
  onFetchSuccess_() {
    if (this.getFallback()) {
      // Hide in case fallback was displayed for a previous fetch.
      this.toggleFallback_(false);
    }
    this.togglePlaceholder(false);
    this.toggleLoading(false);
  }

  /**
   * @param {*=} error
   * @private
   * @throws {!Error} throws error if fallback element is not present.
   */
  onFetchError_(error) {
    this.toggleLoading(false);
    if (this.getFallback()) {
      this.toggleFallback(true);
      this.togglePlaceholder(false);
    } else {
      throw error;
    }
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
