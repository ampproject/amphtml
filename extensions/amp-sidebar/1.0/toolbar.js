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
    this.element_ = element;

    /** @private {string|undefined} */
    this.toolbarMedia_ = undefined;

    /** @private {?Element} */
    this.toolbarClone_ = null;

    /** @private {?Element} */
    this.toolbarTarget_ = null;

    /** @private {?Array} */
    this.toolbarOnlyElements_ = null;
  }

  /**
   * Returns if the sidebar is currently in toolbar media query
   * @returns {boolean}
   */
  isToolbarShown() {
    return this.element.ownerDocument.defaultView
      .matchMedia(this.toolbarMedia_).matches;
  }

  /**
   * Function called to check if we should show or hide the toolbar
   */
  checkToolbar() {
    // Remove and add the toolbar dynamically
    if (this.isToolbar_() && !this.toolbarTarget_.hasAttribute('toolbar')) {
      this.closeIfOpen_();
      // Add the toolbar elements
      this.toolbarClone_ = this.toolbarNav_.cloneNode(true);
      this.toolbarTarget_.appendChild(this.toolbarClone_);
      if (this.toolbarTarget_.style.display === 'none') {
        setStyles(this.toolbarTarget_, {
          'display': null,
        });
      }
      if (this.toolbarOnlyElements_) {
        this.toolbarOnlyElements_.forEach(element => {
          setStyles(element, {
            'display': 'none',
          });
        });
      }
      this.toolbarTarget_.setAttribute('toolbar', '');
    } else if (!this.isToolbar_() &&
      this.toolbarTarget_.hasAttribute('toolbar')
      ) {
      this.closeIfOpen_();
      // Remove the elements and the attribute
      this.toolbarTarget_.removeChild(this.toolbarClone_);
      if (this.toolbarOnlyElements_) {
        this.toolbarOnlyElements_.forEach(element => {
          setStyles(element, {
            'display': null,
          });
        });
      }
      this.toolbarTarget_.removeAttribute('toolbar');

      // Check if our target still has elements, if not, do not display it
      if (!this.toolbarTarget_.hasChildNodes()) {
        setStyles(this.toolbarTarget_, {
          'display': 'none',
        });
      }
    }
  }
}
