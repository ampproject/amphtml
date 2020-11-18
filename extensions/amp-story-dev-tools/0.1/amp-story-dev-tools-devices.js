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
import {AmpStoryPlayer} from '../../../src/amp-story-player/amp-story-player-impl';
import {htmlFor} from '../../../src/static-template';
import {setStyles} from '../../../src/style';
import {toArray} from '../../../src/types';

export const DEFAULT_SCREEN_SIZES = [
  {
    'name': 'iPhone 11 (Discover)',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 (Chrome)',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
  },
  {
    'name': 'Pixel 2',
    'width': 411,
    'height': 605,
    'deviceHeight': 731,
  },
];

export const ALL_SCREEN_SIZES = [
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

const buildDevicesTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div
    class="i-amphtml-dev-tools-devices i-amphtml-dev-tools-tab"
  ></div>`;
};

/**
 * Generates the template for a device.
 * @param {!Element} element
 * @return {!Element}
 */
const buildDeviceTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-dev-tools-device">
      <div class="i-amphtml-dev-tools-device-screen">
        <div class="i-amphtml-dev-tools-device-specs"></div>
        <div class="i-amphtml-dev-tools-device-name"></div>
        <div class="lds-dual-ring"></div>
        <amp-story-player width="1" height="1" layout="fixed">
          <a></a>
        </amp-story-player>
        <div class="i-amphtml-dev-tools-device-footer">
          <div></div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generates the template for a device.
 * @param {!Element} element
 * @return {!Element}
 */
const buildDeviceChipTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <span class="i-amphtml-dev-tools-device-chip">
      <span>Name</span>
      <svg
        title="cross"
        class="i-amphtml-dev-tools-device-remove"
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
    </span>
  `;
};

/**
 * Generates the template for a device.
 * @param {!Element} element
 * @return {!Element}
 */
const buildAddDevicePopupTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-dev-tools-device-popup-bg">
      <div class="i-amphtml-dev-tools-device-popup-container">
      <svg
      title="cross"
      class="i-amphtml-dev-tools-device-popup-close"
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
    </span>
  `;
};

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

export class DevToolsDevicesTab extends AmpStoryDevToolsTab {
  /**
   * @param {!Element} element the element that will be used to log everything.
   * @param {!Element} win
   * @param {!AmpStoryDevTools} devTools
   * @param {string} storyUrl
   * @param {!Array<DeviceInfo>} devices
   */
  constructor(element, win, devTools, storyUrl, devices) {
    super(buildDevicesTabTemplate(element), win, devTools, storyUrl);

    /** @private {!Array<DeviceInfo>} */
    this.devices_ = devices;

    /** @private {?PlayersManager} */
    this.playersManager_ = null;
  }

  /**
   * Creates the devices layouts
   * @private
   */
  setUpTab_() {
    this.element.textContent = '';
    const chipListContainer = this.element.ownerDocument.createElement('div');
    chipListContainer.classList.add(
      'i-amphtml-dev-tools-device-chips-container'
    );
    this.element.appendChild(chipListContainer);

    const chipList = this.element.ownerDocument.createElement('span');
    chipList.classList.add('i-amphtml-dev-tools-device-chips');
    chipListContainer.appendChild(chipList);

    chipListContainer.appendChild(this.buildAddDeviceButton_());

    const devicesList = this.devices_;
    this.devices_ = [];
    this.playersManager_ = new PlayersManager(this.win_, this.storyUrl_);
    devicesList.forEach((device) => {
      this.addDevice_(device);
    });
  }

  /**
   * Builds the add device button
   * @private
   * @return {!Element}
   */
  buildAddDeviceButton_() {
    const addDeviceButton = buildDeviceChipTemplate(this.element);
    addDeviceButton.classList.add('i-amphtml-dev-tools-add-device');
    addDeviceButton.querySelector('span').textContent = 'ADD DEVICE';
    addDeviceButton.addEventListener('click', () => {
      this.showAddDevicePopup_();
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
      '.i-amphtml-dev-tools-device-name'
    ).textContent = device.name ? device.name : 'Custom device';
    deviceLayout.querySelector(
      '.i-amphtml-dev-tools-device-specs'
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
      deviceLayout.querySelector('.i-amphtml-dev-tools-device-screen'),
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

  /**
   * @param {DeviceInfo} device
   * @return {!Element} the device chip
   */
  addDeviceChip_(device) {
    const deviceChip = buildDeviceChipTemplate(this.element);
    deviceChip.querySelector('span').textContent = device.name;
    deviceChip.querySelector('svg').addEventListener('click', () => {
      this.removeDevice_(device);
      this.updateDevicesInHash_();
    });
    this.element
      .querySelector('.i-amphtml-dev-tools-device-chips')
      .appendChild(deviceChip);
    return deviceChip;
  }

  /**
   * @private
   * @param {DeviceInfo} deviceSpecs
   */
  addDevice_(deviceSpecs) {
    const deviceLayout = this.createDeviceLayout_(deviceSpecs, this.storyUrl_);
    deviceSpecs.element = deviceLayout;
    this.element.appendChild(deviceLayout);
    this.devices_.push(deviceSpecs);
    deviceSpecs.chip = this.addDeviceChip_(deviceSpecs);
    this.onLayoutChanged();
    console.log(this.devices_);
  }

  /**
   * @private
   * @param {DeviceInfo} device
   */
  removeDevice_(device) {
    device.chip.setAttribute('inactive', '');
    setTimeout(() => {
      device.chip.remove();
    }, 200);
    this.playersManager_.removePlayer(device.player);
    this.devices_ = this.devices_.filter((d) => d != device);
    device.element.remove();
    this.onLayoutChanged();
  }

  /**
   * @override
   */
  getElement() {
    return this.element;
  }

  /**
   * @override
   */
  onTabAttached() {
    this.setUpTab_();
    this.onLayoutChanged();
  }

  /**
   * @override
   */
  onLayoutChanged() {
    let sumDeviceWidths = 0;
    let maxDeviceHeights = 0;
    this.devices_.forEach((deviceSpecs) => {
      sumDeviceWidths += deviceSpecs.width;
      maxDeviceHeights = Math.max(
        maxDeviceHeights,
        deviceSpecs.deviceHeight || deviceSpecs.height + 100
      );
    });
    const scale = Math.min(
      (this.element./*OK*/ clientWidth / sumDeviceWidths) * 0.9,
      (this.element./*OK*/ clientHeight / maxDeviceHeights) * 0.8
    );
    let cumWidthSum = 0;
    const paddingSize =
      (this.element./*OK*/ clientWidth - sumDeviceWidths * scale) /
      (this.devices_.length + 1);
    toArray(
      this.element.querySelectorAll('.i-amphtml-dev-tools-device')
    ).forEach((deviceLayout, i) => {
      const deviceSpecs = this.devices_[i];
      const scaleWidthChange = deviceSpecs.width * (scale - 1) * 0.5; // Accounts for width change on scaling
      const cumPaddings = (i + 1) * paddingSize;
      const leftOffset = cumPaddings + cumWidthSum + scaleWidthChange;
      setStyles(deviceLayout, {
        'transform': `perspective(100px) translateZ(${
          (100 * (scale - 1)) / scale
        }px)`,
        'left': leftOffset + 'px',
      });
      cumWidthSum += deviceSpecs.width * scale;
    });
  }

  /**
   * @private
   */
  showAddDevicePopup_() {
    this.element.classList.add('i-amphtml-dev-tools-tab-blurred');
    const popup = buildAddDevicePopupTemplate(this.element);
    popup
      .querySelector('.i-amphtml-dev-tools-device-popup-close')
      .addEventListener('click', () => {
        popup.remove();
        this.element.classList.remove('i-amphtml-dev-tools-tab-blurred');
      });
    const chipsContainer = popup.querySelector(
      '.i-amphtml-dev-tools-device-popup-container'
    );
    ALL_SCREEN_SIZES.forEach((device) => {
      const deviceChip = buildDeviceChipTemplate(this.element);
      let correspondingDevice = this.devices_.find(
        (d) => d.name == device.name
      );
      if (!correspondingDevice) {
        deviceChip.setAttribute('inactive', '');
      }
      deviceChip.querySelector('span').textContent = device.name;
      deviceChip.querySelector('svg').addEventListener('click', () => {
        if (deviceChip.hasAttribute('inactive')) {
          deviceChip.removeAttribute('inactive');
          correspondingDevice = {...device};
          this.addDevice_(correspondingDevice);
          this.updateDevicesInHash_();
        } else {
          deviceChip.setAttribute('inactive', '');
          this.removeDevice_(correspondingDevice);
          correspondingDevice = null;
          this.updateDevicesInHash_();
        }
      });
      chipsContainer.appendChild(deviceChip);
    });
    this.element.appendChild(popup);
  }
}

/**
 * Manages the players to keep them synced on the same page.
 */
class PlayersManager {
  /**
   * Makes a players manager
   * @param {!Element} win
   * @param {string} storyUrl
   */
  constructor(win, storyUrl) {
    /** @private {!AmpStoryPlayer[]} list of players being synced */
    this.players_ = [];

    this.win_ = win;

    this.storyUrl_ = storyUrl;

    /** @private {?string} */
    this.lastPageId_ = null;
  }

  /**
   * Adds the player and sets up listeners
   * @public
   * @param {!Element} player
   */
  addPlayer(player) {
    player.classList.add('i-amphtml-element');
    const playerImpl = new AmpStoryPlayer(this.win_, player);
    player.addEventListener('ready', () => {
      if (this.lastPageId_ != null) {
        playerImpl.show(this.storyUrl_, this.lastPageId_);
      }
    });
    playerImpl.load();
    this.registerPlayerListeners_(player);
    this.players_.push(playerImpl);
  }

  /**
   * Registers listeners on player
   * @private
   * @param {!Element} player
   */
  registerPlayerListeners_(player) {
    player.removeEventListener('storyNavigation', this.navigateTo_);
    player.navigationListener = player.addEventListener(
      'storyNavigation',
      (e) => this.navigateTo_(e)
    );
  }

  /**
   * Removes the player from the list of synced players.
   * @public
   * @param {Element} player
   */
  removePlayer(player) {
    this.players_ = this.players_.filter((p) => p != player);
  }

  /**
   * Navigates all the players to the pageId in the event
   * @private
   * @param {Event} event
   */
  navigateTo_(event) {
    if (this.lastPageId_ == event.detail.pageId) {
      return;
    }
    this.lastPageId_ = event.detail.pageId;
    this.players_.forEach((p) => {
      p.show(null, event.detail.pageId);
    });
  }
}
