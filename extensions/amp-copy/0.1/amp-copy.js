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

import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';
import {CSS} from '../../../build/amp-copy-0.1.css';

/** @const */
const COPY_SUCCESS = 'Copied!';

/** @const */
const COPY_ERROR = 'This browser does not support copying. Please select the text manually, and copy';

class AmpCopy extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private {?Attribute}
     */
    this.copyText_ = null;

    /**
     * @private {?Element}
     */
    this.displayedText_ = null;

    /**
     * @private {?Element}
     */
    this.copyBtn_ = null;

    /**
     * @private {?Element}
     */
    this.copyNotification_ = null;

    /**
     * @private {?Timeout}
     */
    this.currentNotificationTimeout_ = null;
  }

  /** @override */
  buildCallback() {
    //Get our copy text attribute
    this.copyText_ = this.element.getAttribute('copy-text');

    //Create the displayed text element
    this.displayedText_ = this.element.ownerDocument.createElement('span');
    this.displayedText_.textContent = this.copyText_;

    //Create the Copy Button element
    this.copyBtn_ = this.element.ownerDocument.createElement('button');
    this.copyBtn_.className = "amp-copy-button";
    this.copyBtn_.addEventListener('click', () => this.copyBtnClick_());
    this.copyBtn_.textContent = 'Copy';

    //Create the copy notification element
    this.copyNotification_ = this.element.ownerDocument.createElement('span');
    this.copyNotification_.className = "amp-copy-notification"

    //Add the created the elements
    this.element.appendChild(this.displayedText_);
    this.element.appendChild(this.copyBtn_);
  }

  /** Function attatched to copy button to copy text */
  /**
   * @private {?Function}
   */
  copyBtnClick_() {
    //Create a tempoaray input element that can be used to copy from
    let tempInput = this.element.ownerDocument.createElement('input');
    tempInput.value = this.copyText_;

    //Add the tempInput to the amp-copy element
    this.element.appendChild(tempInput);

    //Select the text in the temp input to be copied
    tempInput.select();

    try {
      // Copy the text
      document.execCommand('copy');
      this.copyNotification_.textContent = COPY_SUCCESS;
    }
    catch (err) {
      // If the browser does not support document.execCommand('copy')
      // Show a temporary prompt saying, copy not supported on this browser
      this.copyNotification_.textContent = COPY_ERROR;
    } finally {
      //Blur the temporary input, and remove it from the amp-copy element
      tempInput.blur();
      tempInput.remove();

      //Add our notification, and cancel the timeout if exists
      this.element.appendChild(this.copyNotification_);
      if(this.currentNotificationTimeout_) {
        clearTimeout(this.currentNotificationTimeout_);
      }
      this.currentNotificationTimeout_ = setTimeout(() => {
        this.copyNotification_.remove();
      }, 4000);
    }
  }

  /** @override */
  // isLayoutSupported(layout) {
  //   return isLayoutSizeDefined(layout);
  // }
}

AMP.registerElement('amp-copy', AmpCopy, CSS);
