/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {listen} from '../../../src/event-helper';

import {toggle} from '../../../src/style';
import { childElementByAttr } from '../../../src/dom';

/** @private @const {string} */
const TAG = 'amp-sidebar';

/** @private @enum {string} */
const Direction = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
};

/**
 * @extends {AMP.BaseElement}
 */
export class AmpSidebar extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported () {
    return true;
  }

  /** @override */
  buildCallback() {
    // TODO: initialze desktop / mobile version
    // Create two copies? Move on media query change?
    this.openMenu_ = null;
    this.desktopMenu_ = document.createElement('div');
  }

  /** @override */
  layoutCallback() {
    const {element} = this;

    const headings = childElementByAttr(element, 'heading');
    headings.forEach(h => {
      h.addEventListener('click', () => this.toggleHeading_(h));
    });
  }

  /**
   *
   * @param {!Element} heading
   */
  toggleHeading_(heading) {
    const menuQuery = childElementByAttr(heading, 'dropdown');
    const menu = menuQuery[0];
    if (this.openMenu_ == null) {
      // If nothing is open, open the clicked menu
      toggle(menu, true);
      this.openMenu_ = menu;
    } else if (menu == this.openMenu_) {
      // If clicked menu is already open, close it.
      toggle(this.openMenu_, false);
      this.openMenu_ = null;
    } else {
      // If clicked menu is different from open menu,
      // open clicked and close original
      toggle(menu, true);
      toggle(this.openMenu_, false);
      this.openMenu_ = menu;
    }
  }
}

AMP.extension('amp-sidebar', '0.2', AMP => {
  AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
});
