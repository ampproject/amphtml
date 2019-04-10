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
import {createCustomEvent, listenOnce} from '../../../src/event-helper';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, devAssert, user} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {htmlFor} from '../../../src/static-template';
import {isInFie} from '../../../src/friendly-iframe-embed';
import {removeElement, tryFocus} from '../../../src/dom';
import {toArray} from '../../../src/types';

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

/**
 * @param {!Element} header
 */
function showCloseButtonHeader(header) {
  header.classList.add('amp-ad-close-header');
}

class AmpLightbox extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?{width: number, height: number}} */
    this.size_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    /**  @private {?function(this:AmpLightbox, Event)}*/
    this.boundCloseOnEscape_ = null;

    /** @private {boolean} */
    this.isScrollable_ = false;

    /** @private {number} */
    this.pos_ = 0;

    /** @private {number} */
    this.oldPos_ = 0;

    /** @private {number} */
    this.eventCounter_ = 0;

    /** @private {?number} */
    this.scrollTimerId_ = null;

    /** @private @const {string} */
    this.animationPreset_ =
        (element.getAttribute('animate-in') || DEFAULT_ANIMATION).toLowerCase();

    /** @private {?Element} */
    this.closeButtonHeader_ = null;

    /** @const {function()} */
    this.boundReschedule_ = debounce(this.win, () => {
      const container = user().assertElement(this.container_,
          'E#19457 this.container_');
      this.scheduleLayout(container);
      this.scheduleResume(container);
    }, 500);
  }

  /** @override */
  buildCallback() {
    this.user().assert(
        hasOwn(AnimationPresets, this.animationPreset_),
        'Invalid `animate-in` value %s',
        this.animationPreset_);

    this.element.classList.add('i-amphtml-overlay');
    this.action_ = Services.actionServiceForDoc(this.element);
    this.maybeSetTransparentBody_();

    this.registerDefaultAction(
        unused => this.open_(),
        'open');
    this.registerAction('close', this.close.bind(this));
  }

  /**
   * Takes ownership of all AMP element descendants.
   * @private
   */
  takeOwnershipOfDescendants_() {
    devAssert(this.isScrollable_);
    this.getComponentDescendants_().forEach(child => {
      this.setAsOwner(child);
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

    children.forEach(child => {
      this.container_.appendChild(child);
    });

    // If scrollable, take ownership of existing children and all future
    // dynamically created children as well.
    if (this.isScrollable_) {
      this.takeOwnershipOfDescendants_();

      element.classList.add('i-amphtml-scrollable');

      element.addEventListener(AmpEvents.DOM_UPDATE, () => {
        this.takeOwnershipOfDescendants_();
        this.updateChildrenInViewport_(this.pos_, this.pos_);
      });

      element.addEventListener('scroll', this.scrollHandler_.bind(this));
    }

    if (!this.isScrollable_) {
      const gestures = Gestures.get(element);
      gestures.onGesture(SwipeXYRecognizer, () => {
        // Consume to block scroll events and side-swipe.
      });
    }
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /**
   * @private
   */
  open_() {
    if (this.active_) {
      return;
    }
    this.initialize_();
    this.boundCloseOnEscape_ =
      /** @type {?function(this:AmpLightbox, Event)} */ (
        this.closeOnEscape_.bind(this));
    this.win.document.documentElement.addEventListener(
        'keydown', this.boundCloseOnEscape_);

    const {promise, resolve} = new Deferred();
    this.getViewport().enterLightboxMode(this.element, promise)
        .then(() => this.finalizeOpen_(resolve));
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const open = mutations['open'];
    if (open !== undefined) {
      if (open) {
        this.open_();
      } else {
        this.close();
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
   * @private
   */
  finalizeOpen_(callback) {
    const {element} = this;

    const {durationSeconds, openStyle, closedStyle} =
        this.getAnimationPresetDef_();

    const props = Object.keys(openStyle);

    const transition =
        props.map(p => `${p} ${durationSeconds}s ease-in`).join(',');

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
      element./*OK*/scrollTop = 0;
    });

    this.handleAutofocus_();
    this.maybeRenderCloseButtonHeader_();

    // TODO (jridgewell): expose an API accomodating this per PR #14676
    this.mutateElement(() => {
      setStyles(element, assertDoesNotContainDisplay(openStyle));
    });

    const container = dev().assertElement(this.container_);
    if (!this.isScrollable_) {
      this.updateInViewport(container, true);
    } else {
      this.scrollHandler_();
      this.updateChildrenInViewport_(this.pos_, this.pos_);
    }

    const onAnimationEnd = () => {
      this.boundReschedule_();
      callback();
    };
    element.addEventListener('transitionend', onAnimationEnd);
    element.addEventListener('animationend', onAnimationEnd);

    // TODO: instead of laying out children all at once, layout children based
    // on visibility.
    this.scheduleLayout(container);
    this.scheduleResume(container);
    this.triggerEvent_(LightboxEvents.OPEN);

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });

    this.active_ = true;
  }

  /** @private */
  maybeRenderCloseButtonHeader_() {
    const {element} = this;

    if (element.getAttribute('close-button') == null) {
      return;
    }

    const header = renderCloseButtonHeader(element);

    this.closeButtonHeader_ = header;

    listenOnce(header, 'click', () => this.close());

    element.insertBefore(header, this.container_);

    let headerHeight;

    this.measureMutateElement(() => {
      headerHeight = header./*OK*/getBoundingClientRect().height;
    }, () => {
      // Done in vsync in order to apply transition.
      showCloseButtonHeader(header);

      setImportantStyles(dev().assertElement(this.container_), {
        'margin-top': px(headerHeight),
        'min-height': `calc(100vh - ${px(headerHeight)})`,
      });
    });
  }

  /**
   * @private
   * @return {!AnimationPresetDef}
   */
  getAnimationPresetDef_() {
    return AnimationPresets[this.animationPreset_];
  }

  /**
   * Handles closing the lightbox when the ESC key is pressed.
   * @param {!Event} event
   * @private
   */
  closeOnEscape_(event) {
    if (event.key == Keys.ESCAPE) {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Closes the lightbox.
   */
  close() {
    if (!this.active_) {
      return;
    }
    if (this.isScrollable_) {
      setStyle(this.element, 'webkitOverflowScrolling', '');
    }
    if (this.closeButtonHeader_) {
      removeElement(this.closeButtonHeader_);
      this.closeButtonHeader_ = null;
    }
    this.getViewport().leaveLightboxMode(this.element)
        .then(() => this.finalizeClose_());
  }

  /**
   * Clean up when closing lightbox.
   */
  finalizeClose_() {
    const {element} = this;
    const event = ++this.eventCounter_;

    const collapseAndReschedule = () => {
      // Don't collapse on transitionend if there was a subsequent event.
      if (event != this.eventCounter_) {
        return;
      }
      this./*OK*/collapse();
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

    setStyles(element, assertDoesNotContainDisplay(
        this.getAnimationPresetDef_().closedStyle));

    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.boundCloseOnEscape_ = null;
    this.schedulePause(dev().assertElement(this.container_));
    this.active_ = false;
    this.triggerEvent_(LightboxEvents.CLOSE);
  }

  /**
   * @return {boolean}
   * @private
   */
  isInAd_() {
    return getMode(this.win).runtime == 'inabox' || isInFie(this.element);
  }

  /**
   * Handles scroll on the amp-lightbox.
   * The scroll throttling and visibility calculation is similar to
   * the implementation in scrollable-carousel
   * @private
   */
  scrollHandler_() {
    // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue.
    const currentScrollTop = this.element./*OK*/scrollTop || 1;
    this.element./*OK*/scrollTop = currentScrollTop;

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
    this.scrollTimerId_ = /** @type {number} */ (
      Services.timerFor(this.win).delay(() => {
        if (Math.abs(startingScrollTop - this.pos_) < 30) {
          dev().fine(TAG, 'slow scrolling: %s - %s',
              startingScrollTop, this.pos_);
          this.scrollTimerId_ = null;
          this.update_(this.pos_);
        } else {
          dev().fine(TAG, 'fast scrolling: %s - %s',
              startingScrollTop, this.pos_);
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
    this.updateChildrenInViewport_(pos, this.oldPos_);
    this.oldPos_ = pos;
    this.pos_ = pos;
  }

  /**
   * Update the inViewport status of children when scroll position changed.
   * @param {number} newPos
   * @param {number} oldPos
   * @private
   */
  updateChildrenInViewport_(newPos, oldPos) {
    const seen = [];
    this.forEachVisibleChild_(newPos, cell => {
      seen.push(cell);
      this.updateInViewport(cell, true);
      this.scheduleLayout(cell);
    });
    if (oldPos != newPos) {
      this.forEachVisibleChild_(oldPos, cell => {
        if (!seen.includes(cell)) {
          this.updateInViewport(cell, false);
        }
      });
    }
  }

  /**
   * Call the callback function for each child element that is visible in the
   * lightbox given current scroll position.
   * @param {number} pos
   * @param {function(!Element)} callback
   * @private
   */
  forEachVisibleChild_(pos, callback) {
    const containerHeight = this.getSize_().height;
    const descendants = this.getComponentDescendants_();
    for (let i = 0; i < descendants.length; i++) {
      const descendant = descendants[i];
      let offsetTop = 0;
      for (let n = descendant;
        n && this.element.contains(n);
        n = n./*OK*/offsetParent) {
        offsetTop += n./*OK*/offsetTop;
      }
      // Check whether child element is almost visible in the lightbox given
      // current scrollTop position of lightbox
      // We consider element visible if within 2x containerHeight distance.
      const visibilityMargin = 2 * containerHeight;
      if (offsetTop + descendant./*OK*/offsetHeight >= pos - visibilityMargin &&
        offsetTop <= pos + visibilityMargin) {
        callback(descendant);
      }
    }
  }

  /**
   * Returns the size of the lightbox.
   * @return {!{width: number, height: number}}
   */
  getSize_() {
    if (!this.size_) {
      this.size_ = {
        width: this.element./*OK*/clientWidth,
        height: this.element./*OK*/clientHeight,
      };
    }
    return this.size_;
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
   * @private
   */
  triggerEvent_(name) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
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
  const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();

  Services.resourcesForDoc(ampdoc).measureMutateElement(body,
      function measure() {
        state.alreadyTransparent =
            computedStyle(win, body)['background-color'] == 'rgba(0, 0, 0, 0)';
      },
      function mutate() {
        if (!state.alreadyTransparent && !getMode().test) {
          // TODO(alanorozco): Create documentation page and link it here once
          // the A4A lightbox experiment is turned on.
          user().warn(TAG,
              'The background of the <body> element has been forced to ' +
              'transparent. If you need to set background, use an ' +
              'intermediate container.');
        }

        // set as !important regardless to prevent changes
        setImportantStyles(body, {background: 'transparent'});
      });
}


AMP.extension(TAG, '0.1', AMP => {
  // TODO(alanorozco): refactor this somehow so we don't need to do a direct
  // getMode check
  if (getMode().runtime == 'inabox') {
    setTransparentBody(window, /** @type {!HTMLBodyElement} */ (
      devAssert(document.body)));
  }

  AMP.registerElement(TAG, AmpLightbox, CSS);
});
