/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as lolex from 'lolex';
import {htmlFor} from '../../../../../src/static-template';
import {poll} from '../../../../../testing/iframe';

const config = describe
  .configure()
  .ifChrome()
  .skipSinglePass();

config.run('amp-date-picker', function() {
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
    env => {
      let win;
      let doc;
      let clock;

      beforeEach(() => {
        win = env.win;
        doc = env.win.document;
        clock = lolex.install({
          target: win,
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
        return picker.implementation_
          .buildCallback()
          .then(() => picker.implementation_.layoutCallback());
      });

      after(() => {
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

      it('should appear as blocked when a date is beyond the maximum', () => {
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
