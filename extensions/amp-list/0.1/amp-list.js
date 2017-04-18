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

import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {isLayoutSizeDefined} from '../../../src/layout';
import {templatesFor} from '../../../src/services';
import {user} from '../../../src/log';

/**
 * The implementation of `amp-list` component. See {@link ../amp-list.md} for
 * the spec.
 */
export class AmpList extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @const {!Element} */
    this.container_ = this.win.document.createElement('div');
    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);
    if (!this.container_.hasAttribute('role')) {
      this.container_.setAttribute('role', 'list');
    }
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  layoutCallback() {
    const itemsExpr = this.element.getAttribute('items') || 'items';
    return fetchBatchedJsonFor(
        this.getAmpDoc(), this.element, itemsExpr).then(items => {
          user().assert(items && Array.isArray(items),
              'Response must contain an array at "%s". %s',
              itemsExpr, this.element);
          return templatesFor(this.win).findAndRenderTemplateArray(
              this.element, items).then(this.rendered_.bind(this));
        }, error => {
          throw user().createError('Error fetching amp-list', error);
        });
  }

  /**
   * @param {!Array<!Element>} elements
   * @private
   */
  rendered_(elements) {
    elements.forEach(element => {
      if (!element.hasAttribute('role')) {
        element.setAttribute('role', 'listitem');
      }
      this.container_.appendChild(element);
    });

    // Change height if needed.
    this.getVsync().measure(() => {
      const scrollHeight = this.container_./*OK*/scrollHeight;
      const height = this.element./*OK*/offsetHeight;
      if (scrollHeight > height) {
        this.attemptChangeHeight(scrollHeight).catch(() => {});
      }
    });
  }
}

AMP.registerElement('amp-list', AmpList);
