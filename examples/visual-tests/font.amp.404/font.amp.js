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

module.exports = {
  'forbid loaded css classes': async (page, name) => {
    const forbiddenSelectors = [
      '.comic-amp-font-loaded',
      '.comic-amp-bold-font-loaded',
    ];
    for (const selector of forbiddenSelectors) {
      if ((await page.$(selector)) !== null) {
        throw new Error(`${colors.cyan(testName)} | The forbidden CSS ` +
            `element ${colors.cyan(selector)} exists in the page`);
      }
    }
  },
};
