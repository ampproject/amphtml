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

import {toggle} from '../../../src/style';
import {user} from '../../../src/log';

export class Toolbar {
  /**
  * @param {!Element} element
  * @param {!../../../src/service/vsync-impl.Vsync} vsync
  * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
  */
  constructor(element, vsync, ampdoc) {
    /** @private {!Element} */
    this.toolbarDomElement_ = element;

    /** @private {number|undefined} */
    this.height_ = undefined;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {string} */
    this.toolbarMedia_ = this.toolbarDomElement_.getAttribute('toolbar');

    /** @private {?Element} */
    this.toolbarClone_ = null;

    /** @private {Element|undefined} */
    this.toolbarTarget_ = undefined;

    /** @private {boolean} **/
    this.toolbarShown_ = false;

    // Default to toolbar target being hidden
    this.toolbarDomElement_.classList
        .add('amp-sidebar-toolbar-target-hidden');

    this.buildCallback_();
  }

  /**
   * Function called to check if we should show or hide the toolbar
   * @param {!Function} onShowCallback - function called if toolbar is shown on check
   */
  onLayoutChange(onShowCallback) {
    // Get if we match the current toolbar media
    const matchesMedia = this.ampdoc_.win
        .matchMedia(this.toolbarMedia_).matches;

    // Remove and add the toolbar dynamically
    if (matchesMedia) {
      const showResponse = this.attemptShow_();
      if (showResponse) {
        showResponse.then(onShowCallback);
      }
    } else {
      this.hideToolbar_();
    }
  }

  /**
   * Private function to build the DOM element for the toolbar
   * @private
   */
  buildCallback_() {
    this.toolbarClone_ = this.toolbarDomElement_.cloneNode(true);
    const targetId = user().assert(this.toolbarDomElement_
        .getAttribute('toolbar-target'), '"toolbar-target" is required',
    this.toolbarDomElement_);
    // Set the target element to the toolbar clone if it exists.
    this.ampdoc_.whenReady().then(() => {
      const targetElement = this.ampdoc_.getElementById(targetId);
      if (targetElement) {
        this.toolbarTarget_ = targetElement;
        this.toolbarClone_.classList.add('i-amphtml-toolbar');
        toggle(this.toolbarTarget_, false);
      } else {
        // This error will be later rethrown as a user error and
        // the side bar will continue to function w/o toolbar feature
        throw new Error('Could not find the ' +
        `toolbar-target element with an id: ${targetId}`);
      }
    });
  }

  /**
   * Returns if the sidebar is currently in toolbar media query
   * @returns {boolean}
   * @private
   */
  isToolbarShown_() {
    return this.toolbarShown_;
  }

  /**
   * Function to attempt to show the toolbar,
   * and hide toolbar-only element in the sidebar.
   * @returns {Promise|undefined}
   * @private
   */
  attemptShow_() {
    if (this.isToolbarShown_()) {
      return;
    }

    // Display the elements
    return this.vsync_.mutatePromise(() => {
      if (this.toolbarTarget_) {
        toggle(this.toolbarTarget_, true);
        if (!this.toolbarTarget_.contains(this.toolbarClone_)) {
          this.toolbarTarget_.appendChild(this.toolbarClone_);
        }
        this.toolbarDomElement_.classList
            .add('amp-sidebar-toolbar-target-shown');
        this.toolbarDomElement_.classList
            .remove('amp-sidebar-toolbar-target-hidden');
        this.toolbarShown_ = true;
      }
    });
  }

  /**
  * Function to hide the toolbar,
  * and show toolbar-only element in the sidebar.
  * @private
   */
  hideToolbar_() {
    if (!this.isToolbarShown_()) {
      return;
    }

    this.vsync_.mutate(() => {
      // Hide the elements
      if (this.toolbarTarget_) {
        toggle(this.toolbarTarget_, false);
        this.toolbarDomElement_.classList
            .add('amp-sidebar-toolbar-target-hidden');
        this.toolbarDomElement_.classList
            .remove('amp-sidebar-toolbar-target-shown');
        this.toolbarShown_ = false;
      }
    });
  }
}
