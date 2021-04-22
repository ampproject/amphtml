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

import {CSS} from '../../../build/amp-nested-menu-0.1.css';
import {Keys} from '../../../src/core/constants/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  closest,
  closestAncestorElementBySelector,
  isRTL,
  scopedQuerySelector,
  tryFocus,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {toArray} from '../../../src/core/types/array';

const TAG = 'amp-nested-menu';

/** @private @enum {string} */
const Side = {
  LEFT: 'left',
  RIGHT: 'right',
};

/** @private @const {number} */
const ANIMATION_TIMEOUT = 350;

export class AmpNestedMenu extends AMP.BaseElement {
  /** @override @nocollapse */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?string} */
    this.side_ = null;

    /** @private {!Element} */
    this.currentSubmenu_ = element;

    /** @private {function(!Event)} */
    this.clickHandler_ = this.handleClick_.bind(this);

    /** @private {function(!Event)} */
    this.keydownHandler_ = this.handleKeyDown_.bind(this);
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.action_ = Services.actionServiceForDoc(this.element);

    this.side_ = element.getAttribute('side');
    if (this.side_ != Side.LEFT && this.side_ != Side.RIGHT) {
      // Submenus in RTL documents should open from the left by default.
      this.side_ = isRTL(this.document_) ? Side.LEFT : Side.RIGHT;
      element.setAttribute('side', this.side_);
    }

    this.registerAction('reset', this.reset.bind(this));
    element.addEventListener('click', this.clickHandler_);
    element.addEventListener('keydown', this.keydownHandler_);
  }

  /** @override */
  layoutCallback() {
    this.registerSubmenuElements_();
    return Promise.resolve();
  }

  /** Give submenu open/close buttons appropriate roles and
   * add them to tab order for accessibility.
   * @private
   */
  registerSubmenuElements_() {
    const submenuBtns = toArray(
      this.element.querySelectorAll(
        '[amp-nested-submenu-open],[amp-nested-submenu-close]'
      )
    );
    submenuBtns.forEach((submenuBtn) => {
      if (!submenuBtn.hasAttribute('tabindex')) {
        submenuBtn.setAttribute('tabindex', 0);
      }
      submenuBtn.setAttribute('role', 'button');
      // Adds aria-expanded to the submenu open button if present
      if (submenuBtn.hasAttribute('amp-nested-submenu-open')) {
        submenuBtn.setAttribute('aria-expanded', 'false');
      }
      userAssert(
        this.action_.hasAction(submenuBtn, 'tap') == false,
        'submenu open/close buttons should not have tap actions registered.'
      );
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    // If support is added for other layouts, we should ensure that
    // lazy loading by sidebar does not cause FOUC when sidebar first opens.
    return layout == Layout.FILL;
  }

  /**
   * Handler for click event on any element inside the component.
   * @param {!Event} e
   * @private
   */
  handleClick_(e) {
    const target = dev().assertElement(e.target);
    const submenuBtn = closestAncestorElementBySelector(
      dev().assertElement(e.target),
      '[amp-nested-submenu-open],[amp-nested-submenu-close]'
    );
    if (submenuBtn && this.shouldHandleClick_(target, submenuBtn)) {
      const isOpenBtn = submenuBtn.hasAttribute('amp-nested-submenu-open');
      if (isOpenBtn) {
        this.handleSubmenuOpenClick_(submenuBtn);
      } else {
        this.handleSubmenuCloseClick_(submenuBtn);
      }
    }
  }

  /**
   * We should support clicks on any children of submenu open/close except for
   * links or elements with tap targets, which should not have their default
   * behavior overidden.
   * @param {!Element} target
   * @param {!Element} submenuBtn
   * @return {boolean}
   * @private
   */
  shouldHandleClick_(target, submenuBtn) {
    const hasAnchor = !!closest(target, (e) => e.tagName == 'A', submenuBtn);
    const hasTapAction = this.action_.hasAction(target, 'tap', submenuBtn);
    return !hasAnchor && !hasTapAction;
  }

  /**
   * Handles click on the given element to open a submenu.
   * @param {!Element} openElement
   * @private
   */
  handleSubmenuOpenClick_(openElement) {
    const submenuParent = dev().assertElement(openElement.parentElement);
    const submenu = scopedQuerySelector(submenuParent, '>[amp-nested-submenu]');
    userAssert(
      submenu,
      `${TAG} requires each submenu open button to have a submenu as its sibling`
    );
    this.open_(submenu);
  }

  /**
   * Open the specified submenu.
   * @param {!Element} submenu
   * @private
   */
  open_(submenu) {
    if (submenu.hasAttribute('open')) {
      return;
    }
    const parentMenu = this.getParentMenu_(submenu);
    if (parentMenu) {
      parentMenu.setAttribute('child-open', '');
      submenu.setAttribute('open', '');
      this.currentSubmenu_ = submenu;
      // move focus to close element after submenu fully opens.
      // TODO(wassgha): Use Animation.animate instead to get a promise back
      Services.timerFor(this.win).delay(() => {
        const submenuParent = dev().assertElement(submenu.parentElement);
        const submenuOpen = dev().assertElement(
          scopedQuerySelector(submenuParent, '>[amp-nested-submenu-open]')
        );
        submenuOpen.setAttribute('aria-expanded', 'true');
        // Find the first close button that is not in one of the child menus.
        const submenuCloseCandidates = toArray(
          submenu.querySelectorAll('[amp-nested-submenu-close]')
        );
        const submenuClose = submenuCloseCandidates.filter(
          (candidate) => this.getParentMenu_(candidate) == submenu
        )[0];
        userAssert(
          submenuClose,
          `${TAG} requires each submenu to contain at least one submenu close button`
        );
        tryFocus(submenuClose);
      }, ANIMATION_TIMEOUT);
    }
  }

  /**
   * Handles click on the given element to close the submenu.
   * @param {!Element} closeElement
   * @private
   */
  handleSubmenuCloseClick_(closeElement) {
    const submenu = closestAncestorElementBySelector(
      closeElement,
      '[amp-nested-submenu]'
    );
    userAssert(
      submenu,
      `${TAG}: submenu close buttons are only allowed inside submenus`
    );
    this.close_(submenu);
  }

  /**
   * Close the specified submenu.
   * @param {!Element} submenu
   * @private
   */
  close_(submenu) {
    if (!submenu.hasAttribute('open')) {
      return;
    }
    const parentMenu = this.getParentMenu_(submenu);
    if (parentMenu) {
      parentMenu.removeAttribute('child-open');
      submenu.removeAttribute('open');
      this.currentSubmenu_ = parentMenu;
      // move focus back to open element after submenu fully closes.
      // TODO(wassgha): Use Animation.animate instead to get a promise back
      Services.timerFor(this.win).delay(() => {
        const submenuParent = dev().assertElement(submenu.parentElement);
        const submenuOpen = dev().assertElement(
          scopedQuerySelector(submenuParent, '>[amp-nested-submenu-open]')
        );
        submenuOpen.setAttribute('aria-expanded', 'false');
        tryFocus(submenuOpen);
      }, ANIMATION_TIMEOUT);
    }
  }

  /**
   * Close all submenus and return to the root menu.
   */
  reset() {
    while (this.element.hasAttribute('child-open')) {
      this.close_(this.currentSubmenu_);
    }
  }

  /**
   * Handler for keydown event when the component or its children has focus.
   * @param {!Event} e
   * @private
   */
  handleKeyDown_(e) {
    if (e.defaultPrevented) {
      return;
    }
    switch (e.key) {
      case Keys.ENTER: /* fallthrough */
      case Keys.SPACE:
        this.handleClick_(e);
        return;
      case Keys.LEFT_ARROW: /* fallthrough */
      case Keys.RIGHT_ARROW:
        this.handleMenuNavigation_(e);
        break;
      case Keys.UP_ARROW: /* fallthrough */
      case Keys.DOWN_ARROW:
      case Keys.HOME:
      case Keys.END:
        this.handleMenuItemNavigation_(e);
        break;
    }
  }

  /**
   * Handle left/right arrow key down event to navigate between menus.
   * @param {!Event} e
   * @private
   */
  handleMenuNavigation_(e) {
    let back = e.key == Keys.LEFT_ARROW;
    // Press right arrow key to go back if submenu opened from left.
    if (this.side_ == Side.LEFT) {
      back = !back;
    }
    if (back) {
      this.close_(this.currentSubmenu_);
    } else {
      const target = dev().assertElement(e.target);
      if (target.hasAttribute('amp-nested-submenu-open')) {
        this.handleSubmenuOpenClick_(target);
      }
    }
  }

  /**
   * Handle up/down/home/end key down event to navigate between items;
   * this requires each menu item to be under a li element and focusable.
   * @param {!Event} e
   * @private
   */
  handleMenuItemNavigation_(e) {
    const target = dev().assertElement(e.target);
    const parentMenu = this.getParentMenu_(target);
    const item = closest(target, (e) => e.tagName == 'LI', parentMenu);
    // active element is not in a li that is inside the current submenu.
    if (!item) {
      return;
    }

    let nextItem;
    if (e.key === Keys.UP_ARROW) {
      nextItem = item.previousElementSibling;
    } else if (e.key === Keys.DOWN_ARROW) {
      nextItem = item.nextElementSibling;
    } else if (e.key === Keys.HOME) {
      nextItem = item.parentElement.firstElementChild;
    } else if (e.key === Keys.END) {
      nextItem = item.parentElement.lastElementChild;
    } else {
      // not a recognized key
      return;
    }

    // have reached the beginning or end of the list.
    if (!nextItem) {
      return;
    }

    const focusElement = nextItem.querySelector('button,a[href],[tabindex]');
    if (focusElement) {
      e.preventDefault();
      tryFocus(focusElement);
    }
  }

  /**
   * Get the menu containing the given element, if one exists.
   * @param {!Element} element
   * @return {?Element}
   * @private
   */
  getParentMenu_(element) {
    return closestAncestorElementBySelector(
      dev().assertElement(element.parentElement),
      'amp-nested-menu,[amp-nested-submenu]'
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpNestedMenu, CSS);
});
