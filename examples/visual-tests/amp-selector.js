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

const {verifyCssElements} = require('../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'single selector select option 2': async (page, name) => {
    await page.tap('#single_selector span[option="2"]');
    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        '#single_selector span[option="2"][selected]',
      ]);
  },

  'single selector select option 2, then 3': async (page, name) => {
    await page.tap('#single_selector span[option="2"]');
    await page.waitFor('#single_selector span[option="2"][selected]');
    await page.tap('#single_selector span[option="3"]');
    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        '#single_selector span[option="3"][selected]',
      ]);
  },
 };
