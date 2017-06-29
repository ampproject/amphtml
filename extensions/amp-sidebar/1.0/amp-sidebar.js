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

import {CSS} from '../../../build/amp-sidebar-1.0.css';
import {Layout} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {KeyCodes} from '../../../src/utils/key-codes';
import {closestByTag, tryFocus} from '../../../src/dom';
import {historyForDoc} from '../../../src/services';
import {platformFor} from '../../../src/services';
import {setStyles, toggle} from '../../../src/style';
import {removeFragment, parseUrl} from '../../../src/url';
import {vsyncFor} from '../../../src/services';
import {timerFor} from '../../../src/services';
import {Toolbar} from './toolbar';

/** @const */
const TAG = 'amp-sidebar 1.0';

/** @const */
const ANIMATION_TIMEOUT = 550;

/** @const */
const IOS_SAFARI_BOTTOMBAR_HEIGHT = '10vh';

export class AmpSidebar extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.win);

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private {?string} */
    this.side_ = null;

    /** @private {Array} */
    this.toolbars_ = [];

    const platform = platformFor(this.win);

    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.bottomBarCompensated_ = false;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.win);

    /** @private {number|string|null} */
    this.openOrCloseTimeOut_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, 'amp-sidebar 1.0'),
        'Experiment amp-sidebar 1.0 is disabled.');

    this.side_ = this.element.getAttribute('side');

    this.viewport_ = this.getViewport();

    this.viewport_.addToFixedLayer(this.element, /* forceTransfer */ true);

    if (this.side_ != 'left' && this.side_ != 'right') {
      const pageDir =
          this.document_.body.getAttribute('dir') ||
          this.documentElement_.getAttribute('dir') ||
          'ltr';
      this.side_ = (pageDir == 'rtl') ? 'right' : 'left';
      this.element.setAttribute('side', this.side_);
    }

    // Get the toolbar attribute from the child navs
    const toolbarElements =
    Array.prototype.slice
      .call(this.element.querySelectorAll('nav[toolbar]'), 0);
    toolbarElements.forEach(toolbarElement => {
      try {
        this.toolbars_.push(new Toolbar(toolbarElement, this.win, this.vsync_));
      } catch (e) {
        user().error(TAG, 'Failed to instantiate toolbar', e);
      }
    });

    if (this.isIosSafari_) {
      this.fixIosElasticScrollLeak_();
    }

    if (this.isOpen_()) {
      this.open_();
    } else {
      this.element.setAttribute('aria-hidden', 'true');
    }

    if (!this.element.hasAttribute('role')) {
      this.element.setAttribute('role', 'menu');
    }
    // Make sidebar programmatically focusable and focus on `open` for a11y.
    this.element.tabIndex = -1;

    this.documentElement_.addEventListener('keydown', event => {
      // Close sidebar on ESC.
      if (event.keyCode == KeyCodes.ESCAPE) {
        this.close_();
      }
    });

    // Replacement label for invisible close button set value in amp sidebar
    const ariaLabel = this.element.getAttribute('data-close-button-aria-label')
    || 'Close the sidebar';

    // Invisible close button at the end of sidebar for screen-readers.
    const screenReaderCloseButton = this.document_.createElement('button');

    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');
    // This is for screen-readers only, should not get a tab stop.
    screenReaderCloseButton.tabIndex = -1;
    screenReaderCloseButton.addEventListener('click', () => {
      this.close_();
    });
    this.element.appendChild(screenReaderCloseButton);

    this.registerAction('toggle', this.toggle_.bind(this));
    this.registerAction('open', this.open_.bind(this));
    this.registerAction('close', this.close_.bind(this));

    this.element.addEventListener('click', e => {
      const target = closestByTag(dev().assertElement(e.target), 'A');
      if (target && target.href) {
        const tgtLoc = parseUrl(target.href);
        const currentHref = this.getAmpDoc().win.location.href;
        // Important: Only close sidebar (and hence pop sidebar history entry)
        // when navigating locally, Chrome might cancel navigation request
        // due to after-navigation history manipulation inside a timer callback.
        // See this issue for more details:
        // https://github.com/ampproject/amphtml/issues/6585
        if (removeFragment(target.href) != removeFragment(currentHref)) {
          return;
        }

        if (tgtLoc.hash) {
          this.close_();
        }
      }
    }, true);
  }

  /** @override */
  onLayoutMeasure() {
    // Check our toolbars for changes
    this.toolbars_.forEach(toolbar => {
      toolbar.onLayoutChange(() => this.onToolbarOpen_());
    });
  }

  /** @override */
  activate() {
    this.open_();
  }

  /**
   * Function called whenever a tollbar is opened.
   * @private
   */
  onToolbarOpen_() {
    this.close_();
  }

  /**
   * Returns true if the sidebar is opened.
   * @returns {boolean}
   * @private
   */
  isOpen_() {
    return this.element.hasAttribute('open');
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
    this.viewport_.enterOverlayMode();
    this.vsync_.mutate(() => {
      toggle(this.element, /* display */true);
      this.openMask_();
      if (this.isIosSafari_) {
        this.compensateIosBottombar_();
      }
      this.element./*OK*/scrollTop = 1;
      // Start animation in a separate vsync due to display:block; set above.
      this.vsync_.mutate(() => {
        this.element.setAttribute('open', '');
        this.element.setAttribute('aria-hidden', 'false');
        if (this.openOrCloseTimeOut_) {
          this.timer_.cancel(this.openOrCloseTimeOut_);
        }
        this.openOrCloseTimeOut_ = this.timer_.delay(() => {
          const children = this.getRealChildren();
          this.scheduleLayout(children);
          this.scheduleResume(children);
          // Focus on the sidebar for a11y.
          tryFocus(this.element);
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
    this.viewport_.leaveOverlayMode();
    this.vsync_.mutate(() => {
      this.closeMask_();
      this.element.removeAttribute('open');
      this.element.setAttribute('aria-hidden', 'true');
      if (this.openOrCloseTimeOut_) {
        this.timer_.cancel(this.openOrCloseTimeOut_);
      }
      this.openOrCloseTimeOut_ = this.timer_.delay(() => {
        if (!this.isOpen_()) {
          this.vsync_.mutate(() => {
            toggle(this.element, /* display */false);
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
      mask.classList.add('i-amphtml-sidebar-mask');
      mask.addEventListener('click', () => {
        this.close_();
      });
      this.element.ownerDocument.body.appendChild(mask);
      mask.addEventListener('touchmove', e => {
        e.preventDefault();
      });
      this.maskElement_ = mask;
    }
    toggle(this.maskElement_, /* display */true);
  }

  /**
   * @private
   */
  closeMask_() {
    if (this.maskElement_) {
      toggle(this.maskElement_, /* display */false);
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
   * @private @return {!../../../src/service/history-impl.History}
   */
  getHistory_() {
    return historyForDoc(this.getAmpDoc());
  }
}

AMP.extension('amp-sidebar', '1.0', AMP => {
  AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
});
