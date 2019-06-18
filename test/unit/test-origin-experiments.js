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

import {
  OriginExperiments,
  TokenMaster,
} from '../../src/service/origin-experiments-impl';
import {Services} from '../../src/services';
import {bytesToString} from '../../src/utils/bytes';
import {user} from '../../src/log';

describes.fakeWin('OriginExperiments', {amp: true}, env => {
  const TAG = 'OriginExperiments';
  // Token enables experiment "foo" for origin "https://origin.com".
  const token =
    'AAAAAFd7Im9yaWdpbiI6Imh0dHBzOi8vb3JpZ2luLmNvbSIsImV4cGVyaW1lbnQiOiJmb28iLCJleHBpcmF0aW9uIjoxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOH0+0WnsFJFtFJzkrzqxid2h3jnFI2C7FTK+8iRYcU1r+9PZtnMPJCVCkNkxWGpXFZ6z2FwIa/hY4XDM//GJHr+2pdChx67wm6RIY1NDwcYqFbUrugEqWiT/2RviS9PPhtP6PKgUDI+0opQUt2ibXhsc1KynroAcGTaaxofmpnuMdj7vjGlWTF+6WCFYfAzqcLJB5a4+Drop9ZTEYRbRROMVROC8EGHwugeMfoNf3roCqaJydADQ/tSTY/fPZOlcwOtGW8GE4s/KlNyFaonjEYOROuLctJxYAqwIStQ4TdS7xfy70hsgVLCKnLeXIRJKN0eaJCkLy6BFbIrCH5FhjhbY'; // eslint-disable-line max-len

  let ampdoc;
  let isPkcsAvailable;
  let originExperiments;
  let sandbox;
  let win;
  let error;

  beforeEach(() => {
    ({win, ampdoc, sandbox} = env);

    const crypto = Services.cryptoFor(win);
    isPkcsAvailable = sandbox.stub(crypto, 'isPkcsAvailable').returns(true);

    error = sandbox.stub(user(), 'error');

    originExperiments = new OriginExperiments(ampdoc);
  });

  function setupMetaTagWith(token) {
    const meta = win.document.createElement('meta');
    meta.setAttribute('name', 'amp-experiment-token');
    meta.setAttribute('content', token);
    win.document.head.appendChild(meta);
  }

  it('should return false if no token is found', function*() {
    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal([]);
    yield experiments;
    expect(error).to.not.be.called;
  });

  it('should return false if crypto is unavailable', function*() {
    isPkcsAvailable.returns(false);

    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal([]);
    expect(error).calledWithMatch(TAG, 'Crypto is unavailable');
  });

  it('should return false for missing token', function*() {
    setupMetaTagWith('');

    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal([]);
    yield experiments;
    expect(error).calledWithMatch(TAG, 'Missing content for experiment token');
  });

  it('should return false if origin does not match', function*() {
    setupMetaTagWith(token);
    win.location.href = 'https://not-origin.com';

    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal([]);
    yield experiments;
    expect(error).calledWithMatch(TAG, 'Failed to verify experiment token');
  });

  it('should return true for valid token with matching origin', function*() {
    setupMetaTagWith(token);
    win.location.href = 'https://origin.com';

    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal(['foo']);
    yield experiments;
    expect(error).to.not.be.called;
  });

  it('should return false if experiment is not in config', function*() {
    setupMetaTagWith(token);
    win.location.href = 'https://origin.com';

    const experiments = originExperiments.getExperiments();
    expect(experiments).to.eventually.deep.equal([]);
    yield experiments;
    expect(error).to.not.be.called;
  });
});

describes.fakeWin('TokenMaster', {amp: true}, env => {
  let tokenMaster;

  let publicKey;
  let privateKey;

  let token;
  let tokenWithBadVersion;
  let tokenWithExpiredExperiment;
  let tokenWithBadConfigLength;
  let tokenWithBadSignature;

  // Generate test tokens once since generating keys is slow.
  beforeEach(() => {
    const crypto = Services.cryptoFor(env.win);
    const url = Services.urlForDoc(env.ampdoc.getHeadNode());
    tokenMaster = new TokenMaster(crypto, url);

    return tokenMaster.generateKeys().then(keyPair => {
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
        tokenMaster.generateToken(0, config, privateKey),
        tokenMaster.generateToken(42, config, privateKey),
        tokenMaster.generateToken(0, expired, privateKey),
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
    const verify = tokenMaster.verifyToken(
      tokenWithBadVersion,
      'https://origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.rejectedWith(
      'Unrecognized token version: 42'
    );
  });

  it('should throw if config length exceeds byte length', () => {
    const verify = tokenMaster.verifyToken(
      tokenWithBadConfigLength,
      'https://origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.rejectedWith(
      'Unexpected config length: 999'
    );
  });

  it('should throw if signature cannot be verified', () => {
    const verify = tokenMaster.verifyToken(
      tokenWithBadSignature,
      'https://origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.rejectedWith(
      'Failed to verify token signature.'
    );
  });

  it('should throw if approved origin is not current origin', () => {
    const verify = tokenMaster.verifyToken(
      token,
      'https://not-origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.rejectedWith(
      /does not match window/
    );
  });

  it('should return false if trial has expired', () => {
    const verify = tokenMaster.verifyToken(
      tokenWithExpiredExperiment,
      'https://origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.rejectedWith(
      'Experiment "expired" has expired.'
    );
  });

  it('should return true for a well-formed, unexpired token', () => {
    const verify = tokenMaster.verifyToken(
      token,
      'https://origin.com',
      publicKey
    );
    return expect(verify).to.eventually.be.fulfilled;
  });

  it('should ignore trailing slash on location', () => {
    const verify = tokenMaster.verifyToken(
      token,
      'https://origin.com/',
      publicKey
    );
    return expect(verify).to.eventually.be.fulfilled;
  });
});
