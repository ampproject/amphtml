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

import ctrlHelpers from './helpers';

const pageWidth = 1000;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - responsive attributes',
  {
    fixture: 'amp-base-carousel/responsive.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],

    versions: {
      '1.0': {
        experiments: ['bento-carousel'],
      },
      '0.1': {
        environments: ['single', 'viewer-demo'],
      },
    },
  },
  async (env) => {
    let ctrl;

    beforeEach(async () => {
      ctrl = ctrlHelpers(env);
      ctrl.maybeSwitchToShadow();
    });

    it('should layout correctly initially', async () => {
      const firstSlide = await ctrl.getSlide(0);

      ctrl.expectSlideImgLoaded(0);
      // 3 slides width width 1000 = 333 width per slide.
      await expect(ctrl.rect(firstSlide)).to.include({
        width: 333,
        x: 0,
      });
    });

    it('should layout correctly after resize', async () => {
      const firstSlide = await ctrl.getSlide(0);

      ctrl.expectSlideImgLoaded(0);
      await ctrl.setWin(600, 600);
      // 2 slides width width 600 = 300 width per slide.
      await expect(ctrl.rect(firstSlide)).to.include({
        width: 300,
        x: 0,
      });
    });

    it('should retain position when changing the visible count', async () => {
      const el = await ctrl.getScrollingElement();
      const secondSlide = await ctrl.getSlide(1);

      await ctrl.scrollTo(el, {left: 333});
      await expect(ctrl.prop(el, 'scrollLeft')).to.equal(333);

      // Wait for render with updated active slide.
      await ctrl.sleep(100);
      await ctrl.setWin(600, 600);

      await expect(ctrl.rect(secondSlide)).to.include({x: 0});
    });

    it('should respond to attribute changes', async () => {
      const firstSlide = await ctrl.getSlide(0);

      // 3 slides width width 1000 = 333 width per slide.
      await expect(ctrl.rect(firstSlide)).to.include({
        width: 333,
        x: 0,
      });
      // Switch over to `visible-count="(min-width: 650px) 5, 4".
      await ctrl.maybeSwitchToLight();
      const btn = await ctrl.findElement('#responsive-5-4');
      await ctrl.click(btn);
      await ctrl.maybeSwitchToShadow();

      // 5 slides width width 1000 = 200 width per slide
      await expect(ctrl.rect(firstSlide)).to.include({
        width: 200,
        x: 0,
      });
      // Now make sure new media query is active.
      await ctrl.setWin(600, 600);
      // 4 slides width width 600 = 150 width per slide.
      await expect(ctrl.rect(firstSlide)).to.include({
        width: 150,
        x: 0,
      });
    });
  }
);
