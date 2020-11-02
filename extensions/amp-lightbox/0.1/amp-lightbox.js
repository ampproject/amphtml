/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-lightbox-0.1.css';
import {Deferred} from '../../../src/utils/promise';
import {Gestures} from '../../../src/gesture';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  px,
  resetStyles,
  setImportantStyles,
  setStyle,
  setStyles,
  toggle,
} from '../../../src/style';
import {createCustomEvent} from '../../../src/event-helper';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, devAssert, user} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {htmlFor} from '../../../src/static-template';
import {isInFie} from '../../../src/iframe-helper';
import {toArray} from '../../../src/types';
import {tryFocus} from '../../../src/dom';

/** @const {string} */
const TAG = 'amp-lightbox';

/**  @enum {string} */
const LightboxEvents = {
  OPEN: 'lightboxOpen',
  CLOSE: 'lightboxClose',
};

/**
 * @typedef {{
 *   openStyle: !JsonObject,
 *   closedStyle: !JsonObject,
 *   durationSeconds: number,
 * }}
 */
let AnimationPresetDef;

/** @private @const {!Object<string, !AnimationPresetDef>} */
const AnimationPresets = {
  'fade-in': {
    openStyle: dict({'opacity': 1}),
    closedStyle: dict({'opacity': 0}),
    durationSeconds: 0.1,
  },
  'fly-in-bottom': {
    openStyle: dict({'transform': 'translate(0, 0)'}),
    closedStyle: dict({'transform': 'translate(0, 100%)'}),
    durationSeconds: 0.2,
  },
  'fly-in-top': {
    openStyle: dict({'transform': 'translate(0, 0)'}),
    closedStyle: dict({'transform': 'translate(0, -100%)'}),
    durationSeconds: 0.2,
  },
};

/** @private @const {string} */
const DEFAULT_ANIMATION = 'fade-in';

/**
 * @param {!Element} ctx
 * @return {!Element}
 */
function renderCloseButtonHeader(ctx) {
  return htmlFor(ctx)`
    <i-amphtml-ad-close-header role=button tabindex=0 aria-label="Close Ad">
      <div>Ad</div>
      <i-amphtml-ad-close-button class="amp-ad-close-button">
      </i-amphtml-ad-close-button>
    </i-amphtml-ad-close-header>`;
}

