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

import {
  base64Decode,
  decryptAesGcmImpl,
  safeAesGcmImportKey,
} from '../../../third_party/subscriptions-project/aes_gcm';
import {iterateCursor} from '../../../src/dom';
import {padStart} from '../../../src/string';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {utf8Encode} from '../../../src/utils/bytes';

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
   * @param {string} serviceId Who you want to decrypt the key.
   *                           For example: 'google.com'
   * @return {?string}
   */
  getEncryptedDocumentKey(serviceId) {
    // Doing this for testing.
    const encryptedKeys = this.getEncryptedKeys();
    if (!encryptedKeys) {
      return null;
    }
    return encryptedKeys[serviceId] || null;
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
        iterateCursor(encryptedSections, (encryptedSection) => {
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
