/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {xhrFor, fetchPolyfill} from '../../src/xhr';

describe('XHR', function() {
  // Given XHR calls give tests more time.
  this.timeout(5000);

  const scenarios = [
    {xhr: xhrFor(window), desc: 'Native'},
    {xhr: xhrFor({fetch: fetchPolyfill}), desc: 'Polyfill'}
  ];
  scenarios.forEach(test => {
    describe(test.desc, () => {
      const xhr = test.xhr;

      it('should do simple JSON fetch', () => {
        return xhr.fetchJson('https://httpbin.org/get?k=v1').then(res => {
          expect(res).to.exist;
          expect(res['args']['k']).to.equal('v1');
        });
      });

      it('should redirect fetch', () => {
        const url = 'https://httpbin.org/redirect-to?url=' + encodeURIComponent(
            'https://httpbin.org/get?k=v2');
        return xhr.fetchJson(url).then(res => {
          expect(res).to.exist;
          expect(res['args']['k']).to.equal('v2');
        });
      });

      it('should fail fetch for 400-error', () => {
        const url = 'https://httpbin.org/status/404';
        return xhr.fetchJson(url).then(res => {
          return 'SUCCESS';
        }, error => {
          return 'ERROR: ' + error;
        }).then(status => {
          expect(status).to.match(/^ERROR:.*HTTP error 404/);
        });
      });

      it('should fail fetch for 500-error', () => {
        const url = 'https://httpbin.org/status/500';
        return xhr.fetchJson(url).then(res => {
          return 'SUCCESS';
        }, error => {
          return 'ERROR: ' + error;
        }).then(status => {
          expect(status).to.match(/^ERROR.*HTTP error 500/);
        });
      });


      it('should NOT succeed CORS setting cookies without credentials', () => {
        const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
        const url = 'https://httpbin.org/cookies/set?' + cookieName + '=v1';
        return xhr.fetchJson(url).then(res => {
          expect(res).to.exist;
          expect(res['cookies'][cookieName]).to.be.undefined;
        });
      });

      it('should succeed CORS setting cookies with credentials', () => {
        const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
        const url = 'https://httpbin.org/cookies/set?' + cookieName + '=v1';
        return xhr.fetchJson(url, {credentials: 'include'}).then(res => {
          expect(res).to.exist;
          expect(res['cookies'][cookieName]).to.equal('v1');
        });
      });
    });
  });
});
