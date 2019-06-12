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

const {verifySelectorsVisible, verifySelectorsInvisible} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'Inserting a new page should show a notification in the last page.': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-1[active]');
    await page.waitFor(500); // For animations to finish.
    await page.$eval('.i-amphtml-story-system-layer', e => e.setAttribute('i-amphtml-story-has-new-page', 'show'));
    await page.waitFor(2000); // For animations to finish.
    await page.waitForSelector('.i-amphtml-story-has-new-page-notification-container', {opacity: 1});
  },
  'Inserting a new page should not show a notification if not in the last page.': async (page, name) => {
    await page.$eval('.i-amphtml-story-system-layer', e => e.setAttribute('i-amphtml-story-has-new-page', 'show'));
    await page.waitForSelector('.i-amphtml-story-has-new-page-notification-container', {opacity: 0});
  },
 };
