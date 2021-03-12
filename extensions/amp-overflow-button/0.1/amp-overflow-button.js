/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-overflow-button-0.1.css';

export class AmpOverflowButton extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.seeMore_ = 'See more';

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    const color = this.element.getAttribute('color');
    const cta = this.element.getAttribute('cta') || this.seeMore_;

    this.container_ = this.element.ownerDocument.createElement('div');
    // this.container_.setAttribute('overflow', '');
    this.container_.setAttribute('tabindex', '0');
    this.container_.setAttribute('role', 'button');
    this.container_.setAttribute('aria-label', cta);
    this.container_.classList.add('i-amphtml-overflow-button-wrapper');

    const wrapper = this.element.ownerDocument.createElement('div');
    wrapper.classList.add('i-amphtml-overflow-button-container');

    // Preview Div that allows preview content under the overflow button
    const preview = this.element.ownerDocument.createElement('div');
    preview.classList.add('i-amphtml-overflow-button-preview');
    wrapper.appendChild(preview);

    // Container holding the actual button
    const buttonWrapper = this.element.ownerDocument.createElement('div');
    buttonWrapper.classList.add('i-amphtml-overflow-button-cta-container');

    // CTA button
    const ctaButton = this.element.ownerDocument.createElement('button');
    ctaButton.classList.add('amp-overflow-button-cta-button');
    ctaButton.textContent = cta;
    if (color) {
      ctaButton.setAttribute(
        'style',
        `color: ${color}; border-color: ${color};`
      );
    }
    buttonWrapper.appendChild(ctaButton);
    wrapper.appendChild(buttonWrapper);

    this.container_.appendChild(wrapper);
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}

AMP.extension('amp-overflow-button', '0.1', (AMP) => {
  AMP.registerElement('amp-overflow-button', AmpOverflowButton, CSS);
});
