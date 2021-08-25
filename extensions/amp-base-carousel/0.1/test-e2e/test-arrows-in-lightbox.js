import {getNextArrow, getPrevArrow} from './helpers';

describes.endtoend(
  'amp base carousel in lightbox',
  {
    fixture: 'amp-base-carousel/arrows-in-lightbox.amp.html',
    environments: ['single'],
  },
  (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should open with both arrows', async () => {
      // Click on image 2
      const secondImage = await controller.findElement('#second');
      await controller.click(secondImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Both arrows should be showing
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('1');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('1');
    });

    it('should open with one arrow', async () => {
      // Click on last image
      const lastImage = await controller.findElement('#fourth');
      await controller.click(lastImage);

      // Wait for lightbox to load the carousel and image
      const lightbox = await controller.findElement('#lightbox1');
      await expect(await controller.getElementProperty(lightbox, 'style')).to
        .not.be.null;

      // Only prev arrow should be showing since non-looping carousel is on the last slide.
      prevArrow = await getPrevArrow(controller);
      nextArrow = await getNextArrow(controller);
      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('1');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('0');
    });
  }
);
