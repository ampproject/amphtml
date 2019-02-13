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
  getNextArrow,
  getNextArrowSlot,
  getPrevArrow,
  getPrevArrowSlot,
  getScrollingElement,
  getSlide,
} from './helpers';


describes.endtoend('AMP carousel arrows', {
}, async env => {
  /** The total number of slides in the carousel */
  const SLIDE_COUNT = 7;
  const pageWidth = 600;
  const pageHeight = 600;
  let controller;
  let ampDriver;

  function css(handle, name) {
    return controller.getElementCssValue(handle, name);
  }

  beforeEach(async() => {
    controller = env.controller;
    ampDriver = env.ampDriver;

    await controller.setWindowRect({
      width: pageWidth,
      height: pageHeight,
    });

  });

  describe('when non-looping', () => {
    let nextArrow;
    let prevArrowSlot;
    let nextArrowSlot;

    beforeEach(async() => {
      await controller.navigateTo('http://localhost:8000/test/manual/amp-carousel-0-2/non-looping.amp.html');
      await ampDriver.toggleExperiment('layers', true);
      await ampDriver.toggleExperiment('amp-carousel-v2', true);

      await controller.navigateTo(
          'http://localhost:8000/test/manual/amp-carousel-0-2/non-looping.amp.html');

      prevArrowSlot = await getPrevArrowSlot(controller);
      nextArrowSlot = await getNextArrowSlot(controller);
      nextArrow = await getNextArrow(controller);
    });

    it('should have the arrows in the correct initial state', async() => {
      await expect(css(prevArrowSlot, 'opacity')).to.equal('0');
      await expect(css(nextArrowSlot, 'opacity')).to.equal('1');
    });

    it('should show the prev arrow when going to the first slide', async() => {
      await controller.click(nextArrow);
      await expect(css(prevArrowSlot, 'opacity')).to.equal('1');
      await expect(css(nextArrowSlot, 'opacity')).to.equal('1');
    });

    it('should hide the next arrow when going to the end', async() => {
      const el = await getScrollingElement(controller);
      await controller.scrollBy(el, {left: SLIDE_COUNT * pageWidth});

      await expect(css(prevArrowSlot, 'opacity')).to.equal('1');
      await expect(css(nextArrowSlot, 'opacity')).to.equal('0');
    });
  });

  describe('with custom arrows', () => {
    let prevArrow;
    let nextArrow;

    beforeEach(async() => {
      await controller.navigateTo('http://localhost:8000/test/manual/amp-carousel-0-2/custom-arrows.amp.html');
      await ampDriver.toggleExperiment('layers', true);
      await ampDriver.toggleExperiment('amp-carousel-v2', true);

      await controller.navigateTo(
          'http://localhost:8000/test/manual/amp-carousel-0-2/custom-arrows.amp.html');

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should go to the next slide', async() => {
      const secondSlide = await getSlide(controller, 1);

      await controller.click(nextArrow);
      await expect(controller.getElementRect(secondSlide)).to.include({
        'x': 0,
      });
    });


    it('should go to the previous slide', async() => {
      const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

      await controller.click(prevArrow);
      await expect(controller.getElementRect(lastSlide)).to.include({
        'x': 0,
      });
    });
  });
});
