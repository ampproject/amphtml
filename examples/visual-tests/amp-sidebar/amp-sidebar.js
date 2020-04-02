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
  verifySelectorsInvisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'renders closed': async (page, name) => {
    await verifySelectorsInvisible(page, name, [
      'amp-sidebar.i-amphtml-element',
    ]);
  },

  'open sidebar': async (page, name) => {
    const toggleButtonSelector = '[on="tap:sidebar1.toggle"]';
    await verifySelectorsVisible(page, name, [toggleButtonSelector]);
    await page.tap(toggleButtonSelector);
    await verifySelectorsVisible(page, name, ['amp-sidebar[open]']);
  },
};
