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

import {Services} from '../../../src/services';
import {createElementWithAttributes, escapeHtml} from '../../../src/dom';
import {dict} from '../../../src/utils/object';

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

const sandboxVals =
  'allow-forms ' +
  'allow-popups ' +
  'allow-popups-to-escape-sandbox ' +
  'allow-same-origin ' +
  'allow-top-navigation';

export const createSecureDocSkeleton = (url, sanitizedHeadElements, body) =>
  `<!DOCTYPE html>
  <html ⚡4ads lang="en">
  <head>
    <base href="${escapeHtml(url)}">
    <meta charset="UTF-8">
    <meta http-equiv=Content-Security-Policy content="
      img-src * data:;
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
  <body>${body}</body>
  </html>`;

/**
 * Create iframe with predefined CSP and sandbox attributes for security.
 * @param {!Window} win
 * @param {string} title
 * @param {string} height
 * @param {string} width
 * @return {!HTMLIFrameElement}
 */
export function createSecureFrame(win, title, height, width) {
  const sandbox = Services.platformFor(win).isSafari()
    ? sandboxVals + ' allow scripts'
    : sandboxVals;

  const {document} = win;
  const iframe = /** @type {!HTMLIFrameElement} */ (createElementWithAttributes(
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
      'sandbox': sandbox,
    })
  ));
  return iframe;
}
