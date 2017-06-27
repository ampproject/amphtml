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

import {toggle, computedStyle, setStyles} from '../../../src/style';

/** @const */
const TOOLBAR_TARGET_CLASS = 'i-amphtml-toolbar-target';

/** @const */
const TOOLBAR_ELEMENT_CLASS = 'i-amphtml-toolbar';

export class Toolbar {
  /**
  * @param {!Element} element
  * @param {!Window} win
  * @param {!../../../src/service/vsync-impl.Vsync} vsync
  */
  constructor(element, win, vsync) {
    /** @private {!Element} */
    this.toolbarDOMElement_ = element;

    /** @private {!Window} **/
    this.win_ = win;

    /** @private {Element} */
    this.body_ = this.win_.document.body;

    /** @private {string|undefined} */
    this.initialBodyTop_ = undefined;

    /** @private {number|undefined} */
    this.height_ = undefined;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private {!string} */
    this.toolbarMedia_ = this.toolbarDOMElement_.getAttribute('toolbar');

    /** @private {?Element} */
    this.toolbarClone_ = null;

    /** @private {Element|undefined} */
    this.targetElement_ = undefined;

    /** @private {!boolean} **/
    this.toolbarShown_ = false;

    /** @private {Array} */
    this.toolbarOnlyElementsInSidebar_ = [];

    // Find our tool-bar only elements
    if (this.toolbarDOMElement_.hasAttribute('toolbar-only')) {
      this.toolbarOnlyElementsInSidebar_.push(this.toolbarDOMElement_);
    } else {
      // Get our toolbar only elements
      const toolbarOnlyQuery =
        this.toolbarDOMElement_.querySelectorAll('[toolbar-only]');
      if (toolbarOnlyQuery.length > 0) {
        // Check the nav's children for toolbar-only
        this.toolbarOnlyElementsInSidebar_ =
          Array.prototype.slice.call(toolbarOnlyQuery, 0);
      }
    }
    this.buildCallback_();
  }

  /**
   * Function called to check if we should show or hide the toolbar
   * @param {!Function} onShowCallback - function called if toolbar is shown on check
   */
  onLayoutChange(onShowCallback) {
    // Get if we match the current toolbar media
    const matchesMedia = this.win_
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
    this.toolbarClone_ = this.toolbarDOMElement_.cloneNode(true);
    const targetId = this.toolbarDOMElement_.getAttribute('target');
    const targetElement = this.win_.document.getElementById(targetId);
    this.targetElement_ = targetElement || this.createTargetElement_();
    this.targetElement_.appendChild(this.toolbarClone_);
    toggle(this.targetElement_, false);

    // Check if the target element was created by us, or already inserted by the user
    if (!this.targetElement_.parentElement) {
      this.toolbarClone_.classList.add(TOOLBAR_ELEMENT_CLASS);
      const fragment = this.win_
        .document.createDocumentFragment();
      fragment.appendChild(this.targetElement_);
      this.body_.appendChild(fragment);
    }
  }

  /**
   * Returns a created element that can be used as the target if one does not exist
   * @returns {Element}
   * @private
   */
  createTargetElement_() {
    const targetElement =
      this.win_.document.createElement('header');
    targetElement.classList.add(TOOLBAR_TARGET_CLASS);
    return targetElement;
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

    // Make room for the toolbar
    this.vsync_.run({
      measure: state => {
        if (this.body_ && !this.initialBodyTop_) {
          this.initialBodyTop_ = computedStyle(this.win_, this.body_)['top'];
        }
        state.toolbarHeight = this.toolbarClone_./*REVIEW*/offsetHeight;
      },
      mutate: state => {
        if (this.body_) {
          setStyles(this.body_, {
            'top': `calc(${state.toolbarHeight}px + ${this.initialBodyTop_})`,
          });
        }
      },
    }, {});

    if (this.isToolbarShown_()) {
      return;
    }

    // Display the elements
    return this.vsync_.mutatePromise(() => {
      if (this.targetElement_) {
        toggle(this.targetElement_, true);
      }
      if (this.toolbarOnlyElementsInSidebar_) {
        this.toolbarOnlyElementsInSidebar_.forEach(element => {
          toggle(element, false);
        });
      }
      this.toolbarShown_ = true;
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
      if (this.targetElement_) {
        toggle(this.targetElement_, false);
      }
      if (this.toolbarOnlyElementsInSidebar_) {
        this.toolbarOnlyElementsInSidebar_.forEach(element => {
          toggle(element, true);
        });
      }

      // Remove room for our toolbar
      if (this.body_) {
        setStyles(this.body_, {
          'top': this.initialBodyTop_,
        });
      }


      this.toolbarShown_ = false;
    });
  }
}
