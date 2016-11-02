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
import {dev, user} from '../../../src/log';
import {removeFragment} from '../../../src/url';

class AmpAccordion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?NodeList} */
    this.sections_ = null;

    /** @private {?string} */
    this.id_ = null;

    /** @private {?Object} */
    this.currentState_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.sections_ = this.getRealChildren();

    this.id_ = this.getSessionStorageKey_();

    this.element.setAttribute('role', 'tablist');

    // sessionStorage key: special created id for this element, this.id_.
    // sessionStorage value: string that can convert to this.currentState_ obj.
    this.currentState_ = this.getSessionState_();
    if (!this.currentState_) {
      this.currentState_ = Object.create(null);
    }

    this.sections_.forEach((section, index) => {
      user().assert(
          section.tagName.toLowerCase() == 'section',
          'Sections should be enclosed in a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const sectionComponents_ = section.children;
      user().assert(
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
      let contentId = content.getAttribute('id');
      if (!contentId) {
        contentId = this.element.id + '_AMP_content_' + index;
        content.setAttribute('id', contentId);
      }
      if (this.currentState_[contentId]) {
        section.setAttribute('expanded', '');
      } else if (this.currentState_[contentId] == false) {
        section.removeAttribute('expanded');
      }
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded',
          section.hasAttribute('expanded').toString());
      header.addEventListener('click', this.onHeaderClick_.bind(this));
    });
  }

  /**
   * Generate a sessionStorage Key based on amp-accordion element id.
   * @return {string}
   * @private
   */
  getSessionStorageKey_() {
    const id_ = this.element.id;
    const url = removeFragment(this.win.location.href);
    return `amp-${id_}-${url}`;
  }

  /**
   * Get previous state from sessionStorage.
   * @return {!Object|null}
   * @private
   */
  getSessionState_() {
    try {
      const sessionStr =
          this.win./*OK*/sessionStorage.getItem(dev().assertString(this.id_));
      return /** @type {!Object} */ (
          JSON.parse(dev().assertString(sessionStr)));
    } catch (e) {
      dev().error('AMP-ACCORDION', e.message, e.stack);
      return null;
    }
  }

  /**
   * Set current state to sessionStorage.
   * @private
   */
  setSessionState_() {
    const sessionStr = JSON.stringify(this.currentState_);
    try {
      this.win./*OK*/sessionStorage.setItem(
          dev().assertString(this.id_), sessionStr);
    } catch (e) {
      dev().error('AMP-ACCORDION', e.message, e.stack);
    }
  }

  /**
   * Handles accordion headers clicks to expand/collapse its content.
   * @param {!Event} event Click event.
   * @private
   */
  onHeaderClick_(event) {
    event.preventDefault();
    /** @const {!Element} */
    const section = event.currentTarget.parentNode;
    const sectionComponents_ = section.children;
    const header = sectionComponents_[0];
    const content = sectionComponents_[1];
    const contentId = content.getAttribute('id');
    const isSectionClosedAfterClick = section.hasAttribute('expanded');
    this.mutateElement(() => {
      if (section.hasAttribute('expanded')) {
        section.removeAttribute('expanded');
        header.setAttribute('aria-expanded', 'false');
      } else {
        section.setAttribute('expanded', '');
        header.setAttribute('aria-expanded', 'true');
      }
    }, content);
    this.currentState_[contentId] = !isSectionClosedAfterClick;
    this.setSessionState_();
  }
}

AMP.registerElement('amp-accordion', AmpAccordion, CSS);
