/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const {verifySelectorsVisible} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'tapping on sidebar control button should show sidebar and opacity mask': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#cover[active]');
    await page.tap('.i-amphtml-story-sidebar-control');
    await verifySelectorsVisible(page, name,
      [
        'amp-sidebar[side][open]',
        '.i-amphtml-story-opacity-mask',
      ]);
  },
  'tapping on element with sidebar close action should close opacity mask ': async(page,name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#cover[active]');
    await page.tap('.i-amphtml-story-sidebar-control');
    await page.waitFor(400);
    await page.tap('button#close-button');
    await verifySelectorsVisible(page, name,
    [
      'amp-sidebar[hidden]',
      '.i-amphtml-story-opacity-mask[hidden]',
    ]);
  },
  'tapping on the opacity mask should close sidebar ': async(page,name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#cover[active]');
    await page.tap('.i-amphtml-story-sidebar-control');
    await screen.tap(200, 240);
    await verifySelectorsVisible(page, name,
    [
      'amp-sidebar[hidden]',
      '.i-amphtml-story-opacity-mask[hidden]',
    ]);
  },
 };
