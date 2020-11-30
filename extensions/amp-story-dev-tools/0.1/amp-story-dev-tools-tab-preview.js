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
import {
  addAttributeAfterTimeout,
  removeAfterTimeout,
  updateHash,
} from './utils';
import {closest} from '../../../src/dom';
import {escapeCssSelectorIdent} from '../../../src/css';
import {htmlFor} from '../../../src/static-template';
import {setStyles} from '../../../src/style';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @param {?string} devices
 * @return {!Element} the layout
 */
export function createTabPreviewElement(win, storyUrl, devices) {
  const element = win.document.createElement('amp-story-dev-tools-tab-preview');
  element.setAttribute('story-url', storyUrl);
  devices ? element.setAttribute('devices', devices) : null;
  return element;
}

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
        <amp-story-player width="1" height="1" layout="container">
          <a></a>
        </amp-story-player>
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
    <span
      class="i-amphtml-story-dev-tools-device-chip"
      data-action="toggleDeviceChip"
    >
      <span class="i-amphtml-story-dev-tools-device-chip-name">Name</span>
      <svg
        title="cross"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        width="18px"
        height="18px"
      >
        <rect width="20" height="3" x="2" y="10.5"></rect>
        <rect
          width="3"
          height="20"
          x="10.5"
          y="2"
          class="i-amphtml-story-dev-tools-device-chip-add-stick"
        ></rect>
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
    <span
      class="i-amphtml-story-dev-tools-button i-amphtml-story-dev-tools-button-help"
    >
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
const buildHelpDialogTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-dev-tools-device-dialog-bg"
      data-action="closeDialog"
    >
      <div
        class="i-amphtml-story-dev-tools-device-dialog-container"
        data-action="ignore"
      >
        <h1>Quick tip</h1>
        <div class="i-amphtml-story-dev-tools-device-dialog-help-tips">
          <p>
            You can simply add #development=1 to the end of your Web Story URL
            to access the Web Stories Dev-Tools.
          </p>
          <span>https://yourstory.com<b>#development=1</b></span>
        </div>
        <h1>Helpful links</h1>
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link"
          target="_blank"
          href="https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/"
          ><span>Best practices for creating a successful Web Story</span>
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
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link"
          target="_blank"
          href="https://amp.dev/about/stories/"
          ><span>Learn more about Web Stories</span
          ><svg
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
          class="i-amphtml-story-dev-tools-device-dialog-link i-amphtml-story-dev-tools-help-search-preview-link"
          target="_blank"
          href="https://search.google.com/test/amp?url="
          ><span>Web Stories Google Search Preview Tool</span
          ><svg
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
          data-action="closeDialog"
          class="i-amphtml-story-dev-tools-device-dialog-close"
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
const buildAddDeviceDialogTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-dev-tools-device-dialog-bg"
      data-action="closeDialog"
    >
      <div
        class="i-amphtml-story-dev-tools-device-dialog-container i-amphtml-story-dev-tools-device-dialog-add-devices"
        data-action="ignore"
      >
        <h1>Mobile</h1>
        <div class="i-amphtml-story-dev-tools-device-dialog-mobile"></div>
        <h1>Tablet</h1>
        <div class="i-amphtml-story-dev-tools-device-dialog-tablet"></div>
        <h1>Desktop</h1>
        <div class="i-amphtml-story-dev-tools-device-dialog-desktop"></div>
        <svg
          title="cross"
          data-action="closeDialog"
          class="i-amphtml-story-dev-tools-device-dialog-close"
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
 * }}
 * Contains the data related to the device.
 * Width and height refer to the story viewport, while deviceHeight is the device screen height.
 */
export let DeviceInfo;

const DEFAULT_DEVICES = 'iphone11native;oneplus5t;pixel2';

