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

import {Layout} from '../../../src/layout';
import $ from './jquery-1.11.2.min';
import {CSS} from '../../../build/amp-linkeddb-showmore-0.1.css';


export class AmpLinkeddbShowmore extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    if($(this.element).find('.msg-text').height() <= 95){
      $(this.element).find('.view-more').addClass('hide');
    }else{
      $(this.element).find('.view-more-text').addClass('limit-height');
    }
    $(this.element).on('click', '.view-more', ()=> {
        if ($(this.element).find('.icon').hasClass('icon-down') || $(this.element).find('.view-more').hasClass('down')) {
            $(this.element).find('.icon').removeClass('icon-down').addClass('icon-up');
            $(this.element).find('.view-more').removeClass('down').html($(this.element).find('.view-more').attr('data-up'));
            $(this.element).find('.view-more-text').addClass('show');
        } else {
            $(this.element).find('.icon').removeClass('icon-up').addClass('icon-down');
            $(this.element).find('.view-more').addClass('down').html($(this.element).find('.view-more').attr('data-down'));
            $(this.element).find('.view-more-text').removeClass('show');

        }
    });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
  
}
AMP.extension('amp-linkeddb-showmore', '0.1', AMP => {
  AMP.registerElement('amp-linkeddb-showmore', AmpLinkeddbShowmore, CSS);
});
