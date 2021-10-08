describes.endtoend(
  'amp-fit-text',
  {
    fixture: 'amp-fit-text/0.1/amp-fit-text.html',
    environments: 'ampdoc-amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render in correct font-size', async () => {
      await verifyElementStyles(await selectContentDiv('test1'), {
        'font-size': '32px',
      });

      await verifyElementStyles(await selectContentDiv('test2'), {
        'font-size': '42px',
        'overflow': 'hidden',
      });

      await verifyElementStyles(await selectContentDiv('test3'), {
        'font-size': '16px',
      });

      await verifyElementStyles(await selectContentDiv('test4'), {
        'font-size': '20px',
      });
    });

    async function selectContentDiv(id) {
      return await controller.findElement(
        `#${id} .i-amphtml-fit-text-content > div`
      );
    }

    async function verifyElementStyles(element, styles) {
      for (const name in styles) {
        const value = styles[name];
        await expect(controller.getElementCssValue(element, name)).to.equal(
          value
        );
      }
    }
  }
);
