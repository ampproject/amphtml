/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AmpSlides} from './slides';
import {AmpCarousel} from './carousel';
import {CSS} from '../../../build/amp-carousel-0.1.css';
import {isExperimentOn} from '../../../src/experiments';

class CarouselSelector {

  constructor(element) {
    if (element.hasAttribute('type') &&
        element.getAttribute('type') == 'slides') {
      return new AmpSlides(element);
    }
    if (isExperimentOn(element.ownerDocument.defaultView, 'amp-carouscroll')) {
      return new AmpCarouscroll(element);
    }
    return new AmpCarousel(element);
  }
}

AMP.registerElement('amp-carousel', CarouselSelector, CSS);
