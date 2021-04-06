/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {AmpEvents} from '../../../../../src/amp-events.js';
import {createFixtureIframe} from '../../../../../testing/iframe.js';

function checkElementUpgrade(element) {
  expect(element).to.have.class('i-amphtml-element');
  expect(element).to.have.class('i-amphtml-layout-size-defined');
  expect(element).to.not.have.class('amp-notbuilt');
  expect(element).to.not.have.class('i-amphtml-notbuilt');
  expect(element).to.not.have.class('amp-unresolved');
  expect(element).to.not.have.class('i-amphtml-unresolved');
}

// NOTE: this only executes on module build tests
const config = describe.configure().ifModuleBuild();

config.run('amp-date-picker', async () => {
  it('initializes the date picker', async () => {
    const testExtension = 'amp-date-picker';
    const fixture = await createFixtureIframe(
      'test/fixtures/datepicker.html',
      500
    );
    expect(fixture.doc.querySelectorAll(testExtension)).to.have.length(1);
    // Wait for a the LOAD_START event which is enough of a signal that the
    // runtime has executed.
    await fixture.awaitEvent(AmpEvents.LOAD_START, 1);
    expect(fixture.doc.documentElement.getAttribute('esm')).to.equal('1');
    checkElementUpgrade(fixture.doc.querySelector(testExtension));
  });
});
