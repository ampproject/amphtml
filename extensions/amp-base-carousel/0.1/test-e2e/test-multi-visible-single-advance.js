import {awaitFrameAfter} from '#testing/helpers';

import {getNextArrow, getPrevArrow, getSlides} from './helpers';

describes.endtoend(
  'amp-base-carousel - advancing with multiple visible slides',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/multi-visible-single-advance.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should not go forward past end and it should be able to go back correctly', async function () {
      this.timeout(10000);
      const slideCount = 7;
      const slidesInView = 3;
      const slides = await getSlides(controller);

      // Click `next` to get to the end
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(nextArrow);
        // Need to sleep due to amp-base-carousel buffering clicks
        await awaitFrameAfter(500);
      }

      let slideRect = await rect(slides[slideCount - slidesInView]);
      // Check that last 3 slides are in view
      // Less than 5 for flakiness that comes from `controller.getElementRect()`
      await expect(slideRect['x']).to.be.lessThan(5);

      // Check that arrows are correctly enabled/disabled
      await expect(controller.getElementProperty(nextArrow, 'disabled')).to.be
        .true;
      await expect(controller.getElementProperty(prevArrow, 'disabled')).to.be
        .false;

      // Click `prev` the correct number of times to take us back to first slide.
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(prevArrow);
        await awaitFrameAfter(500);
      }

      slideRect = await rect(slides[0]);
      // Check that last 3 slides are in view
      // Less than 5 for flakiness that comes from `controller.getElementRect()`
      await expect(slideRect['x']).to.be.lessThan(5);

      // Check that arrows are correctly enabled/disabled
      await expect(controller.getElementProperty(nextArrow, 'disabled')).to.be
        .false;
      await expect(controller.getElementProperty(prevArrow, 'disabled')).to.be
        .true;
    });
  }
);
