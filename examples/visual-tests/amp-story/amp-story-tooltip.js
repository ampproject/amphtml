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
  'tapping on a clickable anchor should show the tooltip': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('a.title-small.center');
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping outside tooltip should hide it': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.tap('.i-amphtml-story-focused-state-layer');
    await verifySelectorsVisible(
      page, name, ['.i-amphtml-story-focused-state-layer.i-amphtml-hidden']);
  },
  'tapping on tooltip should keep it open': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.tap('a.i-amphtml-story-tooltip');
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping arrow when tooltip is open should navigate': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitFor('amp-story-page#page-2[active]');
    await page.tap('a.title-small.center');
    await page.waitFor('a.i-amphtml-story-tooltip');
    await page.tap('button.i-amphtml-story-tooltip-nav-button-left');
    await page.waitFor(150);
    await verifySelectorsVisible(page, name, ['amp-story-page#cover[active]']);
  },
 };
