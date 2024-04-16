describes.endtoend(
  'amp-lightbox',
  {
    fixture: 'amp-lightbox/amp-lightbox.html',

    versions: {
      '0.1': {
        environments: 'ampdoc-amp4ads-preset',
        experiments: ['amp-lightbox-a4a-proto'],
      },
      '1.0': {
        environments: ['single', 'viewer-demo'],
        experiments: ['bento'],
        initialRect: {width: 800, height: 800},
      },
    },
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const lightbox = await controller.findElement('#lightbox');
      await expect(controller.getElementProperty(lightbox, 'hidden')).to.be
        .true;

      const image = await controller.findElement('#image');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.equal(0);
    });

    it('should open the lightbox', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const lightbox = await controller.findElement('#lightbox');
      await expect(controller.getElementProperty(lightbox, 'hidden')).to.be
        .false;

      const documentElement = await controller.getDocumentElement();
      const width = await controller.getElementProperty(
        documentElement,
        'clientWidth'
      );
      await expect(
        controller.getElementProperty(lightbox, 'clientWidth')
      ).to.equal(width);

      const backingImageOrLoader = await controller.findElement(
        '#image img, #image .i-amphtml-loader-background'
      );
      await expect(
        controller.getElementProperty(backingImageOrLoader, 'clientWidth')
      ).to.equal(641);
    });

    it('should close the lightbox', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const lightbox = await controller.findElement('#lightbox');
      await expect(controller.getElementProperty(lightbox, 'hidden')).to.be
        .false;

      const close = await controller.findElement('#close');
      await controller.click(close);

      await expect(controller.getElementProperty(lightbox, 'hidden')).to.be
        .true;
    });
  }
);
