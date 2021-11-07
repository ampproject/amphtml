const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP Lightbox Gallery with AMP Carousel 2.0',
  {
    fixture: 'amp-lightbox/amp-lightbox-with-carousel-0.2.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],
  },
  (env) => {
    let controller;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(() => {
      controller = env.controller;
    });

    it('should open/close lightbox', async () => {
      // First open the gallery.
      const firstAmpImg = await controller.findElement('amp-img');
      await controller.click(firstAmpImg);

      // Verify it opened.
      const overlay = await controller.findElement('.i-amphtml-lbg-overlay');
      const galleryButton = await controller.findElement(
        '[data-action="gallery"]'
      );
      const closeButton = await controller.findElement('[data-action="close"]');
      await expect(css(overlay, 'opacity')).to.equal('1');
      await expect(css(galleryButton, 'opacity')).to.equal('1');
      await expect(css(closeButton, 'opacity')).to.equal('1');

      // Wait for the first slide's image to load
      const firstSlideImg = await controller.findElement(
        'amp-lightbox-gallery img'
      );
      await expect(prop(firstSlideImg, 'naturalWidth')).to.be.gt(0);
    });
  }
);
