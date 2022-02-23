describes.endtoend(
  'bento-date-picker',
  {
    version: '1.0',
    fixture: 'bento/date-picker.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('single date picker in static mode', () => {
      it('should be able to select a date', async () => {
        const datePicker = await controller.findElement('bento-date-picker');
        await controller.switchToShadowRoot(datePicker);

        const input = await controller.findElement('input#date');
        await expect(controller.getElementAttribute(input, 'value')).to.be.null;

        const dateButton = await controller.findElement(
          'button[aria-label="January 2, 2022"]'
        );
        await expect(controller.isElementDisplayed(dateButton)).to.be.true;
        controller.click(dateButton);

        // await expect(controller.getElementAttribute(input, 'value')).to.equal(
        //   '2022-01-02'
        // );
      });
    });
  }
);
