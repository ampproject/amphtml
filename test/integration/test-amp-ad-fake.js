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
import {addParamsToUrl, parseQueryString} from '../../src/url';
import {poll} from '../../testing/iframe';

describe('A4A', function() {

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
    // TODO: Unskip flaky test
    it.configure().skipFirefox().run(
        'should layout amp-img, amp-pixel, amp-analytics', () => {
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
          navTiming: '0', // ${navTiming(requestStart,requestStart)}
          navType: '0', // ${navType}
          navRedirectCount: '0', // ${navRedirectCount}
        });
        expect(queries['ampdocUrl']).to.contain('http://localhost:9876/amp4test/compose-doc?');
        expect(queries['canonicalUrl']).to.equal('http://nonblocking.io/');
        expect(queries['img']).to.contain('/deposit/image'); // ${htmlAttr(amp-img,src)}
      });
    });
  });

  const src = addParamsToUrl('/amp4test/compose-doc', {
    body: `
      <p [text]="foo">123</p>
      <button on="tap:AMP.setState({foo: 456})"></button>
      `,
    extensions: 'amp-bind',
    spec: 'amp4ads',
  });
  describes.integration('amp-bind in A4A', {
    body: `
      <amp-ad width="300" height="400"
          id="i-amphtml-demo-id"
          type="fake"
          src="${src}">
        <div placeholder>Loading...</div>
        <div fallback>Could not display the fake ad :(</div>
      </amp-ad>
      `,
  }, env => {
    it('p[text]', function*() {
      // Wait for the amp-ad to construct its child iframe.
      const ad = env.win.document.getElementById('i-amphtml-demo-id');
      yield poll('amp-ad > iframe', () => ad.querySelector('iframe'));

      // Wait for the iframe contents to load.
      const fie = ad.querySelector('iframe').contentWindow;
      yield poll('iframe > button', () => fie.document.querySelector('button'));

      const text = fie.document.querySelector('p');
      expect(text.textContent).to.equal('123');

      const button = fie.document.querySelector('button');
      return poll('[text]', () => {
        // We click this too many times but there's no good way to tell whether
        // amp-bind is initialized yet.
        button.click();
        return text.textContent === '456';
      }, /* onError */ undefined, 5000);
    });
  });
});
