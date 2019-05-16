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
import {AmpRecaptchaService} from '../amp-recaptcha-service';

/**
 * Tests for the iframe communicatiuon will be done in
 * integration. As 3p frames in unit tests are stubbed out
 * with a "fake iframe" document.
 */

describes.realWin(
  'amp-recaptcha-service',
  {
    amp: {
      /* amp spec */
      extensions: ['amp-recaptcha-input'],
    },
  },
  env => {
    let recaptchaService;
    const fakeSitekey = 'fake-sitekey-fortesting';
    const anotherFakeSitekey = 'another-fake-sitekey-fortesting';

    beforeEach(() => {
      recaptchaService = new AmpRecaptchaService(env.ampdoc);
    });

    it('should create an iframe on register if first element to register', () => {
      expect(recaptchaService.registeredElementCount_).to.be.equal(0);
      return recaptchaService.register(fakeSitekey).then(() => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(1);
        expect(recaptchaService.iframe_).to.be.ok;
      });
    });

    it(
      'should only initialize once for X number of elements,' +
        ' and iframe already exists',
      () => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(0);
        return recaptchaService.register(fakeSitekey).then(() => {
          expect(recaptchaService.registeredElementCount_).to.be.equal(1);
          expect(recaptchaService.iframe_).to.be.ok;
          const currentIframe = recaptchaService.iframe_;

          // Register a second element
          return recaptchaService.register(fakeSitekey).then(() => {
            expect(recaptchaService.registeredElementCount_).to.be.equal(2);
            expect(recaptchaService.iframe_).to.be.ok;
            expect(recaptchaService.iframe_).to.be.equal(currentIframe);
          });
        });
      }
    );

    it(
      'should dispose of the iframe,' +
        ' once all registered elements unregister',
      () => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(0);

        return recaptchaService.register(fakeSitekey).then(() => {
          expect(recaptchaService.registeredElementCount_).to.be.equal(1);
          expect(recaptchaService.iframe_).to.be.ok;

          recaptchaService.unregister();
          expect(recaptchaService.registeredElementCount_).to.be.equal(0);
          expect(recaptchaService.iframe_).to.be.not.ok;
        });
      }
    );

    it(
      'should unlisten to all listeners,' +
        ' once all registered elements unregister',
      () => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(0);
        return recaptchaService.register(fakeSitekey).then(() => {
          expect(recaptchaService.unlisteners_.length).to.be.equal(3);

          // Stub out the unlisten function
          const unlistener = sandbox.stub();
          recaptchaService.unlisteners_[0] = unlistener;

          recaptchaService.unregister();
          expect(recaptchaService.unlisteners_.length).to.be.equal(0);
          expect(unlistener).to.be.called;
        });
      }
    );

    it(
      'should not allow elements to register,' +
        ' if they pass a different sitekey',
      () => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(0);
        return recaptchaService.register(fakeSitekey).then(() => {
          expect(recaptchaService.registeredElementCount_).to.be.equal(1);
          expect(recaptchaService.iframe_).to.be.ok;

          return recaptchaService.register(anotherFakeSitekey).catch(err => {
            expect(err).to.be.ok;
            expect(recaptchaService.registeredElementCount_).to.be.equal(1);
            expect(recaptchaService.iframe_).to.be.ok;
          });
        });
      }
    );

    it('should return when the iframe is' + ' loaded and ready', () => {
      expect(recaptchaService.registeredElementCount_).to.be.equal(0);
      return recaptchaService.register(fakeSitekey).then(() => {
        expect(recaptchaService.unlisteners_.length).to.be.equal(3);
        expect(recaptchaService.iframeLoadPromise_).to.be.ok;
        expect(recaptchaService.recaptchaApiReady_).to.be.ok;

        return recaptchaService.iframeLoadPromise_.then(() => {
          expect(true).to.be.ok;
        });
      });
    });

    it('should add the element to the execute map on successful execute', () => {
      expect(recaptchaService.registeredElementCount_).to.be.equal(0);
      return recaptchaService.register(fakeSitekey).then(() => {
        expect(recaptchaService.unlisteners_.length).to.be.equal(3);

        recaptchaService.execute(0, '');

        const executeMapKeys = Object.keys(recaptchaService.executeMap_);
        expect(executeMapKeys.length).to.be.equal(1);
        expect(executeMapKeys[0]).to.be.equal('0');
      });
    });

    it(
      'should postmessage to the specified ' +
        'recaptcha frame origin on execute',
      () => {
        expect(recaptchaService.registeredElementCount_).to.be.equal(0);

        const postMessageStub = sandbox.stub(
          recaptchaService,
          'postMessageToIframe_'
        );

        return recaptchaService
          .register(fakeSitekey)
          .then(() => {
            recaptchaService.execute(0, '');

            recaptchaService.recaptchaApiReady_.resolve();
            return recaptchaService.recaptchaApiReady_.promise;
          })
          .then(() => {
            expect(postMessageStub).to.be.calledWith(
              recaptchaService.recaptchaFrameOrigin_
            );
          });
      }
    );

    it('should reject if there is no iframe on execute', () => {
      expect(recaptchaService.registeredElementCount_).to.be.equal(0);
      expect(recaptchaService.iframe_).to.not.be.ok;
      return recaptchaService.execute(0, '').catch(err => {
        expect(err).to.be.ok;
      });
    });
  }
);
