describes.endtoend(
  'bento-video-iframe',
  {
    version: '1.0',
    fixture: 'bento/video-iframe.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render a iframe with a video', async () => {
      const element = await controller.findElement('bento-video-iframe');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.equal(
        '/examples/amp-video-iframe/frame.html'
      );
    });
  }
);
