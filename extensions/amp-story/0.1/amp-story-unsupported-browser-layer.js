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
import {Services} from '../../../src/services';
import {StateProperty} from './amp-story-store-service';
import {createShadowRootWithStyle} from './utils';
import {dict} from './../../../src/utils/object';
import {renderSimpleTemplate} from './simple-template';


/**
 * Container for "pill-style" share widget, rendered on desktop.
 * @private @const {!./simple-template.ElementDef}
 */
const UNSUPPORTED_BROWSER_LAYER_TEMPLATE = [
  {
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
  },
];


export class UnsupportedBrowserLayer {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the component
   */
  constructor(win, storyElement) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    this.initializeListeners_();
  }

  /**
   * Builds and appends the component in the story.
   */
  build() {
  	if (this.isBuilt()) {
  		return;
  	}

    const root = this.win_.document.createElement('div');
    const overlayEl =
        renderSimpleTemplate(
        		this.win_.document, UNSUPPORTED_BROWSER_LAYER_TEMPLATE);

    createShadowRootWithStyle(root, overlayEl, CSS);

    this.isBuilt_ = true;

    this.vsync_.mutate(() => {
      this.storyElement_.prepend(root);
    });
  }

  /**
   * Whether the component is built.
   * @return {boolean}
   */
  isBuilt() {
  	return this.isBuilt_;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
        StateProperty.SUPPORTED_BROWSER_STATE, isBrowserSupported => {
      this.onSupportedBrowserStateUpdate_(isBrowserSupported);
    }, true /** callToInitialize */);
  }

  /**
   * Reacts to browser compatibility updates. Can only be changed to false,
   * which shows the layer.
   * @param {boolean} isBrowserSupported
   * @private
   */
  onSupportedBrowserStateUpdate_(isBrowserSupported) {
    if (isBrowserSupported) {
      return;
    }

    this.build();
  }
}
