import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {
  getCarousel,
  getNextArrowSlot,
  getPrevArrowSlot,
  getSlide,
} from './helpers';

/** The total number of slides in the carousel */
const SLIDE_COUNT = 7;

describes.endtoend(
  'amp-base-carousel - arrows with custom arrows',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/custom-arrows.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
  },
  async function (env) {
    const styles = useStyles();
    let controller;
    let carousel;
    let prevArrow;
    let nextArrow;

    beforeEach(async () => {
      controller = env.controller;
      carousel = await getCarousel(controller);
      nextArrow = await getNextArrowSlot(controller);
      prevArrow = await getPrevArrowSlot(controller);
    });

    afterEach(async () => {
      await controller.switchToLight();
    });

    it('should go to the next slide', async () => {
      await controller.click(nextArrow);
      await controller.switchToShadowRoot(carousel);
      const secondSlide = await getSlide(styles, controller, 1);
      await expect(controller.getElementRect(secondSlide)).to.include({
        'x': 0,
      });
    });

    it('should go to the previous slide', async () => {
      await controller.click(prevArrow);
      await controller.switchToShadowRoot(carousel);
      const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);
      await expect(controller.getElementRect(lastSlide)).to.include({
        'x': 0,
      });
    });
  }
);
