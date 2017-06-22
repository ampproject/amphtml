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

import {createAmpElementProto} from '../../src/custom-element';
import {BaseElement} from '../../src/base-element';
import {SandboxAnalyticsAdapter} from '../../src/analytics';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
} from '../../testing/iframe';
import {
  depositRequestUrl,
  withdrawRequest,
} from '../../testing/test-helper';

describe.configure().retryOnSaucelabs().run('Inserted analytics', function() {
  this.timeout(5000);

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/inserted-analytics.html', 500).then(f => {
      fixture = f;
      return expectBodyToBecomeVisible(fixture.win);
    }).then(() => {
      const config = {
        'requests': {
          'pageview': depositRequestUrl('visible/random=RANDOM'),
          'requestmanual': depositRequestUrl('manual/cid=CLIENT_ID'),
        },
        'triggers': {
          'trackPageview': {
            'on': 'visible-v3',
            'request': 'pageview',
          },
          'manual': {
            'on': 'manual',
            'request': 'requestmanual',
          },
        },
      };
      class AmpTest extends BaseElement {
        buildCallback() {
          this.sandboxAnalyticsAdapter_ =
              new SandboxAnalyticsAdapter(this.element, () => {
                return Promise.resolve(config);
              });
          this.sandboxAnalyticsAdapter_.triggerAnalyticsEventOnReady(
              this.element, 'manual');
        }

        isLayoutSupported(unusedLayout) {
          return true;
        }
      }
      fixture.win.document.registerElement('amp-test', {
        prototype: createAmpElementProto(fixture.win, 'amp-test', AmpTest),
      });
    });
  });

  it('should send analytics pings on visible trigger', () => {
    return withdrawRequest(fixture.win, 'visible').then(request => {
      // should replace white listed variable
      expect(request.path).to.not.equal('/random=RANDOM');
    });
  });

  it('should send analytics pings on manual trigger', () => {
    return withdrawRequest(fixture.win, 'manual').then(request => {
      // should not replace non white listed variable
      expect(request.path).to.equal('/cid=CLIENT_ID');
    });
  });
});