const ALL_DEVICES = [
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
    'name': 'iPhone 8 (Browser)',
    'width': 375,
    'height': 554,
    'deviceHeight': 667,
  },
  {
    'name': 'iPhone 8 (Native)',
    'width': 375,
    'height': 632,
    'deviceHeight': 667,
  },
  {
    'name': 'iPhone 11 (Browser)',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 (Native)',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 Pro (Browser)',
    'width': 375,
    'height': 635,
    'deviceHeight': 812,
  },
  {
    'name': 'iPhone 11 Pro (Native)',
    'width': 375,
    'height': 713,
    'deviceHeight': 812,
  },
  {
    'name': 'iPad (Browser)',
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
 *
 * Simplifies the string so that it's easier to match devices regardless of symbols or casing.
 * Eg: `iPhone 11 Pro (Native) -> iphone11pronative`
 * @param {string} name
 * @return {string}
 */
function simplifyDeviceName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

/**
 * Get devices from the element attribute into list of devices.
 *
 * Uses simplifyDeviceName function to match the names passed on the attribute,
 * finding the first device in the list of ALL_DEVICES that starts with the string passed.
 * Eg: `devices="ipad;iphone"` will find the ipad and also the first device in ALL_DEVICES
 * that starts with "iphone" (ignoring case and symbols).
 * @param {string} queryHash
 * @return {any[]}
 */
function parseDevices(queryHash) {
  const screenSizes = [];

  queryHash.split(';').forEach((deviceName) => {
    let currSpecs = null;
    currSpecs = ALL_DEVICES.find((el) => {
      // Find first device that has prefix of the device name passed in.
      const currDeviceName = simplifyDeviceName(el.name);
      const specDeviceName = simplifyDeviceName(deviceName);
      return (
        currDeviceName.substring(0, specDeviceName.length) === specDeviceName
      );
    });
    if (currSpecs) {
      screenSizes.push(currSpecs);
    }
  });
  return screenSizes;
}

/** @enum {string} */
const PREVIEW_ACTIONS = {
  SHOW_HELP_DIALOG: 'showHelpDialog',
  SHOW_ADD_DEVICE_DIALIG: 'showAddDeviceDialog',
  CLOSE_DIALOG: 'closeDialog',
  REMOVE_DEVICE: 'removeDevice',
  TOGGLE_DEVICE_CHIP: 'toggleDeviceChip',
};

export class AmpStoryDevToolsTabPreview extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    /** @private  {?string} */
    this.storyUrl_ = null;

    /** @private {!Array<DeviceInfo>} */
    this.devices_ = [];

    /** @private {?Element} the current dialog being shown or null if none are active. */
    this.currentDialog_ = null;
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');
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

    parseDevices(
      this.element.getAttribute('devices') || DEFAULT_DEVICES
    ).forEach((device) => {
      this.addDevice_(device.name);
    });
  }

  /** @override */
  layoutCallback() {
    this.element.addEventListener('click', (e) => this.handleTap_(e.target));
  }

  /**
   * Builds the add device button
   * @private
   * @return {!Element}
   */
  buildAddDeviceButton_() {
    const addDeviceButton = buildDeviceChipTemplate(this.element);
    addDeviceButton.classList.add('i-amphtml-story-dev-tools-add-device');
    addDeviceButton.classList.add('i-amphtml-story-dev-tools-button');
    addDeviceButton.setAttribute(
      'data-action',
      PREVIEW_ACTIONS.SHOW_ADD_DEVICE_DIALIG
    );
    addDeviceButton.querySelector(
      '.i-amphtml-story-dev-tools-device-chip-name'
    ).textContent = 'ADD DEVICE';
    return addDeviceButton;
  }

  /**
   * Builds the add device button
   * @private
   * @return {!Element}
   */
  buildHelpButton_() {
    const addHelpButton = buildHelpButtonTemplate(this.element);
    addHelpButton.setAttribute('data-action', PREVIEW_ACTIONS.SHOW_HELP_DIALOG);
    return addHelpButton;
  }

  /**
   * Creates a device layout for preview
   * @private
   * @param {!DeviceInfo} device
   * @return {!Element}
   */
  buildDeviceLayout_(device) {
    const deviceLayout = buildDeviceTemplate(this.element);
    const devicePlayer = deviceLayout.querySelector('amp-story-player');
    devicePlayer.setAttribute('width', device.width);
    devicePlayer.setAttribute('height', device.height);
    const storyA = devicePlayer.querySelector('a');
    storyA.textContent = 'Story 1';
    storyA.href = this.storyUrl_;
    setStyles(devicePlayer, {
      width: device.width + 'px',
      height: device.height + 'px',
    });
    const playerImpl = new AmpStoryPlayer(this.win, devicePlayer);
    playerImpl.load();
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
   * @param {!Element} targetElement
   */
  handleTap_(targetElement) {
    const actionElement = closest(
      targetElement,
      (el) => el.hasAttribute('data-action'),
      this.element
    );
    if (actionElement) {
      switch (actionElement.getAttribute('data-action')) {
        case PREVIEW_ACTIONS.SHOW_HELP_DIALOG:
          this.showHelpDialog_();
          break;
        case PREVIEW_ACTIONS.SHOW_ADD_DEVICE_DIALIG:
          this.showAddDeviceDialog_();
          break;
        case PREVIEW_ACTIONS.CLOSE_DIALOG:
          this.hideCurrentDialog_();
          break;
        case PREVIEW_ACTIONS.REMOVE_DEVICE:
          this.removeDevice_(actionElement.getAttribute('data-device'));
          break;
        case PREVIEW_ACTIONS.TOGGLE_DEVICE_CHIP:
          this.onAddDeviceChipToggled_(actionElement);
          break;
      }
    }
  }

  /**
   * @private
   * @param {string} deviceName
   */
  addDevice_(deviceName) {
    const deviceSpecs = ALL_DEVICES.find((d) => d.name === deviceName);
    if (!deviceSpecs) {
      return;
    }
    const deviceLayout = this.buildDeviceLayout_(deviceSpecs, this.storyUrl_);
    deviceSpecs.element = deviceLayout;
    deviceSpecs.chip = this.buildDeviceChip_(deviceSpecs.name);
    this.mutateElement(() => {
      this.element.appendChild(deviceLayout);
      this.element
        .querySelector('.i-amphtml-story-dev-tools-device-chips')
        .appendChild(deviceSpecs.chip);
    });
    this.devices_.push(deviceSpecs);
    this.updateDevicesInHash_();
  }

  /**
   * Try to remove a device with the name passed.
   * @private
   * @param {string} deviceName
   * @return {bool} whether a device was found and removed with that name.
   */
  removeDevice_(deviceName) {
    const device = this.devices_.find((d) => d.name === deviceName);
    if (device) {
      this.mutateElement(() => {
        device.chip.remove();
        device.element.remove();
      });
      this.devices_ = this.devices_.filter((d) => d != device);
      this.updateDevicesInHash_();
      return true;
    }
    return false;
  }

  /**
   * @param {string} deviceName
   * @return {!Element} the device chip
   */
  buildDeviceChip_(deviceName) {
    const deviceChip = buildDeviceChipTemplate(this.element);
    deviceChip.querySelector(
      '.i-amphtml-story-dev-tools-device-chip-name'
    ).textContent = deviceName;
    deviceChip.setAttribute('data-action', PREVIEW_ACTIONS.REMOVE_DEVICE);
    deviceChip.setAttribute('data-device', deviceName);
    return deviceChip;
  }

  /**
   * @param {!Element} chipElement
   * @private
   */
  onAddDeviceChipToggled_(chipElement) {
    const deviceName = chipElement.getAttribute('data-device');
    if (this.removeDevice_(deviceName)) {
      chipElement.setAttribute('inactive', '');
    } else {
      chipElement.removeAttribute('inactive');
      this.addDevice_(deviceName);
    }
  }

  /**
   * If the devices are not the default ones, add them to the hashString
   * @private
   */
  updateDevicesInHash_() {
    const devicesStringRepresentation = this.devices_
      .map((device) => simplifyDeviceName(device.name))
      .join(';');
    this.element.setAttribute('devices', devicesStringRepresentation);
    updateHash(
      {
        'devices':
          devicesStringRepresentation != DEFAULT_DEVICES
            ? devicesStringRepresentation
            : null,
      },
      this.win
    );
  }

  /**
   * When measure changes, we recalculate the positions of the devices to keep them spaced and scaled evenly.
   * @override
   * */
  onLayoutMeasure() {
    const layoutBox = this.getLayoutBox();
    console.log(this.devices_);
    let sumDeviceWidths = 0;
    let maxDeviceHeights = 0;
    // Find the sum of the device widths and max of heights since they are horizontally laid out.
    this.devices_.forEach((deviceSpecs) => {
      sumDeviceWidths += deviceSpecs.width;
      maxDeviceHeights = Math.max(
        maxDeviceHeights,
        deviceSpecs.deviceHeight || deviceSpecs.height + 100
      );
    });
    // Find the scale that covers up to 90% of width or 80% of height.
    const scale = Math.min(
      (layoutBox.width / sumDeviceWidths) * 0.9,
      (layoutBox.height / maxDeviceHeights) * 0.8
    );
    const paddingSize =
      (layoutBox.width - sumDeviceWidths * scale) / (this.devices_.length + 1);
    console.log(paddingSize, layoutBox.width, sumDeviceWidths);
    let cumWidthSum = paddingSize;
    this.devices_.forEach((deviceSpecs) => {
      // Calculate the width change when scaling that needs to be added.
      const scaleWidthChange = deviceSpecs.width * (1 - scale) * 0.5 + 10;
      setStyles(deviceSpecs.element, {
        'transform': `perspective(100px) translate3d(${
          (cumWidthSum - scaleWidthChange) / scale
        }px, 0px, ${(100 * (scale - 1)) / scale}px)`,
      });
      cumWidthSum += deviceSpecs.width * scale + paddingSize;
    });
  }

  /**
   * Builds & shows the ADD DEVICE dialog creating chips for each device in ALL_DEVICES
   * and attaching them to the corresponding section (mobile, tablet, desktop).
   * @private
   */
  showAddDeviceDialog_() {
    const dialog = buildAddDeviceDialogTemplate(this.element);

    // Find the sections for the different screen sizes, where chips will be attached.
    const sections = ['mobile', 'tablet', 'desktop'].reduce((obj, section) => {
      obj[section] = dialog.querySelector(
        `.i-amphtml-story-dev-tools-device-dialog-${escapeCssSelectorIdent(
          section
        )}`
      );
      return obj;
    }, {});

    // Add a chip for each device on the right category, and mark as inactive if device not selected.
    ALL_DEVICES.forEach((device) => {
      const chip = this.buildDeviceChip_(device.name);
      chip.setAttribute('data-action', PREVIEW_ACTIONS.TOGGLE_DEVICE_CHIP);
      if (!this.devices_.find((d) => d.name == device.name)) {
        chip.setAttribute('inactive', '');
      }
      if (device.width / device.height > 1) {
        sections['desktop'].appendChild(chip);
      } else if (device.width / device.height > 0.75) {
        sections['tablet'].appendChild(chip);
      } else {
        sections['mobile'].appendChild(chip);
      }
    });

    this.mutateElement(() => this.element.appendChild(dialog));
    addAttributeAfterTimeout(this, dialog, 1, 'active');
    this.currentDialog_ = dialog;
  }

  /**
   * Builds & shows the HELP dialog.
   * @private
   */
  showHelpDialog_() {
    const dialog = buildHelpDialogTemplate(this.element);

    dialog.querySelector(
      '.i-amphtml-story-dev-tools-help-search-preview-link'
    ).href += this.storyUrl_;

    this.mutateElement(() => this.element.appendChild(dialog));
    addAttributeAfterTimeout(this, dialog, 1, 'active');
    this.currentDialog_ = dialog;
  }

  /**
   * Hides and removes the current dialog being shown.
   * @private
   */
  hideCurrentDialog_() {
    if (this.currentDialog_) {
      this.currentDialog_.removeAttribute('active');
      removeAfterTimeout(this, this.currentDialog_, 200);
      this.currentDialog_ = null;
    }
  }
}
