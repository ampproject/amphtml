import {afterRenderPromise} from '#testing/helpers';

import {getNextArrow, getSlides} from './helpers';

describes.endtoend(
  'AMP carousel 0.2 with responsive slides',
  {
    fixture: 'amp-carousel/0.2/responsive-slides.amp.html',
    experiments: ['amp-carousel'],
    environments: ['single'],
  },
  async function (env) {
    let controller;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(() => {
      controller = env.controller;
    });

    it('layout properly and show images', async () => {
      const slides = await getSlides(controller);
      let slideRect = await rect(slides[0]);
      const nextArrow = await getNextArrow(controller);

      // Check the size of the image
      await expect(slideRect['width']).to.be.greaterThan(0);
      await expect(slideRect['height']).to.be.greaterThan(0);

      await controller.click(nextArrow);
      await afterRenderPromise();
      slideRect = await rect(slides[1]);

      // Check the size of the new image
      await expect(slideRect['width']).to.be.greaterThan(0);
      await expect(slideRect['height']).to.be.greaterThan(0);
    });
  }
);
