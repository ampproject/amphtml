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
import {Keycodes} from '../../../src/utils/keycodes';
import {ampdocServiceFor} from '../../../src/ampdoc';
import {ancestorElements} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {Layout} from '../../../src/layout';
import {user, dev} from '../../../src/log';
import {resourcesForDoc} from '../../../src/services';
import {toggle} from '../../../src/style';
import {listen} from '../../../src/event-helper';
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

    /** @private {!boolean} */
    this.active_ = false;

    /** @private {?Element} */
    this.activeElement_ = null;

    /** @private {!function(!Event)} */
    this.boundHandleKeyboardEvents_ = this.handleKeyboardEvents_.bind(this);

    /**
     * @const
     * @private {!./service/lightbox-manager-impl.LightboxManager}
     */
    this.manager_ = dev().assert(manager_);

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    /** @const @private {!Element} */
    this.container_ = this.win.document.createElement('div');
    this.container_.classList.add('i-amphtml-lbv');

    /** @private {?Element} */
    this.descriptionBox_ = null;

    /** @private  {?Element} */
    this.gallery_ = null;

    /** @private {?Array<{string, Element}>} */
    this.thumbnails_ = null;

    /** @private {?UnlistenDef} */
    this.elementUnlisten_ = null;

    this.buildMask_();
    this.buildDescriptionBox_();
    this.buildControls_();
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
   * Build description box and append it to the container.
   * @private
   */
  buildDescriptionBox_() {
    dev().assert(this.container_);
    this.descriptionBox_ = this.win.document.createElement('div');
    this.descriptionBox_.classList.add('amp-lbv-desc-box');

    const toggleDescription = this.toggleDescriptionBox_.bind(this);
    listen(this.container_, 'click', toggleDescription);
    this.container_.appendChild(this.descriptionBox_);
  }

  /**
   * Toggle description box if it has text content
   * @private
   */
  toggleDescriptionBox_() {
    if (!this.descriptionBox_.textContent) {
      return;
    }
    this.descriptionBox_.classList.toggle('hide');
  }

  /**
   * Builds the controls (i.e. Next, Previous and Close buttons) and appends
   * them to the container.
   * @private
   */
  buildControls_() {
    const next = this.next_.bind(this);
    const prev = this.previous_.bind(this);
    const close = this.close_.bind(this);
    const openGallery = this.openGallery_.bind(this);

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    this.buildButton_('Next', 'amp-lbv-button-next', next);
    this.buildButton_('Previous', 'amp-lbv-button-prev', prev);
    this.buildButton_('Close', 'amp-lbv-button-close', close);
    this.buildButton_('Gallery', 'amp-lbv-button-gallery',
        openGallery);

    this.container_.setAttribute('no-prev', '');
    this.container_.setAttribute('no-next', '');
  }

  /**
   * Builds a button and appends it to the container.
   * @param {!string} label Text of the button for a11y
   * @param {!string} className Css classname
   * @param {!function()} action function to call when tapped
   * @private
   */
  buildButton_(label, className, action) {
    const button = this.win.document.createElement('div');

    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', label);
    button.classList.add(className);
    button.addEventListener('click', event => {
      action();
      event.stopPropagation();
    });

    this.container_.appendChild(button);
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
   * @return {!Promise}
   */
  activate(invocation) {
    let target = invocation.source;
    if (invocation.args && invocation.args.id) {
      const targetId = invocation.args.id;
      target = this.win.document.getElementById(targetId);
      user().assert(target,
        'amp-lightbox-viewer.open: element with id: %s not found', targetId);
    }
    return this.open_(target);
  }

  /**
   * Opens the lightbox-viewer and displays the given element inside.
   * @param {!Element} element Element to lightbox.
   * @private
   * @return {!Promise}
   */
  open_(element) {
    if (this.activeElement_ == element) {
      return Promise.resolve();
    }

    const updateViewerPromise = this.updateViewer_(element);
    this.getViewport().enterLightboxMode();

    toggle(this.element, true);
    this.active_ = true;

    this.win.document.documentElement.addEventListener(
        'keydown', this.boundHandleKeyboardEvents_);

    return updateViewerPromise;
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
    this.tearDownElement_(this.activeElement_);
    this.getViewport().leaveLightboxMode();

    this.activeElement_ = null;
    this.active_ = false;

    // Reset the state of the description box
    this.descriptionBox_.classList.remove('hide');

    // If there's gallery, set gallery to display none
    this.container_.removeAttribute('gallery-view');

    this.container_.setAttribute('no-prev', '');
    this.container_.setAttribute('no-next', '');

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundHandleKeyboardEvents_);
  }

  /**
   * Opens the next element to be displayed in the lightbox.
   * @private
   * @return {!Promise}
   */
  next_() {
    dev().assert(this.activeElement_);
    return this.manager_.getNext(this.activeElement_).then(nextElement => {
      if (nextElement) {
        return this.updateViewer_(nextElement);
      }
    });
  }

  /**
   * Opens the previous element to be displayed in the lightbox.
   * @private
   * @return {!Promise}
   */
  previous_() {
    dev().assert(this.activeElement_);
    return this.manager_.getPrevious(this.activeElement_).then(prevElement => {
      if (prevElement) {
        return this.updateViewer_(prevElement);
      }
    });
  }

  /**
   * Updates the viewer to display the new element and tears down the old one
   * @param {!Element} newElement
   * @private
   * @return {!Promise}
   */
  updateViewer_(newElement) {
    const previousElement = this.activeElement_;
    dev().assert(newElement);
    if (newElement == previousElement) {
      return Promise.resolve();
    }

    // tear down the previous element
    if (previousElement) {
      this.tearDownElement_(previousElement);
    }

    // setup the new element
    this.setupElement_(newElement);

    // update active element to be the new element
    this.activeElement_ = newElement;

    // update the controls
    const updateControlsPromise = this.updateControls_();

    // TODO(aghassemi): Preloading of +/- 1 elements

    // TODO(aghassemi): This is a giant hack.
    // Find a proper way of scheduling layout for a resource that does not
    // not belong to the element requesting the layout.
    if (newElement.__AMP__RESOURCE) {
      newElement.__AMP__RESOURCE.setInViewport(true);
      resourcesForDoc(this.element).scheduleLayout(newElement, newElement);
    }

    return updateControlsPromise;
  }

  /**
   * Prepares the element to be displayed in the lightbox.
   * @param {!Element} element
   * @private
   */
  setupElement_(element) {
    const descText = this.manager_.getDescription(element);
    this.vsync_.mutate(() => {
      this.updateStackingContext_(element, /* reset */ false);
      element.classList.add('amp-lightboxed');
      // update description box
      this.descriptionBox_.textContent = descText;
    });
    // add click event to current element to trigger discription box
    const toggleDescription = this.toggleDescriptionBox_.bind(this);
    this.elementUnlisten_ =
        listen(element, 'click', toggleDescription);
  }

  /**
   * Prepares the element to be taken out of the lightbox.
   * @param {!Element} element
   * @private
   */
  tearDownElement_(element) {
    this.vsync_.mutate(() => {
      this.updateStackingContext_(element, /* reset */ true);
      element.classList.remove('amp-lightboxed');
    });
    if (this.elementUnlisten_) {
      this.elementUnlisten_();
    }

  }

  /**
   * Updates the controls based on the current active element.
   * @private
   * @return {!Promise}
   */
  updateControls_() {
    dev().assert(this.activeElement_);

    const prevPromise = this.manager_.hasPrevious(this.activeElement_)
    .then(hasPrev => {
      if (hasPrev) {
        this.container_.removeAttribute('no-prev');
      } else {
        this.container_.setAttribute('no-prev', '');
      }
    });

    const nextPromise = this.manager_.hasNext(this.activeElement_)
    .then(hasNext => {
      if (hasNext) {
        this.container_.removeAttribute('no-next');
      } else {
        this.container_.setAttribute('no-next', '');
      }
    });

    return Promise.all([nextPromise, prevPromise]);
  }

  /**
   * Walks up the tree from the given element and either adds or removes
   * `i-amphtml-lightboxed-ancestor` class to/from all ancestors.
   *
   * `i-amphtml-lightboxed-ancestor` resets the properties that create new
   * stacking context on the ancestors of the `elem` and therefore the z-index
   * value given to `elem` becomes absolute and `elem` can be displayed on top
   * of everything else. More info: https://goo.gl/uqY5CN
   *
   * @param {!Element} element
   * @param {!boolean} reset Whether to add or remove the
   * `i-amphtml-lightboxed-ancestor` class.
   * @private
   */
  updateStackingContext_(element, reset) {
    ancestorElements(element, ancestor => {
      if (reset) {
        ancestor.classList.remove('i-amphtml-lightboxed-ancestor');
      } else {
        ancestor.classList.add('i-amphtml-lightboxed-ancestor');
      }
    });
  }

  /**
   * Handles keyboard events for the lightbox.
   *  -Esc will close the lightbox.
   *  -Right arrow goes to next
   *  -Left arrow goes to previous
   * @private
   */
  handleKeyboardEvents_(event) {
    // TODO(aghassemi): RTL support
    const code = event.keyCode;
    if (code == Keycodes.ESCAPE) {
      this.close_();
    } else if (code == Keycodes.RIGHT_ARROW) {
      this.next_();
    } else if (code == Keycodes.LEFT_ARROW) {
      this.previous_();
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

    // Add go back button
    const back = this.closeGallery_.bind(this);
    this.buildButton_('Back', 'amp-lbv-button-back', back);

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
   * @param {{string, Element}} thumbnailObj
   * @private
   */
  createThumbnailElement_(thumbnailObj) {
    const element = this.win.document.createElement('div');
    element.classList.add('i-amphtml-lbv-gallery-thumbnail');
    const imgElement = this.win.document.createElement('img');
    imgElement.classList.add('i-amphtml-lbv-gallery-thumbnail-img');
    imgElement.setAttribute('src', thumbnailObj.url);
    element.appendChild(imgElement);
    const redirect = event => {
      this.updateViewer_(thumbnailObj.element);
      this.closeGallery_();
      event.stopPropagation();
    };
    element.addEventListener('click', redirect);
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
