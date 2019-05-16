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

describes.realWin(
  'crypto handler',
  {
    amp: true,
  },
  env => {
    let win;
    let ampdoc;
    let cryptDiv1;
    let cryptDiv2;
    let cryptoHandler;
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
    // eslint-disable-next-line max-len
    const encryptedLocalKey =
      'ENCRYPT({"accessRequirements": ["googleAccessRequirements:123"], "key":"googlePublickey"})';
    // eslint-disable-next-line max-len
    const encryptedGoogleKey =
      'ENCRYPT({"accessRequirements": ["googleAccessRequirements:123"], "key":"googlePublickey"})';
    const encryptedKeys = {
      'local': encryptedLocalKey,
      'google.com': encryptedGoogleKey,
    };

    beforeEach(() => {
      ampdoc = env.ampdoc;
      win = env.win;
      ampdoc = env.ampdoc;

      const element = win.document.createElement('script');
      element.id = 'amp-subscriptions';
      element.setAttribute('type', 'application/json');
      element.textContent = JSON.stringify(serviceConfig);
      win.document.head.appendChild(element);

      // Putting encrypted keys script into the doc head.
      const keyScript = win.document.createElement('script');
      keyScript.setAttribute('cryptokeys', '');
      keyScript.setAttribute('type', 'application/json');
      keyScript.textContent = JSON.stringify(encryptedKeys);
      win.document.head.appendChild(keyScript);

      // Create encrypted content in the document body.
      const crypt1 = win.document.createElement('script');
      crypt1.setAttribute('encrypted', '');
      crypt1.setAttribute('type', 'application/octet-stream');
      crypt1.textContent = JSON.stringify('ENCRYPT("Premium content 1")');
      cryptDiv1 = win.document.createElement('div');
      cryptDiv1.appendChild(crypt1);
      win.document.body.appendChild(cryptDiv1);

      // Create encrypted content in the document body.
      const crypt2 = win.document.createElement('script');
      crypt2.setAttribute('encrypted', '');
      crypt2.setAttribute('type', 'application/octet-stream');
      crypt2.textContent = JSON.stringify('ENCRYPT("Premium content 2")');
      cryptDiv2 = win.document.createElement('div');
      cryptDiv2.appendChild(crypt2);
      win.document.body.appendChild(cryptDiv2);

      cryptoHandler = new CryptoHandler(ampdoc);
    });

    describe('getEncryptedDocumentKey', () => {
      it('should return null when there are no keys', () => {
        return expect(cryptoHandler.getEncryptedDocumentKey()).to.be.null;
      });

      it('should return null when call doesnt match keys', () => {
        return expect(cryptoHandler.getEncryptedDocumentKey('doesntExist')).to
          .be.null;
      });

      it('should return expected value to a matching key', () => {
        return expect(cryptoHandler.getEncryptedDocumentKey('local')).to.equal(
          encryptedLocalKey
        );
      });
    });

    describe('tryToDecryptDocument', () => {
      // eslint-disable-next-line max-len
      it('should replace the encrypted content with decrypted content in multiple sections', () => {
        return cryptoHandler
          .tryToDecryptDocument('decryptedDocumentKey')
          .then(() => {
            expect(cryptDiv1.textContent).to.equal(' abc ');
            expect(cryptDiv2.textContent).to.equal(' abc ');
          });
      });
    });
  }
);
