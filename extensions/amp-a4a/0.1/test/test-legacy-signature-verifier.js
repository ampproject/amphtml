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

import {FetchMock, networkFailure} from './fetch-mock';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {LegacySignatureVerifier} from '../legacy-signature-verifier';

describes.realWin('LegacySignatureVerifier', {amp: true}, env => {

  let fetchMock;
  let keysetBody;
  let verifier;
  let result;

  beforeEach(() => {
    fetchMock = new FetchMock(env.win);
    fetchMock.getOnce(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
        () => keysetBody, {name: 'keyset'});
    keysetBody = `{"keys":[${validCSSAmp.publicKey}]}`;
    verifier = new LegacySignatureVerifier(env.win);
    result = verifier.keys_;
  });

  afterEach(() => {
    fetchMock./*OK*/restore();
  });

  function verifyIsKeyInfo(keyInfo) {
    expect(keyInfo).to.be.ok;
    expect(keyInfo).to.have.all.keys(
        ['signingServiceName', 'hash', 'cryptoKey']);
    expect(keyInfo.signingServiceName).to.be.a('string').and.not.to.equal('');
    expect(keyInfo.hash).to.be.instanceOf(Uint8Array);
  }

  it('should fetch a single key', () => {
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(1);
    return Promise.all(result).then(serviceInfos => {
      expect(fetchMock.called('keyset')).to.be.true;
      const serviceInfo = serviceInfos[0];
      expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
      expect(serviceInfo['signingServiceName']).to.equal('google');
      expect(serviceInfo['keys']).to.be.an.instanceof(Array);
      expect(serviceInfo['keys']).to.have.lengthOf(1);
      const keyInfoPromise = serviceInfo['keys'][0];
      expect(keyInfoPromise).to.be.an.instanceof(env.win.Promise);
      return keyInfoPromise.then(keyInfo => {
        verifyIsKeyInfo(keyInfo);
      });
    });
  });

  it('should wait for promise', () => {
    expect(result).to.be.empty;
    let resolveWaitFor;
    verifier.loadKeyset('google', new Promise(resolve => {
      resolveWaitFor = resolve;
    }));
    expect(fetchMock.called('keyset')).to.be.false;
    resolveWaitFor();
    return Promise.all(result).then(() => {
      expect(fetchMock.called('keyset')).to.be.true;
    });
  });

  it('should fetch multiple keys', () => {
    // For our purposes, re-using the same key is fine.
    keysetBody =
        `{"keys":[${validCSSAmp.publicKey},${
            validCSSAmp.publicKey},${validCSSAmp.publicKey}]}`;
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(1);  // Only one service.
    return Promise.all(result).then(serviceInfos => {
      expect(fetchMock.called('keyset')).to.be.true;
      expect(serviceInfos).to.have.lengthOf(1);  // Only one service.
      const serviceInfo = serviceInfos[0];
      expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
      expect(serviceInfo['signingServiceName']).to.equal('google');
      expect(serviceInfo['keys']).to.be.an.instanceof(Array);
      expect(serviceInfo['keys']).to.have.lengthOf(3);
      return Promise.all(serviceInfo['keys'].map(keyInfoPromise =>
          keyInfoPromise.then(keyInfo => verifyIsKeyInfo(keyInfo))));
    });
  });

  it('should fetch from multiple services', () => {
    // For our purposes, we don't care what the key is, so long as it's valid.
    fetchMock.getOnce(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
        keysetBody, {name: 'dev-keyset'});
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    verifier.loadKeyset('google-dev', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(2);  // Two services.
    return Promise.all(result).then(serviceInfos => {
      expect(fetchMock.called('keyset')).to.be.true;
      expect(fetchMock.called('dev-keyset')).to.be.true;
      serviceInfos.map(serviceInfo => {
        expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
        expect(serviceInfo['signingServiceName']).to.have.string('google');
        expect(serviceInfo['keys']).to.be.an.instanceof(Array);
        expect(serviceInfo['keys']).to.have.lengthOf(1);
        const keyInfoPromise = serviceInfo['keys'][0];
        expect(keyInfoPromise).to.be.an.instanceof(env.win.Promise);
        return keyInfoPromise.then(keyInfo => {
          verifyIsKeyInfo(keyInfo);
        });
      });
    });
  });

  it('Should gracefully handle malformed key responses', () => {
    keysetBody = '{"keys":["invalid key data"]}';
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(1);  // Only one service.
    return Promise.all(result).then(serviceInfos => {
      expect(fetchMock.called('keyset')).to.be.true;
      expect(serviceInfos[0]).to.have.all.keys(['signingServiceName', 'keys']);
      expect(serviceInfos[0]['signingServiceName']).to.equal('google');
      expect(serviceInfos[0]['keys']).to.be.an.instanceof(Array);
      expect(serviceInfos[0]['keys']).to.be.empty;
    });
  });

  it('should gracefully handle network errors in a single service', () => {
    keysetBody = Promise.reject(networkFailure());
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(1);  // Only one service.
    return result[0].then(serviceInfo => {
      expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
      expect(serviceInfo['signingServiceName']).to.equal('google');
      expect(serviceInfo['keys']).to.be.an.instanceof(Array);
      expect(serviceInfo['keys']).to.be.empty;
    });
  });

  it('should handle success in one service and net error in another', () => {
    fetchMock.getOnce(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
        Promise.reject(networkFailure()), {name: 'dev-keyset'});
    expect(result).to.be.empty;
    verifier.loadKeyset('google', Promise.resolve());
    verifier.loadKeyset('google-dev', Promise.resolve());
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(2);  // Two services.
    return Promise.all(result.map(  // For each service...
        serviceInfoPromise => serviceInfoPromise.then(serviceInfo => {
          expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
          const signingServiceName = serviceInfo.signingServiceName;
          expect(serviceInfo['keys']).to.be.an.instanceof(Array);
          if (signingServiceName == 'google') {
            expect(serviceInfo['keys']).to.have.lengthOf(1);
            const keyInfoPromise = serviceInfo['keys'][0];
            expect(keyInfoPromise).to.be.an.instanceof(env.win.Promise);
            return keyInfoPromise.then(keyInfo => {
              verifyIsKeyInfo(keyInfo);
            });
          } else if (signingServiceName == 'google-dev') {
            expect(serviceInfo['keys']).to.be.empty;
          } else {
            throw new Error(
                `Unexpected service name: ${signingServiceName} is neither ` +
                    'google nor google-dev');
          }
        }))).then(() => {
          expect(fetchMock.called('keyset')).to.be.true;
          expect(fetchMock.called('dev-keyset')).to.be.true;
        });
  });

  it('should return valid object on invalid service name', () => {
    expect(result).to.be.empty;
    verifier.loadKeyset('fnord', Promise.resolve());
    expect(fetchMock.called('keyset')).to.be.false;
    expect(result).to.be.instanceof(Array);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.be.instanceof(Promise);
    return result[0].then(serviceInfo => {
      expect(serviceInfo).to.have.all.keys(['signingServiceName', 'keys']);
      expect(serviceInfo['signingServiceName']).to.equal('fnord');
      expect(serviceInfo['keys']).to.be.an.instanceof(Array);
      expect(serviceInfo['keys']).to.be.empty;
    });
  });
});
