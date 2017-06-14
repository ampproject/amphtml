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
import {
  installCryptoPolyfill,
} from '../../extensions/amp-crypto-polyfill/0.1/amp-crypto-polyfill';
import {
  installExtensionsService,
} from '../../src/service/extensions-impl';
import {extensionsFor} from '../../src/services';
import {stringToBytes} from '../../src/utils/bytes';

describes.realWin('crypto-impl', {}, env => {

  let win;
  let crypto;

  function uint8Array(array) {
    const uint8Array = new Uint8Array(array.length);
    for (let i = 0; i < array.length; i++) {
      uint8Array[i] = array[i];
    }
    return uint8Array;
  }

  function testSuite(description, win) {
    describe(description, () => {
      beforeEach(() => {
        crypto = createCrypto(win || env.win);
      });

      it('should hash "abc" in sha384', () => {
        return crypto.sha384('abc').then(buffer => {
          expect(buffer.length).to.equal(48);
          expect(buffer[0]).to.equal(203);
          expect(buffer[1]).to.equal(0);
          expect(buffer[47]).to.equal(167);
        });
      });

      it('should hash [1,2,3] in sha384', () => {
        return crypto.sha384(uint8Array([1, 2, 3])).then(buffer => {
          expect(buffer.length).to.equal(48);
          expect(buffer[0]).to.equal(134);
          expect(buffer[1]).to.equal(34);
          expect(buffer[47]).to.equal(246);
        });
      });

      it('should hash "abc" in sha384Base64', () => {
        return expect(crypto.sha384Base64('abc')).to.eventually.equal(
            'ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP_W-2AhgcroefMI1i67KE0yCWn');
      });

      it('should hash "foobar" in sha384Base64', () => {
        return expect(crypto.sha384Base64('foobar')).to.eventually.equal(
            'PJww2fZl501RXIQpYNSkUcg6ASX9Pec5LXs3IxrxDHLqWK7fzfiaV2W_kCr5Ps8G');
      });

      it('should hash [1,2,3] in sha384', () => {
        return expect(crypto.sha384Base64(uint8Array([1, 2, 3])))
            .to.eventually.equal(
            'hiKdxtL_vqxzgHRBVKpwApHAZDUqDb3H' +
                'e57T8sjh2sTcMlhn053f8dJim3o5PUf2');
      });

      it('should throw when input contains chars out of range [0,255]', () => {
        expect(() => crypto.sha384('abc今')).to.throw();
        expect(() => crypto.sha384Base64('abc今')).to.throw();
        expect(() => crypto.uniform('abc今')).to.throw();
      });

      it('should hash "abc" to uniform number', () => {
        return crypto.uniform('abc').then(result => {
          expect(result.toFixed(6)).to.equal('0.792976');
        });
      });
    });
  }

  function createCrypto(win) {
    installExtensionsService(win);
    const extensions = extensionsFor(win);
    sandbox.stub(extensions, 'loadExtension', extensionId => {
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

  beforeEach(() => {
    win = env.win;
  });

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
  });

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

  describe('A4A crypto', () => {
    const modulus =
          '8iAq9Q7zaD93myumSS41aEha6HNRNlPD19tMQHHNjzFdtAH8-w' +
          'T6poV3gsI7kfmg9vUrCSuaNrOqmF8HOfbNJfcHCKqXNMsgmYPH' +
          'Wz3R7LStMCJ_476UnuMjA9LFSvrdO91_xaX4Jv0kpQ_mZw70wp' +
          '_K6IFCcrAi85M__TKUwUpB5iXHy2M00vbSBw7ZbMUkMSELb-X1' +
          '_sZbKczCtdYqJQfKqHRU4FxrGj3laRxafWDenpzeMoaSBOK7JK' +
          'kILz8mr-eJ07bkKAfOUyOuTtCkPBzgPkaSvaEyqM-EA4VXP0gF' +
          'IcI5HedIlWfX82yrxN-hZ0MbFrguuGL8iHX9w1aThHAmmyuX2V' +
          '0A1Mh_c9dZtkZO0sYXcBOdh49qmkrn6n2hXP6mmcOF0caTOdke' +
          'GQwR47zSut0MS4sJOyNmjkT4lqkLXb-1Ajva_PU-fTDRaIuxkr' +
          'BPh0v2RwtwxNFytR9Ksrj_hwOYz_l81m8PnaBhMnkZorqF53bg' +
          'eJ8jvDx2_mBb';
    const pubExp = 'AQAB';
    const serviceName = 'test-service';

    const modulus1 =
        'vwx9LQrXHQmiVxxSK9IA_wq9Yu2TFDEQHk9b_rdYJe6fEEwron' +
        '8W_9GBHbBwpNszMdgG531hZqvIU4xALhi47VsD4h5XJ2UNbCU2' +
        'kpcJ-XC_Q62ArEY5vqxJgdYjq4bE8s3f8rKC-Uqg_uepoFEn-X' +
        'Xf2l0UQmVcYCxeRY6ahvM';
    const pubExp1 = 'AQAB';

    function hexToBytes(hexString) {
      // Assume length is even.
      const byteLength = hexString.length / 2;
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
      }
      return bytes;
    };

    const signature = hexToBytes(
        '0087de9f85b71386df784845d23103975591d73cd446212e184f1cb92ac6964f' +
        'a2338d3832bb1c79e1b30eeaca6f24530c12286f26d73b969f6a8bc82ef24f6f' +
        '70201fd2ff24d044b67dcfa067763fd9ef0437e707728f6e47160bf3b626cbbf' +
        'dc6a61af1d802b7c57be496b7b768120c2135cb0a54fa1db5d1f74fe822aa400' +
        'b04cee885bbaaffbbaea951bfeb2ac173698b1265755bc3ea8e1a389af2935e4' +
        '6428d9114c0cff0c4531d76268765f40be76ccf470ac291b800ef8f08504d3ec' +
        'da7675333e753d0a5de96c9a5fc052319134b32dc535a31f51382ddc24b946ac' +
        '6134ea900af5a00ab7a528486f03273814b61207de1609864901f85f4f83ee74' +
        '723802e9c2c7eacf3d1c2f8c6b5d4295b6ad3166a0c9f7482d494c9b8723add6' +
        '2ce8d5868378c720a23cec6b80f802d1021323e3d22a57551de554d292d5fd64' +
        '4de94fdb376b3e689e4d6239dac65bc4e9ae3265b10bfe87bb838aa15515b01e' +
        '1cf21c14f99d474e12f5fcbeba8697074176d9bf8e3463d6195805c883710299' +
        'e50f0eef74');
    const data = stringToBytes('Hello');
    const wrongData = stringToBytes('Hello0');

    let win;
    let crypto;
    let pubKeyInfoPromise;
    let pubKeyInfoPromise1;

    beforeEach(() => {
      crypto = createCrypto(win || env.win);
      pubKeyInfoPromise = crypto.importPublicKey(serviceName, {
        kty: 'RSA',
        'n': modulus,
        'e': pubExp,
        alg: 'RS256',
        ext: true,
      });
      pubKeyInfoPromise1 = crypto.importPublicKey(serviceName, {
        kty: 'RSA',
        'n': modulus1,
        'e': pubExp1,
        alg: 'RS256',
        ext: true,
      });
    });

    it('should resolve to a PublicKeyInfoDef object', () => {
      if (!crypto.isCryptoAvailable()) { return; }
      return pubKeyInfoPromise.then(pubKeyInfo => {
        expect(pubKeyInfo).to.not.be.null;
        expect(pubKeyInfo.serviceName).to.equal(serviceName);
        expect(pubKeyInfo.hash).to.not.be.null;
        expect(pubKeyInfo.hash.length).to.equal(4);
        expect(pubKeyInfo.cryptoKey).to.not.be.null;
      });
    });

    describe('verifySignature', function() {

      it('should validate with the correct key and signature', () => {
        if (!crypto.isCryptoAvailable()) { return; }
        return pubKeyInfoPromise.then(pubKeyInfo =>
            crypto.verifySignature(data, signature, pubKeyInfo)
                .then(isvalid => expect(isvalid).to.be.true));
      });

      it('should not validate with the correct key but wrong data', () => {
        if (!crypto.isCryptoAvailable()) { return; }
        // Test with correct key, but wrong data.
        return pubKeyInfoPromise.then(pubKeyInfo =>
            crypto.verifySignature(wrongData, signature, pubKeyInfo)
                .then(isvalid => expect(isvalid).to.be.false));
      });

      it('should not validate with the correct key but modified signature',
          () => {
            if (!crypto.isCryptoAvailable()) { return; }
            pubKeyInfoPromise.then(pubKeyInfo => {
              const arr = new Array(signature.length);
              for (let i = 0; i < signature.length ; i++) {
                const modifiedSig = signature.slice(0);
                modifiedSig[i] += 1;
                arr[i] = crypto.verifySignature(data, modifiedSig, pubKeyInfo)
                  .then(isvalid => expect(isvalid).to.be.false);
              };
              return Promise.all(arr);
            });
          });

      it('should not validate with wrong key', () => {
        if (!crypto.isCryptoAvailable()) { return; }
        return pubKeyInfoPromise1.then(pubKeyInfo1 =>
            crypto.verifySignature(data, signature, pubKeyInfo1)
                .then(isvalid => expect(isvalid).to.be.false));
      });
    });
  });
});
