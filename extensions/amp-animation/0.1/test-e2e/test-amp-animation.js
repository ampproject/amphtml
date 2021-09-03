describes.endtoend(
  'amp-animation',
  {
    fixture: 'amp-animation/simple.html',
    // TODO(powerivq): Reenable for all environments
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    // TODO(#33438, wg-components): Fix flakiness
    it.skip('transparency animation should pause and restart', async () => {
      const cancelBtn = await controller.findElement('#cancelBtn');
      await controller.click(cancelBtn);

      const elem = await controller.findElement('#image');
      await expect(controller.getElementCssValue(elem, 'opacity')).to.equal(
        '1'
      );

      const restartBtn = await controller.findElement('#restartBtn');
      await controller.click(restartBtn);
      await expect(controller.getElementCssValue(elem, 'opacity')).to.equal(
        '0'
      );
    });
  }
);
