/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {createServedIframe} from '../../testing/iframe';

describe('Render delaying extensions', () => {
  function testDelay(extension, iframeSrc) {
    describe(extension, () => {
      it('should delay unhiding the body', function() {
        // Let's see if this is enough time to avoid test flake.
        this.timeout(3000);

        return createServedIframe(iframeSrc).then(fixture => {
          expect(fixture.doc.body).to.be.hidden;

          return fixture.win.insertExtension().then(() => fixture);
        }).then(fixture => {
          expect(fixture.doc.body).to.be.visible;
        });
      });
    });
  }

  testDelay('amp-dynamic-css-classes',
      '/base/test/fixtures/served/render-delay/amp-dynamic-css-classes.html');
  testDelay('amp-accordion',
      '/base/test/fixtures/served/render-delay/amp-accordion.html');
});
