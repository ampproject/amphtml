import {Key} from '#testing/helpers/types';

describes.endtoend(
  'amp-date-picker',
  {
    fixture: 'amp-date-picker/blocked-dates.html',
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    function selectDate(controller, id, date) {
      const day = date.getDate();
      const selector =
        `//amp-date-picker[@id="${id}"]` +
        '//td[not(contains(@class,"CalendarDay__blocked_out_of_range"))]' +
        `[button/div[normalize-space(text())="${day}"]]`;
      return controller.findElementXPath(selector);
    }

    describe('with allow-blocked-end-date', () => {
      const ID = 'allow-blocked';
      it('should be able to select an available date', async () => {
        const today = new Date();
        const tomorrow = new Date(new Date().setDate(today.getDate() + 1));
        const todayCell = await selectDate(controller, ID, today);

        await controller.click(todayCell);
        await expect(
          controller.getElementAttribute(todayCell, 'class')
        ).to.contain('CalendarDay__selected_start');

        // This command selects the date one day after the start since the
        // initial focused cell is the date after the start date.
        await controller.type(null, Key.Enter);

        const endCell = await controller.findElement(
          '.CalendarDay__selected_end'
        );
        await expect(controller.getElementText(endCell)).to.equal(
          String(tomorrow.getDate())
        );
      });

      it('should be able to select the first blocked date', async () => {
        const today = new Date();
        const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
        const todayCell = await selectDate(controller, ID, today);
        const nextWeekCell = await selectDate(controller, ID, nextWeek);

        await controller.click(todayCell);
        await expect(
          controller.getElementAttribute(todayCell, 'class')
        ).to.contain('CalendarDay__selected_start');

        // This sequence of commands selects the date one week after the start
        // date since the initial focused cell is the date after the start date.
        await controller.type(null, Key.ArrowLeft);
        await controller.type(null, Key.ArrowDown);
        await controller.type(null, Key.Enter);

        await expect(
          controller.getElementAttribute(nextWeekCell, 'class')
        ).to.contain('CalendarDay__selected_end');
        await expect(controller.getElementText(nextWeekCell)).to.equal(
          String(nextWeek.getDate())
        );
      });
    });

    describe('without allow-blocked-end-date', () => {
      const ID = 'disallow-blocked';
      it('should NOT be able to select the first blocked date', async function () {
        this.timeout(5000);
        const today = new Date();
        const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
        const todayCell = await selectDate(controller, ID, today);
        const nextWeekCell = await selectDate(controller, ID, nextWeek);

        await controller.click(todayCell);
        await expect(
          controller.getElementAttribute(todayCell, 'class')
        ).to.contain('CalendarDay__selected_start');

        // This sequence of commands selects a date one week after the start date
        // since the initial focused cell is the date after the start date.
        await controller.type(null, Key.ArrowLeft);
        await controller.type(null, Key.ArrowDown);
        await controller.type(null, Key.Enter);

        await expect(
          controller.getElementAttribute(nextWeekCell, 'class')
        ).to.not.contain('CalendarDay__selected_end');
        await expect(controller.getElementText(nextWeekCell)).to.equal(
          String(nextWeek.getDate())
        );
      });
    });
  }
);
