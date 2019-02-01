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

const {verifyCssElements} = require('../../../build-system/tasks/visual-diff/helpers');

const goToUniqueLocalHostSubDomain = async (page) => {
  const url = page.url();
  const randomString = Math.random().toString(36).substring(2, 9);
  const randomOriginUrl = url.replace('localhost', `${randomString}.localhost`);
  await page.goto(randomOriginUrl, {waitUntil: 'load'});
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({waitUntil: 'networkidle0'});
}

module.exports = {
  'accept consent': async (page, name) => {

    await goToUniqueLocalHostSubDomain(page);

    await page.tap('#consent-ui #accept');

    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        'amp-img[data-block-on-consent="_till_responded"] img',
        'amp-img[data-block-on-consent="_till_accepted"] img',
        'amp-img[data-block-on-consent="default"] img',
        '#not-specified img'
      ]);
  },
  'reject consent': async (page, name) => {

    await goToUniqueLocalHostSubDomain(page);

    await page.tap('#consent-ui #reject');

    await page.evaluate(() => {
      document.querySelector('#consent-ui #reject').click();
    });

    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        'amp-img[data-block-on-consent="_till_responded"] img'
    ]);
  },
  'should preserve accepted state': async (page, name) => {

    await goToUniqueLocalHostSubDomain(page);

    // Accept the consent
    await page.tap('#consent-ui #accept');

    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        'amp-img[data-block-on-consent="_till_responded"] img',
        'amp-img[data-block-on-consent="_till_accepted"] img',
        'amp-img[data-block-on-consent="default"] img',
        '#not-specified img'
      ]);

    // save the accepted local storage value
    const localStorageJson = await page.evaluate(() => {
      const json = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        json[key] = localStorage.getItem(key);
      }
      return json;
    });

    // Refresh the page
    await page.reload();

    // Set the local storage back to the accepted value
    await page.evaluate(json => {
      localStorage.clear();

      Object.keys(json).forEach(key => {
        localStorage.setItem(key, json[key]);
      });
    }, localStorageJson);

    await verifyCssElements(page, name,
      /* forbiddenCss */ null,
      /* loadingIncompleteCss */ null,
      /* loadingCompleteCss */ [
        'amp-img[data-block-on-consent="_till_responded"] img',
        'amp-img[data-block-on-consent="_till_accepted"] img',
        'amp-img[data-block-on-consent="default"] img',
        '#not-specified img'
    ]);
  }
 };
