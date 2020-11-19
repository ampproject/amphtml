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

import {CSS} from '../../../build/amp-story-dev-tools-0.1.css';
import {htmlFor} from '../../../src/static-template';
import {parseQueryString} from '../../../src/url';
import {toArray} from '../../../src/types';

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    src:
      "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    src:
      "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

/**
 * Generates the template for the root layout.
 * @param {!Element} element
 * @return {!Element}
 */
const buildContainerTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-dev-tools-container">
      <div class="i-amphtml-story-dev-tools-header">
        <span class="i-amphtml-story-dev-tools-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
          >
            <circle cx="15" cy="15" r="15" fill="white"></circle>
            <path
              d="M19.5 9.00015C20.3284 9.00015 21 9.67173 21 10.5002V19.5002C21 20.3286 20.3284 21.0002 19.5 21.0002V9.00015Z"
              fill="#202125"
            />
            <path
              d="M8.25 9.00015C8.25 8.17173 8.92157 7.50015 9.75 7.50015H16.5C17.3284 7.50015 18 8.17173 18 9.00015V21.0002C18 21.8286 17.3284 22.5002 16.5 22.5002H9.75C8.92157 22.5002 8.25 21.8286 8.25 21.0002V9.00015Z"
              fill="#202125"
            />
            <path
              d="M22.5 10.5002C23.1213 10.5002 23.625 11.0038 23.625 11.6252V18.3752C23.625 18.9965 23.1213 19.5002 22.5 19.5002V10.5002Z"
              fill="#202125"
            />
          </svg>
          <span class="i-amphtml-story-dev-tools-brand-text">
            <span>WEB STORIES</span>
            <span>DEV - TOOLS</span>
          </span>
        </span>
        <div class="i-amphtml-story-dev-tools-tabs"></div>
        <div
          class="i-amphtml-story-dev-tools-button i-amphtml-story-dev-tools-close"
        >
          <span>OPEN STORY</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M9.9165 4.08333L9.094 4.90583L10.599 6.41667H4.6665V7.58333H10.599L9.094 9.08833L9.9165 9.91667L12.8332 7L9.9165 4.08333ZM2.33317 2.91667H6.99984V1.75H2.33317C1.6915 1.75 1.1665 2.275 1.1665 2.91667V11.0833C1.1665 11.725 1.6915 12.25 2.33317 12.25H6.99984V11.0833H2.33317V2.91667Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
      <div class="i-amphtml-story-dev-tools-tab">
        <div class="lds-dual-ring"></div>
      </div>
    </div>
  `;
};

/** @enum {string} */
const DevToolsTab = {
  PREVIEW: 'Preview',
  PAGE_EXPERIENCE: 'Page Experience',
  ERRORS: 'Errors',
};

export class AmpStoryDevTools extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    const hashParams = parseQueryString(this.win.location.hash);

    this.win.document.title = `Story Dev-Tools (${this.win.document.title})`;

    // TODO: Remove support for url queryParam when widely available.
    /** @private {string} */
    this.storyUrl_ = hashParams['url'] || this.win.location.href.split('#')[0];

    /** @private {!DevToolsTab} get URL param for tab (eg: #tab=page-experience) or default to PREVIEW*/
    this.currentTab_ =
      Object.values(DevToolsTab).find(
        (e) => e.toLowerCase().replace(' ', '-') === hashParams['tab']
      ) || DevToolsTab.PREVIEW;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();

    this.buildLayout_();
  }

  /**
   * @private
   */
  buildLayout_() {
    const container = buildContainerTemplate(this.element);
    this.element.appendChild(container);
    this.element
      .querySelector('.i-amphtml-story-dev-tools-close')
      .addEventListener('click', () => {
        this.win.location.href = this.storyUrl_;
      });

    // Create tabs on top
    const tabsContainer = container.querySelector(
      '.i-amphtml-story-dev-tools-tabs'
    );
    Object.values(DevToolsTab).forEach((e) => {
      const tab = this.win.document.createElement('span');
      tab.textContent = e;
      if (e == DevToolsTab.LOGS) {
        tab.appendChild(this.errorsCountEl_);
      }
      tab.tabName = e;
      tab.addEventListener('click', () => {
        if (this.currentTab_ != e) {
          this.switchTab_(e);
          // Update hashString with tab selected or null if tab = preview (default)
          this.updateHash({
            'tab':
              e == DevToolsTab.PREVIEW
                ? null
                : e.toLowerCase().replace(' ', '-'),
          });
        }
      });
      tabsContainer.appendChild(tab);
    });
    this.switchTab_(this.currentTab_);
  }

  /**
   * Switches the tab shown.
   * @param {!DevToolsTab} tab
   */
  switchTab_(tab) {
    this.currentTab_ = tab;
    toArray(
      this.element.querySelector('.i-amphtml-story-dev-tools-tabs').children
    ).forEach((e) => {
      return e.toggleAttribute('active', e.tabName === tab);
    });
    // TODO(mszylkowski): Remove previous tab and add current tab to the screen.
  }

  /**
   * Updates the hashString with the dictionary<string, string> passed in
   * @public
   * @param {!Object} updates
   */
  updateHash(updates) {
    let queryHash = parseQueryString(this.win.location.hash);
    queryHash = Object.assign(queryHash, updates);
    this.win.location.hash = Object.entries(queryHash)
      .filter((e) => e[1] != undefined)
      .map((e) => e[0] + '=' + e[1])
      .join('&');
  }

  /**
   * @private
   */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      fontsToLoad.forEach((fontProperties) => {
        const font = new FontFace(fontProperties.family, fontProperties.src, {
          weight: fontProperties.weight,
          style: 'normal',
        });
        font.load().then(() => {
          this.win.document.fonts.add(font);
        });
      });
    }
  }
}

AMP.extension('amp-story-dev-tools', '0.1', (AMP) => {
  AMP.registerElement('amp-story-dev-tools', AmpStoryDevTools, CSS);
});
