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

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

async function scroll(page, _, target = 'bottom') {
  await page.tap(`#scroll-${target}-button`);

  // Scrolling takes 500ms as defined by the runtime, and leeway.
  await page.waitFor(700);
}

async function dock(page, name) {
  await page.tap('#play-button');
  await page.waitFor(200); // active playback
  await scroll(page);
  await verifySelectorsVisible(page, name, ['.amp-video-docked-shadow']);
}

async function hoverDockArea(page, name) {
  await page.hover('.i-amphtml-video-docked-overlay');
  await verifySelectorsVisible(page, name, ['.amp-video-docked-controls']);
}

module.exports = {
  "doesn't dock when not playing": scroll,

  'docks when playing': dock,

  'undocks when scrolling back': async (page, name) => {
    await dock(page, name);
    await scroll(page, name, 'video');
  },

  'displays dock controls on hover': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
  },

  'toggles controls button into paused': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
    await page.tap('.amp-video-docked-pause');
  },

  'toggles controls button into playing': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
    await page.tap('.amp-video-docked-pause');
    await page.tap('.amp-video-docked-play');
  },

  'toggles controls button into muted': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
    await page.tap('.amp-video-docked-mute');
  },

  'toggles controls button into unmuted': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
    await page.tap('.amp-video-docked-mute');
    await page.tap('.amp-video-docked-unmute');
  },

  'displays scrollback button while ad plays': async (page, name) => {
    await dock(page, name);
    await hoverDockArea(page, name);
    await verifySelectorsVisible(page, name, [
      '.amp-video-docked-control-set-scroll-back',
    ]);
  },
};
