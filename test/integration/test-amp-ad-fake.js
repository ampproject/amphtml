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

describe.configure().skipIfPropertiesObfuscated().run('A4A', function() {
  this.timeout(15000);

  describes.integration('AMPHTML ads rendered on AMP page', {
    body: `
      <amp-ad width="300" height="400"
          id="i-amphtml-demo-id"
          type="fake"
          src="/amp4test/a4a/${RequestBank.getBrowserId()}">
        <div placeholder>Loading...</div>
        <div fallback>Could not display the fake ad :(</div>
      </amp-ad>
      `,
    extensions: ['amp-ad'],
  }, () => {
    it('should layout amp-img, amp-pixel, amp-analytics', () => {
      // See amp4test.js for creative content
      return Promise.all([
        RequestBank.withdraw('image'),
        RequestBank.withdraw('pixel'),
        RequestBank.withdraw('analytics'),
      ]).then(reqs => {
        const imageReq = reqs[0];
        const pixelReq = reqs[1];
        const analyticsReq = reqs[2];
        expect(imageReq.url).to.equal('/');
        expect(pixelReq.url).to.equal('/foo?cid=');
        expect(analyticsReq.url).to.match(/^\/bar\?/);
        const queries =
            parseQueryString(analyticsReq.url.substr('/bar'.length));
        expect(queries).to.include({
          title: 'AMP TEST', // ${title},
          cid: '', // ${clientId(a)}
          adNavTiming: '0', // ${adNavTiming(requestStart,requestStart)}
          adNavType: '0', // ${adNavType}
          adRedirectCount: '0', // ${adRedirectCount}
        });
        expect(queries['ampdocUrl']).to.contain('http://localhost:9876/amp4test/compose-doc?');
        expect(queries['canonicalUrl']).to.equal('http://nonblocking.io/');
        expect(queries['img']).to.contain('/deposit/image'); // ${htmlAttr(amp-img,src)}
      });
    });
  });
});
