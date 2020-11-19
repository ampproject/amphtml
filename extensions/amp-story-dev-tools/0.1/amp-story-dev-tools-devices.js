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
import {escapeCssSelectorIdent} from '../../../src/css';
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

const BEST_PRACTICES_URL =
  'https://developers.google.com/search/docs/guides/web-stories-creation-best-practices';

const LEARN_MORE_WEBSTORIES_URL = 'https://amp.dev/about/stories/';

const AMP_TEST_URL = 'https://search.google.com/test/amp?&url=';

const WEBSTORIES_GOOGLE_URL =
  'https://developers.google.com/search/docs/guides/enable-web-stories';

const buildDevicesTabTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div
    class="i-amphtml-story-dev-tools-devices i-amphtml-story-dev-tools-tab"
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
    <div class="i-amphtml-story-dev-tools-device">
      <div class="i-amphtml-story-dev-tools-device-screen">
        <div class="i-amphtml-story-dev-tools-device-specs"></div>
        <div class="i-amphtml-story-dev-tools-device-name"></div>
        <div class="lds-dual-ring"></div>
        <amp-story-player width="1" height="1" layout="fixed">
          <a></a>
        </amp-story-player>
        <div class="i-amphtml-story-dev-tools-device-footer">
          <div></div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generates the template for a device chip.
 * @param {!Element} element
 * @return {!Element}
 */
const buildDeviceChipTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <span class="i-amphtml-story-dev-tools-device-chip">
      <span>Name</span>
      <svg
        title="cross"
        class="i-amphtml-story-dev-tools-device-remove"
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
 * Generates the template for a help button.
 * @param {!Element} element
 * @return {!Element}
 */
const buildHelpButtonTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <span class="i-amphtml-story-dev-tools-button">
      <span>HELP</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 8 14"
        fill="none"
      >
        <path
          d="M2.97362 9.56098V8.7832C2.97362 8.15086 3.10152 7.61969 3.35731 7.1897C3.61311 6.74706 4.05436 6.25384 4.68106 5.71003C5.06475 5.36856 5.3717 5.05239 5.60192 4.76152C5.83213 4.458 5.94724 4.08491 5.94724 3.64228C5.94724 3.1617 5.77458 2.757 5.42926 2.42818C5.09672 2.09937 4.6235 1.93496 4.00959 1.93496C3.39568 1.93496 2.91607 2.11834 2.57074 2.4851C2.22542 2.83921 1.98241 3.22493 1.84173 3.64228L0 2.88347C0.140687 2.45348 0.377298 2.01716 0.709832 1.57453C1.04237 1.11924 1.47722 0.746161 2.01439 0.455285C2.56435 0.151762 3.22302 0 3.99041 0C4.78337 0 5.48042 0.158085 6.08154 0.474255C6.69544 0.790425 7.16867 1.22042 7.5012 1.76423C7.83373 2.29539 8 2.90244 8 3.58537C8 4.09124 7.90408 4.5402 7.71223 4.93225C7.53317 5.3243 7.30296 5.67209 7.02158 5.97561C6.753 6.27913 6.49081 6.55104 6.23501 6.79133C5.81295 7.17073 5.51239 7.51852 5.33333 7.83469C5.15428 8.15086 5.06475 8.54291 5.06475 9.01084V9.56098H2.97362ZM4.00959 14C3.60032 14 3.255 13.8609 2.97362 13.5827C2.70504 13.3044 2.57074 12.9693 2.57074 12.5772C2.57074 12.1852 2.70504 11.85 2.97362 11.5718C3.255 11.2936 3.60032 11.1545 4.00959 11.1545C4.40608 11.1545 4.73861 11.2936 5.00719 11.5718C5.28857 11.85 5.42926 12.1852 5.42926 12.5772C5.42926 12.9693 5.28857 13.3044 5.00719 13.5827C4.73861 13.8609 4.40608 14 4.00959 14Z"
          fill="black"
        />
      </svg>
    </span>
  `;
};

/**
 * Generates the template for the help dialog.
 * @param {!Element} element
 * @return {!Element}
 */
const buildHelpPopupTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-dev-tools-device-popup-bg">
      <div class="i-amphtml-story-dev-tools-device-popup-container">
        <h1>Quick tip</h1>
        <div class="i-amphtml-story-dev-tools-device-popup-help-tips">
          <p>
            You can simply add #development=1 to the end of your Web Story URL
            to access the Web Stories Dev-Tools.
          </p>
          <span>https://yourstory.com<b>#development=1</b></span>
        </div>
        <h1>Helpful links</h1>
        <a
          target="_blank"
          href="https://developers.google.com/search/docs/guides/web-stories-creation-best-practices"
          >Best practices for creating Web Stories
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M15.9998 10.6667L15.0598 11.6067L18.7798 15.3333H10.6665V16.6667H18.7798L15.0598 20.3933L15.9998 21.3333L21.3332 16L15.9998 10.6667Z"
              fill="white"
            /></svg
        ></a>
        <a target="_blank" href="https://amp.dev/about/stories/"
          >Learn more about Web Stories<svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M15.9998 10.6667L15.0598 11.6067L18.7798 15.3333H10.6665V16.6667H18.7798L15.0598 20.3933L15.9998 21.3333L21.3332 16L15.9998 10.6667Z"
              fill="white"
            /></svg
        ></a>
        <a
          target="_blank"
          href="https://search.google.com/test/amp?url="
          class="i-amphtml-story-dev-tools-help-search-preview-link"
          >Web Stories Google Search Preview Tool<svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M15.9998 10.6667L15.0598 11.6067L18.7798 15.3333H10.6665V16.6667H18.7798L15.0598 20.3933L15.9998 21.3333L21.3332 16L15.9998 10.6667Z"
              fill="white"
            /></svg
        ></a>
        <a
          target="_blank"
          href="https://developers.google.com/search/docs/guides/enable-web-stories"
          >Web Stories on Google<svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M15.9998 10.6667L15.0598 11.6067L18.7798 15.3333H10.6665V16.6667H18.7798L15.0598 20.3933L15.9998 21.3333L21.3332 16L15.9998 10.6667Z"
              fill="white"
            /></svg
        ></a>
        <svg
          title="cross"
          class="i-amphtml-story-dev-tools-device-popup-close"
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
    </div>
  `;
};

