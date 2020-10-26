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
import {Services} from '../../../src/services';
import {htmlFor} from '../../../src/static-template';
import {setStyles} from '../../../src/style';

const SCREEN_SIZES = [
  // {
  //   'name': 'OnePlus 7 Pro (Fullscreen)',
  //   'width': 412,
  //   'height': 892,
  //   'deviceHeight': 892,
  //   'ratio': '9:19.5',
  // },
  {
    'name': 'iPhone 11',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
    'ratio': '9 : 19.5',
    'platform': 'iOS Discover Feed',
  },
  {
    'name': 'iPhone 11',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
    'ratio': '9 : 19.5',
    'platform': 'iOS Chrome',
  },
  {
    'name': 'Pixel 2',
    'width': 411,
    'height': 605,
    'deviceHeight': 731,
    'ratio': '9 : 16',
    'platform': 'Android Chrome',
  },
  // {
  //   'name': 'iPad Pro',
  //   'width': 2048,
  //   'height': 2732,
  // },
];

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
 * Generates the template for a device.
 * @param {!Element} element
 * @return {!Element}
 */
const buildDeviceTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-dev-tools-device">
      <div class="i-amphtml-dev-tools-device-specs"></div>
      <div class="i-amphtml-dev-tools-device-name"></div>
      <amp-story-player width="1" height="1" layout="fixed">
        <a></a>
      </amp-story-player>
      <div class="i-amphtml-dev-tools-device-footer">
        <div></div>
      </div>
    </div>
  `;
};

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
        <span class="i-amphtml-dev-tools-brand">amp-story-dev-tools v0.1</span>
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
      </div>
      <div class="i-amphtml-dev-tools-devices"></div>
    </div>
  `;
};

export class AmpStoryDevTools extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.storyUrl_ = this.win.location.href.replace('#devTools=true', '');

    /** @private {Element} */
    this.containerEl_ = this.setUpLayout_();

    // this.setUpDevices_(this.containerEl_);

    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-player'
    );

    this.loadFonts_();
  }

  /** @override */
  buildCallback() {
    this.setUpDevices_(this.containerEl_);
  }

  /** @override */
  layoutCallback() {}

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
    return container;
  }

  /**
   * Creates the devices layouts
   * @param {!Element} container
   */
  setUpDevices_(container) {
    container = this.containerEl_;
    const devicesContainer = container.querySelector(
      '.i-amphtml-dev-tools-devices'
    );
    devicesContainer.textContent = '';
    SCREEN_SIZES.forEach((device) => {
      devicesContainer.appendChild(this.createDeviceLayout_(device));
    });
  }

  /**
   * Creates a device layout for preview
   * @private
   * @param {*} device
   * @return {!Element}
   */
  createDeviceLayout_(device) {
    const deviceLayout = buildDeviceTemplate(this.element);
    deviceLayout.querySelector('.i-amphtml-dev-tools-device-name').textContent =
      device.name;
    deviceLayout.querySelector(
      '.i-amphtml-dev-tools-device-specs'
    ).textContent = device.ratio + '  -  ' + device.platform;
    const devicePlayer = deviceLayout.querySelector('amp-story-player');
    devicePlayer.setAttribute('width', device.width);
    devicePlayer.setAttribute('height', device.height);
    devicePlayer.addEventListener('storyNavigation', (res) => {
      console.log(res.detail.pageId);
    });
    const storyA = devicePlayer.querySelector('a');
    storyA.textContent = 'Story 1';
    storyA.href = this.storyUrl_;
    setStyles(devicePlayer, {
      width: device.width + 'px',
      height: device.height + 'px',
    });
    setStyles(deviceLayout, {
      height: device.deviceHeight + 'px',
    });
    console.log(deviceLayout);
    return deviceLayout;
  }

  /**
   * @private
   * @param {string} storyUrl
   */
  updateStoryUrl_(storyUrl) {
    this.storyUrl_ = storyUrl;
    this.setUpDevices_();
  }

  // /** @private */
  // addReturnButton_() {
  //   const returnButton = this.win.document.createElement('a');
  //   returnButton.href = this.storyUrl_;
  //   returnButton.classList.add('i-amphtml-devtools-return');
  //   returnButton.textContent = 'return to story';
  //   returnButton.onclick = () => {
  //     this.win.location.assign(this.storyUrl_);
  //     this.win.location.reload();
  //   };
  //   this.element.appendChild(returnButton);
  // }

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
