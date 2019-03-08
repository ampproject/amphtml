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
  'tapping on an embed should show the tooltip': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor(400);
    await page.tap('amp-twitter.blue');
    await page.waitFor(400);
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping outside tooltip should hide it': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor(300);
    await page.tap('amp-twitter.blue');
    await page.waitFor(300);
    await page.tap('.i-amphtml-story-focused-state-layer');
    await verifySelectorsVisible(
      page, name, ['.i-amphtml-story-focused-state-layer.i-amphtml-hidden']);
  },
  'tapping on tooltip should expand the component': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor(300);
    await page.tap('amp-twitter.blue');
    await page.waitFor(300);
    await page.tap('a.i-amphtml-story-tooltip');
    await page.waitFor(300);
    await verifySelectorsVisible(page, name, ['amp-story-page.i-amphtml-expanded-mode']);
  },
  'tapping on closing button should exit expanded view': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor(300);
    await page.tap('amp-twitter.blue');
    await page.waitFor(300);
    await page.tap('a.i-amphtml-story-tooltip');
    await page.waitFor(300);
    await page.tap('span.i-amphtml-expanded-view-close-button');
    await page.waitFor(300);
    await verifySelectorsInvisible(page, name, ['amp-story-page.i-amphtml-expanded-mode']);
  },
 };
