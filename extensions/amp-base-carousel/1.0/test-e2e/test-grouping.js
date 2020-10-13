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

import {getCarousel, getSlide} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel grouping',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/' +
      'grouping-move-by-2.amp.html',
    experiments: ['amp-base-carousel-bento'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller, btnPrev, btnNext;

    const styles = useStyles();

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async function () {
      controller = env.controller;
      // Retrieve buttons before entering shadow root
      btnPrev = await controller.findElement('[on="tap:carousel-1.prev()"]');
      btnNext = await controller.findElement('[on="tap:carousel-1.next()"]');
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should move forwards by the advance-count', async () => {
      await controller.click(btnNext);
      const slide2 = await getSlide(styles, controller, 2);
      await expect(rect(slide2)).to.include({x: 800});

      await controller.click(btnNext);
      const slide4 = await getSlide(styles, controller, 4);
      await expect(rect(slide4)).to.include({x: 800});

      await controller.click(btnNext);
      const slide6 = await getSlide(styles, controller, 6);
      await expect(rect(slide6)).to.include({x: 800});
    });

    it('should move backwards by the advance-count', async () => {
      await controller.click(btnPrev);
      const slide6 = await getSlide(styles, controller, 6);
      await expect(rect(slide6)).to.include({x: 0});

      await controller.click(btnPrev);
      const slide4 = await getSlide(styles, controller, 4);
      await expect(rect(slide4)).to.include({x: 0});

      await controller.click(btnPrev);
      const slide2 = await getSlide(styles, controller, 2);
      await expect(rect(slide2)).to.include({x: 0});
    });
  }
);
