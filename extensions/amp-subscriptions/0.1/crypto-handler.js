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

import {base64DecodeToBytes} from '../../../src/utils/base64';
import {iterateCursor} from '../../../src/dom';
import {padStart} from '../../../src/string';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

// Length of IV in AES-GCM encoded content.
const AES_GCM_IV_LENGTH = 12;

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
   * This method is used for testing.
   * @return {?JsonObject}
   */
  getEncryptedKeys() {
    return this.encryptedKeys_;
  }

  /**
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
    return crypto.subtle.digest('SHA-256', docKeyUint8).then(val => {
      const hashArray = toArray(new Uint8Array(val));
      const hashHex = hashArray
        .map(b => padStart(b.toString(16), 2, '0'))
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
      const encryptedSections = this.ampdoc_
        .getRootNode()
        .querySelectorAll('script[ciphertext]');
      const promises = [];
      iterateCursor(encryptedSections, encryptedSection => {
        promises.push(
          this.decryptDocumentContent_(
            encryptedSection.textContent,
            decryptedDocumentKey
          ).then(decryptedContent => {
            encryptedSection./*OK*/ outerHTML = decryptedContent;
          })
        );
      });
      return Promise.all(promises);
    });
    return this.decryptionPromise_;
  }

  /**
   * @private
   * @param {string} encryptedContent
   * @param {string} decryptedDocumentKey
   * @return {Promise<string>}
   */
  decryptDocumentContent_(encryptedContent, decryptedDocumentKey) {
    // 1. Trim and remove all whitespaces (e.g. line breaks).
    encryptedContent = encryptedContent.replace(/\s+/g, '');

    // 2. Un-base64 the encrypted content. This way we get the actual encrypted
    //    bytes.
    const encryptedBytes = base64DecodeToBytes(encryptedContent);
    const iv = encryptedBytes.slice(0, AES_GCM_IV_LENGTH);
    const content = encryptedBytes.slice(AES_GCM_IV_LENGTH);

    // 3. Get document Key in the correct format.
    return this.stringToCryptoKey_(decryptedDocumentKey).then(function(
      formattedDocKey
    ) {
      // 4. Decrypt.
      return crypto.subtle
        .decrypt(
          {
            name: 'AES-GCM',
            iv,
          },
          formattedDocKey,
          content
        )
        .then(function(buffer) {
          // 5. Decryption gives us raw bytes and we need to turn them into text.
          return utf8Decode(new Uint8Array(buffer));
        });
    });
  }

  /**
   * @private
   * @param {string} decryptedDocumentKey
   * @return {!Promise<!webCrypto.CryptoKey>}
   */
  stringToCryptoKey_(decryptedDocumentKey) {
    // 1. Un-base64 the encrypted content. This way we get the key bytes.
    const documentKeyBytes = base64DecodeToBytes(decryptedDocumentKey);

    // 2. Convert bytes to CryptoKey format.
    return crypto.subtle.importKey('raw', documentKeyBytes, 'AES-GCM', true, [
      'decrypt',
    ]);
  }
}
