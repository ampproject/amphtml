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

import {FitText} from './fit-text';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';

import {dict} from '../../../src/utils/object';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-fit-text';

const getFontSizeAttrs = (element) =>
  dict({
    'maxFontSize': getLengthNumeral(element.getAttribute('max-font-size')),
    'minFontSize': getLengthNumeral(element.getAttribute('min-font-size')),
  });

class AmpFitText extends PreactBaseElement {
  /** @override */
  init() {
    const attributeOb = new MutationObserver(() => {
      this.mutateProps(getFontSizeAttrs(this.element));
    });
    attributeOb.observe(this.element, {
      attributeFilter: ['min-font-size', 'max-font-size'],
      attributes: true,
    });

    // Force render to resize to new contents.
    const childOb = new MutationObserver(() => {
      this.mutateProps(dict({}));
    });
    childOb.observe(this.element, {
      childList: true,
      subtree: true,
    });

    return getFontSizeAttrs(this.element);
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-fit-text-bento'),
      'expected amp-fit-text-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpFitText['Component'] = FitText;

/** @override */
AmpFitText['passthrough'] = true;

/** @override */
AmpFitText['layoutSizeDefined'] = true;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFitText);
});
