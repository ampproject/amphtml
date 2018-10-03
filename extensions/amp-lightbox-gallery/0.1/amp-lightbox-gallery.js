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


import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-lightbox-gallery-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {
  ELIGIBLE_TAP_TAGS,
  LightboxManager,
  LightboxThumbnailDataDef,
  LightboxedCarouselMetadataDef,
  VIDEO_TAGS,
} from './service/lightbox-manager-impl';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {SwipeYRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {
  childElementByTag,
  closest,
  closestBySelector,
  elementByTag,
  escapeCssSelectorIdent,
} from '../../../src/dom';
import {clamp} from '../../../src/utils/math';
import {
  concat as concatTransition,
  numeric,
  scale,
  setStyles as setStylesTransition,
  translate,
} from '../../../src/transition';
import {dev, user} from '../../../src/log';
import {getData, isLoaded, listen} from '../../../src/event-helper';
import {
  getElementServiceForDoc,
} from '../../../src/element-service';
import {layoutRectFromDomRect} from '../../../src/layout-rect';
import {px, setStyles, toggle} from '../../../src/style';
import {toArray} from '../../../src/types';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @const */
const TAG = 'amp-lightbox-gallery';
const DEFAULT_GALLERY_ID = 'amp-lightbox-gallery';

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

const SWIPE_TO_CLOSE_THRESHOLD = 10;

// Use S Curves for entry and exit animations
const ENTER_CURVE_ = bezierCurve(0.8, 0, 0.2, 1);
const EXIT_CURVE_ = bezierCurve(0.8, 0, 0.2, 1);

const MAX_TRANSITION_DURATION = 1000; // ms
const MIN_TRANSITION_DURATION = 500; // ms
const MAX_DISTANCE_APPROXIMATION = 250; // px
const MOTION_DURATION_RATIO = 0.8; // fraction of animation
const EPSILON = 0.01; // precision for approx equals


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
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /** @override */
  buildCallback() {
    return lightboxManagerForDoc(this.getAmpDoc()).then(manager => {
      this.manager_ = manager;
      this.history_ = Services.historyForDoc(this.getAmpDoc());
      this.action_ = Services.actionServiceForDoc(this.getAmpDoc());
      const viewer = Services.viewerForDoc(this.getAmpDoc());
      return viewer.whenFirstVisible();
    }).then(() => {
      this.container_ = this.win.document.createElement('div');
      this.container_.classList.add('i-amphtml-lbg');
      this.element.appendChild(this.container_);
      this.manager_.maybeInit();
      this.buildMask_();
      this.registerAction('open', invocation => this.activate(invocation));
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
    this.controlsContainer_ = this.win.document.createElement('div');
    this.controlsContainer_.classList.add('i-amphtml-lbg-controls');
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
      this.carouselContainer_ = this.win.document.createElement('div');
      this.container_.appendChild(this.carouselContainer_);
    }

    if (!this.controlsContainer_) {
      this.buildControls_();
    }
    return this.findOrBuildCarousel_(lightboxGroupId);
  }

  /**
   * Builds the page mask and appends it to the container.
   * @private
   */
  buildMask_() {
    dev().assert(this.container_);
    const mask = this.win.document.createElement('div');
    mask.classList.add('i-amphtml-lbg-mask');
    this.container_.appendChild(mask);
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
        const container = this.element.ownerDocument.createElement('div');
        const imageViewer = this.win.document.createElement('amp-image-viewer');
        imageViewer.setAttribute('layout', 'fill');
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
    dev().assert(this.container_);
    const existingCarousel = this.element.querySelector(
        `amp-carousel[amp-lightbox-group=${
          escapeCssSelectorIdent(lightboxGroupId)
        }]`);
    if (existingCarousel) {
      this.carousel_ = existingCarousel;
      return this.mutateElement(() => {
        const numSlides = this.elementsMetadata_[lightboxGroupId].length;
        this.toggleNavControls_(numSlides);
        toggle(dev().assertElement(this.carousel_), true);
      });
    } else {
      return this.buildCarousel_(lightboxGroupId);
    }
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
      this.carousel_ = this.win.document.createElement('amp-carousel');
      this.carousel_.setAttribute('type', 'slides');
      this.carousel_.setAttribute('layout', 'fill');
      this.carousel_.setAttribute('loop', '');
      this.carousel_.setAttribute('amp-lightbox-group', lightboxGroupId);
      this.buildCarouselSlides_(list);
      return this.mutateElement(() => {
        this.carouselContainer_.appendChild(this.carousel_);
        this.toggleNavControls_(list.length);
      });
    });
  }

  /**
   * @param {number} noOfChildren
   * @private
   */
  toggleNavControls_(noOfChildren) {
    if (noOfChildren > 1) {
      this.controlsContainer_.classList.remove('i-amphtml-lbg-single');
    } else {
      this.controlsContainer_.classList.add('i-amphtml-lbg-single');
    }
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
    this.descriptionBox_ = this.win.document.createElement('div');
    this.descriptionBox_.classList.add('i-amphtml-lbg-desc-box');
    this.descriptionBox_.classList.add('i-amphtml-lbg-standard');

    this.descriptionTextArea_ = this.win.document.createElement('div');
    this.descriptionTextArea_.classList.add('i-amphtml-lbg-desc-text');

    this.descriptionOverflowMask_ = this.win.document.createElement('div');
    this.descriptionOverflowMask_.classList.add('i-amphtml-lbg-desc-mask');

    this.descriptionBox_.appendChild(this.descriptionOverflowMask_);
    this.descriptionBox_.appendChild(this.descriptionTextArea_);

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
    triggerAnalyticsEvent(this.element, 'descriptionOverflowToggled', {});
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
        toggle(dev().assertElement(this.navControls_), false);
        toggle(dev().assertElement(this.topBar_), false);
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
    toggle(dev().assertElement(this.navControls_), true);
    toggle(dev().assertElement(this.topBar_), true);
  }

  /**
   * @private
   */
  nextSlide_() {
    dev().assert(this.carousel_).getImpl().then(carousel => {
      carousel.interactionNext();
    });
  }

  /**
   * @private
   */
  prevSlide_() {
    dev().assert(this.carousel_).getImpl().then(carousel => {
      carousel.interactionPrev();
    });
  }

  /**
   * @private
   */
  buildNavControls_() {
    this.navControls_ = this.win.document.createElement('div');
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
    dev().assert(this.container_);
    this.topBar_ = this.win.document.createElement('div');
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
    dev().assert(this.topBar_);
    const button = this.win.document.createElement('div');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', label);

    const icon = this.win.document.createElement('span');
    icon.classList.add('i-amphtml-lbg-icon');
    button.appendChild(icon);
    button.classList.add(className);
    button.classList.add('i-amphtml-lbg-button');

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
    triggerAnalyticsEvent(this.element, 'controlsToggled', {});
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
    dev().assert(this.container_);
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
   * Set up gestures
   * @private
   */
  setupGestures_() {
    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.onGesture(SwipeYRecognizer, e => {
      if (e.data.last) {
        this.onMoveRelease_(e.data.deltaY);
      }
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
    const currentElement = dev().assert(
        this.elementsMetadata_[lbgId][this.currentElemId_]
    );
    return currentElement;
  }

  /**
   * Closes the lightbox gallery on a tiny upwards swipe.
   * @param {number} deltaY
   * @private
   */
  onMoveRelease_(deltaY) {
    if (Math.abs(deltaY) > SWIPE_TO_CLOSE_THRESHOLD) {
      this.close_();
    }
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
   * @override
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  activate(invocation) {
    let target = invocation.caller;
    if (invocation.args && invocation.args['id']) {
      const targetId = invocation.args['id'];
      target = this.getAmpDoc().getElementById(targetId);
      user().assert(target,
          'amp-lightbox-gallery.open: element with id: %s not found', targetId);
    }
    this.open_(dev().assertElement(target)).then(() => {
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
  open_(element) {
    this.sourceElement_ = element;
    const lightboxGroupId = element.getAttribute('lightbox')
      || 'default';
    this.currentLightboxGroupId_ = lightboxGroupId;
    return this.findOrInitializeLightbox_(lightboxGroupId).then(() => {
      return this.mutateElement(() => {
        toggle(this.element, true);
        setStyles(this.element, {
          opacity: 0,
        });
        this.controlsContainer_.classList.remove('i-amphtml-lbg-fade-in');
        this.controlsContainer_.classList.add('i-amphtml-lbg-hidden');
      });
    }).then(() => {
      this.getViewport().enterLightboxMode();
      this.isActive_ = true;

      this.updateInViewport(dev().assertElement(this.container_), true);
      this.scheduleLayout(dev().assertElement(this.container_));

      this.win.document.documentElement.addEventListener(
          'keydown', this.boundOnKeyDown_);

      this.carousel_.addEventListener(
          'slideChange', event => this.slideChangeHandler_(event)
      );

      this.setupGestures_();
      this.setupEventListeners_();

      return this.carousel_.signals().whenSignal(CommonSignals.LOAD_END);
    }).then(() => this.openLightboxForElement_(element))
        .then(() => {
          this.showControls_();
          triggerAnalyticsEvent(this.element, 'lightboxOpened', {});
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
    dev().assert(this.carousel_).getImpl()
        .then(carousel => carousel.showSlideWhenReady(this.currentElemId_));
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
   * This function verifies that the source element is an amp-img and contains
   * an img element and preserves the natural aspect ratio of the original img.
   * @param {!Element|null} element
   * @return {!Promise<boolean>}
   * @private
   */
  shouldAnimate_(element) {
    const img = elementByTag(dev().assertElement(element), 'img');
    return this.measureElement(() => {
      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
      const elementHeight = element./*OK*/offsetHeight;
      const elementWidth = element./*OK*/offsetWidth;
      const ampImageAspectRatio = elementWidth / elementHeight;
      return Math.abs(naturalAspectRatio - ampImageAspectRatio) < EPSILON;
    });
  }

  /**
   * It's possible for the current lightbox to be displaying an image that
   * is not visible in the viewport. We should not transition those images.
   * This function checks if the currently lightboxed image is the source image
   * that we transitioned on (in which case it is guaranteed to be in viewport)
   * or if it belongs to a carousel, in which case we sync the carousel.
   * @return {!Promise<boolean>}
   * @private
   */
  shouldExit_() {
    const target = this.getCurrentElement_().sourceElement;
    if (!this.transitionTargetIsInViewport_(target)) {
      return Promise.resolve(false);
    }
    if (!this.elementTypeCanBeAnimated_(target)) {
      return Promise.resolve(false);
    }
    return this.shouldAnimate_(target)
        .then(shouldAnimate => {
          return shouldAnimate;
        });
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
    // Note that `<amp-carousel>` type='carousel' does not support goToSlide
    const parentCarousel = closestBySelector(target,
        'amp-carousel[type="slides"]');
    if (parentCarousel && parentCarousel.isInViewport()) {
      return true;
    }
    return false;
  }
  /**
   * Animates image from current location to its target location in the
   * lightbox.
   * @param {!Element} sourceElement
   * @private
   * @return {!Promise}
   */
  transitionIn_(sourceElement) {
    const anim = new Animation(this.element);
    let duration = MIN_TRANSITION_DURATION;

    const transLayer = this.element.ownerDocument.createElement('div');
    transLayer.classList.add('i-amphtml-lightbox-gallery-trans');
    const sourceImg = childElementByTag(sourceElement, 'img');
    const clone = sourceImg.cloneNode(true);
    clone.removeAttribute('class');
    transLayer.appendChild(clone);

    return this.getCurrentElement_().imageViewer.getImpl()
        .then(imageViewer => {
          const imageBox = imageViewer.getImageBoxWithOffset();
          if (!imageBox) {
            return this.fade_(0, 1);
          }

          // Gradually fade in the black background
          anim.add(0, setStylesTransition(this.element, {
            opacity: numeric(0, 1),
          }), MOTION_DURATION_RATIO, ENTER_CURVE_);

          // Fade in the carousel at the end of the animation while fading out
          // the transition layer
          anim.add(MOTION_DURATION_RATIO - 0.01,
              setStylesTransition(dev().assertElement(this.carousel_), {
                opacity: numeric(0, 1),
              }),
              0.01
          );

          // At the end of the animation, fade out the transition layer.
          anim.add(0.9, setStylesTransition(transLayer, {
            opacity: numeric(1, 0.01),
          }), 0.1, EXIT_CURVE_);

          return this.measureMutateElement(
              () => {
                const rect = layoutRectFromDomRect(sourceElement
                    ./*OK*/getBoundingClientRect());
                setStyles(clone, {
                  position: 'absolute',
                  top: px(rect.top),
                  left: px(rect.left),
                  width: px(rect.width),
                  height: px(rect.height),
                  transformOrigin: 'top left',
                  willChange: 'transform',
                });
                const dx = imageBox.left - rect.left;
                const dy = imageBox.top - rect.top;
                const scaleX = rect.width != 0 ?
                  imageBox.width / rect.width : 1;
                const viewportHeight = this.getViewport().getSize().height;
                duration = this.getTransitionDuration_(Math.abs(dy),
                    viewportHeight);

                // Animate the position and scale of the transition image to its
                // final lightbox destination in the middle of the page
                anim.add(0, setStylesTransition(clone, {
                  transform: concatTransition([
                    translate(numeric(0, dx), numeric(0, dy)),
                    scale(numeric(1, scaleX)),
                  ]),
                }), MOTION_DURATION_RATIO, ENTER_CURVE_);
              },
              () => {
                const carousel = dev().assertElement(this.carousel_);
                toggle(carousel, true);
                setStyles(carousel, {
                  opacity: 0,
                });
                sourceElement.classList.add('i-amphtml-ghost');
                this.getAmpDoc().getBody().appendChild(transLayer);
              });
        }).then(() => {
          return anim.start(duration).thenAlways(() => {
            return this.mutateElement(() => {
              setStyles(this.element, {opacity: ''});
              setStyles(dev().assertElement(this.carousel_), {opacity: ''});
              sourceElement.classList.remove('i-amphtml-ghost');
              if (transLayer) {
                this.getAmpDoc().getBody().removeChild(transLayer);
              }
            });
          });
        });
  }

  /**
   * If no transition image is applicable, fade the lightbox in and out.
   * @param {number} startOpacity
   * @param {number} endOpacity
   * @return {!Promise}
   * @private
   */
  fade_(startOpacity, endOpacity) {
    const duration = MIN_TRANSITION_DURATION;
    const anim = new Animation(this.element);
    anim.add(0, setStylesTransition(this.element, {
      opacity: numeric(startOpacity, endOpacity),
    }), MOTION_DURATION_RATIO, ENTER_CURVE_);

    return anim.start(duration).thenAlways(() => {
      return this.mutateElement(() => {
        setStyles(this.element, {opacity: ''});
        if (endOpacity == 0) {
          toggle(dev().assertElement(this.carousel_), false);
          toggle(this.element, false);
        }
      });
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
      return this.fade_(0, 1);
    }

    const promises = [
      this.shouldAnimate_(sourceElement),
      this.getCurrentElement_().imageViewer.signals()
          .whenSignal(CommonSignals.LOAD_END),
    ];

    return Promise.all(promises).then(values => {
      const shouldAnimate = values[0];
      return shouldAnimate
        ? this.transitionIn_(sourceElement)
        : this.fade_(0, 1);
    });
  }

  /**
   * Animate the lightbox image to move back to its original position in the
   * webpage or carousel.
   * @private
   */
  transitionOut_() {
    const currentElementMetadata = this.getCurrentElement_();
    const {sourceElement} = currentElementMetadata;
    let duration = MIN_TRANSITION_DURATION;
    const anim = new Animation(this.element);
    const transLayer = this.element.ownerDocument.createElement('div');
    transLayer.classList.add('i-amphtml-lightbox-gallery-trans');

    // Initialize transition layer and image based on ImageViewer measurements
    return currentElementMetadata.imageViewer.getImpl()
        .then(imageViewer => {
          const imageBox = imageViewer.getImageBoxWithOffset();
          const image = imageViewer.getImage();

          if (!imageBox) {
            return this.fade_(1, 0);
          }

          const clone = image.cloneNode(true);
          clone.removeAttribute('class');
          clone.removeAttribute('style');

          setStyles(clone, {
            position: 'absolute',
            top: px(imageBox.top),
            left: px(imageBox.left),
            width: px(imageBox.width),
            height: px(imageBox.height),
            transform: '',
            transformOrigin: 'top left',
            willChange: 'transform',
          });
          transLayer.appendChild(clone);

          // Gradually fade out the lightbox
          anim.add(0, setStylesTransition(this.element, {
            opacity: numeric(1, 0),
          }), MOTION_DURATION_RATIO, ENTER_CURVE_);

          // Fade out the transition image.
          anim.add(MOTION_DURATION_RATIO, setStylesTransition(transLayer, {
            opacity: numeric(1, 0.01),
          }), 0.2, EXIT_CURVE_);

          const transitionMeasure = () => {
            const rect = layoutRectFromDomRect(sourceElement
                ./*OK*/getBoundingClientRect());

            // Move and resize the image back to where it is in the article.
            const dx = rect.left - imageBox.left;
            const dy = rect.top - imageBox.top;
            const scaleX = imageBox.width != 0 ?
              rect.width / imageBox.width : 1;
            const viewportHeight = this.getViewport().getSize().height;
            duration = this.getTransitionDuration_(Math.abs(dy),
                viewportHeight);

            // Animate the position and scale of the transition image to its
            // final lightbox destination in the middle of the page
            /** @const {!TransitionDef<void>} */
            const moveAndScale = setStylesTransition(clone, {
              transform: concatTransition([
                translate(numeric(0, dx), numeric(0, dy)),
                scale(numeric(1, scaleX)),
              ]),
            });

            anim.add(0, (time, complete) => {
              moveAndScale(time);
              if (complete) {
                sourceElement.classList.remove('i-amphtml-ghost');
              }
            }, MOTION_DURATION_RATIO, EXIT_CURVE_);
          };

          const transitionMutate = () => {
            sourceElement.classList.add('i-amphtml-ghost');
            this.getAmpDoc().getBody().appendChild(transLayer);
            setStyles(dev().assertElement(this.carousel_), {
              opacity: 0,
            });
          };

          return this.measureMutateElement(transitionMeasure,
              transitionMutate);

        }).then(() => {
          return anim.start(duration).thenAlways(() => {
            return this.mutateElement(() => {
              setStyles(this.element, {
                opacity: '',
              });
              setStyles(dev().assertElement(this.carousel_), {
                opacity: '',
              });
              toggle(dev().assertElement(this.carousel_), false);
              toggle(this.element, false);
              this.getAmpDoc().getBody().removeChild(transLayer);
            });
          });
        });
  }

  /**
   * Animation for closing lightbox
   * @return {!Promise}
   * @private
   */
  exit_() {
    return this.shouldExit_()
        .then(shouldExit => {
          if (shouldExit) {
            return this.transitionOut_();
          } else {
            return this.fade_(1, 0);
          }
        });
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
   * If the currently lightbox-ed element is bound to a carousel, then sync
   *  the carousel so that it is showing the currently lightbox-ed element.
   * @private
   */
  maybeSyncSourceCarousel_() {
    const target = this.getCurrentElement_().sourceElement;
    // TODO(#13011): change to a tag selector after `<amp-carousel>`
    // type='carousel' starts supporting goToSlide.
    const parentCarousel = closestBySelector(target,
        'amp-carousel[type="slides"]');
    if (parentCarousel) {
      const targetSlide = closestBySelector(target, 'div.i-amphtml-slide-item');
      const targetSlideIndex = toArray(targetSlide.parentNode.children)
          .indexOf(targetSlide);
      dev().assert(parentCarousel).getImpl()
          .then(carousel => carousel.showSlideWhenReady(targetSlideIndex));
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

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundOnKeyDown_);

    this.carousel_.removeEventListener(
        'slideChange', event => {this.slideChangeHandler_(event);});

    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.cleanup();

    return this.mutateElement(() => {
      // If there's gallery, set gallery to display none
      this.container_.removeAttribute('gallery-view');

      if (this.gallery_) {
        this.gallery_.classList.add('i-amphtml-lbg-gallery-hidden');
        this.gallery_ = null;
      }
      this.clearDescOverflowState_();
    }).then(() => this.exit_())
        .then(() => {
          this.getViewport().leaveLightboxMode();
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
    const {keyCode} = event;
    switch (keyCode) {
      case KeyCodes.ESCAPE:
        this.close_();
        break;
      case KeyCodes.LEFT_ARROW:
        this.maybeSlideCarousel_(/*direction*/ -1);
        break;
      case KeyCodes.RIGHT_ARROW:
        this.maybeSlideCarousel_(/*direction*/ 1);
        break;
      default:
        // Keycode not registered. Do nothing.
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
    dev().assert(this.carousel_).getImpl().then(carousel => {
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
    triggerAnalyticsEvent(this.element, 'thumbnailsViewToggled', {});
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
      this.gallery_.classList.remove('i-amphtml-lbg-gallery-hidden');
      this.updateVideoThumbnails_();
    } else {
      // Build gallery
      this.gallery_ = this.win.document.createElement('div');
      this.gallery_.classList.add('i-amphtml-lbg-gallery');
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
              this.win.document.createTextNode(timestamp));
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
      dev().assert(this.carousel_).getImpl(),
    ]).then(values => {
      this.currentElemId_ = id;
      values[1].showSlideWhenReady(this.currentElemId_);
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
    const element = this.win.document.createElement('div');
    element.classList.add('i-amphtml-lbg-gallery-thumbnail');
    const imgElement = this.win.document.createElement('img');
    imgElement.classList.add('i-amphtml-lbg-gallery-thumbnail-img');

    if (thumbnailObj.srcset) {
      imgElement.setAttribute('srcset', thumbnailObj.srcset.stringify());
    } else {
      imgElement.setAttribute('src', thumbnailObj.placeholderSrc);
    }
    element.appendChild(imgElement);

    if (VIDEO_TAGS[thumbnailObj.element.tagName]) {
      const playButtonSpan = this.win.document.createElement('span');
      playButtonSpan.classList.add('i-amphtml-lbg-thumbnail-play-icon');
      const timestampDiv = this.win.document.createElement('div');
      timestampDiv.classList.add('i-amphtml-lbg-thumbnail-timestamp-container');
      timestampDiv.appendChild(playButtonSpan);
      thumbnailObj.timestampPromise.then(ts => {
        // Many video players (e.g. amp-youtube) that don't support this API
        // will often return 1. This will sometimes result in erroneous values
        // of 1 second for video players that don't support getDuration.
        if (!ts || isNaN(ts)) {
          return;
        }
        const timestamp = this.secondsToTimestampString_(ts);
        timestampDiv.appendChild(
            this.win.document.createTextNode(timestamp));
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
  return ampdoc.whenBodyAvailable().then(body => {
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
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<?LightboxManager>}
 */
function lightboxManagerForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<?LightboxManager>} */ (
    getElementServiceForDoc(
        elementOrAmpDoc, 'amp-lightbox-manager', 'amp-lightbox-gallery'));
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  AMP.registerServiceForDoc('amp-lightbox-manager', LightboxManager);
  Services.extensionsFor(global).addDocFactory(installLightboxGallery);
});
