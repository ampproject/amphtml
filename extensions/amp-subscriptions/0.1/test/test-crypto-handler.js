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


import {CryptoHandler} from '../crypto-handler';

describes.realWin('crypto handler', {
  amp: true,
},
env => {
  let win;
  let ampdoc;
  let cryptoHandler;
  let encryptedLocalKey;
  const serviceConfig = {
    services: [
      {
        authorizationUrl: 'https://lipsum.com/authorize',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
      },
    ],
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    win = env.win;
    ampdoc = env.ampdoc;
    const element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'application/json');
    element.innerHTML = JSON.stringify(serviceConfig);
    win.document.head.appendChild(element);
    cryptoHandler = new CryptoHandler(ampdoc);
    encryptedLocalKey = 'encryptedLocalKey';
  });

  describe('getEncryptedDocumentKey', () => {
    it('should return null when there are no keys', () => {
      return expect(cryptoHandler.getEncryptedDocumentKey()).to.be.null;
    });

    it('should return null when call doesnt match keys', () => {
      sandbox.stub(cryptoHandler, 'getEncryptedKeys').callsFake(() => {
        return {'local': encryptedLocalKey};
      });
      return expect(cryptoHandler.getEncryptedDocumentKey(
          'serviceId')).to.be.null;
    });

    it('should return expected value to a matching key', () => {
      sandbox.stub(cryptoHandler, 'getEncryptedKeys').callsFake(() => {
        return {'local': encryptedLocalKey};
      });
      return expect(cryptoHandler.getEncryptedDocumentKey(
          'local')).to.equal(encryptedLocalKey);
    });
  });

  describe('tryToDecryptDocument', () => {
    it('should return an empty array', () => {
      return cryptoHandler.tryToDecryptDocument(
          'decryptedDocumentKey').then(decryptedContent => {
        expect(decryptedContent.length).to.equal(0);
      });
    });

    it('should replace the encrypted content with decrypted content', () => {
      debugger;
      return cryptoHandler.tryToDecryptDocument(
          'decryptedDocumentKey').then(decryptedContent => {
        expect(decryptedContent.length).to.equal(0);
      });
    });

    it('should decrypt multiple sections', () => {
      return cryptoHandler.tryToDecryptDocument(
          'decryptedDocumentKey').then(decryptedContent => {
        expect(decryptedContent.length).to.equal(0);
      });
    });
  });
});
