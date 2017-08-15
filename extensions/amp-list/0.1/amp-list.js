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

import {AmpEvents} from '../../../src/amp-events';
import {createCustomEvent} from '../../../src/event-helper';
import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {isArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeChildren} from '../../../src/dom';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';

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

    /** @const {!function(!Array<!Element>)} */
    this.boundRendered_ = this.rendered_.bind(this);

    /** @const {!function(!Array<!Element>):!Promise<!Array<!Element>>} */
    this.boundScanForBindings_ = this.scanForBindings_.bind(this);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {boolean} */
    this.fallbackDisplayed_ = false;

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);
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
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  layoutCallback() {
    const fetch = this.fetchList_();
    if (this.getFallback()) {
      fetch.then(() => {
        // Hide in case fallback was displayed for a previous fetch.
        this.toggleFallbackInMutate_(false);
      }, unusedError => {
        // On fetch success, firstLayoutCompleted() hides placeholder.
        // On fetch error, hide placeholder if fallback exists.
        this.togglePlaceholder(false);
        this.toggleFallbackInMutate_(true);
      });
    }
    return fetch;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    const state = mutations['state'];

    if (src !== undefined) {
      const typeOfSrc = typeof src;
      if (typeOfSrc === 'string') {
        this.fetchList_();
      } else if (typeOfSrc === 'object') {
        const items = isArray(src) ? src : [src];
        this.renderItems_(items);
      } else {
        user().error(TAG, 'Unexpected "src" type: ' + src);
      }
    } else if (state !== undefined) {
      const items = isArray(state) ? state : [state];
      this.renderItems_(items);
      user().warn(TAG, '[state] is deprecated, please use [src] instead.');
    }
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
   * @return {!Promise}
   * @private
   */
  fetchList_() {
    const itemsExpr = this.element.getAttribute('items') || 'items';
    return this.fetch_(itemsExpr).then(items => {
      user().assert(isArray(items),
          'Response must contain an array at "%s". %s',
          itemsExpr, this.element);
      return this.renderItems_(items);
    }, error => {
      throw user().createError('Error fetching amp-list', error);
    });
  }

  /**
   * @param {!Array} items
   * @return {!Promise}
   * @private
   */
  renderItems_(items) {
    return this.templates_.findAndRenderTemplateArray(this.element, items)
        .then(this.boundScanForBindings_)
        .then(this.boundRendered_);
  }

  /**
   * @param {!Array<!Element>} elements
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  scanForBindings_(elements) {
    const forwardElements = () => elements;
    return Services.bindForDocOrNull(this.element).then(bind => {
      if (bind) {
        return bind.rescanAndEvaluate(elements);
      }
    // Forward elements to chained promise on success or failure.
    }).then(forwardElements, forwardElements);
  }

  /**
   * @param {!Array<!Element>} elements
   * @private
   */
  rendered_(elements) {
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
    this.getVsync().measure(() => {
      const scrollHeight = this.container_./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (scrollHeight > height) {
        this.attemptChangeHeight(scrollHeight).catch(() => {});
      }
    });
  }

  /**
   * @param {string} itemsExpr
   * @visibleForTesting
   * @private
   */
  fetch_(itemsExpr) {
    return fetchBatchedJsonFor(this.getAmpDoc(), this.element, itemsExpr);
  }
}

AMP.registerElement('amp-list', AmpList);
