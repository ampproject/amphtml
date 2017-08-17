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
    
    /** @private {?Element} */
    this.draggable_ = null;
    
    
  }

  /** @override */
  buildCallback() {
    this.buildCompareSliderElements();
    this.createListeners();
  }
  
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
  
  
  buildCompareSliderElements() {
    this.element.style.height = this.element.getAttribute('height') + 'px';
    this.element.style.width = this.element.getAttribute('width') + 'px';
    
    const originalChildren = this.element.children;
    
    this.topElementContainer_ = document.createElement('div');
    this.bottomElementContainer_ = document.createElement('div');
    this.draggable_ = document.createElement('div');
    
    //Make Elements children of newly created divs
    // the first child is i-amphtml-sizer
    this.topElementContainer_.appendChild(originalChildren[1]);
    this.bottomElementContainer_.appendChild(originalChildren[1]);
    this.topElementContainer_.appendChild(this.draggable_);
    this.draggable_.className = 'draggable';
    this.topElementContainer_.className = 'topElementContainer';
    this.bottomElementContainer_.className = 'bottomElementContainer';
    
    // Add newly created elements to the view
    this.element.appendChild(this.topElementContainer_);
    this.element.appendChild(this.bottomElementContainer_);
    this.topElementContainer_.style.maxWidth = this.element.getAttribute('width') + 'px';
    this.bottomElementContainer_.style.width = this.element.getAttribute('width') + 'px';
  }
  
  createListeners() {
    this.draggable_.addEventListener('mousedown', 
                                  this.sliderBeginsMoving.bind(this));
    this.draggable_.addEventListener('touchstart',
                                  this.sliderBeginsMoving.bind(this));
    this.draggable_.addEventListener('touchmove',
                                  this.whileSliderMoving.bind(this));
    this.draggable_.addEventListener('touchend',
                                  this.whenSliderStops.bind(this));
  }
  
  sliderBeginsMoving(e) {
    this.startX = e.touches[0].pageX;
    this.startWidth = parseInt(window.getComputedStyle(this.element).width, 10);
  }
  
  whileSliderMoving(e) {
    this.topElementContainer_.style.width = 
      e.touches[0].pageX - this.topElementContainer_.offsetLeft < this.element.getAttribute('width') ? (e.touches[0].pageX - this.topElementContainer_.offsetLeft) + 'px' : this.element.getAttribute('width') + 'px';
  }
  
  whenSliderStops(e){
  }
  
  
}

AMP.registerElement('amp-compare-slider', AmpCompareSlider, CSS);
