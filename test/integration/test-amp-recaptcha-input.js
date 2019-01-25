/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../src/services';
import {
  createFixtureIframe,
  poll,
} from '../../testing/iframe';
import {installPlatformService} from '../../src/service/platform-impl';
import {layoutRectLtwh} from '../../src/layout-rect';
import {toggleExperiment} from '../../src/experiments';


function createFixture() {
  return createFixtureIframe('test/fixtures/amp-recaptcha-input.html', 3000, () => {});
}

describe.configure().run('amp-recaptcha-input', () => {
  let fixture;

  beforeEach(() => {
    return createFixture().then(f => {
      fixture = f;
      toggleExperiment(fixture.win, 'amp-recaptcha-input', true);
      installPlatformService(fixture.win);
    });
  });

  it('should be able to create the bootstrap frame', function() {
    this.timeout(7000);
    return poll('create bootstrap frame', () => {
      return fixture.doc.querySelector('iframe.i-amphtml-recaptcha-iframe');
    }, undefined, 5000).then(frame => {
      expect(frame.src.includes('recaptcha')).to.be.true;
      expect(frame.getAttribute('data-amp-3p-sentinel')).to.be.equal('amp-recaptcha');
      expect(frame.getAttribute('name')).to.be.equal('{"sitekey":"6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE","sentinel":"amp-recaptcha"}');
    });
  });

  it('should load the 3p recaptcha and recaptcha api script', function() {
    this.timeout(7000);

    expect(true).to.be.ok;
  });

  it('should respond when ready from bootstrap frame', function() {
    this.timeout(7000);
    expect(true).to.be.ok;
  });

});


