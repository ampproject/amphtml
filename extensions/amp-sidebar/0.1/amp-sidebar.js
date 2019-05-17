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

import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-sidebar-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {Toolbar} from './toolbar';
import {
  closestAncestorElementBySelector,
  isRTL,
  tryFocus,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {descendsFromStory} from '../../../src/utils/story';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {handleAutoscroll} from './autoscroll';
import {removeFragment} from '../../../src/url';
import {setStyles, toggle} from '../../../src/style';
import {toArray} from '../../../src/types';

/** @private @const {string} */
const TAG = 'amp-sidebar toolbar';

/** @private @const {number} */
const ANIMATION_TIMEOUT = 350;

/** @private @enum {string} */
const Side = {
  LEFT: 'left',
  RIGHT: 'right',
};

/**
 * For browsers with bottom nav bars the content towards the bottom
 * end of the sidebar is cut off.
 * Currently Safari is the only browser with a nav bar on the bottom
 * so we set the width of this block to the width of Safari's nav bar.
 * Source for value: https://github.com/WebKit/webkit/blob/de9875e914c8fda3f46247cd482ce4f849ddad0a/Source/WebInspectorUI/UserInterface/Views/Variables.css#L119
 */
/** @private @const {string} */
const IOS_SAFARI_BOTTOMBAR_HEIGHT = '29px';

/**  @enum {string} */
const SidebarEvents = {
  OPEN: 'sidebarOpen',
  CLOSE: 'sidebarClose',
};

/**
 * @extends {AMP.BaseElement}
 */
export class AmpSidebar extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?function()} */
    this.updateFn_ = null;

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

    const platform = Services.platformFor(this.win);

    /** @private @const {boolean} */
    this.isIos_ = platform.isIos();

    /** @private @const {boolean} */
    this.isSafari_ = platform.isSafari();

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.bottomBarCompensated_ = false;

    /** @private {?Element} */
    this.openerElement_ = null;

    /** @private {number} */
    this.initialScrollTop_ = 0;
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    element.classList.add('i-amphtml-overlay');
    element.classList.add('i-amphtml-scrollable');

    this.side_ = element.getAttribute('side');

    this.viewport_ = this.getViewport();

    this.action_ = Services.actionServiceForDoc(element);

    if (this.side_ != Side.LEFT && this.side_ != Side.RIGHT) {
      this.side_ = this.setSideAttribute_(
        isRTL(this.document_) ? Side.RIGHT : Side.LEFT
      );
      element.setAttribute('side', this.side_);
    }

    // Get the toolbar attribute from the child navs.
    const toolbarElements = toArray(element.querySelectorAll('nav[toolbar]'));

    toolbarElements.forEach(toolbarElement => {
      try {
        this.toolbars_.push(new Toolbar(toolbarElement, this));
      } catch (e) {
        this.user().error(TAG, 'Failed to instantiate toolbar', e);
      }
    });

    if (this.isIos_) {
      this.fixIosElasticScrollLeak_();
    }

    if (this.isOpen_()) {
      this.open_();
    } else {
      element.setAttribute('aria-hidden', 'true');
    }

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'menu');
    }
    // Make sidebar programmatically focusable and focus on `open` for a11y.
    element.tabIndex = -1;

    this.documentElement_.addEventListener('keydown', event => {
      // Close sidebar on ESC.
      if (event.key == Keys.ESCAPE) {
        if (this.close_()) {
          event.preventDefault();
        }
      }
    });

    // Replacement label for invisible close button set value in amp sidebar
    const ariaLabel =
      element.getAttribute('data-close-button-aria-label') ||
      'Close the sidebar';

    // Invisible close button at the end of sidebar for screen-readers.
    const screenReaderCloseButton = this.document_.createElement('button');

    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');
    // This is for screen-readers only, should not get a tab stop.
    screenReaderCloseButton.tabIndex = -1;
    screenReaderCloseButton.addEventListener('click', () => {
      this.close_();
    });
    element.appendChild(screenReaderCloseButton);
    this.registerDefaultAction(invocation => this.open_(invocation), 'open');
    this.registerAction('toggle', this.toggle_.bind(this));
    this.registerAction('close', this.close_.bind(this));

    element.addEventListener(
      'click',
      e => {
        const target = closestAncestorElementBySelector(
          dev().assertElement(e.target),
          'A'
        );
        if (target && target.href) {
          const tgtLoc = Services.urlForDoc(element).parse(target.href);
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
      },
      true
    );
  }

  /** @override */
  onLayoutMeasure() {
    this.getAmpDoc()
      .whenReady()
      .then(() => {
        // Check our toolbars for changes
        this.toolbars_.forEach(toolbar => {
          toolbar.onLayoutChange();
        });
      });
  }

  /**
   * Returns true if the sidebar is opened.
   * @return {boolean}
   * @private
   */
  isOpen_() {
    return this.element.hasAttribute('open');
  }

  /**
   * Toggles the open/close state of the sidebar.
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @private
   */
  toggle_(opt_invocation) {
    if (this.isOpen_()) {
      this.close_();
    } else {
      this.open_(opt_invocation);
    }
  }

  /**
   * Sets a function to update the state of the sidebar. If another one has
   * been set before the function takes effect, it is ignored.
   * @param {function()} updateFn A function to update the sidebar.
   * @param {number=} delay An optional delay to wait before calling the update
   *    function.
   */
  setUpdateFn_(updateFn, delay) {
    this.updateFn_ = updateFn;

    const runUpdate = () => {
      // Make sure we haven't been replaced by another update function.
      if (this.updateFn_ === updateFn) {
        this.mutateElement(updateFn);
      }
    };

    if (delay) {
      Services.timerFor(this.win).delay(runUpdate, delay);
    } else {
      runUpdate();
    }
  }

  /**
   * Updates the sidebar while it is animating to the opened state.
   */
  updateForOpening_() {
    toggle(this.element, /* display */ true);
    this.viewport_.addToFixedLayer(this.element, /* forceTransfer */ true);

    if (this.isIos_ && this.isSafari_) {
      this.compensateIosBottombar_();
    }

    this.element./*OK*/ scrollTop = 1;
    this.openMask_();
    this.element.setAttribute('open', '');
    this.element.setAttribute('aria-hidden', 'false');
    this.setUpdateFn_(() => this.updateForOpened_(), ANIMATION_TIMEOUT);
    handleAutoscroll(this.getAmpDoc(), this.element);
  }

  /**
   * Updates the sidebar for when it has finished opening.
   */
  updateForOpened_() {
    // On open sidebar
    const children = this.getRealChildren();
    this.scheduleLayout(children);
    this.scheduleResume(children);
    tryFocus(this.element);
    this.triggerEvent_(SidebarEvents.OPEN);
  }

  /**
   * Updates the sidebar for when it is animating to the closed state.
   */
  updateForClosing_() {
    this.closeMask_();
    this.element.removeAttribute('open');
    this.element.setAttribute('aria-hidden', 'true');
    this.setUpdateFn_(() => this.updateForClosed_(), ANIMATION_TIMEOUT);
  }

  /**
   * Updates the sidebar for when it has finished closing.
   */
  updateForClosed_() {
    toggle(this.element, /* display */ false);
    this.schedulePause(this.getRealChildren());
    this.triggerEvent_(SidebarEvents.CLOSE);
  }

  /**
   * Reveals the sidebar.
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @private
   */
  open_(opt_invocation) {
    if (this.isOpen_()) {
      return;
    }
    this.viewport_.enterOverlayMode();
    this.setUpdateFn_(() => this.updateForOpening_());
    this.getHistory_()
      .push(this.close_.bind(this))
      .then(historyId => {
        this.historyId_ = historyId;
      });
    if (opt_invocation) {
      this.openerElement_ = opt_invocation.caller;
      this.initialScrollTop_ = this.viewport_.getScrollTop();
    }
  }

  /**
   * Hides the sidebar.
   * @return {boolean} Whether the sidebar actually transitioned from "visible"
   *     to "hidden".
   * @private
   */
  close_() {
    if (!this.isOpen_()) {
      return false;
    }
    this.viewport_.leaveOverlayMode();
    const scrollDidNotChange =
      this.initialScrollTop_ == this.viewport_.getScrollTop();
    const sidebarIsActive = this.element.contains(this.document_.activeElement);
    this.setUpdateFn_(() => this.updateForClosing_());
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
      this.historyId_ = -1;
    }
    if (this.openerElement_ && sidebarIsActive && scrollDidNotChange) {
      tryFocus(this.openerElement_);
    }
    return true;
  }
  /**
   * Sidebars within <amp-story> should be 'flipped'.
   * @param {!Side} side
   * @return {Side}
   * @private
   */
  setSideAttribute_(side) {
    if (!descendsFromStory(this.element)) {
      return side;
    } else {
      return side == Side.LEFT ? Side.RIGHT : Side.LEFT;
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
    this.maskElement_.classList.toggle('i-amphtml-ghost', false);
  }

  /**
   * @private
   */
  closeMask_() {
    if (this.maskElement_) {
      this.maskElement_.classList.toggle('i-amphtml-ghost', true);
    }
  }

  /**
   * @private
   */
  fixIosElasticScrollLeak_() {
    this.element.addEventListener('scroll', e => {
      if (this.isOpen_()) {
        if (this.element./*OK*/ scrollTop < 1) {
          this.element./*OK*/ scrollTop = 1;
          e.preventDefault();
        } else if (
          this.element./*OK*/ scrollHeight ==
          this.element./*OK*/ scrollTop + this.element./*OK*/ offsetHeight
        ) {
          this.element./*OK*/ scrollTop = this.element./*OK*/ scrollTop - 1;
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
    return Services.historyForDoc(this.getAmpDoc());
  }

  /**
   * @param {string} name
   * @private
   */
  triggerEvent_(name) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }
}

AMP.extension('amp-sidebar', '0.1', AMP => {
  AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
});
