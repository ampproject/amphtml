/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {LegacySignatureVerifier} from '../legacy-signature-verifier';
import {stringToBytes} from '../../../../src/utils/bytes';

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

  let verifier;
  let pubKeyInfoPromise;
  let pubKeyInfoPromise1;

  beforeEach(() => {
    verifier = new LegacySignatureVerifier(window);
    pubKeyInfoPromise = verifier.importPublicKey(serviceName, {
      kty: 'RSA',
      'n': modulus,
      'e': pubExp,
      alg: 'RS256',
      ext: true,
    });
    pubKeyInfoPromise1 = verifier.importPublicKey(serviceName, {
      kty: 'RSA',
      'n': modulus1,
      'e': pubExp1,
      alg: 'RS256',
      ext: true,
    });
  });

  it('should resolve to a PublicKeyInfoDef object', () => {
    if (!verifier.isAvailable()) { return; }
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
      if (!verifier.isAvailable()) { return; }
      return pubKeyInfoPromise.then(pubKeyInfo =>
          verifier.verifySignature(data, signature, pubKeyInfo)
              .then(isvalid => expect(isvalid).to.be.true));
    });

    it('should not validate with the correct key but wrong data', () => {
      if (!verifier.isAvailable()) { return; }
      // Test with correct key, but wrong data.
      return pubKeyInfoPromise.then(pubKeyInfo =>
          verifier.verifySignature(wrongData, signature, pubKeyInfo)
              .then(isvalid => expect(isvalid).to.be.false));
    });

    it('should not validate with the correct key but modified signature',
        () => {
          if (!verifier.isAvailable()) { return; }
          pubKeyInfoPromise.then(pubKeyInfo => {
            const arr = new Array(signature.length);
            for (let i = 0; i < signature.length ; i++) {
              const modifiedSig = signature.slice(0);
              modifiedSig[i] += 1;
              arr[i] = verifier.verifySignature(data, modifiedSig, pubKeyInfo)
                 .then(isvalid => expect(isvalid).to.be.false);
            };
            return Promise.all(arr);
          });
        });

    it('should not validate with wrong key', () => {
      if (!verifier.isAvailable()) { return; }
      return pubKeyInfoPromise1.then(pubKeyInfo1 =>
          verifier.verifySignature(data, signature, pubKeyInfo1)
              .then(isvalid => expect(isvalid).to.be.false));
    });
  });
});
