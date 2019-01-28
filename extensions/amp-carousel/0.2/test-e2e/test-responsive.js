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

describes.endtoend('AMP Carousel responsive attributes', {
}, async env => {
  let controller;
  let ampDriver;

  function prop(el, name) {
    return controller.getElementProperty(el, name);
  }

  beforeEach(async() => {
    controller = env.controller;
    ampDriver = env.ampDriver;

    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/responsive.amp.html');
    await ampDriver.toggleExperiment('layers', true);
    await ampDriver.toggleExperiment('amp-carousel-v2', true);

    await controller.setWindowRect({
      width: 1000,
      height: 600,
    });
    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/responsive.amp.html');
  });

  it('should layout correctly initially', async() => {
    const firstSlide = await getSlide(controller, 0);

    await waitForCarouselImg(controller, 0);
    // 3 slides width width 1000 = 333 width per slide
    await expect(prop(firstSlide, 'offsetWidth')).to.equal(333);
    await expect(controller.getElementRect(firstSlide)).to.include({x: 0});
  });

  it('should layout correctly after resize', async() => {
    const firstSlide = await getSlide(controller, 0);

    await waitForCarouselImg(controller, 0);
    await controller.setWindowRect({
      width: 600,
      height: 600,
    });
    // 2 slides width width 600 = 300 width per slide
    await expect(prop(firstSlide, 'offsetWidth')).to.equal(300);
    await expect(controller.getElementRect(firstSlide)).to.include({x: 0});
  });

  it('should retain position when changing the visible count', async() => {
    const el = await getScrollingElement(controller);
    const secondSlide = await getSlide(controller, 1);

    await waitForCarouselImg(controller, 0);
    await controller.scroll(el, {left: 333});
    await expect(prop(el, 'scrollLeft')).to.equal(333);
    await controller.setWindowRect({
      width: 600,
      height: 600,
    });

    await expect(controller.getElementRect(secondSlide)).to.include({x: 0});
  });
});
