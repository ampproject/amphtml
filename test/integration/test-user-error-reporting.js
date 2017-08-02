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

import {
    withdrawRequest,
    //composeDocWithExtension,
    depositRequestUrl,
} from '../../testing/test-helper';

import {createFixtureIframe} from '../../testing/iframe.js';


describe('user-error-reporting', function() {
  //this.timeout(15000);

  // describes.integration('amp-pixel integration test', {
  //   body: `<amp-analytics>
  //         {
  //             "requests": {
  //                 "user-error": "${depositRequestUrl('user-error-repor')}"
  //             },
  //
  //             "triggers": {
  //                 "user-error": {
  //                     "on": "user-error",
  //                     "request": "user-error"
  //                 }
  //             },
  //
  //             "transport": {
  //               "beacon": "false",
  //               "xhrpost": "false",
  //               "image": "true"
  //             }
  //         }
  //     </amp-analytics>
  //     <amp-pixel src="${depositRequestUrl('has-referrer')}">`,
  // }, env => {
  //   it('should keep referrer if no referrerpolicy specified', () => {
  //     return withdrawRequest(env.win, 'has-referrer').then(request => {
  //       expect(request.headers.referer).to.be.ok;
  //     });
  //   });
  // });


  // describes.integration('user-error-reporting integration test', {
  //   extensions: 'amp-analytics',
  //   body:
  //   `<amp-analytics><script type="application/json">
  //         {
  //             "requests": {
  //                 "user-error": "${depositRequestUrl('user-error-report')}"
  //             },
  //             "triggers": {
  //                 "user-error": {
  //                     "on": "user-error",
  //                     "request": "user-error"
  //                 }
  //             }
  //         }
  //     </script></amp-analytics>
  //
  //   <amp-pixel src="https://foo.com/tracker/foo"
  //          layout="nodisplay"
  //          referrerpolicy="referrer-fail"></amp-pixel>`,
  // }, env => {
  //   it('should ping correct host', () => {
  //     return withdrawRequest(env.win, 'user-error-report').then(request => {
  //       expect(request).to.be.ok;
  //     });
  //   });
  // });

  describe('User-Error', function() {
    let fixture;

    beforeEach(() => {
      return createFixtureIframe(
          'test/fixtures/analytics-error-reporting.html', 500)
          .then(f => {
            fixture = f;
          });
    });

    it('should ping correct host', () => {
      return withdrawRequest(fixture.win, 'user-error-report').then(request => {
        expect(request).to.be.ok;
      });
    });
  });
});
