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
import {DevToolsLogTab} from './amp-story-dev-tools-logs';
import {Services} from '../../../src/services';
import {debounce} from '../../../src/utils/rate-limit';
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

/** @private @const {number} */
const RESIZE_TIMEOUT_MS = 1000;

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
        <span class="i-amphtml-dev-tools-brand">Story Dev-Tools</span>
        <div class="i-amphtml-dev-tools-tabs"></div>
        <span class="i-amphtml-dev-tools-url-bar">
          <input
            type="url"
            id="story-url"
            placeholder="Story URL"
            autocomplete="on"
          />
          <button class="i-amphtml-dev-tools-url-button">
            Change
          </button>
        </span>
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

const buildDevicesTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div
    class="i-amphtml-dev-tools-devices i-amphtml-dev-tools-tab"
  ></div>`;
};

const buildPageSpeedTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-dev-tools-page-speed i-amphtml-dev-tools-tab">
    <iframe class="i-amphtml-dev-tools-page-speed-iframe" frameborder="0">
  </div>`;
};

const buildLogsTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-dev-tools-logs i-amphtml-dev-tools-tab">
    <h1>Logs</h1>
  </div>`;
};

const PAGE_SPEED_URL = 'https://amp.dev/page-experience/?url=';

/** @enum */
const DevToolsTab = {
  DEVICES: 'Devices',
  PAGE_SPEED: 'Page Speed',
  LOGS: 'Logs',
};

export class AmpStoryDevTools extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.win.document.title = `Story Dev-Tools (${this.win.document.title})`;

    /** @private {string} */
    this.storyUrl_ = this.win.location.href.split('#')[0];

    /** @private {Element} */
    this.containerEl_ = this.setUpLayout_();

    /** @private {DevToolsTab} */
    this.tab_ = null;

    // Services.extensionsFor(this.win).installExtensionForDoc(
    //   this.getAmpDoc(),
    //   'amp-story-player'
    // );

    this.loadFonts_();

    /** @private {!DevToolsLogTab} */
    this.logs_ = new DevToolsLogTab(buildLogsTabTemplate(this.element));

    /** @private {!DevToolsDevicesTab} */
    this.devices_ = new DevToolsDevicesTab(
      buildDevicesTabTemplate(this.element),
      this,
      this.storyUrl_
    );

    this.screenSizes_ = DEFAULT_SCREEN_SIZES;
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

    const queryHash = parseQueryString(this.win.location.hash);

    // Parse devices from hashString
    if (queryHash['devices']) {
      this.screenSizes_ = [];
      queryHash['devices'].split(';').forEach((device) => {
        const deviceSpecs = device.split(':');
        let currSpecs = null;
        if (deviceSpecs.length == 1) {
          currSpecs = ALL_SCREEN_SIZES.find((el) => {
            // Find first device that has prefix of the device name passed in.
            const currDeviceName = el.name
              .toLowerCase()
              .replace(/[^a-z0-9]/gi, '');
            const specDeviceName = deviceSpecs[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/gi, '');
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
          this.screenSizes_.push(currSpecs);
        }
      });
      this.devices_.setDevices(this.screenSizes_);
    }

    this.updateStoryUrl_(this.storyUrl_);

    // Go to tab in hashString
    const tabFromHash = queryHash['tab'];
    this.switchTab_(
      Object.values(DevToolsTab).find(
        (e) => e.toLowerCase().replace(' ', '-') === tabFromHash
      ) || DevToolsTab.DEVICES
    );
  }

  /**
   * Creates the layout of the inspector
   * @return {!Element}
   */
  setUpLayout_() {
    this.element.textContent = '';
    const container = buildContainerTemplate(this.element);
    this.element.appendChild(container);
    container.querySelector('#story-url').value = this.storyUrl_;
    container
      .querySelector('.i-amphtml-dev-tools-url-button')
      .addEventListener('click', () => {
        this.updateStoryUrl_(container.querySelector('#story-url').value);
      });
    this.element
      .querySelector('.i-amphtml-dev-tools-close')
      .addEventListener('click', () => {
        this.closeDevTools_();
      });
    return container;
  }

  /**
   *
   * @param {DevToolsTab} tab
   */
  switchTab_(tab) {
    this.tab_ = tab;
    toArray(
      this.element.querySelectorAll('.i-amphtml-dev-tools-tab')
    ).forEach((e) => e.remove());
    if (tab === DevToolsTab.DEVICES) {
      this.setUpDevicesTab_(this.containerEl_);
    } else if (tab === DevToolsTab.PAGE_SPEED) {
      this.setUpPageSpeedTab_(this.containerEl_);
    } else if (tab === DevToolsTab.LOGS) {
      this.setUpLogsTab_(this.containerEl_);
    } else {
      return;
    }
    toArray(
      this.element.querySelector('.i-amphtml-dev-tools-tabs').children
    ).forEach((e) => {
      return e.toggleAttribute('active', e.textContent === tab);
    });
  }

  /**
   * Creates the devices layouts
   * @param {!Element} container
   */
  setUpDevicesTab_(container) {
    const devicesContainer = this.devices_.getElement();
    container.appendChild(devicesContainer);
    this.devices_.recalculateLayout();
  }

  /**
   * @private
   * @param {string} storyUrl
   */
  updateStoryUrl_(storyUrl) {
    this.storyUrl_ = storyUrl;
    this.logs_.setStoryUrl(storyUrl);
    this.devices_.setStoryUrl(storyUrl);
    this.switchTab_(this.tab_);
  }

  /**
   * Creates the devices layouts
   * @param {!Element} container
   */
  setUpPageSpeedTab_(container) {
    const pageSpeedContainer = buildPageSpeedTabTemplate(this.element);
    container.appendChild(pageSpeedContainer);
    const iframe = pageSpeedContainer.getElementsByTagName('iframe')[0];
    iframe.src = PAGE_SPEED_URL + this.storyUrl_;
  }

  /**
   * Creates the devices layouts
   * @param {!Element} container
   */
  setUpLogsTab_(container) {
    const logsContainer = this.logs_.getElement();
    container.appendChild(logsContainer);
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
      .filter((e) => e[1])
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
    this.getViewport().onResize(() => this.devices_.recalculateLayout());
  }
}

AMP.extension('amp-story-dev-tools', '0.1', (AMP) => {
  AMP.registerElement('amp-story-dev-tools', AmpStoryDevTools, CSS);
});
