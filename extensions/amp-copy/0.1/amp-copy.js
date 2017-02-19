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
const IOS_USER_AGENT = /ipad|ipod|iphone/i;

/** @const */
const COPY_SUCCESS = 'Copied!';

/** @const */
const IOS_SELECT = 'Tap the selected text to copy.';

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
    this.childContainer_ = null;

    /**
     * @private {?Element}
     */
    this.copyBtn_ = null;

    /**
     * @private {?Element}
     */
    this.copyNotification_ = null;

    /**
     * @private {?Boolean}
     */
    this.isIos_ = null;

    /**
     * @private {?Timeout}
     */
    this.currentNotificationTimeout_ = null;
  }

  /** @override */
  buildCallback() {
    //Get our copy text attribute, and assert its existance
    const copyTextAttr = user().assert(this.element.getAttribute('copy-text'),
        'The copy-text attribute is required. %s', this.element);
    this.copyText_ = copyTextAttr;

    //Create the displayed text element, and assert its existance
    const textElementAttr = user().assert(this.element.getAttribute('text-element'),
        'The text-element attribute is required. %s', this.element);
    //Ensure the text element is supported by the copy
    user().assert(textElementAttr === 'textarea' || textElementAttr === 'input',
        'The text-element attribute must be, "input" or a "textarea". %s', this.element);
    this.displayedText_ = this.element.ownerDocument.createElement(textElementAttr);
    this.displayedText_.className = "amp-copy-" + textElementAttr;
    //Setting read-only, to make the text only selectable
    this.displayedText_.setAttribute('readonly', '');
    this.displayedText_.value = this.copyText_;

    //Create a container for our copy-button and notification
    this.childContainer_ = this.element.ownerDocument.createElement('div');
    this.childContainer_.className = "amp-copy-child-container";

    //Get if we are currently on ios
    this.isIos_ = navigator.userAgent.match(IOS_USER_AGENT);

    //Create the Copy Button element
    this.copyBtn_ = this.element.ownerDocument.createElement('button');
    this.copyBtn_.className = "amp-copy-button";
    this.copyBtn_.addEventListener('click', () => this.copyBtnClick_());
    //Set the text dynamically based if it is mobile safari or not.
    //Mobile Safari can only select the text,
    //and not copy it like all other browsers
    if(this.isIos_) {
      this.copyBtn_.textContent = 'Select';
    } else {
      this.copyBtn_.textContent = 'Copy';
    }

    //Add the created the elements
    this.element.appendChild(this.displayedText_);
    this.element.appendChild(this.childContainer_);
    this.childContainer_.appendChild(this.copyBtn_)
  }

  /** @override */
  layoutCallback() {
    //Create the copy notification element, this is done here, as it is not
    //immediately required.
    return new Promise((resolve) => {
      try {
        this.copyNotification_ = this.element.ownerDocument.createElement('span');
        this.copyNotification_.className = "amp-copy-notification"
        resolve();
      } catch {
        reject();
      }
    });
  }

  /** Function attatched to copy button to copy text */
  /**
   * @private {?Function}
   */
  copyBtnClick_() {
    //Select the text in the displayed text input to be copied
    this.displayedText_.focus();
    this.displayedText_.select();
    this.displayedText_.setSelectionRange(0, this.displayedText_.value.length);

    try {
      // Copy the text
      document.execCommand('copy');
      if(this.isIos_) {
        this.copyNotification_.textContent = IOS_SELECT;
      } else {
        this.copyNotification_.textContent = COPY_SUCCESS;
      }
    }
    catch (err) {
      // If the browser does not support document.execCommand('copy')
      // Show a temporary prompt saying, copy not supported on this browser
      this.copyNotification_.textContent = COPY_ERROR;
    } finally {
      //Remove the copy button,
      //Add our notification,
      //and cancel the timeout if exists
      this.copyBtn_.remove()
      this.childContainer_.appendChild(this.copyNotification_);
      if(this.currentNotificationTimeout_) {
        clearTimeout(this.currentNotificationTimeout_);
      }
      this.currentNotificationTimeout_ = setTimeout(() => {
        this.copyNotification_.remove();
        this.childContainer_.appendChild(this.copyBtn_);
      }, 4000);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.registerElement('amp-copy', AmpCopy, CSS);
