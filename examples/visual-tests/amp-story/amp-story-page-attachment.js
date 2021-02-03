/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

module.exports = {
  'open attachment UI element': async (page, unusedName) => {
    await page.waitForTimeout(1600);
  },

  'open attachment': async (page, unusedName) => {
    await page.tap('.i-amphtml-story-page-open-attachment-label');
    await page.waitForTimeout(410);
  },
  /**
   * TODO(@ampproject/wg-stories): fix flaky test:
   * https://percy.io/ampproject/amphtml/builds-next/8331061/changed/473805330
   *
   * 'open attachment UI element with link': async (page, unusedName) => {
   *   const screen = page.touchscreen;
   *   await screen.tap(200, 240);
   *   await page.waitForSelector('amp-story-page#page-2[active]');
   * },
   */
};
