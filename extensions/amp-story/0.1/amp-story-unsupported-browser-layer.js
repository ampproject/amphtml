/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-story-unsupported-browser-layer-0.1.css';
import {LocalizedStringId} from './localization';
import {createShadowRootWithStyle} from './utils';
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';


/**
 * Full viewport black layer indicating browser is not supported.
 * @private @const {!./simple-template.ElementDef}
 */
const UNSUPPORTED_BROWSER_LAYER_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-unsupported-browser-overlay'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-overlay-container'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-gear-icon'}),
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
          localizedStringId:
              LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT,
        },
      ],
    },
  ],
};


export class UnsupportedBrowserLayer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;
  }

  /**
   * Builds and appends the component in the story.
   */
  build() {
    if (this.root_) {
      return this.root_;
    }

    this.root_ = this.win_.document.createElement('div');
    const overlayEl =
        renderAsElement(this.win_.document, UNSUPPORTED_BROWSER_LAYER_TEMPLATE);

    createShadowRootWithStyle(this.root_, overlayEl, CSS);

    return this.root_;
  }
}
