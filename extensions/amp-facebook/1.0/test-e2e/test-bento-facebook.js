describes.endtoend(
  'bento-facebook',
  {
    version: '1.0',
    fixture: 'bento/facebook.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render facebook content', async () => {
      const element = await controller.findElement('bento-facebook');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.contain(
        'dist.3p'
      );
      await expect(controller.getElementAttribute(iframe, 'name')).to.contain(
        'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772'
      );
    });
  }
);
