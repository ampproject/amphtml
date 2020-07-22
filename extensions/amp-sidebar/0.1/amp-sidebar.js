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
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-sidebar-0.1.css';
import {Direction, Orientation, SwipeToDismiss} from './swipe-to-dismiss';
import {Gestures} from '../../../src/gesture';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {SwipeDef, SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {Toolbar} from './toolbar';
import {
  closestAncestorElementBySelector,
  isRTL,
  tryFocus,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {descendsFromStory} from '../../../src/utils/story';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {handleAutoscroll} from './autoscroll';
import {isExperimentOn} from '../../../src/experiments';
import {removeFragment} from '../../../src/url';
import {setModalAsClosed, setModalAsOpen} from '../../../src/modal';
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
 * Source for value: https://github.com/WebKit/webkit/blob/5b431bdc276d45bc956b222666beaca44813444f/Source/WebInspectorUI/UserInterface/Views/Toolbar.css
 */
/** @private @const {string} */
const IOS_SAFARI_BOTTOMBAR_HEIGHT = '54px';

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
    this.isIos_ = platform.isIos();

    /** @private @const {boolean} */
    this.isSafari_ = platform.isSafari();

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.bottomBarCompensated_ = false;

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.openerElement_ = null;

    /** @private {number} */
    this.initialScrollTop_ = 0;

    /** @private {boolean} */
    this.opened_ = false;

    /** @private {?Element} */
    this.nestedMenu_ = null;

    /** @private @const */
    this.swipeToDismiss_ = new SwipeToDismiss(
      this.win,
      (cb) => this.mutateElement(cb),
      // The sidebar is already animated by swipe to dismiss, so skip animation.
      () => this.dismiss_(/*skipAnimation*/ true, ActionTrust.HIGH)
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

    if (
      this.element.parentNode != this.element.ownerDocument.body &&
      this.element.parentNode != this.getAmpDoc().getBody()
    ) {
      this.user().warn(
        TAG,
        `${TAG} is recommended to be a direct child of the <body> element to preserve a logical DOM order.`
      );
    }

    if (this.side_ != Side.LEFT && this.side_ != Side.RIGHT) {
      this.side_ = this.setSideAttribute_(
        isRTL(this.document_) ? Side.RIGHT : Side.LEFT
      );
      element.setAttribute('side', this.side_);
    }

    this.maybeBuildNestedMenu_();
    // Nested menu may not be present during buildCallback if it is rendered
    // dynamically with amp-list, in which case listen for dom update.
    element.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.maybeBuildNestedMenu_();
    });

    // Get the toolbar attribute from the child navs.
    this.getAmpDoc()
      .whenReady()
      .then(() => {
        const toolbarElements = toArray(
          element.querySelectorAll('nav[toolbar]')
        );
        toolbarElements.forEach((toolbarElement) => {
          try {
            this.toolbars_.push(new Toolbar(toolbarElement, this));
          } catch (e) {
            this.user().error(TAG, 'Failed to instantiate toolbar', e);
          }
        });
      });

    if (this.isIos_) {
      this.fixIosElasticScrollLeak_();
    }

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'menu');
    }
    // Make sidebar programmatically focusable and focus on `open` for a11y.
    element.tabIndex = -1;

    this.documentElement_.addEventListener('keydown', (event) => {
      // Close sidebar on ESC.
      if (event.key == Keys.ESCAPE) {
        // Keypress is high trust.
        if (this.close_(ActionTrust.HIGH)) {
          event.preventDefault();
        }
      }
    });

    this.closeButton_ = this.getExistingCloseButton_();

    // If we do not have a close button provided by the page author, create one
    // at the start of the sidebar for screen readers.
    if (!this.closeButton_) {
      this.closeButton_ = this.createScreenReaderCloseButton();
      element.insertBefore(this.closeButton_, this.element.firstChild);
    }
    // always create a close button at the end of the sidebar for screen
    // readers.
    element.appendChild(this.createScreenReaderCloseButton());

    this.registerDefaultAction((invocation) => {
      const {trust, caller} = invocation;
      this.open_(trust, caller);
    }, 'open');
    this.registerAction('close', (invocation) => {
      this.close_(invocation.trust);
    });
    this.registerAction('toggle', (invocation) => {
      const {trust, caller} = invocation;
      if (this.opened_) {
        this.close_(trust);
      } else {
        this.open_(trust, caller);
      }
    });
    /** If the element is in an email document,
     * allow its `open`, `close`, and `toggle` actions. */
    this.action_.addToAllowlist(
      'amp-sidebar',
      ['open', 'close', 'toggle'],
      ['email']
    );

    element.addEventListener(
      'click',
      (e) => {
        const target = closestAncestorElementBySelector(
          dev().assertElement(e.target),
          'A'
        );
        if (target && target.href) {
          const tgtLoc = Services.urlForDoc(element).parse(target.href);
          const currentHref = this.getAmpDoc().getUrl();
          // Important: Only close sidebar (and hence pop sidebar history entry)
          // when navigating locally, Chrome might cancel navigation request
          // due to after-navigation history manipulation inside a timer callback.
          // See this issue for more details:
          // https://github.com/ampproject/amphtml/issues/6585
          if (removeFragment(target.href) != removeFragment(currentHref)) {
            return;
          }
          if (tgtLoc.hash) {
            // Click gesture is high trust.
            this.close_(ActionTrust.HIGH);
          }
        }
      },
      true
    );

    this.setupGestures_(this.element);
  }

  /**
   * Loads the extension for nested menu if sidebar contains one and it
   * has not been installed already.
   */
  maybeBuildNestedMenu_() {
    if (this.nestedMenu_) {
      return;
    }
    const nestedMenu = this.element.querySelector('amp-nested-menu');
    if (nestedMenu) {
      Services.extensionsFor(this.win).installExtensionForDoc(
        this.getAmpDoc(),
        'amp-nested-menu'
      );
      this.nestedMenu_ = nestedMenu;
    }
  }

  /**
   * Gets a close button, provided by the page author, if one exists.
   * @return {?Element} The close button.
   */
  getExistingCloseButton_() {
    const candidates = this.element.querySelectorAll('[on]');

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const hasAction = this.action_.hasResolvableActionForTarget(
        candidate,
        'tap',
        this.element,
        devAssert(candidate.parentElement)
      );
      const inToolbar = closestAncestorElementBySelector(
        candidate,
        '[toolbar]'
      );

      if (hasAction && !inToolbar) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Creates an "invisible" close button for screen readers to close the
   * sidebar.
   * @return {!Element}
   */
  createScreenReaderCloseButton() {
    // Replacement label for invisible close button set value in amp sidebar
    const ariaLabel =
      this.element.getAttribute('data-close-button-aria-label') ||
      'Close the sidebar';

    // Invisible close button at the end of sidebar for screen-readers.
    const screenReaderCloseButton = this.document_.createElement('button');

    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');
    // This is for screen-readers only, should not get a tab stop. Note that
    // screen readers can still swipe / navigate to this element, it just will
    // not be reachable via the tab button. Note that for desktop, hitting esc
    // to close is also an option.
    // We do not want this in the tab order since it is not really "visible"
    // and would be confusing to tab to if not using a screen reader.
    screenReaderCloseButton.tabIndex = -1;
    screenReaderCloseButton.addEventListener('click', () => {
      // Click gesture is high trust.
      this.close_(ActionTrust.HIGH);
    });

    return screenReaderCloseButton;
  }

  /** @override */
  onLayoutMeasure() {
    this.getAmpDoc()
      .whenReady()
      .then(() => {
        // Check our toolbars for changes
        this.toolbars_.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
      });
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
   * @param {!ActionTrust} trust
   */
  updateForOpening_(trust) {
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
    this.setUpdateFn_(() => this.updateForOpened_(trust), ANIMATION_TIMEOUT);
    handleAutoscroll(this.getAmpDoc(), this.element);
  }

  /**
   * Updates the sidebar for when it has finished opening.
   * @param {!ActionTrust} trust
   * @private
   */
  updateForOpened_(trust) {
    // On open sidebar
    const children = this.getRealChildren();
    const owners = Services.ownersForDoc(this.element);
    owners.scheduleLayout(this.element, children);
    owners.scheduleResume(this.element, children);
    // As of iOS 12.2, focus() causes undesired scrolling in UIWebViews.
    if (!this.isIosWebView_()) {
      // For iOS, we cannot focus the Element itself, since VoiceOver will not
      // move screen reader focus over (if there is more than one Text Node in)
      // the sidebar. For Android, focus the sidebar itself is not a very good
      // experience, so we also just focus the first close button.
      tryFocus(devAssert(this.closeButton_));
    }
    this.triggerEvent_(SidebarEvents.OPEN, trust);
    this.element.setAttribute('i-amphtml-sidebar-opened', '');
    this.getMaskElement_().setAttribute('i-amphtml-sidebar-opened', '');
  }

  /**
   * Updates the sidebar for when it is animating to the closed state.
   * @param {boolean} immediate
   * @param {!ActionTrust} trust
   * @private
   */
  updateForClosing_(immediate, trust) {
    this.getMaskElement_().removeAttribute('open');
    this.getMaskElement_().removeAttribute('i-amphtml-sidebar-opened');
    this.mutateElement(() => {
      setModalAsClosed(this.element);
    });
    this.element.removeAttribute('open');
    this.element.removeAttribute('i-amphtml-sidebar-opened');
    this.setUpdateFn_(
      () => this.updateForClosed_(trust),
      immediate ? 0 : ANIMATION_TIMEOUT
    );
  }

  /**
   * Updates the sidebar for when it has finished closing.
   * @param {!ActionTrust} trust
   * @private
   */
  updateForClosed_(trust) {
    toggle(this.element, /* display */ false);
    toggle(this.getMaskElement_(), /* display */ false);
    Services.ownersForDoc(this.element).schedulePause(
      this.element,
      this.getRealChildren()
    );
    this.triggerEvent_(SidebarEvents.CLOSE, trust);
  }

  /**
   * Reveals the sidebar.
   * @param {!ActionTrust} trust
   * @param {?Element} openerElement
   * @private
   */
  open_(trust, openerElement) {
    if (this.opened_) {
      return;
    }
    this.opened_ = true;
    this.viewport_.enterOverlayMode();
    this.setUpdateFn_(() => this.updateForOpening_(trust));
    this.getHistory_()
      .push(() => {
        // In iOS, close on back without animation due to swipe-to-go-back
        if (this.isIos_) {
          this.dismiss_(/*skipAnimation*/ true, trust);
        } else {
          this.close_(trust);
        }
      })
      .then((historyId) => {
        this.historyId_ = historyId;
      });

    if (openerElement) {
      this.openerElement_ = openerElement;
      this.initialScrollTop_ = this.viewport_.getScrollTop();
    }
  }

  /**
   * Hides the sidebar.
   * @param {!ActionTrust} trust
   * @return {boolean} Whether the sidebar actually transitioned from "visible"
   *     to "hidden".
   * @private
   */
  close_(trust) {
    return this.dismiss_(/*skipAnimation*/ false, trust);
  }

  /**
   * Dismisses the sidebar.
   * @param {boolean} skipAnimation Whether sidebar should close immediately,
   *  skipping animation.
   * @param {!ActionTrust} trust
   * @return {boolean} Whether the sidebar actually transitioned from "visible"
   *     to "hidden".
   * @private
   */
  dismiss_(skipAnimation, trust) {
    if (!this.opened_) {
      return false;
    }
    this.opened_ = false;
    this.viewport_.leaveOverlayMode();
    const scrollDidNotChange =
      this.initialScrollTop_ == this.viewport_.getScrollTop();
    const sidebarIsActive = this.element.contains(this.document_.activeElement);
    this.setUpdateFn_(() => this.updateForClosing_(skipAnimation, trust));
    // Immediately hide the sidebar so that animation does not play.
    if (skipAnimation) {
      toggle(this.element, /* display */ false);
      toggle(this.getMaskElement_(), /* display */ false);
    }
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
      this.historyId_ = -1;
    }
    if (this.openerElement_ && sidebarIsActive && scrollDidNotChange) {
      // As of iOS 12.2, focus() causes undesired scrolling in UIWebViews.
      if (!this.isIosWebView_()) {
        tryFocus(this.openerElement_);
      }
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
    gestures.onGesture(SwipeXRecognizer, (e) => {
      const {data} = e;
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
        // Click gesture is high trust.
        this.close_(ActionTrust.HIGH);
      });
      this.getAmpDoc().getBody().appendChild(mask);
      mask.addEventListener('touchmove', (e) => {
        e.preventDefault();
      });
      this.setupGestures_(mask);
      this.maskElement_ = mask;
    }
    return this.maskElement_;
  }

  /**
   * @private
   */
  fixIosElasticScrollLeak_() {
    this.element.addEventListener('scroll', (e) => {
      if (this.opened_) {
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
   * @private
   * @return {!../../../src/service/history-impl.History}
   */
  getHistory_() {
    return Services.historyForDoc(this.getAmpDoc());
  }

  /**
   * @param {string} name
   * @param {!ActionTrust} trust
   * @private
   */
  triggerEvent_(name, trust) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, trust);
  }

  /**
   * @return {boolean}
   * @private
   */
  isIosWebView_() {
    // Don't use isWebviewEmbedded() because it assumes there's no parent
    // iframe, but this is not necessarily true for all UIWebView embeds.
    return this.isIos_ && Services.viewerForDoc(this.element).isEmbedded();
  }
}

AMP.extension('amp-sidebar', '0.1', (AMP) => {
  AMP.registerElement('amp-sidebar', AmpSidebar, CSS);
});
