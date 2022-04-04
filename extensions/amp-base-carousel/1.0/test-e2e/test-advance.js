import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {sleep} from '#testing/helpers';

import {getCarousel, getNextArrow, getPrevArrow, getSlides} from './helpers';

const pageWidth = 500;
const pageHeight = 800;

describes.endtoend(
  'amp-base-carousel - advance',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/advance.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    let controller;
    let nextArrow;
    let prevArrow;
    const styles = useStyles();

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);

      nextArrow = await getNextArrow(styles, controller);
      prevArrow = await getPrevArrow(styles, controller);
    });

    // TODO(carolineliu, #24195): This test is flaky during CI.
    it.skip('should move forwards once', async () => {
      await controller.click(nextArrow);

      // Wait for render with updated active slide.
      await sleep(400);

      await expect(css(prevArrow, 'opacity')).to.equal('1');
      await expect(css(nextArrow, 'opacity')).to.equal('1');

      const slides = await getSlides(styles, controller);
      const slideOne = await rect(slides[0]);
      const slideTwo = await rect(slides[1]);

      await expect(slideOne['x']).to.be.lessThan(0);
      await expect(slideTwo['x']).to.be.at.least(0);
    });
  }
);
