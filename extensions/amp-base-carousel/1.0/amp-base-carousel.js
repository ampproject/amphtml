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

import {ActionTrust} from '../../../src/action-constants';
import {BaseCarousel} from './base-carousel';
import {CSS} from './base-carousel.jss';
import {CarouselContextProp} from './carousel-props';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';
import {
  init as initFn, 
  isLayoutSupported as isLayoutSupportedFn, 
  children,
  Component, 
  layoutSizeDefined,
  props,
  shadowCss,
  TAG
} from './amp-base-carousel-config';


/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
class AmpBaseCarousel extends PreactBaseElement {
  /** @override */
  init() {
    return  initFn(this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSupportedFn(this, layout)
  }
}

/** @override */
AmpBaseCarousel['Component'] = Component;

/** @override */
AmpBaseCarousel['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpBaseCarousel['children'] =  children;

/** @override */
AmpBaseCarousel['props'] = props;

/** @override */
AmpBaseCarousel['shadowCss'] = shadowCss;

/** @override */
AmpBaseCarousel['useContexts'] = [CarouselContextProp];

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel);
});
