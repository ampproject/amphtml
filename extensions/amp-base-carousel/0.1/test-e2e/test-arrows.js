import {getNextArrow, getPrevArrow, getSlide} from './helpers';

/** The total number of slides in the carousel */
const SLIDE_COUNT = 7;

describes.endtoend(
  'amp-base-carousel - arrows with custom arrows',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/custom-arrows.amp.html',
    experiments: [
      'amp-base-carousel',
      'layers',
      'amp-lightbox-gallery-base-carousel',
    ],
    //TODO(spaharmi): fails on shadow demo
    environments: ['single', 'viewer-demo'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should go to the next slide', async () => {
      const secondSlide = await getSlide(controller, 1);

      await controller.click(nextArrow);
      await expect(controller.getElementRect(secondSlide)).to.include({
        'x': 0,
      });
    });

    it('should go to the previous slide', async () => {
      const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

      await controller.click(prevArrow);
      await expect(controller.getElementRect(lastSlide)).to.include({
        'x': 0,
      });
    });
  }
);
