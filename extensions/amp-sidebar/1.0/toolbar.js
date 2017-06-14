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

import {setStyles} from '../../../src/style';

export class Toolbar {
  /** @param {!Element} element */
  constructor(element) {
    /** @private {?Element} */
    this.element = element;

    /** @private {?Element} */
    this.sidebarElement_ = this.element.parentElement;

    /** @private {string|undefined} */
    this.toolbarMedia_ = undefined;

    /** @private {?Element} */
    this.toolbarClone_ = null;

    /** @private {?Element} */
    this.toolbarTarget_ = null;

    /** @private {?Array} */
    this.toolbarOnlyElements_ = null;

    // Get our declared private variables
    this.toolbarMedia_ = this.element.getAttribute('toolbar');

    // Create a header element on the document for our toolbar
    // TODO: Allow specifying a target for the toolbar
    this.toolbarTarget_ =
      this.element.ownerDocument.createElement('header');
    this.sidebarElement_.parentElement
      .insertBefore(this.toolbarTarget_, this.sidebarElement_);
    //Place the elements into the target
    this.toolbarClone_ = this.element.cloneNode(true);
    this.toolbarTarget_.appendChild(this.toolbarClone_);
    if (!this.isToolbarShown_()) {
      setStyles(this.toolbarTarget_, {
        'display': 'none',
      });
    }

    //Finally, find our tool-bar only elements
    if (this.element.hasAttribute('toolbar-only')) {
      this.toolbarOnlyElements_ = [];
      this.toolbarOnlyElements_.push(this.element);
    } else if (!this.element.hasAttribute('toolbar-only') &&
      this.element.querySelectorAll('*[toolbar-only]').length > 0) {
      this.toolbarOnlyElements_ = [];
      // Check the nav's children for toolbar-only
      Array.prototype.slice.call(this.element
        .querySelectorAll('*[toolbar-only]'), 0).forEach(toolbarOnlyElement => {
          this.toolbarOnlyElements_.push(toolbarOnlyElement);
        });
    }
  }

  /**
   * Returns if the sidebar is currently in toolbar media query
   * @returns {boolean}
   * @private
   */
  isToolbarShown_() {
    return this.element.ownerDocument.defaultView
      .matchMedia(this.toolbarMedia_).matches;
  }

  /**
   * Function called to check if we should show or hide the toolbar
   * @param {!Function} onChangeCallback - function called if toolbar changes on check
   */
  checkToolbar(onChangeCallback) {
    console.log(this.toolbarMedia_);
    // Remove and add the toolbar dynamically
    if (this.isToolbarShown_() &&
      !this.toolbarTarget_.hasAttribute('toolbar')
    ) {
      // Display the elements
      setStyles(this.toolbarTarget_, {
        'display': null,
      });
      if (this.toolbarOnlyElements_) {
        this.toolbarOnlyElements_.forEach(element => {
          setStyles(element, {
            'display': 'none',
          });
        });
      }
      this.toolbarTarget_.setAttribute('toolbar', '');
      onChangeCallback();
    } else if (!this.isToolbarShown_() &&
      this.toolbarTarget_.hasAttribute('toolbar')
      ) {
      // Hide the elements
      setStyles(this.toolbarTarget_, {
        'display': 'none',
      });
      if (this.toolbarOnlyElements_) {
        this.toolbarOnlyElements_.forEach(element => {
          setStyles(element, {
            'display': null,
          });
        });
      }
      this.toolbarTarget_.removeAttribute('toolbar');
      onChangeCallback();
    }
  }
}
