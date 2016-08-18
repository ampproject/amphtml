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

import {ScrollSyncEffect} from './scroll-sync-effect';
import {setStyle} from '../../../src/style';
import {getLengthNumeral} from '../../../src/layout';
import {user} from '../../../src/log';

export class ScrollSyncScaleEffect extends ScrollSyncEffect {
  constructor(element) {
    super(element);
    // TODO: only one effect of the same type is allowed now,
    // figure out how to have multiple of the same effect without conflict
    const scaleEffectElements = element.querySelectorAll('[type="scale"]');
    user().assert(scaleEffectElements.length == 1,
        'Only one <amp-fx-scroll-sync> with type="scale" is allowed ' +
        'for element: %s', element);
    const scaleEffectElement = scaleEffectElements[0];
    const startingPosition = user().assert(
        scaleEffectElement.getAttribute('starting-position'),
        'The starting-position attribute is required for element ' +
        '<amp-fx-scroll-sync> with type="scale": %s', scaleEffectElement);
    const endingPosition = user().assert(
        scaleEffectElement.getAttribute('ending-position'),
        'The ending-position attribute is required for element ' +
        '<amp-fx-scroll-sync> with type="scale": %s', scaleEffectElement);
    const endScale = user().assert(
        scaleEffectElement.getAttribute('end-scale'),
        'The end-scale attribute is required for element ' +
        '<amp-fx-scroll-sync> with type="scale": %s', scaleEffectElement);
    const scaleOrigin = scaleEffectElement.getAttribute('scale-origin');
    this.scrollMin_ = getLengthNumeral(startingPosition);
    this.scrollMax_ = getLengthNumeral(endingPosition);
    this.endScale_ = getLengthNumeral(endScale);
    if (scaleOrigin) {
      setStyle(this.element_, 'transform-origin', scaleOrigin);
    }
  }

  /** @override */
  transition(position) {
    const scale = 1 - this.endScale_ * position;
    setStyle(this.element_, 'transform', `scale(${scale})`);
  }
}
