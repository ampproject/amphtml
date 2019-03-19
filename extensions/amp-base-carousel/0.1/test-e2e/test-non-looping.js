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
  getSlide,
  waitForCarouselImg,
} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend('Non-looping AMP carousel', {
  testUrl: 'http://localhost:8000/test/manual/amp-base-carousel/' +
      'non-looping.amp.html',
  experiments: ['amp-base-carousel', 'layers'],
  initialRect: {width: pageWidth, height: pageHeight},
}, async env => {
  /** The total number of slides in the carousel */
  const SLIDE_COUNT = 7;
  let controller;

  function prop(el, name) {
    return controller.getElementProperty(el, name);
  }

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should render correctly', async() => {
    const el = await getScrollingElement(controller);

    await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * SLIDE_COUNT);
    await waitForCarouselImg(controller, 0);
    await controller.takeScreenshot('screenshots/render.png');
  });

  it('should layout the adjacent slide', async() => {
    // TODO(sparhami) Verify this is on the right of the 0th slide
    await waitForCarouselImg(controller, 1);
  });

  it('should snap when scrolling', async() => {
    const el = await getScrollingElement(controller);
    const firstSlide = await getSlide(controller, 0);

    // Wait for the first two slides's imgs to load.
    await waitForCarouselImg(controller, 0);
    await waitForCarouselImg(controller, 1);

    const slideWidth = await prop(firstSlide, 'offsetWidth');
    const scrollLeft = await prop(el, 'scrollLeft');
    const snappedScrollLeft = scrollLeft + slideWidth;
    const requestedScrollLeft = snappedScrollLeft + 1;

    await controller.scroll(el, {left: requestedScrollLeft});
    // We should have snapped to the edge of the slide rather than the
    // requested scroll position.
    await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    await controller.takeScreenshot('screenshots/snapped.png');
  });

  it('should have the correct scroll position when resizing', async() => {
    // Note: 513 seems to be the smallest settable width.
    await controller.setWindowRect({
      width: 800,
      height: 600,
    });

    const firstSlide = await getSlide(controller, 0);

    // Wait for the first two slides's imgs to load.
    await waitForCarouselImg(controller, 0);
    await waitForCarouselImg(controller, 1);
    await expect(controller.getElementRect(firstSlide)).to.include({
      'x': 0,
      'width': 800,
    });

    await controller.setWindowRect({
      width: 900,
      height: 600,
    });

    // Normally, resizing would cause the position to change. We're testing
    // that the carousel moves this to the correct position again.
    await expect(controller.getElementRect(firstSlide)).to.include({
      'x': 0,
      'width': 900,
    });
    await controller.takeScreenshot('screenshots/after-resize.png');
  });
});
