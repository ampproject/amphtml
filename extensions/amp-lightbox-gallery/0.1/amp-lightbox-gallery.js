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
import {CommonSignals} from '../../../src/core/constants/common-signals';
import {
  ELIGIBLE_TAP_TAGS,
  LightboxManager,
  LightboxThumbnailDataDef,
  VIDEO_TAGS,
} from './service/lightbox-manager-impl';
import {Gestures} from '../../../src/gesture';
import {Keys} from '../../../src/core/constants/key-codes';
import {LightboxCaption, OverflowState} from './lightbox-caption';
import {LightboxControls, LightboxControlsAction} from './lightbox-controls';
import {Services} from '../../../src/services';
import {SwipeDef, SwipeYRecognizer} from '../../../src/gesture-recognizers';
import {SwipeToDismiss} from './swipe-to-dismiss';
import {
  childElementByTag,
  closest,
  closestAncestorElementBySelector,
  elementByTag,
  getVerticalScrollbarWidth,
  scopedQuerySelectorAll,
  toggleAttribute,
} from '../../../src/dom';
import {clamp} from '../../../src/utils/math';
import {
  delayAfterDeferringToEventLoop,
  secondsToTimestampString,
} from './utils';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/core/types/object';
import {escapeCssSelectorIdent} from '../../../src/css';
import {getData, getDetail, isLoaded, listen} from '../../../src/event-helper';
import {getElementServiceForDoc} from '../../../src/element-service';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {prepareImageAnimation} from '@ampproject/animations';
import {reportError} from '../../../src/error-reporting';
import {setStyle, setStyles, toggle} from '../../../src/style';
import {toArray} from '../../../src/core/types/array';
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

// Use S Curves for entry and exit animations
const TRANSITION_CURVE = {x1: 0.8, y1: 0, x2: 0.2, y2: 1};

// Keep in sync with [i-amphtml-lbg-fade]'s animation duration
const FADE_DURATION = 400; // ms;
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
 * @private visible for testing.
 */
