/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-mega-menu-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';

const TAG = 'amp-mega-menu';

export class AmpMegaMenu extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Array<!Element>} */
    this.items_ = null;

    /** @private {number} */
    this.itemCount_ = 0;

    /** @private {?Element} */
    this.expandedItem_ = null;

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private {number|string} */
    this.prefix_ = element.id ? element.id : Math.floor(Math.random() * 100);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-mega-menu'),
      'Turning on the amp-mega-menu experiment is necessary to use the amp-mega-menu component.'
    );

    this.registerMenuItems_();
    // items may not be present after build if dynamically rendered via amp-list,
    // in which case register them after DOM update instead.
    this.element.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.registerMenuItems_();
    });

    const mask = this.win.document.createElement('div');
    mask.classList.add('i-amphtml-mega-menu-mask');
    // append mask to header so that all children of header appear above the mask
    const maskParent =
      closestAncestorElementBySelector(this.element, 'header') || this.element;
    maskParent.appendChild(mask);
    this.maskElement_ = mask;

    this.documentElement_.addEventListener('click', () => this.collapse_());
    this.documentElement_.addEventListener('keydown', event => {
      // Collapse mega menu on ESC.
      if (event.key == Keys.ESCAPE) {
        if (this.collapse_()) {
          event.preventDefault();
        }
      }
    });
  }

  /**
   * Find all expandable menu items under this mega menu and add appropriate
   * classes, attributes and event listeners to its children.
   */
  registerMenuItems_() {
    this.items_ = toArray(scopedQuerySelectorAll(this.element, 'nav > * > li'));
    this.items_.forEach(item => {
      if (item.classList.contains('i-amphtml-mega-menu-item')) {
        return;
      }
      this.itemCount_++;
      item.classList.add('i-amphtml-mega-menu-item');

      const content = scopedQuerySelector(item, '> [role=group]');
      content.classList.add('i-amphtml-mega-menu-content');
      let contentId = content.getAttribute('id');
      if (!contentId) {
        // For accessibility, we need to make sure that each item has a unique ID.
        // If ID is absent, we use a random number to ensure uniqueness.
        contentId = this.prefix_ + '_AMP_content_' + this.itemCount_;
        content.setAttribute('id', contentId);
      }
      // prevent event listener on document from closing the menu
      content.addEventListener('click', e => e.stopPropagation());

      const heading =
        scopedQuerySelector(item, '> button') ||
        scopedQuerySelector(item, '> [role=button]');
      heading.classList.add('i-amphtml-mega-menu-heading');
      heading.setAttribute('aria-haspopup', 'dialog');
      heading.setAttribute('aria-controls', contentId);
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', 0);
      }
      heading.setAttribute('aria-expanded', 'false');
      heading.addEventListener('click', e => this.handleHeadingClick_(e));
      heading.addEventListener('keydown', e => this.handleHeadingKeyDown_(e));
    });
  }

  /**
   * Handler for item heading's on-click event to expand/collapse its content.
   * @param {!Event} event click event.
   */
  handleHeadingClick_(event) {
    event.preventDefault();
    event.stopPropagation();
    const item = dev().assertElement(event.target.parentElement);
    if (item == this.expandedItem_) {
      this.collapse_();
    } else {
      this.expand_(item);
    }
  }

  /**
   * Handler for key presses on an item heading to expand/collapse its content.
   * @param {!Event} event keydown event.
   */
  handleHeadingKeyDown_(event) {
    if (event.defaultPrevented) {
      return;
    }
    const {key} = event;
    switch (key) {
      case Keys.ENTER: /* fallthrough */
      case Keys.SPACE:
        if (event.target == event.currentTarget) {
          // Only activate if heading element was activated directly.
          // Do not respond to key presses on its children.
          this.handleHeadingClick_(event);
        }
        return;
    }
  }

  /**
   * Expand the given item to show its menu content.
   * @param {!Element} item
   */
  expand_(item) {
    if (this.expandedItem_) {
      this.expandedItem_.removeAttribute('open');
      this.getItemHeading_(this.expandedItem_).setAttribute(
        'aria-expanded',
        'false'
      );
    }
    item.setAttribute('open', '');
    this.maskElement_.setAttribute('open', '');
    this.element.setAttribute('aria-modal', 'true');
    this.getItemHeading_(item).setAttribute('aria-expanded', 'true');
    this.expandedItem_ = item;
  }

  /**
   * Collapse any expanded item inside the mega menu.
   * @return {boolean} whether any item was previously expanded.
   */
  collapse_() {
    if (!this.expandedItem_) {
      return false;
    }
    this.expandedItem_.removeAttribute('open');
    this.maskElement_.removeAttribute('open');
    this.element.setAttribute('aria-modal', 'false');
    this.getItemHeading_(this.expandedItem_).setAttribute(
      'aria-expanded',
      'false'
    );
    this.expandedItem_ = null;
    return true;
  }

  /**
   * Return the heading of given menu item.
   * @param {!Element} item
   * @return {!Element}
   */
  getItemHeading_(item) {
    const heading = scopedQuerySelector(item, '> .i-amphtml-mega-menu-heading');
    return dev().assertElement(heading);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMegaMenu, CSS);
});
