describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-iframe.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('with <amp-iframe>', () => {
      it('should support binding to src', async () => {
        const button = await controller.findElement('#iframeButton');
        const ampIframe = await controller.findElement('#ampIframe');
        const iframe = await controller.findElement('#ampIframe iframe');

        const newSrc = 'https://giphy.com/embed/DKG1OhBUmxL4Q';
        await expect(
          controller.getElementAttribute(ampIframe, 'src')
        ).to.not.contain(newSrc);
        await expect(
          controller.getElementProperty(iframe, 'src')
        ).to.not.contain(newSrc);

        await controller.click(button);
        await expect(
          controller.getElementAttribute(ampIframe, 'src')
        ).to.contain(newSrc);
        await expect(controller.getElementProperty(iframe, 'src')).to.contain(
          newSrc
        );
      });
    });
  }
);
