/**
 * TODO: The timeout is increased for cross-light/shadow DOM traversal.
 * This should be removed, but currently without it the tests are flaky.
 **/
const testTimeout = 11500;

describes.endtoend(
  'amp-fit-text',
  {
    fixture: 'amp-fit-text/1.0/amp-fit-text.html',
    environments: 'ampdoc-preset',
    experiments: ['amp-fit-text-v2'],
  },
  (env) => {
    let controller;

    beforeEach(async function () {
      this.timeout(testTimeout);
      controller = env.controller;
    });

    it.skip('should render in correct font-size', async function () {
      await verifyElementStyles(await selectContentDiv('test1'), {
        'font-size': '32px',
      });
    });

    it.skip('should render with overflow', async function () {
      await verifyElementStyles(await selectContentDiv('test2'), {
        'font-size': '42px',
        'overflow': 'hidden',
      });
    });

    it.skip('should render in correct font-size with a lot of text', async function () {
      await verifyElementStyles(await selectContentDiv('test3'), {
        'font-size': '16px',
      });
    });

    it.skip('should account for border dimensions', async function () {
      await verifyElementStyles(await selectContentDiv('test4'), {
        'font-size': '20px',
      });
    });

    async function selectContentDiv(id) {
      const element = await controller.findElement(`#${id}`);
      await controller.switchToShadowRoot(element);
      return await controller.findElement('div > div > div');
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
