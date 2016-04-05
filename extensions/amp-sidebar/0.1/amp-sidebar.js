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
import {isExperimentOn} from '../../../src/experiments';
import {dev} from '../../../src/log';
import {setStyles} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-sidebar';

/** @const */
const TAG = 'AmpSidebar';

export class AmpSidebar extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NOLAYOUT;
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

    /** @private @const {!Element} */
    this.maskElement_ = false;

    if (!this.isExperimentOn_) {
      dev.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
      return;
    }

    if (this.side_ != 'left' && this.side_ != 'right') {
      const pageDir =
          this.document_.body.getAttribute('dir') ||
          this.documentElement_.getAttribute('dir') ||
          'ltr';
      this.side_ = (pageDir == 'rtl') ? 'right' : 'left';
      this.element.setAttribute('side', this.side_);
    }

    if (this.isOpen_()) {
      this.open_();
    } else {
      this.element.setAttribute('aria-hidden', 'true');
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

 /**
  * Returns true if the sidebar is opened.
  * @returns {boolean}
  * @private
  */
 isOpen_() {
   return this.element.hasAttribute('open');
 }

  /** @override */
  activate() {
    this.open_();
  }


  /**
   * Toggles the open/close state of the sidebar.
   * @private
   */
  toggle_() {
    if (this.isOpen_()) {
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
    this.mutateElement(() => {
      this.viewport_.addToFixedLayer(this.element);
      setStyles(this.element, {
        'display': 'block',
      });
      this.openMask_();
      this.element.setAttribute('open', '');
      this.element.setAttribute('aria-hidden', 'false');
    });
  }

  /**
   * Hides the sidebar.
   * @private
   */
  close_() {
    this.viewport_.restoreOriginalTouchZoom();
    this.mutateElement(() => {
      this.closeMask_();
      this.element.removeAttribute('open');
      this.element.setAttribute('aria-hidden', 'true');
      setStyles(this.element, {
        'display': 'none',
      });
      this.viewport_.removeFromFixedLayer(this.element);
    });
  }

  /**
   * @private
   */
  openMask_() {
    if (!this.maskElement_) {
      const mask = this.document_.createElement('div');
      mask.classList.add('-amp-sidebar-mask');
      mask.addEventListener('click', () => {
        this.close_();
      });
      this.element.parentNode.appendChild(mask);
      mask.addEventListener('touchmove', e => {
        e.preventDefault();
      });
      this.maskElement_ = mask;
    }
    setStyles(this.maskElement_, {
      'display': 'block',
    });
  }

  /**
   * @private
   */
  closeMask_() {
    if (this.maskElement_) {
      setStyles(this.maskElement_, {
        'display': 'none',
      });
    }
  }
}

AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
