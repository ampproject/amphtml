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

import {CSS} from '../../../build/amp-lightbox-gallery-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {
  ELIGIBLE_TAP_TAGS,
  LightboxManager,
  LightboxThumbnailDataDef,
  VIDEO_TAGS,
} from './service/lightbox-manager-impl';
import {Gestures} from '../../../src/gesture';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {SwipeDef, SwipeYRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {
  childElementByTag,
  closest,
  closestAncestorElementBySelector,
  elementByTag,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {clamp} from '../../../src/utils/math';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {escapeCssSelectorIdent} from '../../../src/css';
import {getData, isLoaded, listen} from '../../../src/event-helper';
import {
  getElementServiceForDoc,
} from '../../../src/element-service';
import {htmlFor} from '../../../src/static-template';
import {
  prepareImageAnimation,
} from '@ampproject/animations/dist/animations.mjs';
import {reportError} from '../../../src/error';
import {setStyle, setStyles, toggle} from '../../../src/style';
import {toArray} from '../../../src/types';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @const */
const TAG = 'amp-lightbox-gallery';
const DEFAULT_GALLERY_ID = 'amp-lightbox-gallery';
const SLIDE_ITEM_SELECTOR =
    '.i-amphtml-slide-item, .i-amphtml-carousel-slotted';

/**
 * Set of namespaces that indicate the lightbox controls mode.
 * Lightbox controls include top bar, description box
 *
 * @enum {number}
 */
const LightboxControlsModes = {
  CONTROLS_DISPLAYED: 1,
  CONTROLS_HIDDEN: 0,
};

/**
 * The number of pixels of movement to go from the darkest to lightest overlay
 * while doing a swipe to close gesture.
 */
const SWIPE_TO_CLOSE_DISTANCE = 200;
/**
 * The number of pixels needed to close when doing a swipe to close gesture.
 */
const SWIPE_TO_CLOSE_DISTANCE_THRESHOLD = SWIPE_TO_CLOSE_DISTANCE / 4;
/**
 * The number of pixels needed to completely fade out the controls when doing a
 * swipe to close gesture.
 */
const SWIPE_TO_HIDE_CONTROLS_DISTANCE = SWIPE_TO_CLOSE_DISTANCE / 4;
/**
 * The velocity at which to close light box from a swipe, regardless of distance
 * travelled.
 */
const SWIPE_TO_CLOSE_VELOCITY_THRESHOLD = 0.65;
/**
 * The lowest opacity for the background and controls when doing swipe to close
 * gesture.
 */
const SWIPE_TO_CLOSE_MIN_OPACITY = 0.2;
/** The smallest scale possible when doing swipe to close gesture. */
const SWIPE_TO_CLOSE_MIN_SCALE = 0.85;
/**
 * How much distance to cover, based on the velocity, when a user releases a
 * swipe to close gesture.
 */
const SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR = 22.5;
/**
 * How much time to spend, based on the distance to travel, when moving to the
 * final location of a swipe (after the user has released).
 */
const SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR = 1;
/**
 * How much time to spend, based on the distance to travel, when snapping back
 * after an cancelled swipe to close gesture.
 */
const SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR = 5;
/**
 * The timing function to use when carrying momentum after releasing a swipe to
 * close gesture. This closely approximates an expontential decay of velocity.
 */
const SWIPE_TO_CLOSE_MOMENTUM_TIMING = 'cubic-bezier(0.15, .55, .3, 0.95)';

// Use S Curves for entry and exit animations
const TRANSITION_CURVE = {x1: 0.8, y1: 0, x2: 0.2, y2: 1};
const FADE_CURVE = bezierCurve(0.8, 0, 0.2, 1);

const MAX_TRANSITION_DURATION = 700; // ms
const MIN_TRANSITION_DURATION = 500; // ms
const MAX_DISTANCE_APPROXIMATION = 250; // px
const MOTION_DURATION_RATIO = 0.8; // fraction of animation

/**
 * The structure that represents the metadata of a lightbox element
 *
 * @typedef {{
 *   descriptionText: string,
 *   tagName: string,
 *   imageViewer: ?Element,
 *   sourceElement: !Element,
 *   element: !Element
 * }}
 */
let LightboxElementMetadataDef;

/**
 * Calculates the distance between two points in two dimensions.
 * TODO(#21104) Refactor.
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * @return {number} The distance.
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * A linear interpolation.
 * TODO(#21104) Refactor.
 * @param {number} start
 * @param {number} end
 * @param {number} percentage
 * @return {number} The value percentage of the way between start and end.
 */
function lerp(start, end, percentage) {
  return start + (end - start) * percentage;
}

/**
 * Runs a delay after deferring to the event loop. This is useful to call from
 * within an animation frame, as you can be sure that at least duration
 * milliseconds has elapsed after the animation has started. Simply waiting
 * for the desired duration may result in running code before an animation has
 * completed.
 * @param {!Window} win A Window object.
 * @param {number} duration How long to wait for.
 * @return {!Promise} A Promise that resolves after the specified duration.
 */
function delayAfterDeferringToEventLoop(win, duration) {
  const timer = Services.timerFor(win);
  // Timer.promise does not defer to event loop for 0.
  const eventLoopDelay = 1;
  // First, defer to the JavaScript execution loop. If we are in a
  // requestAnimationFrame, this will place us after render. Second, wait
  // for duration to elapse.
  return timer.promise(eventLoopDelay).then(() => timer.promise(duration));
}

/**
 * @private visible for testing.
 */
export class AmpLightboxGallery extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Document} */
    this.doc_ = this.win.document;

    /** @private {boolean} */
    this.isActive_ = false;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {number} */
    this.currentElemId_ = -1;

    /** @private {function(!Event)} */
    this.boundOnKeyDown_ = this.onKeyDown_.bind(this);

    /**
     * @private {?./service/lightbox-manager-impl.LightboxManager}
     */
    this.manager_ = null;

    /** @private {?../../../src/service/history-impl.History}*/
    this.history_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {!Object<string,!Array<!LightboxElementMetadataDef>>} */
    this.elementsMetadata_ = {
      default: [],
    };

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Element} */
    this.carouselContainer_ = null;

    /** @private {?Element} */
    this.controlsContainer_ = null;

    /** @private {?Element} */
    this.mask_ = null;

    /** @private {?Element} */
    this.navControls_ = null;

    /** @private {?Element} */
    this.carousel_ = null;

    /** @private {?Element} */
    this.descriptionBox_ = null;

    /** @private {?Element} */
    this.descriptionTextArea_ = null;

    /** @private {?Element} */
    this.descriptionOverflowMask_ = null;

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @private  {?Element} */
    this.topBar_ = null;

    /** @private {!LightboxControlsModes} */
    this.controlsMode_ = LightboxControlsModes.CONTROLS_DISPLAYED;

    /** @private {?UnlistenDef} */
    this.unlistenClick_ = null;

    /** @private {string} */
    this.currentLightboxGroupId_ = 'default';

    /** @private {?Element} */
    this.sourceElement_ = null;

    /** @private {boolean} */
    this.hasScrollbarWidth_ = false;

    /**
     * A listener is set up to prevent carousel scrolling when we do a swipe to
     * dismiss gesture. This is used to clean up the listener when no longer
     * needed.
     * @private {?function()}
     */
    this.preventCarouselScrollUnlistener_ = null;
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /** @override */
  buildCallback() {
    return lightboxManagerForDoc(this.element).then(manager => {
      this.manager_ = manager;
      this.history_ = Services.historyForDoc(this.getAmpDoc());
      this.action_ = Services.actionServiceForDoc(this.element);
      const viewer = Services.viewerForDoc(this.getAmpDoc());
      return viewer.whenFirstVisible();
    }).then(() => {
      this.container_ = htmlFor(this.doc_)`
        <div class="i-amphtml-lbg">
          <div class="i-amphtml-lbg-mask"></div>
        </div>`;
      this.mask_ = this.container_.querySelector('.i-amphtml-lbg-mask');
      this.element.appendChild(this.container_);
      this.manager_.maybeInit();
      this.registerDefaultAction(
          invocation => this.open_(invocation),
          'open');
    });
  }

  /** @override */
  layoutCallback() {
    // DO NOT ADD CODE HERE
    // layoutCallback for lightbox-viewer is meaningless, lightbox-viewer
    // doesn't have children, it just manages elements elsewhere in the page in
    // `open_` `close_` and `updateViewer_` methods.
    return Promise.resolve();
  }

  /**
   * Builds all controls (top bar and description) and appends them to the
   * lightbox container
   * @private
   */
  buildControls_() {
    this.controlsContainer_ = htmlFor(this.doc_)`
      <div class="i-amphtml-lbg-controls"></div>`;
    this.buildDescriptionBox_();
    this.buildTopBar_();
    this.buildNavControls_();
    this.mutateElement(() => {
      this.container_.appendChild(this.controlsContainer_);
    });
  }

  /**
   * @param {string} lightboxGroupId
   * @return {!Promise}
   * @private
   */
  findOrInitializeLightbox_(lightboxGroupId) {
    if (!this.carouselContainer_) {
      this.carouselContainer_ = this.doc_.createElement('div');
      this.container_.appendChild(this.carouselContainer_);
    }

    if (!this.controlsContainer_) {
      this.buildControls_();
    }
    return this.findOrBuildCarousel_(lightboxGroupId);
  }

  /**
   * Return a cleaned clone of the given element for building
   * carousel slides with.
   * @param {!Element} element
   * @private
   */
  cloneLightboxableElement_(element) {
    const deepClone = !element.classList.contains(
        'i-amphtml-element');
    const clonedNode = element.cloneNode(deepClone);
    clonedNode.removeAttribute('on');
    clonedNode.removeAttribute('id');
    clonedNode.removeAttribute('i-amphtml-layout');
    return clonedNode;
  }
  /**
   * Given a list of lightboxable elements, build the internal carousel slides
   * @param {!Array<!Element>} lightboxableElements
   * @private
   */
  buildCarouselSlides_(lightboxableElements) {
    let index = 0;
    this.elementsMetadata_[this.currentLightboxGroupId_] = [];
    lightboxableElements.forEach(element => {
      element.lightboxItemId = index++;
      const clonedNode = this.cloneLightboxableElement_(element);
      const descText = this.manager_.getDescription(element);
      const metadata = {
        descriptionText: descText,
        tagName: clonedNode.tagName,
        sourceElement: element,
        element: clonedNode,
      };
      let slide = clonedNode;
      if (ELIGIBLE_TAP_TAGS[clonedNode.tagName]) {
        const container = this.doc_.createElement('div');
        const imageViewer = htmlFor(this.doc_)`
          <amp-image-viewer layout="fill"></amp-image-viewer>`;
        clonedNode.removeAttribute('class');
        imageViewer.appendChild(clonedNode);
        container.appendChild(imageViewer);
        slide = container;
        metadata.imageViewer = imageViewer;
      }
      this.carousel_.appendChild(slide);
      this.elementsMetadata_[this.currentLightboxGroupId_].push(metadata);
    });
  }

  /**
   * Returns the existing carousel corresponding to the group id
   * or builds a new one.
   * @param {string} lightboxGroupId
   * @return {!Promise}
   * @private
   */
  findOrBuildCarousel_(lightboxGroupId) {
    devAssert(this.container_);
    const existingCarousel = this.element.querySelector(
        `amp-carousel[amp-lightbox-group=${
          escapeCssSelectorIdent(lightboxGroupId)
        }]`);
    if (existingCarousel) {
      this.carousel_ = existingCarousel;
      return this.showCarousel_(lightboxGroupId);
    } else {
      return this.buildCarousel_(lightboxGroupId);
    }
  }

  /**
   * @param {string} lightboxGroupId
   * @return {!Promise}
   * @private
   */
  showCarousel_(lightboxGroupId) {
    return this.mutateElement(() => {
      const {length} = this.elementsMetadata_[lightboxGroupId];
      this.maybeEnableMultipleItemControls_(length);
      toggle(dev().assertElement(this.carousel_), true);
    });
  }

  /**
   * Builds the carousel and appends it to the container.
   * @param {string} lightboxGroupId
   * @return {!Promise}
   * @private
   */
  buildCarousel_(lightboxGroupId) {
    return Promise.all([
      Services.extensionsFor(this.win).installExtensionForDoc(
          this.getAmpDoc(), 'amp-carousel'),
      Services.extensionsFor(this.win).installExtensionForDoc(
          this.getAmpDoc(), 'amp-image-viewer'),
    ]).then(() => {
      return this.manager_.getElementsForLightboxGroup(lightboxGroupId);
    }).then(list => {
      this.carousel_ = htmlFor(this.doc_)`
        <amp-carousel type="slides" layout="fill" loop="true"></amp-carousel>`;
      this.carousel_.setAttribute('amp-lightbox-group', lightboxGroupId);
      this.buildCarouselSlides_(list);
      return this.mutateElement(() => {
        this.carouselContainer_.appendChild(this.carousel_);
        this.maybeEnableMultipleItemControls_(list.length);
      });
    });
  }

  /**
   * @param {number} itemLength
   * @private
   */
  maybeEnableMultipleItemControls_(itemLength) {
    const isDisabled = itemLength <= 1;
    const ghost = 'i-amphtml-ghost';
    const container = dev().assertElement(this.controlsContainer_);
    [
      '.i-amphtml-lbg-button-next',
      '.i-amphtml-lbg-button-prev',
      '.i-amphtml-lbg-button-gallery',
    ].forEach(selector => {
      dev().assertElement(scopedQuerySelector(container, selector))
          .classList.toggle(ghost, isDisabled);
    });
  }

  /**
   * Handles slide change.
   * @param {!Event} event
   * @private
   */
  slideChangeHandler_(event) {
    this.currentElemId_ = getData(event)['index'];
    this.updateDescriptionBox_();
  }

  /**
   * Build description box and append it to the container.
   * @private
   */
  buildDescriptionBox_() {
    this.descriptionBox_ = htmlFor(this.doc_)`
      <div class="i-amphtml-lbg-desc-box i-amphtml-lbg-standard">
        <div class="i-amphtml-lbg-desc-text"></div>
        <div class="i-amphtml-lbg-desc-mask"></div>
      </div>`;

    this.descriptionTextArea_ = this.descriptionBox_.querySelector(
        '.i-amphtml-lbg-desc-text');

    this.descriptionOverflowMask_ = this.descriptionBox_.querySelector(
        '.i-amphtml-lbg-desc-mask');

    this.descriptionBox_.addEventListener('click', event => {
      this.toggleDescriptionOverflow_();
      event.stopPropagation();
    });

    this.controlsContainer_.appendChild(this.descriptionBox_);
  }

  /**
   * Update description box text.
   * @private
   */
  updateDescriptionBox_() {
    const descText = this.getCurrentElement_().descriptionText;
    if (!descText) {
      this.mutateElement(() => {
        toggle(dev().assertElement(this.descriptionBox_), false);
      });
    } else {
      this.mutateElement(() => {
        // The problem with setting innerText is that it not only removes child
        // nodes from the element, but also permanently destroys all descendant
        // text nodes. It is okay in this case because the description text area
        // is a div that does not contain descendant elements.
        this.descriptionTextArea_./*OK*/innerText = descText;

        // Avoid flickering out if transitioning from a slide with no text
        this.descriptionBox_.classList.remove('i-amphtml-lbg-fade-out');
        toggle(dev().assertElement(this.descriptionBox_), true);

      }).then(() => {
        let descriptionOverflows, isInOverflowMode;

        const measureOverflowState = () => {
          // The height of the description without overflow is set to 4 rem.
          // The height of the overflow mask is set to 1 rem. We allow 3 lines
          // for the description and consider it to have overflow if more than 3
          // lines of text.
          descriptionOverflows = this.descriptionBox_./*OK*/scrollHeight
              - this.descriptionBox_./*OK*/clientHeight
              >= this.descriptionOverflowMask_./*OK*/clientHeight;

          isInOverflowMode = this.descriptionBox_.classList
              .contains('i-amphtml-lbg-overflow');
        };

        const mutateOverflowState = () => {
          // We toggle visibility instead of display because we rely on the
          // height of this element to measure 1 rem.
          setStyles(dev().assertElement(this.descriptionOverflowMask_), {
            visibility: descriptionOverflows || isInOverflowMode
              ? 'visible' : 'hidden',
          });

          if (isInOverflowMode) {
            this.clearDescOverflowState_();
          }
        };

        this.measureMutateElement(measureOverflowState, mutateOverflowState);
      });
    }
  }

  /**
   * Toggle the overflow state of description box
   * @private
   */
  toggleDescriptionOverflow_() {
    triggerAnalyticsEvent(this.element, 'descriptionOverflowToggled', dict({}));
    let isInStandardMode, isInOverflowMode, descriptionOverflows;
    const measureOverflowState = () => {
      isInStandardMode = this.descriptionBox_.classList
          .contains('i-amphtml-lbg-standard');
      isInOverflowMode = this.descriptionBox_.classList
          .contains('i-amphtml-lbg-overflow');

      // The height of the description without overflow is set to 4 rem.
      // The height of the overflow mask is set to 1 rem. We allow 3 lines
      // for the description and consider it to have overflow if more than 3
      // lines of text.
      descriptionOverflows = this.descriptionBox_./*OK*/scrollHeight
          - this.descriptionBox_./*OK*/clientHeight
          >= this.descriptionOverflowMask_./*OK*/clientHeight;
    };

    const mutateOverflowState = () => {
      if (isInStandardMode && descriptionOverflows) {
        this.descriptionBox_.classList.remove('i-amphtml-lbg-standard');
        this.descriptionBox_.classList.add('i-amphtml-lbg-overflow');
        toggle(user().assertElement(this.navControls_,
            'E#19457 this.navControls_'), false);
        toggle(user().assertElement(this.topBar_, 'E#19457 this.topBar_'),
            false);
      } else if (isInOverflowMode) {
        this.clearDescOverflowState_();
      }
    };

    this.measureMutateElement(measureOverflowState, mutateOverflowState);
  }

  /**
   * @private
   */
  clearDescOverflowState_() {
    this.descriptionBox_./*OK*/scrollTop = 0;
    this.descriptionBox_.classList.remove('i-amphtml-lbg-overflow');
    this.descriptionBox_.classList.add('i-amphtml-lbg-standard');
    toggle(user().assertElement(this.navControls_,
        'E#19457 this.navControls_'), true);
    toggle(user().assertElement(this.topBar_,
        'E#19457 this.topBar_'), true);
  }

  /**
   * @private
   */
  nextSlide_() {
    devAssert(this.carousel_).getImpl().then(carousel => {
      carousel.interactionNext();
    });
  }

  /**
   * @private
   */
  prevSlide_() {
    devAssert(this.carousel_).getImpl().then(carousel => {
      carousel.interactionPrev();
    });
  }

  /**
   * @private
   */
  buildNavControls_() {
    this.navControls_ = this.doc_.createElement('div');
    const nextSlide = this.nextSlide_.bind(this);
    const prevSlide = this.prevSlide_.bind(this);

    const nextButton = this.buildButton_('Next',
        'i-amphtml-lbg-button-next', nextSlide);
    const prevButton = this.buildButton_('Prev',
        'i-amphtml-lbg-button-prev', prevSlide);

    const input = Services.inputFor(this.win);
    if (!input.isMouseDetected()) {
      prevButton.classList.add('i-amphtml-screen-reader');
      nextButton.classList.add('i-amphtml-screen-reader');
    }
    this.navControls_.appendChild(prevButton);
    this.navControls_.appendChild(nextButton);
    this.controlsContainer_.appendChild(this.navControls_);
  }
  /**
   * Builds the top bar containing buttons and appends them to the container.
   * @private
   */
  buildTopBar_() {
    devAssert(this.container_);
    this.topBar_ = this.doc_.createElement('div');
    this.topBar_.classList.add('i-amphtml-lbg-top-bar');

    const close = this.close_.bind(this);
    const openGallery = this.openGallery_.bind(this);
    const closeGallery = this.closeGallery_.bind(this);

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    const closeButton = this.buildButton_('Close',
        'i-amphtml-lbg-button-close', close);
    const openGalleryButton = this.buildButton_('Gallery',
        'i-amphtml-lbg-button-gallery', openGallery);
    const closeGalleryButton = this.buildButton_('Content',
        'i-amphtml-lbg-button-slide', closeGallery);

    this.topBar_.appendChild(closeButton);
    this.topBar_.appendChild(openGalleryButton);
    this.topBar_.appendChild(closeGalleryButton);

    this.controlsContainer_.appendChild(this.topBar_);
  }

  /**
   * Builds a button and appends it to the container.
   * @param {string} label Text of the button for a11y
   * @param {string} className Css classname
   * @param {function()} action function to call when tapped
   * @private
   */
  buildButton_(label, className, action) {
    devAssert(this.topBar_);

    const button = htmlFor(this.doc_)`
    <div role="button" class="i-amphtml-lbg-button">
      <span class="i-amphtml-lbg-icon"></span>
    </div>`;

    button.setAttribute('aria-label', label);
    button.classList.add(className);

    button.addEventListener('click', event => {
      action();
      event.stopPropagation();
      event.preventDefault();
    });
    return button;
  }

  /**
   * We should not try to toggle controls or otherwise handle a click on
   * the lightbox if the click has already been handled by a link, a button,
   * or an existing tap action handler.
   * @param {!Event} e
   * @return {boolean}
   */
  shouldHandleClick_(e) {
    const target = dev().assertElement(e.target);
    const consumingElement = closest(target, element => {
      return element.tagName == 'BUTTON'
        || element.tagName == 'A'
        || element.getAttribute('role') == 'button';
    }, this.container_);

    const clickConsumed = consumingElement !== null;
    const hasTap = this.action_.hasAction(target, 'tap',
        dev().assertElement(this.container_));
    return !(clickConsumed || hasTap);
  }

  /**
   * Toggle lightbox controls including topbar and description.
   * @param {!Event} e
   * @private
   */
  onToggleControls_(e) {
    if (this.shouldHandleClick_(e)) {
      if (this.controlsMode_ == LightboxControlsModes.CONTROLS_HIDDEN) {
        this.showControls_();
      } else if (!this.container_.hasAttribute('gallery-view')) {
        this.hideControls_();
      }
    }
    triggerAnalyticsEvent(this.element, 'controlsToggled', dict({}));
  }

  /**
   * Show lightbox controls.
   * @private
   */
  showControls_() {
    this.controlsContainer_.classList.remove('i-amphtml-lbg-fade-out');
    this.controlsContainer_.classList.remove('i-amphtml-lbg-hidden');
    this.controlsContainer_.classList.add('i-amphtml-lbg-fade-in');

    if (!this.container_.hasAttribute('gallery-view')) {
      this.updateDescriptionBox_();
    }
    this.controlsMode_ = LightboxControlsModes.CONTROLS_DISPLAYED;
  }

  /**
   * Hide lightbox controls without fade effect.
   * @private
   */
  hideControls_() {
    this.controlsContainer_.classList.remove('i-amphtml-lbg-fade-in');
    this.controlsContainer_.classList.add('i-amphtml-lbg-fade-out');
    this.controlsMode_ = LightboxControlsModes.CONTROLS_HIDDEN;
  }

  /**
   * Set up event listeners.
   * @private
   */
  setupEventListeners_() {
    devAssert(this.container_);
    const onToggleControls = this.onToggleControls_.bind(this);
    this.unlistenClick_ = listen(dev().assertElement(this.container_),
        'click', onToggleControls);
  }

  /**
   * Clean up event listeners.
   * @private
   */
  cleanupEventListeners_() {
    if (this.unlistenClick_) {
      this.unlistenClick_();
      this.unlistenClick_ = null;
    }
  }

  /**
   * Carries momentum for the swipe forwards to a final destination, with the
   * duration depending on the velocity.
   * @param {number} scale The current scale.
   * @param {number} deltaX How far in the x direction we should keep moving.
   * @param {number} deltaY How far in the y direction we should keep moving.
   * @param {number} velocity The current velocity.
   * @return {Promise} A Promise that resolves once the momentum based movement
   *    based movement has ended.
   * @private
   */
  carrySwipeMomentum_(scale, deltaX, deltaY, velocity) {
    const duration = velocity * SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR;

    setStyles(devAssert(this.carousel_), {
      transform: `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`,
      transition: `${duration}ms transform ${SWIPE_TO_CLOSE_MOMENTUM_TIMING}`,
    });

    return delayAfterDeferringToEventLoop(this.win, duration);
  }

  /**
   * Snaps back to the starting point, with the duration based on the distance
   * that needs to be travelled.
   * @param {number} finalDistance
   * @return {Promise} A Promise that resolves once the snapping has completed.
   * @private
   */
  snapBackFromSwipe_(finalDistance) {
    const duration = finalDistance * SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR;

    return this.mutateElement(() => {
      setStyles(devAssert(this.carousel_), {
        transform: '',
        transition: `${duration}ms transform ease-out`,
      });
      setStyles(devAssert(this.mask_), {
        opacity: '',
        transition: `${duration}ms opacity ease-out`,
      });
      setStyles(devAssert(this.controlsContainer_), {
        opacity: '',
        transition: `${duration}ms opacity ease-out`,
      });
    }).then(() => {
      return delayAfterDeferringToEventLoop(this.win, duration);
    });
  }

  /**
   * Adjusts the UI elements for the current swipe position in a swipe to
   * dismiss gesture. This should be called in a mutate context.
   * @param {!Element} carousel The carousel element to adjust. This is passed
   *    as `this.carousel_` will be null if this is called after the lightbox
   *    has been closed.
   * @param {string} carouselTransform How to transform the carousel.
   * @param {number|string} maskOpacity The opacity for the mask element.
   * @param {number|string} controlsOpacity The opacity for the controls
   *    container.
   * @private
   */
  adjustForSwipePosition_(
    carousel, carouselTransform = '', maskOpacity = '', controlsOpacity = '') {
    setStyles(carousel, {
      transform: carouselTransform,
      transition: '',
    });
    setStyles(devAssert(this.mask_), {
      opacity: maskOpacity,
      transition: '',
    });
    setStyles(devAssert(this.controlsContainer_), {
      opacity: controlsOpacity,
      transition: '',
    });
  }

  /**
   * Releases the user's swipe to dismiss gesture. This carries the momentum
   * forwards and either closes the lightbox or snaps back based on the speed
   * and distance. This should be called in a mutate context.
   * @param {number} scale The scale when releasing the swipe. We do not change
   *    the scale as we carry forward any momentum.
   * @param {number} velocityX The X velocity when the swipe was released.
   * @param {number} velocityY The Y velocity when the swipe was released.
   * @param {number} deltaX The x distance when the swipe was released.
   * @param {number} deltaY The y distance when the swipe was released.
   * @return {!Promise} A Promise that resolves once the release is completed,
   *    either snapping back to the start or closing the carousel.
   * @private
   */
  releaseSwipe_(scale, velocityX, velocityY, deltaX, deltaY) {
    const velocity = calculateDistance(0, 0, velocityX, velocityY);
    const distanceX = velocityX * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const distanceY = velocityY * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const finalDeltaX = distanceX + deltaX;
    const finalDeltaY = distanceY + deltaY;
    // We want to figure out the final distance we will rest at if the user
    // flicked the lightbox and use that to determine we should animate to. We
    // will then use that resting position to determine if we should snap back
    // or close.
    const finalDistance = calculateDistance(0, 0, finalDeltaX, finalDeltaY);

    // We always want to carry momentum from the swipe forward, and then use
    // the resting point to decide if we should snap back or close.
    return this.carrySwipeMomentum_(scale, finalDeltaX, finalDeltaY, velocity)
        .then(() => {
          if (finalDistance < SWIPE_TO_CLOSE_DISTANCE_THRESHOLD &&
              velocity < SWIPE_TO_CLOSE_VELOCITY_THRESHOLD) {
            return this.snapBackFromSwipe_(finalDistance);
          }

          return this.close_();
        });
  }

  /**
   * Handles the start of a swipe to dimiss gesture:
   *  - Prevents a scroll event from the carousel during the swipe.
   *  - Hides the source element on the page.
   * This should be called in a mutate context.
   * @param {!Element} sourceElement
   * @private
   */
  startSwipeToDismiss_(sourceElement) {
    const parentCarousel = this.getSourceElementParentCarousel_(sourceElement);
    const hiddenElement = parentCarousel || sourceElement;
    hiddenElement.classList.add('i-amphtml-ghost');
    // We do not want the user dragging around to make the carousel think that
    // a scroll happened.
    this.preventCarouselScrollUnlistener_ = listen(
        devAssert(this.carousel_), 'scroll', event => {
          event.stopPropagation();
        }, {
          capture: true,
        });
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    this.element.setAttribute('i-amphtml-scale-animation', '');
    // Need to clear this so that we can control the opacity as the user drags.
    setStyle(this.controlsContainer_, 'animationFillMode', 'none');
  }

  /**
   * Ends a drag swipe, cleaning up the effects from `startSwipeToDismiss_`.
   * This should be called in a mutate context.
   * @param {!Element} sourceElement
   * @private
   */
  endSwipeToDismiss_(sourceElement) {
    const parentCarousel = this.getSourceElementParentCarousel_(sourceElement);
    const hiddenElement = parentCarousel || sourceElement;
    hiddenElement.classList.remove('i-amphtml-ghost');
    this.preventCarouselScrollUnlistener_();
    this.element.removeAttribute('i-amphtml-scale-animation');
    setStyle(this.controlsContainer_, 'animationFillMode', '');
  }

  /**
   * @param {!SwipeDef} data
   * @private
   */
  handleSwipeMove_(data) {
    const {deltaX, deltaY, first, last, velocityX, velocityY} = data;
    // Need to capture these as they will no longer be available after closing.
    const carousel = devAssert(this.carousel_);
    const {sourceElement} = this.getCurrentElement_();
    const distance = calculateDistance(0, 0, deltaX, deltaY);
    const releasePercentage = Math.min(distance / SWIPE_TO_CLOSE_DISTANCE, 1);
    const hideControlsPercentage =
        Math.min(distance / SWIPE_TO_HIDE_CONTROLS_DISTANCE, 1);
    const scale = lerp(1, SWIPE_TO_CLOSE_MIN_SCALE, releasePercentage);
    const maskOpacity = lerp(1, SWIPE_TO_CLOSE_MIN_OPACITY, releasePercentage);
    const controlsOpacity = lerp(1, 0, hideControlsPercentage);

    this.mutateElement(() => {
      if (first) {
        this.startSwipeToDismiss_(sourceElement);
        return;
      }

      if (last) {
        this.releaseSwipe_(scale, velocityX, velocityY, deltaX, deltaY)
            .then(() => {
              // TODO(sparhami) These should be called in a `mutateElement`,
              // but we are already in an animationFrame, and waiting for the
              // next one will cause the UI to flicker.
              this.adjustForSwipePosition_(carousel);
              this.endSwipeToDismiss_(sourceElement);
            });
        return;
      }

      this.adjustForSwipePosition_(
          carousel,
          `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`,
          maskOpacity,
          controlsOpacity);
    });
  }

  /**
   * Set up gestures
   * @private
   */
  setupGestures_() {
    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.onGesture(SwipeYRecognizer, e => {
      this.handleSwipeMove_(e.data);
    });
  }

  /**
   * Pauses lightbox childred.
   */
  pauseLightboxChildren_() {
    const lbgId = this.currentLightboxGroupId_;
    const slides = this.elementsMetadata_[lbgId]
        .map(elemMetadata => elemMetadata.element);
    this.schedulePause(slides);
  }

  /**
   * @return {!LightboxElementMetadataDef}
   * @private
   */
  getCurrentElement_() {
    const lbgId = this.currentLightboxGroupId_;
    const currentElement = devAssert(
        this.elementsMetadata_[lbgId][this.currentElemId_]
    );
    return currentElement;
  }

  /**
   * Opens the lightbox-gallery with either the invocation source or
   * the element referenced by the `id` argument.
   * Examples:
   *  // Opens the element tapped.
   *  on="tap:myLightboxGallery'
   *
   *  // Opens the element referenced by elementId
   *  on="tap:myLightboxGallery.open(id='<elementId>')
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  open_(invocation) {
    let target = invocation.caller;
    if (invocation.args && invocation.args['id']) {
      const targetId = invocation.args['id'];
      target = this.getAmpDoc().getElementById(targetId);
      userAssert(target,
          'amp-lightbox-gallery.open: element with id: %s not found', targetId);
    }
    this.openLightboxGallery_(dev().assertElement(target)).then(() => {
      return this.history_.push(this.close_.bind(this));
    }).then(historyId => {
      this.historyId_ = historyId;
    });
  }

  /**
   * Opens the lightbox-gallery and displays the given element inside.
   * @param {!Element} element Element to lightbox.
   * @return {!Promise}
   * @private
   */
  openLightboxGallery_(element) {
    this.sourceElement_ = element;
    const lightboxGroupId = element.getAttribute('lightbox')
      || 'default';
    this.currentLightboxGroupId_ = lightboxGroupId;
    this.hasScrollbarWidth_ = this.getViewport()
        .getVerticalScrollbarWidth() > 0;

    return this.findOrInitializeLightbox_(lightboxGroupId)
        .then(() => {
        // Enter lightbox mode first so that any vertical scrollbar is removed.
        // This allows us to measure the correct size for elements that will be
        // in the lightbox. It also makes sure the user cannot scroll the page
        // by accident during the transition.
          this.getViewport().enterLightboxMode();
        })
        .then(() => {
          return this.mutateElement(() => {
            toggle(this.element, true);
            setStyle(this.element, 'opacity', 0);
            this.controlsContainer_.classList.remove('i-amphtml-lbg-fade-in');
            this.controlsContainer_.classList.add('i-amphtml-lbg-hidden');
          });
        }).then(() => {
          this.isActive_ = true;

          this.updateInViewport(dev().assertElement(this.container_), true);
          this.scheduleLayout(dev().assertElement(this.container_));

          this.doc_.documentElement.addEventListener(
              'keydown', this.boundOnKeyDown_);

          this.carousel_.addEventListener(
              'slideChange', event => this.slideChangeHandler_(event)
          );

          this.setupGestures_();
          this.setupEventListeners_();

          return this.carousel_.signals().whenSignal(CommonSignals.LOAD_END);
        })
        .then(() => this.openLightboxForElement_(element))
        .then(() => {
          setStyle(this.element, 'opacity', '');
          this.showControls_();
          triggerAnalyticsEvent(this.element, 'lightboxOpened', dict({}));
        });
  }

  /**
   * Given a single lightbox element, opens the internal carousel slide
   * associated with said element, updates the description, and initializes
   * the image viewer if the element is an amp-img.
   * @param {!Element} element
   * @return {!Promise}
   * @private
   */
  openLightboxForElement_(element) {
    this.currentElemId_ = element.lightboxItemId;
    devAssert(this.carousel_).getImpl()
        .then(carousel => carousel.goToSlide(this.currentElemId_));
    this.updateDescriptionBox_();
    return this.enter_();
  }

  /**
   * Returns true if the element is loaded and contains an img.
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  elementTypeCanBeAnimated_(element) {
    if (!element || !isLoaded(element)) {
      return false;
    }
    if (!ELIGIBLE_TAP_TAGS[element.tagName]) {
      return false;
    }
    const img = elementByTag(dev().assertElement(element), 'img');
    if (!img) {
      return false;
    }
    return true;
  }

  /**
   * It's possible for the current lightbox to be displaying an image that
   * is not visible in the viewport. We should not transition those images.
   * This function checks if the currently lightboxed image is the source image
   * that we transitioned on (in which case it is guaranteed to be in viewport)
   * or if it belongs to a carousel, in which case we sync the carousel.
   * @return {boolean}
   * @private
   */
  shouldAnimateOut_() {
    const target = this.getCurrentElement_().sourceElement;
    if (!this.transitionTargetIsInViewport_(target)) {
      return false;
    }
    if (!this.elementTypeCanBeAnimated_(target)) {
      return false;
    }
    return true;
  }

  /**
   *
   * @param {!Element} target
   * @return {boolean}
   * @private
   */
  transitionTargetIsInViewport_(target) {
    if (target == this.sourceElement_) {
      return true;
    }
    if (target.isInViewport()) {
      return true;
    }
    const parentCarousel = this.getSourceElementParentCarousel_(target);
    if (parentCarousel && parentCarousel.isInViewport()) {
      return true;
    }
    return false;
  }

  /**
   * Transitions the sourceElement into the lightbox or the lightbox to the
   * sourceElement.
   * @param {!Element} sourceElement The element that is the source of what is
   *    rendered in the lightbox.
   * @param {boolean} enter Whether this is an enter or exit transition.
   * @return {!Promise} A Promise that resolves once the transition is complete.
   * @private
   */
  transitionImg_(sourceElement, enter) {
    return this.getCurrentElement_().imageViewer.getImpl()
        .then(imageViewer => {
          const {width, height} = imageViewer.getImageBoxWithOffset() || {};

          // Check if our imageBox has a width or height. We may be in the
          // gallery view if not, and we do not want to animate.
          if (!width || !height) {
            return this.fade_(/*fadeIn*/enter);
          }

          const lightboxImg = imageViewer.getImage();
          const sourceImg = childElementByTag(sourceElement, 'img');
          return this.runImgTransition_(
              enter ? sourceImg : lightboxImg,
              enter ? lightboxImg : sourceImg,
              enter);
        });
  }

  /**
   * Gets the duration for how long to animate the transition, based on the
   * distance and size of the viewport.
   * @param {!Element} srcImg The img to transition from.
   * @param {!Element} targetImg The img to transition to.
   * @return {number} How long to animate for, in milliseconds.
   * @private
   */
  getTransitionDurationFromElements_(srcImg, targetImg) {
    const srcRect = srcImg./*OK*/getBoundingClientRect();
    const destRect = targetImg./*OK*/getBoundingClientRect();
    const viewportHeight = this.getViewport().getSize().height;
    const dy = Math.abs(destRect.top - srcRect.top);

    return this.getTransitionDuration_(Math.abs(dy), viewportHeight);
  }

  /**
   * Runs an img transition, both transitioning the `<img>` itself as well as
   * the lightbox background.
   * @param {!HTMLImageElement} srcImg The img to transition from.
   * @param {!HTMLImageElement} targetImg The img to transition to.
   * @param {boolean} enter Whether this is an enter or exxit transition.
   * @return {Promise} A Promise that resolves once the transition is complete.
   * @private
   */
  runImgTransition_(srcImg, targetImg, enter) {
    const carousel = dev().assertElement(this.carousel_);
    const container = dev().assertElement(this.container_);

    let duration;
    let motionDuration;
    let imageAnimation;

    const measure = () => {
      duration = this.getTransitionDurationFromElements_(srcImg, targetImg);
      motionDuration = MOTION_DURATION_RATIO * duration;
      // Prepare the actual image animation.
      try {
        imageAnimation = prepareImageAnimation({
          styleContainer: this.getAmpDoc().getHeadNode(),
          transitionContainer: this.getAmpDoc().getBody(),
          srcImg,
          targetImg,
          srcImgRect: undefined,
          targetImgRect: undefined,
          styles: {
            'animationDuration': `${motionDuration}ms`,
            // Matches z-index for `.i-amphtml-lbg`.
            'zIndex': 2147483642,
          },
          keyframesNamespace: undefined,
          curve: TRANSITION_CURVE,
        });
      } catch (e) {
        reportError(e);
      }
    };

    const mutate = () => {
      toggle(carousel, enter);
      // Undo opacity 0 from `openLightboxGallery_`
      setStyle(this.element, 'opacity', '');
      // Fade in/out the background in sync with the motion.
      setStyles(container, {
        animationName: enter ? 'fadeIn' : 'fadeOut',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 0.2, 1)',
        animationDuration: `${motionDuration}ms`,
        animationFillMode: 'forwards',
      });
      // Fade in the carousel at the end of the movement.
      setStyles(carousel, {
        animationName: 'fadeIn',
        animationDelay: `${motionDuration - 0.01}ms`,
        animationDuration: '0.01ms',
        animationFillMode: 'forwards',
      });
      srcImg.classList.add('i-amphtml-ghost');
      targetImg.classList.add('i-amphtml-ghost');
      // Apply the image animation prepared in the measure step.
      if (imageAnimation) {
        imageAnimation.applyAnimation();
      }
    };

    const cleanup = () => {
      toggle(this.element, enter);
      setStyle(container, 'animationName', '');
      setStyle(carousel, 'animationName', '');
      srcImg.classList.remove('i-amphtml-ghost');
      targetImg.classList.remove('i-amphtml-ghost');
      if (imageAnimation) {
        imageAnimation.cleanupAnimation();
      }
    };

    return this.measureMutateElement(measure, mutate)
        .then(() => delayAfterDeferringToEventLoop(this.win, duration))
        .then(() => this.mutateElement(cleanup));
  }

  /**
   * Animates an image from its current location to its target location in the
   * lightbox.
   * @param {!Element} sourceElement
   * @return {!Promise}
   * @private
   */
  transitionImgIn_(sourceElement) {
    return this.transitionImg_(sourceElement, true);
  }

  /**
   * Animate the lightbox image back to its original position in the page..
   * @param {!Element} sourceElement
   * @return {!Promise}
   * @private
   */
  transitionImgOut_(sourceElement) {
    return this.transitionImg_(sourceElement, false);
  }

  /**
   * If no transition image is applicable, fade the lightbox in and out.
   * @param {boolean} fadeIn Whether the lighbox is fading in or out.
   * @return {!Promise}
   * @private
   */
  fade_(fadeIn) {
    const duration = MIN_TRANSITION_DURATION * MOTION_DURATION_RATIO;

    return this.mutateElement(() => {
      if (fadeIn) {
        toggle(devAssert(this.carousel_), true);
        toggle(this.element, true);
      }

      setStyles(this.element, {
        animationName: fadeIn ? 'fadeIn' : 'fadeOut',
        animationFillMode: 'forwards',
        animationTimingFunction: FADE_CURVE,
        animationDuration: `${duration}ms`,
      });
    })
        .then(() => delayAfterDeferringToEventLoop(this.win, duration))
        .then(() => {
          setStyles(this.element, {
            animationName: '',
            animationFillMode: '',
            animationTimingFunction: '',
            animationDuration: '',
          });

          if (!fadeIn) {
            toggle(devAssert(this.carousel_), false);
            toggle(this.element, false);
          }
        });
  }

  /**
   * Entry animation to transition in a lightboxable image
   * @return {!Promise}
   * @private
   */
  enter_() { // TODO (cathyxz): make this generalizable to more than just images
    const {sourceElement} = this.getCurrentElement_();
    if (!this.elementTypeCanBeAnimated_(sourceElement)) {
      return this.fade_(/*fadeIn*/true);
    }

    return this.getCurrentElement_().imageViewer.signals()
        .whenSignal(CommonSignals.LOAD_END)
        .then(() => this.transitionImgIn_(sourceElement));
  }

  /**
   * Animation for closing lightbox
   * @return {!Promise}
   * @private
   */
  exit_() {
    const {sourceElement} = this.getCurrentElement_();
    if (!this.shouldAnimateOut_()) {
      return this.fade_(/*fadeIn*/false);
    }

    return this.transitionImgOut_(sourceElement);
  }

  /**
   * Calculates transition duration from vertical distance traveled
   * @param {number} dy
   * @param {number=} maxY
   * @param {number=} minDur
   * @param {number=} maxDur
   * @return {number}
   * @private
   */
  getTransitionDuration_(
    dy,
    maxY = MAX_DISTANCE_APPROXIMATION,
    minDur = MIN_TRANSITION_DURATION,
    maxDur = MAX_TRANSITION_DURATION
  ) {
    const distanceAdjustedDuration = Math.abs(dy) / maxY * maxDur;
    return clamp(
        distanceAdjustedDuration,
        minDur,
        maxDur
    );
  }

  /**
   * @param {!Element} sourceElement The source elemen to check.
   * @return {?Element} The parent carousel of the sourceElement, if one
   *    exists.
   */
  getSourceElementParentCarousel_(sourceElement) {
    // TODO(#13011): change to a tag selector after `<amp-carousel>`
    // type='carousel' starts supporting goToSlide.
    return closestAncestorElementBySelector(
        sourceElement, 'amp-carousel[type="slides"]');
  }

  /**
   * If the currently lightbox-ed element is bound to a carousel, then sync
   *  the carousel so that it is showing the currently lightbox-ed element.
   * @private
   */
  maybeSyncSourceCarousel_() {
    const target = this.getCurrentElement_().sourceElement;
    const parentCarousel = this.getSourceElementParentCarousel_(target);
    if (parentCarousel) {
      const allSlides = toArray(
          scopedQuerySelectorAll(parentCarousel, SLIDE_ITEM_SELECTOR));
      const targetSlide = dev().assertElement(
          closestAncestorElementBySelector(target, SLIDE_ITEM_SELECTOR));
      const targetSlideIndex = allSlides.indexOf(targetSlide);
      devAssert(parentCarousel).getImpl()
          .then(carousel => carousel.goToSlide(targetSlideIndex));
    }
  }

  /**
   * Closes the lightbox-gallery
   * @return {!Promise}
   * @private
   */
  close_() {
    if (!this.isActive_) {
      return Promise.resolve();
    }

    this.maybeSyncSourceCarousel_();

    this.isActive_ = false;

    this.cleanupEventListeners_();

    this.doc_.documentElement.removeEventListener(
        'keydown', this.boundOnKeyDown_);

    this.carousel_.removeEventListener(
        'slideChange', event => {this.slideChangeHandler_(event);});

    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.cleanup();

    return Promise.resolve()
        .then(() => {
          // If we do not have a scrollbar, exit now so that the user can
          // scroll during the exit animation. If we do have one, we need to
          // wait so that the animation plays correctly.
          if (!this.hasScrollbarWidth_) {
            this.getViewport().leaveLightboxMode();
          }
        })
        .then(() => {
          return this.mutateElement(() => {
            // If there's gallery, set gallery to display none
            this.container_.removeAttribute('gallery-view');

            if (this.gallery_) {
              this.gallery_.classList.add('i-amphtml-ghost');
              this.gallery_ = null;
            }
            this.clearDescOverflowState_();
          });
        })
        .then(() => this.exit_())
        .then(() => {
          if (this.hasScrollbarWidth_) {
            this.getViewport().leaveLightboxMode();
          }
          this.schedulePause(dev().assertElement(this.container_));
          this.pauseLightboxChildren_();
          this.carousel_ = null;
          if (this.historyId_ != -1) {
            this.history_.pop(this.historyId_);
          }
        });
  }

  /**
   * Handles keyboard events for the lightbox.
   *  -Esc will close the lightbox.
   * @param {!Event} event
   * @private
   */
  onKeyDown_(event) {
    if (!this.isActive_) {
      return;
    }
    const {key} = event;
    switch (key) {
      case Keys.ESCAPE:
        this.close_();
        break;
      case Keys.LEFT_ARROW:
        this.maybeSlideCarousel_(/*direction*/ -1);
        break;
      case Keys.RIGHT_ARROW:
        this.maybeSlideCarousel_(/*direction*/ 1);
        break;
      default:
        // Key not registered. Do nothing.
    }
  }

  /**
   * @param {number} direction 1 for forward or -1 for backwards.
   * @private
   */
  maybeSlideCarousel_(direction) {
    const isGalleryView = this.container_.hasAttribute('gallery-view');
    if (isGalleryView) {
      return;
    }
    devAssert(this.carousel_).getImpl().then(carousel => {
      carousel.goCallback(direction, /* animate */ true, /* autoplay */ false);
    });
  }

  /**
   * Display gallery view to show thumbnails of lightboxed elements
   * @private
   */
  openGallery_() {
    // Build gallery div for the first time
    if (!this.gallery_) {
      this.findOrBuildGallery_();
    }
    this.mutateElement(() => {
      this.container_.setAttribute('gallery-view', '');
      toggle(dev().assertElement(this.navControls_), false);
      toggle(dev().assertElement(this.carousel_), false);
      toggle(dev().assertElement(this.descriptionBox_), false);
    });
    triggerAnalyticsEvent(this.element, 'thumbnailsViewToggled', dict({}));
  }

  /**
   * Close gallery view
   * @return {!Promise}
   * @private
   */
  closeGallery_() {
    return this.mutateElement(() => {
      this.container_.removeAttribute('gallery-view');
      toggle(dev().assertElement(this.navControls_), true);
      toggle(dev().assertElement(this.carousel_), true);
      this.updateDescriptionBox_();
      toggle(dev().assertElement(this.descriptionBox_), true);
    });
  }

  /**
   * @private
   */
  findOrBuildGallery_() {
    const group = this.currentLightboxGroupId_;
    this.gallery_ = this.element.querySelector(
        `.i-amphtml-lbg-gallery[amp-lightbox-group=${
          escapeCssSelectorIdent(group)
        }]`);
    if (this.gallery_) {
      this.gallery_.classList.remove('i-amphtml-ghost');
      this.updateVideoThumbnails_();
    } else {
      // Build gallery
      this.gallery_ = htmlFor(this.doc_)`
      <div class="i-amphtml-lbg-gallery"></div>`;
      this.gallery_.setAttribute('amp-lightbox-group',
          this.currentLightboxGroupId_);

      this.initializeThumbnails_();

      this.mutateElement(() => {
        this.container_.appendChild(this.gallery_);
      });
    }
  }

  /**
   * Update timestamps for all videos in gallery thumbnails.
   * @private
   */
  updateVideoThumbnails_() {
    const thumbnails = this.manager_.getThumbnails(this.currentLightboxGroupId_)
        .map((thumbnail, index) => Object.assign({index}, thumbnail))
        .filter(thumbnail => VIDEO_TAGS[thumbnail.element.tagName]);

    this.mutateElement(() => {
      thumbnails.forEach(thumbnail => {
        thumbnail.timestampPromise.then(ts => {
          // Many video players (e.g. amp-youtube) that don't support this API
          // will often return 1. So sometimes we will erroneously show a
          // timestamp of 1 second instead of no timestamp.
          if (!ts || isNaN(ts)) {
            return;
          }
          const timestamp = this.secondsToTimestampString_(ts);
          const thumbnailContainer = dev().assertElement(
              this.gallery_.childNodes[thumbnail.index]);
          const timestampDiv = childElementByTag(thumbnailContainer, 'div');
          if (timestampDiv.childNodes.length > 1) {
            timestampDiv.removeChild(timestampDiv.childNodes[1]);
          }
          timestampDiv.appendChild(
              this.doc_.createTextNode(timestamp));
          timestampDiv.classList.add('i-amphtml-lbg-has-timestamp');
        });
      });
    });
  }

  /**
   * Create thumbnails displayed in lightbox gallery.
   * This function only supports initialization now.
   * @private
   */
  initializeThumbnails_() {
    const thumbnails = [];
    this.manager_.getThumbnails(this.currentLightboxGroupId_)
        .forEach(thumbnail => {
          // Don't include thumbnails for ads, this may be subject to
          // change pending user feedback or ux experiments after launch
          if (thumbnail.element.tagName == 'AMP-AD') {
            return;
          }
          const thumbnailElement = this.createThumbnailElement_(thumbnail);
          thumbnails.push(thumbnailElement);
        });
    this.mutateElement(() => {
      thumbnails.forEach(thumbnailElement => {
        this.gallery_.appendChild(thumbnailElement);
      });
    });
  }

  /**
   * Pads the beginning of a string with a substring to a target length.
   * @param {string} s
   * @param {number} targetLength
   * @param {string} padString
   * @private
   */
  padStart_(s, targetLength, padString) {
    if (s.length >= targetLength) {
      return s;
    }
    targetLength = targetLength - s.length;
    let padding = padString;
    while (targetLength > padding.length) {
      padding += padString;
    }
    return padding.slice(0, targetLength) + s;
  }

  /**
   * Converts seconds to a timestamp formatted string.
   * @param {number} seconds
   * @return {string}
   * @private
   */
  secondsToTimestampString_(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const hh = this.padStart_(h.toString(), 2, '0');
    const mm = this.padStart_(m.toString(), 2, '0');
    const ss = this.padStart_(s.toString(), 2, '0');
    return hh + ':' + mm + ':' + ss;
  }

  /**
   * @param {Event} event
   * @param {string} id
   * @private
   */
  handleThumbnailClick_(event, id) {
    event.stopPropagation();
    Promise.all([
      this.closeGallery_(),
      devAssert(this.carousel_).getImpl(),
    ]).then(values => {
      this.currentElemId_ = id;
      values[1].goToSlide(this.currentElemId_);
      this.updateDescriptionBox_();
    });
  }

  /**
   * Create an element inside gallery from the thumbnail info from manager.
   * @param {!LightboxThumbnailDataDef} thumbnailObj
   * @return {!Element}
   * @private
   */
  createThumbnailElement_(thumbnailObj) {
    const element = htmlFor(this.doc_)`
    <div class="i-amphtml-lbg-gallery-thumbnail">
      <img class="i-amphtml-lbg-gallery-thumbnail-img"></img>
    </div>`;
    const imgElement = childElementByTag(element, 'img');

    if (thumbnailObj.srcset) {
      imgElement.setAttribute('srcset', thumbnailObj.srcset.stringify());
    } else {
      imgElement.setAttribute('src', thumbnailObj.placeholderSrc);
    }
    element.appendChild(imgElement);

    if (VIDEO_TAGS[thumbnailObj.element.tagName]) {
      const timestampDiv = htmlFor(this.doc_)`
      <div class="i-amphtml-lbg-thumbnail-timestamp-container">
        <span class="i-amphtml-lbg-thumbnail-play-icon"></span>
      <div>`;

      thumbnailObj.timestampPromise.then(ts => {
        // Many video players (e.g. amp-youtube) that don't support this API
        // will often return 1. This will sometimes result in erroneous values
        // of 1 second for video players that don't support getDuration.
        if (!ts || isNaN(ts)) {
          return;
        }
        const timestamp = this.secondsToTimestampString_(ts);
        timestampDiv.appendChild(
            this.doc_.createTextNode(timestamp));
        timestampDiv.classList.add('i-amphtml-lbg-has-timestamp');
      });
      element.appendChild(timestampDiv);
    }

    element.addEventListener('click', e => {
      this.handleThumbnailClick_(e, thumbnailObj.element.lightboxItemId);
    });
    return element;
  }
}

