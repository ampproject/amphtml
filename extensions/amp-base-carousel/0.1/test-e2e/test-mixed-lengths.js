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

import {getScrollingElement, getSlides, getSpacersForSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel mixed length slides',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/' +
      'mixed-lengths.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async env => {
    let controller;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    async function assertSpacerWidth(index, width) {
      const spacers = await getSpacersForSlide(controller, index);
      await expect(prop(spacers[1], 'offsetWidth')).to.equal(width);
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    // Test mixed lengths with snapping. This is center aligned as that seems
    // make the most sense for snapping mixed lengths.
    describe('snap', () => {
      const slideOneWidth = 600;
      const slideTwoWidth = 400;

      it('should have the correct initial slide positions', async () => {
        const slides = await getSlides(controller);

        // First slide has width 75%, and viewport is 600 pixels wide
        await expect(prop(slides[0], 'offsetWidth')).to.equal(slideOneWidth);
        await expect(controller.getElementRect(slides[0])).to.include({
          x: (pageWidth - slideOneWidth) / 2,
        });
        await assertSpacerWidth(0, slideOneWidth);
        // Second slide has width 50%, and viewport is 400 pixels wide
        await expect(prop(slides[1], 'offsetWidth')).to.equal(slideTwoWidth);
        await expect(controller.getElementRect(slides[1])).to.include({
          x: slideOneWidth + (pageWidth - slideOneWidth) / 2,
        });
        await assertSpacerWidth(1, slideTwoWidth);
      });

      //TODO(sparhami): fails on shadow demo
      it.configure()
        .skipShadowDemo()
        .run('should snap on the center point', async () => {
          const el = await getScrollingElement(controller);
          const slides = await getSlides(controller);
          const scrollAmount = 1 + (slideOneWidth + slideTwoWidth) / 2;

          await controller.scrollBy(el, {left: scrollAmount});
          await expect(controller.getElementRect(slides[1])).to.include({
            x: (pageWidth - slideTwoWidth) / 2,
          });
        });
    });
  }
);
