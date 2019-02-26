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

import {
  getScrollingElement,
  getSlides,
} from './helpers';

describes.endtoend('AMP carousel max-swipe', {
}, async env => {
  const pageWidth = 800;
  const pageHeight = 600;
  let controller;
  let ampDriver;

  beforeEach(async() => {
    controller = env.controller;
    ampDriver = env.ampDriver;

    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-base-carousel/max-swipe-one.amp.html');
    await ampDriver.toggleExperiment('layers', true);
    await ampDriver.toggleExperiment('amp-base-carousel', true);
    await controller.refresh();

    await controller.setWindowRect({
      width: pageWidth,
      height: pageHeight,
    });
  });

  describe('looping', () => {
    it('should only show one slide on each side initially', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      await controller.waitForElementProperty(el, 'scrollLeft', pageWidth);
      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await controller.waitForElementProperty(el, 'scrollWidth', pageWidth * 3);
      await controller.waitForElementRect(slides[0], {x: 0});
      await controller.waitForElementRect(slides[1], {x: pageWidth});
      await controller.waitForElementRect(slides[slides.length - 1],
          {x: -pageWidth});
      await controller.waitForElementProperty(slides[2], 'hidden', true);
      await controller.waitForElementProperty(slides[slides.length - 2],
          'hidden', true);
    });

    it('should show the correct slides after moving right', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      // Move right by 1 slide.
      await controller.scrollBy(el, {left: pageWidth});
      // Wait for scroll position to be reset.
      await controller.waitForElementProperty(el, 'scrollLeft', pageWidth);

      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await controller.waitForElementProperty(el, 'scrollWidth', pageWidth * 3);
      await controller.waitForElementRect(slides[0], {x: -pageWidth});
      await controller.waitForElementRect(slides[1], {x: 0});
      await controller.waitForElementRect(slides[2], {x: pageWidth});
      await controller.waitForElementProperty(slides[slides.length - 1],
          'hidden', true);
      await controller.waitForElementProperty(slides[3], 'hidden', true);
    });

    it('should show the correct slides after moving left', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);
      // Move left by 1 slide.
      await controller.scrollBy(el, {left: -pageWidth});

      // Wait for scroll position to be reset.
      await controller.waitForElementProperty(el, 'scrollLeft', pageWidth);

      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await controller.waitForElementProperty(el, 'scrollWidth', pageWidth * 3);
      await controller.waitForElementRect(slides[slides.length - 2],
          {x: -pageWidth});
      await controller.waitForElementRect(slides[slides.length - 1], {x: 0});
      await controller.waitForElementRect(slides[0], {x: pageWidth});
      await controller.waitForElementProperty(slides[slides.length - 3],
          'hidden', true);
      await controller.waitForElementProperty(slides[1], 'hidden', true);
    });
  });
});
