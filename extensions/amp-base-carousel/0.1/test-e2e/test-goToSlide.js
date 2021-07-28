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

import {getPrevArrow, getSlides} from './helpers';

describes.endtoend(
  'amp base carousel in lightbox go to slide',
  {
    fixture: 'amp-base-carousel/arrows-in-lightbox.amp.html',
    environments: ['single'],
  },
  async (env) => {
    let controller;
    let slides;
    let prevArrow;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should move to first slide when prev arrow is clicked', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Expect second slide to be shown
      slides = await getSlides(controller);
      await expect(controller.getElementRect(slides[1])).to.include({x: 0});

      // Click prev arrow
      prevArrow = await getPrevArrow(controller);
      await controller.click(prevArrow);

      slides = await getSlides(controller);
      await expect(controller.getElementRect(slides[0])).to.include({x: 0});
    });
  }
);
