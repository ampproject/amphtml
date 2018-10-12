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

import '../amp-recaptcha-input';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-recaptcha-input', {
  amp: { /* amp spec */
    runtimeOn: false,
    extensions: ['amp-recaptcha-input'],
  },
}, env => {

  let win;
  let doc;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
    toggleExperiment(win, 'amp-recaptcha-input', true);
  });

  function getRecaptchaInput(skipSiteKey, skipAction) {
    const ampRecaptchaInput = doc.createElement('amp-recaptcha-input');
    ampRecaptchaInput.setAttribute('layout',
        'nodisplay');
    if (!skipSiteKey) {
      ampRecaptchaInput.setAttribute('data-sitekey',
          'fake-sitekey-fortesting');
    }
    if (!skipAction) {
      ampRecaptchaInput.setAttribute('data-action',
          'unit-testing');
    }
    doc.body.appendChild(ampRecaptchaInput);
    return ampRecaptchaInput.build().then(() => {
      return ampRecaptchaInput.layoutCallback();
    }).then(() => {
      return ampRecaptchaInput;
    });
  }

  describe('amp-recaptcha-input', () => {

    it('Rejects because data-sitekey is missing', () => {
      return allowConsoleError(() => {
        return getRecaptchaInput(true)
            .should.eventually.be.rejectedWith(
                /The data-sitekey attribute is required for/
            );
      });
    });

    it('Rejects because data-action is missing', () => {
      return allowConsoleError(() => {
        return getRecaptchaInput(undefined, true)
            .should.eventually.be.rejectedWith(
                /The data-action attribute is required for/
            );
      });
    });


    it('Should be visible after built', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(ampRecaptchaInput).to.not.have.display('none');
      });
    });

    it('Should apply styles aftyer build', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(win.getComputedStyle(ampRecaptchaInput).position)
            .to.equal('absolute');
        expect(win.getComputedStyle(ampRecaptchaInput).visibility)
            .to.equal('hidden');
      });
    });

    it('Should register with the recaptcha service after layout', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(
            ampRecaptchaInput.implementation_
                .registerPromise_
        ).to.be.ok;
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(1);
      });
    });

    it('Should unregister with the recaptcha service after unlayout', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(
            ampRecaptchaInput.implementation_
                .registerPromise_
        ).to.be.ok;
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(1);

        ampRecaptchaInput.unlayoutCallback();
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(0);
      });
    });

    it('Should not register with the recaptcha service' +
      ' if already registered', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(
            ampRecaptchaInput.implementation_
                .registerPromise_
        ).to.be.ok;
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(1);
        ampRecaptchaInput.implementation_.layoutCallback();
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(1);
      });
    });

    it('Should not unregister with the recaptcha service' +
      ' if not already registered', () => {
      return getRecaptchaInput().then(ampRecaptchaInput => {
        expect(
            ampRecaptchaInput.implementation_
                .registerPromise_
        ).to.be.ok;
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(1);
        ampRecaptchaInput.unlayoutCallback();
        expect(
            ampRecaptchaInput.implementation_
                .registerPromise_
        ).to.not.be.ok;
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(0);
        ampRecaptchaInput.unlayoutCallback();
        expect(
            ampRecaptchaInput.implementation_
                .recaptchaService_.registeredElementCount_
        ).to.equal(0);
      });
    });
  });
});
