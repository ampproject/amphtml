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
import {bezierCurve} from '../../../src/curve';
import {CSS} from '../../../build/amp-lightbox-viewer-0.1.css';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {ImageViewer} from '../../../src/image-viewer';
import {isExperimentOn} from '../../../src/experiments';
import {isLoaded} from '../../../src/event-helper';
import {Layout} from '../../../src/layout';
import {user, dev} from '../../../src/log';
import {toggle, setStyle} from '../../../src/style';
import {getData, listen} from '../../../src/event-helper';
import {LightboxManager} from './service/lightbox-manager-impl';
import {layoutRectFromDomRect} from '../../../src/layout-rect';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';
import {SwipeYRecognizer} from '../../../src/gesture-recognizers';

/** @const */
const TAG = 'amp-lightbox-viewer';

/**
 * Set of namespaces that indicate the lightbox controls mode.
 * Lightbox controls include top bar, description box
 *
 * @enum {number}
 */
const LightboxControlsModes = {
  SHOW_CONTROLS: 1,
  HIDE_CONTROLS: 0,
};

const DESC_BOX_PADDING_TOP = 50;
const SWIPE_TO_CLOSE_THRESHOLD = 10;

const ENTER_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);

const EXIT_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);

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
 *   imageViewer: ?../../../src/image-viewer.ImageViewer
 * }}
 */
let LightboxElementMetadataDef_;

/**
 * @private visible for testing.
 */
