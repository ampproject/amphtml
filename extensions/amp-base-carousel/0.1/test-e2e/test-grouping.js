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

describes.endtoend('AMP carousel grouping', {
  testUrl: 'http://localhost:8000/test/manual/amp-base-carousel/' +
      'grouping-move-by-2.amp.html',
  experiments: ['amp-base-carousel', 'layers'],
  initialRect: {width: pageWidth, height: pageHeight},
}, async env => {
  const slideWidth = pageWidth / 2;
  let controller;

  function rect(el) {
    return controller.getElementRect(el);
  }

  beforeEach(async() => {
    controller = env.controller;
  });

  describe('snapping', () => {
    it('should snap on next group when past the midpoint', async() => {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);

      await controller.scrollBy(el, {left: slideWidth + 1});
      await expect(rect(slides[2])).to.include({x: 0});
    });

    // TODO(sparhami) It seems like scrolling by even 1 pixel using scrollBy
    // causes snap now. Need touch event support to actually simulate the  user
    // scrolling.
    it.skip('should snap on current group when before the midpoint',
        async() => {
          const el = await getScrollingElement(controller);
          const slides = await getSlides(controller);

          await controller.scrollBy(el, {left: slideWidth - 1});
          await expect(rect(slides[0])).to.include({x: 0});
        });
  });

  describe('advancing', () => {
    it('should move forwards by the advance-count', async() => {
      const slides = await getSlides(controller);
      const btn = await controller.findElement('[on="tap:carousel-1.next()"]');

      await controller.click(btn);
      await expect(rect(slides[2])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[4])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[0])).to.include({x: 0});
    });

    it('should move backwards by the advance-count', async() => {
      const slides = await getSlides(controller);
      const btn = await controller.findElement('[on="tap:carousel-1.prev()"]');

      await controller.click(btn);
      await expect(rect(slides[4])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[2])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[0])).to.include({x: 0});
    });
  });
});
