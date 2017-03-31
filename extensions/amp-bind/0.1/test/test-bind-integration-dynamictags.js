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
  const fixtureLocation =
      'test/fixtures/amp-bind-integrations/dynamic-tags.html';

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

  /** @return {!Promise} */
  function waitForAllMutations() {
    return bindForDoc(ampdoc).then(unusedBind =>
        waitForEvent('amp:bind:mutated'));
  }

  describe('detecting bindings under dynamic tags', () => {
    it('should NOT bind blacklisted attributes', () => {
      const dynamicTag = fixture.doc.getElementById('dynamicTag');
      const div = fixture.doc.createElement('div');
      div.innerHTML = '<p [onclick]="javascript:alert(document.cookie)" ' +
                         '[onmouseover]="javascript:alert()" ' +
                         '[style]="background=color:black"></p>';
      const textElement = div.firstElementChild;
      // for amp-live-list, dynamic element is <div items>, which is a child
      // of the list.
      dynamicTag.firstElementChild.appendChild(textElement);
      return waitForAllMutations().then(() => {
        // Force bind to apply bindings
        fixture.doc.getElementById('triggerBindApplicationButton').click();
        return waitForBindApplication();
      }).then(() => {
        expect(textElement.getAttribute('onclick')).to.be.null;
        expect(textElement.getAttribute('onmouseover')).to.be.null;
        expect(textElement.getAttribute('style')).to.be.null;
      });
    });

    it('should NOT allow unsecure attribute values', () => {
      const div = fixture.doc.createElement('div');
      div.innerHTML = '<a [href]="javascript:alert(1)"></a>';
      const aElement = div.firstElementChild;
      const dynamicTag = fixture.doc.getElementById('dynamicTag');
      dynamicTag.firstElementChild.appendChild(aElement);
      return waitForAllMutations().then(() => {
        // Force bind to apply bindings
        fixture.doc.getElementById('triggerBindApplicationButton').click();
        return waitForBindApplication();
      }).then(() => {
        expect(aElement.getAttribute('href')).to.be.null;
      });
    });
  });
});
