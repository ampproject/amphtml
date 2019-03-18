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

const {verifySelectorsVisible, verifySelectorsInvisible} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'tapping on a clickable anchor should show the tooltip': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitFor(300); // For animations to finish.
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping outside tooltip should hide it': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.waitFor(300); // For animations to finish.
    await page.tap('.i-amphtml-story-focused-state-layer');
    await page.waitFor(300); // For animations to finish.
    await verifySelectorsVisible(
      page, name, ['.i-amphtml-story-focused-state-layer.i-amphtml-hidden']);
  },
  'tapping on anchor tooltip should keep it open': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.i-amphtml-story-tooltip');
    await page.waitFor(300); // For animations to finish.
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping arrow when tooltip is open should navigate': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.waitFor(300); // For animations to finish.
    await page.tap('button.i-amphtml-story-button-move');
    await page.waitFor(300); // For animations to finish.
    await verifySelectorsVisible(page, name, ['amp-story-page#cover[active]']);
  },
  'tapping on embed tooltip should expand the component': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('amp-twitter.blue');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.i-amphtml-story-tooltip');
    await page.waitFor(300); // For animations to finish.
    await verifySelectorsVisible(page, name, ['amp-story-page.i-amphtml-expanded-mode']);
  },
  'tapping on closing button should exit expanded view': async (page, name) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitFor('amp-story-page#page-2[active]');
    await page.waitFor(300); // For animations to finish.
    await page.tap('amp-twitter.blue');
    await page.waitFor(300); // For animations to finish.
    await page.tap('a.i-amphtml-story-tooltip');
    await page.waitFor('amp-story-page.i-amphtml-expanded-mode');
    await page.waitFor(300); // For animations to finish.
    await page.tap('span.i-amphtml-expanded-view-close-button');
    await verifySelectorsInvisible(page, name, ['amp-story-page.i-amphtml-expanded-mode']);
  },
 };
