/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {createFixtureIframe} from '../../../../testing/iframe';
import {bindForDoc} from '../../../../src/bind';
import {ampdocServiceFor} from '../../../../src/ampdoc';

describe.configure().retryOnSaucelabs().run('amp-bind', function() {
  const fixtureLocation = 'test/fixtures/amp-bind-integrations/p-tag.html';

  let fixture;
  let ampdoc;

  this.timeout(5000);

  beforeEach(() => {
    return createFixtureIframe(fixtureLocation).then(f => {
      fixture = f;
      return waitForEvent('amp:bind:initialize');
    }).then(() => {
      const ampdocService = ampdocServiceFor(fixture.win);
      ampdoc = ampdocService.getAmpDoc(fixture.doc);
    });
  });

 /**
  * @param {string} name
  * @return {!Promise}
  */
  function waitForEvent(name) {
    return new Promise(resolve => {
     function callback() {
       resolve();
       fixture.win.removeEventListener(name, callback);
     };
     fixture.win.addEventListener(name, callback);
   });
  }

 /** @return {!Promise} */
  function waitForBindApplication() {
   // Bind should be available, but need to wait for actions to resolve
   // service promise for bind and call setState.
    return bindForDoc(ampdoc).then(unusedBind =>
       waitForEvent('amp:bind:setState'));
  }

  describe('text integration', () => {
    it('should update text when text attribute binding changes', () => {
     const textElement = fixture.doc.getElementById('textElement');
     const button = fixture.doc.getElementById('changeTextButton');
     expect(textElement.textContent).to.equal('unbound');
     button.click();
     return waitForBindApplication().then(() => {
       expect(textElement.textContent).to.equal('hello world');
     });
   });

    it('should update CSS class when class binding changes', () => {
     const textElement = fixture.doc.getElementById('textElement');
     const button = fixture.doc.getElementById('changeTextClassButton');
     expect(textElement.className).to.equal('original');
     button.click();
     return waitForBindApplication().then(() => {
       expect(textElement.className).to.equal('new');
     });
   });
  });
});
