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

import {Crypto} from '../../src/service/crypto-impl';
import {OriginExperiments} from '../../src/origin-experiments';
import {bytesToString} from '../../src/utils/bytes';

describe('OriginExperiments', () => {
  let originExperiments;

  let publicKey;
  let privateKey;

  let token;
  let tokenWithBadVersion;
  let tokenWithExpiredExperiment;
  let tokenWithBadConfigLength;
  let tokenWithBadSignature;

  // Generate test tokens once since generating keys is slow.
  before(() => {
    const crypto = new Crypto(window);
    originExperiments = new OriginExperiments(crypto);

    return originExperiments.generateKeys().then(keyPair => {
      ({publicKey, privateKey} = keyPair);

      const config = {
        origin: 'https://origin.com',
        experiment: 'origin',
        expiration: Date.now() + 1000 * 1000, // 1000s in the future.
      };
      const expired = {
        origin: 'https://origin.com',
        experiment: 'expired',
        expiration: Date.now() - 1000, // 1s in the past.
      };

      return Promise.all([
        originExperiments.generateToken(0, config, privateKey),
        originExperiments.generateToken(42, config, privateKey),
        originExperiments.generateToken(0, expired, privateKey),
      ]).then(results => {
        token = results[0];
        tokenWithBadVersion = results[1];
        tokenWithExpiredExperiment = results[2];

        // Generate token with bad signature by truncating.
        tokenWithBadSignature = token.slice(0, token.length - 5);

        // Generate token with bad config length by hand.
        const data = new Uint8Array(5);
        new DataView(data.buffer).setUint32(1, 999, false); // 999 length.
        tokenWithBadConfigLength = btoa(bytesToString(data));
      });
    });
  });

  it('should throw for an unknown token version number', () => {
    const verify = originExperiments.verifyToken(
        tokenWithBadVersion, 'https://origin.com', publicKey);
    return expect(verify)
        .to.eventually.be.rejectedWith('Unrecognized token version: 42');
  });

  it('should throw if config length exceeds byte length', () => {
    const verify = originExperiments.verifyToken(
        tokenWithBadConfigLength, 'https://origin.com', publicKey);
    return expect(verify)
        .to.eventually.be.rejectedWith('Unexpected config length: 999');
  });

  it('should throw if signature cannot be verified', () => {
    const verify = originExperiments.verifyToken(
        tokenWithBadSignature, 'https://origin.com', publicKey);
    return expect(verify)
        .to.eventually.be.rejectedWith('Failed to verify token signature.');
  });

  it('should throw if approved origin is not current origin', () => {
    const verify = originExperiments.verifyToken(
        token, 'https://not-origin.com', publicKey);
    return expect(verify)
        .to.eventually.be.rejectedWith(/does not match window/);
  });

  it('should return false if trial has expired', () => {
    const verify = originExperiments.verifyToken(
        tokenWithExpiredExperiment, 'https://origin.com', publicKey);
    return expect(verify)
        .to.eventually.be.rejectedWith('Experiment "expired" has expired.');
  });

  it('should return true for a well-formed, unexpired token', () => {
    const verify = originExperiments.verifyToken(
        token, 'https://origin.com', publicKey);
    return expect(verify).to.eventually.be.fulfilled;
  });

  it('should ignore trailing slash on location', () => {
    const verify = originExperiments.verifyToken(
        token, 'https://origin.com/', publicKey);
    return expect(verify).to.eventually.be.fulfilled;
  });
});
