describes.endtoend(
  'bento-autocomplete',
  {
    version: '1.0',
    fixture: 'bento/autocomplete.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('renders the autocomplete', async () => {
      const element = await controller.findElement('bento-autocomplete');
      await expect(controller.isElementDisplayed(element)).to.be.true;

      const input = await controller.findElement('input#autocomplete');
      await expect(controller.isElementDisplayed(input)).to.be.true;
    });

    describe('default autocomplete', () => {
      it('displays options', async () => {
        const element = await controller.findElement('bento-autocomplete');
        const input = await controller.findElement('input#autocomplete');

        controller.click(input);

        await controller.switchToShadowRoot(element);

        const results = await controller.findElement('[part="results"]');
        await expect(controller.isElementDisplayed(results)).to.be.true;

        const options = await controller.findElements('[role="option"]');
        await expect(options.length).to.equal(3);
      });

      it('hides the options when one is selected', async () => {
        const element = await controller.findElement('bento-autocomplete');
        const input = await controller.findElement('input#autocomplete');

        controller.click(input);

        await controller.switchToShadowRoot(element);

        const option = await controller.findElement('[data-value="apple"]');

        controller.click(option);

        const results = await controller.findElement('[part="results"]');
        await expect(controller.isElementDisplayed(results)).to.be.false;
      });
    });

    describe('autocomplete with template', () => {
      it('displays options', async () => {
        const element = await controller.findElement(
          'bento-autocomplete#with-template'
        );

        const input = await controller.findElement(
          'input#autocomplete-template'
        );
        controller.click(input);

        await controller.switchToShadowRoot(element);

        const options = await controller.findElements('.city-item');

        await expect(options.length).to.equal(3);
      });

      it('hides the options when one is selected', async () => {
        const element = await controller.findElement(
          'bento-autocomplete#with-template'
        );
        const input = await controller.findElement(
          'input#autocomplete-template'
        );

        controller.click(input);

        await controller.switchToShadowRoot(element);

        const option = await controller.findElement(
          '[data-value="Seattle, WA"]'
        );

        controller.click(option);

        const results = await controller.findElement('[part="results"]');
        await expect(controller.isElementDisplayed(results)).to.be.false;
      });
    });
  }
);
