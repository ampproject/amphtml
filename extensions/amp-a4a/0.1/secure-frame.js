/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {isSrcdocSupported} from '../../../src/friendly-iframe-embed';

// If making changes also change ALLOWED_FONT_REGEX in head-validation.js
const fontProviderAllowList = [
  'https://cdn.materialdesignicons.com',
  'https://cloud.typography.com',
  'https://fast.fonts.net',
  'https://fonts.googleapis.com',
  'https://maxcdn.bootstrapcdn.com',
  'https://p.typekit.net',
  'https://pro.fontawesome.com',
  'https://use.fontawesome.com',
  'https://use.typekit.net',
].join(' ');

const sandboxVals = [
  'allow-forms',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-same-origin',
  'allow-top-navigation',
];

const createSecureDocSkeleton = (sanitizedHeadElements) =>
  `<!DOCTYPE html>
  <html ⚡4ads lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv=Content-Security-Policy content="
      img-src *;
      media-src *;
      font-src *;
      connect-src *;
      script-src 'none';
      object-src 'none';
      child-src 'none';
      default-src 'none';
      style-src ${fontProviderAllowList} 'unsafe-inline';
    ">
    ${sanitizedHeadElements}
  </head>
  <body></body>
  </html>`;

/**
 * Create iframe with predefined CSP and sandbox attributes for security.
 * @param {!Document} document
 * @param {!Element} head
 * @param {string} title
 * @param {string} height
 * @param {string} width
 * @return {!HTMLIFrameElement}
 *
 */
export function createSecureFrame(document, head, title, height, width) {
  const iframe = /** @type {HTMLIFrameElement} */ (createElementWithAttributes(
    document,
    'iframe',
    dict({
      // NOTE: It is possible for either width or height to be 'auto',
      // a non-numeric value.
      'height': height,
      'width': width,
      'title': title,
      'frameborder': '0',
      'allowfullscreen': '',
      'allowtransparency': '',
      'scrolling': 'no',
      'sandbox': sandboxVals.join(' '),
    })
  ));

  const secureDoc = createSecureDocSkeleton(head./*OK*/ innerHTML);
  // TODO(ccordry): add violation reporting here or in fie.
  if (isSrcdocSupported()) {
    iframe.srcdoc = secureDoc;
  } else {
    iframe.src = 'about:blank';
    const childDoc = iframe.contentWindow.document;
    childDoc.open();
    childDoc.write(secureDoc);
    childDoc.close();
  }
  return iframe;
}
