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

/**
 * Generates the template for a device.
 * @param {!Element} element
 * @return {!Element}
 */
const buildDeviceTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-dev-tools-device">
      <svg
        title="Remove device"
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
  `;
};

export class DevToolsDevicesTab {
  /**
   * @param {!Element} element the element that will be used to log everything.
   * @param {!AmpStoryDevTools} parent
   * @param {string} url
   */
  constructor(element, parent, url) {
    this.element = element;

    this.devices_ = DEFAULT_SCREEN_SIZES;

    this.storyUrl_ = url;

    this.parent = parent;

    this.playersManager_ = new PlayersManager(this.parent.win);
  }

  /**
   * @public
   * @param {string} url
   */
  setStoryUrl(url) {
    this.setUpTab_(url);
  }

  /**
   * Creates the devices layouts
   * @param {string} url
   */
  setUpTab_(url) {
    this.storyUrl_ = url;
    this.element.textContent = '';
    this.element.appendChild(this.buildAddDeviceButton());
    this.devices_.forEach((device) => {
      const deviceLayout = this.createDeviceLayout_(
        device,
        url + '#ignoreLocalStorageHistory=true'
      );
      this.element.appendChild(deviceLayout);
      device.element = deviceLayout;
    });
  }

  /**
   * Builds the add device button
   * @return {!Element}
   */
  buildAddDeviceButton() {
    // Create select with an 'Add device' option by default.
    const deviceSelect = this.element.ownerDocument.createElement('select');
    const addDevicesOption = this.element.ownerDocument.createElement('option');
    addDevicesOption.textContent = 'Add device';
    addDevicesOption.value = '';
    deviceSelect.appendChild(addDevicesOption);
    ALL_SCREEN_SIZES.forEach((size) => {
      const optionEl = this.element.ownerDocument.createElement('option');
      optionEl.value = size.name;
      optionEl.textContent = `${size.name} - ${size.width} x ${size.height}`;
      deviceSelect.appendChild(optionEl);
    });
    deviceSelect.value = '';
    deviceSelect.addEventListener('change', () => {
      const newDevice = ALL_SCREEN_SIZES.find(
        (e) => e.name === deviceSelect.value
      );
      if (newDevice) {
        // Copy specs so object in ALL_SCREEN_SIZES is not modified
        const deviceSpecsCopy = {...newDevice};
        const deviceLayout = this.createDeviceLayout_(
          newDevice,
          this.storyUrl_
        );
        deviceSpecsCopy.element = deviceLayout;
        this.element.appendChild(deviceLayout);
        this.devices_.push(deviceSpecsCopy);
        this.updateDevicesInHash_();
        deviceSelect.value = '';
        this.recalculateLayout();
      }
    });
    return deviceSelect;
  }

  /**
   * Creates a device layout for preview
   * @private
   * @param {*} device
   * @param {string} url
   * @return {!Element}
   */
  createDeviceLayout_(device, url) {
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
    storyA.href = url;
    this.playersManager_.addPlayer(devicePlayer);
    setStyles(devicePlayer, {
      width: device.width + 'px',
      height: device.height + 'px',
    });
    setStyles(deviceLayout, {
      height: device.deviceHeight ? device.deviceHeight + 'px' : 'fit-content',
    });

    deviceLayout
      .querySelector('.i-amphtml-dev-tools-device-remove')
      .addEventListener('click', () => {
        this.devices_ = this.devices_.filter((d) => d.element != deviceLayout);
        deviceLayout.remove();
        this.updateDevicesInHash_();
        this.recalculateLayout();
      });
    return deviceLayout;
  }

  /**
   * @public
   * @param {any} devices List of devices
   */
  setDevices(devices) {
    this.devices_ = devices;
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
    this.parent.updateHash({'devices': hashValue});
  }

  /**
   * Returns the root element of the logs.
   * @return {!Element}
   */
  getElement() {
    return this.element;
  }

  /**
   * Gets the sizes of the devices and tab, and scales the devices to leave 10% of gap in both axes.
   * Also calculates the left position of the devices in absolute units
   * @public
   */
  recalculateLayout() {
    let maxDeviceWidths = 0;
    let maxDeviceHeights = 0;
    this.devices_.forEach((deviceSpecs) => {
      maxDeviceWidths += deviceSpecs.width;
      maxDeviceHeights = Math.max(
        maxDeviceHeights,
        deviceSpecs.deviceHeight || deviceSpecs.height + 100
      );
    });
    const scale = Math.min(
      (this.element.clientWidth / maxDeviceWidths) * 0.9,
      (this.element.clientHeight / maxDeviceHeights) * 0.8
    );
    let cumWidthSum = 0;
    const paddingSize =
      (this.element.clientWidth - maxDeviceWidths * scale) /
      (this.devices_.length + 1);
    toArray(
      this.element.querySelectorAll('.i-amphtml-dev-tools-device')
    ).forEach((deviceLayout, i) => {
      const deviceSpecs = this.devices_[i];
      const scaleWidthChange = deviceSpecs.width * (scale - 1) * 0.5; // Accounts for width change on scaling
      const cumPaddings = (i + 1) * paddingSize;
      const leftOffset = cumPaddings + cumWidthSum + scaleWidthChange;
      setStyles(deviceLayout, {
        'transform': `scale(${scale})`,
        'left': leftOffset + 'px',
      });
      cumWidthSum += deviceSpecs.width * scale;
    });
  }
}

/**
 * Manages the players to keep them synced on the same page.
 */
class PlayersManager {
  /**
   * Makes a players manager
   * @param win
   */
  constructor(win) {
    this.players_ = [];

    this.win_ = win;
  }

  /**
   * Adds the player and sets up listeners
   * @param {AmpStoryPlayer} player
   */
  addPlayer(player) {
    player.classList.add('i-amphtml-element');
    const playerImpl = new AmpStoryPlayer(this.win_, player);
    playerImpl.load();
    this.players_.push({
      'player': playerImpl,
      'progress': 0,
      'lastInteraction': new Date().getTime(),
    });
    this.registerPlayerListeners_(playerImpl);
  }

  /**
   * Registers listeners on player
   * @private
   * @param {AmpStoryPlayer} player
   */
  registerPlayerListeners_(player) {
    console.log('registering player', player);
    player.element_.addEventListener('storyNavigation', (event) => {
      console.log(event, player);
      const {progress} = event.detail;
      const currPlayer = this.players_.find((p) => p.player == player);
      currPlayer.progress = progress;
      const time = new Date().getTime();
      if (time - currPlayer.lastInteraction > 50) {
        setTimeout(() => {
          this.players_.forEach((p) => {
            if (p.player != player) {
              if (p.progress < progress) {
                p.player.go(0, 1);
                console.log(p);
              } else if (p.progress > progress) {
                p.player.go(0, -1);
                console.log(p);
              }
            }
            p.progress = progress;
            p.lastInteraction = time;
          });
        }, 0);
      } else {
        console.log('supressed event', time - currPlayer.lastInteraction);
      }
    });
    console.log(this.players_);
  }

  /**
   * Removes the player from the list of synced players.
   * @param {AmpStoryPlayer} player
   */
  removePlayer(player) {
    this.players_ = this.players_.filter((p) => p.player != player);
  }
}
