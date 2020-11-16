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

import {AmpStoryDevToolsTab} from './amp-story-dev-tools-tab';
import {htmlFor} from '../../../src/static-template';

const buildLogsTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-dev-tools-iframe i-amphtml-dev-tools-tab">
      <iframe frameborder="0">
    </div>`;
};

export class DevToolsIframeTab extends AmpStoryDevToolsTab {
  /**
   * @param {!Element} element the element that will be used to log everything.
   * @param {!Element} win
   * @param {!AmpStoryDevTools} devTools
   * @param {string} storyUrl
   * @param {string} iframeUrl
   */
  constructor(element, win, devTools, storyUrl, iframeUrl) {
    super(buildLogsTabTemplate(element), win, devTools, storyUrl, iframeUrl);

    this.element.querySelector('iframe').src = iframeUrl;
  }
  /** @override */
  getElement() {
    return this.element;
  }
}
