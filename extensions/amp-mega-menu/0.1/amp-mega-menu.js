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
import {Layout} from '../../../src/layout';
import {dev} from '../../../src/log';

const TAG = 'amp-mega-menu';

export class AmpMegaMenu extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Array<!Element>} */
    this.sections_ = null;

    /** @private {?Element} */
    this.openSection_ = null;

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;
  }

  /** @override */
  buildCallback() {
    this.element.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.registerActions_();
    });

    const mask = this.win.document.createElement('div');
    mask.classList.add('i-amphtml-mega-menu-mask');
    this.getAmpDoc()
      .getBody()
      .querySelector('main')
      .appendChild(mask);
    this.maskElement_ = mask;

    this.documentElement_.addEventListener('click', () => {
      if (this.openSection_) {
        this.element.removeAttribute('open');
        this.openSection_.removeAttribute('open');
        this.maskElement_.removeAttribute('open');
        this.openSection_ = null;
      }
    });
  }

  /** */
  registerActions_() {
    this.sections_ = this.element.querySelectorAll('section');
    this.sections_.forEach(section => {
      const sectionComponents = section.children;
      const heading = sectionComponents[0];
      const content = sectionComponents[1];
      heading.setAttribute('role', 'button');
      heading.addEventListener('click', e => this.handleHeadingClick_(e));
      content.addEventListener('click', e => e.stopPropagation());
    });
  }

  /**
   * @param {!Event} event
   */
  handleHeadingClick_(event) {
    event.stopPropagation();
    const section = dev().assertElement(event.target.parentElement);
    if (section == this.openSection_) {
      this.element.removeAttribute('open');
      section.removeAttribute('open');
      this.maskElement_.removeAttribute('open');
      this.openSection_ = null;
    } else {
      if (this.openSection_) {
        this.openSection_.removeAttribute('open');
        this.maskElement_.removeAttribute('open');
      }
      this.element.setAttribute('open', '');
      section.setAttribute('open', '');
      this.maskElement_.setAttribute('open', '');
      this.openSection_ = section;
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  // /**
  //  * @param {*} event
  //  */
  // onClick_(event) {
  //   const group = event.target.closest('section');
  //   if (this.openGroup_ !== group) {
  //     this.openGroup_ && this.openGroup_.removeAttribute('open');
  //     this.maskElement_.removeAttribute('open');
  //     this.openGroup_ = null;
  //     if (!group) {
  //       return;
  //     }
  //     const heading = group.querySelector('[amp-mega-menu-heading]');
  //     const content = group.querySelector('[amp-mega-menu-content]');
  //     if (heading && content) {
  //       group.setAttribute('open', '');
  //       this.maskElement_.setAttribute('open', '');
  //     }
  //     this.openGroup_ = group;
  //   }
  // }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMegaMenu, CSS);
});
