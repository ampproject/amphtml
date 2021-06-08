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

/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to wrap it with an <iframe>, so that we can perform
 * viewport-constrained visual diff tests.
 *
 * The following strings will be replaced at execution time:
 * 1. __WIDTH__ and __HEIGHT__ with the viewport's size from the test's config.
 * 2. __PERCY_CSS__ with Percy-specific CSS.
 */

// eslint-disable-next-line no-useless-concat
if ('__PERCY_CSS__' !== '__' + 'PERCY_CSS' + '__') {
  const style = document.createElement('style');
  style.setAttribute('data-percy-specific-css', '');
  style.textContent = '__PERCY_CSS__';
  document.body.appendChild(style);
}

const pageContents = document.documentElement.outerHTML; // eslint-disable-line local/no-forbidden-terms

const metaCharset =
  document.querySelector('head meta[charset]') ||
  document.createElement('meta');
if (!metaCharset.hasAttribute('charset')) {
  metaCharset.setAttribute('charset', 'utf-8');
}

while (document.head.firstChild) {
  document.head.removeChild(document.head.firstChild);
}
document.head.appendChild(metaCharset);

while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}

const iframe = document.createElement('iframe');
// @ts-ignore
iframe.width = __WIDTH__; // eslint-disable-line no-undef
// @ts-ignore
iframe.height = __HEIGHT__; // eslint-disable-line no-undef
iframe.srcdoc = pageContents;
document.body.appendChild(iframe);

document.body.style.margin = '0'; // eslint-disable-line local/no-style-property-setting
iframe.style.border = '0'; // eslint-disable-line local/no-style-property-setting
