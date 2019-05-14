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


import {iterateCursor} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';


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

    const parsedEncryptedKeys =
        this.ampdoc_.getRootNode().querySelector('script[keys]');
    /** @type {?JsonObject} */
    this.encryptedKeys_ = (parsedEncryptedKeys &&
      tryParseJson(parsedEncryptedKeys.textContent)) || null;
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
    if (this.decryptionPromise_) {
      return this.decryptionPromise_;
    }
    this.decryptionPromise_ = this.ampdoc_.whenReady().then(() => {
      const encryptedSections =
          this.ampdoc_.getRootNode().querySelectorAll('script[encrypted]');
      const promises = [];
      iterateCursor(encryptedSections, encryptedSection => {
        promises.push(
            this.decryptDocumentContent_(encryptedSection.textContent,
                decryptedDocumentKey).then(decryptedContent => {
              encryptedSection./*OK*/outerHTML = decryptedContent;
            }));
      });
      return Promise.all(promises);
    });
    return this.decryptionPromise_;
  }

  /**
   * @private
   * @param {string} encryptedContent
   * @param {string} documentKey
   * @return {Promise<string>}
   */
  decryptDocumentContent_(
    encryptedContent, documentKey) {

console.log('encryptedContent', encryptedContent);
console.log('documentKey', documentKey);

    const decryptedContent = crypto.subtle.decrypt(
        {
          name: 'AES-CTR',
          counter: new Uint8Array(16), // iv: all zeros.
          length: 128, // block size (16): 1-128
        },
        this.base64ToBytes(documentKey),
        encryptedContent.trim(),
    ).then(function(buffer) {
      return new TextDecoder().decode(new Uint8Array(buffer));
    });
    // const placeholder = '<h2><i> abc </i></h2>';
    return Promise.resolve(decryptedContent);
  }

  /**
   * @param {string} s
   * @return {ArrayBuffer}
   */
  base64ToBytes(s) {
    s = s.trim();
    const bytesString = atob(s);
    const bytes = new Uint8Array(bytesString.length);
    for (let i = 0; i < bytesString.length; i++) {
      bytes[i] = bytesString.charCodeAt(i);
    }
    return bytes;
  }
}
