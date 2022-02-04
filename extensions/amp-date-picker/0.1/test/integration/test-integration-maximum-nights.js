import * as fakeTimers from '@sinonjs/fake-timers';

import {htmlFor} from '#core/dom/static-template';

import {poll} from '#testing/iframe';

const config = describes.sandboxed.configure().ifChrome();

config.run('amp-date-picker', {}, function () {
  this.timeout(10000);

  const extensions = ['amp-date-picker'];

  describes.integration(
    'single date attribute',
    {
      // TODO(cvializ): The beforeEach timers are not installed soon enough
      // so the date picker uses the non-fake time when the element is built.
      // Adding the elements to the body after the fake timer is installed
      // solves the problem. I believe this could be resolved if the `body`
      // property here was added after the beforeEach runs.
      body: '',
      extensions,
    },
    (env) => {
      let win;
      let doc;
      let clock;

      beforeEach(async () => {
        win = env.win;
        doc = env.win.document;
        clock = fakeTimers.withGlobal(win).install({
          now: new Date('2018-01-01T08:00:00Z'),
        });

        doc.body.appendChild(htmlFor(doc)`
      <div>
        <amp-date-picker
          layout="fixed-height"
          height="360"
          type="range"
          id="picker"
          min="0"
          date="2018-01-01"
          maximum-nights="3"
        ></amp-date-picker>
      </div>`);
        const picker = doc.getElementById('picker');
        const impl = await picker.getImpl(false);
        await impl.buildCallback();
        await impl.layoutCallback();
      });

      afterEach(() => {
        clock.uninstall();
      });

      function getCalendarButtonByDay(calendar, day) {
        const cells = calendar.querySelectorAll('.CalendarDay_button');
        const {length} = cells;

        for (let i = 0; i < length; i++) {
          const text = cells[i].textContent.trim();
          if (text == day) {
            return cells[i];
          }
        }

        return null;
      }

      it.skip('should appear as blocked when a date is beyond the maximum', () => {
        const picker = doc.getElementById('picker');
        const startButton = getCalendarButtonByDay(picker, '6');
        const beyondButton = getCalendarButtonByDay(picker, '10');

        const hasBlockedClass = beyondButton.parentElement.classList.contains(
          'CalendarDay__blocked_out_of_range'
        );
        expect(hasBlockedClass).to.be.false;

        const waitForStart = waitForClassName(
          startButton.parentElement,
          'CalendarDay__selected_start'
        );
        startButton.click();

        waitForStart.then(() => {
          const hasBlockedClass = beyondButton.parentElement.classList.contains(
            'CalendarDay__blocked_out_of_range'
          );
          expect(hasBlockedClass).to.be.true;
        });
      });
    }
  );
});

function waitForClassName(element, className) {
  return poll(
    `wait for className ${className} on ${element.id}`,
    () => {
      return element.classList.contains(className);
    },
    undefined,
    8000
  );
}
