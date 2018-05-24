/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import { Layout } from '../../../src/layout';
import $ from './jquery-1.11.2.min';
import { CSS } from '../../../build/amp-linkeddb-lightbox-0.1.css';

export class AmpLinkeddbLightbox extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  
  /** @private {string} */
  this.myText_ = 'hello world';

  /** @private {!Element} */
  this.container_ = this.win.document.createElement('div');
  }

  /** @override */
  buildCallback() {
    $(this.element).parent().find('.amp-eject').on('click', ()=> {
      $(this.element).parent().find('.amp-opacity').toggleClass('amp-opacity-visible');
      $(this.element).find('.amp-lightbox').toggleClass('amp-lightbox-show');
    });
    $(this.element).parent().find('.amp-opacity').on('click', ()=>{
      $(this.element).parent().find('.amp-opacity').removeClass('amp-opacity-visible');
      $(this.element).find('.amp-lightbox').removeClass('amp-lightbox-show');
    });
    $(this.element).find('.amp-lightbox').on('click',()=>{
      $(this.element).parent().find('.amp-opacity').removeClass('amp-opacity-visible');
      $(this.element).find('.amp-lightbox').removeClass('amp-lightbox-show');
    });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}

AMP.extension('amp-linkeddb-lightbox', '0.1', AMP => {
  AMP.registerElement('amp-linkeddb-lightbox', AmpLinkeddbLightbox, CSS);
});