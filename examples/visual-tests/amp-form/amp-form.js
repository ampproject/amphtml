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
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'try to submit without input': async (page, name) => {
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-invalid',
      'span[visible-when-invalid="valueMissing"][validation-for="name"].visible',
      'span[visible-when-invalid="valueMissing"][validation-for="email"].visible',
    ]);
  },

  'try to submit with invalid input': async (page, name) => {
    await page.tap('#name');
    await page.keyboard.type('hello');
    await page.keyboard.press('Tab');
    await page.keyboard.type('not.an.email.address');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-invalid',
      'span[visible-when-invalid="patternMismatch"][validation-for="name"].visible',
      'span[visible-when-invalid="typeMismatch"][validation-for="email"].visible',
    ]);
  },

  'try to submit with valid input': async (page, name) => {
    await page.tap('#name');
    await page.keyboard.type('Jane Miller');
    await page.tap('#email');
    await page.keyboard.type('jane.miller@ampproject.org');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-valid',
      'div[submit-success] div[id^="rendered-message-amp-form-"]',
    ]);
  },

  // TODO(danielrozenberg): fix and restore this test
  /*
  'try to submit to a dead server': async (page, name) => {
    page.on('request', interceptedRequest => interceptedRequest.abort());

    await page.tap('#name');
    await page.keyboard.type('Jane Miller');
    await page.tap('#email');
    await page.keyboard.type('jane.miller@ampproject.org');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-valid',
      'div[submit-error] div[id^="rendered-message-amp-form-"]',
    ]);
  }
  */
};
