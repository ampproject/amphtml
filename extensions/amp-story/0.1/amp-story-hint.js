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

import {renderSimpleTemplate} from './simple-template';
import {dict} from '../../../src/utils/object';

/** @private @const {!Array<!./simple-template.ElementDef>} */
const NAVIGATION_HELP_OVERLAY = [
  {
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-navigation-help-overlay'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
            + ' i-amphtml-story-navigation-help-first-page'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-text'}),
            text: 'this is the first page',
          },
        ],
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
            + ' i-amphtml-story-navigation-help-next-page'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-tap-icon'}),
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-tap-icon-text'}),
            text: 'tap for next',
          },
        ],
      },
    ],
  },
];

const NAVIGATION_OVERLAY = 'show-navigation-overlay';

export class AmpStoryHint {
  constructor(window) {
    this.win_ = window;

    this.document_ = this.win_.document;

    this.hintContainer_ = this.buildHintContainer_();
    this.buildNavigationOverlay_();
  }

  get hintContainer() {
    return this.hintContainer_;
  }

  buildHintContainer_() {
    const hintContainer = this.document_.createElement('aside');
    hintContainer.classList.add('i-amphtml-story-hint-container');
    return hintContainer;
  }

  buildNavigationOverlay_() {
    this.hintContainer_.appendChild(
        renderSimpleTemplate(this.document_, NAVIGATION_HELP_OVERLAY));
  }

  showNavigationHelp() {
    this.hintContainer_.classList.add(NAVIGATION_OVERLAY);
  }

  hideAllNavigationHint() {
    this.hintContainer_.classList.remove(NAVIGATION_OVERLAY);
  }
}

