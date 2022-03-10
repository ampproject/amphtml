describes.endtoend(
  'bento-accordion react e2e',
  {
    bentoComponentName: 'accordion',
    testFor: 'react',
    version: '1.0',
    fixture: 'dist/bento-accordion-e2e-build-react.html',
    environments: ['single'],
  },
  testSuite
);
describes.endtoend(
  'bento-accordion preact e2e',
  {
    bentoComponentName: 'accordion',
    testFor: 'preact',
    version: '1.0',
    fixture: 'dist/bento-accordion-e2e-build-preact.html',
    environments: ['single'],
  },
  testSuite
);

function testSuite(env) {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('should expand and collapse only one section at a time when clicking on a header', async () => {
    // ensure state of test is set
    const accordionButtons = await controller.findElements('[role="button"]');
    const accordionContent = await controller.findElements(
      '[role="button"] + div'
    );
    await expect(controller.isElementDisplayed(accordionContent[0])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be.true;

    // Open first header
    await controller.click(accordionButtons[0]);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be.true;

    // Close third header
    await controller.click(accordionButtons[2]);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be
      .false;
  });

  it('should have external controls that can affect the accordion', async () => {
    const [
      toggleSection1,
      toggleAll,
      expandSection1,
      expandAll,
      collapseSection1,
      collapseAll,
    ] = await controller.findElements('button');
    const accordionContent = await controller.findElements(
      '[role="button"] + div'
    );

    // Toggle first
    await controller.click(toggleSection1);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be.true;

    // Toggle all
    await controller.click(toggleAll);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be
      .false;

    // expand section 1
    await controller.click(expandSection1);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be
      .false;

    // expand all
    await controller.click(expandAll);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be.true;

    // collapse section 1
    await controller.click(collapseSection1);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be.true;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be.true;

    // collapse all
    await controller.click(collapseAll);

    await expect(controller.isElementDisplayed(accordionContent[0])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[1])).to.be
      .false;
    await expect(controller.isElementDisplayed(accordionContent[2])).to.be
      .false;
  });
}
