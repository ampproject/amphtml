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
   * @param {*} sidebar
   */
  constructor(sidebar) {
    this.sidebar_ = sidebar;

    /** @private {Array} */
    this.historyIds_ = [];

    /** @private {?Element} */
    this.currentSubmenu_ = null;
  }

  /**
   * On click handler.
   * @param {Event} e
   */
  handleClick(e) {
    this.handleSubmenuOpenClick_(e);
    this.handleSubmenuCloseClick_(e);
  }

  /**
   * Handler for submenu open element click.
   * @param {Event} e
   */
  handleSubmenuOpenClick_(e) {
    const submenuOpen = closestAncestorElementBySelector(
      dev().assertElement(e.target),
      '[amp-sidebar-submenu-open]'
    );
    const submenu =
      submenuOpen &&
      submenuOpen.parentElement.querySelector('[amp-sidebar-submenu]');

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
    const submenuParent = this.getParentMenu_(submenu);
    if (submenuParent) {
      submenuParent.setAttribute('child-open', '');
      submenu.setAttribute('open', '');
      Services.historyForDoc(this.sidebar_.getAmpDoc())
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
   */
  handleSubmenuCloseClick_(e) {
    const submenuClose = closestAncestorElementBySelector(
      dev().assertElement(e.target),
      '[amp-sidebar-submenu-close]'
    );
    const submenu =
      submenuClose &&
      closestAncestorElementBySelector(submenuClose, '[amp-sidebar-submenu]');

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
    const submenuParent = this.getParentMenu_(submenu);
    if (submenuParent) {
      submenuParent.removeAttribute('child-open');
      submenu.removeAttribute('open');
      if (this.historyIds_.length > 0) {
        const lastHistoryId = this.historyIds_.pop();
        Services.historyForDoc(this.sidebar_.getAmpDoc()).pop(lastHistoryId);
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
