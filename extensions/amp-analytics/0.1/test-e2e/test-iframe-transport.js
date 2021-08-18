describes.endtoend(
  'amp-analytics iframe transport',
  {
    fixture: 'amphtml-ads/botguard.a4a.html',
    environments: ['a4a-fie'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should inject transport iframe in the parent doc', async () => {
      await controller.switchToParent();
      const transportIframe = await controller.findElement('body > iframe');
      await expect(
        controller.getElementAttribute(transportIframe, 'src')
      ).to.equal('https://tpc.googlesyndication.com/b4a/b4a-runner.html');
      await expect(
        controller.getElementAttribute(transportIframe, 'sandbox')
      ).to.equal('allow-scripts allow-same-origin');
      await expect(
        controller.getElementAttribute(transportIframe, 'name')
      ).to.equal(
        '{"scriptSrc":"http://localhost:8000/dist/iframe-transport-client-lib.js","sentinel":"1","type":"bg"}'
      );
      await expect(
        controller.getElementAttribute(transportIframe, 'data-amp-3p-sentinel')
      ).to.equal('1');
    });
  }
);
