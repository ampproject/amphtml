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

import * as st from '../../../src/style';
import * as tr from '../../../src/transition';
import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-lightbox-gallery-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {
  LightboxManager,
  LightboxedCarouselMetadataDef,
} from './service/lightbox-manager-impl';
import {Services} from '../../../src/services';
import {SwipeYRecognizer} from '../../../src/gesture-recognizers';
import {bezierCurve} from '../../../src/curve';
import {clamp} from '../../../src/utils/math';
import {closest, elementByTag, escapeCssSelectorIdent} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getData, listen} from '../../../src/event-helper';
import {isExperimentOn} from '../../../src/experiments';
import {isLoaded} from '../../../src/event-helper';
import {layoutRectFromDomRect} from '../../../src/layout-rect';
import {setStyle, toggle} from '../../../src/style';

/** @const */
const TAG = 'amp-lightbox-gallery';
const DEFAULT_GALLERY_ID = 'amp-lightbox-gallery';

/**
 * Regular expression that identifies AMP CSS classes.
 * Includes 'i-amphtml-', '-amp-', and 'amp-' prefixes.
 * @type {!RegExp}
 */
const AMP_CSS_RE = /^(i?-)?amp(html)?-/;

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

const DESC_BOX_PADDING_TOP = 50;
const SWIPE_TO_CLOSE_THRESHOLD = 10;

const ENTER_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);
const EXIT_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);
const MAX_TRANSITION_DURATION = 1000; // ms
const MIN_TRANSITION_DURATION = 500; // ms
const MAX_DISTANCE_APPROXIMATION = 250; // px
const MOTION_DURATION_RATIO = 0.8; // fraction of animation
const EPSILON = 0.01; // precision for approx equals

/**
 * TODO(aghassemi): Make lightbox-manager into a doc-level service.
 * @private  {!./service/lightbox-manager-impl.LightboxManager}
 * */
let manager_;

/**
 * The structure that represents the metadata of a lightbox element
 *
 * @typedef {{
 *   descriptionText: string,
 *   tagName: string,
 *   imageViewer: ?Element,
 *   sourceElement: !Element
 * }}
 */
let LightboxElementMetadataDef_;

/**
 * @private visible for testing.
 */
