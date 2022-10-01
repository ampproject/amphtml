import {getNextArrow, getPrevArrow, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;
const arrowMargin = 12;

describes.endtoend(
  'amp-base-carousel - rtl',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/basic-rtl.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
    // TODO(sparhami) Make other environments work too
    environments: ['single'],
  },
  (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;
    beforeEach(() => {
      controller = env.controller;
    });

    it('should place the second slide to the left', async () => {
      const secondSlide = await getSlide(controller, 1);
      await expect(controller.getElementRect(secondSlide)).to.include({
        left: -pageWidth,
      });
    });

    it('should place the last slide to the right', async () => {
      const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);
      await expect(controller.getElementRect(lastSlide)).to.include({
        left: pageWidth,
      });
    });

    it('should place the arrows correctly', async () => {
      const prevArrow = await getPrevArrow(controller);
      const nextArrow = await getNextArrow(controller);
      // TODO(sparhami) seems like it would be better to modify getElementRect
      // to return us the right coordinate as well like DomRect.
      await expect(controller.getElementRect(prevArrow)).to.include({
        right: pageWidth - arrowMargin,
      });
      await expect(controller.getElementRect(nextArrow)).to.include({
        left: arrowMargin,
      });
    });
  }
);