export class AmpLightboxViewer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/resources-impl.Resources} */
    this.resources_ = null;

    /** @private {!boolean} */
    this.active_ = false;

    /** @private {!number} */
    this.currentElemId_ = -1;

    /** @private {!function(!Event)} */
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

    /** @private {!Array<!Element>} */
    this.clonedLightboxableElements_ = [];

    /** @private {!Array<!LightboxElementMetadataDef_>} */
    this.elementsMetadata_ = [];

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @private {?Array<{string, Element}>} */
    this.thumbnails_ = null;

    /** @private  {?Element} */
    this.topBar_ = null;

    /** @private  {?Element} */
    this.topGradient_ = null;

    /** @private {!LightboxControlsModes} */
    this.controlsMode_ = LightboxControlsModes.SHOW_CONTROLS;

    /** @private {?UnlistenDef} */
    this.unlistenResize_ = null;
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
    this.container_ = this.win.document.createElement('div');
    this.container_.classList.add('i-amphtml-lbv');
    this.resources_ = Services.resourcesForDoc(this.getAmpDoc());
    this.buildMask_();
    this.element.appendChild(this.container_);
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
   * @private
   * @return {!Promise}
   */
  initializeLightboxIfNecessary_() {
    if (this.carousel_) {
      return Promise.resolve();
    }
    return this.buildCarousel_().then(() => {
      this.buildDescriptionBox_();
      this.buildTopBar_();
      this.setupContainerListener_();
    });
  }

  /**
   * Builds the page mask and appends it to the container.
   * @private
   */
  buildMask_() {
    dev().assert(this.container_);
    const mask = this.win.document.createElement('div');
    mask.classList.add('i-amphtml-lbv-mask');
    this.container_.appendChild(mask);
  }

  /**
   * Given a list of lightboxable elements, build the internal carousel slides
   * @param {!Array<!Element>} lightboxableElements
   * @private
   */
  buildCarouselSlides_(lightboxableElements) {
    let index = 0;
    lightboxableElements.forEach(element => {
      element.lightboxItemId = index++;
      const deepClone = !element.classList.contains(
          'i-amphtml-element');
      const clonedNode = element.cloneNode(deepClone);
      clonedNode.removeAttribute('on');
      clonedNode.removeAttribute('id');
      const descText = this.manager_.getDescription(element);
      const metadata = {
        descriptionText: descText,
        tagName: clonedNode.tagName,
      };
      let slide = clonedNode;
      if (clonedNode.tagName === 'AMP-IMG') {
        const container = this.element.ownerDocument.createElement('div');
        container.classList.add('i-amphtml-image-lightbox-container');
        const imageViewer = new ImageViewer(this, this.win,
          this.loadPromise.bind(this));
        imageViewer.init(element);
        container.appendChild(imageViewer.getElement());
        slide = container;
        metadata.imageViewer = imageViewer;
      }
      this.carousel_.appendChild(slide);
      this.clonedLightboxableElements_.push(slide);
      this.elementsMetadata_.push(metadata);
    });
  }

  /**
   * Builds the carousel and appends it to the container.
   * @return {!Promise}
   * @private
   */
  buildCarousel_() {
    dev().assert(this.container_);
    Services.extensionsFor(this.win).installExtensionForDoc(
        this.getAmpDoc(), 'amp-carousel');
    this.carousel_ = this.win.document.createElement('amp-carousel');
    this.carousel_.setAttribute('type', 'slides');
    this.carousel_.setAttribute('layout', 'fill');
    return this.manager_.getElements().then(list => {
      return this.vsync_.mutatePromise(() => {
        return this.buildCarouselSlides_(list);
      });
    }).then(() => {
      this.container_.appendChild(this.carousel_);
      this.carousel_.addEventListener(
          'slideChange', event => {this.slideChangeHandler_(event);}
      );
    });
  }

  /**
   * Handles slide change.
   * @private
   */
  slideChangeHandler_(event) {
    this.currentElemId_ = getData(event)['index'];
    const tagName = this.elementsMetadata_[this.currentElemId_]
        .tagName;
    if (tagName === 'AMP-IMG') {
      this.resizeImageViewerDimensions_();
    }
    this.updateDescriptionBox_();
  }

  /**
   * Build description box and append it to the container.
   * @private
   */
  buildDescriptionBox_() {
    this.descriptionBox_ = this.win.document.createElement('div');
    this.descriptionBox_.classList.add('i-amphtml-lbv-desc-box');
    this.descriptionBox_.classList.add('standard');

    this.descriptionTextArea_ = this.win.document.createElement('div');
    this.descriptionTextArea_.classList.add('i-amphtml-lbv-desc-text');
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
    const descText = this.elementsMetadata_[this.currentElemId_]
        .descriptionText;
    this.descriptionTextArea_.textContent = descText;
    if (!descText) {
      this.descriptionBox_.classList.add('hide');
    }
  }

  /**
   * Toggle description box if it has text content
   * @param {boolean=} opt_display
   * @private
   */
  toggleDescriptionBox_(opt_display) {
    this.updateDescriptionBox_();
    dev().assert(this.descriptionBox_);
    if (opt_display == undefined) {
      opt_display = this.descriptionBox_.classList.contains('hide');
    }
    if (this.descriptionBox_.textContent) {
      this.descriptionBox_.classList.toggle('hide', opt_display);
    } else {
      this.descriptionBox_.classList.add('hide');
    }
  }

  /**
   * Toggle the overflow state of description box
   * @private
   */
  toggleDescriptionOverflow_() {
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
   * Toggle lightbox top bar
   * @param {boolean=} opt_display
   * @private
   */
  toggleTopBar_(opt_display) {
    dev().assert(this.topBar_);
    if (opt_display == undefined) {
      opt_display = this.topBar_.classList.contains('hide');
    }
    this.topBar_.classList.toggle('hide', opt_display);
  }

  /**
   * Builds the top bar containing buttons and appends them to the container.
   * @private
   */
  buildTopBar_() {
    dev().assert(this.container_);
    this.topBar_ = this.win.document.createElement('div');
    this.topBar_.classList.add('i-amphtml-lbv-top-bar');

    this.topGradient_ = this.win.document.createElement('div');
    this.topGradient_.classList.add('i-amphtml-lbv-top-bar-top-gradient');
    this.topBar_.appendChild(this.topGradient_);

    const close = this.close_.bind(this);
    const openGallery = this.openGallery_.bind(this);
    const closeGallery = this.closeGallery_.bind(this);

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    this.buildButton_('Close', 'amp-lbv-button-close', close);
    this.buildButton_('Gallery', 'amp-lbv-button-gallery', openGallery);
    this.buildButton_('Content', 'amp-lbv-button-slide', closeGallery);

    this.container_.appendChild(this.topBar_);
  }

  /**
   * Builds a button and appends it to the container.
   * @param {!string} label Text of the button for a11y
   * @param {!string} className Css classname
   * @param {!function()} action function to call when tapped
   * @private
   */
  buildButton_(label, className, action) {
    dev().assert(this.topBar_);
    const button = this.win.document.createElement('div');

    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', label);
    button.classList.add(className);
    button.addEventListener('click', event => {
      action();
      event.stopPropagation();
    });

    this.topBar_.appendChild(button);
  }

  /**
   * Toggle lightbox controls including topbar and description.
   * @private
   */
  toggleControls_() {
    if (this.controlsMode_ == LightboxControlsModes.HIDE_CONTROLS) {
      this.toggleDescriptionBox_(/* opt_display */true);
      this.toggleTopBar_(/* opt_display */true);
      this.controlsMode_ = LightboxControlsModes.SHOW_CONTROLS;
    } else {
      this.toggleDescriptionBox_(/* opt_display */false);
      this.toggleTopBar_(/* opt_display */false);
      this.controlsMode_ = LightboxControlsModes.HIDE_CONTROLS;
    }
  }

  /**
   * Set up container listener.
   * @private
   */
  setupContainerListener_() {
    dev().assert(this.container_);
    const toggleControls = this.toggleControls_.bind(this);
    listen(dev().assertElement(this.container_), 'click', toggleControls);
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
   * Closes the lightbox viewer on a tiny upwards swipe.
   * @param {number} deltaY
   * @private
   */
  onMoveRelease_(deltaY) {
    if (Math.abs(deltaY) > SWIPE_TO_CLOSE_THRESHOLD) {
      this.close_();
    }
  }

  /**
   * Opens the lightbox-viewer with either the invocation source or
   * the element referenced by the `id` argument.
   * Examples:
   *  // Opens the element tapped.
   *  on="tap:myLightboxViewer'
   *
   *  // Opens the element referenced by elementId
   *  on="tap:myLightboxViewer.open(id='<elementId>')
   * @override
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  activate(invocation) {
    let target = invocation.source;
    if (invocation.args && invocation.args['id']) {
      const targetId = invocation.args['id'];
      target = this.win.document.getElementById(targetId);
      user().assert(target,
          'amp-lightbox-viewer.open: element with id: %s not found', targetId);
    }
    this.open_(dev().assertElement(target));
  }

  /**
   * Opens the lightbox-viewer and displays the given element inside.
   * @param {!Element} element Element to lightbox.
   * @return {!Promise}
   * @private
   */
  open_(element) {
    return this.initializeLightboxIfNecessary_().then(() => {
      this.getViewport().enterLightboxMode();

      toggle(this.element, true);
      this.active_ = true;

      this.updateInViewport(dev().assertElement(this.container_), true);
      this.scheduleLayout(dev().assertElement(this.container_));

      this.win.document.documentElement.addEventListener(
          'keydown', this.boundHandleKeyboardEvents_);

      this.setupGestures_();

      return this.resources_.requireLayout(dev().assertElement(this.carousel_));
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
    const tagName = this.elementsMetadata_[this.currentElemId_]
        .tagName;
    if (tagName === 'AMP-IMG') {
      this.resizeImageViewerDimensions_().then(() => this.enter_(element));
    }
    this.updateDescriptionBox_();
  }

  /**
   * Entry animation to transition in a lightboxable image
   * @param {!Element} sourceImage
   * @private
   */
  // TODO (cathyxz): make this generalizable to more than just images
  enter_(sourceImage) {
    st.setStyles(this.element, {
      opacity: 0,
      display: '',
    });

    const anim = new Animation(this.element);
    const dur = 500;

    // Lightbox background fades in.
    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(0, 1),
    }), 0.6, ENTER_CURVE_);

    // Try to transition from the source image.
    let transLayer = null;
    if (sourceImage && isLoaded(sourceImage)) {
      transLayer = this.element.ownerDocument.createElement('div');
      transLayer.classList.add('i-amphtml-lightbox-viewer-trans');
      this.element.ownerDocument.body.appendChild(transLayer);

      const rect = layoutRectFromDomRect(sourceImage
          ./*OK*/getBoundingClientRect());
      const imageBox = this.elementsMetadata_[this.currentElemId_]
        .imageViewer.getImageBox();

      const clone = sourceImage.cloneNode(true);
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

      sourceImage.classList.add('i-amphtml-ghost');

      // Move and resize the image to the location given by the lightbox.
      const dx = imageBox.left - rect.left;
      const dy = imageBox.top - rect.top;
      const scaleX = rect.width != 0 ? imageBox.width / rect.width : 1;

      // Duration will be somewhere between 0.2 and 0.8 depending on how far
      // the image needs to move.
      const motionTime = Math.max(0.2, Math.min(0.8, Math.abs(dy) / 250 * 0.8));
      anim.add(0, tr.setStyles(clone, {
        transform: tr.concat([
          tr.translate(tr.numeric(0, dx), tr.numeric(0, dy)),
          tr.scale(tr.numeric(1, scaleX)),
        ]),
      }), motionTime, ENTER_CURVE_);

      // At the end, fade out the transition image.
      anim.add(0.9, tr.setStyles(transLayer, {
        opacity: tr.numeric(1, 0.01),
      }), 0.1, EXIT_CURVE_);
    }

    return anim.start(dur).thenAlways(() => {
      sourceImage.classList.remove('i-amphtml-ghost');
      st.setStyles(this.element, {opacity: ''});
      st.setStyles(dev().assertElement(this.carousel_), {opacity: ''});
      if (transLayer) {
        this.element.ownerDocument.body.removeChild(transLayer);
      }
    });
  }

  /**
   * Resizes the ImageViewer of the current slide so that the image
   * is centered in the page. Used in open or on slide change. Also
   * registers a onResize handler to resize the ImageViewer whenever
   * the screen size changes.
   * @return {!Promise}
   * @private
   */
  resizeImageViewerDimensions_() {
    const imgViewer = this.elementsMetadata_[this.currentElemId_].imageViewer;

    // Unregister the previous onResize handler to rescale the ImageViewer
    if (this.unlistenResize_) {
      this.unlistenResize_();
    }

    // Register a new onResize handler
    this.unlistenResize_ = this.getViewport().onResize(() => {
      imgViewer.measure();
    });

    return imgViewer.measure();
  }

  /**
   * Animation for closing lightbox
   * @return {!Promise}
   * @private
   */
  exit_() {
    // TODO (cathyxz): settle on a real animation
    const anim = new Animation(this.element);
    const dur = 1000;

    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(1, 0),
    }), 0.9, EXIT_CURVE_);

    return anim.start(dur).thenAlways(() => {
      this./*OK*/collapse();
      st.setStyles(this.element, {opacity: ''});
    });
  }

  /**
   * Closes the lightbox-viewer
   * @return {!Promise}
   * @private
   */
  close_() {
    if (!this.active_) {
      return Promise.resolve();
    }

    if (this.unlistenResize_) {
      this.unlistenResize_();
      this.unlistenResize_ = null;
    }

    this.active_ = false;

    // Reset the state of the description box
    this.descriptionBox_.classList.remove('hide');

    // If there's gallery, set gallery to display none
    this.container_.removeAttribute('gallery-view');

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundHandleKeyboardEvents_);

    const gestures = Gestures.get(dev().assertElement(this.carousel_));
    gestures.cleanup();

    return this.exit_().then(() => {
      toggle(this.element, false);
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
      this.buildGallery_();
    }
    this.container_.setAttribute('gallery-view', '');
    this.topBar_.classList.add('fullscreen');
    toggle(dev().assertElement(this.carousel_), false);
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
  }

  /**
   * Build lightbox gallery. This is called only once when user enter gallery
   * view for the first time.
   * @private
   */
  buildGallery_() {
    // Build gallery
    this.gallery_ = this.win.document.createElement('div');
    this.gallery_.classList.add('i-amphtml-lbv-gallery');

    // Initialize thumbnails
    this.updateThumbnails_();

    this.vsync_.mutate(() => {
      this.container_.appendChild(this.gallery_);
    });
  }

  /**
   * Update thumbnails displayed in lightbox gallery.
   * This function only supports initialization now.
   * @private
   */
  updateThumbnails_() {
    if (this.thumbnails_) {
      // TODO: Need to update gallery if there's change with thumbnails
      return;
    }

    // Initialize thumbnails from lightbox manager
    this.thumbnails_ = [];
    const thumbnailList = this.manager_.getThumbnails();
    thumbnailList.forEach(thumbnail => {
      const thumbnailElement = this.createThumbnailElement_(thumbnail);
      this.thumbnails_.push(thumbnailElement);
    });
    this.vsync_.mutate(() => {
      this.thumbnails_.forEach(thumbnailElement => {
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
    element.classList.add('i-amphtml-lbv-gallery-thumbnail');
    const imgElement = this.win.document.createElement('img');
    imgElement.classList.add('i-amphtml-lbv-gallery-thumbnail-img');
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
      this.resizeImageViewerDimensions_();
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
    // TODO(aghassemi): This only works for singleDoc mode. We will move
    // installation of LightboxManager to core after the experiment, okay for now.
    const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    manager_ = new LightboxManager(ampdoc);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  installLightboxManager(AMP.win);
  AMP.registerElement(TAG, AmpLightboxViewer, CSS);
});