class AmpLightbox extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    /**  @private {?function(this:AmpLightbox, Event)}*/
    this.boundCloseOnEscape_ = null;

    /**  @private {?function(this:AmpLightbox, Event)}*/
    this.boundCloseOnEnter_ = null;

    /**  @private {?function(this:AmpLightbox)}*/
    this.boundFocusin_ = null;

    /**  @private {?function(this:AmpLightbox)}*/
    this.boundClose_ = null;

    /** @private {?Element} */
    this.openerElement_ = null;

    /** @private {boolean} */
    this.isScrollable_ = false;

    /** @private {number} */
    this.pos_ = 0;

    /** @private {number} */
    this.eventCounter_ = 0;

    /** @private {?number} */
    this.scrollTimerId_ = null;

    /** @private @const {string} */
    this.animationPreset_ = (
      element.getAttribute('animate-in') || DEFAULT_ANIMATION
    ).toLowerCase();

    /** @private {?Element} */
    this.closeButtonHeader_ = null;

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.closeButtonSR_ = null;

    const platform = Services.platformFor(this.win);

    /** @private @const {boolean} */
    this.isIos_ = platform.isIos();

    /** @const {function()} */
    this.boundReschedule_ = debounce(
      this.win,
      () => {
        const container = user().assertElement(
          this.container_,
          'E#19457 this.container_'
        );
        const owners = Services.ownersForDoc(this.element);
        owners.scheduleLayout(this.element, container);
        owners.scheduleResume(this.element, container);
      },
      500
    );
  }

  /** @override */
  buildCallback() {
    this.user().assert(
      hasOwn(AnimationPresets, this.animationPreset_),
      'Invalid `animate-in` value %s',
      this.animationPreset_
    );

    this.element.classList.add('i-amphtml-overlay');
    this.action_ = Services.actionServiceForDoc(this.element);
    this.maybeSetTransparentBody_();

    this.registerDefaultAction((i) => this.open_(i.trust, i.caller), 'open');
    this.registerAction('close', (i) => this.close(i.trust));
    /** If the element is in an email document, allow its `open` and `close` actions. */
    this.action_.addToAllowlist('AMP-LIGHTBOX', ['open', 'close'], ['email']);
  }

  /**
   * Takes ownership of all AMP element descendants.
   * @private
   */
  takeOwnershipOfDescendants_() {
    devAssert(this.isScrollable_);
    this.getComponentDescendants_().forEach((child) => {
      Services.ownersForDoc(this.element).setOwner(child, this.element);
    });
  }

  /**
   * Gets a list of all AMP element descendants.
   * @return {!Array<!Element>}
   * @private
   */
  getComponentDescendants_() {
    return toArray(this.element.getElementsByClassName('i-amphtml-element'));
  }

  /**
   * Lazily builds the lightbox DOM on the first open.
   * @private
   */
  initialize_() {
    if (this.container_) {
      return;
    }

    const {element} = this;

    this.isScrollable_ = element.hasAttribute('scrollable');

    const children = this.getRealChildren();

    this.container_ = element.ownerDocument.createElement('div');
    if (!this.isScrollable_) {
      this.applyFillContent(this.container_);
    }
    element.appendChild(this.container_);

    children.forEach((child) => {
      this.container_.appendChild(child);
    });

    // If scrollable, take ownership of existing children and all future
    // dynamically created children as well.
    if (this.isScrollable_) {
      this.takeOwnershipOfDescendants_();

      element.classList.add('i-amphtml-scrollable');

      element.addEventListener(AmpEvents.DOM_UPDATE, () => {
        this.takeOwnershipOfDescendants_();
      });

      element.addEventListener('scroll', this.scrollHandler_.bind(this));
    }

    if (!this.isScrollable_) {
      const gestures = Gestures.get(element);
      gestures.onGesture(SwipeXYRecognizer, () => {
        // Consume to block scroll events and side-swipe.
      });
    }

    this.maybeCreateCloseButtonHeader_();
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /**
   * @param {!ActionTrust} trust
   * @param {?Element} openerElement
   * @private
   */
  open_(trust, openerElement) {
    if (this.active_) {
      return;
    }
    this.initialize_();
    this.boundCloseOnEscape_ = /** @type {?function(this:AmpLightbox, Event)} */ (this.closeOnEscape_.bind(
      this
    ));
    this.document_.documentElement.addEventListener(
      'keydown',
      this.boundCloseOnEscape_
    );
    this.boundFocusin_ = /** @type {?function(this:AmpLightbox)} */ (this.onFocusin_.bind(
      this
    ));
    this.document_.documentElement.addEventListener(
      'focusin',
      this.boundFocusin_
    );

    if (openerElement) {
      this.openerElement_ = openerElement;
    }

    const {promise, resolve} = new Deferred();
    this.getViewport()
      .enterLightboxMode(this.element, promise)
      .then(() => this.finalizeOpen_(resolve, trust));
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const open = mutations['open'];
    if (open !== undefined) {
      // Mutations via AMP.setState() require default trust.
      if (open) {
        // This suppose that the element that trigered the open is where the focus currently is
        this.open_(ActionTrust.DEFAULT, document.activeElement);
      } else {
        this.close(ActionTrust.DEFAULT);
      }
    }
  }

  /**
   * Any child of the lightbox with the autofocus attribute should be focused
   * after the lightbox opens.
   * @private
   */
  handleAutofocus_() {
    const autofocusElement = this.container_.querySelector('[autofocus]');
    if (autofocusElement) {
      tryFocus(autofocusElement);
    }
  }

  /**
   * @param {!Function} callback Called when open animation completes.
   * @param {!ActionTrust} trust
   * @private
   */
  finalizeOpen_(callback, trust) {
    const {element} = this;

    const {
      durationSeconds,
      openStyle,
      closedStyle,
    } = this.getAnimationPresetDef_();

    const props = Object.keys(openStyle);

    const transition = props
      .map((p) => `${p} ${durationSeconds}s ease-in`)
      .join(',');

    this.eventCounter_++;

    if (this.isScrollable_) {
      setStyle(element, 'webkitOverflowScrolling', 'touch');
    }

    // This should be in a mutateElement block, but focus on iOS won't work
    // if triggered asynchronously inside a callback.
    setStyle(element, 'transition', transition);

    setStyles(element, assertDoesNotContainDisplay(closedStyle));
    toggle(element, true);

    this.mutateElement(() => {
      element./*OK*/ scrollTop = 0;
    });

    this.handleAutofocus_();

    // TODO (jridgewell): expose an API accomodating this per PR #14676
    this.mutateElement(() => {
      setStyles(element, assertDoesNotContainDisplay(openStyle));
    });

    const container = dev().assertElement(this.container_);
    if (this.isScrollable_) {
      this.scrollHandler_();
    }

    const onAnimationEnd = () => {
      this.boundReschedule_();
      callback();
    };
    element.addEventListener('transitionend', onAnimationEnd);
    element.addEventListener('animationend', onAnimationEnd);

    // TODO: instead of laying out children all at once, layout children based
    // on visibility.
    const owners = Services.ownersForDoc(this.element);
    owners.scheduleLayout(this.element, container);
    owners.scheduleResume(this.element, container);
    this.triggerEvent_(LightboxEvents.OPEN, trust);

    this.getHistory_()
      .push(this.close.bind(this))
      .then((historyId) => {
        this.historyId_ = historyId;
      });

    this.maybeRenderCloseButtonHeader_();
    this.focusInModal_();
    this.tieCloseButton_();

    this.active_ = true;
  }

  /**
   * Creates a top bar with close button if the attribute close-button is set. For ads
   * @private
   */
  maybeCreateCloseButtonHeader_() {
    const {element} = this;
    if (element.getAttribute('close-button') == null) {
      return;
    }

    this.closeButtonHeader_ = renderCloseButtonHeader(element);
    element.insertBefore(this.closeButtonHeader_, this.container_);
  }

  /**
   * Renders close button header. For ads
   * @private
   */
  maybeRenderCloseButtonHeader_() {
    if (!this.closeButtonHeader_) {
      return;
    }

    // click event doesn't work with enter on i-amphtml-ad-close-header
    this.boundCloseOnEnter_ = /** @type {?function(this:AmpLightbox, Event)} */ (this.closeOnEnter_.bind(
      this
    ));
    this.closeButtonHeader_.addEventListener(
      'keydown',
      this.boundCloseOnEnter_
    );

    let headerHeight;
    this.measureMutateElement(
      () => {
        headerHeight = this.closeButtonHeader_./*OK*/ getBoundingClientRect()
          .height;
      },
      () => {
        // Done in vsync in order to apply transition.
        this.showCloseButtonHeader_();

        setImportantStyles(dev().assertElement(this.container_), {
          'margin-top': px(headerHeight),
          'min-height': `calc(100vh - ${px(headerHeight)})`,
        });
      }
    );
  }

  /**
   * Show close button header
   * @private
   */
  showCloseButtonHeader_() {
    this.closeButtonHeader_.classList.add('amp-ad-close-header');
  }

  /**
   * Add close button event listener to button we created
   * @private
   */
  tieCloseButton_() {
    if (!this.closeButtonSR_ && !this.closeButtonHeader_) {
      return;
    }
    this.boundClose_ = /** @type {?function(this:AmpLightbox)} */ (this.closeOnClick_.bind(
      this
    ));
    this.closeButton_.addEventListener('click', this.boundClose_);
  }

  /**
   * Remove listeners from close button we created
   * @private
   */
  untieCloseButton_() {
    if (!this.closeButtonSR_ && !this.closeButtonHeader_) {
      return;
    }

    this.closeButton_.removeEventListener('click', this.boundClose_);
    this.boundClose_ = null;

    if (!this.closeButtonHeader_) {
      return;
    }
    this.closeButtonHeader_.removeEventListener(
      'keydown',
      this.boundCloseOnEnter_
    );
    this.boundCloseOnEnter_ = null;
  }

  /**
   * @private
   * @return {!AnimationPresetDef}
   */
  getAnimationPresetDef_() {
    return AnimationPresets[this.animationPreset_];
  }

  /**
   * Handles closing the lightbox when close is clicked.
   * @private
   */
  closeOnClick_() {
    this.close(ActionTrust.HIGH);
  }

  /**
   * Handles closing the lightbox when the ESC key is pressed.
   * @param {!Event} event
   * @private
   */
  closeOnEscape_(event) {
    if (event.key == Keys.ESCAPE) {
      event.preventDefault();
      // Keypress gesture is high trust.
      this.close(ActionTrust.HIGH);
    }
  }

  /**
   * Handles closing the lightbox when the enter key is pressed.
   * Need it for i-amphtml-ad-close-header
   * @param {!Event} event
   * @private
   */
  closeOnEnter_(event) {
    if (event.key == Keys.ENTER) {
      event.preventDefault();
      // Keypress gesture is high trust.
      this.close(ActionTrust.HIGH);
    }
  }

  /**
   * Closes the lightbox.
   *
   * @param {!ActionTrust} trust
   */
  close(trust) {
    if (!this.active_) {
      return;
    }
    if (this.isScrollable_) {
      setStyle(this.element, 'webkitOverflowScrolling', '');
    }

    this.getViewport()
      .leaveLightboxMode(this.element)
      .then(() => this.finalizeClose_(trust));
  }

  /**
   * Clean up when closing lightbox.
   *
   * @param {!ActionTrust} trust
   * @private
   */
  finalizeClose_(trust) {
    const {element} = this;
    const event = ++this.eventCounter_;

    const collapseAndReschedule = () => {
      // Don't collapse on transitionend if there was a subsequent event.
      if (event != this.eventCounter_) {
        return;
      }
      this./*OK*/ collapse();
      this.boundReschedule_();
    };

    // Disable transition for ads since the frame gets immediately collapsed.
    if (this.isInAd_()) {
      resetStyles(element, ['transition']);
      collapseAndReschedule();
    } else {
      element.addEventListener('transitionend', collapseAndReschedule);
      element.addEventListener('animationend', collapseAndReschedule);
    }

    setStyles(
      element,
      assertDoesNotContainDisplay(this.getAnimationPresetDef_().closedStyle)
    );

    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.document_.documentElement.removeEventListener(
      'keydown',
      this.boundCloseOnEscape_
    );
    this.boundCloseOnEscape_ = null;

    this.document_.documentElement.removeEventListener(
      'focusin',
      this.boundFocusin_
    );
    this.boundFocusin_ = null;

    this.untieCloseButton_();

    Services.ownersForDoc(this.element).schedulePause(
      this.element,
      dev().assertElement(this.container_)
    );
    this.active_ = false;
    this.triggerEvent_(LightboxEvents.CLOSE, trust);

    if (this.openerElement_) {
      tryFocus(this.openerElement_);
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  isInAd_() {
    return getMode(this.win).runtime == 'inabox' || isInFie(this.element);
  }

  /**
   * Verify if focus is still inside the lightbox.
   * @return {boolean}
   * @private
   */
  hasCurrentFocus_() {
    const {element} = this;
    if (element.contains(document.activeElement)) {
      return true;
    }
    return false;
  }

  /**
   * Handles closing the lightbox if focus is outside.
   * @private
   */
  onFocusin_() {
    if (!this.hasCurrentFocus_()) {
      this.close(ActionTrust.HIGH);
    }
  }

  /**
   * Focus in the lightbox if it's not yet.
   * @private
   */
  focusInModal_() {
    if (!this.hasCurrentFocus_()) {
      this.closeButton_ = this.getExistingCloseButton_();

      // If we do not have a close button provided by the page author, create one
      // at the start of the lightbox visible only for screen readers.
      if (!this.closeButton_) {
        this.closeButtonSR_ = this.createScreenReaderCloseButton_();
        this.element.insertBefore(this.closeButtonSR_, this.element.firstChild);
        this.closeButton_ = this.closeButtonSR_;
      }

      tryFocus(this.closeButton_);
    }
  }

  /**
   * Gets a close button, provided by the page author, if one exists.
   * @return {?Element} The close button.
   * @private
   */
  getExistingCloseButton_() {
    if (this.closeButton_) {
      return this.closeButton_;
    }
    if (this.closeButtonHeader_) {
      return this.closeButtonHeader_;
    }
    const {element} = this;
    const candidates = element.querySelectorAll('[on]');

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const hasAction = this.action_.hasResolvableActionForTarget(
        candidate,
        'tap',
        element,
        devAssert(candidate.parentElement)
      );

      if (hasAction) {
        return candidate;
      }
    }
  }

  /**
   * Creates an "invisible" close button for screen readers
   * @return {!Element} The close button.
   * @private
   */
  createScreenReaderCloseButton_() {
    const {element} = this;

    // Replacement label for invisible close button set value
    const ariaLabel =
      element.getAttribute('data-close-button-aria-label') || 'Close the modal';

    // Invisible close button
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

    return screenReaderCloseButton;
  }

  /**
   * Handles scroll on the amp-lightbox.
   * The scroll throttling and visibility calculation is similar to
   * the implementation in scrollable-carousel
   * @private
   */
  scrollHandler_() {
    const currentScrollTop = this.element./*OK*/ scrollTop;

    if (this.isIos_) {
      // To avoid scroll-freeze issues in iOS, prevent reaching top/bottom
      if (currentScrollTop == 0) {
        this.element./*OK*/ scrollTop = 1;
      } else if (
        this.element./*OK*/ scrollHeight ==
        currentScrollTop + this.element./*OK*/ offsetHeight
      ) {
        this.element./*OK*/ scrollTop = currentScrollTop - 1;
      }
    }

    this.pos_ = currentScrollTop;

    if (this.scrollTimerId_ === null) {
      this.waitForScroll_(currentScrollTop);
    }
  }

  /**
   * Throttle scrolling events and update the lightbox
   * when scrolling slowly or when the scrolling ends.
   * @param {number} startingScrollTop
   * @private
   */
  waitForScroll_(startingScrollTop) {
    this.scrollTimerId_ = /** @type {number} */ (Services.timerFor(
      this.win
    ).delay(() => {
      if (Math.abs(startingScrollTop - this.pos_) < 30) {
        dev().fine(
          TAG,
          'slow scrolling: %s - %s',
          startingScrollTop,
          this.pos_
        );
        this.scrollTimerId_ = null;
        this.update_(this.pos_);
      } else {
        dev().fine(
          TAG,
          'fast scrolling: %s - %s',
          startingScrollTop,
          this.pos_
        );
        this.waitForScroll_(this.pos_);
      }
    }, 100));
  }

  /**
   * Update the inViewport status given current position.
   * @param {number} pos
   * @private
   */
  update_(pos) {
    dev().fine(TAG, 'update_');
    this.oldPos_ = pos;
    this.pos_ = pos;
  }

  /**
   * Returns the history for the ampdoc.
   *
   * @return {!../../../src/service/history-impl.History}
   */
  getHistory_() {
    return Services.historyForDoc(this.getAmpDoc());
  }

  /**
   * Sets the document body to transparent to allow for frame "merging" if the
   * element is under FIE.
   * The module-level execution of setTransparentBody() only works on inabox,
   * so we need to perform the check on element build time as well.
   * @private
   */
  maybeSetTransparentBody_() {
    const {win, element} = this;
    if (!isInFie(element)) {
      return;
    }
    const body = dev().assertElement(win.document.body);
    setTransparentBody(win, /** @type {!HTMLBodyElement} */ (body));
  }

  /**
   * Triggeres event to window.
   *
   * @param {string} name
   * @param {!ActionTrust} trust
   * @private
   */
  triggerEvent_(name, trust) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, trust);
  }
}

