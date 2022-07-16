import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - mixed length slides without snapping',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/mixed-lengths-no-snap.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
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

    // Test mixed lengths without snapping. This is start aligned as that seems
    // make the most sense for non-snapping mixed lengths.
    describe('no snap', () => {
      const slideWidth = pageWidth * 0.75;

      // TODO(wg-components, #24195): Flaky during CI.
      it.skip('should have the correct initial slide positions', async () => {
        const slideOne = await getSlide(styles, controller, 0);
        const slideTwo = await getSlide(styles, controller, 1);

        await expect(prop(slideOne, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideOne)).to.include({x: 0});

        await expect(prop(slideTwo, 'offsetWidth')).to.equal(slideWidth);
        await expect(controller.getElementRect(slideTwo)).to.include({
          x: slideWidth,
        });
      });

      // TODO(wg-components, #24195): Flaky during CI.
      it.skip('should scroll freely', async () => {
        const el = await getScrollingElement(styles, controller);
        const slideOne = await getSlide(styles, controller, 0);

        await controller.scrollBy(el, {left: 10});
        await expect(controller.getElementRect(slideOne)).to.include({x: -10});
      });
    });
  }
);
