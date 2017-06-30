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


import {CSS} from '../../../build/amp-lightbox-viewer-0.1.css';
import {KeyCodes} from '../../../src/utils/key-codes';
import {ampdocServiceFor} from '../../../src/ampdoc';
import {isExperimentOn} from '../../../src/experiments';
import {Layout} from '../../../src/layout';
import {user, dev} from '../../../src/log';
import {extensionsFor} from '../../../src/services';
import {toggle, setStyle} from '../../../src/style';
import {getData, listen} from '../../../src/event-helper';
import {LightboxManager} from './service/lightbox-manager-impl';

/** @const */
const TAG = 'amp-lightbox-viewer';

/**
 * TODO(aghassemi): Make lightbox-manager into a doc-level service.
 * @private  {!./service/lightbox-manager-impl.LightboxManager}
 * */
let manager_;

/**
 * @private visible for testing.
 */
export class AmpLightboxViewer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!boolean} */
    this.active_ = false;

    /** @private {!number} */
    this.currentElementId_ = -1;

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

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @private {?Array<{string, Element}>} */
    this.thumbnails_ = null;

    /** @private  {?Element} */
    this.topBar_ = null;
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

    this.buildMask_();
    this.buildCarousel_();
    this.buildDescriptionBox_();
    this.buildTopBar_();

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
   * Builds the carousel and appends it to the container.
   * @private
   */
  buildCarousel_() {
    if (!this.carousel_) {
      dev().assert(this.container_);
      extensionsFor(this.win).loadExtension('amp-carousel');
      this.carousel_ = this.win.document.createElement('amp-carousel');
      this.carousel_.setAttribute('type', 'slides');
      this.carousel_.setAttribute('layout', 'fill');

      this.manager_.getElements().then(list => {
        const lightboxableElements = list;
        this.vsync_.mutate(() => {
          let index = 0;
          lightboxableElements.forEach(element => {
            element.lightboxItemId = index++;
            const deepClone = !element.classList.contains(
                'i-amphtml-element');
            const clonedNode = element.cloneNode(deepClone);
            clonedNode.removeAttribute('on');
            const descText = this.manager_.getDescription(element);
            if (descText) {
              clonedNode.descriptionText = descText;
            }
            // TODO(yuxichen): store descriptionText and lightboxItemId in a
            // list other than the node itself
            this.clonedLightboxableElements_.push(clonedNode);
            this.carousel_.appendChild(clonedNode);
          });
        });
      });

      this.container_.appendChild(this.carousel_);
      this.carousel_.addEventListener(
          'slideChange', event => {this.slideChangeHandler_(event);});
    }
  }

  /**
   * Handles slide change.
   * @private
   */
  slideChangeHandler_(event) {
    this.currentElementId_ = getData(event)['index'];
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
    this.descriptionBox_.appendChild(this.descriptionTextArea_);

    const toggleDescription = this.toggleDescriptionBox_.bind(this);
    listen(dev().assertElement(this.container_), 'click', toggleDescription);
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
    const descText = this.clonedLightboxableElements_[this.currentElementId_]
        .descriptionText;
    this.descriptionTextArea_.textContent = descText;
    if (!descText) {
      this.descriptionBox_.classList.add('hide');
    }
  }

  /**
   * Toggle description box if it has text content
   * @private
   */
  toggleDescriptionBox_() {
    this.updateDescriptionBox_();
    if (this.descriptionBox_.textContent) {
      this.descriptionBox_.classList.toggle('hide');
    }
  }

  /**
   * Toggle the overflow state of description box
   * @private
   */
  toggleDescriptionOverflow_() {
    if (this.descriptionBox_.classList.contains('standard')) {
      this.descriptionBox_.classList.remove('standard');
      this.descriptionBox_.classList.add('overflow');
      this.vsync_.run({
        measure: state => {
          state.descTextAreaHeight =
              this.descriptionTextArea_./*OK*/scrollHeight;
          state.descBoxHeight = this.descriptionBox_./*OK*/clientHeight;
        },
        mutate: state => {
          if (state.descTextAreaHeight < state.descBoxHeight) {
            setStyle(this.descriptionTextArea_, 'position', 'absolute');
            setStyle(this.descriptionTextArea_, 'bottom', '0');
          }
        },
      }, {});
    } else if (this.descriptionBox_.classList.contains('overflow')) {
      this.vsync_.mutate(() => {
        this.descriptionBox_.classList.remove('overflow');
        this.descriptionBox_.classList.add('standard');
        setStyle(this.descriptionTextArea_, 'position', '');
        setStyle(this.descriptionTextArea_, 'bottom', '');
      });
    }
  }

  /**
   * Toggle lightbox top bar
   * @private
   */
  toggleTopBar_() {
    this.topBar_.classList.toggle('hide');
  }

  /**
   * Builds the top bar containing buttons and appends them to the container.
   * @private
   */
  buildTopBar_() {
    dev().assert(this.container_);
    this.topBar_ = this.win.document.createElement('div');
    this.topBar_.classList.add('i-amphtml-lbv-top-bar');

    const close = this.close_.bind(this);
    const openGallery = this.openGallery_.bind(this);
    const closeGallery = this.closeGallery_.bind(this);

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    this.buildButton_('Close', 'amp-lbv-button-close', close);
    this.buildButton_('Gallery', 'amp-lbv-button-gallery', openGallery);
    this.buildButton_('Content', 'amp-lbv-button-slide', closeGallery);

    const toggleTopBar = this.toggleTopBar_.bind(this);
    listen(dev().assertElement(this.container_), 'click', toggleTopBar);
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
    return this.open_(dev().assertElement(target));
  }

  /**
   * Opens the lightbox-viewer and displays the given element inside.
   * @param {!Element} element Element to lightbox.
   * @private
   * @return {!Promise}
   */
  open_(element) {
    this.getViewport().enterLightboxMode();

    toggle(this.element, true);
    this.active_ = true;

    this.updateInViewport(dev().assertElement(this.container_), true);
    this.scheduleLayout(dev().assertElement(this.container_));

    this.currentElementId_ = element.lightboxItemId;
    // Hack to access private property. Better than not getting
    // type checking to work.
    /**@type {?}*/ (this.carousel_).implementation_.showSlideWhenReady(
        this.currentElementId_);

    this.win.document.documentElement.addEventListener(
        'keydown', this.boundHandleKeyboardEvents_);

    return Promise.resolve();
  }

  /**
   * Closes the lightbox-viewer
   * @private
   */
  close_() {
    if (!this.active_) {
      return Promise.resolve();
    }

    toggle(this.element, false);
    this.getViewport().leaveLightboxMode();

    this.schedulePause(dev().assertElement(this.container_));
    this.active_ = false;

    // Reset the state of the description box
    this.descriptionBox_.classList.remove('hide');

    // If there's gallery, set gallery to display none
    this.container_.removeAttribute('gallery-view');

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundHandleKeyboardEvents_);
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
  }

  /**
   * Close gallery view
   * @private
   */
  closeGallery_() {
    this.container_.removeAttribute('gallery-view');
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
   * @private
   */
  createThumbnailElement_(thumbnailObj) {
    const element = this.win.document.createElement('div');
    element.classList.add('i-amphtml-lbv-gallery-thumbnail');
    const imgElement = this.win.document.createElement('img');
    imgElement.classList.add('i-amphtml-lbv-gallery-thumbnail-img');
    imgElement.setAttribute('src', thumbnailObj.url);
    element.appendChild(imgElement);
    const closeGallaryAndShowTargetSlide = event => {
      this.closeGallery_();
      this.currentElementId_ = thumbnailObj.element.lightboxItemId;
      this.updateDescriptionBox_();
      // Hack to access private property. Better than not getting
      // type checking to work.
      /**@type {?}*/ (this.carousel_).implementation_.showSlideWhenReady(
          this.currentElementId_);
      event.stopPropagation();
    };
    element.addEventListener('click', closeGallaryAndShowTargetSlide);
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
    const ampdoc = ampdocServiceFor(win).getAmpDoc();
    manager_ = new LightboxManager(ampdoc);
  }
}

installLightboxManager(AMP.win);
AMP.registerElement(TAG, AmpLightboxViewer, CSS);
