/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {sleep} from './helpers';

describes.endtoend(
  'amp-base-carousel - advance',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/amp-lightbox-carousel-selector.html',
    environments: ['single'],
  },
  async (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    function getPrevArrow() {
      return controller.findElement('.amp-carousel-button.amp-carousel-button-prev');
    }

    function getNextArrow() {
      return controller.findElement('.amp-carousel-button.amp-carousel-button-next');
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should open with both arrows', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);
      // Wait for lightbox to load the carousel and image
      await sleep(500);

      // Both arrows should be showing
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(controller.getElementProperty(nextArrow, 'aria-disabled')).to.be
        .false;
      await expect(controller.getElementProperty(prevArrow, 'aria-disabled')).to.be
        .false;
    });
    
    it.skip('should open with one arrow', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);
      // Wait for lightbox to load the carousel and image
      await sleep(500);

      // Both arrows should be showing
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(controller.getElementProperty(nextArrow, 'aria-disabled')).to.be
        .true;
      await expect(controller.getElementProperty(prevArrow, 'aria-disabled')).to.be
        .false;
    });
  }
);
