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

const pageWidth = 1000;
const pageHeight = 600;

describes.endtoend('AMP Carousel responsive attributes', {
  testUrl: 'http://localhost:8000/test/manual/amp-base-carousel/' +
      'responsive.amp.html',
  experiments: ['amp-base-carousel', 'layers'],
  initialRect: {width: pageWidth, height: pageHeight},
  //TODO(spaharmi): fails on shadow demo
  environments: ['single', 'viewer-demo'],
}, async env => {
  let controller;

  function prop(el, name) {
    return controller.getElementProperty(el, name);
  }

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should layout correctly initially', async() => {
    const firstSlide = await getSlide(controller, 0);

    await waitForCarouselImg(controller, 0);
    // 3 slides width width 1000 = 333 width per slide.
    await expect(controller.getElementRect(firstSlide)).to.include({
      width: 333,
      x: 0,
    });
  });

  it('should layout correctly after resize', async() => {
    const firstSlide = await getSlide(controller, 0);

    await waitForCarouselImg(controller, 0);
    await controller.setWindowRect({
      width: 600,
      height: 600,
    });
    // 2 slides width width 600 = 300 width per slide.
    await expect(controller.getElementRect(firstSlide)).to.include({
      width: 300,
      x: 0,
    });
  });

  it('should retain position when changing the visible count', async() => {
    const el = await getScrollingElement(controller);
    const secondSlide = await getSlide(controller, 1);

    await controller.scroll(el, {left: 333});
    await expect(prop(el, 'scrollLeft')).to.equal(333);
    await controller.setWindowRect({
      width: 600,
      height: 600,
    });

    await expect(controller.getElementRect(secondSlide)).to.include({x: 0});
  });

  it('should respond to attribute changes', async() => {
    const firstSlide = await getSlide(controller, 0);

    // 3 slides width width 1000 = 333 width per slide.
    await expect(controller.getElementRect(firstSlide)).to.include({
      width: 333,
      x: 0,
    });
    // Switch over to `visible-count="(min-width: 650px) 5, 4".
    const btn = await controller.findElement('#responsive-5-4');
    await controller.click(btn);
    // 5 slides width width 1000 = 200 width per slide
    await expect(controller.getElementRect(firstSlide)).to.include({
      width: 200,
      x: 0,
    });
    // Now make sure new media query is active.
    await controller.setWindowRect({
      width: 600,
      height: 600,
    });
    // 4 slides width width 600 = 150 width per slide.
    await expect(controller.getElementRect(firstSlide)).to.include({
      width: 150,
      x: 0,
    });
  });
});
