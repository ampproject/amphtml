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

import * as dom from '../../../src/dom';
import {ActionTrust} from '../../../src/action-trust';
import {AmpEvents} from '../../../src/amp-events';
import {Pass} from '../../../src/pass';
import {
  PositionObserverFidelity,
} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {createCustomEvent} from '../../../src/event-helper';
import {createLoaderElement} from '../../../src/loader';
import {dev, user} from '../../../src/log';
import {getServiceForDoc} from '../../../src/service';
import {getSourceOrigin} from '../../../src/url';
import {getValueForExpr} from '../../../src/json';
import {
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper.js';

/** @const {string} */
const TAG = 'amp-list';

/** @const {string} */
const LOAD_MORE_EXP_TAG = 'amp-list-load-more';

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
     * @private {?{items:!Array, resolver:!Function, rejecter:!Function}}
     */
    this.renderItems_ = null;

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /**
     * Has layoutCallback() been called yet?
     * @private {boolean}
     */
    this.layoutCompleted_ = false;

    /** @const @private {string} */
    this.initialSrc_ = element.getAttribute('src');

    /** @private @const {boolean} */
    this.loadMoreEnabled_ =
        isExperimentOn(this.getAmpDoc().win, LOAD_MORE_EXP_TAG) &&
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

    /** @private {?../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = null;

    this.registerAction('refresh', () => {
      if (this.layoutCompleted_) {
        return this.fetchList_();
      }
    }, ActionTrust.HIGH);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.container_ = this.win.document.createElement('div');
    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);

    if (!this.container_.hasAttribute('role')) {
      this.container_.setAttribute('role', 'list');
    }

    if (!this.element.hasAttribute('aria-live')) {
      this.element.setAttribute('aria-live', 'polite');
    }

    if (this.loadMoreEnabled_) {
      this.loadMoreOverflow_ = this.getOverflowElement();
      this.getLoadMoreLoadingElement_();
      if (!this.loadMoreLoadingElement_) {
        this.getLoadMoreLoadingOverlay_();
      }
      this.getLoadMoreFailedElement_();
    }
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
    const src = mutations['src'];
    const state = mutations['state'];

    if (src !== undefined) {
      const typeOfSrc = typeof src;
      if (typeOfSrc === 'string') {
        // Defer to fetch in layoutCallback() before first layout.
        if (this.layoutCompleted_) {
          this.fetchList_();
        }
      } else if (typeOfSrc === 'object') {
        const items = isArray(src) ? src : [src];
        this.scheduleRender_(items);
        // Remove the 'src' now that local data is used to render the list.
        this.element.setAttribute('src', '');
      } else {
        this.user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      const items = isArray(state) ? state : [state];
      this.scheduleRender_(items);
      user().error(TAG, '[state] is deprecated, please use [src] instead.');
    }
  }

  /**
   * amp-list reuses the loading indicator when the list is fetched again via bind mutation or refresh action
   * @override
   */
  isLoadingReused() {
    return true;
  }

  /**
   * Wraps `toggleFallback()` in a mutate context.
   * @param {boolean} state
   * @private
   */
  toggleFallbackInMutate_(state) {
    if (state) {
      this.getVsync().mutate(() => {
        this.toggleFallback(true);
        this.fallbackDisplayed_ = true;
      });
    } else {
      // Don't queue mutate if fallback isn't already visible.
      if (this.fallbackDisplayed_) {
        this.getVsync().mutate(() => {
          this.toggleFallback(false);
          this.fallbackDisplayed_ = false;
        });
      }
    }
  }

  /**
   * Request list data from `src` and return a promise that resolves when
   * the list has been populated with rendered list items.
   * @param {boolean=} opt_append
   * @return {!Promise}
   * @private
   */
  fetchList_(opt_append) {
    if (!this.element.getAttribute('src')) {
      return Promise.resolve();
    }
    if (this.element.hasAttribute('reset-on-refresh')) {
      this.togglePlaceholder(true);
      this.toggleLoading(true);
      this.toggleFallbackInMutate_(false);
      // Remove any previous items before the reload
      dom.removeChildren(dev().assertElement(this.container_));
    }

    return this.fetch_().then(result => {
      const itemsExpr = this.element.getAttribute('items') || 'items';
      let items = getValueForExpr(result, itemsExpr);
      if (this.element.hasAttribute('single-item')) {
        user().assert(typeof items !== 'undefined' ,
            'Response must contain an array or object at "%s". %s',
            itemsExpr, this.element);
        if (!isArray(items)) {
          items = [items];
        }
      } else if (this.loadMoreEnabled_) {
        const nextExpr = this.element.getAttribute(
            'load-more-bookmark') || 'load-more-src';
        this.loadMoreSrc_ = /** @type {string} */
            (getValueForExpr(result, nextExpr));
      }
      user().assert(isArray(items),
          'Response must contain an array at "%s". %s',
          itemsExpr, this.element);
      const maxLen = parseInt(this.element.getAttribute('max-items'), 10);
      if (maxLen < items.length) {
        items = items.slice(0, maxLen);
      }
      return this.scheduleRender_(/** @type {!Array} */ (items), opt_append);
    }, error => {
      throw user().createError('Error fetching amp-list', error);
    }).then(() => {
      if (this.getFallback()) {
        // Hide in case fallback was displayed for a previous fetch.
        this.toggleFallbackInMutate_(false);
      }
      this.togglePlaceholder(false);
      this.toggleLoading(false);
    }, error => {
      this.toggleLoading(false);
      if (this.getFallback()) {
        this.toggleFallbackInMutate_(true);
        this.togglePlaceholder(false);
      } else {
        throw error;
      }
    });
  }

  /**
   * Schedules a fetch result to be rendered in the near future.
   * @param {!Array} items
   * @param {boolean=} opt_append
   * @return {!Promise}
   * @private
   */
  scheduleRender_(items, opt_append) {
    let resolver;
    let rejecter;
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
    // If there's nothing currently being rendered, schedule a render pass.
    if (!this.renderItems_) {
      this.renderPass_.schedule();
    }

    if (this.renderItems_ && opt_append) {
      this.renderItems_.items.push(items);
      this.renderItems_.resolve = resolver;
      this.renderItems_.rejecter = rejecter;
    } else {
      this.renderItems_ = {items, opt_append, resolver, rejecter};
    }

    return promise;
  }

  /**
   * Renders the items stored in `this.renderItems_`. If its value changes
   * by the time render completes, schedules another render pass.
   * @private
   */
  doRenderPass_() {
    dev().assert(this.renderItems_, 'Nothing to render.');
    const current = this.renderItems_;
    const scheduleNextPass = () => {
      // If there's a new `renderItems_`, schedule it for render.
      if (this.renderItems_ !== current) {
        this.renderPass_.schedule(1); // Allow paint frame before next render.
      } else {
        this.renderItems_ = null;
      }
    };
    this.templates_.findAndRenderTemplateArray(this.element, current.items)
        .then(elements => this.updateBindings_(elements))
        .then(elements => this.rendered_(elements, current.opt_append))
        .then(() => this.loadMoreEnabled_ && this.setLoadMore_())
        .then(/* onFulfilled */ () => {
          scheduleNextPass();
          current.resolver();
        }, /* onRejected */ () => {
          scheduleNextPass();
          current.rejecter();
        });
  }

  /**
   * @param {!Array<!Element>} elements
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  updateBindings_(elements) {
    const forwardElements = () => elements;
    return Services.bindForDocOrNull(this.element).then(bind => {
      if (bind) {
        return bind.scanAndApply(elements, [this.container_]);
      }
    // Forward elements to chained promise on success or failure.
    }).then(forwardElements, forwardElements);
  }

  /**
   * @param {!Array<!Element>} elements
   * @private
   */
  rendered_(elements, append) {
    if (!append) {
      dom.removeChildren(dev().assertElement(this.container_));
    }
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
    return this.getVsync().measurePromise(() => {
      const scrollHeight = this.container_./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (scrollHeight > height) {
        return this.attemptChangeHeight(scrollHeight).catch(() => {});
      } else {
        Promise.resolve();
      }
    });
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
      this.getVsync().mutate(() => {
        this.loadMoreOverflow_.classList.toggle(
            'amp-visible', !!this.loadMoreSrc_);
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
      this.loadMoreLoadingElement_ = dom.childElementByAttr(
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
      this.getVsync().mutate(() => {
        if (state) {
          this.loadMoreOverflow_.classList.toggle('amp-visible', false);
        }
        this.loadMoreLoadingElement_.classList.toggle('amp-visible', state);
      });
    } else if (this.loadMoreOverflow_) {
      this.getVsync().mutate(() => {
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
    this.getVsync().mutate(() => {
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
      this.loadMoreFailedElement_ = dom.childElementByAttr(
          this.element, 'load-more-failed');
    }
    return this.loadMoreFailedElement_;
  }

  /**
   * @visibleForTesting
   * @private
   */
  fetch_() {
    const ampdoc = this.getAmpDoc();
    const src = this.element.getAttribute('src');

    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    let policy = UrlReplacementPolicy.OPT_IN;
    if (src == this.initialSrc_ ||
      (getSourceOrigin(src) == getSourceOrigin(ampdoc.win.location))) {
      policy = UrlReplacementPolicy.ALL;
    }
    return batchFetchJsonFor(ampdoc, this.element, '.', policy).then(f => {
      return new Promise(r => setTimeout(r, 2000)).then(() => f);
    });
  }

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
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpList);
});
