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

import {urlReplacementsForDoc} from '../../../src/url-replacements';
import {assertHttpsUrl} from '../../../src/url';
import {isLayoutSizeDefined} from '../../../src/layout';
import {templatesFor} from '../../../src/template';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';


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

    /** @private @const {!UrlReplacements} */
    this.urlReplacements_ = urlReplacementsForDoc(this.getAmpDoc());
  }

  /** @override */
  layoutCallback() {
    return this.urlReplacements_.expandAsync(assertHttpsUrl(
        this.element.getAttribute('src'), this.element)).then(src => {
          const opts = {};
          if (this.element.hasAttribute('credentials')) {
            opts.credentials = this.element.getAttribute('credentials');
          }
          if (opts.credentials) {
            opts.requireAmpResponseSourceOrigin = true;
          }
          return xhrFor(this.win).fetchJson(src, opts);
        }).then(data => {
          user().assert(data != null
              && typeof data == 'object'
              && Array.isArray(data['items']),
              'Response must be {items: []} object %s %s',
              this.element, data);
          const items = data['items'];
          return templatesFor(this.win).findAndRenderTemplateArray(
              this.element, items).then(this.rendered_.bind(this));
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
