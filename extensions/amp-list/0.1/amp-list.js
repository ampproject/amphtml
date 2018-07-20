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
} from '../../../src/batched-json';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user} from '../../../src/log';
import {getData} from '../../../src/event-helper';
import {getSourceOrigin} from '../../../src/url';
import {isArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeChildren} from '../../../src/dom';

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

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.getAmpDoc());

    /**
     * @const {!../../../src/ssr-template-helper.SsrTemplateHelper}
     * @private
     */
    this.ssrTemplateHelper_ = new SsrTemplateHelper(
        TAG, this.viewer_, this.templates_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
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
          return this.fetchList_();
        }
      } else if (typeof src === 'object') {
        // Remove the 'src' now that local data is used to render the list.
        this.element.setAttribute('src', '');
        this.resetIfNecessary_();
        const items = isArray(src) ? src : [src];
        this.scheduleRender_(items);
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
      this.resetIfNecessary_();
      const items = isArray(state) ? state : [state];
      this.scheduleRender_(items);
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
   * Wraps `toggleFallback()`. Runs in a mutate context by default but can be
   * disabled by passing false to `mutate`.
   * @param {boolean} show
   * @param {boolean=} mutate
   * @private
   */
  toggleFallback_(show, mutate = true) {
    // Early-out if toggling would be a no-op.
    if (!show && !this.fallbackDisplayed_) {
      return;
    }
    const toggle = value => {
      this.toggleFallback(value);
      this.fallbackDisplayed_ = value;
    };
    if (mutate) {
      this.mutateElement(() => toggle(show));
    } else {
      toggle(show);
    }
  }

  /**
   * If `reset-on-refresh` attribute exists, then removes any previously
   * rendered children and displays placeholder, loading indicator, etc.
   */
  resetIfNecessary_() {
    if (this.element.hasAttribute('reset-on-refresh')) {
      // Placeholder and loading don't need a mutate context.
      this.togglePlaceholder(true);
      this.toggleLoading(true, /* opt_force */ true);
      this.mutateElement(() => {
        this.toggleFallback_(false, /* mutate */ false);
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
      }).then(() => this.onFetchSuccess_(), error => this.onFetchError_(error));
    }
  }

  /**
   * Proxies the template rendering to the viewer.
   * @return {!Promise}
   */
  ssrTemplate_() {
    return this.ssrTemplateHelper_.fetchAndRenderTemplate(
        this.element).then(resp => {
      // TODO(alabiaga): Since this is related to the viewer,
      // this should be a 3rd log type?
      const data = getData(resp);
      user().assert(
          resp && (typeof data !== 'undefined'),
          'Response missing the \'data\' field');
      return this.scheduleRender_(data);
    }, error => {
      throw user().createError('Error proxying amp-list templates', error);
    }).then(() => this.onFetchSuccess_(), error => this.onFetchError_(error));
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
      this.templates_.findAndRenderTemplate(
          this.element, /** @type {!JsonObject} */ (current.data))
          .then(element => {
            this.container_.appendChild(element);
          })
          .then(onFulfilledCallback.bind(this), onRejectedCallback.bind(this));
    } else {
      this.templates_.findAndRenderTemplateArray(
          this.element, /** @type {!Array} */ (current.data))
          .then(elements => this.updateBindingsForElements_(elements))
          .then(elements => this.render_(elements))
          .then(onFulfilledCallback.bind(this), onRejectedCallback.bind(this));
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
  updateBindingsForElements_(elements) {
    const binding = this.element.getAttribute('binding');
    // "no": Always skip binding update.
    if (binding === 'no') {
      return Promise.resolve(elements);
    }
    // "refresh": Do _not_ block on retrieval of the Bind service before the
    // first mutation (AMP.setState).
    if (binding === 'refresh') {
      if (this.bind_ && this.bind_.signals().get('FIRST_MUTATE')) {
        return this.updateBindingsWith_(this.bind_, elements);
      } else {
        return Promise.resolve(elements);
      }
    }
    // "always" (default): Wait for Bind to scan for and evalute any bindings
    // in the newly rendered `elements`.
    return Services.bindForDocOrNull(this.element).then(bind => {
      if (bind) {
        return this.updateBindingsWith_(bind, elements);
      } else {
        return Promise.resolve(elements);
      }
    });
  }

  /**
   * @param {!../../../extensions/amp-bind/0.1/bind-impl.Bind} bind
   * @param {!Array<!Element>} elements
   * @return {!Promise<!Array<!Element>>}
   */
  updateBindingsWith_(bind, elements) {
    // Forward elements to chained promise on success or failure.
    const forwardElements = () => elements;
    return bind.scanAndApply(elements, [this.container_])
        .then(forwardElements, forwardElements);
  }

  /**
   * @param {!Array<!Element>} elements
   * @private
   */
  render_(elements) {
    dev().info(TAG, 'render:', elements);

    this.mutateElement(() => {
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
    const ampdoc = this.getAmpDoc();
    const src = this.element.getAttribute('src');
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    let policy = UrlReplacementPolicy.OPT_IN;
    if (src == this.initialSrc_ ||
      (getSourceOrigin(src) == getSourceOrigin(ampdoc.win.location))) {
      policy = UrlReplacementPolicy.ALL;
    }
    return batchFetchJsonFor(ampdoc, this.element, itemsExpr, policy);
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
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpList);
});
