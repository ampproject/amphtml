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
import {map} from '../../../src/utils/object';
import {parseExtensionUrl} from '../../../src/service/extension-location';
import {removeElement} from '../../../src/dom';
import {urls} from '../../../src/config';

/**
 * @typedef {{
 *    extensions: !Array<{extensionId: (string|undefined), extensionVersion: (string|undefined)}>,
 *    head: !Element
 * }}
 */
export let ValidatedHeadDef;

// From validator/validator-main.protoascii
const ALLOWED_FONT_REGEX = new RegExp(
  'https://cdn\\.materialdesignicons\\.com/' +
    '([0-9]+\\.?)+/css/materialdesignicons\\.min\\.css|' +
    'https://cloud\\.typography\\.com/' +
    '[0-9]*/[0-9]*/css/fonts\\.css|' +
    'https://fast\\.fonts\\.net/.*|' +
    'https://fonts\\.googleapis\\.com/css2?\\?.*|' +
    'https://fonts\\.googleapis\\.com/icon\\?.*|' +
    'https://fonts\\.googleapis\\.com/earlyaccess/.*\\.css|' +
    'https://maxcdn\\.bootstrapcdn\\.com/font-awesome/' +
    '([0-9]+\\.?)+/css/font-awesome\\.min\\.css(\\?.*)?|' +
    'https://(use|pro)\\.fontawesome\\.com/releases/v([0-9]+\\.?)+' +
    '/css/[0-9a-zA-Z-]+\\.css|' +
    'https://(use|pro)\\.fontawesome\\.com/[0-9a-zA-Z-]+\\.css|' +
    'https://use\\.typekit\\.net/[\\w\\p{L}\\p{N}_]+\\.css'
);

// If editing please also change:
// extensions/amp-a4a/amp-a4a-format.md#allowed-amp-extensions-and-builtins
const EXTENSION_ALLOWLIST = map({
  'amp-accordion': true,
  'amp-ad-exit': true,
  'amp-analytics': true,
  'amp-anim': true,
  'amp-animation': true,
  'amp-audio': true,
  'amp-bind': true,
  'amp-carousel': true,
  'amp-fit-text': true,
  'amp-font': true,
  'amp-form': true,
  'amp-img': true,
  'amp-layout': true,
  'amp-lightbox': true,
  'amp-mraid': true,
  'amp-mustache': true,
  'amp-pixel': true,
  'amp-position-observer': true,
  'amp-selector': true,
  'amp-social-share': true,
  'amp-video': true,
});

const EXTENSION_URL_PREFIX = new RegExp(
  urls.cdn.replace(/\./g, '\\.') + '/v0/'
);

/**
 * Sanitizes AMPHTML Ad head element and extracts extensions to be installed.
 * @param {!Window} win
 * @param {!Element} adElement
 * @param {?Element} head
 * @return {?ValidatedHeadDef}
 */
export function processHead(win, adElement, head) {
  if (!head || !head.firstChild) {
    return null;
  }

  const extensionService = Services.extensionsFor(win);
  const urlService = Services.urlForDoc(adElement);
  const extensions = [];
  const fonts = [];
  const images = [];

  let element = head.firstElementChild;
  while (element) {
    // Store next element here as the following code will remove
    // certain elements from the detached DOM.
    const nextElement = element.nextElementSibling;
    switch (element.tagName.toUpperCase()) {
      case 'SCRIPT':
        handleScript(extensions, element);
        break;
      case 'STYLE':
        handleStyle(element);
        break;
      case 'LINK':
        handleLink(fonts, images, element);
        break;
      // Allow these without validation.
      case 'META':
      case 'TITLE':
        break;
      default:
        removeElement(element);
        break;
    }

    element = nextElement;
  }

  // Load any extensions; do not wait on their promises as this
  // is just to prefetch.
  extensions.forEach((extension) =>
    extensionService.preloadExtension(extension.extensionId)
  );
  // Preload any fonts.
  fonts.forEach((fontUrl) =>
    Services.preconnectFor(win).preload(adElement.getAmpDoc(), fontUrl)
  );
  // Preload any AMP images.
  images.forEach(
    (imageUrl) =>
      urlService.isSecure(imageUrl) &&
      Services.preconnectFor(win).preload(adElement.getAmpDoc(), imageUrl)
  );

  return {
    extensions,
    head,
  };
}

/**
 * Allows json scripts and allow listed amp elements while removing others.
 * @param {!Array} extensions
 * @param {!Element} script
 */
function handleScript(extensions, script) {
  if (script.type === 'application/json') {
    return;
  }

  const {src} = script;
  if (EXTENSION_URL_PREFIX.test(src)) {
    const extensionInfo = parseExtensionUrl(src);
    if (EXTENSION_ALLOWLIST[extensionInfo.extensionId]) {
      extensions.push(extensionInfo);
    }
  }

  removeElement(script);
}

/**
 * Collect links that are from allowed font providers or used for image
 * preloading. Remove other <link> elements.
 * @param {!Array<string>} fonts
 * @param {!Array<string>} images
 * @param {!Element} link
 */
function handleLink(fonts, images, link) {
  const {href, as, rel} = link;
  if (rel === 'preload' && as === 'image') {
    images.push(href);
    return;
  }

  if (rel === 'stylesheet' && ALLOWED_FONT_REGEX.test(href)) {
    fonts.push(href);
    return;
  }

  removeElement(link);
}

/**
 * Remove any non `amp-custom` or `amp-keyframe` styles.
 * @param {!Element} style
 */
function handleStyle(style) {
  if (style.hasAttribute('amp-custom') || style.hasAttribute('amp-keyframes')) {
    return;
  }
  removeElement(style);
}
