describes.endtoend(
  'amp-autocomplete',
  {
    fixture: 'amp-autocomplete/amp-autocomplete-inline.amp.html',
    // TODO: Restore 'environments' to default after supporting fourth test in
    // shadow environment.
    environments: ['single', 'viewer-demo'],
    initialRect: {width: 800, height: 800},
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('<amp-autocomplete inline> should render', async () => {
      const autocomplete = await controller.findElement('#autocomplete');
      await expect(
        controller.getElementProperty(autocomplete, 'children')
      ).to.have.length(3);

      const input = await controller.findElement('#input');
      await expect(controller.getElementAttribute(input, 'type')).to.equal(
        'text'
      );

      const script = await controller.findElement('#script');
      await expect(controller.getElementAttribute(script, 'type')).to.equal(
        'application/json'
      );

      const renderedResults = await controller.findElement(
        '.i-amphtml-autocomplete-results'
      );
      await expect(
        controller.getElementProperty(renderedResults, 'children')
      ).to.have.length(3);
      await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    });

    it('<amp-autocomplete inline> should display results on trigger', async () => {
      const renderedResults = await controller.findElement(
        '.i-amphtml-autocomplete-results'
      );
      await expect(
        controller.getElementProperty(renderedResults, 'children')
      ).to.have.length(3);

      // Does not display suggested items on blur.
      await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
      const focusButton = await controller.findElement('#focusButton');
      await controller.click(focusButton);

      // Does not display suggested items on focus.
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .not.to.be.null;
      // Does not display suggested items on any input.
      await controller.type(input, 'ap');
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .not.to.be.null;

      // Displays suggested items on trigger.
      const input = await controller.findElement('#input');
      await controller.type(input, ' @');
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .to.be.null;
    });

    it('<amp-autocomplete inline> should narrow suggestions to input', async () => {
      const renderedResults = await controller.findElement(
        '.i-amphtml-autocomplete-results'
      );
      const focusButton = await controller.findElement('#focusButton');
      await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
      await controller.click(focusButton);

      // Displays all suggested items on trigger.
      const input = await controller.findElement('#input');
      await controller.type(input, '@');
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .to.be.null;
      await expect(
        controller.getElementProperty(renderedResults, 'children')
      ).to.have.length(3);

      // New input narrows down suggested items.
      await controller.type(input, 'ap');
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .be.null;
      await expect(
        controller.getElementProperty(renderedResults, 'children')
      ).to.have.length(1);
    });

    it('<amp-autocomplete inline> should select an item', async () => {
      const renderedResults = await controller.findElement(
        '.i-amphtml-autocomplete-results'
      );
      const focusButton = await controller.findElement('#focusButton');
      await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
      await expect(
        controller.getElementProperty(renderedResults, 'children')
      ).to.have.length(3);

      // Displays all suggested items on trigger.
      const input = await controller.findElement('#input');
      await controller.click(focusButton);
      await controller.type(input, '@');
      await expect(controller.getElementAttribute(renderedResults, 'hidden')).to
        .be.null;
      const itemElements = await controller.findElements(
        '.i-amphtml-autocomplete-item'
      );
      await expect(controller.getElementText(itemElements[0])).to.equal(
        'apple'
      );
      await controller.click(itemElements[0]);

      // Displays no items after selecting one.
      await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
      await expect(controller.getElementProperty(input, 'value')).to.equal(
        '@apple '
      );
    });
  }
);
