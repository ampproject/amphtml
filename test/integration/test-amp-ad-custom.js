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
import {createFixtureIframe} from '../../testing/iframe.js';

describe
  .configure()
  .retryOnSaucelabs()
  .run('amp custom ad', () => {
    let fixture;
    beforeEach(() => {
      return createFixtureIframe('test/fixtures/amp-ad-custom.html', 500).then(
        f => {
          fixture = f;
        }
      );
    });

    /** TODO(#15329): unskip */
    it.skip('should render template', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_END, 6).then(function() {
        expect(fixture.doc.querySelectorAll('amp-img')).to.have.length(3);

        // ad1
        const ad1 = fixture.doc.getElementById('ad1');
        expect(ad1.getAttribute('template')).to.be.null;
        expect(ad1.getAttribute('data-vars-var1')).to.be.null;
        expect(ad1.getAttribute('data-vars-var2')).to.be.null;
        const img1 = ad1.querySelector('amp-img');
        expect(img1.getAttribute('data-info')).to.equal('Info');

        // ad2
        const ad2 = fixture.doc.getElementById('ad2');
        expect(ad2.getAttribute('template')).to.equal('amp-template-id2');
        const img2 = ad2.querySelector('amp-img');
        expect(img2.getAttribute('data-info')).to.equal('Info2');
        expect(ad2.getAttribute('data-vars-var1')).to.equal('123');
        expect(ad2.getAttribute('data-vars-var2')).to.equal('456');

        // ad3
        const ad3 = fixture.doc.getElementById('ad3');
        expect(ad3.getAttribute('template')).to.be.null;
        const img3 = ad3.querySelector('amp-img');
        expect(img3.getAttribute('data-info')).to.equal('Info3');
      });
    });
  });
