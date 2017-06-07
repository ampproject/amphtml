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

import {createFixtureIframe} from '../../testing/iframe.js';
import {AmpEvents} from '../../src/amp-events';

describe('Configuration', function() {
  this.timeout(5000);

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/configuration.html', 500)
    .then(f => {
      fixture = f;
    });
  });

  it('urls should be configurable', () => {
    expect(fixture.win.AMP_CONFIG).to.equal(undefined);

    const config = fixture.win.AMP_CONFIG = {};
    config.cdnUrl = 'http://foo.bar.com';
    config.thirdPartyUrl = 'http://bar.baz.com';
    config.thirdPartyFrameRegex = /a-website\.com/;
    config.errorReportingUrl = 'http://error.foo.com';

    return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
      expect(fixture.win.AMP.config.urls.cdn).to.equal(config.cdnUrl);
      expect(fixture.win.AMP.config.urls.thirdParty)
      .to.equal(config.thirdPartyUrl);
      expect(fixture.win.AMP.config.urls.thirdPartyFrameRegex)
      .to.equal(config.thirdPartyFrameRegex);
      expect(fixture.win.AMP.config.urls.errorReporting)
      .to.equal(config.errorReportingUrl);
    });
  });
});
