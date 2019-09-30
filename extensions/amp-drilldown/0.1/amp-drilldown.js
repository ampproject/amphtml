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

import {CSS} from '../../../build/amp-drilldown-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {closestAncestorElementBySelector} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';

const TAG = 'amp-drilldown';

// TODO(#24668): add unit tests for click handlers and history.
export class AmpDrilldown extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private {Array} */
    this.historyIds_ = [];

    /** @private {?Element} */
    this.currentSubmenu_ = null;

    /** @private {function(!Event)} */
    this.submenuOpenHandler_ = this.handleSubmenuOpenClick_.bind(this);

    /** @private {function(!Event)} */
    this.submenuCloseHandler_ = this.handleSubmenuCloseClick_.bind(this);

    /** @private {function(!Event)} */
    this.keydownHandler_ = this.handleKeyDown_.bind(this);
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-sidebar-v2'),
      'Turning on the amp-sidebar-v2 experiment is necessary to use the amp-drilldown component.'
    );
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
    const openElements = this.element.querySelectorAll(
      '[amp-drilldown-submenu-open]'
    );
    openElements.forEach(element => {
      element.addEventListener('click', this.submenuOpenHandler_);
    });
    const closeElements = this.element.querySelectorAll(
      '[amp-drilldown-submenu-close]'
    );
    closeElements.forEach(element => {
      element.addEventListener('click', this.submenuCloseHandler_);
    });

    this.documentElement_.addEventListener('keydown', this.keydownHandler_);
  }

  /**
   * Remove listeners on all submenu open/close elements.
   */
  unregisterEventListeners_() {
    const openElements = this.element.querySelectorAll(
      '[amp-drilldown-submenu-open]'
    );
    openElements.forEach(element => {
      element.removeEventListener('click', this.submenuOpenHandler_);
    });
    const closeElements = this.element.querySelectorAll(
      '[amp-drilldown-submenu-close]'
    );
    closeElements.forEach(element => {
      element.removeEventListener('click', this.submenuCloseHandler_);
    });

    this.documentElement_.removeEventListener('keydown', this.keydownHandler_);
  }

  /**
   * Handler for submenu open element click.
   * @param {Event} e
   */
  handleSubmenuOpenClick_(e) {
    const submenuOpen = dev().assertElement(e.target);
    const submenu = submenuOpen.parentElement.querySelector(
      '[amp-drilldown-submenu]'
    );
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
      this.getHistory_()
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
    const submenuClose = dev().assertElement(e.target);
    const submenu = closestAncestorElementBySelector(
      submenuClose,
      '[amp-drilldown-submenu]'
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
    const submenuParent = this.getParentMenu_(submenu);
    if (submenuParent) {
      submenuParent.removeAttribute('child-open');
      submenu.removeAttribute('open');
      if (this.historyIds_.length > 0) {
        const lastHistoryId = this.historyIds_.pop();
        this.getHistory_().pop(lastHistoryId);
      }
      this.currentSubmenu_ = submenuParent;
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
      'amp-drilldown,[amp-drilldown-submenu]'
    );
  }

  /**
   * Returns the history for the ampdoc.
   * @return {!../../../src/service/history-impl.History}
   * @private
   */
  getHistory_() {
    return Services.historyForDoc(this.getAmpDoc());
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDrilldown, CSS);
});
