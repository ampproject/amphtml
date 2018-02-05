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
  depositRequestUrl,
  withdrawRequest,
} from '../../testing/test-helper';

describe.configure().skipSafari().skipEdge().run('user-error', function() {
  //TODO(zhouyx, #11459): Unskip the test on safari.
  let randomId;
  beforeEach(() => {
    randomId = Math.random();
  });

  describes.integration('user-error integration test', {
    extensions: ['amp-analytics'],
    hash: 'log=0',
    experiments: ['user-error-reporting'],
    body: () => `
    <amp-analytics><script type="application/json">
          {
              "requests": {
                  "error": "${depositRequestUrl(randomId)}"
              },
              "triggers": {
                  "userError": {
                      "on": "user-error",
                      "request": "error"
                  }
              }
          }
    </script></amp-analytics>

    <amp-pixel src="https://foo.com/tracker/foo"
               referrerpolicy="fail-referrer">`,
  }, env => {
    it('should ping correct host with amp-pixel user().assert err', () => {
      return withdrawRequest(env.win, randomId);
    });
  });

  describes.integration('user-error integration test', {
    extensions: ['amp-analytics'],
    hash: 'log=0',
    experiments: ['user-error-reporting'],

    body: () => `
    <amp-img
      src="../../examples/img/sea@1x.jpg"
      width="360" height="216" layout="responsive"
      role='img'>
    </amp-img>

    <amp-analytics><script type="application/json">
          {
              "requests": {
                  "error": "${depositRequestUrl(randomId)}"
              },
              "triggers": {
                  "userError": {
                      "on": "user-error",
                      "request": "error"
                  }
              }
          }
    </script></amp-analytics>`,
  }, env => {
    it('should ping correct host with amp-img user().error err', () => {
      return withdrawRequest(env.win, randomId);
    });
  });

  describes.integration('3p user-error integration test', {
    extensions: ['amp-analytics', 'amp-ad'],
    hash: 'log=0',
    experiments: ['user-error-reporting'],

    body: () => `
    <amp-ad width=300 height=250
        type="_ping_"
        data-url='not-exist'
        data-valid='false'
        data-error='true'>
    </amp-ad>

    <amp-analytics><script type="application/json">
    {
      "requests": {
        "error": "${depositRequestUrl(randomId)}"
      },
      "triggers": {
        "userError": {
          "on": "user-error",
          "request": "error"
        }
      }
    }
    </script></amp-analytics>`,
  }, env => {
    it('should ping correct host with 3p error message', () => {
      return withdrawRequest(env.win, randomId);
    });
  });
});
