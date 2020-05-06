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

import * as Preact from '../../../src/preact';
import {FitText} from './fit-text';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';

import {dict} from '../../../src/utils/object';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-fit-text';

class AmpFitText extends PreactBaseElement {
  /** @override */
  init() {
    const {innerHTML} = this.element;

    const attributeOb = new MutationObserver(() => {
      this.mutateProps(
        dict({
          'maxFontSize': this.element.getAttribute('max-font-size'),
          'minFontSize': this.element.getAttribute('min-font-size'),
        })
      );
    });
    attributeOb.observe(this.element, {
      attributeFilter: ['min-font-size', 'max-font-size'],
    });

    const childOb = new MutationObserver(() => {
      const {innerHTML} = this.element;
      this.mutateProps(
        dict({
          'measurerChildren': (
            <div dangerouslySetInnerHTML={{__html: `${innerHTML}`}}></div>
          ),
        })
      );
    });
    childOb.observe(this.element, {childList: true});

    return dict({
      'minFontSize': getLengthNumeral(
        this.element.getAttribute('min-font-size')
      ),
      'maxFontSize': getLengthNumeral(
        this.element.getAttribute('max-font-size')
      ),
      'measurerChildren': (
        <div dangerouslySetInnerHTML={{__html: `${innerHTML}`}}></div>
      ),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-fit-text-v2'),
      'expected amp-fit-text-v2 experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpFitText['Component'] = FitText;

/** @override */
AmpFitText['passthrough'] = true;

/** @override */
AmpFitText['props'] = {
  'width': {attr: 'width'},
  'height': {attr: 'height'},
};

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
