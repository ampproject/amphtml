import * as fakeTimers from '@sinonjs/fake-timers';

import {poll} from '#testing/iframe';

const config = describes.sandboxed.configure().ifChrome();
config.skip('amp-date-picker', {}, function () {
  this.timeout(10000);

  const extensions = ['amp-date-picker'];
  const experiments = ['amp-date-picker'];

  const singlePickerWithDateBody = `
    <amp-date-picker
      layout="fixed-height"
      height="360"
      id="picker"
      date="2018-01-01"
    ></amp-date-picker>
  `;

  const clearButtonBody = `
    <button id="clear" on="tap:picker.clear">Clear</button>
  `;

  describes.integration(
    'picker.clear',
    {
      body: singlePickerWithDateBody + clearButtonBody,
      extensions,
      experiments,
    },
    (env) => {
      let clock;
      let win;
      let document;

      beforeEach(() => {
        win = env.win;
        document = env.win.document;
        clock = fakeTimers.withGlobal(win).install({
          now: new Date('2018-01-01T08:00:00Z'),
        });
      });

      afterEach(() => {
        clock.uninstall();
      });

      it('clears the current day', () => {
        const picker = document.getElementById('picker');
        const clear = document.getElementById('clear');

        const promise = waitForFalsyAttribute(picker, 'date');
        clear.click();
        return promise;
      });
    }
  );

  const singlePickerBody = `
    <amp-date-picker
      layout="fixed-height"
      height="360"
      id="picker"
    ></amp-date-picker>
  `;

  const rangePickerBody = `
    <amp-date-picker
      type="range"
      layout="fixed-height"
      height="360"
      id="picker"
    ></amp-date-picker>
  `;

  const singleButtonBody = `
    <button id="today" on="tap:picker.today">Today</button>
    <button id="tomorrow" on="tap:picker.today(offset=1)">Tomorrow</button>
    <button id="yesterday" on="tap:picker.today(offset=-1)">Yesterday</button>
  `;

  describes.integration(
    'picker.today',
    {
      body: singlePickerBody + singleButtonBody,
      extensions,
      experiments,
    },
    (env) => {
      let clock;
      let win;
      let document;

      beforeEach(() => {
        win = env.win;
        document = env.win.document;
        clock = fakeTimers.withGlobal(win).install({
          now: new Date('2018-01-01T08:00:00Z'),
        });
      });

      afterEach(() => {
        clock.uninstall();
      });

      it('sets the current date to today', () => {
        const picker = document.getElementById('picker');
        const today = document.getElementById('today');

        const promise = waitForAttribute(picker, 'date');
        today.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-01');
        });
      });

      it('sets the current date to today with an offset', () => {
        const picker = document.getElementById('picker');
        const tomorrow = document.getElementById('tomorrow');

        const promise = waitForAttribute(picker, 'date');
        tomorrow.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-02');
        });
      });

      it('sets the current date to today with a negative offset', () => {
        const picker = document.getElementById('picker');
        const yesterday = document.getElementById('yesterday');

        const promise = waitForAttribute(picker, 'date');
        yesterday.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2017-12-31');
        });
      });
    }
  );

  const startTodayButtonBody = `
    <button id="today" on="tap:picker.startToday">Today</button>
    <button id="tomorrow" on="tap:picker.startToday(offset=1)">Tomorrow</button>
    <button id="yesterday" on="tap:picker.startToday(offset=-1)">
      Yesterday
    </button>
  `;

  describes.integration(
    'picker.startToday',
    {
      body: rangePickerBody + startTodayButtonBody,
      extensions,
      experiments,
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
      });

      afterEach(() => {
        clock.uninstall();
      });

      it('sets the current start date to today', () => {
        const picker = document.getElementById('picker');
        const today = document.getElementById('today');

        const promise = waitForAttribute(picker, 'start-date');
        today.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-01');
          picker.removeAttribute('start-date');
        });
      });

      it('sets the current start date to today with an offset', () => {
        const picker = document.getElementById('picker');
        const tomorrow = document.getElementById('tomorrow');

        const promise = waitForAttribute(picker, 'start-date');
        tomorrow.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-02');
        });
      });

      it('sets the current start date to today with a negative offset', () => {
        const picker = document.getElementById('picker');
        const yesterday = document.getElementById('yesterday');

        const promise = waitForAttribute(picker, 'start-date');
        yesterday.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2017-12-31');
        });
      });
    }
  );

  const endTodayButtonBody = `
    <button id="today" on="tap:picker.endToday">Today</button>
    <button id="tomorrow" on="tap:picker.endToday(offset=1)">Tomorrow</button>
    <button id="yesterday" on="tap:picker.endToday(offset=-1)">
      Yesterday
    </button>
  `;

  describes.integration(
    'picker.endToday',
    {
      body: rangePickerBody + endTodayButtonBody,
      extensions,
      experiments,
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
      });

      afterEach(() => {
        clock.uninstall();
      });

      it('sets the current end date to today', () => {
        const picker = document.getElementById('picker');
        const today = document.getElementById('today');

        const promise = waitForAttribute(picker, 'end-date');
        today.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-01');
        });
      });

      it('sets the current end date to today with an offset', () => {
        const picker = document.getElementById('picker');
        const tomorrow = document.getElementById('tomorrow');

        const promise = waitForAttribute(picker, 'end-date');
        tomorrow.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2018-01-02');
        });
      });

      it('sets the current end date to today with a negative offset', () => {
        const picker = document.getElementById('picker');
        const yesterday = document.getElementById('yesterday');

        const promise = waitForAttribute(picker, 'end-date');
        yesterday.click();
        return promise.then((attribute) => {
          expect(attribute).to.equal('2017-12-31');
        });
      });
    }
  );
});

function waitForAttribute(element, attribute) {
  return poll(
    `wait for attribute ${attribute} on ${element.tagName}`,
    () => {
      return element.getAttribute(attribute);
    },
    undefined,
    8000
  );
}

function waitForFalsyAttribute(element, attribute) {
  return poll(
    `wait for attribute ${attribute} on ${element.tagName}`,
    () => {
      return element.getAttribute(attribute) == null;
    },
    undefined,
    8000
  );
}
