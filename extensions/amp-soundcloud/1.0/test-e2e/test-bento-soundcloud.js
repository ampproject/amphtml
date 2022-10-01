describes.endtoend(
  'bento-soundcloud',
  {
    version: '1.0',
    fixture: 'bento/soundcloud.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render a soundcloud iframe', async () => {
      const element = await controller.findElement('bento-soundcloud');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.equal(
        'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F134337084'
      );
    });
  }
);
