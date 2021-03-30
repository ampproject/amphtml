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

import {getNextArrow, getSlides, sleep} from './helpers';

describes.endtoend(
  'AMP carousel 0.2 with responsive slides',
  {
    fixture: 'amp-carousel/0.2/responsive-slides.amp.html',
    experiments: ['amp-carousel'],
    environments: ['single'],
  },
  async function (env) {
    let controller;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('layout properly and show images', async () => {
      const slides = await getSlides(controller);
      let slideRect = await rect(slides[0]);
      const nextArrow = await getNextArrow(controller);

      // Check the size of the image
      await expect(slideRect['width']).to.be.greaterThan(0);
      await expect(slideRect['height']).to.be.greaterThan(0);

      await controller.click(nextArrow);
      await sleep(1000);
      slideRect = await rect(slides[1]);

      // Check the size of the new image
      await expect(slideRect['width']).to.be.greaterThan(0);
      await expect(slideRect['height']).to.be.greaterThan(0);
    });
  }
);
