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

import {AmpScrollableCarousel} from './scrollable-carousel';
import {AmpSlideScroll} from './slidescroll';
import {CSS} from '../../../build/amp-carousel-0.1.css';

class CarouselSelector extends AMP.BaseElement {
  /** @override */
  upgradeCallback() {
    if (this.element.getAttribute('type') == 'slides') {
      return new AmpSlideScroll(this.element);
    }
    return new AmpScrollableCarousel(this.element);
  }
}

AMP.extension('amp-carousel', '0.1', AMP => {
  AMP.registerElement('amp-carousel', CarouselSelector, CSS);
});
