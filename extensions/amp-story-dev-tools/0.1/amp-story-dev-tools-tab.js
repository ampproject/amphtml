/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {htmlFor} from '../../../src/static-template';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Element} element
 * @param {string} name
 * @return {!Element} the layout
 */
export function createTabContentsTemplate(element, name) {
  const html = htmlFor(element);
  const layout = html`<div class="i-amphtml-story-dev-tools-tab">
    <h1>Title here</h1>
  </div>`;
  layout.querySelector('h1').textContent = name;
  return layout;
}

export class AmpStoryDevToolsTab {
  /**
   * @param {!Element} element
   * @param {!Element} win
   * @param {!AmStoryDevTools} devTools
   * @param {string} storyUrl_
   */
  constructor(element, win, devTools, storyUrl_) {
    /** @protected {!Element} */
    this.element = element;

    /** @protected {!Element} */
    this.win_ = win;

    /** @protected {!AmpStoryDevTools} */
    this.devTools_ = devTools;

    /** @protected  {string} */
    this.storyUrl_ = storyUrl_;

    /** @protected {boolean} whether the layout was built before */
    this.layoutBuilt_ = false;
  }

  /**
   * Called when the tab is added to the dom, used to initialize contents if needed.
   * @public
   */
  onTabAttached() {
    // Subclass can override.
  }

  /**
   * Get the root element of the tab contents.
   * @return {!Element}
   */
  getElement() {
    return this.element;
  }
}
