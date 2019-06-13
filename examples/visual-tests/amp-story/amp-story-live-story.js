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
  'should show the notification.': async page => {
    await page.waitFor('amp-story-page#cover[active]');
    await page.$eval('.i-amphtml-story-system-layer', e => e.setAttribute('i-amphtml-story-has-new-page', 'show'));
    await page.waitFor(2000); // For animations to finish.
    await page.waitForSelector('.i-amphtml-story-has-new-page-notification-container', {opacity: 1});
  },
  '[RTL] should show the notification.': async page => {
    await page.$eval('body', e => e.setAttribute('dir', 'rtl'));
    await page.waitFor('amp-story-page#cover[active]');
    await page.$eval('.i-amphtml-story-system-layer', e => e.setAttribute('i-amphtml-story-has-new-page', 'show'));
    await page.waitFor(2000); // For animations to finish.
    await page.waitForSelector('.i-amphtml-story-has-new-page-notification-container', {opacity: 1});
  },
 };
