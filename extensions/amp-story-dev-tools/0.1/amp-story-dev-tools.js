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
    <div class="i-amphtml-dev-tools-container">
      <div class="i-amphtml-dev-tools-header">
        <span class="i-amphtml-dev-tools-brand">
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
          <span class="i-amphtml-dev-tools-brand-text">
            <span>WEB STORIES</span>
            <span>DEV - TOOLS</span>
          </span>
        </span>
        <div class="i-amphtml-dev-tools-tabs"></div>
        <svg
          title="Close dev tools"
          class="i-amphtml-dev-tools-close"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          width="18px"
          height="18px"
        >
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </div>
      <div class="i-amphtml-dev-tools-tab">
        <div class="lds-dual-ring"></div>
      </div>
    </div>
  `;
};

const PAGE_SPEED_URL = 'https://amp.dev/page-experience/?url=';

const AMP_TEST_URL = 'https://search.google.com/test/amp?&url=';

/** @enum {string} */
const DevToolsTab = {
  DEVICES: 'Devices',
  PAGE_SPEED: 'Page Speed',
  AMP_TEST: 'AMP Test',
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
      [DevToolsTab.AMP_TEST]: new DevToolsIframeTab(
        this.element,
        this.win,
        this,
        this.storyUrl_,
        AMP_TEST_URL + this.storyUrl_
      ),
    };

    this.loadFonts_();
  }

  /** @override */
  buildCallback() {
    // Create tabs on navbar.
    const tabsContainer = this.containerEl_.querySelector(
      '.i-amphtml-dev-tools-tabs'
    );
    Object.values(DevToolsTab).forEach((e) => {
      const tab = this.win.document.createElement('span');
      tab.textContent = e;
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

    // this.tabContents_[DevToolsTab.LOGS] = new DevToolsLogTab(
    //   buildLogsTabTemplate(this.element),
    //   this.storyUrl_
    // );

    // Go to tab in hashString
    this.switchTab_(
      Object.values(DevToolsTab).find(
        (e) => e.toLowerCase().replace(' ', '-') === this.currentTab_
      ) || DevToolsTab.DEVICES
    );
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
      .querySelector('.i-amphtml-dev-tools-close')
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
      this.element.querySelectorAll('.i-amphtml-dev-tools-tab')
    ).forEach((e) => e.remove());
    this.containerEl_.appendChild(this.tabContents_[tab].getElement());
    this.tabContents_[tab].onTabAttached();
    toArray(
      this.element.querySelector('.i-amphtml-dev-tools-tabs').children
    ).forEach((e) => {
      return e.toggleAttribute('active', e.textContent === tab);
    });
  }

  // /**
  //  * Creates the devices layouts
  //  * @param {!Element} container
  //  */
  // setUpPageSpeedTab_(container) {
  //   const pageSpeedContainer = buildPageSpeedTabTemplate(this.element);
  //   container.appendChild(pageSpeedContainer);
  //   const iframe = pageSpeedContainer.getElementsByTagName('iframe')[0];
  //   iframe.src = PAGE_SPEED_URL + this.storyUrl_;
  // }

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
