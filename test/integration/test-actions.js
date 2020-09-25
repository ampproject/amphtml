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

import {AmpEvents} from '../../src/amp-events';
import {createFixtureIframe, poll} from '../../testing/iframe.js';

describe('on="..."', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await createFixtureIframe('test/fixtures/actions.html', 500);
    // Wait for one <amp-img> element to load.
    console.warn('awaitEvent');
    await fixture.awaitEvent(AmpEvents.LOAD_END, 1);
    console.warn('after awaitEvent');
  });

  function waitForDisplay(element, display) {
    console.warn('waitForDisplay');
    return () => fixture.win.getComputedStyle(element)['display'] === display;
  }

  describe('"tap" event', () => {
    it('<non-AMP element>.toggleVisibility', async function () {
      console.warn('startTest');
      const span = fixture.doc.getElementById('spanToHide');
      console.warn('afterSpan');
      const button = fixture.doc.getElementById('hideBtn');
      console.warn('afterButton');

      button.click();
      console.warn('afterClick');
      await poll('#spanToHide hidden', waitForDisplay(span, 'none'));
    });

    it('<AMP element>.toggleVisibility', async function () {
      const img = fixture.doc.getElementById('imgToToggle');
      const button = fixture.doc.getElementById('toggleBtn');

      button.click();
      await poll('#imgToToggle hidden', waitForDisplay(img, 'none'));

      button.click();
      await poll('#imgToToggle displayed', waitForDisplay(img, 'inline-block'));
    });

    describe
      .configure()
      .skipIfPropertiesObfuscated()
      .run('navigate', function () {
        it('AMP.navigateTo(url=)', function* () {
          const button = fixture.doc.getElementById('navigateBtn');

          // This is brittle but I don't know how else to stub
          // window navigation.
          const navigationService = fixture.win.__AMP_SERVICES.navigation.obj;
          const navigateTo = window.sandbox.stub(
            navigationService,
            'navigateTo'
          );

          button.click();
          yield poll('navigateTo() called with correct args', () => {
            return navigateTo.calledWith(fixture.win, 'https://google.com');
          });
        });
      });

    it('AMP.print()', function* () {
      const button = fixture.doc.getElementById('printBtn');

      const print = window.sandbox.stub(fixture.win, 'print');

      button.click();
      yield poll('print() called once', () => {
        return print.calledOnce;
      });
    });
  });
});
