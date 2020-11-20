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

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @param {string} name
 * @return {!Element} the layout
 */
export function createTabElement(win, storyUrl, name) {
  const element = win.document.createElement('amp-story-dev-tools-tab');
  element.setAttribute('story-url', storyUrl);
  const innerTitle = win.document.createElement('h1');
  innerTitle.textContent = name;
  element.appendChild(innerTitle);
  return element;
}

const DEFAULT_DEVICES = 'iphone11discover;oneplus5t;pixel2';

const ALL_SCREEN_SIZES = [
  {
    'name': 'Pixel 2',
    'width': 411,
    'height': 605,
    'deviceHeight': 731,
  },
  {
    'name': 'Pixel 3',
    'width': 411,
    'height': 686,
    'deviceHeight': 823,
  },
  {
    'name': 'iPhone 8 (Chrome)',
    'width': 375,
    'height': 554,
    'deviceHeight': 667,
  },
  {
    'name': 'iPhone 8 (Discover)',
    'width': 375,
    'height': 632,
    'deviceHeight': 667,
  },
  {
    'name': 'iPhone 11 (Chrome)',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 (Discover)',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 Pro (Chrome)',
    'width': 375,
    'height': 635,
    'deviceHeight': 812,
  },
  {
    'name': 'iPhone 11 Pro (Discover)',
    'width': 375,
    'height': 713,
    'deviceHeight': 812,
  },
  {
    'name': 'iPad (Chrome)',
    'width': 810,
    'height': 1010,
    'deviceHeight': 1080,
  },
  {
    'name': 'OnePlus 5T',
    'width': 455,
    'height': 820,
    'deviceHeight': 910,
  },
  {
    'name': 'OnePlus 7 Pro',
    'width': 412,
    'height': 743,
    'deviceHeight': 892,
  },
  {
    'name': 'Desktop 1080p',
    'width': 1920,
    'height': 1080,
    'deviceHeight': 1080,
  },
];

/**
 * Method that returns lowercase and remove non-alphanumeric, used on matching hashString.
 * @param {string} name
 * @return {string}
 */
function simplifyDeviceName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

/**
 * Get devices from the queryHash into list of devices
 * @param {*} queryHash
 * @return {any[]}
 */
function parseDevices(queryHash) {
  const screenSizes = [];

  queryHash['devices'].split(';').forEach((device) => {
    const deviceSpecs = device.split(':');
    let currSpecs = null;
    if (deviceSpecs.length == 1) {
      currSpecs = ALL_SCREEN_SIZES.find((el) => {
        // Find first device that has prefix of the device name passed in.
        const currDeviceName = simplifyDeviceName(el.name);
        const specDeviceName = simplifyDeviceName(deviceSpecs[0]);
        return (
          currDeviceName.substring(0, specDeviceName.length) == specDeviceName
        );
      });
    }
    if (currSpecs) {
      screenSizes.push(currSpecs);
    }
  });
  return screenSizes;
}

/**
 * @typedef {{
 *  element: !Element,
 *  player: !Element
 *  chip: !Element,
 *  width: number,
 *  height: number,
 *  deviceHeight: ?number,
 *  custom: ?boolean,
 * }}
 */
export let DeviceInfo;

export class AmpStoryDevToolsTabPreview extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    this.element.classList.add('i-amphtml-story-dev-tools-tab');

    /** @private  {string} */
    this.storyUrl_ = element.getAttribute('story-url');

    /** @private {!Array<DeviceInfo>} */
    this.devices_ = parseDevices(
      this.element.getAttribute('devices') | DEFAULT_DEVICES
    );
  }

  /**
   * Builds the add device button
   * @private
   * @return {!Element}
   */
  buildAddDeviceButton_() {
    const addDeviceButton = buildDeviceChipTemplate(this.element);
    addDeviceButton.classList.add('i-amphtml-story-dev-tools-add-device');
    addDeviceButton.querySelector('span').textContent = 'ADD DEVICE';
    addDeviceButton.addEventListener('click', () => {
      this.showAddDevicePopup_();
    });
    return addDeviceButton;
  }

  /**
   * Builds the add device button
   * @private
   * @return {!Element}
   */
  buildHelpButton_() {
    const addDeviceButton = buildHelpButtonTemplate(this.element);
    addDeviceButton.classList.add('i-amphtml-story-dev-tools-button');
    addDeviceButton.classList.add('i-amphtml-story-dev-tools-help');
    addDeviceButton.querySelector('span').textContent = 'HELP';
    addDeviceButton.addEventListener('click', () => {
      this.showHelpPopup_();
    });
    return addDeviceButton;
  }

  /**
   * Creates a device layout for preview
   * @private
   * @param {DeviceInfo} device
   * @return {!Element}
   */
  createDeviceLayout_(device) {
    const deviceLayout = buildDeviceTemplate(this.element);
    deviceLayout.querySelector(
      '.i-amphtml-story-dev-tools-device-name'
    ).textContent = device.name ? device.name : 'Custom device';
    deviceLayout.querySelector(
      '.i-amphtml-story-dev-tools-device-specs'
    ).textContent = `${device.width} x ${device.height}`;
    const devicePlayer = deviceLayout.querySelector('amp-story-player');
    devicePlayer.setAttribute('width', device.width);
    devicePlayer.setAttribute('height', device.height);
    const storyA = devicePlayer.querySelector('a');
    storyA.textContent = 'Story 1';
    storyA.href = this.storyUrl_;
    this.playersManager_.addPlayer(devicePlayer);
    setStyles(devicePlayer, {
      width: device.width + 'px',
      height: device.height + 'px',
    });
    setStyles(
      deviceLayout.querySelector('.i-amphtml-story-dev-tools-device-screen'),
      {
        height: device.deviceHeight
          ? device.deviceHeight + 'px'
          : 'fit-content',
      }
    );
    device.player = devicePlayer;
    return deviceLayout;
  }

  /**
   * @private
   */
  updateDevicesInHash_() {
    const hashValue = this.devices_
      .map((device) => {
        if (device.custom) {
          return (
            `${device.width}:${device.height}` +
            (device.name ? ':' + device.name : '')
          );
        }
        return device.name.toLowerCase().replace(/[^a-z0-9]/gi, '');
      })
      .join(';');
    this.devTools_.updateHash({'devices': hashValue || ''});
  }
}
