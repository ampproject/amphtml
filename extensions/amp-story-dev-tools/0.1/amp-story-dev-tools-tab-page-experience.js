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

import {applySandbox} from '../../../src/3p-frame';
import {htmlFor} from '../../../src/static-template';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @return {!Element} the layout
 */
export function createTabPageExperienceElement(win, storyUrl) {
  const element = win.document.createElement(
    'amp-story-dev-tools-tab-page-experience'
  );
  element.setAttribute('data-story-url', storyUrl);
  return element;
}

export class AmpStoryDevToolsTabPageExperience extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    /** @private  {string} */
    this.storyUrl_ = '';
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('data-story-url');
  }

  /** @override */
  layoutCallback() {
    const iframe = htmlFor(this.element)`<iframe frameborder="0">`;
    applySandbox(iframe);
    iframe.src =
      'https://amp.dev/page-experience/?url=' +
      encodeURIComponent(this.storyUrl_);
    this.element.appendChild(iframe);
  }
}
