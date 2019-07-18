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

  'tap input1 to focus and display results': async (page, name) => {
    await page.tap('input#input1');
    await verifySelectorsVisible(page, name, ['amp-autocomplete#autocomplete1 > .i-amphtml-autocomplete-results']);
  },

  'tap input-rtl to focus and display results': async (page, name) => {
    await page.tap('input#input-rtl');
    await verifySelectorsVisible(page, name, ['amp-autocomplete#autocomplete-rtl > .i-amphtml-autocomplete-results']);
  },

  'tap input2 to focus and display results': async (page, name) => {
    await page.tap('input#input2');
    await verifySelectorsVisible(page, name, ['amp-autocomplete#autocomplete2 > .i-amphtml-autocomplete-results']);
  },
};
