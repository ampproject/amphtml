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

const {dock, scroll} = require('./_helpers');
const {
  verifySelectorsInvisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  "doesn't dock when not playing": scroll,

  'docks when playing': dock,

  "doesn't replace player's controls": async (page, name) => {
    await dock(page);
    await verifySelectorsInvisible(page, name, [
      '.amp-video-docked-controls',
      '.i-amphtml-video-docked-overlay',
    ]);
  },

  "allows clickthrough to player": async (page, name) => {
    await dock(page);
    await page.tap('iframe');
  },
};
