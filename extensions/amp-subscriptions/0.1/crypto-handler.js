import {toArray} from '#core/types/array';
import {tryParseJson} from '#core/types/object/json';
import {padStart} from '#core/types/string';
import {utf8Encode} from '#core/types/string/bytes';

import {
  base64Decode,
  decryptAesGcmImpl,
  safeAesGcmImportKey,
} from '#third_party/subscriptions-project/aes_gcm';

export class CryptoHandler {
  /**
   * Creates an instance of CryptoHandler.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?Promise} */
    this.decryptionPromise_ = null;

    const parsedEncryptedKeys = this.ampdoc_
      .getRootNode()
      .querySelector('script[cryptokeys]');

    /** @private {?string} */
    this.shaKeyHash_ = null;
    if (
      parsedEncryptedKeys &&
      parsedEncryptedKeys.hasAttribute('sha-256-hash')
    ) {
      this.shaKeyHash_ = parsedEncryptedKeys.getAttribute('sha-256-hash');
    }

    /** @type {?JsonObject} */
    this.encryptedKeys_ =
      (parsedEncryptedKeys && tryParseJson(parsedEncryptedKeys.textContent)) ||
      null;
  }

  /**
   * Checks if the document is encrypted by looking at the parsed keys.
   * @return {boolean}
   */
  isDocumentEncrypted() {
    return !!this.encryptedKeys_ && Object.keys(this.encryptedKeys_).length > 0;
  }

  /**
   * This method is used for testing.
   * @return {?JsonObject}
   */
  getEncryptedKeys() {
    return this.encryptedKeys_;
  }

  /**
   * Returns encrypted document key if it exists.
   * This key is needed for requesting a different key
   * that decrypts locked content on the page.
   * @param {string} platformKey Who you want to decrypt the key.
   *                             For example: 'google.com'
   * @return {?string}
   */
  getEncryptedDocumentKey(platformKey) {
    // Doing this for testing.
    const encryptedKeys = this.getEncryptedKeys();
    if (!encryptedKeys) {
      return null;
    }
    return encryptedKeys[platformKey] || null;
  }

  /**
   * @param {string} decryptedDocumentKey
   * @return {!Promise}
   */
  tryToDecryptDocument(decryptedDocumentKey) {
    if (!this.shaKeyHash_) {
      return this.tryToDecryptDocumentImpl_(decryptedDocumentKey);
    }
    const docKeyUint8 = utf8Encode(decryptedDocumentKey);
    return crypto.subtle.digest('SHA-256', docKeyUint8).then((val) => {
      const hashArray = toArray(new Uint8Array(val));
      const hashHex = hashArray
        .map((b) => padStart(b.toString(16), 2, '0'))
        .join('');
      if (hashHex != this.shaKeyHash_) {
        return Promise.reject(new Error('Invalid Document Key'));
      }
      return this.tryToDecryptDocumentImpl_(decryptedDocumentKey);
    });
  }

  /**
   * @private
   * @param {string} decryptedDocumentKey
   * @return {!Promise}
   */
  tryToDecryptDocumentImpl_(decryptedDocumentKey) {
    if (this.decryptionPromise_) {
      return this.decryptionPromise_;
    }
    this.decryptionPromise_ = this.ampdoc_.whenReady().then(() => {
      const keybytes = base64Decode(decryptedDocumentKey);
      return safeAesGcmImportKey(keybytes.buffer).then((formattedkey) => {
        const encryptedSections = this.ampdoc_
          .getRootNode()
          .querySelectorAll('script[ciphertext]');
        const promises = [];
        encryptedSections.forEach((encryptedSection) => {
          const text = encryptedSection.textContent.replace(/\s+/g, '');
          const contentBuffer = base64Decode(text).buffer;
          const iv = contentBuffer.slice(0, 12);
          const bytesToDecrypt = contentBuffer.slice(12);
          promises.push(
            decryptAesGcmImpl(formattedkey, iv, bytesToDecrypt).then(
              (decryptedContent) => {
                encryptedSection./*OK*/ outerHTML = decryptedContent;
              }
            )
          );
        });
        return Promise.all(promises);
      });
    });
    return this.decryptionPromise_;
  }
}
