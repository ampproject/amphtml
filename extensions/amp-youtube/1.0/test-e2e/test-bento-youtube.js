describes.endtoend(
  'bento-youtube',
  {
    version: '1.0',
    fixture: 'bento/youtube.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render a youtube video', async () => {
      const element = await controller.findElement('bento-youtube');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.equal(
        'https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1&amp=1&playsinline=1'
      );
    });
  }
);
