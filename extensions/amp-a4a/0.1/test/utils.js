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

import {AmpA4A} from '../amp-a4a';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {installDocService} from '../../../../src/service/ampdoc-impl';

/** @type {string} @private */
export const SIGNATURE_HEADER = 'X-TestSignatureHeader';

/** @type {string} @private */
export const SIZE_HEADER = 'X-CreativeSize';

/** @type {string} @private */
export const TEST_URL = 'http://iframe.localhost:' + location.port +
    '/test/fixtures/served/iframe.html?args';

export class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve(TEST_URL);
  }

  updatePriority() {
    // Do nothing.
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve({
      creative: responseArrayBuffer,
      signature: responseHeaders.has(SIGNATURE_HEADER) ?
          base64UrlDecodeToBytes(responseHeaders.get(SIGNATURE_HEADER)) : null,
      size: responseHeaders.has(SIZE_HEADER) ?
          responseHeaders.get(SIZE_HEADER).split('x') : null,
    });
  }

  /** @override */
  handleResize() {
    return;
  }

  getFallback() {
    return null;
  }
}


/**
 * Setup fixture for ad related testing.
 *
 * @param {!{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element,
 *   addElement: function(!Element):!Promise
 * }} fixture
 */
export function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  const doc = fixture.doc;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}
