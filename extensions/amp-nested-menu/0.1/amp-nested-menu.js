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
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
  tryFocus,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';

const TAG = 'amp-nested-menu';

/** @private @const {number} */
const ANIMATION_TIMEOUT = 350;

export class AmpNestedMenu extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?Element} */
    this.currentSubmenu_ = null;

    /** @private {?Array<!Element>} */
    this.submenuElements_ = null;

    /** @private {?Array<!Element>} */
    this.submenuOpenElements_ = null;

    /** @private {?Array<!Element>} */
    this.submenuCloseElements_ = null;

    /** @private {function(!Event)} */
    this.submenuOpenHandler_ = this.handleSubmenuOpenClick_.bind(this);

    /** @private {function(!Event)} */
    this.submenuCloseHandler_ = this.handleSubmenuCloseClick_.bind(this);

    /** @private {function(!Event)} */
    this.keydownHandler_ = this.handleKeyDown_.bind(this);
  }

  /** @override */
  buildCallback() {
    // TODO(#25022): remove this assert when cleaning up experiment post launch.
    userAssert(
      isExperimentOn(this.win, 'amp-sidebar-v2'),
      `Turning on the amp-sidebar-v2 experiment is necessary to use the ${TAG} component.`
    );

    this.action_ = Services.actionServiceForDoc(this.element);

    this.submenuElements_ = toArray(
      this.element.querySelectorAll('[amp-nested-submenu]')
    );
    this.submenuElements_.forEach(submenu => {
      // Make submenus programmatically focusable for a11y.
      submenu.tabIndex = -1;
    });
    this.submenuOpenElements_ = toArray(
      this.element.querySelectorAll('[amp-nested-submenu-open]')
    );
    this.submenuCloseElements_ = toArray(
      this.element.querySelectorAll('[amp-nested-submenu-close]')
    );
    this.submenuOpenElements_
      .concat(this.submenuCloseElements_)
      .forEach(element => {
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', 0);
        }
        element.setAttribute('role', 'button');
        userAssert(
          this.action_.hasAction(element, 'tap') == false,
          'submenu open/close buttons should not have tap actions registered.'
        );
      });
  }

  /** @override */
  layoutCallback() {
    this.registerEventListeners_();
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unregisterEventListeners_();
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }

  /**
   * Add event listeners on submenu open/close elements.
   */
  registerEventListeners_() {
    this.submenuOpenElements_.forEach(element => {
      element.addEventListener('click', this.submenuOpenHandler_);
    });
    this.submenuCloseElements_.forEach(element => {
      element.addEventListener('click', this.submenuCloseHandler_);
    });

    this.documentElement_.addEventListener('keydown', this.keydownHandler_);
  }

  /**
   * Remove listeners on all submenu open/close elements.
   */
  unregisterEventListeners_() {
    this.submenuOpenElements_.forEach(element => {
      element.removeEventListener('click', this.submenuOpenHandler_);
    });
    this.submenuCloseElements_.forEach(element => {
      element.removeEventListener('click', this.submenuCloseHandler_);
    });

    this.documentElement_.removeEventListener('keydown', this.keydownHandler_);
  }

  /**
   * Handler for submenu open element click.
   * @param {Event} e
   */
  handleSubmenuOpenClick_(e) {
    const submenuParent = dev().assertElement(e.currentTarget.parentElement);
    const submenu = scopedQuerySelector(submenuParent, '>[amp-nested-submenu]');
    if (submenu) {
      this.open_(submenu);
    }
  }

  /**
   * Open the specified submenu.
   * @param {!Element} submenu
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
      Services.timerFor(this.win).delay(() => {
        const submenuClose = dev().assertElement(
          submenu.querySelector('[amp-nested-submenu-close]')
        );
        tryFocus(submenuClose);
      }, ANIMATION_TIMEOUT);
    }
  }

  /**
   * Handler for submenu close element click.
   * @param {Event} e
   */
  handleSubmenuCloseClick_(e) {
    const submenuClose = dev().assertElement(e.currentTarget);
    const submenu = closestAncestorElementBySelector(
      submenuClose,
      '[amp-nested-submenu]'
    );
    if (submenu) {
      this.close_(submenu);
    }
  }

  /**
   * Close the specified submenu.
   * @param {!Element} submenu
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
      Services.timerFor(this.win).delay(() => {
        const submenuParent = dev().assertElement(submenu.parentElement);
        const submenuOpen = dev().assertElement(
          scopedQuerySelector(submenuParent, '>[amp-nested-submenu-open]')
        );
        tryFocus(submenuOpen);
      }, ANIMATION_TIMEOUT);
    }
  }

  /**
   * Handles arrow key navigation.
   * @param {Event} e
   */
  handleKeyDown_(e) {
    switch (e.key) {
      // TODO(#24665): Add support for all arrow keys and for RTL.
      case Keys.LEFT_ARROW:
        const submenu = this.currentSubmenu_;
        if (submenu) {
          this.close_(submenu);
        }
        break;
      case Keys.RIGHT_ARROW:
        break;
      case Keys.UP_ARROW:
        break;
      case Keys.DOWN_ARROW:
        break;
    }
  }

  /**
   * Get the parent menu of specified submenu, if one exists.
   * @param {!Element} submenu
   * @return {?Element}
   */
  getParentMenu_(submenu) {
    return closestAncestorElementBySelector(
      dev().assertElement(submenu.parentElement),
      'amp-nested-menu,[amp-nested-submenu]'
    );
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpNestedMenu, CSS);
});
