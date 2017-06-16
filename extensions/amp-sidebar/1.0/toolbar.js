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
  /**
  * @param {!Element} element
  * @param {!BaseElement} baseElement
  */
  constructor(element, baseElement) {
    this.element = element;

    /** @private {?Element} */
    this.sidebarElement_ = baseElement;

    /** @private {?string} */
    this.toolbarMedia_ = this.element.getAttribute('toolbar');

    /** @private {?Element} */
    this.toolbarClone_ = null;

    /** @private {Element|undefined} */
    this.toolbarTarget_ = undefined;

    /** @private {Array} */
    this.toolbarOnlyElements_ = [];

    this.buildToolbar_();

    //Finally, find our tool-bar only elements
    if (this.element.hasAttribute('toolbar-only')) {
      this.toolbarOnlyElements_.push(this.element);
    } else if (!this.element.hasAttribute('toolbar-only') &&
      this.element.querySelectorAll('*[toolbar-only]').length > 0) {
      // Check the nav's children for toolbar-only
      Array.prototype.slice.call(this.element
          .querySelectorAll('*[toolbar-only]'), 0)
          .forEach(toolbarOnlyElement => {
            this.toolbarOnlyElements_.push(toolbarOnlyElement);
          });
    }
  }

  /**
   * Private function to build the DOM element for the toolbar
   * TODO: Allow specifying a target for the toolbar
   * @private
   */
  buildToolbar_() {
    const fragment = this.sidebarElement_
      .ownerDocument.createDocumentFragment();
    this.toolbarTarget_ =
      this.element.ownerDocument.createElement('header');
    //Place the elements into the target
    this.toolbarClone_ = this.element.cloneNode(true);
    this.toolbarTarget_.appendChild(this.toolbarClone_);
    if (!this.isToolbarShown_()) {
      setStyles(this.toolbarTarget_, {
        'display': 'none',
      });
    }

    fragment.appendChild(this.toolbarTarget_);
    this.sidebarElement_.parentElement
        .insertBefore(fragment, this.sidebarElement_);
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
