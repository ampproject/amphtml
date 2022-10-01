import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - non-looping',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/non-looping.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
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

    // TODO(wg-components, #24195): Flaky during CI.
    it.skip('should render correctly', async () => {
      const el = await getScrollingElement(styles, controller);

      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * SLIDE_COUNT);
    });

    // TODO(wg-bento, #24195): getScrollingElement does not always find element in time.
    it.skip('should snap when scrolling', async () => {
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

    // TODO(wg-bento, #24195): Flaky
    it.skip('should have the correct scroll position when resizing', async () => {
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
