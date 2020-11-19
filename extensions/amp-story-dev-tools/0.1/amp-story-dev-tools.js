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

import {
  ALL_SCREEN_SIZES,
  DEFAULT_SCREEN_SIZES,
  DevToolsDevicesTab,
} from './amp-story-dev-tools-devices';
import {CSS} from '../../../build/amp-story-dev-tools-0.1.css';
import {DevToolsIframeTab} from './amp-story-dev-tools-iframe-tab';
import {DevToolsLogTab} from './amp-story-dev-tools-logs';
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
            <circle cx="15" cy="15" r="15" fill="white" />
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

const PAGE_SPEED_URL = 'https://amp.dev/page-experience/?url=';

/** @enum {string} */
const DevToolsTab = {
  DEVICES: 'Devices',
  PAGE_SPEED: 'Page Speed',
  LOGS: 'Logs',
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

    /** @private {Element} */
    this.containerEl_ = this.setUpLayout_();

    /** @private {DevToolsTab} */
    this.currentTab_ =
      Object.values(DevToolsTab).find(
        (e) => e.toLowerCase().replace(' ', '-') === hashParams['tab']
      ) || DevToolsTab.DEVICES;

    this.tabContents_ = {
      [DevToolsTab.DEVICES]: new DevToolsDevicesTab(
        this.element,
        this.win,
        this,
        this.storyUrl_,
        this.parseDevices_(hashParams)
      ),
      [DevToolsTab.LOGS]: new DevToolsLogTab(
        this.element,
        this.win,
        this,
        this.storyUrl_
      ),
      [DevToolsTab.PAGE_SPEED]: new DevToolsIframeTab(
        this.element,
        this.win,
        this,
        this.storyUrl_,
        PAGE_SPEED_URL + this.storyUrl_
      ),
    };

    this.errorsCountEl_ = element.ownerDocument.createElement('span');

    this.loadFonts_();
  }

  /** @override */
  buildCallback() {
    // Create tabs on navbar.
    const tabsContainer = this.containerEl_.querySelector(
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
        if (this.tab_ != e) {
          this.switchTab_(e);
          // Update hashString with tab selected or null if tab = devices (default)
          this.updateHash({
            'tab':
              e == DevToolsTab.DEVICES
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
   * @public
   * @param {number} errorCount
   */
  setErrorCount(errorCount) {
    if (errorCount > 0) {
      this.errorsCountEl_.textContent = errorCount;
      this.errorsCountEl_.classList.add(
        'i-amphtml-story-dev-tools-errors-status'
      );
    } else {
      console.log(this.errorsCountEl_);
      this.errorsCountEl_.appendChild(htmlFor(
        this.element
      )`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" class="i-amphtml-story-dev-tools-errors-status">
          <path d="M7 0C3.136 0 0 3.136 0 7C0 10.864 3.136 14 7 14C10.864 14 14 10.864 14 7C14 3.136 10.864 0 7 0ZM5.6 10.5L2.8 7.7L3.78 6.72L5.6 8.54L10.22 3.92L11.2 4.9L5.6 10.5Z" fill="#2DE661"/>
        </svg>`);
    }
  }

  /**
   * Get devices from the queryHash into list of devices
   * @param {*} queryHash
   * @return {any[]}
   */
  parseDevices_(queryHash) {
    if (queryHash['devices'] != undefined) {
      const screenSizes = [];
      const simplifyDeviceName = (name) =>
        name.toLowerCase().replace(/[^a-z0-9]/gi, '');

      queryHash['devices'].split(';').forEach((device) => {
        const deviceSpecs = device.split(':');
        let currSpecs = null;
        if (deviceSpecs.length == 1) {
          currSpecs = ALL_SCREEN_SIZES.find((el) => {
            // Find first device that has prefix of the device name passed in.
            const currDeviceName = simplifyDeviceName(el.name);
            const specDeviceName = simplifyDeviceName(deviceSpecs[0]);
            return (
              currDeviceName.substring(0, specDeviceName.length) ==
              specDeviceName
            );
          });
        } else {
          currSpecs = {
            'width': parseInt(deviceSpecs[0], 10),
            'height': parseInt(deviceSpecs[1], 10),
            'custom': true,
          };
          if (deviceSpecs.length >= 3) {
            currSpecs.name = deviceSpecs[2];
          }
        }
        if (currSpecs) {
          screenSizes.push(currSpecs);
        }
      });
      return screenSizes;
    }
    return DEFAULT_SCREEN_SIZES;
  }

  /**
   * Creates the layout of the inspector
   * @return {!Element}
   */
  setUpLayout_() {
    this.element.textContent = '';
    const container = buildContainerTemplate(this.element);
    this.element.appendChild(container);
    this.element
      .querySelector('.i-amphtml-story-dev-tools-close')
      .addEventListener('click', () => {
        this.closeDevTools_();
      });
    return container;
  }

  /**
   * Switches the tab shown to the parameter passed.
   * @param {!DevToolsTab} tab
   */
  switchTab_(tab) {
    this.currentTab_ = tab;
    toArray(
      this.element.querySelectorAll('.i-amphtml-story-dev-tools-tab')
    ).forEach((e) => e.remove());
    this.containerEl_.appendChild(this.tabContents_[tab].getElement());
    this.tabContents_[tab].onTabAttached();
    toArray(
      this.element.querySelector('.i-amphtml-story-dev-tools-tabs').children
    ).forEach((e) => {
      return e.toggleAttribute('active', e.tabName === tab);
    });
  }

  /**
   * Closes the dev tools by navigating to the story.
   */
  closeDevTools_() {
    this.win.location.href = this.storyUrl_;
  }

  /**
   * @public
   * @param {any} updates
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

  /** @override */
  onLayoutMeasure() {
    this.getViewport().onResize(() =>
      this.tabContents_[this.currentTab_].onLayoutChanged()
    );
  }
}

AMP.extension('amp-story-dev-tools', '0.1', (AMP) => {
  AMP.registerElement('amp-story-dev-tools', AmpStoryDevTools, CSS);
});
