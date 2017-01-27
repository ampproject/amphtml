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
import {childElementByTag, childElementsByTag} from '../../../src/dom';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-tabs';

export class AmpTabs extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?NodeList} */
    this.sections_ = null;
    /** @private {?NodeList} */
    this.tabs_ = null;
  }

  /** @override */
  buildCallback() {
    //TODO: handle case where there are > 1 <amp-tabs> on a page.

    user().assert(isExperimentOn(this.win, TAG),
        `Experiment "${TAG}" is disabled.`);

    const tabsParent = childElementByTag(this.element, 'ul');
    user().assert(tabsParent != null,
      'Tab headers should be enclosed in a <ul> tag');

    const tabs = childElementsByTag(tabsParent, 'li');
    user().assert(tabs.length > 0,
      'There should be at least one tab items enclosed in a <li> tag...');

    const sections = childElementsByTag(this.element, 'section');
    user().assert(sections.length == tabs.length,
      'There should same number of sections as tabs...');

    let selectedTab = null;
    tabs.forEach(tab => {
      if (!!tab.attributes['selected']) {
        selectedTab = tab;
      }
    });

    let selectedSection = null;
    sections.forEach(section => {
      if (!!section.attributes['selected']) {
        selectedSection = section;
      }
    });

    user().assert(selectedTab != null,
      'You need to specify a tab to be selected!');
    user().assert(selectedSection != null,
      'You need to specify a section to be selected!');
    user().assert(
      tabs.indexOf(selectedTab) == sections.indexOf(selectedSection),
      'Selected Tab Header and Selected Tab content indices do not match!');

    this.sections_ = sections;
    this.tabs_ = tabs;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', this.onHeaderClick_.bind(this, index));
    });
  }

  /**
   * Handles tab headers clicks to expand/collapse its content.
   * @param {number} index the tab index to display
   * @private
   */
  onHeaderClick_(index) {
    for (let i = 1; i < this.sections_.length; ++i) {
      this.mutateElement(() => {
        this.sections_[i].removeAttribute('selected');
      }, this.sections_[i]);
      this.mutateElement(() => {
        this.tabs_[i].removeAttribute('selected');
      }, this.tabs_[i]);
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
