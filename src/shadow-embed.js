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

import {ShadowCSS} from '../third_party/webcomponentsjs/ShadowCSS';
import {ampdocFor} from './ampdoc';
import {dev} from './log';
import {extensionsFor} from './extensions';
import {copyRuntimeStylesToShadowRoot} from './style-installer';


/** @const {!RegExp} */
const CSS_SELECTOR_BEG_REGEX = /[^\.\-\_0-9a-zA-Z]/;

/** @const {!RegExp} */
const CSS_SELECTOR_END_REGEX = /[^\-\_0-9a-zA-Z]/;


/**
 * @param {!Element} hostElement
 * @param {!Array<string>} extensionIds
 * @return {!ShadowRoot}
 */
export function createShadowEmbedRoot(hostElement, extensionIds) {
  if (hostElement.shadowRoot) {
    hostElement.shadowRoot./*OK*/innerHTML = '';
  }
  const shadowRoot = hostElement.shadowRoot || hostElement.createShadowRoot();
  shadowRoot.AMP = {};

  const win = hostElement.ownerDocument.defaultView;
  const extensions = extensionsFor(win);
  const ampdocService = ampdocFor(win);
  const ampdoc = ampdocService.getAmpDoc(hostElement);

  // Instal runtime CSS.
  copyRuntimeStylesToShadowRoot(ampdoc, shadowRoot);

  // Install extensions.
  extensionIds.forEach(extensionId => extensions.loadExtension(extensionId));

  // Apply extensions factories, such as CSS.
  extensions.installFactoriesInShadowRoot(shadowRoot, extensionIds);

  return shadowRoot;
}


/**
 * Transforms CSS to isolate AMP CSS within the shadow root and reduce the
 * possibility of high-level conflicts. There are two types of transformations:
 * 1. Root transformation: `body` -> `amp-body`, etc.
 * 2. Scoping: `a {}` -> `#i-amp-sd-123 a {}`.
 *
 * @param {!ShadowRoot} shadowRoot
 * @param {string} css
 * @return {string}
 * @visibleForTesting
 */
export function scopeShadowCss(shadowRoot, css) {
  const id = dev().assert(shadowRoot.id);
  const doc = shadowRoot.ownerDocument;
  let rules = null;
  // Try to use a separate document.
  try {
    rules = getStylesheetRules(doc.implementation.createHTMLDocument(''), css);
  } catch (e) {
    // Ignore.
  }
  // Try to use the current document.
  if (!rules) {
    try {
      rules = getStylesheetRules(doc, css);
    } catch (e) {
      // Ignore.
    }
  }

  // No rules could be parsed - return css as is.
  if (!rules) {
    return css;
  }

  // Patch selectors.
  return ShadowCSS.scopeRules(rules, `#${id}`, transformRootSelectors);
}


/**
 * Replaces top-level selectors such as `html` and `body` with their polyfill
 * counterparts: `amp-html` and `amp-body`.
 * @param {string} selector
 * @return {string}
 */
function transformRootSelectors(selector) {
  return selector.replace(/(html|body)/g, function(match, name, pos) {
    const prev = pos > 0 ? selector.charAt(pos - 1) : '';
    const next = pos + match.length < selector.length ?
        selector.charAt(pos + match.length) : '';
    if ((!prev || CSS_SELECTOR_BEG_REGEX.test(prev)) &&
        (!next || CSS_SELECTOR_END_REGEX.test(next))) {
      return 'amp-' + match;
    }
    return match;
  });
}


/**
 * @param {!Document} doc
 * @param {string} css
 * @return {?CSSRuleList}
 */
function getStylesheetRules(doc, css) {
  const style = doc.createElement('style');
  style.textContent = css;
  try {
    (doc.head || doc.documentElement).appendChild(style);
    if (style.sheet) {
      return style.sheet.cssRules;
    }
    return null;
  } finally {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }
}
