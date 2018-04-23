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

import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {parseJson} from '../../../src/json';
import {removeFragment} from '../../../src/url';
import {tryFocus} from '../../../src/dom';

const TAG = 'amp-accordion';


class AmpAccordion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!Node>} */
    this.headers_ = [];

    /** @private {?string} */
    this.sessionId_ = null;

    /** @private {?JsonObject} */
    this.currentState_ = null;

    /** @private {boolean} */
    this.sessionOptOut_ = false;

    /** @private {Element} */
    this.sections_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);
    this.sessionOptOut_ = this.element.hasAttribute('disable-session-states');

    // sessionStorage key: special created id for this element, this.sessionId_.
    // sessionStorage value: string that can convert to this.currentState_ obj.
    this.sessionId_ = this.getSessionStorageKey_();
    this.currentState_ = this.getSessionState_();

    this.sections_ = this.getRealChildren();
    this.sections_.forEach((section, index) => {
      user().assert(
          section.tagName.toLowerCase() == 'section',
          'Sections should be enclosed in a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const sectionComponents = section.children;
      user().assert(
          sectionComponents.length == 2,
          'Each section must have exactly two children. ' +
          'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s', this.element);
      const content = sectionComponents[1];
      content.classList.add('i-amphtml-accordion-content');
      let contentId = content.getAttribute('id');
      if (!contentId) {
        contentId = this.element.id + '_AMP_content_' + index;
        content.setAttribute('id', contentId);
      }

      this.registerAction('toggle', invocation => {
        if (invocation.args) {
          const sectionId = invocation.args['section'];
          const sectionEl = this.getAmpDoc().getElementById(sectionId);
          user().assertElement(
              sectionEl,
              'No element found with id:' + sectionId);
          this.toggle_(sectionEl);
        } else {
          for (let i = 0; i < this.sections_.length; i++) {
            this.toggle_(this.sections_[i]);
          }
        }
      });
      this.registerAction('expand', invocation => {
        if (invocation.args) {
          const sectionId = invocation.args['section'];
          const sectionEl = this.getAmpDoc().getElementById(sectionId);
          user().assertElement(
              sectionEl,
              'No element found with id:' + sectionId);
          this.expand_(sectionEl);
        } else {
          for (let i = 0; i < this.sections_.length; i++) {
            this.expand_(this.sections_[i]);
          }
        }
      });
      this.registerAction('collapse', invocation => {
        if (invocation.args) {
          const sectionId = invocation.args['section'];
          const sectionEl = this.getAmpDoc().getElementById(sectionId);
          user().assertElement(
              sectionEl,
              'No element found with id:' + sectionId);
          this.collapse_(sectionEl);
        } else {
          for (let i = 0; i < this.sections_.length; i++) {
            this.collapse_(this.sections_[i]);
          }
        }
      });

      if (this.currentState_[contentId]) {
        section.setAttribute('expanded', '');
      } else if (this.currentState_[contentId] === false) {
        section.removeAttribute('expanded');
      }
      this.mutateElement(() => {
        // Just mark this element as dirty since we changed the state
        // based on runtime state. This triggers checking again
        // whether children need layout.
        // See https://github.com/ampproject/amphtml/issues/3586
        // for details.
      });

      const header = sectionComponents[0];
      header.classList.add('i-amphtml-accordion-header');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded',
          section.hasAttribute('expanded').toString());
      if (!header.hasAttribute('tabindex')) {
        header.setAttribute('tabindex', 0);
      }
      this.headers_.push(header);
      header.addEventListener('click', this.clickHandler_.bind(this));
      header.addEventListener('keydown', this.keyDownHandler_.bind(this));
    });
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
   * @return {!JsonObject}
   * @private
   */
  getSessionState_() {
    if (this.sessionOptOut_) {
      return dict();
    }
    try {
      const sessionStr =
          this.win./*OK*/sessionStorage.getItem(
              dev().assertString(this.sessionId_));
      return sessionStr
        ? /** @type {!JsonObject} */ (
          dev().assert(parseJson(dev().assertString(sessionStr))))
        : dict();
    } catch (e) {
      dev().fine('AMP-ACCORDION', e.message, e.stack);
      return dict();
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
   * Toggles section between expanded or collapsed.
   * @private
   */
  toggle_(section, opt_forceExpand = undefined) {
    const sectionComponents = section.children;
    const header = sectionComponents[0];
    const content = sectionComponents[1];
    const contentId = content.getAttribute('id');
    const isSectionClosedAfterClick = section.hasAttribute('expanded');
    this.mutateElement(() => {
      let toExpand;
      if (opt_forceExpand === true) {
        toExpand = true;
      } else if (opt_forceExpand === false) {
        toExpand = false;
      } else {
        toExpand = !section.hasAttribute('expanded');
      }

      if (toExpand) {
        section.setAttribute('expanded', '');
        header.setAttribute('aria-expanded', 'true');
        // if expand-single-section is set, only allow one <section> to be expanded at a time
        if (this.element.hasAttribute('expand-single-section')) {
          this.sections_.forEach(sectionIter => {
            if (sectionIter != section) {
              sectionIter.removeAttribute('expanded');
              sectionIter.children[0].setAttribute('aria-expanded', 'false');
            }
          });
        }
      } else {
        section.removeAttribute('expanded');
        header.setAttribute('aria-expanded', 'false');
      }
    }, section);
    this.currentState_[contentId] = !isSectionClosedAfterClick;
    this.setSessionState_();
  }

  /**
   * Force expands the accordion.
   * @private
   */
  expand_(section) {
    this.toggle_(section, true);
  }

  /**
   * Force collapses the accordion.
   * @private
   */
  collapse_(section) {
    this.toggle_(section, false);
  }

  /**
   * Handles accordion header activation, through clicks or enter/space presses.
   * @param {!Event} event 'click' or 'keydown' event.
   * @private
   */
  onHeaderPicked_(event) {
    event.preventDefault();
    const header = dev().assertElement(event.currentTarget);
    const section = header.parentElement;
    this.toggle_(section);
  }

  /**
   * Handles clicks on an accordion header to expand/collapse its content.
   */
  clickHandler_(event) {
    if (this.shouldHandleClick_(event)) {
      this.onHeaderPicked_(event);
    }
  }

  /**
   * We should support clicks on any children of the header except for on
   * links or elements with tap targets, which should not have their default
   * behavior overidden.
   * @param {!Event} event
   * @returns {boolean}
   * @private
   */
  shouldHandleClick_(event) {
    const target = dev().assertElement(event.target);
    const header = dev().assertElement(event.currentTarget);
    const hasAnchor = !!closest(target, e => (e.tagName == 'A'), header);
    const hasTapAction = this.action_.hasAction(target,'tap', header);
    return !hasAnchor && !hasTapAction;
  }

  /**
   * Handles key presses on an accordion header to expand/collapse its content
   * or move focus to previous/next header.
   * @param {!Event} event keydown event.
   */
  keyDownHandler_(event) {
    if (event.defaultPrevented) {
      return;
    }
    const keyCode = event.keyCode;
    switch (keyCode) {
      case KeyCodes.UP_ARROW: /* fallthrough */
      case KeyCodes.DOWN_ARROW:
        this.navigationKeyDownHandler_(event);
        return;
      case KeyCodes.ENTER: /* fallthrough */
      case KeyCodes.SPACE:
        if (event.target == event.currentTarget) {
          // Only activate if header element was activated directly.
          // Do not respond to key presses on its children.
          this.onHeaderPicked_(event);
        }
        return;
    }
  }

  /**
   * Handles keyboard navigation events. Only respond to keyboard navigation
   * if a section header already has focus.
   * @param {!Event} event
   * @private
   */
  navigationKeyDownHandler_(event) {
    const header = dev().assertElement(event.currentTarget);
    const index = this.headers_.indexOf(header);
    if (index !== -1) {
      event.preventDefault();
      // Up and down are the same regardless of locale direction.
      const diff = event.keyCode == KeyCodes.UP_ARROW ? -1 : 1;
      // If user navigates one past the beginning or end, wrap around.
      let newFocusIndex = (index + diff) % this.headers_.length;
      if (newFocusIndex < 0) {
        newFocusIndex = newFocusIndex + this.headers_.length;
      }
      const newFocusHeader = this.headers_[newFocusIndex];
      tryFocus(newFocusHeader);
    }
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAccordion);
});