export class AmpLightboxGallery extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.active_ = false;

    /** @private {number} */
    this.currentElemId_ = -1;

    /** @private {function(!Event)} */
    this.boundHandleKeyboardEvents_ = this.handleKeyboardEvents_.bind(this);

    /**
     * @private {?./service/lightbox-manager-impl.LightboxManager}
     */
    this.manager_ = null;

    /** @private {?../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Element} */
    this.carousel_ = null;

    /** @private {?Element} */
    this.descriptionBox_ = null;

    /** @private {?Element} */
    this.descriptionTextArea_ = null;

    /** @private {!Object<string,!Array<!LightboxElementMetadataDef_>>} */
    this.elementsMetadata_ = {
      default: [],
    };

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @private  {?Element} */
    this.topBar_ = null;

    /** @private  {?Element} */
    this.topGradient_ = null;

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
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment ${TAG} disabled`);
    this.manager_ = dev().assert(manager_);
    this.vsync_ = this.getVsync();
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(() => {
      this.container_ = this.win.document.createElement('div');
      this.container_.classList.add('i-amphtml-lbg');
      this.element.appendChild(this.container_);
      this.manager_.maybeInit();
      this.buildMask_();
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
   * @param {string} lightboxGroupId
   * @return {!Promise}
   * @private
   */
  findOrInitializeLightbox_(lightboxGroupId) {
    if (!this.descriptionBox_) {
      this.buildDescriptionBox_();
    }
    if (!this.topBar_) {
      this.buildTopBar_();
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

    const ampClasses = [];
    for (let i = 0; i < clonedNode.classList.length; i++) {
      const cssClass = clonedNode.classList[i];
      if (AMP_CSS_RE.test(cssClass)) {
        ampClasses.push(cssClass);
      }
    }
    clonedNode.classList.remove.apply(clonedNode.classList, ampClasses);
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
      };
      let slide = clonedNode;
      if (clonedNode.tagName === 'AMP-IMG') {
        const container = this.element.ownerDocument.createElement('div');
        container.classList.add('i-amphtml-image-lightbox-container');
        const imageViewer = this.win.document.createElement('amp-image-viewer');
        imageViewer.setAttribute('layout', 'fill');
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
      return this.vsync_.mutatePromise(() => {
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
      this.carousel_ = this.win.document.createElement('amp-carousel');
      this.carousel_.setAttribute('type', 'slides');
      this.carousel_.setAttribute('layout', 'fill');
      this.carousel_.setAttribute('loop', '');
      this.carousel_.setAttribute('amp-lightbox-group', lightboxGroupId);
      return this.manager_.getElementsForLightboxGroup(lightboxGroupId);
    }).then(list => {
      return this.vsync_.mutatePromise(() => {
        this.buildCarouselSlides_(list);
      });
    }).then(() => {
      this.container_.appendChild(this.carousel_);
    });
  }

  /**
   * Handles slide change.
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
    this.descriptionBox_.classList.add('i-amphtml-lbg-controls');

    this.descriptionBox_.classList.add('standard');

    this.descriptionTextArea_ = this.win.document.createElement('div');
    this.descriptionTextArea_.classList.add('i-amphtml-lbg-desc-text');
    this.descriptionTextArea_.classList.add('non-expanded');
    this.descriptionBox_.appendChild(this.descriptionTextArea_);

    this.descriptionBox_.addEventListener('click', event => {
      this.toggleDescriptionOverflow_();
      event.stopPropagation();
    });
    this.container_.appendChild(this.descriptionBox_);
  }

  /**
   * Update description box text.
   * @private
   */
  updateDescriptionBox_() {
    const descText = this.getCurrentElement_().descriptionText;
    // The problem with setting innerText is that it not only removes
    // child nodes from the element, but also permanently destroys all
    // descendant text nodes. It is okay in this case because the description
    // text area is a div that does not contain descendant elements.
    this.descriptionTextArea_./*OK*/innerText = descText;
    if (!descText) {
      toggle(dev().assertElement(this.descriptionBox_), false);
    }
  }

  /**
   * Toggle the overflow state of description box
   * @private
   */
  toggleDescriptionOverflow_() {
    // TODO: if there is nothing to expand into, don't shim.
    if (this.descriptionBox_.classList.contains('standard')) {
      const measureBeforeExpandingDescTextArea = state => {
        state.prevDescTextAreaHeight =
            this.descriptionTextArea_./*OK*/scrollHeight;
        state.descBoxHeight = this.descriptionBox_./*OK*/clientHeight;
        state.descBoxPaddingTop = DESC_BOX_PADDING_TOP;
      };

      const measureAfterExpandingDescTextArea = state => {
        state.descTextAreaHeight = this.descriptionTextArea_./*OK*/scrollHeight;
      };

      const mutateAnimateDesc = state => {
        const finalDescTextAreaTop =
            state.descBoxHeight > state.descTextAreaHeight ?
              state.descBoxHeight - state.descBoxPaddingTop -
            state.descTextAreaHeight : 0;
        const tempOffsetHeight =
            state.descBoxHeight > state.descTextAreaHeight ?
              state.descTextAreaHeight - state.prevDescTextAreaHeight :
              state.descBoxHeight - state.descBoxPaddingTop -
            state.prevDescTextAreaHeight;
        this.animateDescOverflow_(tempOffsetHeight, finalDescTextAreaTop);
      };

      const mutateExpandingDescTextArea = state => {
        this.descriptionTextArea_.classList.remove('non-expanded');
        const tempDescTextAreaTop = state.descBoxHeight -
            state.descBoxPaddingTop - state.prevDescTextAreaHeight;
        setStyle(this.descriptionTextArea_, 'top', `${tempDescTextAreaTop}px`);
        this.vsync_.run({
          measure: measureAfterExpandingDescTextArea,
          mutate: mutateAnimateDesc,
        }, {
          prevDescTextAreaHeight: state.prevDescTextAreaHeight,
          descBoxHeight: state.descBoxHeight,
          descBoxPaddingTop: state.descBoxPaddingTop,
        });
      };

      this.descriptionBox_.classList.remove('standard');
      this.descriptionBox_.classList.add('overflow');
      this.topBar_.classList.add('fullscreen');
      this.vsync_.run({
        measure: measureBeforeExpandingDescTextArea,
        mutate: mutateExpandingDescTextArea,
      }, {});
    } else if (this.descriptionBox_.classList.contains('overflow')) {
      this.vsync_.mutate(() => {
        this.descriptionBox_.classList.remove('overflow');
        this.topBar_.classList.remove('fullscreen');
        this.descriptionBox_.classList.add('standard');
        this.descriptionTextArea_.classList.add('non-expanded');
        setStyle(this.descriptionTextArea_, 'top', '');
      });
    }
  }

  /**
   * @param {number} diffTop
   * @param {number} finalTop
   * @param {number=} duration
   * @param {string=} curve
   * @private
   */
  animateDescOverflow_(diffTop, finalTop,
    duration = 500, curve = 'ease-out') {
    const textArea = dev().assertElement(this.descriptionTextArea_);
    const transition = tr.numeric(0, diffTop);
    return Animation.animate(textArea, time => {
      const p = transition(time);
      setStyle(textArea, 'transform', `translateY(-${p}px)`);
    }, duration, curve).thenAlways(() => {
      setStyle(textArea, 'top', `${finalTop}px`);
      setStyle(textArea, 'transform', '');
    });
  }

  /**
   * Builds the top bar containing buttons and appends them to the container.
   * @private
   */
  buildTopBar_() {
    dev().assert(this.container_);
    this.topBar_ = this.win.document.createElement('div');
    this.topBar_.classList.add('i-amphtml-lbg-top-bar');
    this.topBar_.classList.add('i-amphtml-lbg-controls');

    this.topGradient_ = this.win.document.createElement('div');
    this.topGradient_.classList.add('i-amphtml-lbg-top-bar-top-gradient');
    this.topBar_.appendChild(this.topGradient_);

    const close = this.close_.bind(this);
    const openGallery = this.openGallery_.bind(this);
    const closeGallery = this.closeGallery_.bind(this);

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    this.buildButton_('Close', 'amp-lbg-button-close', close);
    this.buildButton_('Gallery', 'amp-lbg-button-gallery', openGallery);
    this.buildButton_('Content', 'amp-lbg-button-slide', closeGallery);

    this.container_.appendChild(this.topBar_);
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
    icon.classList.add('amp-lbg-icon');
    button.appendChild(icon);
    button.classList.add(className);
    button.classList.add('amp-lbg-button');


    button.addEventListener('click', event => {
      action();
      event.stopPropagation();
      event.preventDefault();
    });

    this.topBar_.appendChild(button);
  }

  /**
   * Check to see if the triggering click happened on something that is a button
   * or any other element that should consume the event.
   * @param {!Event} e
   * @return {boolean}
   */
  shouldTriggerClick_(e) {
    const target = dev().assertElement(e.target);
    const consumingElement = closest(target, element => {
      return element.tagName == 'BUTTON'
        || element.tagName == 'A'
        || element.getAttribute('role') == 'button'
        || (element.hasAttribute('on')
        && element.getAttribute('on')./*OK*/matches(/(^|;)\s*tap\s*/));
    }, this.container_);

    return consumingElement == null;
  }

  /**
   * Toggle lightbox controls including topbar and description.
   * @param {!Event} e
   * @private
   */
  toggleControls_(e) {
    if (!this.shouldTriggerClick_(e)) {
      return;
    }

    if (this.controlsMode_ == LightboxControlsModes.CONTROLS_HIDDEN) {
      this.topBar_.classList.remove('fade-out');
      if (!this.container_.hasAttribute('gallery-view')) {
        this.descriptionBox_.classList.remove('fade-out');
        this.updateDescriptionBox_();
      }
      this.controlsMode_ = LightboxControlsModes.CONTROLS_DISPLAYED;
    } else {
      this.topBar_.classList.add('fade-out');
      this.descriptionBox_.classList.add('fade-out');
      this.controlsMode_ = LightboxControlsModes.CONTROLS_HIDDEN;
    }
  }

  /**
   * Set up event listeners.
   * @private
   */
  setupEventListeners_() {
    dev().assert(this.container_);
    const toggleControls = this.toggleControls_.bind(this);
    this.unlistenClick_ = listen(dev().assertElement(this.container_),
        'click', toggleControls);
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
   * @return {!LightboxElementMetadataDef_}
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
    this.open_(dev().assertElement(target));
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
      this.getViewport().enterLightboxMode();

      st.setStyles(this.element, {
        opacity: 0,
        display: '',
      });

      st.setStyles(dev().assertElement(this.carousel_), {
        opacity: 0,
        display: '',
      });

      this.active_ = true;

      this.updateInViewport(dev().assertElement(this.container_), true);
      this.scheduleLayout(dev().assertElement(this.container_));

      this.win.document.documentElement.addEventListener(
          'keydown', this.boundHandleKeyboardEvents_);

      this.carousel_.addEventListener(
          'slideChange', event => this.slideChangeHandler_(event)
      );

      this.setupGestures_();
      this.setupEventListeners_();

      return this.carousel_.signals().whenSignal(CommonSignals.LOAD_END);
    }).then(() => this.openLightboxForElement_(element));
  }

  /**
   * Given a single lightbox element, opens the internal carousel slide
   * associated with said element, updates the description, and initializes
   * the image viewer if the element is an amp-img.
   * @param {!Element} element
   * @private
   */
  openLightboxForElement_(element) {
    this.currentElemId_ = element.lightboxItemId;
    // Hack to access private property. Better than not getting
    // type checking to work.
    /**@type {?}*/ (this.carousel_).implementation_.showSlideWhenReady(
        this.currentElemId_);
    const tagName = this.getCurrentElement_().tagName;
    if (tagName === 'AMP-IMG') {
      this.getCurrentElement_().imageViewer.signals()
          .whenSignal(CommonSignals.LOAD_END)
          .then(() => this.enter_());
    }
    this.updateDescriptionBox_();
  }

  /**
   * This function verifies that the source element is an amp-img and contains
   * an img element and preserves the natural aspect ratio of the original img.
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  shouldAnimate_(element) {
    if (element.tagName !== 'AMP-IMG') {
      return false;
    }
    const img = elementByTag(dev().assertElement(element), 'img');
    if (!img) {
      return false;
    }
    const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
    const elementHeight = element./*OK*/offsetHeight;
    const elementWidth = element./*OK*/offsetWidth;
    const ampImageAspectRatio = elementWidth / elementHeight;
    return Math.abs(naturalAspectRatio - ampImageAspectRatio) < EPSILON;
  }

  /**
   * Entry animation to transition in a lightboxable image
   * @return {!Promise}
   * @private
   */
  // TODO (cathyxz): make this generalizable to more than just images
  enter_() {
    const anim = new Animation(this.element);
    let duration = MIN_TRANSITION_DURATION;
    let transLayer = null;
    const sourceElement = this.getCurrentElement_().sourceElement;
    return this.vsync_.measurePromise(() => {
      // Lightbox background fades in.
      anim.add(0, tr.setStyles(this.element, {
        opacity: tr.numeric(0, 1),
      }), MOTION_DURATION_RATIO, ENTER_CURVE_);

      // Try to transition from the source image.
      if (sourceElement && isLoaded(sourceElement)
        && this.shouldAnimate_(sourceElement)) {

        // TODO (#13039): implement crop and object fit contain transitions
        sourceElement.classList.add('i-amphtml-ghost');
        transLayer = this.element.ownerDocument.createElement('div');
        transLayer.classList.add('i-amphtml-lightbox-gallery-trans');
        this.element.ownerDocument.body.appendChild(transLayer);
        const rect = layoutRectFromDomRect(sourceElement
            ./*OK*/getBoundingClientRect());

        const imageBox = /**@type {?}*/ (this.getCurrentElement_().imageViewer)
            .implementation_.getImageBoxWithOffset();

        const clone = sourceElement.cloneNode(true);
        clone.className = '';
        st.setStyles(clone, {
          position: 'absolute',
          top: st.px(rect.top),
          left: st.px(rect.left),
          width: st.px(rect.width),
          height: st.px(rect.height),
          transformOrigin: 'top left',
          willChange: 'transform',
        });
        transLayer.appendChild(clone);

        // Move and resize the image to the location given by the lightbox.
        const dx = imageBox.left - rect.left;
        const dy = imageBox.top - rect.top;
        const scaleX = rect.width != 0 ? imageBox.width / rect.width : 1;

        duration = this.getTransitionDuration_(dy);

        anim.add(MOTION_DURATION_RATIO - 0.01,
            tr.setStyles(dev().assertElement(this.carousel_), {
              opacity: tr.numeric(0, 1),
            }),
            0.01
        );

        anim.add(0, tr.setStyles(clone, {
          transform: tr.concat([
            tr.translate(tr.numeric(0, dx), tr.numeric(0, dy)),
            tr.scale(tr.numeric(1, scaleX)),
          ]),
        }), MOTION_DURATION_RATIO, ENTER_CURVE_);

        // At the end, fade out the transition image.
        anim.add(0.9, tr.setStyles(transLayer, {
          opacity: tr.numeric(1, 0.01),
        }), 0.1, EXIT_CURVE_);
      } else {
        st.setStyles(dev().assertElement(this.carousel_), {opacity: ''});
      }
    }).then(() => {
      return anim.start(duration).thenAlways(() => {
        return this.vsync_.mutatePromise(() => {
          st.setStyles(this.element, {opacity: ''});
          st.setStyles(dev().assertElement(this.carousel_), {opacity: ''});
          sourceElement.classList.remove('i-amphtml-ghost');
          if (transLayer) {
            this.element.ownerDocument.body.removeChild(transLayer);
          }
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
    const anim = new Animation(this.element);
    let duration = MIN_TRANSITION_DURATION;
    const currentElementMetadata = this.getCurrentElement_();
    const imageBox = /**@type {?}*/ (currentElementMetadata.imageViewer)
        .implementation_.getImageBoxWithOffset();
    const image = /**@type {?}*/ (currentElementMetadata.imageViewer)
        .implementation_.getImage();
    const sourceElement = currentElementMetadata.sourceElement;
    // Try to transition to the source image.
    let transLayer = null;

    return this.vsync_.measurePromise(() => {
      // Lightbox background fades out.
      anim.add(0, tr.setStyles(this.element, {
        opacity: tr.numeric(1, 0),
      }), MOTION_DURATION_RATIO, ENTER_CURVE_);

      if (sourceElement !== null
        && sourceElement.tagName == 'AMP-IMG'
        && this.shouldAnimate_(sourceElement)
        && (sourceElement == this.sourceElement_
        || this.manager_.hasCarousel(this.currentLightboxGroupId_))) {

        sourceElement.classList.add('i-amphtml-ghost');
        transLayer = this.element.ownerDocument.createElement('div');
        transLayer.classList.add('i-amphtml-lightbox-gallery-trans');
        this.element.ownerDocument.body.appendChild(transLayer);

        const rect = layoutRectFromDomRect(sourceElement
            ./*OK*/getBoundingClientRect());
        const clone = image.cloneNode(true);
        st.setStyles(clone, {
          position: 'absolute',
          top: st.px(imageBox.top),
          left: st.px(imageBox.left),
          width: st.px(imageBox.width),
          height: st.px(imageBox.height),
          transform: '',
          transformOrigin: 'top left',
          willChange: 'transform',
        });
        transLayer.appendChild(clone);

        st.setStyles(dev().assertElement(this.carousel_), {
          opacity: 0,
        });

        anim.add(0, tr.setStyles(dev().assertElement(this.element), {
          opacity: tr.numeric(1, 0),
        }), MOTION_DURATION_RATIO, EXIT_CURVE_);

        // Move and resize the image back to where it is in the article.
        const dx = rect.left - imageBox.left;
        const dy = rect.top - imageBox.top;
        const scaleX = imageBox.width != 0 ? rect.width / imageBox.width : 1;
        /** @const {!TransitionDef<void>} */
        const moveAndScale = tr.setStyles(clone, {
          transform: tr.concat([
            tr.translate(tr.numeric(0, dx), tr.numeric(0, dy)),
            tr.scale(tr.numeric(1, scaleX)),
          ]),
        });

        anim.add(0, (time, complete) => {
          moveAndScale(time);
          if (complete) {
            sourceElement.classList.remove('i-amphtml-ghost');
          }
        }, MOTION_DURATION_RATIO, EXIT_CURVE_);

        // Fade out the transition image.
        anim.add(MOTION_DURATION_RATIO, tr.setStyles(transLayer, {
          opacity: tr.numeric(1, 0.01),
        }), 0.2, EXIT_CURVE_);

        duration = this.getTransitionDuration_(dy);
      }
    }).then(() => {
      return anim.start(duration).thenAlways(() => {
        return this.vsync_.mutatePromise(() => {
          if (sourceElement) {
            sourceElement.classList.remove('i-amphtml-ghost');
          }
          st.setStyles(this.element, {
            opacity: '',
          });
          st.setStyles(dev().assertElement(this.carousel_), {
            opacity: '',
          });
          if (transLayer) {
            this.element.ownerDocument.body.removeChild(transLayer);
          }
        });
      });
    });
  }

  /**
   * Calculates transition duration from vertical distance traveled
   * @param {number} dy
   * @return {number}
   * @private
   */
  getTransitionDuration_(dy) {
    const distanceAdjustedDuration =
      Math.abs(dy) / MAX_DISTANCE_APPROXIMATION * MAX_TRANSITION_DURATION;
    return clamp(
        distanceAdjustedDuration,
        MIN_TRANSITION_DURATION,
        MAX_TRANSITION_DURATION
    );
  }

  maybeSyncSourceCarousel_() {
    if (this.manager_.hasCarousel(this.currentLightboxGroupId_)) {
      const lightboxCarouselMetadata = this.manager_
          .getCarouselMetadataForLightboxGroup(this.currentLightboxGroupId_);

      let returnSlideIndex = this.currentElemId_;

      lightboxCarouselMetadata.excludedIndexes.some(i => {
        if (i <= returnSlideIndex) {
          returnSlideIndex++;
        } else {
          return true;
        }
      });

      /**@type {?}*/ (lightboxCarouselMetadata.sourceCarousel).implementation_
          .showSlideWhenReady(returnSlideIndex);
    }
  }

  /**
   * Closes the lightbox-gallery
   * @return {!Promise}
   * @private
   */
  close_() {
    if (!this.active_) {
      return Promise.resolve();
    }

    this.active_ = false;

    this.cleanupEventListeners_();

    this.maybeSyncSourceCarousel_();

    this.vsync_.mutate(() => {
      // If there's gallery, set gallery to display none
      this.container_.removeAttribute('gallery-view');

      if (this.gallery_) {
        this.gallery_.classList.add('i-amphtml-lbg-gallery-hidden');
        this.gallery_ = null;
      }
    });

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundHandleKeyboardEvents_);

    this.carousel_.removeEventListener(
        'slideChange', event => {this.slideChangeHandler_(event);});

    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.cleanup();

    return this.exit_().then(() => {
      toggle(dev().assertElement(this.carousel_), false);
      toggle(this.element, false);
      this.carousel_ = null;
      this.getViewport().leaveLightboxMode();
      this.schedulePause(dev().assertElement(this.container_));
    });
  }

  /**
   * Handles keyboard events for the lightbox.
   *  -Esc will close the lightbox.
   * @private
   */
  handleKeyboardEvents_(event) {
    const code = event.keyCode;
    if (code == KeyCodes.ESCAPE) {
      this.close_();
    }
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
    this.container_.setAttribute('gallery-view', '');
    this.topBar_.classList.add('fullscreen');
    toggle(dev().assertElement(this.carousel_), false);
    toggle(dev().assertElement(this.descriptionBox_), false);
  }

  /**
   * Close gallery view
   * @private
   */
  closeGallery_() {
    this.container_.removeAttribute('gallery-view');
    if (this.descriptionBox_.classList.contains('standard')) {
      this.topBar_.classList.remove('fullscreen');
    }
    toggle(dev().assertElement(this.carousel_), true);
    this.updateDescriptionBox_();
    toggle(dev().assertElement(this.descriptionBox_), true);
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
    } else {
      // Build gallery
      this.gallery_ = this.win.document.createElement('div');
      this.gallery_.classList.add('i-amphtml-lbg-gallery');
      this.gallery_.setAttribute('amp-lightbox-group',
          this.currentLightboxGroupId_);

      // Initialize thumbnails
      this.updateThumbnails_();

      this.vsync_.mutate(() => {
        this.container_.appendChild(this.gallery_);
      });
    }
  }

  /**
   * Update thumbnails displayed in lightbox gallery.
   * This function only supports initialization now.
   * @private
   */
  updateThumbnails_() {
    const thumbnails = [];
    this.manager_.getThumbnails(this.currentLightboxGroupId_)
        .forEach(thumbnail => {
          const thumbnailElement = this.createThumbnailElement_(thumbnail);
          thumbnails.push(thumbnailElement);
        });
    this.vsync_.mutate(() => {
      thumbnails.forEach(thumbnailElement => {
        this.gallery_.appendChild(thumbnailElement);
      });
    });
  }

  /**
   * Create an element inside gallery from the thumbnail info from manager.
   * @param {{url: string, element: !Element}} thumbnailObj
   * @return {!Element}
   * @private
   */
  createThumbnailElement_(thumbnailObj) {
    const element = this.win.document.createElement('div');
    element.classList.add('i-amphtml-lbg-gallery-thumbnail');
    const imgElement = this.win.document.createElement('img');
    imgElement.classList.add('i-amphtml-lbg-gallery-thumbnail-img');
    imgElement.setAttribute('src', thumbnailObj.url);
    element.appendChild(imgElement);
    const closeGalleryAndShowTargetSlide = event => {
      this.closeGallery_();
      this.currentElemId_ = thumbnailObj.element.lightboxItemId;
      this.updateDescriptionBox_();
      // Hack to access private property. Better than not getting
      // type checking to work.
      /**@type {?}*/ (this.carousel_).implementation_.showSlideWhenReady(
          this.currentElemId_);
      this.updateDescriptionBox_();
      event.stopPropagation();
    };
    element.addEventListener('click', closeGalleryAndShowTargetSlide);
    return element;
  }
}

/**
 * @private visible for testing.
 */
export function installLightboxManager(win) {
  if (isExperimentOn(win, TAG)) {
    // TODO (#12859): This only works for singleDoc mode. We will move
    // installation of LightboxManager to core after the experiment, okay for now.
    const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    manager_ = new LightboxManager(ampdoc);
  }
}

/**
 * Tries to find an existing amp-lightbox-gallery, if there is none, it adds a
 * default one.
 * @param {!Window} win
 * @return {!Promise}
 */
function installLightboxGallery(win) {
  const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
  // TODO (#12859): make this work for more than singleDoc mode
  return ampdoc.whenBodyAvailable().then(body => {
    const existingGallery = elementByTag(ampdoc.getRootNode(), TAG);
    if (!existingGallery) {
      const gallery = ampdoc.getRootNode().createElement(TAG);
      gallery.setAttribute('layout', 'nodisplay');
      gallery.setAttribute('id', DEFAULT_GALLERY_ID);
      body.appendChild(gallery);
    }
  });
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  installLightboxManager(AMP.win);
  installLightboxGallery(AMP.win);
});
