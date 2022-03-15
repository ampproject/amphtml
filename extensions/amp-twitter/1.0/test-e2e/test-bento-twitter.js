describes.endtoend(
  'bento-twitter',
  {
    version: '1.0',
    fixture: 'bento/twitter.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render twitter content', async () => {
      const element = await controller.findElement('bento-twitter');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.contain(
        'dist.3p'
      );
      await expect(controller.getElementAttribute(iframe, 'name')).to.contain(
        '1356304203044499462'
      );
    });
  }
);
