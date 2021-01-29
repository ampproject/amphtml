/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

async function scroll(page, _, target = 'bottom') {
  await page.tap(`#scroll-${target}-button`);

  // Scrolling takes 500ms as defined by the runtime, and leeway.
  await page.waitForTimeout(700);
}

async function dock(page, name) {
  await page.tap('#play-button');
  await page.waitForTimeout(200); // active playback
  await scroll(page);
  await verifySelectorsVisible(page, name, ['.amp-video-docked-shadow']);
}

module.exports = {
  dock,
  scroll,
};
