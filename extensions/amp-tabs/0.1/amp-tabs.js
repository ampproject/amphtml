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

import {CSS} from '../../../build/amp-tabs-0.1.css';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-tabs';

export class AmpTabs extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?NodeList} */
    this.sections_ = null;
  }

  /** @override */
  buildCallback() {
    //TODO: handle case where there are > 1 <amp-tabs> on a page.

    user().assert(isExperimentOn(this.win, TAG),
        `Experiment "${TAG}" is disabled.`);

    let selectedTabHeaderIndex = -1;
    let selectedTabContentIndex = -1;
    this.sections_ = this.getRealChildren();
    console.log(this);
    this.sections_.forEach((section, index) => {
      /** The first section should be the tab headers */
      if (!index) {
        user().assert(
            section.tagName.toLowerCase() == 'ul',
            'Sections should be enclosed in a <section> tag, ' +
            'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
            'amp-tabs/amp-tabs.md. Found in: %s', this.element);
        for (let i = 0; i < section.children.length; ++i) {
          const tab = section.children[i];
          tab.addEventListener('click',
            this.onHeaderClick_.bind(this, i + 1 /* tab content index */));

          if (tab.hasAttribute('selected')) {
            selectedTabHeaderIndex = i;
          }
        }
      } else {
        /** The tab content */
        user().assert(
            section.tagName.toLowerCase() == 'section',
            'Sections should be enclosed in a <section> tag, ' +
            'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
            'amp-tabs/amp-tabs.md. Found in: %s', this.element);

        if (section.hasAttribute('selected')) {
          selectedTabContentIndex = index - 1;
        }
      }
    });

    user().assert(selectedTabHeaderIndex >= 0, 'You need to specify which ' +
      'Tab Header will be selected by default. Add the "selected" attribute ' +
      'to the <li> tag.');
    user().assert(selectedTabContentIndex >= 0, 'You need to specify which ' +
      'Tab Content will be displayed by default. Add the "selected" ' +
      'attribute to the <section> tag.');
    user().assert(selectedTabHeaderIndex == selectedTabContentIndex,
      'Selected Tab Header and Selected Tab content indices do not match!');
  }

  /**
   * Handles tab headers clicks to expand/collapse its content.
   * @param {number} index the tab index to display
   * @private
   */
  onHeaderClick_(index) {
    event.preventDefault();
    for (let i = 1; i < this.sections_.length; ++i) {
      this.sections_[i].removeAttribute('selected');
    }
    const tabContentElement = this.sections_[index];
    this.mutateElement(() => {
      tabContentElement.setAttribute('selected', '');
    }, tabContentElement);
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpTabs, CSS);
});
