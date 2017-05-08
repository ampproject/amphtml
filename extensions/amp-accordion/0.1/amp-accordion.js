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
import {Keycodes} from '../../../src/utils/keycodes';
import {Layout} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {removeFragment} from '../../../src/url';
import {map} from '../../../src/utils/object';

class AmpAccordion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!Node>} */
    this.headers_ = [];

    /** @private {?string} */
    this.sessionId_ = null;

    /** @private {?Object<string,boolean>} */
    this.currentState_ = null;

    /** @private {boolean} */
    this.sessionOptOut_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.sessionOptOut_ = this.element.hasAttribute('disable-session-states');

    this.element.setAttribute('role', 'tablist');

    // sessionStorage key: special created id for this element, this.sessionId_.
    // sessionStorage value: string that can convert to this.currentState_ obj.
    this.sessionId_ = this.getSessionStorageKey_();
    this.currentState_ = this.getSessionState_();

    const sections = this.getRealChildren();
    sections.forEach((section, index) => {
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
      this.mutateElement(() => {
        const content = sectionComponents_[1];
        content.classList.add('i-amphtml-accordion-content');
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

        const header = sectionComponents_[0];
        header.classList.add('i-amphtml-accordion-header');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-controls', contentId);
        header.setAttribute('aria-expanded',
            section.hasAttribute('expanded').toString());
        this.headers_.push(header);
      });
    });

    this.element.addEventListener('click', this.clickHandler_.bind(this));
    this.element.addEventListener('keydown', this.keyDownHandler_.bind(this));
  }

  /**
   * Generate a sessionStorage Key based on amp-accordion element id.
   * @return {?string}
   * @private
   */
  getSessionStorageKey_() {
    const id_ = this.element.id || this.element.getResourceId();
    const url = removeFragment(this.win.location.href);
    return `amp-${id_}-${url}`;
  }

  /**
   * Get previous state from sessionStorage.
   * @return {!Object}
   * @private
   */
  getSessionState_() {
    if (this.sessionOptOut_) {
      return map();
    }
    try {
      const sessionStr =
          this.win./*OK*/sessionStorage.getItem(
          dev().assertString(this.sessionId_));
      return sessionStr
          ? /** @type {!Object} */ (JSON.parse(dev().assertString(sessionStr)))
          : map();
    } catch (e) {
      dev().fine('AMP-ACCORDION', e.message, e.stack);
      return map();
    }
  }

  /**
   * Set current state to sessionStorage.
   * @private
   */
  setSessionState_() {
    if (this.sessionOptOut_) {
      return;
    }
    const sessionStr = JSON.stringify(this.currentState_);
    try {
      this.win./*OK*/sessionStorage.setItem(
          dev().assertString(this.sessionId_), sessionStr);
    } catch (e) {
      dev().fine('AMP-ACCORDION', e.message, e.stack);
    }
  }

  /**
   * Handles user action on an accordion header, agnostic of input method.
   * @param {!Element} header
   * @private
   */
  onHeaderPicked_(header) {
    const section = header.parentElement;
    const sectionComponents_ = section.children;
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
    }, section);
    this.currentState_[contentId] = !isSectionClosedAfterClick;
    this.setSessionState_();
  }

  /**
   * Handles accordion headers clicks to expand/collapse its content.
   * @param {!Event} event Click event.
   * @private
   */
  clickHandler_(event) {
    const target = event.target;
    // Need to support clicks on any children of the header.
    let header;
    for (let i = 0; i < this.headers_.length; i++) {
      const curr = this.headers_[i];
      if (curr.contains(event.target)) {
        header = curr;
        break;
      }
    }
    if (header) {
      header = dev().assertElement(header);
      event.preventDefault();
      this.onHeaderPicked_(header);
    }
  }

  /**
   * Handles accordion key presses ot expand/collapse its content.
   * @param {!Event} event keydown event.
   */
  keyDownHandler_(event) {
    const target = event.target;
    const keyCode = event.keyCode;
    if (keyCode == Keycodes.ENTER || keyCode == Keycodes.SPACE) {
      // TODO(kmh287): Should we also support activation of children of the
      // header?
      if (this.headers_.includes(target)) {
        event.preventDefault();
        const header = dev().assertElement(target);
        this.onHeaderPicked_(header);
      }
    }
  }
}

AMP.registerElement('amp-accordion', AmpAccordion, CSS);
