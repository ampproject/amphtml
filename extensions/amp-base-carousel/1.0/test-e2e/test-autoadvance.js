import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {afterRenderPromise, sleep} from '#testing/helpers';

import {getCarousel, getSlides} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - autoadvance',
  {
    version: '1.0',
    fixture: 'amp-base-carousel/1.0/autoadvance.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;
    const styles = useStyles();

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    // TODO(wg-bento, #24195): getSlides does not always find elements in time.
    it.skip('should move forwards', async () => {
      const slides = await getSlides(styles, controller);

      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});
    });

    // TODO(wg-bento, #24195): getSlides does not always find elements in time.
    it.skip('should go to start and complete two full iterations only', async () => {
      const slides = await getSlides(styles, controller);

      // first iteration
      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});

      // second iteration
      await expect(rect(slides[1])).to.include({x: 0});
      await expect(rect(slides[2])).to.include({x: 0});
      await expect(rect(slides[0])).to.include({x: 0});

      // if autoadvancing, it should have done so by now,
      // so we can be confident that the slide did not transition,
      // as expected due to auto-advance-loops="2"
      await sleep(1001);
      await expect(rect(slides[0])).to.include({x: 0});
    });

    it('should not autoadvance after using imperative api', async () => {
      await controller.switchToLight();
      const button = await controller.findElement('#next');
      await controller.click(button);

      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
      const slides = await getSlides(styles, controller);
      await expect(rect(slides[1])).to.include({x: 0});

      // if autoadvancing, it should have done so by now,
      // so we can be confident that the slide did not transition,
      // as expected due to auto-advance-loops="2"
      await afterRenderPromise();
      await expect(rect(slides[1])).to.include({x: 0});
    });
  }
);
