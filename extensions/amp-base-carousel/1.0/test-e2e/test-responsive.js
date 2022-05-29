import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {sleep} from '#testing/helpers';

import {getCarousel, getScrollingElement, getSlide} from './helpers';

const pageWidth = 1000;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - responsive attributes',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/responsive.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    const styles = useStyles();
    let controller;
    let carousel;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async () => {
      controller = env.controller;
      carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    // TODO(#35241): flaky test disabled in #35176
    it.skip('should layout correctly initially', async () => {
      const firstSlide = await getSlide(styles, controller, 0);

      // 3 slides width width 1000 = 333 width per slide.
      await expect(controller.getElementRect(firstSlide)).to.include({
        width: 333,
        x: 0,
      });
    });

    // TODO(#35241): flaky test disabled in #35176
    it.skip('should layout correctly after resize', async () => {
      const firstSlide = await getSlide(styles, controller, 0);

      await controller.setWindowRect({
        width: 600,
        height: 600,
      });
      // 2 slides width width 600 = 300 width per slide.
      await expect(controller.getElementRect(firstSlide)).to.include({
        width: 300,
        x: 0,
      });
    });

    // TODO(#35241): flaky test disabled in #35176
    it.skip('should retain position when changing the visible count', async () => {
      const el = await getScrollingElement(styles, controller);
      const secondSlide = await getSlide(styles, controller, 1);

      await controller.scrollTo(el, {left: 333});
      await expect(prop(el, 'scrollLeft')).to.equal(333);

      // Wait for render with updated active slide.
      await sleep(100);
      await controller.setWindowRect({
        width: 600,
        height: 600,
      });

      await expect(controller.getElementRect(secondSlide)).to.include({x: 0});
    });

    // TODO(#35241): flaky test disabled in #35176
    it.skip('should respond to attribute changes', async () => {
      const firstSlide = await getSlide(styles, controller, 0);

      // 3 slides width width 1000 = 333 width per slide.
      await expect(controller.getElementRect(firstSlide)).to.include({
        width: 333,
        x: 0,
      });
      // Switch over to `visible-count="(min-width: 650px) 5, 4".
      await controller.switchToLight();
      const btn = await controller.findElement('#responsive-5-4');
      await controller.click(btn);
      await controller.switchToShadowRoot(carousel);

      // 5 slides width width 1000 = 200 width per slide
      await expect(controller.getElementRect(firstSlide)).to.include({
        width: 200,
        x: 0,
      });
      // Now make sure new media query is active.
      await controller.setWindowRect({
        width: 600,
        height: 600,
      });
      // 4 slides width width 600 = 150 width per slide.
      await expect(controller.getElementRect(firstSlide)).to.include({
        width: 150,
        x: 0,
      });
    });
  }
);
