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

import {
  depositRequestUrl,
  withdrawRequest,
} from '../../testing/test-helper';

describe.configure()
    .skipIfPropertiesObfuscated().run('amp-analytics', function() {
      this.timeout(15000);

      describes.integration('amp-analytics integration test', {
        body:
    `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${depositRequestUrl('amp-analytics')}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 2
              }
            }
          },
          "extraUrlParams": {
            "a": 1,
            "b": "\${title}"
          }
        }
        </script>
    </amp-analytics>
    `,
        extensions: ['amp-analytics'],
      }, env => {
        it('should send ping', () => {
          return withdrawRequest(env.win,
              'analytics-has-referrer?a=2&b=AMP-TEST').then(request => {
            expect(request.headers.referer,
                'should keep referrer if no referrerpolicy specified').to.be.ok;
          });
        });
      });

      describes.integration('amp-analytics integration test', {
        body:
    `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${depositRequestUrl('analytics-no-referrer')}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "endpoint"
            }
          },
          "transport": {
            "referrerPolicy": "no-referrer"
          }
        }
        </script>
    </amp-analytics>
    `,
        extensions: ['amp-analytics'],
      }, env => {
        it('should remove referrer if referrerpolicy=no-referrer', () => {
          return withdrawRequest(env.win, 'analytics-no-referrer')
              .then(request => {
                expect(request.headers.referer).to.not.be.ok;
              });
        });
      });
    });
