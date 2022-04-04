import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 600;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - vertical orientation',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/vertical.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
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

    // TODO(wg-bento, #24195): getScrollingElement does not always find element in time.
    it.skip('should render correctly', async () => {
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      // We should have space for all slides
      const slideHeight = await prop(firstSlide, 'offsetHeight');
      await expect(prop(el, 'scrollHeight')).to.equal(
        slideHeight * SLIDE_COUNT
      );
    });

    // TODO(wg-bento, #24195): getScrollingElement does not always find element in time.
    it.skip('should snap when scrolling', async () => {
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      const slideHeight = await prop(firstSlide, 'offsetHeight');
      const scrollTop = await prop(el, 'scrollTop');
      const snappedScrollTop = scrollTop + slideHeight;
      const requestedScrollTop = snappedScrollTop + 1;

      await controller.scrollTo(el, {top: requestedScrollTop});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(prop(el, 'scrollTop')).to.equal(snappedScrollTop);
    });

    // TODO(wg-bento, #24195): getScrollingElement does not always find element in time.
    it.skip('should reset the window after scroll', async function () {
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      const slideHeight = await prop(firstSlide, 'offsetHeight');
      const scrollHeight = await prop(el, 'scrollHeight');
      const scrollTop = await prop(el, 'scrollTop');
      const snappedScrollTop = scrollTop + slideHeight;
      const requestedScrollTop = snappedScrollTop + 1;

      await controller.scrollTo(el, {top: requestedScrollTop});
      // Wait for the scrolling to settle
      await expect(prop(el, 'scrollTop')).to.equal(snappedScrollTop);

      // The new scroll width/left should eventually be the same as before,
      // since the windowing should have been reset around the new element.
      await expect(prop(el, 'scrollHeight')).to.equal(scrollHeight);
      await expect(prop(el, 'scrollTop')).to.equal(scrollTop);
    });

    // TODO(wg-bento): getScrollingElement does not always find element in time.
    describe.skip('looping', () => {
      it('should display slides correctly when moving forwards', async () => {
        const el = await getScrollingElement(styles, controller);
        const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move.
        const slideHeight = await prop(lastSlide, 'offsetHeight');
        const restingScrollTop = await prop(el, 'scrollTop');
        await controller.scrollBy(el, {
          top: slideHeight * (SLIDE_COUNT - 1),
        });

        await expect(prop(el, 'scrollTop')).to.equal(restingScrollTop);
        await expect(controller.getElementRect(lastSlide)).to.include({
          height: slideHeight,
        });
      });

      it('should display slides correctly when moving backwards', async () => {
        const el = await getScrollingElement(styles, controller);
        const secondSlide = await getSlide(styles, controller, 1);

        // Go to the last slide, wait for scrolling to move.
        const slideHeight = await prop(secondSlide, 'offsetHeight');
        const restingScrollTop = await prop(el, 'scrollTop');
        await controller.scrollBy(el, {
          top: -(slideHeight * (SLIDE_COUNT - 1)),
        });

        await expect(prop(el, 'scrollTop')).to.not.equal(restingScrollTop);
        await expect(prop(el, 'scrollTop')).to.equal(restingScrollTop);
      });
    });
  }
);
