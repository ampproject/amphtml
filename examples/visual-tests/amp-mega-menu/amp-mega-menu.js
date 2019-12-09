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

const {verifySelectorsVisible} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'click menu item one': async (page, name) => {
    await page.waitFor('amp-mega-menu .i-amphtml-mega-menu-item:first-child .i-amphtml-mega-menu-heading');
    await page.tap('amp-mega-menu .i-amphtml-mega-menu-item:first-child .i-amphtml-mega-menu-heading');
    await page.waitFor(400);
    await verifySelectorsVisible(page, name, [
      'amp-mega-menu[open] .i-amphtml-mega-menu-item:first-child[open] .i-amphtml-mega-menu-content',
      'amp-mega-menu[open] .i-amphtml-mega-menu-item:first-child[open] amp-img img',
    ]);
  },
};
