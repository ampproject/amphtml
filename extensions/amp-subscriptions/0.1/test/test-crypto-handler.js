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
    let cryptoSection1;
    let cryptoSection2;
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
    const encryptedContent =
      'W03SytAJzlAhsj/XVOBtKQdVhINRBWcMIEO3ttsJgYj8GjwDRS0x8SNGu8IO4OyFB/SSpWYKOJITu4Fo98OzCF4ue3RT94XqmZf2UCjLc5i/eIl0f+jYJRl5Qfo1tnAD6z4sgF1pEHJ8H5JbaqCQXSv7rmBiD7NkdLOgcJlwYwCPBpHWmJkFBeQfMohSpuk38xEtwIDqAqN0eKGBz8aTU0jHvpC5zWBFVhjxnoSgTfYJMrmIldFqSqaXra+KlOeaXvTaMT7vZCY5bAJcuHAlmxNghv7GptrLiR02ZMEt334AjY8dPYJQBW+giMqjeU3w5i0GJHmksrfFognnjlRtS5/hOc9JVwqq';
    // eslint-disable-next-line max-len
    const decryptedContent =
      "\n      This is section is top secret.\n      You should only be able to read this if you have the correct permissions.\n      If you don't have the correct permissions, you shouldn't be able to read this section at all.\n      ";
    // eslint-disable-next-line max-len
    const encryptedKey =
      "ENCRYPT({'AccessRequirements': ['googleAccessRequirements:123'], 'Key':'/L2HS2v6LrJIk8iq+7AhdA=='})";
    const decryptedDocKey = '/L2HS2v6LrJIk8iq+7AhdA==';
    const decryptedDocKeyHash =
      '9dc1e142b11338d895438a3f8c0947b57a7c368e9d7913f7df80b5491f488490';
    const encryptedKeys = {
      'local': encryptedKey,
      'google.com': encryptedKey,
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
      crypt1.setAttribute('ciphertext', '');
      crypt1.setAttribute('type', 'application/octet-stream');
      crypt1.textContent = encryptedContent;
      cryptoSection1 = win.document.createElement('section');
      cryptoSection1.setAttribute('subscriptions-section', 'content');
      cryptoSection1.setAttribute('encrypted', '');
      cryptoSection1.appendChild(crypt1);
      win.document.body.appendChild(cryptoSection1);

      // Create encrypted content in the document body.
      const crypt2 = win.document.createElement('script');
      crypt2.setAttribute('ciphertext', '');
      crypt2.setAttribute('type', 'application/octet-stream');
      crypt2.textContent = encryptedContent;
      cryptoSection2 = win.document.createElement('section');
      cryptoSection2.setAttribute('subscriptions-section', 'content');
      cryptoSection2.setAttribute('encrypted', '');
      cryptoSection2.appendChild(crypt2);
      win.document.body.appendChild(cryptoSection2);
    });

    describe('getEncryptedDocumentKey', () => {
      it('should return null when there are no keys', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return expect(cryptoHandler.getEncryptedDocumentKey()).to.be.null;
      });

      it('should return null when call doesnt match keys', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return expect(cryptoHandler.getEncryptedDocumentKey('doesntExist')).to
          .be.null;
      });

      it('should return expected value to a matching key', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return expect(cryptoHandler.getEncryptedDocumentKey('local')).to.equal(
          encryptedKey
        );
      });
    });

    describe('decryptDocumentContent_', () => {
      it('should decrypt the content correctly', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return cryptoHandler
          .decryptDocumentContent_(encryptedContent, decryptedDocKey)
          .then(actualContent => {
            expect(actualContent).to.equal(decryptedContent);
          });
      });
    });

    describe('tryToDecryptDocument', () => {
      // eslint-disable-next-line max-len
      it('should replace the encrypted content with decrypted content in multiple sections', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return cryptoHandler.tryToDecryptDocument(decryptedDocKey).then(() => {
          expect(cryptoSection1.textContent).to.equal(decryptedContent);
          expect(cryptoSection2.textContent).to.equal(decryptedContent);
        });
      });

      it('should replace the encrypted content with decrypted content in multiple sections with SHA256 hash', () => {
        win.document
          .querySelector('script[cryptokeys]')
          .setAttribute('sha-256-hash', decryptedDocKeyHash);
        cryptoHandler = new CryptoHandler(ampdoc);
        return cryptoHandler.tryToDecryptDocument(decryptedDocKey).then(() => {
          expect(cryptoSection1.textContent).to.equal(decryptedContent);
          expect(cryptoSection2.textContent).to.equal(decryptedContent);
        });
      });

      it('should fail due to key hashes being unequal', () => {
        win.document
          .querySelector('script[cryptokeys]')
          .setAttribute('sha-256-hash', decryptedDocKeyHash);
        cryptoHandler = new CryptoHandler(ampdoc);
        const fakeDocKey = '0nasdf234ikn23r09jijfakefake923r42aQ=';
        return cryptoHandler.tryToDecryptDocument(fakeDocKey).then(
          () => {
            throw new Error('Promise should have rejected.');
          },
          reason => {
            expect(() => {
              throw reason;
            }).to.throw('Invalid Document Key');
          }
        );
      });
    });
  }
);
