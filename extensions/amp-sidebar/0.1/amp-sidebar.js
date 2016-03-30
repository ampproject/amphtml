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

import {CSS} from '../../../build/amp-sidebar-0.1.css';
import {Layout} from '../../../src/layout';
import {assert} from '../../../src/asserts';
import {isExperimentOn} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {platform} from '../../../src/platform';
import {setStyles} from '../../../src/style';


/** @const */
const EXPERIMENT = 'amp-sidebar';

/** @const */
const TAG = 'AmpSidebar';

/** @const */
const WHITELIST_ = ['AMP-ACCORDION', 'AMP-FIT-TEXT', 'AMP-IMG'];

/** @const */
const IOS_SAFARI_BOTTOMBAR_HEIGHT = '10vh';

export class AmpSidebar extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  isReadyToBuild() {
    return false;
  }

  /** @override */
  buildCallback() {
    /** @const @private {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);

    /** @private @const {!Window} */
    this.win_ = this.getWin();

    /** @private @const {!Document} */
    this.document_ = this.win_.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private @const {string} */
    this.side_ = this.element.getAttribute('side');

    /** @private @const {!Viewport} */
    this.viewport_ = this.getViewport();

    /** @private @const {boolean} */
    this.hasMask_ = false;

    /** @private @const {boolean} */
    this.isPaddingAdjusted_ = false;

    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    if (this.side_ != 'left' && this.side_ != 'right') {
      const pageDir =
          this.document_.body.getAttribute('dir') ||
          this.documentElement_.getAttribute('dir') ||
          'ltr';
      this.side_ = (pageDir == 'rtl') ? 'right' : 'left';
      this.element.setAttribute('side', this.side_);
    }

    if (!this.isExperimentOn_) {
      dev.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
      return;
    }
    if (!this.checkWhitelist_()) {
      return;
    }

    if (this.isIosSafari_) {
      this.fixIosElasticScrollLeak_();
    }

    if (this.documentElement_.classList.contains('amp-sidebar-open')) {
      // Create the mask if the sidebar is rendered in open mode.
      this.open_();
    }

    this.documentElement_.addEventListener('keydown', event => {
      // Close sidebar on ESC.
      if (event.keyCode == 27) {
        this.close_();
      }
    });
    //TODO (skrish, #2712) Add history support on back button.
    this.registerAction('toggle', this.toggle_.bind(this));
    this.registerAction('open', this.open_.bind(this));
    this.registerAction('close', this.close_.bind(this));
  }

  /** @override */
  activate() {
    this.open_();
  }

  /**
   * @private
   */
  adjustPadding_() {
    const viewerPaddingTop = this.viewport_.getPaddingTop();
    if (viewerPaddingTop) {
      // viewerPaddingTop exists when AMP page is rendered inside search
      // carousel.
      const div = this.document_.createElement('div');
      setStyles(div, {
        'height': viewerPaddingTop + 'px',
        'width': '100%',
      });
      const firstChild = this.element.firstChild;
      this.element.insertBefore(div, firstChild);
    }
    if (this.isIosSafari_) {
      //Compensate for IOS safari bottom navbar.
      const div = this.document_.createElement('div');
      setStyles(div, {
        'height': IOS_SAFARI_BOTTOMBAR_HEIGHT,
        'width': '100%',
      });
      this.element.appendChild(div);
    }
    this.isPaddingAdjusted_ = true;
  }

  /**
   * Toggles the open/close state of the sidebar.
   * @private
   */
  toggle_() {
    if (this.documentElement_.classList.contains('amp-sidebar-open')) {
      this.close_();
    } else {
      this.open_();
    }
  }

  /**
   * Reveals the sidebar.
   * @private
   */
  open_() {
    this.viewport_.disableTouchZoom();
    if (!this.isPaddingAdjusted_) {
      this.adjustPadding_();
    }
    this.mutateElement(() => {
      this.viewport_.addToFixedLayer(this.element);
      this.createMask_();
      this.documentElement_.classList.add('amp-sidebar-open');
      this.documentElement_.classList.remove('amp-sidebar-closed');
      this.element./*REVIEW*/scrollTop = 1;
    });
  }

  /**
   * Hides the sidebar.
   * @private
   */
  close_() {
    this.viewport_.restoreOriginalTouchZoom();
    this.mutateElement(() => {
      this.documentElement_.classList.remove('amp-sidebar-open');
      this.documentElement_.classList.add('amp-sidebar-closed');
      this.viewport_.removeFromFixedLayer(this.element);
    });
  }

  /**
   * Checks if the sidebar only has the whitlisted custom amp- elements.
   * @returns {boolean} True when only whitelited elements are present.
   * @private
   */
  checkWhitelist_() {
    const elements = this.element.getElementsByTagName('*');
    let i = elements.length - 1;
    while (i >= 0) {
      const tagName = elements[i].tagName;
      if (tagName.indexOf('AMP-') == 0) {
        const isWhiteListed = assert(
            WHITELIST_.indexOf(tagName) >= 0,
            '%s can only contain the following custom tags: %s',
            this.element, WHITELIST_);
        if (!isWhiteListed) {
          return false;
        }
      }
      i--;
    }
    return true;
  }

  /**
   * @private
   */
  createMask_() {
    if (this.hasMask_) {
      return;
    }
    const mask = this.document_.createElement('div');
    mask.classList.add('-amp-sidebar-mask');
    mask.addEventListener('click', () => {
      this.toggle_();
    });
    this.element.parentNode.appendChild(mask);
    mask.addEventListener('touchmove', e => {
      e.preventDefault();
    });
    this.hasMask_ = true;
  }

  /**
   * @private
   */
  fixIosElasticScrollLeak_() {
    this.element.addEventListener('scroll', e => {
      if (this.documentElement_.classList.contains('amp-sidebar-open')) {
        if (this.element./*REVIEW*/scrollTop < 1) {
          this.element./*REVIEW*/scrollTop = 1;
          e.preventDefault();
        } else if (this.element./*REVIEW*/scrollHeight ==
              this.element./*REVIEW*/scrollTop +
              this.element./*REVIEW*/offsetHeight) {
          this.element./*REVIEW*/scrollTop =
              this.element./*REVIEW*/scrollTop - 1;
          e.preventDefault();
        }
      }
    });
  }
}

AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
