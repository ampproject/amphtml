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
      'PTzfydqid9+FitGB3xeQEG98u+zj6/wpZ/KMeZewGldw/pp2MCvwstHGCtqjIN5ROi61OmZkQDW9c2ezuu1WTXDANoE5UY5ED51lftywdTYmLk+rvtRL/fUVaPIOaiP/wkm+I2Ssw99cOnv4hFphOuz9Db2/RisQXVT/7yiaiHDEE5aJlxuAYqyjMnDweGhKjuXpgAOpbOOEI78t91AKpTbsQg9bxXafruB46+3jI6COfzI3e7griJ5LoQSPG4JEn7bw8jnD67djb9J3c6hak++vbSvqBxewNpSV+v9HU+w=';
    // eslint-disable-next-line max-len
    const decryptedContent =
      "\n      This is section is top secret.\n      You should only be able to read this if you have the correct permissions.\n      If you don't have the correct permissions, you shouldn't be able to read this section at all.\n      ";
    // eslint-disable-next-line max-len
    const encryptedKey =
      "ENCRYPT({'accessRequirements': ['googleAccessRequirements:123'], 'key':'0noKkOifsbYqKGUyPv+1JJLygWa3PuMA8vGBvRCmkaQ='})";
    const decryptedDocKey = '0noKkOifsbYqKGUyPv+1JJLygWa3PuMA8vGBvRCmkaQ=';
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
      crypt1.setAttribute('encrypted', '');
      crypt1.setAttribute('type', 'application/octet-stream');
      crypt1.textContent = encryptedContent;
      cryptoSection1 = win.document.createElement('section');
      cryptoSection1.setAttribute('subscriptions-section', 'content');
      cryptoSection1.appendChild(crypt1);
      win.document.body.appendChild(cryptoSection1);

      // Create encrypted content in the document body.
      const crypt2 = win.document.createElement('script');
      crypt2.setAttribute('encrypted', '');
      crypt2.setAttribute('type', 'application/octet-stream');
      crypt2.textContent = encryptedContent;
      cryptoSection2 = win.document.createElement('section');
      cryptoSection2.setAttribute('subscriptions-section', 'content');
      cryptoSection2.appendChild(crypt2);
      win.document.body.appendChild(cryptoSection2);

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
          encryptedKey
        );
      });
    });

    describe('decryptDocumentContent_', () => {
      it('should decrypt the content correctly', () => {
        return cryptoHandler
          .decryptDocumentContent_(encryptedContent, decryptedDocKey)
          .then(decryptedContent => {
            expect(decryptedContent).to.equal(decryptedContent);
          });
      });
    });

    describe('tryToDecryptDocument', () => {
      // eslint-disable-next-line max-len
      it('should replace the encrypted content with decrypted content in multiple sections', () => {
        return cryptoHandler.tryToDecryptDocument(decryptedDocKey).then(() => {
          expect(cryptoSection1.textContent).to.equal(decryptedContent);
          expect(cryptoSection2.textContent).to.equal(decryptedContent);
        });
      });
    });
  }
);
