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
      let document;
      let clock;

      beforeEach(() => {
        win = env.win;
        document = env.win.document;
        clock = fakeTimers.withGlobal(win).install({
          now: new Date('2018-01-01T08:00:00Z'),
        });

        document.body.appendChild(htmlFor(document)`
      <div>
        <input id="today-explicit-date">
        <amp-date-picker
          layout="fixed-height"
          height="360"
          id="today-explicit"
          date="2018-01-01"
          input-selector="#today-explicit-date"
        ></amp-date-picker>

        <input id="today-duration-date">
        <amp-date-picker
          layout="fixed-height"
          height="360"
          id="today-duration"
          date="P0D"
          input-selector="#today-duration-date"
        ></amp-date-picker>
      </div>`);
      });

      after(() => {
        clock.uninstall();
      });

      it('sets the date to today explicitly', () => {
        const date = document.getElementById('today-explicit-date');

        return waitForProperty(date, 'value').then(() => {
          expect(date.value).to.equal('2018-01-01');
        });
      });

      it('sets the date to today with a duration', () => {
        const date = document.getElementById('today-duration-date');

        return waitForProperty(date, 'value').then(() => {
          expect(date.value).to.equal('2018-01-01');
        });
      });
    }
  );
});

function waitForProperty(element, property) {
  return poll(
    `wait for property ${property} on ${element.id}`,
    () => {
      return element[property];
    },
    undefined,
    8000
  );
}
