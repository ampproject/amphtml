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

    it('renders the date picker', async () => {
      const element = await controller.findElement('bento-date-picker');
      await expect(controller.isElementDisplayed(element)).to.be.true;

      const dateInput = await controller.findElement('input#date');
      await expect(controller.isElementDisplayed(dateInput)).to.be.true;
    });

    describe('single date picker in static mode', () => {
      it('should be able to select a date', async () => {
        const element = await controller.findElement('bento-date-picker');
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );
        await expect(controller.isElementDisplayed(calendar)).to.be.true;

        const dateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        controller.click(dateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-date')
        ).to.equal('2022-01-02');
      });

      it('should clear the date', async () => {
        const element = await controller.findElement('bento-date-picker');
        await controller.switchToShadowRoot(element);

        const dateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        controller.click(dateButton);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        await expect(
          controller.getElementAttribute(calendar, 'data-date')
        ).to.equal('2022-01-02');

        await controller.switchToLight();

        const clearButton = await controller.findElement('button#clear-single');
        controller.click(clearButton);

        await expect(controller.getElementAttribute(calendar, 'data-date')).to
          .be.null;
      });

      // The today prop in the fixture is set to 2022-01-01
      it("should select today's date", async () => {
        const todayButton = await controller.findElement('button#today');
        controller.click(todayButton);

        const element = await controller.findElement('bento-date-picker');
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        await expect(
          controller.getElementAttribute(calendar, 'data-date')
        ).to.equal('2022-01-01');
      });

      // The today prop in the fixture is set to 2022-01-01
      it("should select tomorrow's date", async () => {
        const tomorrowButton = await controller.findElement('button#tomorrow');
        controller.click(tomorrowButton);

        const element = await controller.findElement('bento-date-picker');
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        await expect(
          controller.getElementAttribute(calendar, 'data-date')
        ).to.equal('2022-01-02');
      });
    });

    describe('range date picker in static mode', () => {
      it('should be able to select a start date', async () => {
        const element = await controller.findElement(
          'bento-date-picker#bento-range-date-picker'
        );
        const startInput = await controller.findElement('input#start-date');
        controller.click(startInput);

        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );
        await expect(controller.isElementDisplayed(calendar)).to.be.true;

        const dateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        controller.click(dateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-startdate')
        ).to.equal('2022-01-02');
      });

      it('should be able to select an end date', async () => {
        const element = await controller.findElement(
          'bento-date-picker#bento-range-date-picker'
        );
        const endInput = await controller.findElement('input#end-date');
        controller.click(endInput);

        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );
        await expect(controller.isElementDisplayed(calendar)).to.be.true;

        const dateButton = await controller.findElement(
          'button[aria-label="Monday, January 3, 2022"]'
        );
        controller.click(dateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-enddate')
        ).to.equal('2022-01-03');
      });

      it('should be able to select the start date followed by the end date', async () => {
        const element = await controller.findElement(
          'bento-date-picker#bento-range-date-picker'
        );
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        const startDateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        const endDateButton = await controller.findElement(
          'button[aria-label="Monday, January 3, 2022"]'
        );
        controller.click(startDateButton);
        controller.click(endDateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-startdate')
        ).to.equal('2022-01-02');
        await expect(
          controller.getElementAttribute(calendar, 'data-enddate')
        ).to.equal('2022-01-03');
      });

      it('should clear the dates', async () => {
        const element = await controller.findElement(
          'bento-date-picker#bento-range-date-picker'
        );
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        const startDateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        const endDateButton = await controller.findElement(
          'button[aria-label="Monday, January 3, 2022"]'
        );
        controller.click(startDateButton);
        controller.click(endDateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-startdate')
        ).to.equal('2022-01-02');
        await expect(
          controller.getElementAttribute(calendar, 'data-enddate')
        ).to.equal('2022-01-03');

        await controller.switchToLight();

        const clearButton = await controller.findElement('button#clear-range');
        controller.click(clearButton);

        await expect(controller.getElementAttribute(calendar, 'data-startdate'))
          .to.be.null;
        await expect(controller.getElementAttribute(calendar, 'data-enddate'))
          .to.be.null;
      });
    });

    describe('single date picker in overlay mode', () => {
      it('should be able to select a date', async () => {
        const input = await controller.findElement('#date-overlay');
        controller.click(input);

        const element = await controller.findElement(
          '#bento-single-date-picker-overlay'
        );
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        const dateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        controller.click(dateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-date')
        ).to.equal('2022-01-02');
      });
    });

    describe('range date picker in overlay mode', () => {
      it('should be able to select the start date followed by the end date', async () => {
        const input = await controller.findElement('#start-date-overlay');
        controller.click(input);

        const element = await controller.findElement(
          '#bento-range-date-picker-overlay'
        );
        await controller.switchToShadowRoot(element);

        const calendar = await controller.findElement(
          '.amp-date-picker-calendar-container'
        );

        const startDateButton = await controller.findElement(
          'button[aria-label="Sunday, January 2, 2022"]'
        );
        const endDateButton = await controller.findElement(
          'button[aria-label="Monday, January 3, 2022"]'
        );
        controller.click(startDateButton);
        controller.click(endDateButton);

        await expect(
          controller.getElementAttribute(calendar, 'data-startdate')
        ).to.equal('2022-01-02');
        await expect(
          controller.getElementAttribute(calendar, 'data-enddate')
        ).to.equal('2022-01-03');
      });
    });
  }
);