/**
 * Tries to find an existing amp-lightbox-gallery, if there is none, it adds a
 * default one.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<undefined>}
 */
export function installLightboxGallery(ampdoc) {
  // Make sure to wait for the ampdoc to finish loading, see:
  // https://github.com/ampproject/amphtml/issues/19728#issuecomment-446033966
  return ampdoc.whenReady()
      .then(() => ampdoc.getBody())
      .then(body => {
        const existingGallery = elementByTag(ampdoc.getRootNode(), TAG);
        if (!existingGallery) {
          const gallery = ampdoc.win.document.createElement(TAG);
          gallery.setAttribute('layout', 'nodisplay');
          gallery.setAttribute('id', DEFAULT_GALLERY_ID);
          body.appendChild(gallery);
        }
      });
}

/**
 * Returns a promise for the LightboxManager.
 * @param {!Element} element
 * @return {!Promise<?LightboxManager>}
 */
function lightboxManagerForDoc(element) {
  return /** @type {!Promise<?LightboxManager>} */ (
    getElementServiceForDoc(
        element, 'amp-lightbox-manager', 'amp-lightbox-gallery'));
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  AMP.registerServiceForDoc('amp-lightbox-manager', LightboxManager);
  Services.extensionsFor(AMP.win).addDocFactory(installLightboxGallery);
});
