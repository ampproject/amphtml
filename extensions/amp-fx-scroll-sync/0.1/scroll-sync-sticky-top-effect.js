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

import {ScrollSyncEffect} from './scroll-sync-effect';
import {setStyles, getStyle} from '../../../src/style';
import {viewportFor} from '../../../src/viewport';
import {insertAfter} from '../../../src/dom';

const ELEMENT_SHIM_TAG = 'i-amp-scroll-sync-shim';

export class ScrollSyncStickyTopEffect extends ScrollSyncEffect {

  constructor(element) {
    super(element);
    this.layoutBox_ = null;
    this.isDocked_ = false;
    this.elementShim_ = null;

    this.win = element.ownerDocument.defaultView;
    this.viewport_ = viewportFor(this.win);

    // TODO: This is wrong and we shouldn't be doing it. But because of collapsing
    // margins we are getting a "false" offsetTop position measurement.
    setStyles(this.element_, {
      'overflow': 'auto',
    });
  }

  /** @override */
  measure() {
    if (!this.scrollMin_) {
      this.scrollMin_ = this.element_./*OK*/offsetTop;
    }
    if (!this.scrollMax_) {
      this.scrollMax_ = this.scrollMin_ + 1;
    }

    this.layoutBox_ = this.viewport_.getLayoutRect(this.element_);
  }

  /** @override */
  transition(position) {
    const shouldDock = position > 0 && !this.isDocked_;
    const shouldUndock = position <= 0 && this.isDocked_;
    if (shouldDock) {
      setStyles(this.element_, {
        'position': 'fixed',
        'top': '0',
        'width': this.layoutBox_.width + 'px',
        'height': this.layoutBox_.height + 'px',
      });
      this.element_.classList.add('docked');
      this.isDocked_ = true;
      this.addOrShowElementShim_();
    } else if (shouldUndock) {
      setStyles(this.element_, {
        'position': '',
        'top': '',
        'width': '',
        'height': '',
      });
      this.element_.classList.remove('docked');
      this.isDocked_ = false;
      this.hideElementShim_();
    }
  }

  addOrShowElementShim_() {
    if (!this.elementShim_) {
      this.elementShim_ = this.win.document.createElement(ELEMENT_SHIM_TAG);
      insertAfter(this.elementShim_, this.element_);
    }
    setStyles(this.elementShim_, {
      'display': getStyle(this.element_, 'display') || 'block',
      'margin': getStyle(this.element_, 'margin'),
      'padding': getStyle(this.element_, 'padding'),
      'width': this.layoutBox_.width + 'px',
      'height': this.layoutBox_.height + 'px',
    });
  }

  hideElementShim_() {
    setStyles(this.elementShim_, {
      'display': 'none',
    });
  }
}
