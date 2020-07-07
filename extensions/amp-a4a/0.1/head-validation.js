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

/** @typedef {{
 *    extensions: !Array<?../../../src/service/extension-location.ExtensionInfoDef>
 *    head: !Element
 *  }} */
export let ValidatedHeadDef;

const FONT_ALLOWLIST = map({
  'https://cdn.materialdesignicons.com': true,
  'https://cloud.typography.com': true,
  'https://fast.fonts.net': true,
  'https://fonts.googleapis.com': true,
  'https://maxcdn.bootstrapcdn.com': true,
  'https://p.typekit.net': true,
  'https://pro.fontawesome.com': true,
  'https://use.fontawesome.com': true,
  'https://use.typekit.net': true,
});

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

const EXTENSION_URL_PREFIX = /^https:\/\/cdn\.ampproject.org\/v0\//;

/**
 * @param {!Window} win
 * @param {!Element} adElement
 * @param {?Element} head
 * @return {?ValidatedHeadDef}
 */
export function validateHead(win, adElement, head) {
  if (!head || !head.firstChild) {
    return null;
  }

  const extensionService = Services.extensionsFor(win);
  const urlService = Services.urlForDoc(adElement);
  const extensions = [];
  const fonts = [];
  const images = [];

  let element = head.firstChild;
  while (element) {
    // Store next element here as the following code will remove
    // certain elements from the detached DOM.
    const nextElement = element.nextElementSibling;

    switch (element.tagName) {
      case 'SCRIPT':
        handleScript(extensions, element);
        break;
      case 'STYLE':
        handleStyle(element);
        break;
      case 'LINK':
        handleLink(urlService, fonts, images, element);
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
 * Removes the element from the head.
 * @param {!Array<?../../../src/service/extension-location.ExtensionInfoDef>} extensions
 * @param {!Element} script
 */
function handleScript(extensions, script) {
  if (script.type === 'application/json') {
    return;
  }

  const {src} = script;
  if (src && EXTENSION_URL_PREFIX.test(src)) {
    const extensionInfo = parseExtensionUrl(src);
    if (EXTENSION_ALLOWLIST[extensionInfo.extensionId]) {
      extensions.push(extensionInfo);
    }
  }

  script.parentElement.removeChild(script);
}

/**
 * Collect links that are from allowed font providers or used for image
 * preloading. Remove other <link> elements.
 * @param {!../../../src/service/url-impl.Url} urlService
 * @param {!Array<string>} fonts
 * @param {!Array<string>} images
 * @param {!Element} link
 */
function handleLink(urlService, fonts, images, link) {
  const {href, as, rel} = link;
  // write a test for this!
  if (rel === 'preload' && as === 'image') {
    images.push(href);
    return;
  }

  if (rel === 'stylesheet' && FONT_ALLOWLIST[urlService.parse(href).origin]) {
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
