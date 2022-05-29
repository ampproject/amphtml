import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getNextArrow, getPrevArrow, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

// TODO(wg-bento, #24195): getSlide/getArrow does not always find element in time.
describes.endtoend(
  'amp-base-carousel - rtl',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/basic-rtl.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],
  },
  (env) => {
    const styles = useStyles();

    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it.skip('should place the second slide to the left', async () => {
      const secondSlide = await getSlide(styles, controller, 1);
      await expect(controller.getElementRect(secondSlide)).to.include({
        left: -pageWidth,
      });
    });

    it.skip('should place the last slide to the right', async () => {
      const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);
      await expect(controller.getElementRect(lastSlide)).to.include({
        left: pageWidth,
      });
    });

    it.skip('should place the arrows correctly', async () => {
      const prevArrow = await getPrevArrow(styles, controller);
      const nextArrow = await getNextArrow(styles, controller);
      await expect(controller.getElementRect(prevArrow)).to.include({
        right: pageWidth,
      });
      await expect(controller.getElementRect(nextArrow)).to.include({
        left: 0,
      });
    });
  }
);
