import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {
  getCarousel,
  getNextArrow,
  getPrevArrow,
  getScrollingElement,
} from './helpers';

/** The total number of slides in the carousel */
const SLIDE_COUNT = 4;
const pageWidth = 600;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - arrows when non-looping',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/non-looping.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    const styles = useStyles();
    let controller;
    let prevArrow;
    let nextArrow;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    beforeEach(async function () {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);

      prevArrow = await getPrevArrow(styles, controller);
      nextArrow = await getNextArrow(styles, controller);
    });

    // TODO(wg-bento): getPrevArrow does not always find element in time.
    it.skip('should have the arrows in the correct initial state', async () => {
      await expect(css(prevArrow, 'opacity')).to.equal('0');
      await expect(css(nextArrow, 'opacity')).to.equal('1');
    });

    it.skip('should show the prev arrow when going to the first slide', async () => {
      await controller.click(nextArrow);
      await expect(css(prevArrow, 'opacity')).to.equal('1');
      await expect(css(nextArrow, 'opacity')).to.equal('1');
    });

    it.skip('should hide the next arrow when going to the end', async () => {
      const el = await getScrollingElement(styles, controller);
      await controller.scrollTo(el, {left: (SLIDE_COUNT - 1) * pageWidth});

      await expect(css(prevArrow, 'opacity')).to.equal('1');
      await expect(css(nextArrow, 'opacity')).to.equal('0');
    });
  }
);
