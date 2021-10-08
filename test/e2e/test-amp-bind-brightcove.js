describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-brightcove.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('with <amp-brightcove>', () => {
      it('should support binding to data-account', async () => {
        const button = await controller.findElement('#brightcoveButton');
        const iframe = await controller.findElement('#brightcove iframe');

        await expect(
          controller.getElementProperty(iframe, 'src')
        ).to.not.contain('bound');

        await controller.click(button);
        await expect(controller.getElementProperty(iframe, 'src')).to.contain(
          'bound'
        );
      });
    });
  }
);
