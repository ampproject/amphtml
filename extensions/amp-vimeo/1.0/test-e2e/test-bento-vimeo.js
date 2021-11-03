describes.endtoend(
  'bento-vimeo',
  {
    version: '1.0',
    fixture: 'bento/vimeo.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render a vimeo video', async () => {
      const element = await controller.findElement('bento-vimeo');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.equal(
        'https://player.vimeo.com/video/23237102'
      );
    });
  }
);
