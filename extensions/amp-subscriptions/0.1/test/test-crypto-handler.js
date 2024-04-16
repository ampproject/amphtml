import {decryptAesGcm} from '#third_party/subscriptions-project/aes_gcm';

import {CryptoHandler} from '../crypto-handler';

describes.realWin(
  'crypto handler',
  {
    amp: true,
  },
  (env) => {
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
    const encryptedContent =
      '8bCQpCyIBxBHwTZVRaMuA+DGXSTzVHR/Eh/l6QqfvcXQbn5uF/HzL539jw6Ok8+oppqo2eP/H9oqaYCi4Ya50uVFzdTCBzOSTlJDmeXhqO1DIBYHIQTK3z+NweOAJci7aXwSOLtJZd1KrrCesoBjAlQ55GwyPe6xPVcUESjtT15Z7Ez1GSetSE99MIbn8fWjq5CjUZn4q3jDKdNGdM6NZ86lqL5ZsbbUQRQ2dIVExrwS9GuuFsuFi8Eahe3/eZaibZY4PzPuVR6jjCrDrgF5qw+N+uacDumoA5he/1WrHiYHzoV28Xo9yuBBm5JWEcMepoUkQgKVywOFZS4otSR81va9JNwk1F1AIQ4VOqezFE6ce92qbzo+aMVzceZJqPhVqsA=';
    const decryptedContent =
      "\n              This is section is top secret.\n              You should only be able to read this if you have the correct permissions.\n              If you don't have the correct permissions, you shouldn't be able to read this section at all.\n            ";
    const encryptedKey =
      "ENCRYPT({'AccessRequirements': ['googleAccessRequirements:123'], 'Key':'mSfq5tRx5omXoOX20Oqq8g=='})";
    const decryptedDocKey = 'mSfq5tRx5omXoOX20Oqq8g==';
    const decryptedDocKeyHash =
      'a2de5c3d4947d3af3e9357b224220855591fa5ebecfbfcaa8a5dd8361f1c08da';
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
        expect(cryptoHandler.getEncryptedDocumentKey()).to.be.null;
      });

      it('should return null when call doesnt match keys', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        expect(cryptoHandler.getEncryptedDocumentKey('doesntExist')).to.be.null;
      });

      it('should return expected value to a matching key', () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        expect(cryptoHandler.getEncryptedDocumentKey('local')).to.equal(
          encryptedKey
        );
      });
    });

    describe('decryptDocumentContent', () => {
      it('should decrypt the content correctly', async () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        return await decryptAesGcm(decryptedDocKey, encryptedContent).then(
          (actualContent) => {
            expect(actualContent.replace(/&#39;/g, "'")).to.equal(
              decryptedContent
            );
          }
        );
      });
    });

    describe('tryToDecryptDocument', () => {
      it('should replace the encrypted content with decrypted content in multiple sections', async () => {
        cryptoHandler = new CryptoHandler(ampdoc);
        await cryptoHandler.tryToDecryptDocument(decryptedDocKey);
        expect(cryptoSection1.textContent).to.equal(decryptedContent);
        expect(cryptoSection2.textContent).to.equal(decryptedContent);
      });

      it('should replace the encrypted content with decrypted content in multiple sections with SHA256 hash', async () => {
        win.document
          .querySelector('script[cryptokeys]')
          .setAttribute('sha-256-hash', decryptedDocKeyHash);
        cryptoHandler = new CryptoHandler(ampdoc);

        await cryptoHandler.tryToDecryptDocument(decryptedDocKey);
        expect(cryptoSection1.textContent).to.equal(decryptedContent);
        expect(cryptoSection2.textContent).to.equal(decryptedContent);
      });

      it('should fail due to key hashes being unequal', async () => {
        win.document
          .querySelector('script[cryptokeys]')
          .setAttribute('sha-256-hash', decryptedDocKeyHash);
        cryptoHandler = new CryptoHandler(ampdoc);
        const fakeDocKey = '0nasdf234ikn23r09jijfakefake923r42aQ=';
        try {
          await cryptoHandler.tryToDecryptDocument(fakeDocKey);
          throw new Error('Promise should have rejected.');
        } catch (reason) {
          expect(reason.message).to.contain('Invalid Document Key');
        }
      });
    });
  }
);
