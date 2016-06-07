/* Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {AmpAd3PImpl, TAG_3P_IMPL} from './amp-ad-3p-impl';
import {a4aRegistry} from '../../../ads/_config';
import {insertAmpExtensionScript} from '../../../src/insert-extension';


/**
 * Template to construct ad network type-specific tag and script name.  Note
 * that this omits the version number and '.js' suffix for the extension script,
 * which will be handled by the extension loader.
 *
 * @private @const {!string}
 */
const TAG_NETWORK_CUSTOM_IMPL_ = 'amp-ad-network-${TYPE}-impl';

/** @private @enum {!number} */
const BOOKKEEPING_ATTRIBUTES_ = {'class': 1, 'style': 2, 'id': 3};

/**
 * Copies (almost) all attributes from one Element to another.  Skips AMP
 * and other bookkeeping attributes.  Doesn't check for existence of any
 * attribute on the target Element, so may overwrite existing attributes.
 *
 * @param {!Element} sourceElement  Element to copy attributes from.
 * @param {!Element} targetElement  Element to copy attributes to.
 * @private
 */
function CopyAttributes_(sourceElement, targetElement) {
  for (let i = sourceElement.attributes.length - 1; i >= 0; --i) {
    const attr = sourceElement.attributes[i];
    if (!BOOKKEEPING_ATTRIBUTES_.hasOwnProperty(attr.name)) {
      targetElement.setAttribute(attr.name, attr.value);
    }
  }
}

export class AmpAd extends AMP.BaseElement {
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const type = this.element.getAttribute('type');
    if (!type) {
      // Unspecified or empty type.  Nothing to do here except bail out.
      return;
    }
    // TODO(tdrl): Check amp-ad registry to see if they have this already.
    if (!a4aRegistry[type] ||
        !a4aRegistry[type](this.getWin(), this.element)) {
      // Network either has not provided any A4A implementation or the
      // implementation exists, but has explicitly chosen not to handle this
      // tag as A4A.  Fall back to the 3p implementation.
      const newChild = this.element.ownerDocument.createElement(TAG_3P_IMPL);
      CopyAttributes_(this.element, newChild);
      this.element.appendChild(newChild);
      return;
    }
    // Note: The insertAmpExtensionScript method will pick the version number.
    // If we ever reach a point at which there are different extensions with
    // different version numbers at play simultaneously, we'll have to make sure
    // that the loader can handle the case.
    const extensionTag = TAG_NETWORK_CUSTOM_IMPL_.replace('${TYPE}', type);
    const newChild = this.element.ownerDocument.createElement(extensionTag);
    CopyAttributes_(this.element, newChild);
    /*REVIEW*/insertAmpExtensionScript(this.getWin(), extensionTag, true);
    this.element.appendChild(newChild);
  }
}

AMP.registerElement('amp-ad', AmpAd);
AMP.registerElement('amp-embed', AmpAd);
AMP.registerElement(TAG_3P_IMPL, AmpAd3PImpl);
