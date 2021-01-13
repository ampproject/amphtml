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

import {getNextArrow, getPrevArrow, getSlideChild, sleep} from './helpers';

const pageWidth = 600;
const pageHeight = 800;

describes.endtoend(
  'AMP carousel observe AMP elements',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/mediaQueryAmpElements.amp.html',
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render image after resize', async () => {
      const imageOne = await controller.findElement('amp-img#slide-1-desktop-image');
      let imageOneRect = await controller.getElementRect(imageOne);

      // Assert image not seen
      await expect(imageOneRect['width']).to.equal(0);

      await controller.setWindowRect({
        width: 800,
        height: 600,
      });

      await sleep(500);

      // Assert image seen
      imageOneRect = await controller.getElementRect(imageOne);
      await expect(imageOneRect['width']).to.be.greaterThan(0);
    });

    // Test slide 2 (go back)
    it.only('should swap between images on resize', async () => {
      const ampCarouselNextButton = await controller.findElement('.amp-carousel-button.amp-carousel-button-next');
      await controller.click(ampCarouselNextButton);
      await sleep(500);

      const imageOne = await controller.findElement('amp-img#slide-2-desktop-image');
      const imageTwo = await controller.findElement('amp-img#slide-2-mobile-image');
      let imageOneRect = await controller.getElementRect(imageOne);
      let imageTwoRect = await controller.getElementRect(imageTwo);

      // Assert mobile seen, not desktop
      await expect(imageOneRect['width']).to.equal(0);
      await expect(imageTwoRect['width']).to.greaterThan(0);

      // Resize
      await controller.setWindowRect({
        width: 800,
        height: 600,
      });

      // Assert desktop seen, not mobile
      await sleep(500);
      imageOneRect = await controller.getElementRect(imageOne);
      imageTwoRect = await controller.getElementRect(imageTwo);

      await expect(imageOneRect['width']).to.greaterThan(0);
      await expect(imageTwoRect['width']).to.equal(0);
    });
  }
);
