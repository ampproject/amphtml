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

import {getCarousel, getScrollingElement, getSlide} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - mixed length slides',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/mixed-lengths.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async (env) => {
    let controller;
    const styles = useStyles();

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    // Test mixed lengths with snapping.
    // TODO(wg-bento, #24195): getSlide/getScrollingElement do not always find element in time.
    describe.skip('snap', () => {
      const slideWidth = pageWidth * 0.75;

      it('should have the correct initial slide positions', async function () {
        const slideOne = await getSlide(styles, controller, 0);
        const slideTwo = await getSlide(styles, controller, 1);

        await expect(prop(slideOne, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideOne)).to.include({
          x: (pageWidth - slideWidth) / 2,
        });

        await expect(prop(slideTwo, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideTwo)).to.include({
          x: slideWidth + (pageWidth - slideWidth) / 2,
        });
      });

      it('should snap on the center point', async function () {
        const el = await getScrollingElement(styles, controller);
        const slideTwo = await getSlide(styles, controller, 1);
        const scrollAmount = 1;

        await controller.scrollBy(el, {left: scrollAmount});
        await expect(controller.getElementRect(slideTwo)).to.include({
          x: (pageWidth - slideWidth) / 2,
        });
      });
    });
  }
);
