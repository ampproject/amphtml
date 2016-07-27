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
import {historyFor} from '../../../src/history';
import {platform} from '../../../src/platform';
import {setStyles} from '../../../src/style';
import {vsyncFor} from '../../../src/vsync';
import {timer} from '../../../src/timer';

/** @const */
const ANIMATION_TIMEOUT = 550;

/** @const */
const IOS_SAFARI_BOTTOMBAR_HEIGHT = '10vh';

export class AmpSidebar extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NOLAYOUT;
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private @const {string} */
    this.side_ = this.element.getAttribute('side');

    /** @private @const {!Viewport} */
    this.viewport_ = this.getViewport();

    /** @private @const {!Element} */
    this.maskElement_ = false;

    /** @const @private {!Vsync} */
    this.vsync_ = vsyncFor(this.win);

    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.bottomBarCompensated_ = false;

    if (this.side_ != 'left' && this.side_ != 'right') {
      const pageDir =
          this.document_.body.getAttribute('dir') ||
          this.documentElement_.getAttribute('dir') ||
          'ltr';
      this.side_ = (pageDir == 'rtl') ? 'right' : 'left';
      this.element.setAttribute('side', this.side_);
    }

    if (this.isIosSafari_) {
      this.fixIosElasticScrollLeak_();
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
    if (this.isOpen_()) {
      return;
    }
    this.viewport_.disableTouchZoom();
    this.vsync_.mutate(() => {
      setStyles(this.element, {
        'display': 'block',
      });
      this.viewport_.addToFixedLayer(this.element);
      this.openMask_();
      if (this.isIosSafari_) {
        this.compensateIosBottombar_();
      }
      this.element./*OK*/scrollTop = 1;
      // Start animation in a separate vsync due to display:block; set above.
      this.vsync_.mutate(() => {
        this.element.setAttribute('open', '');
        this.element.setAttribute('aria-hidden', 'false');
        timer.delay(() => {
          const children = this.getRealChildren();
          this.scheduleLayout(children);
          this.scheduleResume(children);
        }, ANIMATION_TIMEOUT);
      });
    });
    this.getHistory_().push(this.close_.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });
  }

  /**
   * Hides the sidebar.
   * @private
   */
  close_() {
    if (!this.isOpen_()) {
      return;
    }
    this.viewport_.restoreOriginalTouchZoom();
    this.vsync_.mutate(() => {
      this.closeMask_();
      this.element.removeAttribute('open');
      this.element.setAttribute('aria-hidden', 'true');
      timer.delay(() => {
        if (!this.isOpen_()) {
          this.viewport_.removeFromFixedLayer(this.element);
          this.vsync_.mutate(() => {
            setStyles(this.element, {
              'display': 'none',
            });
            this.schedulePause(this.getRealChildren());
          });
        }
      }, ANIMATION_TIMEOUT);
    });
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
      this.historyId_ = -1;
    }
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

  /**
   * @private
   */
  fixIosElasticScrollLeak_() {
    this.element.addEventListener('scroll', e => {
      if (this.isOpen_()) {
        if (this.element./*OK*/scrollTop < 1) {
          this.element./*OK*/scrollTop = 1;
          e.preventDefault();
        } else if (this.element./*OK*/scrollHeight ==
              this.element./*OK*/scrollTop +
              this.element./*OK*/offsetHeight) {
          this.element./*OK*/scrollTop =
              this.element./*OK*/scrollTop - 1;
          e.preventDefault();
        }
      }
    });
  }

  /**
   * @private
   */
  compensateIosBottombar_() {
    if (!this.bottomBarCompensated_) {
      // Compensate for IOS safari bottom navbar.
      const div = this.document_.createElement('div');
      setStyles(div, {
        'height': IOS_SAFARI_BOTTOMBAR_HEIGHT,
        'width': '100%',
        'background-color': 'transparent',
      });
      this.element.appendChild(div);
      this.bottomBarCompensated_ = true;
    }
  }

  /**
   * @private @return {!History}
   */
  getHistory_() {
    return historyFor(this.win);
  }
}

AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
