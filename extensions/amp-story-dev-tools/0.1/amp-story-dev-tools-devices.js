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

import {getInstance} from 'amphtml-validator';
import {loadScript} from '../../../src/validator-integration';
import {toArray} from '../../../src/types';
import {urls} from '../../../src/config';

export const DEFAULT_SCREEN_SIZES = [
  {
    'name': 'iPhone 11 Discover',
    'width': 414,
    'height': 795,
    'deviceHeight': 896,
  },
  {
    'name': 'iPhone 11 Chrome',
    'width': 414,
    'height': 724,
    'deviceHeight': 896,
  },
  {
    'name': 'Pixel 2 Chrome',
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

export class DevToolsDevicesTab {
  /**
   *
   * @param {!Element} element the element that will be used to log everything.
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * @public
   * @param {string} url
   */
  setStoryUrl(url) {
    toArray(this.element.querySelectorAll('a')).forEach((e) => (e.href = url));
  }

  /**
   * Returns the root element of the logs.
   * @return {!Element}
   */
  getElement() {
    return this.element;
  }
}
