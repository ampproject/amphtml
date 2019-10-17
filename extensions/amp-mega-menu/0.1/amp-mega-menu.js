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
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  isRTL,
  scopedQuerySelector,
  scopedQuerySelectorAll,
  tryFocus,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {setModalAsClosed, setModalAsOpen} from '../../../src/modal';
import {toArray} from '../../../src/types';

/** @const {string} */
const TAG = 'amp-mega-menu';

/** @const {string} */
const ARIA_LABEL_CLOSE = 'Close the menu';

/**
 * A mega menu component suitable for displaying large collections of links on
 * desktop/tablets. An amp-list can be nested inside this component to enable
 * template rendering via dynamically fetched data.
 */
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

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number|string} */
    this.prefix_ = element.id || Math.floor(Math.random() * 100);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    // TODO(#24898): remove this assert when cleaning up experiment post launch.
    userAssert(
      isExperimentOn(this.win, 'amp-mega-menu'),
      'Turning on the amp-mega-menu experiment is necessary to use the amp-mega-menu component.'
    );

    this.action_ = Services.actionServiceForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    this.registerMenuItems_();
    // items may not be present after build if dynamically rendered via amp-list,
    // in which case register them after DOM update instead.
    this.element.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.registerMenuItems_();
    });

    const mask = this.document_.createElement('div');
    mask.classList.add('i-amphtml-mega-menu-mask');
    mask.setAttribute('aria-hidden', 'true');
    // append mask to header so that all children of header appear above the mask
    const maskParent =
      closestAncestorElementBySelector(this.element, 'header') || this.element;
    maskParent.classList.add('i-amphtml-mega-menu-mask-parent');
    maskParent.appendChild(mask);
    this.maskElement_ = mask;

    this.documentElement_.addEventListener('click', () => this.collapse_());
    this.documentElement_.addEventListener('keydown', event => {
      // Collapse mega menu on ESC.
      if (event.key === Keys.ESCAPE && this.collapse_()) {
        event.preventDefault();
      }
    });

    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    // TODO(#25047): unregister event listeners.
    // Ensure that menu is closed when hidden via media query.
    this.collapse_();
    return false;
  }

  /**
   * Find all expandable menu items under this mega menu and add appropriate
   * classes, attributes and event listeners to its children.
   * @private
   */
  registerMenuItems_() {
    this.items_ = toArray(scopedQuerySelectorAll(this.element, 'nav > * > li'));
    this.items_.forEach(item => {
      // skip if the item has already been registered.
      if (item.classList.contains('i-amphtml-mega-menu-item')) {
        return;
      }
      const heading =
        scopedQuerySelector(item, '> button') ||
        scopedQuerySelector(item, '> [role=button]');
      const content = scopedQuerySelector(item, '> [role=dialog]');
      // do not register item if either its heading or content element is missing,
      // or if heading has on tap action.
      if (
        !heading ||
        !content ||
        this.action_.hasAction(heading, 'tap', item)
      ) {
        return;
      }
      this.registerMenuItem_(item, heading, content);
    });
  }

  /**
   * Register the given menu item, along with its heading and content elements.
   * @param {!Element} item
   * @param {!Element} heading
   * @param {!Element} content
   * @private
   */
  registerMenuItem_(item, heading, content) {
    item.classList.add('i-amphtml-mega-menu-item');
    this.itemCount_++;

    content.classList.add('i-amphtml-mega-menu-content');
    content.setAttribute('aria-modal', 'false');
    let contentId = content.getAttribute('id');
    if (!contentId) {
      // For accessibility, we need to make sure that each item has a unique ID.
      // If ID is absent, we use a random number to ensure uniqueness.
      contentId = this.prefix_ + '_AMP_content_' + this.itemCount_;
      content.setAttribute('id', contentId);
    }
    // add invisible close buttons at the start and end of each content element.
    content.insertBefore(
      this.createScreenReaderCloseButton_(),
      content.firstChild
    );
    content.appendChild(this.createScreenReaderCloseButton_());
    // prevent click event listener on document from closing the menu
    content.addEventListener('click', e => e.stopPropagation());

    heading.classList.add('i-amphtml-mega-menu-heading');
    // haspopup value not set to menu since content can contain more than links.
    heading.setAttribute('aria-haspopup', 'dialog');
    heading.setAttribute('aria-controls', contentId);
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', 0);
    }
    heading.setAttribute('aria-expanded', 'false');
    heading.addEventListener('click', e => this.handleHeadingClick_(e));
    // prevent focus on mousedown so that there's no sudden shift in focus
    // when the content container opens.
    heading.addEventListener('mousedown', e => e.preventDefault());
    heading.addEventListener('keydown', e => this.handleHeadingKeyDown_(e));
  }

  /**
   * Handler for item heading's on-click event to expand/collapse its content.
   * @param {!Event} event click event.
   * @private
   */
  handleHeadingClick_(event) {
    event.preventDefault();
    event.stopPropagation();
    const item = dev().assertElement(event.target.parentElement);
    const previousItem = this.collapse_();
    if (item != previousItem) {
      this.expand_(item);
    }
  }

  /**
   * Handler for key presses on an item heading.
   * @param {!Event} event keydown event.
   * @private
   */
  handleHeadingKeyDown_(event) {
    if (event.defaultPrevented) {
      return;
    }
    const {key} = event;
    switch (key) {
      case Keys.LEFT_ARROW: /* fallthrough */
      case Keys.RIGHT_ARROW:
        this.handleNavigationKeyDown_(event);
        return;
      case Keys.ENTER: /* fallthrough */
      case Keys.SPACE:
        if (event.target == event.currentTarget) {
          this.handleHeadingClick_(event);
        }
        return;
    }
  }

  /**
   * Handler for arrow key presses to navigate between menu items.
   * @param {!Event} event keydown event.
   * @private
   */
  handleNavigationKeyDown_(event) {
    const item = dev().assertElement(event.target.parentElement);
    const index = this.items_.indexOf(item);
    if (index !== -1) {
      event.preventDefault();
      let dir = event.key == Keys.LEFT_ARROW ? -1 : 1;
      // Left is 'previous' in LTR and 'next' in RTL; vice versa for Right.
      if (isRTL(this.document_)) {
        dir = -dir;
      }
      // If user navigates one past the beginning or end, wrap around.
      const newIndex = mod(index + dir, this.items_.length);
      tryFocus(this.getItemHeading_(this.items_[newIndex]));
    }
  }

  /**
   * Expand the given item to show its menu content.
   * @param {!Element} item
   * @private
   */
  expand_(item) {
    this.mutateElement(() => {
      // Wait for mutateElement, so that the element has been transfered to the
      // fixed layer. This is needed to hide the correct elements.
      const content = this.getItemContent_(item);
      setModalAsOpen(content);
      content.setAttribute('aria-modal', 'true');
    });
    item.setAttribute('open', '');
    this.element.setAttribute('open', '');
    this.maskElement_.setAttribute('open', '');
    const heading = this.getItemHeading_(item);
    heading.setAttribute('aria-expanded', 'true');
    const screenReaderCloseButton = dev().assertElement(
      item.querySelector('.i-amphtml-screen-reader')
    );
    tryFocus(screenReaderCloseButton);
    this.expandedItem_ = item;
  }

  /**
   * Collapse any expanded item inside the mega menu.
   * @return {?Element} the item that was previously expanded, if any.
   * @private
   */
  collapse_() {
    if (!this.expandedItem_) {
      return null;
    }
    const item = dev().assertElement(this.expandedItem_);
    this.mutateElement(() => {
      const content = this.getItemContent_(item);
      setModalAsClosed(content);
      content.setAttribute('aria-modal', 'false');
    });
    item.removeAttribute('open');
    this.element.removeAttribute('open');
    this.maskElement_.removeAttribute('open');
    const heading = this.getItemHeading_(item);
    heading.setAttribute('aria-expanded', 'false');
    tryFocus(heading);
    this.expandedItem_ = null;
    return item;
  }

  /**
   * Return the heading of given menu item.
   * @param {!Element} item
   * @return {!Element}
   * @private
   */
  getItemHeading_(item) {
    const heading = scopedQuerySelector(item, '> .i-amphtml-mega-menu-heading');
    return dev().assertElement(heading);
  }

  /**
   * Return the expandable content of given menu item.
   * @param {!Element} item
   * @return {!Element}
   * @private
   */
  getItemContent_(item) {
    const content = scopedQuerySelector(item, '> .i-amphtml-mega-menu-content');
    return dev().assertElement(content);
  }

  /**
   * Creates an "invisible" close button for screen readers to collapse the
   * mega menu.
   * @return {!Element}
   * @private
   */
  createScreenReaderCloseButton_() {
    const ariaLabel =
      this.element.getAttribute('data-close-button-aria-label') ||
      ARIA_LABEL_CLOSE;

    // Invisible close button at the end of menu content for screen-readers.
    const screenReaderCloseButton = this.document_.createElement('button');

    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');
    screenReaderCloseButton.addEventListener('click', () => this.collapse_());

    return screenReaderCloseButton;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMegaMenu, CSS);
});
