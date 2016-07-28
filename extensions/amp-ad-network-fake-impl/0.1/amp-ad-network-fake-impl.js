/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {base64ToByteArray} from '../../../ads/google/a4a/utils';
import {AmpA4A, utf8FromArrayBuffer} from '../../amp-a4a/0.1/amp-a4a';
import {dev} from '../../../src/log';

export class AmpAdNetworkFakeImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
  }

  /** @override */
  isValidElement() {
    return true;
  }

  /** @override */
  getAdUrl() {
    return '../extensions/amp-ad-network-fake-impl/0.1/data/' +
        this.element.getAttribute('src');
  }

  /** @override */
  extractCreativeAndSignature(responseText, unusedResponseHeaders) {
    return utf8FromArrayBuffer(responseText).then(deserialized => {
      const decoded = JSON.parse(deserialized);
      dev.info('Fake', 'Decoded response text =', decoded['creative']);
      dev.info('Fake', 'Decoded signature =', decoded['signature']);
      const encoder = new TextEncoder('utf-8');
      return {
        creative: encoder.encode(decoded['creative']).buffer,
        signature: base64ToByteArray(decoded['signature']),
      };
    });
  }
}

AMP.registerElement(
    'amp-ad-network-fake-impl', AmpAdNetworkFakeImpl);
