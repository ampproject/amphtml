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

import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {closestAncestorElementBySelector} from '../../../src/dom';
import {dev} from '../../../src/log';

/**
 * Class representing submenu behavior inside sidebar
 */
export class SubmenuManager {
  /**
   * @param {!AmpElement} sidebar
   */
  constructor(sidebar) {
    this.sidebar_ = sidebar;

    /** @private {!../../../src/service/history-impl.History} */
    this.history_ = Services.historyForDoc(this.sidebar_.getAmpDoc());

    /** @private {Array} */
    this.historyIds_ = [];

    /** @private {?Element} */
    this.currentSubmenu_ = null;
  }

  /**
   *
   */
  build() {
    const sidebarElement = this.sidebar_.element;
    const openElements = sidebarElement.querySelectorAll(
      '[amp-sidebar-submenu-open]'
    );
    const closeElements = sidebarElement.querySelectorAll(
      '[amp-sidebar-submenu-close]'
    );
    openElements.forEach(element => {
      element.addEventListener('click', e =>
        this.maybeHandleSubmenuOpenClick_(e)
      );
    });
    closeElements.forEach(element => {
      element.addEventListener('click', e =>
        this.maybeHandleSubmenuCloseClick_(e)
      );
    });
  }

  /**
   * Handles click events on open/close submenu elements.
   * @param {Event} e
   * @return {boolean} whether event was actually handled by submenus.
   */
  maybeHandleClick(e) {
    return (
      this.maybeHandleSubmenuOpenClick_(e) ||
      this.maybeHandleSubmenuCloseClick_(e)
    );
  }

  /**
   * Handler for submenu open element click.
   * @param {Event} e
   * @return {boolean} whether event target is a submenu open element.
   */
  maybeHandleSubmenuOpenClick_(e) {
    const submenuOpen = closestAncestorElementBySelector(
      dev().assertElement(e.target),
      '[amp-sidebar-submenu-open]'
    );
    if (!submenuOpen) {
      return false;
    }
    const submenu = submenuOpen.parentElement.querySelector(
      '[amp-sidebar-submenu]'
    );
    if (submenu) {
      this.open_(submenu);
    }
    return true;
  }

  /**
   * Open the specified submenu.
   * @param {!Element} submenu
   */
  open_(submenu) {
    if (submenu.hasAttribute('open')) {
      return;
    }
    const submenuParent = this.getParentMenu_(submenu);
    if (submenuParent) {
      submenuParent.setAttribute('child-open', '');
      submenu.setAttribute('open', '');
      this.history_
        .push(() => this.close_(submenu))
        .then(historyId => {
          this.historyIds_.push(historyId);
        });
      this.currentSubmenu_ = submenu;
    }
  }

  /**
   * Handler for submenu close element click.
   * @param {Event} e
   * @return {boolean} whether event target is a submenu close element.
   */
  maybeHandleSubmenuCloseClick_(e) {
    const submenuClose = closestAncestorElementBySelector(
      dev().assertElement(e.target),
      '[amp-sidebar-submenu-close]'
    );
    if (!submenuClose) {
      return false;
    }
    const submenu = closestAncestorElementBySelector(
      submenuClose,
      '[amp-sidebar-submenu]'
    );
    if (submenu) {
      this.close_(submenu);
    }
    return true;
  }

  /**
   * Close the specified submenu.
   * @param {!Element} submenu
   */
  close_(submenu) {
    if (!submenu.hasAttribute('open')) {
      return;
    }
    const submenuParent = this.getParentMenu_(submenu);
    if (submenuParent) {
      submenuParent.removeAttribute('child-open');
      submenu.removeAttribute('open');
      if (this.historyIds_.length > 0) {
        const lastHistoryId = this.historyIds_.pop();
        this.history_.pop(lastHistoryId);
      }
      this.currentSubmenu_ = submenuParent;
    }
  }

  /**
   *
   * @param {Event} e
   */
  handleKeyDown(e) {
    switch (e.key) {
      // TODO(stevenye): Add support for all arrow keys and for RTL.
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
      '[amp-sidebar-submenu],[amp-sidebar-submenu-group]'
    );
  }
}
