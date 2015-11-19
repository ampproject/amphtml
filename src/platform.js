/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getService} from './service';


/**
 * A helper class that provides information about device/OS/browser currently
 * running.
 */
export class Platform {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * Whether the current platform an iOS device.
   * @return {boolean}
   */
  isIos() {
    return /iPhone|iPad|iPod/i.test(this.win.navigator.userAgent);
  }

  /**
   * Whether the current browser is Safari.
   * @return {boolean}
   */
  isSafari() {
    return /Safari/i.test(this.win.navigator.userAgent) && !this.isChrome();
  }

  /**
   * Whether the current browser a Chrome browser.
   * @return {boolean}
   */
  isChrome() {
    // Also true for MS Edge :)
    return /Chrome|CriOS/i.test(this.win.navigator.userAgent);
  }
};


/**
 * @param {!Window} window
 * @return {!Platform}
 */
export function platformFor(window) {
  return getService(window, 'platform', () => {
    return new Platform(window);
  });
};

export const platform = platformFor(window);
