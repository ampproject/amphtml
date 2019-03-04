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

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend('AMP carousel max-swipe', {
  testUrl: 'http://localhost:8000/test/manual/amp-base-carousel/' +
      'max-swipe-one.amp.html',
  experiments: ['amp-base-carousel', 'layers'],
  initialRect: {width: pageWidth, height: pageHeight},
}, async env => {

  let controller;

  function prop(el, name) {
    return controller.getElementProperty(el, name);
  }

  function rect(el) {
    return controller.getElementRect(el);
  }

  beforeEach(async() => {
    controller = env.controller;
  });

  describe('looping', () => {
    it('should only show one slide on each side initially', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      await expect(prop(el, 'scrollLeft')).to.equal(pageWidth);
      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * 3);
      await expect(rect(slides[0])).to.include({x: 0});
      await expect(rect(slides[1])).to.include({x: pageWidth});
      await expect(rect(slides[slides.length - 1])).to.include({
        x: -pageWidth,
      });
      await expect(prop(slides[2], 'hidden')).to.equal(true);
      await expect(prop(slides[slides.length - 2], 'hidden')).to.equal(true);
    });

    it('should show the correct slides after moving right', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      // Move right by 1 slide.
      await controller.scrollBy(el, {left: pageWidth});
      // Wait for scroll position to be reset.
      await expect(prop(el, 'scrollLeft')).to.equal(pageWidth);
      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * 3);
      await expect(rect(slides[0])).to.include({x: -pageWidth});
      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: pageWidth});
      await expect(prop(slides[slides.length - 1], 'hidden')).to.equal(true);
      await expect(prop(slides[3], 'hidden')).to.equal(true);
    });

    it('should show the correct slides after moving left', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      // Move left by 1 slide.
      await controller.scrollBy(el, {left: -pageWidth});
      // Wait for scroll position to be reset.
      await expect(prop(el, 'scrollLeft')).to.equal(pageWidth);
      // Verify the scroll width to make sure no unexpected spacers are
      // increasing the width,
      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * 3);
      await expect(rect(slides[slides.length - 2])).to.include({
        x: -pageWidth,
      });
      await expect(rect(slides[slides.length - 1])).to.include({
        x: 0,
      });
      await expect(rect(slides[0])).to.include({x: pageWidth});
      await expect(prop(slides[slides.length - 3], 'hidden')).to.equal(true);
      await expect(prop(slides[1], 'hidden')).to.equal(true);
    });
  });
});
