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

import {Deferred} from '../../src/utils/promise';
import {
  createFixtureIframe,
  poll,
} from '../../testing/iframe';
import {installPlatformService} from '../../src/service/platform-impl';
import {toggleExperiment} from '../../src/experiments';


function createFixture() {
  return createFixtureIframe(
      'test/fixtures/amp-recaptcha-input.html',
      3000,
      () => {}
  );
}

function waitForBootstrapFrameOnLoad(fixture) {
  let bootstrapFrame = undefined;
  return poll('create bootstrap frame', () => {
    return fixture.doc.querySelector('iframe.i-amphtml-recaptcha-iframe');
  }, undefined, 5000).then(frame => {
    bootstrapFrame = frame;
    const onLoadDeferred = new Deferred();
    frame.onload = onLoadDeferred.resolve;
    return onLoadDeferred.promise;
  }).then(() => {
    return bootstrapFrame;
  });
}

function submitForm(fixture) {
  return waitForBootstrapFrameOnLoad(fixture).then(() => {
    const searchInputElement =
      fixture.doc.querySelector('input[type="search"]');
    const submitElement =
      fixture.doc.querySelector('input[type="submit"]');

    searchInputElement.value = 'recaptcha-search';
    submitElement.click();

    return poll('Polling for hidden input', () => {
      return fixture.doc.querySelector('input[hidden]');
    }, undefined, 5000);
  }).then(() => {
    return fixture.doc.querySelector('input[hidden]');
  });
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
      expect(frame.getAttribute('data-amp-3p-sentinel'))
          .to.be.equal('amp-recaptcha');
      expect(frame.getAttribute('name')).to.be.equal(JSON.stringify({
        'sitekey': '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE',
        'sentinel': 'amp-recaptcha',
      }));
    });
  });

  it('should load the 3p recaptcha frame', function() {
    this.timeout(7000);
    return waitForBootstrapFrameOnLoad(fixture).then(frame => {
      expect(frame).to.be.ok;
    });
  });

  it('should create a hidden input, ' +
    'with the value resolved from the recaptcha mock, ' +
    ' on submit', function() {
    this.timeout(7000);
    return submitForm(fixture).then(hiddenInput => {
      expect(hiddenInput).to.be.ok;
      expect(hiddenInput.name).to.be.equal('recaptcha-token');
      expect(hiddenInput.value).to.be.equal('recaptcha-mock');
    });
  });

  it('should show submit-success on successful submit', function() {
    this.timeout(7000);
    return submitForm(fixture).then(() => {
      return poll('submit-success', () => {
        return fixture.doc.querySelector('div[id="submit-success"]');
      }, undefined, 5000);
    });
  });
});


