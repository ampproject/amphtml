describes.endtoend(
  'amp-auto-lightbox e2e',
  {
    fixture: 'amp-auto-lightbox/amp-auto-lightbox.html',
    initialRect: {width: 600, height: 600},
    environments: ['single'],
    browsers: ['chrome'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should insert amp-lightbox-gallery extension script', async () => {
      const element = await controller.findElement(
        'head > script[custom-element=amp-lightbox-gallery]'
      );
      await expect(controller.getElementAttribute(element, 'src')).to.contain(
        'amp-lightbox-gallery'
      );
    });

    it('should visit all images', async () => {
      const elements = await controller.findElements('amp-img');
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(
            elements[i],
            'i-amphtml-auto-lightbox-visited'
          )
        ).to.equal('');
      }
    });

    it('should auto lightbox images', async () => {
      const elements = await controller.findElements(
        'amp-img[data-should-be-lightboxed]'
      );
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(elements[i], 'lightbox')
        ).to.contain('i-amphtml-auto-lightbox');
      }
    });

    it('should not auto lightbox images', async () => {
      const elements = await controller.findElements(
        'amp-img:not([data-should-be-lightboxed])'
      );
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(elements[i], 'lightbox')
        ).to.equal(null);
      }
    });
  }
);
