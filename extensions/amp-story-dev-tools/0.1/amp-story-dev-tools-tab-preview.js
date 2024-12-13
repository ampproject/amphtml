import {toggleAttribute} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {observeContentSize} from '#core/dom/layout/size-observer';
import {closest} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {setStyles} from '#core/dom/style';

import {
  addAttributeAfterTimeout,
  removeAfterTimeout,
  updateHash,
} from './utils';

import {AmpStoryPlayer} from '../../../src/amp-story-player/amp-story-player-impl';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @param {?string} devices
 * @return {!Element} the layout
 */
export function createTabPreviewElement(win, storyUrl, devices) {
  const element = win.document.createElement('amp-story-dev-tools-tab-preview');
  element.setAttribute('data-story-url', storyUrl);
  devices ? element.setAttribute('data-devices', devices) : null;
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
        <div class="i-amphtml-story-dev-tools-device-statusbar">
          <div class="i-amphtml-story-dev-tools-device-statusbar-clock"></div>
          <div class="i-amphtml-story-dev-tools-device-statusbar-icons"></div>
        </div>
        <div class="i-amphtml-story-dev-tools-device-appbar">
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-urlbar"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
        </div>
        <amp-story-player width="1" height="1" layout="container">
          <a></a>
        </amp-story-player>
        <div class="i-amphtml-story-dev-tools-device-bottombar">
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
          <div class="i-amphtml-story-dev-tools-device-appbar-icon"></div>
        </div>
        <div class="i-amphtml-story-dev-tools-device-navigation"></div>
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
    <button
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
    </button>
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
    <button
      class="i-amphtml-story-dev-tools-button i-amphtml-story-dev-tools-button-help"
    >
      <span>HELP</span>
      <div
        class="i-amphtml-story-dev-tools-button-icon i-amphtml-story-dev-tools-button-help-icon"
      ></div>
    </button>
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
          <span class="i-amphtml-story-dev-tools-device-dialog-help-hint"
            >https://yourstory.com<b>#development=1</b></span
          >
        </div>
        <h1>Helpful links</h1>
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link i-amphtml-story-dev-tools-help-page-experience-link"
          target="_blank"
          href="https://amp.dev/page-experience/"
          ><span>Analyze the Page Experience</span>
          <div class="i-amphtml-story-dev-tools-device-dialog-arrow"></div
        ></a>
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link"
          target="_blank"
          href="https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/"
          ><span>Best practices for creating a successful Web Story</span>
          <div class="i-amphtml-story-dev-tools-device-dialog-arrow"></div
        ></a>
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link"
          target="_blank"
          href="https://amp.dev/about/stories/"
          ><span>Learn more about Web Stories</span>
          <div class="i-amphtml-story-dev-tools-device-dialog-arrow"></div
        ></a>
        <a
          class="i-amphtml-story-dev-tools-device-dialog-link i-amphtml-story-dev-tools-help-search-preview-link"
          target="_blank"
          href="https://search.google.com/test/amp?url="
          ><span>Web Stories Google Search Preview Tool</span>
          <div class="i-amphtml-story-dev-tools-device-dialog-arrow"></div
        ></a>
        <button
          data-action="closeDialog"
          class="i-amphtml-story-dev-tools-device-dialog-close"
        ></button>
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
        <button
          data-action="closeDialog"
          class="i-amphtml-story-dev-tools-device-dialog-close"
        ></button>
      </div>
    </div>
  `;
};

const MAX_DEVICE_SPACES = 4;

/**
 * @typedef {{
 *  element: !Element,
 *  player: !Element,
 *  chip: !Element,
 *  width: number,
 *  height: number,
 *  deviceHeight: ?number,
 *  deviceSpaces: number,
 * }} DeviceInfo
 *
 * Contains the data related to the device.
 * Width and height refer to the story viewport, while deviceHeight is the device screen height.
 * The deviceSpaces refers to the MAX_DEVICE_SPACES, ensuring the devices on screen don't go over the max space set.
 */

const DEFAULT_DEVICES = 'iphone11native;oneplus5t;pixel2';

const ALL_DEVICES = [
  {
    'name': 'Pixel 2',
    'width': 411,
    'height': 605,
    'deviceHeight': 731,
    'deviceSpaces': 1,
    'details': ['pixel2', 'browser', 'android'],
  },
  {
    'name': 'Pixel 3',
    'width': 411,
    'height': 686,
    'deviceHeight': 823,
    'deviceSpaces': 1,
    'details': ['pixel3', 'browser', 'android'],
  },
  {
    'name': 'iPhone 8 (Browser)',
    'width': 375,
    'height': 554,
    'deviceHeight': 667,
    'deviceSpaces': 1,
    'details': ['iphone8', 'browser', 'ios'],
  },
  {
    'name': 'iPhone 8 (Native)',
    'width': 375,
    'height': 596,
    'deviceHeight': 667,
    'deviceSpaces': 1,
    'details': ['iphone8', 'native', 'ios'],
  },
  {
    'name': 'iPhone 11 (Browser)',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
    'deviceSpaces': 1,
    'details': ['iphone11', 'browser', 'ios'],
  },
  {
    'name': 'iPhone 11 (Native)',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
    'deviceSpaces': 1,
    'details': ['iphone11', 'native', 'ios'],
  },
  {
    'name': 'iPhone 11 Pro (Browser)',
    'width': 375,
    'height': 635,
    'deviceHeight': 812,
    'deviceSpaces': 1,
    'details': ['iphone11pro', 'browser', 'ios'],
  },
  {
    'name': 'iPhone 11 Pro (Native)',
    'width': 375,
    'height': 713,
    'deviceHeight': 812,
    'deviceSpaces': 1,
    'details': ['iphone11pro', 'native', 'ios'],
  },
  {
    'name': 'iPad (Browser)',
    'width': 810,
    'height': 1010,
    'deviceHeight': 1080,
    'deviceSpaces': 2,
    'details': ['ipad', 'browser', 'ios'],
  },
  {
    'name': 'OnePlus 5T',
    'width': 455,
    'height': 820,
    'deviceHeight': 910,
    'deviceSpaces': 1,
    'details': ['oneplus5t', 'browser', 'android'],
  },
  {
    'name': 'OnePlus 7 Pro',
    'width': 412,
    'height': 782,
    'deviceHeight': 892,
    'deviceSpaces': 1,
    'details': ['oneplus7pro', 'browser', 'android'],
  },
  {
    'name': 'Desktop 1080p',
    'width': 1920,
    'height': 1000,
    'deviceHeight': 1080,
    'deviceSpaces': 2,
    'details': ['desktop1080', 'browser', 'desktop'],
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
 * @return {Array<*>}
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

    /** @private {!Element} container for the device previews */
    this.devicesContainer_ = null;

    this.onResize_ = this.onResize_.bind(this);

    /** @private {Map<!Element, !Array<string>>} navigation events expected to be received on each player */
    this.expectedNavigationEvents_ = {};
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('data-story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');

    this.devicesContainer_ = htmlFor(
      this.element
    )`<div class="i-amphtml-story-dev-tools-devices-container"></div>`;
    this.element.appendChild(this.devicesContainer_);

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
  }

  /** @override */
  layoutCallback() {
    parseDevices(
      this.element.getAttribute('data-devices') || DEFAULT_DEVICES
    ).forEach((device) => {
      this.addDevice_(device.name);
    });
    this.repositionDevices_();
    this.element.addEventListener('click', (e) => this.handleTap_(e.target));
    observeContentSize(this.element, this.onResize_);
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
    device.details.forEach((detail) => deviceLayout.setAttribute(detail, ''));
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
    setStyles(
      deviceLayout.querySelector('.i-amphtml-story-dev-tools-device-screen'),
      {
        height: device.deviceHeight
          ? device.deviceHeight + 'px'
          : 'fit-content',
      }
    );
    device.player = new AmpStoryPlayer(this.win, devicePlayer);
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
    if (!actionElement || actionElement.hasAttribute('disabled')) {
      return;
    }
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
      case PREVIEW_ACTIONS.TOGGLE_DEVICE_CHIP:
        this.onDeviceChipToggled_(actionElement);
        break;
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
      this.devicesContainer_.appendChild(deviceLayout);
      this.element
        .querySelector('.i-amphtml-story-dev-tools-device-chips')
        .appendChild(deviceSpecs.chip);
    }).then(() => {
      deviceSpecs.player
        .getElement()
        .addEventListener('storyNavigation', (event) =>
          this.onPlayerNavigation_(event, deviceSpecs)
        );
      deviceSpecs.player.load();
    });
    this.expectedNavigationEvents_[deviceSpecs.name] = [];
    this.devices_.push(deviceSpecs);
    this.updateDevicesInHash_();
  }

  /**
   * Triggered when a player emits a storyNavigationEvent.
   *
   * A navigation event from a player can come from a user interaction or a previous programmatic call.
   * Expected navigation events from programmatic calls are stored in `this.expectedNavigationEvents_`,
   * so they should not be propagated (but deleted from the list of expected events).
   *
   * Behavior of expectedNavigationEvents:
   * - If an event was not expected, it means it was user navigation and should be propagated to other players.
   * - If an event was expected, sync the expected list up to that page by removing all the pages expected
   * up to the one received in the navigation event. This clears any events that could be dispatched when the story
   * was loading and never were executed.
   *
   * @param {!Event} event
   * @param {!DeviceInfo} deviceSpecs
   * @private
   */
  onPlayerNavigation_(event, deviceSpecs) {
    const {pageId} = event.detail;
    const pageIndexInExpectedList =
      this.expectedNavigationEvents_[deviceSpecs.name].lastIndexOf(pageId);
    if (pageIndexInExpectedList > -1) {
      // Remove the expected events up to the most recently received event if it was in the list.
      this.expectedNavigationEvents_[deviceSpecs.name].splice(
        0,
        pageIndexInExpectedList + 1
      );
      return;
    }
    this.devices_.forEach((d) => {
      if (d != deviceSpecs) {
        d.player.show(/* storyUrl */ null, event.detail.pageId);
        this.expectedNavigationEvents_[d.name].push(pageId);
      }
    });
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
      delete this.expectedNavigationEvents_[device.name];
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
  onDeviceChipToggled_(chipElement) {
    const deviceName = chipElement.getAttribute('data-device');
    if (this.removeDevice_(deviceName)) {
      this.mutateElement(() => {
        chipElement.setAttribute('inactive', '');
        this.toggleDeviceChipsWithSpaceAvailable_();
      });
    } else {
      this.mutateElement(() => {
        chipElement.removeAttribute('inactive');
        this.toggleDeviceChipsWithSpaceAvailable_();
      });
      this.addDevice_(deviceName);
    }
    this.repositionDevices_();
  }

  /**
   * If the devices are not the default ones, add them to the hashString
   * @private
   */
  updateDevicesInHash_() {
    const devicesStringRepresentation = this.devices_
      .map((device) => simplifyDeviceName(device.name))
      .join(';');
    this.element.setAttribute('data-devices', devicesStringRepresentation);
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
   * Recalculate the positions of the devices to keep them spaced and scaled evenly.
   * @private
   * */
  repositionDevices_() {
    const {offsetHeight: height, offsetWidth: width} =
      this.element.querySelector(
        '.i-amphtml-story-dev-tools-devices-container'
      );
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
      (width / sumDeviceWidths) * 0.9,
      (height / maxDeviceHeights) * 0.8
    );
    const paddingSize =
      (width - sumDeviceWidths * scale) / (this.devices_.length + 1);
    let cumWidthSum = paddingSize;
    this.mutateElement(() => {
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
    });
  }

  /** @private */
  onResize_() {
    this.repositionDevices_();
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

    const currentDeviceSpaces = this.getCurrentSpacesSum_();

    // Add a chip for each device on the right category, and mark as inactive if device not selected.
    ALL_DEVICES.forEach((device) => {
      const chip = this.buildDeviceChip_(device.name);
      chip.setAttribute('data-action', PREVIEW_ACTIONS.TOGGLE_DEVICE_CHIP);
      chip.setAttribute('data-spaces', device.deviceSpaces);
      if (!this.devices_.find((d) => d.name == device.name)) {
        chip.setAttribute('inactive', '');
        if (currentDeviceSpaces + device.deviceSpaces > MAX_DEVICE_SPACES) {
          chip.setAttribute('disabled', '');
        }
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
    dialog.querySelector(
      '.i-amphtml-story-dev-tools-help-page-experience-link'
    ).href =
      'https://amp.dev/page-experience/?url=' +
      encodeURIComponent(this.storyUrl_);

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

  /**
   * Return the number of spaces currently being used by the devices on the screen.
   * @private
   * @return {number}
   */
  getCurrentSpacesSum_() {
    return this.devices_.reduce(
      (prev, device) => prev + device.deviceSpaces,
      0
    );
  }

  /**
   * Disable the chips in the dialog based on whether they have the remaining space available
   * Must be called in a mutate context.
   * @private
   */
  toggleDeviceChipsWithSpaceAvailable_() {
    const allChips = this.currentDialog_.querySelectorAll(
      '.i-amphtml-story-dev-tools-device-chip'
    );
    const currentDeviceSpaces = this.getCurrentSpacesSum_();
    allChips.forEach((chipEl) => {
      const spaces = parseInt(chipEl.getAttribute('data-spaces'), 10);
      // Disable the button if there's no space for adding the device and the device is not added already.
      const isEnabled =
        (currentDeviceSpaces + spaces <= MAX_DEVICE_SPACES) |
        !chipEl.hasAttribute('inactive');
      toggleAttribute(chipEl, 'disabled', !isEnabled);
    });
  }
}
