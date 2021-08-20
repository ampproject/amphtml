import {getPrevArrow, getSlides} from './helpers';

describes.endtoend(
  'amp base carousel in lightbox go to slide',
  {
    fixture: 'amp-base-carousel/arrows-in-lightbox.amp.html',
    environments: ['single'],
  },
  (env) => {
    let controller;
    let slides;
    let prevArrow;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should move to first slide when prev arrow is clicked', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Expect second slide to be shown
      slides = await getSlides(controller);
      await expect(controller.getElementRect(slides[1])).to.include({x: 0});

      // Click prev arrow
      prevArrow = await getPrevArrow(controller);
      await controller.click(prevArrow);

      slides = await getSlides(controller);
      await expect(controller.getElementRect(slides[0])).to.include({x: 0});
    });
  }
);
