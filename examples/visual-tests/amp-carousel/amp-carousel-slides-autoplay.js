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

function calcCLS() {
  window.cumulativeLayoutShiftScore = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        window.cumulativeLayoutShiftScore += entry.value;
      }
    }
  });

  observer.observe({type: 'layout-shift', buffered: true});
}

module.exports = {
  // Note: The Percy snapshot freezes the animation on first because the transition
  // to the second slide is done via CSS translations.  As a result, the snapshot
  // will appear as though the slide has not changed. We know that without the freezing,
  // it should have, because of the aria-hidden and title states on the
  // active slides and prev/next arrows.
  'autoplay advance to second slide - snapshot freezes animation on first': async (
    page,
    name
  ) => {
    await page.evaluate(calcCLS);
    // Autoadvance to second slide.
    await page.waitFor(
      () => document.querySelector('.img-2').getBoundingClientRect().x === 0
    );
    await verifySelectorsVisible(page, name, [
      '.img-1[aria-hidden="true"]',
      '.img-2[aria-hidden="false"]',
      '.amp-carousel-button-prev[title="Previous item in carousel (1 of 3)"]',
      '.amp-carousel-button-next[title="Go to next slide (3 of 3)"]',
    ]);
    await page.evaluate(() => {
      document.body.appendChild(
        document.createTextNode(
          `CLS detected: ${window.cumulativeLayoutShiftScore}`
        )
      );
    });
  },

  // Note: The Percy snapshot freezes the animation on second because the transition
  // to the last slide is done via CSS translations.  As a result, the snapshot
  // will appear as though the slide has not changed. We know that without the freezing,
  // it should have, because of the aria-hidden and aria-disabled states on the
  // active slides and prev/next arrows.
  'autoplay advance to last slide - snapshot freezes animation on second': async (
    page,
    name
  ) => {
    await page.evaluate(calcCLS);
    // Autoadvance to second slide.
    await page.waitFor(
      () => document.querySelector('.img-2').getBoundingClientRect().x === 0
    );
    await verifySelectorsVisible(page, name, [
      '.img-1[aria-hidden="true"]',
      '.img-2[aria-hidden="false"]',
      '.amp-carousel-button-prev[title="Previous item in carousel (1 of 3)"]',
      '.amp-carousel-button-next[title="Go to next slide (3 of 3)"]',
    ]);
    // Autoadvance to last slide.
    await page.waitFor(
      () => document.querySelector('.img-3').getBoundingClientRect().x === 0
    );
    await verifySelectorsVisible(page, name, [
      '.img-2[aria-hidden="true"]',
      '.img-3[aria-hidden="false"]',
      '.amp-carousel-button-prev[title="Previous item in carousel (2 of 3)"]',
      '.amp-carousel-button-next[title="Go to next slide (1 of 3)"]',
    ]);
    await page.evaluate(() => {
      document.body.appendChild(
        document.createTextNode(
          `CLS detected: ${window.cumulativeLayoutShiftScore}`
        )
      );
    });
  },
};
