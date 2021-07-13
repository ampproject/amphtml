/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Layout, applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {realChildNodes} from '#core/dom/query';

import {registerElement} from '#service/custom-element-registry';

import {BaseElement} from '../../base-element';
import {getEffectiveLayout} from '../../static-layout';

class AmpLayout extends BaseElement {
  /** @override @nocollapse */
  static prerenderAllowed() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER || isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    buildDom(this.win.document, this.element);
  }
}

/**
 *
 * @param {!Document} document
 * @param {!Element} element
 */
export function buildDom(document, element) {
  const layout = getEffectiveLayout(element);
  if (layout == Layout.CONTAINER) {
    return;
  }

  const container = document.createElement('div');
  applyFillContent(container);
  realChildNodes(element).forEach((child) => {
    container.appendChild(child);
  });
  element.appendChild(container);
}

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installLayout(win) {
  registerElement(win, 'amp-layout', AmpLayout);
}
