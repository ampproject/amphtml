/**
 * TODO: The timeout is increased for cross-light/shadow DOM traversal.
 * This should be removed, but currently without it the tests are flaky.
**/
const testTimeout = 11500;
describes.endtoend(
  "bento-fit-text",
  {
    version: "1.0",
    fixture: "bento/fit-text.html",
    environments: ["single"],
  },
  (env) => {
    let controller;

    beforeEach(function () {
      this.timeout(testTimeout);
      controller = env.controller;
    });

    it("should render in correct font-size", async function () {
      await verifyElementStyles(await selectContentDiv("test1"), {
        "font-size": "32px",
      });
    });

    it("should render with overflow", async function () {
      await verifyElementStyles(await selectContentDiv("test2"), {
        "font-size": "42px",
        overflow: "hidden",
      });
    });

    it("should render in correct font-size with a lot of text", async function () {
      await verifyElementStyles(await selectContentDiv("test3"), {
        "font-size": "16px",
      });
    });

    it("should account for border dimensions", async function () {
      await verifyElementStyles(await selectContentDiv("test4"), {
        "font-size": "20px",
      });
    });

    async function selectContentDiv(id) {
      const element = await controller.findElement(`#${id}`);
      await controller.switchToShadowRoot(element);
      return await controller.findElement("div > div > div");
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
