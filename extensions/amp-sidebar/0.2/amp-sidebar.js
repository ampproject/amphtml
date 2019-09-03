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
import {Direction, Orientation, SwipeToDismiss} from '../0.1/swipe-to-dismiss';
import {Gestures} from '../../../src/gesture';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {SwipeDef, SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {createCustomEvent} from '../../../src/event-helper';
import {descendsFromStory} from '../../../src/utils/story';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isRTL} from '../../../src/dom';
import {setModalAsClosed, setModalAsOpen} from '../../../src/modal';
import {toggle} from '../../../src/style';

/** @private @const {string} */
const TAG = 'amp-sidebar toolbar';

/** @private @const {number} */
const ANIMATION_TIMEOUT = 350;

/** @private @enum {string} */
const Side = {
  LEFT: 'left',
  RIGHT: 'right',
};

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

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
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
    this.isSafari_ = platform.isSafari();

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.opened_ = false;

    /** @private @const */
    this.swipeToDismiss_ = new SwipeToDismiss(
      this.win,
      cb => this.mutateElement(cb),
      // The sidebar is already animated by swipe to dismiss, so skip animation.
      () => this.dismiss_(true)
    );
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

    this.documentElement_.addEventListener('keydown', event => {
      // Close sidebar on ESC.
      if (event.key == Keys.ESCAPE) {
        if (this.close_()) {
          event.preventDefault();
        }
      }
    });

    this.registerDefaultAction(invocation => this.open_(invocation), 'open');
    this.registerAction('toggle', this.toggle_.bind(this));
    this.registerAction('close', this.close_.bind(this));

    this.setupGestures_(this.element);

    this.element.addEventListener('click', e => this.onClick_(e));
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
   * @param {*} event
   */
  onClick_(event) {
    if (event.target.closest('[amp-submenu-open]')) {
      const submenu = event.target.parentNode.querySelector('[amp-submenu]');
      const submenuGroup = submenu.closest('[amp-submenu-group]');
      if (submenuGroup && submenu) {
        submenuGroup.setAttribute('show', true);
        submenu.setAttribute('show', true);
      }
    } else if (event.target.closest('[amp-submenu-close]')) {
      const submenu = event.target.closest('[amp-submenu]');
      const submenuGroup = submenu.closest('[amp-submenu-group]');
      if (submenuGroup && submenu) {
        submenuGroup.removeAttribute('show');
        submenu.removeAttribute('show');
      }
    }
  }

  /**
   * Toggles the open/close state of the sidebar.
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @private
   */
  toggle_(opt_invocation) {
    if (this.opened_) {
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
    toggle(this.getMaskElement_(), /* display */ true);
    this.viewport_.addToFixedLayer(this.element, /* forceTransfer */ true);
    this.mutateElement(() => {
      // Wait for mutateElement, so that the element has been transfered to the
      // fixed layer. This is needed to hide the correct elements.
      setModalAsOpen(this.element);
    });

    if (this.isIos_ && this.isSafari_) {
      this.compensateIosBottombar_();
    }

    this.element./*OK*/ scrollTop = 1;
    this.element.setAttribute('open', '');
    this.getMaskElement_().setAttribute('open', '');
    this.element.setAttribute('aria-hidden', 'false');
    this.setUpdateFn_(() => this.updateForOpened_(), ANIMATION_TIMEOUT);
  }

  /**
   * Updates the sidebar for when it has finished opening.
   */
  updateForOpened_() {
    // On open sidebar
    const children = this.getRealChildren();
    const owners = Services.ownersForDoc(this.element);
    owners.scheduleLayout(this.element, children);
    owners.scheduleResume(this.element, children);

    this.triggerEvent_(SidebarEvents.OPEN);
    this.element.setAttribute('i-amphtml-sidebar-opened', '');
    this.getMaskElement_().setAttribute('i-amphtml-sidebar-opened', '');
  }

  /**
   * Updates the sidebar for when it is animating to the closed state.
   * @param {boolean} immediate
   */
  updateForClosing_(immediate) {
    this.getMaskElement_().removeAttribute('open');
    this.getMaskElement_().removeAttribute('i-amphtml-sidebar-opened');
    this.mutateElement(() => {
      setModalAsClosed(this.element);
    });
    this.element.removeAttribute('open');
    this.element.removeAttribute('i-amphtml-sidebar-opened');
    this.element.setAttribute('aria-hidden', 'true');
    this.setUpdateFn_(
      () => this.updateForClosed_(),
      immediate ? 0 : ANIMATION_TIMEOUT
    );
  }

  /**
   * Updates the sidebar for when it has finished closing.
   */
  updateForClosed_() {
    toggle(this.element, /* display */ false);
    toggle(this.getMaskElement_(), /* display */ false);
    Services.ownersForDoc(this.element).schedulePause(
      this.element,
      this.getRealChildren()
    );
    this.triggerEvent_(SidebarEvents.CLOSE);
    this.element.querySelectorAll('[amp-submenu-group]').forEach(element => {
      element.removeAttribute('show');
    });
    this.element.querySelectorAll('[amp-submenu]').forEach(element => {
      element.removeAttribute('show');
    });
  }

  /**
   * Reveals the sidebar.
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @private
   */
  open_(opt_invocation) {
    if (this.opened_) {
      return;
    }
    this.opened_ = true;
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
    return this.dismiss_(false);
  }

  /**
   * Dismisses the sidebar.
   * @param {boolean} immediate Whether sidebar should close immediately,
   *     without animation.
   * @return {boolean} Whether the sidebar actually transitioned from "visible"
   *     to "hidden".
   * @private
   */
  dismiss_(immediate) {
    if (!this.opened_) {
      return false;
    }
    this.opened_ = false;
    this.viewport_.leaveOverlayMode();
    this.setUpdateFn_(() => this.updateForClosing_(immediate));
    // Immediately hide the sidebar so that animation does not play.
    if (immediate) {
      toggle(this.element, /* display */ false);
      toggle(this.getMaskElement_(), /* display */ false);
    }
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
      this.historyId_ = -1;
    }

    return true;
  }

  /**
   * Set up gestures for the specified element.
   * @param {!Element} element
   * @private
   */
  setupGestures_(element) {
    if (!isExperimentOn(this.win, 'amp-sidebar-swipe-to-dismiss')) {
      return;
    }
    // stop propagation of swipe event inside amp-viewer
    const gestures = Gestures.get(
      dev().assertElement(element),
      /* shouldNotPreventDefault */ false,
      /* shouldStopPropagation */ true
    );
    gestures.onGesture(SwipeXRecognizer, ({data}) => {
      this.handleSwipe_(data);
    });
  }

  /**
   * Handles a swipe gesture, updating the current swipe to dismiss state.
   * @param {!SwipeDef} data
   */
  handleSwipe_(data) {
    if (data.first) {
      this.swipeToDismiss_.startSwipe({
        swipeElement: dev().assertElement(this.element),
        mask: dev().assertElement(this.maskElement_),
        direction:
          this.side_ == Side.LEFT ? Direction.BACKWARD : Direction.FORWARD,
        orientation: Orientation.HORIZONTAL,
      });
      return;
    }

    if (data.last) {
      this.swipeToDismiss_.endSwipe(data);
      return;
    }

    this.swipeToDismiss_.swipeMove(data);
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
   * Get the sidebar's mask element; create one if none exists.
   * @return {!Element}
   * @private
   */
  getMaskElement_() {
    if (!this.maskElement_) {
      const mask = this.document_.createElement('div');
      mask.classList.add('i-amphtml-sidebar-mask');
      mask.addEventListener('click', () => {
        this.close_();
      });
      this.getAmpDoc()
        .getBody()
        .appendChild(mask);
      mask.addEventListener('touchmove', e => {
        e.preventDefault();
      });
      this.setupGestures_(mask);
      this.maskElement_ = mask;
    }
    return this.maskElement_;
  }

  /**
   * @private
   * @return {!../../../src/service/history-impl.History}
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

AMP.extension('amp-sidebar', '0.2', AMP => {
  AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
});
