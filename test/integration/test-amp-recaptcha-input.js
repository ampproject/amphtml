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

function get3pRecaptchaScript(bootstrapFrame) {
  // Using a partial string match *= for css value
  return bootstrapFrame.contentDocument.querySelector('script[src*="./recaptcha.js"]');
}

function getRecaptchaApiScript(bootstrapFrame) {
  return bootstrapFrame.contentDocument.querySelector('script[src*="https://www.google.com/recaptcha/api.js"]');
}

/**
 * Function that does the following:
 * 1. Create the Fixture, with out custom bootstrap frame src
 *
 * 2. Ensure/Wait for the bootstrap frame,
 * to add (not load) the 3p recaptcha script,
 * As well as the recaptcha API script
 * reCAPCTHA API: https://www.google.com/recaptcha/api.js?render=[sitekey here]
 */
function getRecaptchaFrame(fixture) {
  let bootstrapFrame = undefined;

  return poll('create bootstrap frame', () => {
    return fixture.doc.querySelector('iframe.i-amphtml-recaptcha-iframe');
  }, undefined, 2000).then(frame => {
    bootstrapFrame = frame;
    bootstrapFrame.src = '/dist.3p/current/recaptcha.max.html';
    return new Promise(resolve => {
      bootstrapFrame.onload = resolve;
    });
  }).then(() => {
    return poll('load recaptcha api script', () => {
      // Using a partial string match *= for css value
      return get3pRecaptchaScript(bootstrapFrame) && getRecaptchaApiScript(bootstrapFrame);
    }, undefined, 2000);
  }).then(() => {
    return bootstrapFrame;
  });
}

/**
 * Function that does the following:
 *
 * 1. Remove the recaptcha API Script from the recaptcha frame
 *
 * 2. Mocks out the grecaptcha object, and calls ready()
 */
function getMockedRecaptchaFrame(fixture) {
  return getRecaptchaFrame(fixture).then((bootstrapFrame) => {
    // Remove all 3p script tags from the page
    getRecaptchaApiScript(bootstrapFrame).remove();
    // Remove the other possible recaptcha script that may get loaded
    const otherRecaptchaScript = bootstrapFrame.contentDocument.querySelector('script[src*="gstatic"]');
    if (otherRecaptchaScript) {
      otherRecaptchaScript.remove();
    }

    bootstrapFrame.contentWindow.grecaptcha = {
      mock: true,
      ready: (callback) => {
        console.log('mock grecaptcha ready()');
        callback();
      },
      execute: () => {
        console.log('mock recaptcha execute()');
        Promise.resolve('mock-recaptcha-token')
      }
    };

    // Re-initialize with the mock
    bootstrapFrame.contentWindow.initRecaptcha();

    return bootstrapFrame;
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
      expect(frame.getAttribute('data-amp-3p-sentinel')).to.be.equal('amp-recaptcha');
      expect(frame.getAttribute('name')).to.be.equal('{"sitekey":"6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE","sentinel":"amp-recaptcha"}');
    });
  });

  it('should load the 3p recaptcha and recaptcha api script', function() {
    this.timeout(7000);

    return getRecaptchaFrame(fixture).then(bootstrapFrame => {
      expect(get3pRecaptchaScript(bootstrapFrame)).to.be.ok;
      expect(getRecaptchaApiScript(bootstrapFrame)).to.be.ok;
    });
  });

  it('should respond when ready from bootstrap frame', function() {
    this.timeout(7000);

    return getMockedRecaptchaFrame(fixture).then(bootstrapFrame => {
      const ampRecaptchaInputElement = fixture.doc.querySelector('amp-recaptcha-input');
      return ampRecaptchaInputElement.implementation_.recaptchaService_.recaptchaApiReady_;
    });
  });

});


