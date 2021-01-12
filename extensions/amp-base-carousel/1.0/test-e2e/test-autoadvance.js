/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {getCarousel, getSlides, sleep} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel autoadvance',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/autoadvance.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;
    const styles = useStyles();

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should move forwards', async () => {
      const slides = await getSlides(styles, controller);

      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});
    });

    it('should go to start and complete two full iterations only', async () => {
      const slides = await getSlides(styles, controller);

      // first iteration
      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});

      // second iteration
      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});

      // if autoadvancing, it should have done so by now,
      // so we can be confident that the slide did not transition,
      // as expected due to auto-advance-loops="2"
      await sleep(1001);
      await expect(rect(slides[0])).to.include({x: 0});
    });

    it('should not autoadvance after using imperative api', async () => {
      await controller.switchToLight();
      const button = await controller.findElement('#next');
      await controller.click(button);

      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
      const slides = await getSlides(styles, controller);
      await expect(rect(slides[1])).to.include({x: 0});

      // if autoadvancing, it should have done so by now,
      // so we can be confident that the slide did not transition,
      // as expected due to auto-advance-loops="2"
      await sleep(1001);
      await expect(rect(slides[1])).to.include({x: 0});
    });
  }
);
