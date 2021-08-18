import {getScrollingElement, getSlides, getSpacersForSlide} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - mixed length slides without snapping',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/mixed-lengths-no-snap.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
    //TODO(spaharmi): fails on viewer and shadow demo
    environments: ['single'],
  },
  (env) => {
    let controller;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    async function assertSpacerWidth(index, width) {
      const spacers = await getSpacersForSlide(controller, index);
      await expect(prop(spacers[1], 'offsetWidth')).to.equal(width);
    }

    beforeEach(() => {
      controller = env.controller;
    });

    // Test mixed lengths without snapping. This is start aligned as that seems
    // make the most sense for non-snapping mixed lengths.
    describe('no snap', () => {
      const slideOneWidth = 600;
      const slideTwoWidth = 400;

      it('should have the correct initial slide positions', async () => {
        const slides = await getSlides(controller);

        // First slide has width 75%, and viewport is 600 pixels wide
        await expect(prop(slides[0], 'offsetWidth')).to.equal(slideOneWidth);
        await expect(controller.getElementRect(slides[0])).to.include({x: 0});
        await assertSpacerWidth(0, slideOneWidth);
        // Second slide has width 50%, and viewport is 400 pixels wide
        await expect(prop(slides[1], 'offsetWidth')).to.equal(slideTwoWidth);
        await expect(controller.getElementRect(slides[1])).to.include({
          x: slideOneWidth,
        });
        await assertSpacerWidth(1, slideTwoWidth);
      });

      it('should scroll freely', async () => {
        const el = await getScrollingElement(controller);
        const slides = await getSlides(controller);

        await controller.scrollBy(el, {left: 10});
        await expect(controller.getElementRect(slides[0])).to.include({x: -10});
      });
    });
  }
);
