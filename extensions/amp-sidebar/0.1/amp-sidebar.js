import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Keys_Enum} from '#core/constants/key-codes';
import {isRTL, tryFocus} from '#core/dom';
import {
  observeContentSize,
  unobserveContentSize,
} from '#core/dom/layout/size-observer';
import {setModalAsClosed, setModalAsOpen} from '#core/dom/modal';
import {
  closestAncestorElementBySelector,
  realChildElements,
} from '#core/dom/query';
import {unmountAll} from '#core/dom/resource-container-helper';
import {setStyles, toggle} from '#core/dom/style';
import {toArray} from '#core/types/array';
import {debounce} from '#core/types/function';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';
import {descendsFromStory} from '#utils/story';

import {handleAutoscroll} from './autoscroll';
import {Direction, Orientation, SwipeToDismiss} from './swipe-to-dismiss';
import {Toolbar} from './toolbar';

import {CSS} from '../../../build/amp-sidebar-0.1.css';
import {Gestures} from '../../../src/gesture';
import {SwipeDef, SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {removeFragment} from '../../../src/url';

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
      () => this.dismiss_(/*skipAnimation*/ true, ActionTrust_Enum.HIGH)
    );

    /** @private {boolean} */
    this.currentSwipeForThisElement_ = false;

    /** @private {boolean} */
    this.disableSwipeClose_ = false;

    this.onResized_ = this.onResized_.bind(this);

    /** @private {?UnlistenDef} */
    this.onViewportResizeUnlisten_ = null;
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    element.classList.add('i-amphtml-overlay');
    element.classList.add('i-amphtml-scrollable');

    this.side_ = element.getAttribute('side');

    this.disableSwipeClose_ = element.hasAttribute('data-disable-swipe-close');

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
    element.addEventListener(AmpEvents_Enum.DOM_UPDATE, () => {
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
        this.onResized_();
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
      if (event.key == Keys_Enum.ESCAPE) {
        // Keypress is high trust.
        if (this.close_(ActionTrust_Enum.HIGH)) {
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
      const {caller, trust} = invocation;
      this.open_(trust, caller);
    }, 'open');
    this.registerAction('close', (invocation) => {
      this.close_(invocation.trust);
    });
    this.registerAction('toggle', (invocation) => {
      const {caller, trust} = invocation;
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
            this.close_(ActionTrust_Enum.HIGH);
          }
        }
      },
      true
    );

    this.setupGestures_(this.element);
  }

  /** @override */
  attachedCallback() {
    this.onViewportResizeUnlisten_ = this.viewport_.onResize(
      debounce(this.win, this.onResized_, 100)
    );
    this.onResized_();
  }

  /** @override */
  detachedCallback() {
    if (this.onViewportResizeUnlisten_) {
      this.onViewportResizeUnlisten_();
      this.onViewportResizeUnlisten_ = null;
    }
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
      this.close_(ActionTrust_Enum.HIGH);
    });

    return screenReaderCloseButton;
  }

  /** @private */
  onResized_() {
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
   * @param {!ActionTrust_Enum} trust
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
   * @param {!ActionTrust_Enum} trust
   * @private
   */
  updateForOpened_(trust) {
    // On open sidebar
    const children = realChildElements(this.element);
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

    // Set as a container for scheduler to load children elements.
    this.setAsContainer();
  }

  /**
   * Updates the sidebar for when it is animating to the closed state.
   * @param {boolean} immediate
   * @param {!ActionTrust_Enum} trust
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
   * @param {!ActionTrust_Enum} trust
   * @private
   */
  updateForClosed_(trust) {
    toggle(this.element, /* display */ false);
    toggle(this.getMaskElement_(), /* display */ false);
    Services.ownersForDoc(this.element).schedulePause(
      this.element,
      realChildElements(this.element)
    );
    this.triggerEvent_(SidebarEvents.CLOSE, trust);

    // Undo `setAsContainer`.
    this.removeAsContainer();

    // Unmount all children when the sidebar is closed. They will automatically
    // remount when the sidebar is opened again.
    unmountAll(this.element, /* includeSelf */ false);
  }

  /**
   * Reveals the sidebar.
   * @param {!ActionTrust_Enum} trust
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

    observeContentSize(this.element, this.onResized_);
  }

  /**
   * Hides the sidebar.
   * @param {!ActionTrust_Enum} trust
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
   * @param {!ActionTrust_Enum} trust
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
    unobserveContentSize(this.element, this.onResized_);
    return true;
  }

  /**
   * Set up gestures for the specified element.
   * @param {!Element} element
   * @private
   */
  setupGestures_(element) {
    if (this.disableSwipeClose_) {
      return;
    }
    // stop propagation of swipe event inside amp-viewer
    const gestures = Gestures.get(
      dev().assertElement(element),
      /* shouldNotPreventDefault */ true,
      /* shouldStopPropagation */ true
    );
    // The onGesture method has a recognizer and a handler argument
    // The handler takes a gesture object as an argument which
    // includes data and event properties
    gestures.onGesture(SwipeXRecognizer, (gesture) => {
      const {data, event} = gesture;
      this.handleSwipe_(data, event);
    });
  }

  /**
   * Handles a swipe gesture, updating the current swipe to dismiss state.
   * @param {!SwipeDef} data
   * @param {Event|undefined} event
   */
  handleSwipe_(data, event) {
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
      this.currentSwipeForThisElement_ && this.swipeToDismiss_.endSwipe(data);
      this.currentSwipeForThisElement_ = false;
      return;
    }

    if (event && event.target && !excludeFromSwipeClose(event.target)) {
      this.currentSwipeForThisElement_ = true;
      this.swipeToDismiss_.swipeMove(data);
    }
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
      mask.classList.add('amp-sidebar-mask', 'i-amphtml-sidebar-mask');
      mask.addEventListener('click', () => {
        // Click gesture is high trust.
        this.close_(ActionTrust_Enum.HIGH);
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
   * @param {!ActionTrust_Enum} trust
   * @private
   */
  triggerEvent_(name, trust) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {});
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

/**
 * @param {!Element} element
 * @return {boolean}
 */
function excludeFromSwipeClose(element) {
  return (
    element.nodeName.toLowerCase() === 'input' &&
    element.getAttribute('type') === 'range'
  );
}
