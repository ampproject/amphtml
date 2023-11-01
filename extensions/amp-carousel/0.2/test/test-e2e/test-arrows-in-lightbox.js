describes.endtoend(
  'amp carousel:0.2 in lightbox',
  {
    fixture: 'amp-carousel/0.2/amp-lightbox-carousel-selector.amp.html',
    environments: ['single'],
  },
  (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    function getPrevArrow() {
      return controller.findElement(
        '.amp-carousel-button.amp-carousel-button-prev'
      );
    }

    function getNextArrow() {
      return controller.findElement(
        '.amp-carousel-button.amp-carousel-button-next'
      );
    }

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
        await controller.getElementProperty(nextArrow, 'ariaDisabled')
      ).to.equal('false');
      await expect(
        await controller.getElementProperty(prevArrow, 'ariaDisabled')
      ).to.equal('false');
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
        await controller.getElementProperty(nextArrow, 'ariaDisabled')
      ).to.equal('true');
      await expect(
        await controller.getElementProperty(prevArrow, 'ariaDisabled')
      ).to.equal('false');
    });
  }
);