/**
 * Generates the template for the add device dialog.
 * @param {!Element} element
 * @return {!Element}
 */
const buildAddDevicePopupTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-dev-tools-device-popup-bg">
      <div
        class="i-amphtml-story-dev-tools-device-popup-container i-amphtml-story-dev-tools-device-popup-add-devices"
      >
        <h1>Mobile</h1>
        <div class="i-amphtml-story-dev-tools-device-popup-mobile"></div>
        <h1>Tablet</h1>
        <div class="i-amphtml-story-dev-tools-device-popup-tablet"></div>
        <h1>Desktop</h1>
        <div class="i-amphtml-story-dev-tools-device-popup-desktop"></div>
        <svg
          title="cross"
          class="i-amphtml-story-dev-tools-device-popup-close"
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
    </div>
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
      'i-amphtml-story-dev-tools-device-chips-container'
    );
    this.element.appendChild(chipListContainer);

    const chipList = this.element.ownerDocument.createElement('span');
    chipList.classList.add('i-amphtml-story-dev-tools-device-chips');
    chipListContainer.appendChild(chipList);

    chipListContainer.appendChild(this.buildAddDeviceButton_());
    chipListContainer.appendChild(this.buildHelpButton_());

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
      .querySelector('.i-amphtml-story-dev-tools-device-chips')
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
      this.element.querySelectorAll('.i-amphtml-story-dev-tools-device')
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
    const popup = buildAddDevicePopupTemplate(this.element);
    popup
      .querySelector('.i-amphtml-story-dev-tools-device-popup-close')
      .addEventListener('click', () => {
        setTimeout(() => {
          popup.remove();
        }, 200);
        popup.removeAttribute('active');
      });
    const sections = ['mobile', 'tablet', 'desktop'].reduce((obj, section) => {
      obj[section] = popup.querySelector(
        `.i-amphtml-story-dev-tools-device-popup-${escapeCssSelectorIdent(
          section
        )}`
      );
      return obj;
    }, {});
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
      let chipSection = sections['mobile'];
      if (device.width / device.height > 1) {
        chipSection = sections['desktop'];
      } else if (device.width / device.height > 0.75) {
        chipSection = sections['tablet'];
      }
      chipSection.appendChild(deviceChip);
    });

    // Add popup to screen.
    this.element.appendChild(popup);
    setTimeout(() => {
      popup.setAttribute('active', '');
    }, 1);
  }

  /**
   * @private
   */
  showHelpPopup_() {
    const popup = buildHelpPopupTemplate(this.element);
    popup
      .querySelector('.i-amphtml-story-dev-tools-device-popup-close')
      .addEventListener('click', () => {
        setTimeout(() => {
          popup.remove();
        }, 200);
        popup.removeAttribute('active');
      });

    popup.querySelector(
      '.i-amphtml-story-dev-tools-help-search-preview-link'
    ).href += this.storyUrl_;

    // Add popup to screen
    this.element.appendChild(popup);
    setTimeout(() => {
      popup.setAttribute('active', '');
    }, 1);
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
