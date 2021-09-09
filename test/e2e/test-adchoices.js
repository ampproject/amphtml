describes.endtoend(
  'ad choices',
  {
    fixture: 'amphtml-ads/text.html',
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('interactions', async () => {
      const infoDiv = await controller.findElement('#spv1');
      await expect(controller.getElementCssValue(infoDiv, 'top')).to.be.equal(
        '-250px'
      );

      const infoBtn = await controller.findElement('#cbb');
      await controller.click(infoBtn);

      await expect(controller.getElementCssValue(infoDiv, 'top')).to.be.equal(
        '0px'
      );

      const whyBtn = await controller.findElement('a#sbtn');
      await controller.click(whyBtn);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);
      await expect(await controller.getCurrentUrl()).to.match(/\/\?why$/);
    });
  }
);
