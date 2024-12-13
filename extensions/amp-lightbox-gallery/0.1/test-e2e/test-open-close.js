const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP Lightbox Gallery Open/Close',
  {
    fixture: 'amp-lightbox/amp-lightbox-gallery-launch.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    // TODO(sparhami) Get this working in other environments.
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

    // TODO(sparhami) Cover swipe to dismiss if possible.
    // TODO(sparhami) Test basic transition to gallery and back.
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

      // Now close the gallery via button click and wait for it to close.
      await controller.click(closeButton);
      await controller.findElement('amp-lightbox-gallery[hidden]');
    });

    it('should display the image that opened the lightbox', async () => {
      const clickedImage = await controller.findElement('#basic-2');

      const imageSrc = await controller.getElementAttribute(
        clickedImage,
        'src'
      );

      await controller.click(clickedImage);

      const slideImage = await controller.findElement(
        // pick the img element with the same src as the clickedImage,
        // inside the non hidden slide (this is the active slide),
        // that is inside the amp-light-box with the default group id
        `[amp-lightbox-group="default"] .amp-carousel-slide[aria-hidden="false"] img[src="${imageSrc}"]`
      );

      const activeImageRect = await controller.getElementRect(slideImage);
      // If x is negative, it means this is the previous active slide, if positive it is the next slide. But if 0, it is the active slide
      await expect(activeImageRect.x).to.equal(0);
    });
  }
);
