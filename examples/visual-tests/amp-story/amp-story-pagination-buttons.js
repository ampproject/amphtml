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
  'shows corresponding buttons for first page': async (page, name) => {
    await verifySelectorsVisible(page, name,
      [
        '.next-container > .i-amphtml-story-button-move',
        '.prev-container.i-amphtml-story-button-hidden',
      ]);
  },
  'shows corresponding buttons when there is a previous and next page':
      async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await verifySelectorsVisible(page, name,
      [
        '.next-container > button.i-amphtml-story-button-move',
        '.prev-container > button.i-amphtml-story-button-move',
      ]);
  },
  'shows corresponding buttons for last page': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-3[active]');
    await verifySelectorsVisible(page, name,
      [
        '.i-amphtml-story-fwd-more',
        '.prev-container > button.i-amphtml-story-button-move',
      ]);
  },
  'shows corresponding buttons for bookend': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-3[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('.i-amphtml-story-bookend-active');
    await verifySelectorsVisible(page, name,
      [
        '.i-amphtml-story-fwd-replay',
        '.i-amphtml-story-back-close-bookend',
      ]);
  },
 };