/**
 * Sets the document body to transparent to allow for frame "merging".
 * @param {!Window} win
 * @param {!HTMLBodyElement} body
 * @private
 */
function setTransparentBody(win, body) {
  const state = {};
  const ampdoc = Services.ampdocServiceFor(win).getAmpDoc(body);

  Services.mutatorForDoc(ampdoc).measureMutateElement(
    body,
    function measure() {
      state.alreadyTransparent =
        computedStyle(win, body)['background-color'] == 'rgba(0, 0, 0, 0)';
    },
    function mutate() {
      if (!state.alreadyTransparent && !getMode().test) {
        // TODO(alanorozco): Create documentation page and link it here once
        // the A4A lightbox experiment is turned on.
        user().warn(
          TAG,
          'The background of the <body> element has been forced to ' +
            'transparent. If you need to set background, use an ' +
            'intermediate container.'
        );
      }

      // set as !important regardless to prevent changes
      setImportantStyles(body, {background: 'transparent'});
    }
  );
}

AMP.extension(TAG, '0.1', (AMP) => {
  // TODO(alanorozco): refactor this somehow so we don't need to do a direct
  // getMode check
  if (getMode().runtime == 'inabox') {
    setTransparentBody(
      window,
      /** @type {!HTMLBodyElement} */ (devAssert(document.body))
    );
  }

  AMP.registerElement(TAG, AmpLightbox, CSS);
});
