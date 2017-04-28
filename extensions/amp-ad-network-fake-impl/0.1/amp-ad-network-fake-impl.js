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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {base64DecodeToBytes} from '../../../src/utils/base64';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {resolveRelativeUrl} from '../../../src/url';
import {utf8Decode} from '../../../src/utils/bytes';


export class AmpAdNetworkFakeImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    user().assert(element.hasAttribute('src'),
        'Attribute src required for <amp-ad type="fake">: %s', element);
    user().assert(TextEncoder, '<amp-ad type="fake"> requires browser'
        + ' support for TextEncoder() function.');
  }

  /** @override */
  isValidElement() {
    // Note: true is the default, so this method is not strictly needed here.
    // But a network implementation might choose to implement a real check
    // in this method.
    return true;
  }

  /** @override */
  getAdUrl() {
    return resolveRelativeUrl(
        this.element.getAttribute('src'),
        '/extensions/amp-ad-network-fake-impl/0.1/data/');
  }

  /** @override */
  extractCreativeAndSignature(responseText, unusedResponseHeaders) {
    return utf8Decode(responseText).then(deserialized => {
      if (getMode().localDev) {
        if (this.element.getAttribute('fakesig') == 'true') {
          // In the fake signature mode the content is the plain AMP HTML
          // and the signature is "FAKESIG". This mode is only allowed in
          // `localDev` and primarily used for A4A Envelope for testing.
          // See DEVELOPING.md for more info.
          const creative = this.transformCreativeLocalDev_(deserialized);
          const encoder = new TextEncoder('utf-8');
          return {
            creative: encoder.encode(creative).buffer,
            signatureInfo: {
              signingServiceName: 'FAKESERVICE',
              keypairId: 'FAKEKEY',
              signature: 'FAKESIG',
            },
            // TODO(taymon): finish refactoring this
          };
        }
      }

      // Normal mode: the content is a JSON structure with two fieleds:
      // `creative` and `signature`.
      const decoded = JSON.parse(deserialized);
      dev().info('AMP-AD-FAKE', 'Decoded response text =', decoded['creative']);
      dev().info('AMP-AD-FAKE', 'Decoded signature =', decoded['signature']);
      const encoder = new TextEncoder('utf-8');
      return {
        creative: encoder.encode(decoded['creative']).buffer,
        signature: base64DecodeToBytes(decoded['signature']),
      };
    });
  }

  /**
   * Converts a general AMP doc to a AMP4ADS doc. Only used in localDev.
   * @param {string} source
   * @return {string}
   */
  transformCreativeLocalDev_(source) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const root = doc.documentElement;

    // <html ⚡> -> <html ⚡4ads>
    if (root.hasAttribute('⚡')) {
      root.removeAttribute('⚡');
    } else if (root.hasAttribute('amp')) {
      root.removeAttribute('amp');
    } else if (root.hasAttribute('AMP')) {
      root.removeAttribute('AMP');
    }
    if (!root.hasAttribute('⚡4ads') && !root.hasAttribute('⚡4ADS')) {
      root.setAttribute('amp4ads', '');
    }

    // Remove all AMP scripts.
    const extensions = [];
    const scripts = doc.head.querySelectorAll('script[src]');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.hasAttribute('custom-element')) {
        extensions.push(script.getAttribute('custom-element'));
      } else if (script.hasAttribute('custom-template')) {
        extensions.push(script.getAttribute('custom-template'));
      }
      doc.head.removeChild(script);
    }

    // Remove boilerplate styles.
    const styles = doc.head.querySelectorAll('style[amp-boilerplate]');
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      style.parentNode.removeChild(style);
    }

    let creative = root./*OK*/outerHTML;

    // Metadata
    creative += '<script type="application/json" amp-ad-metadata>';
    creative += '{';
    creative += '"ampRuntimeUtf16CharOffsets": [0, 0],';
    creative += '"customElementExtensions": [';
    for (let i = 0; i < extensions.length; i++) {
      if (i > 0) {
        creative += ',';
      }
      creative += `"${extensions[i]}"`;
    }
    creative += ']';
    creative += '}';
    creative += '</script>';

    return creative;
  }
}

AMP.registerElement(
    'amp-ad-network-fake-impl', AmpAdNetworkFakeImpl);
