/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-accordion-0.1.css';
import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';

class AmpAccordion extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    /** @const @private {!NodeList} */
    this.sections_ = this.getRealChildren();

    this.element.setAttribute('role', 'tablist');
    const boundOnHeaderClick_ = this.onHeaderClick_.bind(this);
    this.sections_.forEach((section, index) => {
      user.assert(
          section.tagName.toLowerCase() == 'section',
          'Sections should be enclosed in a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const sectionComponents_ = section.children;
      user.assert(
          sectionComponents_.length == 2,
          'Each section must have exactly two children. ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const header = sectionComponents_[0];
      const content = sectionComponents_[1];
      header.classList.add('-amp-accordion-header');
      header.setAttribute('role', 'tab');
      content.classList.add('-amp-accordion-content');
      content.setAttribute('role', 'tabpanel');
      content.setAttribute(
          'aria-expanded', section.hasAttribute('expanded').toString());
      let contentId = content.getAttribute('id');
      if (!contentId) {
        contentId = this.element.id + '_AMP_content_' + index;
        content.setAttribute('id', contentId);
      }
      header.setAttribute('aria-controls', contentId);
      header.addEventListener('click', boundOnHeaderClick_);
    });
  }

  /**
   * Handles accordion headers clicks to expand/collapse its content.
   * @param {!MouseEvent} event Click event.
   * @private
   */
  onHeaderClick_(event) {
    event.preventDefault();
    const section = event.currentTarget.parentNode;
    const sectionComponents_ = section.children;
    const content = sectionComponents_[1];
    this.mutateElement(() => {
      if (section.hasAttribute('expanded')) {
        section.removeAttribute('expanded');
        content.setAttribute('aria-expanded', 'false');
      } else {
        section.setAttribute('expanded', '');
        content.setAttribute('aria-expanded', 'true');
      }
    }, content);
  }
}

AMP.registerElement('amp-accordion', AmpAccordion, CSS);
