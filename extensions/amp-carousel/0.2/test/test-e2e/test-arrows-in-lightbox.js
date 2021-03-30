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

describes.endtoend(
  'amp carousel:0.2 in lightbox',
  {
    fixture: 'amp-carousel/0.2/amp-lightbox-carousel-selector.amp.html',
    environments: ['single'],
  },
  async (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    function getPrevArrow() {
      return controller.findElement(
        '.amp-carousel-button.amp-carousel-button-prev'
      );
    }

    function getNextArrow() {
      return controller.findElement(
        '.amp-carousel-button.amp-carousel-button-next'
      );
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should open with both arrows', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Both arrows should be showing
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(
        await controller.getElementProperty(nextArrow, 'ariaDisabled')
      ).to.equal('false');
      await expect(
        await controller.getElementProperty(prevArrow, 'ariaDisabled')
      ).to.equal('false');
    });

    it('should open with one arrow', async () => {
      // Click on last image
      const lastImage = await controller.findElement('#fourth');
      await controller.click(lastImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Only prev arrow should be showing since non-looping carousel is on the last slide.
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(
        await controller.getElementProperty(nextArrow, 'ariaDisabled')
      ).to.equal('true');
      await expect(
        await controller.getElementProperty(prevArrow, 'ariaDisabled')
      ).to.equal('false');
    });
  }
);
