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

import {getCarousel, getScrollingElement, getSlide} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'Non-looping AMP carousel',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/' +
      'non-looping.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 4;
    const styles = useStyles();
    let controller;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should render correctly', async () => {
      const el = await getScrollingElement(styles, controller);

      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * SLIDE_COUNT);
    });

    it('should snap when scrolling', async () => {
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      const slideWidth = await prop(firstSlide, 'offsetWidth');
      const scrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await controller.scrollTo(el, {left: requestedScrollLeft});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    });

    it('should have the correct scroll position when resizing', async () => {
      // Note: 513 seems to be the smallest settable width.
      await controller.setWindowRect({
        width: 800,
        height: 600,
      });

      const firstSlide = await getSlide(styles, controller, 0);

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
    });
  }
);
