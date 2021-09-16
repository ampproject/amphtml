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

import {Crypto} from '../../src/service/crypto-impl';
import {Platform} from '../../src/service/platform-impl';
import {Services} from '../../src/services';
import {
  installCryptoPolyfill,
} from '../../extensions/amp-crypto-polyfill/0.1/amp-crypto-polyfill';
import {installDocService} from '../../src/service/ampdoc-impl';
import {
  installExtensionsService,
} from '../../src/service/extensions-impl';


describes.realWin('crypto-impl', {}, env => {
  let win;
  let crypto;

  beforeEach(() => {
    win = env.win;
  });

  function uint8Array(array) {
    const uint8Array = new Uint8Array(array.length);
    for (let i = 0; i < array.length; i++) {
      uint8Array[i] = array[i];
    }
    return uint8Array;
  }

  function testSuite(description, win, expectedError) {
    describe(description, () => {
      beforeEach(() => {
        crypto = createCrypto(win || env.win);
      });

      it('should hash "abc" in sha384', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return crypto.sha384('abc').then(buffer => {
          expect(buffer.length).to.equal(48);
          expect(buffer[0]).to.equal(203);
          expect(buffer[1]).to.equal(0);
          expect(buffer[47]).to.equal(167);
        });
      });

      it('should hash [1,2,3] in sha384', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return crypto.sha384(uint8Array([1, 2, 3])).then(buffer => {
          expect(buffer.length).to.equal(48);
          expect(buffer[0]).to.equal(134);
          expect(buffer[1]).to.equal(34);
          expect(buffer[47]).to.equal(246);
        });
      });

      it('should hash "abc" in sha384Base64', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return expect(crypto.sha384Base64('abc')).to.eventually.equal(
            'ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP_W-2AhgcroefMI1i67KE0yCWn');
      });

      it('should hash "foobar" in sha384Base64', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return expect(crypto.sha384Base64('foobar')).to.eventually.equal(
            'PJww2fZl501RXIQpYNSkUcg6ASX9Pec5LXs3IxrxDHLqWK7fzfiaV2W_kCr5Ps8G');
      });

      it('should hash [1,2,3] in sha384', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return expect(crypto.sha384Base64(uint8Array([1, 2, 3])))
            .to.eventually.equal(
                'hiKdxtL_vqxzgHRBVKpwApHAZDUqDb3H' +
                'e57T8sjh2sTcMlhn053f8dJim3o5PUf2');
      });

      it('should throw when input contains chars out of range [0,255]', () => {
        allowConsoleError(() => {
          expect(() => crypto.sha384('abc今')).to.throw();
          expect(() => crypto.sha384Base64('abc今')).to.throw();
          expect(() => crypto.uniform('abc今')).to.throw();
        });
      });

      it('should hash "abc" to uniform number', () => {
        if (expectedError) {
          expectAsyncConsoleError(expectedError);
        }
        return crypto.uniform('abc').then(result => {
          expect(result.toFixed(6)).to.equal('0.792976');
        });
      });
    });
  }

  function createCrypto(win) {
    if (win && !win.document) {
      win.document = env.win.document;
    }
    installDocService(win, /* isSingleDoc */ true);
    installExtensionsService(win);
    const extensions = Services.extensionsFor(win);
    sandbox.stub(extensions, 'preloadExtension').callsFake(extensionId => {
      expect(extensionId).to.equal('amp-crypto-polyfill');
      installCryptoPolyfill(win);
      return Promise.resolve();
    });

    return new Crypto(win);
  }

  function isModernChrome() {
    const platform = new Platform(window);
    return platform.isChrome() && platform.getMajorVersion() >= 37;
  }

  testSuite('with native crypto API');
  testSuite('with crypto lib', {});
  testSuite('with native crypto API rejects', {
    crypto: {
      subtle: {
        digest: () => Promise.reject('Operation not supported'),
      },
    },
  });
  testSuite('with native crypto API throws', {
    crypto: {
      subtle: {
        digest: () => {throw new Error();},
      },
    },
  }, '[Crypto] SubtleCrypto failed, fallback to closure lib. Error');

  it('native API result should exactly equal to crypto lib result', () => {
    return Promise
        .all([createCrypto(win).sha384('abc'), createCrypto({}).sha384('abc')])
        .then(results => {
          expect(results[0]).to.jsonEqual(results[1]);
        });
  });

  // Run tests below only on browsers that we're confident about the existence
  // of native Crypto API.
  if (isModernChrome()) {
    it('should not load closure lib when native API is available ' +
        '(string input)', () => {
      return new Crypto(win).sha384Base64('abc').then(hash => {
        expect(hash).to.equal(
            'ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP_W-2AhgcroefMI1i67KE0yCWn');
      });
    });

    it('should not load closure lib when native API is available ' +
        '(Uint8Array input)', () => {
      return new Crypto(win).sha384Base64(uint8Array([1,2,3])).then(hash => {
        expect(hash).to.equal(
            'hiKdxtL_vqxzgHRBVKpwApHAZDUqDb3He57T8sjh2sTcMlhn053f8dJim3o5PUf2');
      });
    });
  }
});
