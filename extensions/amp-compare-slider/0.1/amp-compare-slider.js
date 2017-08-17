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

import {Layout} from '../../../src/layout';
import {CSS} from '../../../build/amp-compare-slider-0.1.css';

export class AmpCompareSlider extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    
    /** @private {?Element} */
    this.topElementContainer_ = null;
    
    /** @private {?Element} */
    this.bottomElementContainer_ = null;
    
  }

  /** @override */
  buildCallback() {
    this.buildCompareSliderElements();
  }
  
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
  
  buildCompareSliderElements {
    const originalChildren = this.element.children;
    
    this.topElementContainer_ = document.createElement('div');
    this.bottomElementContainer_ = document.createElement('div');
    
    //Make Elements children of newly created divs
    this.topElementContainer_.appendChild(originalChildren[0]);
    this.bottomElementContainer_.appendChild(originalChildren[0]);
    this.topElementContainer_.className = 'topElementContainer';
    this.bottomElementContainer_.className = 'bottomElementContainer';
    
    // Add newly created elements to the view
    this.element.appendChild(this.topElementContainer_);
    this.element.appendChild(this.bottomElementContainer_);
  }
  
}

AMP.registerElement('amp-compare-slider', AmpCompareSlider, CSS);
