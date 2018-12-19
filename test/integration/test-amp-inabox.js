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

import {RequestBank} from '../../testing/test-helper';
import {parseQueryString} from '../../src/url';

describe.configure().run('inabox', function() {
  this.timeout(15000);

  describes.integration('AMPHTML ads rendered on non-AMP page ATF', {
    amp: false,
    body: `
      <iframe
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}"
          scrolling="no"
          width="300" height="250">
      </iframe>
      <script src="/examples/inabox-tag-integration.js"></script>
      `,
  }, () => {
    it('should layout amp-img, amp-pixel, amp-analytics', () => {
      // See amp4test.js for creative content

      const imgPromise = RequestBank.withdraw('image').then(req => {
        expect(req.url).to.equal('/');
      });
      const pixelPromise = RequestBank.withdraw('pixel').then(req => {
        expect(req.url).to.equal('/foo?cid=');
      });
      const analyticsPromise = RequestBank.withdraw('analytics').then(req => {
        expect(req.url).to.match(/^\/bar\?/);
        const queries =
            parseQueryString(req.url.substr('/bar'.length));
        expect(queries['cid']).to.equal('');
      });
      return Promise.all([imgPromise, pixelPromise, analyticsPromise]);
    });
  });
});
