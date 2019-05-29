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
  'accept consent': async (page, name) => {
    await page.tap('#consent-ui #accept');

    await verifySelectorsVisible(page, name, [
        'amp-img[data-block-on-consent="_till_responded"] img',
        'amp-img[data-block-on-consent="_till_accepted"] img',
        'amp-img[data-block-on-consent="default"] img',
        '#not-specified img'
      ]);
  },

  'reject consent': async (page, name) => {
    await page.tap('#consent-ui #reject');

    await page.evaluate(() => {
      document.querySelector('#consent-ui #reject').click();
    });

    await verifySelectorsVisible(page, name, [
        'amp-img[data-block-on-consent="_till_responded"] img'
    ]);
  },

  'should preserve accepted state': async (page, name) => {
    // Accept the consent
    await page.tap('#consent-ui #accept');

    // Refresh the page
    await page.reload();

    await verifySelectorsVisible(page, name, [
        'amp-img[data-block-on-consent="_till_responded"] img',
        'amp-img[data-block-on-consent="_till_accepted"] img',
        'amp-img[data-block-on-consent="default"] img',
        '#not-specified img'
    ]);
  }
};
