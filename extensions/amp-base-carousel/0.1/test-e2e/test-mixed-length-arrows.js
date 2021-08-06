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

import {getNextArrow, getPrevArrow} from './helpers';

describes.endtoend(
  'amp-base-carousel - mixed length carousel arrows',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/no-arrows.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    /**
     * Attach an event listener to page to capture the 'slideChange' event.
     * If given a selector, click on it to fire the event being listened for.
     * @return {!Promise}
     */
    function slideChangeEventAfterClicking(opt_selector) {
      return controller.evaluate((opt_selector) => {
        return new Promise((resolve) => {
          document.addEventListener(
            'slideChange',
            (e) => resolve(e.data),
            {once: true} // Remove listener after first invocation
          );
          if (opt_selector) {
            document.querySelector(opt_selector).click();
          }
        });
      }, opt_selector);
    }

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should not have arrows when at start or end', async () => {
      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('0');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('1');

      // click next
      await slideChangeEventAfterClicking(
        '.i-amphtml-base-carousel-arrow-next-slot :first-child'
      );

      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('1');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('0');

      // click back
      await slideChangeEventAfterClicking(
        '.i-amphtml-base-carousel-arrow-prev-slot :first-child'
      );

      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('0');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('1');
    });
  }
);
