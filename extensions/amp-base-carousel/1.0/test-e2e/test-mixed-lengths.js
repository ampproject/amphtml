import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - mixed length slides',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/mixed-lengths.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    let controller;
    const styles = useStyles();

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    // Test mixed lengths with snapping.
    // TODO(wg-bento, #24195): getSlide/getScrollingElement do not always find element in time.
    describe.skip('snap', () => {
      const slideWidth = pageWidth * 0.75;

      it('should have the correct initial slide positions', async function () {
        const slideOne = await getSlide(styles, controller, 0);
        const slideTwo = await getSlide(styles, controller, 1);

        await expect(prop(slideOne, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideOne)).to.include({
          x: (pageWidth - slideWidth) / 2,
        });

        await expect(prop(slideTwo, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideTwo)).to.include({
          x: slideWidth + (pageWidth - slideWidth) / 2,
        });
      });

      it('should snap on the center point', async function () {
        const el = await getScrollingElement(styles, controller);
        const slideTwo = await getSlide(styles, controller, 1);
        const scrollAmount = 1;

        await controller.scrollBy(el, {left: scrollAmount});
        await expect(controller.getElementRect(slideTwo)).to.include({
          x: (pageWidth - slideWidth) / 2,
        });
      });
    });
  }
);