export class AmpLightboxGallery extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Document} */
    this.doc_ = this.win.document;

    /** @private {boolean} */
    this.isActive_ = false;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {number} */
    this.currentElemId_ = -1;

    /** @private {function(!Event)} */
    this.boundOnKeyDown_ = this.onKeyDown_.bind(this);

    /** @private {function(!Event)} */
    this.boundSlideChangeHandler_ = this.slideChangeHandler_.bind(this);

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
    this.overlay_ = null;

    /** @private {?Element} */
    this.mask_ = null;

    /** @protected {?Element} */
    this.navControls_ = null;

    /** @private {?Element} */
    this.carousel_ = null;

    /** @private {?LightboxCaption} */
    this.lightboxCaption_ = null;

    /** @private {?LightboxControls} */
    this.lightboxControls_ = null;

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @protected  {?Element} */
    this.topBar_ = null;

    /** @private {!LightboxControlsModes} */
    this.controlsMode_ = LightboxControlsModes.CONTROLS_DISPLAYED;

    /** @private {?UnlistenDef} */
    this.unlistenClick_ = null;

    /** @private {string} */
    this.currentLightboxGroupId_ = 'default';

    /**
     * @private {boolean}
     */
    this.hasVerticalScrollbarWidth_ = false;

    /** @private @const */
    this.boundMeasureMutate_ = this.measureMutateElement.bind(this);

    /** @private @const */
    this.swipeToDismiss_ = new SwipeToDismiss(
      this.win,
      this.element,
      (cb) => this.mutateElement(cb),
      () => this.close_()
    );
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /** @override */
  buildCallback() {
    return lightboxManagerForDoc(this.element)
      .then((manager) => {
        this.manager_ = manager;
        this.history_ = Services.historyForDoc(this.getAmpDoc());
        this.action_ = Services.actionServiceForDoc(this.element);
        return this.getAmpDoc().whenFirstVisible();
      })
      .then(() => {
        this.container_ = htmlFor(/** @type {!Document} */ (this.doc_))`
        <div class="i-amphtml-lbg">
          <div class="i-amphtml-lbg-mask"></div>
        </div>`;
        this.mask_ = this.container_.querySelector('.i-amphtml-lbg-mask');
        this.element.appendChild(this.container_);
        this.manager_.maybeInit();
        this.registerDefaultAction(
          (invocation) => this.openAction_(invocation),
          'open'
        );
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
  buildOverlay_() {
    this.overlay_ = htmlFor(this.doc_)`
      <div class="i-amphtml-lbg-overlay"></div>`;
    const descriptionBoxElement = this.buildDescriptionBox_();
    const controlsElement = this.buildControls_();
    this.mutateElement(() => {
      this.overlay_.appendChild(descriptionBoxElement);
      this.overlay_.appendChild(controlsElement);
      this.container_.appendChild(this.overlay_);
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

    if (!this.overlay_) {
      this.buildOverlay_();
    }
    return this.findOrBuildCarousel_(lightboxGroupId);
  }

  /**
   * Return a cleaned clone of the given element for building
   * carousel slides with.
   * @param {!Element} element
   * @return {!Node}
   * @private
   */
  cloneLightboxableElement_(element) {
    const fallback = element.getFallback();
    const shouldCloneFallback =
      element.classList.contains('amp-notsupported') && !!fallback;
    if (shouldCloneFallback) {
      element = fallback;
    }
    const deepClone = !element.classList.contains('i-amphtml-element');
    const clonedNode = element.cloneNode(deepClone);
    clonedNode.removeAttribute('on');
    clonedNode.removeAttribute('id');
    clonedNode.removeAttribute('i-amphtml-layout');
    clonedNode.removeAttribute('fallback');
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
    lightboxableElements.forEach((element) => {
      element.lightboxItemId = index++;
      const clonedNode = this.cloneLightboxableElement_(element);
      const descText = this.manager_.getDescription(element);
      const metadata = {
        descriptionText: descText,
        tagName: /** @type {string} */ (clonedNode.tagName),
        sourceElement: element,
        element: dev().assertElement(clonedNode),
      };
      let slide = clonedNode;
      if (ELIGIBLE_TAP_TAGS[clonedNode.tagName]) {
        const container = this.doc_.createElement('div');
        const imageViewer = htmlFor(this.doc_)`
          <amp-image-viewer layout="fill"></amp-image-viewer>`;
        // Copy any data attributes from the cloneNode to the new slide
        // container. For example. when cloning carousel slides, we want to
        // carry over data-slide-id.
        for (const name in clonedNode.dataset) {
          container.dataset[name] = clonedNode.dataset[name];
        }
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
      `amp-carousel[amp-lightbox-group=${escapeCssSelectorIdent(
        lightboxGroupId
      )}]`
    );
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
    const carouselVersion = isExperimentOn(
      this.win,
      'amp-lightbox-gallery-carousel-0-2'
    )
      ? '0.2'
      : '0.1';

    return Promise.all([
      Services.extensionsFor(this.win).installExtensionForDoc(
        this.getAmpDoc(),
        'amp-carousel',
        carouselVersion
      ),
      Services.extensionsFor(this.win).installExtensionForDoc(
        this.getAmpDoc(),
        'amp-image-viewer'
      ),
    ])
      .then(() => {
        return this.manager_.getElementsForLightboxGroup(lightboxGroupId);
      })
      .then((list) => {
        this.carousel_ = htmlFor(this.doc_)`
          <amp-carousel type="slides" layout="fill" loop="true"></amp-carousel>
        `;
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
    toggleAttribute(this.element, 'i-amphtml-lbg-single-item', itemLength <= 1);
  }

  /**
   * Handles slide change.
   * @param {!Event} event
   * @private
   */
  slideChangeHandler_(event) {
    const index = getData(event)['index'];

    // Avoid updating the description box unless the slide actually changed.
    // That would collapse it if we opened it with an expanded state.
    if (index == this.currentElemId_) {
      return;
    }

    this.currentElemId_ = index;
    this.updateDescriptionBox_();
  }

  /**
   * Builds the description box, containing the current slide's caption, if
   * any.
   * @return {!Element} The description box element.
   * @private
   */
  buildDescriptionBox_() {
    this.lightboxCaption_ = LightboxCaption.build(
      this.doc_,
      this.boundMeasureMutate_
    );
    const el = this.lightboxCaption_.getElement();
    el.addEventListener('click', (event) => {
      triggerAnalyticsEvent(
        this.element,
        'descriptionOverflowToggled',
        dict({})
      );
      this.lightboxCaption_.toggleOverflow();
      event.stopPropagation();
      event.preventDefault();
    });
    return el;
  }

  /**
   * Builds the overlay controls including the close, gallery toggle and next/
   * prev slide buttons.
   * @return {!Element} The container for the controls.
   * @private
   */
  buildControls_() {
    this.lightboxControls_ = LightboxControls.build(
      this.win,
      this.doc_,
      this.boundMeasureMutate_
    );
    const el = this.lightboxControls_.getElement();
    el.addEventListener('action', (event) => {
      switch (getDetail(event)['action']) {
        case LightboxControlsAction.CLOSE:
          this.close_();
          break;
        case LightboxControlsAction.GALLERY:
          this.openGallery_();
          break;
        case LightboxControlsAction.SLIDES:
          this.closeGallery_();
          break;
        case LightboxControlsAction.NEXT:
          this.nextSlide_();
          break;
        case LightboxControlsAction.PREV:
          this.prevSlide_();
          break;
        default:
          break;
      }
    });
    return el;
  }

  /**
   * Update description box text.
   * @param {boolean=} expandDescription Whether the description should be
   *    expanded.
   * @private
   */
  updateDescriptionBox_(expandDescription = false) {
    const descText = this.getCurrentElement_().descriptionText;

    this.mutateElement(() => {
      this.lightboxCaption_.setContent(descText);
      // Set the caption to clip immediately, this is less jarring when the
      // caption overflows initiially.
      this.lightboxCaption_.setOverflowState(OverflowState.CLIP);
      this.lightboxCaption_.toggleOverflow(expandDescription);
    });
  }

  /**
   * @private
   */
  nextSlide_() {
    devAssert(this.carousel_)
      .getImpl()
      .then((carousel) => {
        carousel.interactionNext();
      });
  }

  /**
   * @private
   */
  prevSlide_() {
    devAssert(this.carousel_)
      .getImpl()
      .then((carousel) => {
        carousel.interactionPrev();
      });
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
    const consumingElement = closest(
      target,
      (element) => {
        return (
          element.tagName == 'BUTTON' ||
          element.tagName == 'A' ||
          element.getAttribute('role') == 'button'
        );
      },
      this.container_
    );

    const clickConsumed = consumingElement !== null;
    const hasTap = this.action_.hasAction(
      target,
      'tap',
      dev().assertElement(this.container_)
    );
    return !(clickConsumed || hasTap);
  }

  /**
   * Toggle lightbox overlay (description and controls).
   * @param {!Event} e
   * @private
   */
  onToggleOverlay_(e) {
    if (this.shouldHandleClick_(e)) {
      if (this.controlsMode_ == LightboxControlsModes.CONTROLS_HIDDEN) {
        this.showOverlay_();
      } else if (!this.container_.hasAttribute('gallery-view')) {
        this.hideControls_();
      }
    }
    triggerAnalyticsEvent(this.element, 'controlsToggled', dict({}));
  }

  /**
   * Show the lightbox overlay (description and controls).
   * @private
   */
  showOverlay_() {
    this.overlay_.setAttribute('i-amphtml-lbg-fade', 'in');
    this.controlsMode_ = LightboxControlsModes.CONTROLS_DISPLAYED;
  }

  /**
   * Hide the lightbox overlay (description and controls).
   * @private
   */
  hideControls_() {
    this.overlay_.setAttribute('i-amphtml-lbg-fade', 'out');
    this.controlsMode_ = LightboxControlsModes.CONTROLS_HIDDEN;
  }

  /**
   * Set up event listeners.
   * @private
   */
  setupEventListeners_() {
    devAssert(this.container_);
    const onToggleControls = this.onToggleOverlay_.bind(this);
    this.unlistenClick_ = listen(
      dev().assertElement(this.container_),
      'click',
      onToggleControls
    );
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
   * Set up gestures
   * @private
   */
  setupGestures_() {
    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.onGesture(SwipeYRecognizer, (e) => {
      const {data} = e;
      this.swipeGesture_(data);
    });
  }

  /**
   * Handles a swipe gesture, updating the current swipe to dismiss state.
   * @param {!SwipeDef} data
   */
  swipeGesture_(data) {
    if (data.first) {
      const {sourceElement} = this.getCurrentElement_();
      const parentCarousel = this.getSourceElementParentCarousel_(
        sourceElement
      );

      this.swipeToDismiss_.startSwipe({
        swipeElement: dev().assertElement(this.carousel_),
        hiddenElement: parentCarousel || sourceElement,
        mask: dev().assertElement(this.mask_),
        overlay: dev().assertElement(this.overlay_),
      });
      return;
    }

    this.swipeToDismiss_.swipeMove(data);
  }

  /**
   * Pauses lightbox childred.
   */
  pauseLightboxChildren_() {
    const lbgId = this.currentLightboxGroupId_;
    const slides = this.elementsMetadata_[lbgId].map(
      (elemMetadata) => elemMetadata.element
    );
    Services.ownersForDoc(this.element).schedulePause(this.element, slides);
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
   * @param {!Element} element The element to open a lightbox for.
   * @param {boolean=} expandDescription Whether or not the description should
   *    be initially expanded. Defaults to collapsed.
   * @return {!Promise<undefined>} A Promise that resolves once the open has
   *    completed.
   */
  open(element, expandDescription = false) {
    return this.openLightboxGallery_(
      dev().assertElement(element),
      expandDescription
    )
      .then(() => {
        return this.history_.push(this.close_.bind(this));
      })
      .then((historyId) => {
        this.historyId_ = historyId;
      });
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
  openAction_(invocation) {
    const args = invocation.args || {};
    const id = args['id'];
    const expandDescription = args['expandDescription'];
    const target = id ? this.getAmpDoc().getElementById(id) : invocation.caller;
    userAssert(
      target,
      'amp-lightbox-gallery.open: element with id: %s not found',
      id
    );
    this.open(dev().assertElement(target), expandDescription);
  }

  /**
   * Opens the lightbox-gallery and displays the given element inside.
   * @param {!Element} element Element to lightbox.
   * @param {boolean=} expandDescription Whether or not the description should
   *    be initially expanded.
   * @return {!Promise}
   * @private
   */
  openLightboxGallery_(element, expandDescription) {
    const lightboxGroupId = element.getAttribute('lightbox') || 'default';
    this.currentLightboxGroupId_ = lightboxGroupId;
    this.hasVerticalScrollbarWidth_ = getVerticalScrollbarWidth(this.win) > 0;
    return this.findOrInitializeLightbox_(lightboxGroupId)
      .then(() => {
        return this.getViewport().enterLightboxMode();
      })
      .then(() => {
        return this.mutateElement(() => {
          toggle(this.element, true);
          setStyle(this.element, 'opacity', 0);
          this.overlay_.removeAttribute('i-amphtml-lbg-fade');
        });
      })
      .then(() => {
        this.isActive_ = true;

        const owners = Services.ownersForDoc(this.element);
        owners.scheduleLayout(
          this.element,
          dev().assertElement(this.container_)
        );

        this.doc_.documentElement.addEventListener(
          'keydown',
          this.boundOnKeyDown_
        );

        this.carousel_.addEventListener(
          'slideChange',
          this.boundSlideChangeHandler_
        );

        this.setupGestures_();
        this.setupEventListeners_();

        return this.carousel_.signals().whenSignal(CommonSignals.LOAD_END);
      })
      .then(() => this.openLightboxForElement_(element, expandDescription))
      .then(() => {
        setStyle(this.element, 'opacity', '');
        this.showOverlay_();
        triggerAnalyticsEvent(this.element, 'lightboxOpened', dict({}));
      });
  }

  /**
   * Given a lightbox element index, opens the internal carousel slide
   * associated with said index, updates the description, and initializes
   * the image viewer if the element is an amp-img.
   * @param {!Element} element
   * @param {boolean=} expandDescription Whether or not the description should
   *    be initially expanded.
   * @return {!Promise}
   * @private
   */
  openLightboxForElement_(element, expandDescription) {
    this.currentElemId_ = element.lightboxItemId;
    devAssert(this.carousel_)
      .getImpl()
      .then((carousel) => carousel.goToSlide(this.currentElemId_));
    this.updateDescriptionBox_(expandDescription);
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
    return this.elementTypeCanBeAnimated_(target);
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
    return this.getCurrentElement_()
      .imageViewer.getImpl()
      .then((imageViewer) => {
        const {width, height} = imageViewer.getImageBoxWithOffset() || {};

        // Check if our imageBox has a width or height. We may be in the
        // gallery view if not, and we do not want to animate.
        if (!width || !height) {
          return this.fade_(/*fadeIn*/ enter);
        }

        const lightboxImg = imageViewer.getImage();
        const sourceImg = childElementByTag(sourceElement, 'img');
        return this.runImgTransition_(
          enter ? sourceImg : lightboxImg,
          enter ? lightboxImg : sourceImg,
          enter
        );
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
    const srcRect = srcImg./*OK*/ getBoundingClientRect();
    const destRect = targetImg./*OK*/ getBoundingClientRect();
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
      const srcCropEl =
        closestAncestorElementBySelector(srcImg, 'amp-img') || srcImg;
      const targetCropEl =
        closestAncestorElementBySelector(targetImg, 'amp-img') || targetImg;

      duration = this.getTransitionDurationFromElements_(srcImg, targetImg);
      motionDuration = MOTION_DURATION_RATIO * duration;
      // Prepare the actual image animation.
      try {
        imageAnimation = prepareImageAnimation({
          styleContainer: this.getAmpDoc().getHeadNode(),
          transitionContainer: this.getAmpDoc().getBody(),
          srcImg,
          srcCropRect: srcCropEl./*OK*/ getBoundingClientRect(),
          targetImg,
          targetCropRect: targetCropEl./*OK*/ getBoundingClientRect(),
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
    return this.mutateElement(() => {
      if (fadeIn) {
        toggle(dev().assertElement(this.carousel_), true);
        toggle(this.element, true);
      }

      this.element.setAttribute('i-amphtml-lbg-fade', fadeIn ? 'in' : 'out');
    })
      .then(() => delayAfterDeferringToEventLoop(this.win, FADE_DURATION))
      .then(() => {
        this.element.removeAttribute('i-amphtml-lbg-fade');

        if (!fadeIn) {
          toggle(dev().assertElement(this.carousel_), false);
          toggle(this.element, false);
        }
      });
  }

  /**
   * Entry animation to transition in a lightboxable image
   * @return {!Promise}
   * @private
   */
  enter_() {
    // TODO (cathyxz): make this generalizable to more than just images
    const {sourceElement} = this.getCurrentElement_();
    if (!this.elementTypeCanBeAnimated_(sourceElement)) {
      return this.fade_(/*fadeIn*/ true);
    }

    return this.getCurrentElement_()
      .imageViewer.signals()
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
      return this.fade_(/*fadeIn*/ false);
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
    const distanceAdjustedDuration = (Math.abs(dy) / maxY) * maxDur;
    return clamp(distanceAdjustedDuration, minDur, maxDur);
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
      sourceElement,
      'amp-carousel[type="slides"], amp-base-carousel'
    );
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
        scopedQuerySelectorAll(parentCarousel, SLIDE_ITEM_SELECTOR)
      );
      const targetSlide = dev().assertElement(
        closestAncestorElementBySelector(target, SLIDE_ITEM_SELECTOR)
      );
      const targetSlideIndex = allSlides.indexOf(targetSlide);
      devAssert(parentCarousel)
        .getImpl()
        .then((carousel) => carousel.goToSlide(targetSlideIndex));
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
      'keydown',
      this.boundOnKeyDown_
    );

    this.carousel_.removeEventListener(
      'slideChange',
      this.boundSlideChangeHandler_
    );

    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.cleanup();

    this.lightboxCaption_.toggleOverflow(false);
    return this.mutateElement(() => {
      // If we do not have a vertical scrollbar taking width, immediately
      // leave lightbox mode so that the user can scroll the page. This makes
      // things feel much more responsive. When we have a vertical scrollbar,
      // taking width we do not leave lightbox mode here as it will cause jank
      // at the start of the animation. On browsers with non-overlaying
      // scrollbars, this is still consistent, as they cannot scroll during
      // the animation if it has  a width, or if it does not (i.e. there is no
      // overflow to scroll).
      if (!this.hasVerticalScrollbarWidth_) {
        this.getViewport().leaveLightboxMode();
      }
      // If there's gallery, set gallery to display none
      this.container_.removeAttribute('gallery-view');

      if (this.gallery_) {
        this.gallery_.classList.add('i-amphtml-ghost');
        this.gallery_ = null;
      }
    })
      .then(() => this.exit_())
      .then(() => {
        // Leave lightbox mode now that it will not affect the animation.
        if (this.hasVerticalScrollbarWidth_) {
          this.getViewport().leaveLightboxMode();
        }
        Services.ownersForDoc(this.element).schedulePause(
          this.element,
          dev().assertElement(this.container_)
        );
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
    devAssert(this.carousel_)
      .getImpl()
      .then((carousel) => {
        carousel.goCallback(
          direction,
          /* animate */ true,
          /* autoplay */ false
        );
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
    this.lightboxCaption_.toggleOverflow(false);
    this.mutateElement(() => {
      this.container_.setAttribute('gallery-view', '');
      toggle(dev().assertElement(this.carousel_), false);
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
      toggle(dev().assertElement(this.carousel_), true);
      this.updateDescriptionBox_();
    });
  }

  /**
   * @private
   */
  findOrBuildGallery_() {
    const group = this.currentLightboxGroupId_;
    this.gallery_ = this.element.querySelector(
      `.i-amphtml-lbg-gallery[amp-lightbox-group=${escapeCssSelectorIdent(
        group
      )}]`
    );
    if (this.gallery_) {
      this.gallery_.classList.remove('i-amphtml-ghost');
      this.updateVideoThumbnails_();
    } else {
      // Build gallery
      this.gallery_ = htmlFor(/** @type {!Document} */ (this.doc_))`
      <div class="i-amphtml-lbg-gallery"></div>`;
      this.gallery_.setAttribute(
        'amp-lightbox-group',
        this.currentLightboxGroupId_
      );

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
    const thumbnails = this.manager_
      .getThumbnails(this.currentLightboxGroupId_)
      .map((thumbnail, index) => ({index, ...thumbnail}))
      .filter((thumbnail) => VIDEO_TAGS[thumbnail.element.tagName]);

    this.mutateElement(() => {
      thumbnails.forEach((thumbnail) => {
        thumbnail.timestampPromise.then((ts) => {
          // Many video players (e.g. amp-youtube) that don't support this API
          // will often return 1. So sometimes we will erroneously show a
          // timestamp of 1 second instead of no timestamp.
          if (!ts || isNaN(ts)) {
            return;
          }
          const timestamp = secondsToTimestampString(ts);
          const thumbnailContainer = dev().assertElement(
            this.gallery_.childNodes[thumbnail.index]
          );
          const timestampDiv = childElementByTag(thumbnailContainer, 'div');
          if (timestampDiv.childNodes.length > 1) {
            timestampDiv.removeChild(timestampDiv.childNodes[1]);
          }
          timestampDiv.appendChild(this.doc_.createTextNode(timestamp));
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
    this.manager_
      .getThumbnails(this.currentLightboxGroupId_)
      .forEach((thumbnail) => {
        // Don't include thumbnails for ads, this may be subject to
        // change pending user feedback or ux experiments after launch
        if (thumbnail.element.tagName == 'AMP-AD') {
          return;
        }
        const thumbnailElement = this.createThumbnailElement_(thumbnail);
        thumbnails.push(thumbnailElement);
      });
    this.mutateElement(() => {
      thumbnails.forEach((thumbnailElement) => {
        this.gallery_.appendChild(thumbnailElement);
      });
    });
  }

  /**
   * @param {Event} event
   * @param {number} id
   * @private
   */
  handleThumbnailClick_(event, id) {
    event.stopPropagation();
    Promise.all([
      this.closeGallery_(),
      devAssert(this.carousel_).getImpl(),
    ]).then((values) => {
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
    const element = htmlFor(/** @type {!Document} */ (this.doc_))`
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
      const timestampDiv = htmlFor(/** @type {!Document} */ (this.doc_))`
      <div class="i-amphtml-lbg-thumbnail-timestamp-container">
        <span class="i-amphtml-lbg-thumbnail-play-icon"></span>
      <div>`;

      thumbnailObj.timestampPromise.then((ts) => {
        // Many video players (e.g. amp-youtube) that don't support this API
        // will often return 1. This will sometimes result in erroneous values
        // of 1 second for video players that don't support getDuration.
        if (!ts || isNaN(ts)) {
          return;
        }
        const timestamp = secondsToTimestampString(ts);
        timestampDiv.appendChild(this.doc_.createTextNode(timestamp));
        timestampDiv.classList.add('i-amphtml-lbg-has-timestamp');
      });
      element.appendChild(timestampDiv);
    }

    element.addEventListener('click', (e) => {
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
  return ampdoc
    .whenReady()
    .then(() => ampdoc.getBody())
    .then((body) => {
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
  return /** @type {!Promise<?LightboxManager>} */ (getElementServiceForDoc(
    element,
    'amp-lightbox-manager',
    'amp-lightbox-gallery'
  ));
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  AMP.registerServiceForDoc('amp-lightbox-manager', LightboxManager);
  Services.extensionsFor(AMP.win).addDocFactory(installLightboxGallery);
});
