/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
const fs = require('fs-extra');
const {transformCssFile} = require('../jsify-css');

async function createGoldenCss() {
  const result = await transformCssFile(
    './build-system/tasks/create-golden-css/css/main.css',
    {
      normalizeWhitespace: false,
      discardComments: false,
    }
  );

  fs.writeFileSync('./test/golden-files/main.css', result);
}

module.exports = {
  createGoldenCss,
};

createGoldenCss.description = 'Creates a golden file for untransformed css';
