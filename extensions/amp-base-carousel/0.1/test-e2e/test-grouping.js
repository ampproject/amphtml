import {getScrollingElement, getSlides} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - grouping',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/grouping-move-by-2.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    const slideWidth = pageWidth / 2;
    let controller;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(function () {
      controller = env.controller;
      this.timeout(3 * 1000);
    });

    // TODO(sparhami): fails on shadow demo
    it.configure()
      .skipShadowDemo()
      .run('should snap on next group when past the midpoint', async () => {
        const el = await getScrollingElement(controller);
        const slides = await getSlides(controller);

        await controller.scrollTo(el, {left: slideWidth + 1});
        await expect(rect(slides[2])).to.include({x: 0});
      });

    // TODO(sparhami): fails on shadow demo
    it.configure()
      .skipShadowDemo()
      .run(
        'should snap on current group when before the midpoint',
        async () => {
          const el = await getScrollingElement(controller);
          const slides = await getSlides(controller);

          await controller.scrollTo(el, {left: slideWidth - 1});
          await expect(rect(slides[0])).to.include({x: 0});
        }
      );

    it.skip('should move forwards by the advance-count', async () => {
      const slides = await getSlides(controller);
      const btn = await controller.findElement('[on="tap:carousel-1.next()"]');

      await controller.click(btn);
      await expect(rect(slides[2])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[4])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[0])).to.include({x: 0});
    });

    it.skip('should move backwards by the advance-count', async () => {
      const slides = await getSlides(controller);
      const btn = await controller.findElement('[on="tap:carousel-1.prev()"]');

      await controller.click(btn);
      await expect(rect(slides[4])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[2])).to.include({x: 0});
      await controller.click(btn);
      await expect(rect(slides[0])).to.include({x: 0});
    });
  }
);
