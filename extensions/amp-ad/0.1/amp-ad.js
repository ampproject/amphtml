/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {AmpAd3PImpl} from './amp-ad-3p-impl';
import {a4aRegistry} from '../../../ads/_a4a-config';
import {dev} from '../../../src/log';
import {insertAmpExtensionScript} from '../../../src/insert-extension';


/**
 * Construct ad network type-specific tag and script name.  Note that this
 * omits the version number and '.js' suffix for the extension script, which
 * will be handled by the extension loader.
 *
 * @param {!string} type
 * @return !string
 * @private
 */
function networkImplementationTag(type) {
  return `amp-ad-network-${type}-impl`;
}

/** @private @enum {!number} */
const BOOKKEEPING_ATTRIBUTES_ = {'class': 1, 'style': 2, 'id': 3};

/**
 * Copies (almost) all attributes from one Element to another.  Skips AMP
 * and other bookkeeping attributes.  Doesn't check for existence of any
 * attribute on the target Element, so may overwrite existing attributes.
 *
 * @param {!Element} sourceElement  Element to copy attributes from.
 * @param {!Element} targetElement  Element to copy attributes to.
 */
function copyAttributes(sourceElement, targetElement) {
  const attrs = sourceElement.attributes;
  for (let i = attrs.length - 1; i >= 0; --i) {
    const attr = attrs[i];
    if (!BOOKKEEPING_ATTRIBUTES_.hasOwnProperty(attr.name)) {
      targetElement.setAttribute(attr.name, attr.value);
    }
  }
}

export class AmpAd extends AMP.BaseElement {

  /** @override */
  upgradeCallback() {
    const type = this.element.getAttribute('type');
    if (!type) {
      // Unspecified or empty type.  Nothing to do here except bail out.
      return null;
    }
    // TODO(tdrl): Check amp-ad registry to see if they have this already.
    if (!a4aRegistry[type] ||
        !a4aRegistry[type](this.getWin(), this.element)) {
      // Network either has not provided any A4A implementation or the
      // implementation exists, but has explicitly chosen not to handle this
      // tag as A4A.  Fall back to the 3p implementation.
      return new AmpAd3PImpl(this.element);
    }
    // TODO(dvoytenko): Reimplement a4a via `upgradeCallback`.
    return null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    // This is only called for a4a. All other cases are redirected to
    // `AmpAd3PImpl` in `upgradeCallback`.
    // TODO(dvoytenko): Reimplement a4a via `upgradeCallback`.
    const type = dev.assert(this.element.getAttribute('type'),
        'Required attribute type');
    // Note: The insertAmpExtensionScript method will pick the version number.
    // If we ever reach a point at which there are different extensions with
    // different version numbers at play simultaneously, we'll have to make sure
    // that the loader can handle the case.
    const extensionTag = networkImplementationTag(type);
    const newChild = this.element.ownerDocument.createElement(extensionTag);
    /*OK*/insertAmpExtensionScript(this.getWin(), extensionTag, true);
    copyAttributes(this.element, newChild);
    this.element.appendChild(newChild);
  }
}

AMP.registerElement('amp-ad', AmpAd);
AMP.registerElement('amp-embed', AmpAd);
