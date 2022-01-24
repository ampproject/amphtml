import {sleep} from '#testing/helpers';

import {getNextArrow, getPrevArrow, getSlides} from './helpers';

const pageWidth = 500;
const pageHeight = 800;

describes.endtoend(
  'amp-base-carousel - advance',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/advance.amp.html',
    experiments: ['amp-base-carousel'],
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
    });

    // TODO(micajuine-ho, #24195): This test is flaky during CI.
    it.skip('should move forwards once', async () => {
      await controller.click(nextArrow);
      await sleep(500);
      prevArrow = await getPrevArrow(controller);
      await expect(css(prevArrow, 'opacity')).to.equal('1');
      await expect(css(nextArrow, 'opacity')).to.equal('1');

      const slides = await getSlides(controller);
      const slideOne = await rect(slides[0]);
      const slideTwo = await rect(slides[1]);

      await expect(slideOne['x']).to.be.lessThan(0);
      await expect(slideTwo['x']).to.be.at.least(0);
    });
  }
);
