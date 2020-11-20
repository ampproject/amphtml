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
 * Get devices from the queryHash into list of devices
 * @param {*} queryHash
 * @return {any[]}
 */
function parseDevices(queryHash) {
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
          currDeviceName.substring(0, specDeviceName.length) == specDeviceName
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

export class AmpStoryDevToolsTabPreview extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    this.element.classList.add('i-amphtml-story-dev-tools-tab');

    /** @private  {string} */
    this.storyUrl_ = element.getAttribute('story-url');

    /** */
  }
}
