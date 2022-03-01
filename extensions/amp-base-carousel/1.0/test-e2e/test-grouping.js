import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;
const advanceCount = 2;
const slideCount = 8;
const pivotIndex = Math.floor(slideCount / 2);
const expectedScrollPosition = (pageWidth / advanceCount) * pivotIndex;

describes.endtoend(
  'amp-base-carousel - grouping',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/grouping-move-by-2.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],
  },
  (env) => {
    let controller, btnPrev, btnNext;

    const styles = useStyles();

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async function () {
      controller = env.controller;
      // Retrieve buttons before entering shadow root
      btnPrev = await controller.findElement('[on="tap:carousel-1.prev()"]');
      btnNext = await controller.findElement('[on="tap:carousel-1.next()"]');
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should move forwards by the advance-count', async () => {
      const el = await getScrollingElement(styles, controller);
      await expect(prop(el, 'scrollLeft')).to.equal(expectedScrollPosition);

      const slide0 = await getSlide(styles, controller, 0);
      await expect(prop(slide0, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnNext);
      const slide2 = await getSlide(styles, controller, 2);
      await expect(prop(slide2, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnNext);
      const slide4 = await getSlide(styles, controller, 4);
      await expect(prop(slide4, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnNext);
      const slide6 = await getSlide(styles, controller, 6);
      await expect(prop(slide6, 'offsetLeft')).to.equal(expectedScrollPosition);
    });

    it.skip('should move backwards by the advance-count', async () => {
      const el = await getScrollingElement(styles, controller);
      await expect(prop(el, 'scrollLeft')).to.equal(expectedScrollPosition);

      const slide0 = await getSlide(styles, controller, 0);
      await expect(prop(slide0, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnPrev);
      const slide6 = await getSlide(styles, controller, 6);
      await expect(prop(slide6, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnPrev);
      const slide4 = await getSlide(styles, controller, 4);
      await expect(prop(slide4, 'offsetLeft')).to.equal(expectedScrollPosition);

      await controller.click(btnPrev);
      const slide2 = await getSlide(styles, controller, 2);
      await expect(prop(slide2, 'offsetLeft')).to.equal(expectedScrollPosition);
    });
  }
);
