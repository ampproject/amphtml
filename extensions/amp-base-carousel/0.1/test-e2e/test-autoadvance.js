import {getSlides} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - autoadvance',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/autoadvance.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    let controller;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(() => {
      controller = env.controller;
    });

    // TODO(sparhami): fails on shadow demo
    it.configure()
      .skipShadowDemo()
      .run('should move forwards', async function () {
        this.timeout(10000);
        const slides = await getSlides(controller);

        await expect(rect(slides[1])).to.include({x: 0});
        await expect(rect(slides[2])).to.include({x: 0});
        await expect(rect(slides[0])).to.include({x: 0});
      });

    it.skip('should not advance while the user is touching', async () => {
      // TODO(sparhami) Implement when touch actions are supported.
    });
  }
);
