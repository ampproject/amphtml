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
'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'Test ad property correctness': async (page, name) => {
    await verifySelectorsVisible(page, name, ['.i-amphtml-story-ad-badge']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-fill-content']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-glass-pane']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-story-page-loaded']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-element']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-layout-container']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-built']);
    await verifySelectorsVisible(page, name, ['.i-amphtml-layout']);
  },
};
