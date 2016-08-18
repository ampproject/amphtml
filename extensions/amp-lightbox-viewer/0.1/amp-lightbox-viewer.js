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
import {Layout} from '../../../src/layout';
import {lightboxManagerForDoc} from '../../../src/lightbox-manager';
import {user, dev} from '../../../src/log';
import {ancestorElements} from '../../../src/dom';

class AmpLightboxViewer extends AMP.BaseElement {

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

    /** @private {boolean} */
    this.active_ = false;

    /** @private {Element} */
    this.activeElem = null;

    /** @private {function(!Event)} */
    this.boundHandleKeyboardEvents_ = this.handleKeyboardEvents_.bind(this);

    /**
     * @const
     * @private {!../../../src/service/lightbox-manager-impl.LightboxManager}
     */
    this.manager_ = lightboxManagerForDoc(this.win.document.documentElement);

    this.container_ = this.win.document.createElement('div');
    this.container_.classList.add('-amp-lightbox-viewer');
    this.buildMask_();
    this.buildControls_();

    this.element.appendChild(this.container_);
    this.registerAction('open', this.activate.bind(this));
  }

  /** @override */
  layoutCallback() {
    // DO NOT ADD CODE HERE
    // layoutCallback for lightbox-viewer is meaningless, lightbox-viewer
    // doesn't have children, it just manages elements elsewhere in the page in
    // `open_` `close_` and `updateViewer_` methods.
  }

  /**
   * Builds the page mask and appends it to the container.
   * @private
   */
  buildMask_() {
    dev().assert(this.container_);
    const mask = this.win.document.createElement('div');
    mask.classList.add('-amp-lightbox-viewer-mask');
    this.container_.appendChild(mask);
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

    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    this.buildButton_('Next', 'amp-lightbox-viewer-button-next', next);
    this.buildButton_('Previous', 'amp-lightbox-viewer-button-previous', prev);
    this.buildButton_('Close', 'amp-lightbox-viewer-button-close', close);
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
    button.addEventListener('click', action);

    this.container_.appendChild(button);
  }

  /**
   * Opens the lightbox-viewer with either the invocation source or
   * the element referenced by the `id` argument.
   * Examples:
   *  // Opens the element tapped in the viewer.
   *  on="tap:amp-lightbox-viewer'
   *
   *  // Opens the element referenced by elementId in the viewer
   *  on="tap:amp-lightbox-viewer.open(id='<elementId>')
   * @override
   */
  activate(invocation) {
    let target = invocation.source;
    // Action optionally accepts the id of the element to open in the
    // lightbox. on="tap:amp-lightbox-viewer.open(id='<elementId>')
    if (invocation.args && invocation.args.id) {
      const targetId = invocation.args.id;
      target = this.win.document.getElementById(targetId);
      user().assert(target,
        'amp-lightbox-viewer.open: element with id: %s not found', targetId);
    }
    this.open_(target);
  }

  /**
   * Opens the lightbox-viewer and displays the given element inside.
   * @param {!Element} elem Element to lightbox.
   * @private
   */
  open_(elem) {
    if (this.activeElem_ == elem) {
      return;
    }

    this.updateViewer_(elem);

    this.element.style.display = 'block';
    this.active_ = true;

    this.win.document.documentElement.addEventListener(
        'keydown', this.boundHandleKeyboardEvents_);
  }

  /**
   * Closes the lightbox-viewer
   * @private
   */
  close_() {
    if (!this.active_) {
      return;
    }

    this.element.style.display = 'none';
    this.tearDownElem_(this.activeElem_);

    this.activeElem_ = null;
    this.active_ = false;

    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundHandleKeyboardEvents_);
  }

  /**
   * Opens the next element to be displayed in the lightbox.
   * @private
   */
  next_() {
    dev().assert(this.activeElem_);
    this.manager_.getNext(this.activeElem_).then(nextElem => {
      if (nextElem) {
        this.updateViewer_(nextElem);
      }
    });
  }

  /**
   * Opens the previous element to be displayed in the lightbox.
   * @private
   */
  previous_() {
    dev().assert(this.activeElem_);
    this.manager_.getPrevious(this.activeElem_).then(prevElem => {
      if (prevElem) {
        this.updateViewer_(prevElem);
      }
    });
  }

  /**
   * Updates the viewer to display the new element and tear down the old element
   * @param {!Element} newElem
   * @private
   */
  updateViewer_(newElem) {
    const previousElem = this.activeElem_;
    dev().assert(newElem);
    dev().assert(newElem != previousElem);

    // tear down the previous element
    if (previousElem) {
      this.tearDownElem_(previousElem);
    }

    // setup the new element
    this.setupElem_(newElem);

    // update active element to be the new element
    this.activeElem_ = newElem;

    // update the controls
    this.updateControls_();

    // TODO(aghassemi): Preloading of +/- 1 elements

    // TODO(aghassemi): This is a giant hack.
    // Find a proper way of scheduling layout for a resource that does not
    // not belong to the element requesting the layout.
    if (newElem.resources_) {
      newElem.__AMP__RESOURCE.setInViewport(true);
      newElem.resources_.scheduleLayout(newElem, newElem);
    }
  }

  /**
   * Prepares the element to be displayed in the lightbox.
   * @param {!Element} elem
   * @private
   */
  setupElem_(elem) {
    this.updateStackingContext_(elem, /* reset */ false);
    elem.classList.add('amp-lightboxed');
  }

  /**
   * Prepares the element to be taken out of the lightbox.
   * @param {!Element} elem
   * @private
   */
  tearDownElem_(elem) {
    this.updateStackingContext_(elem, /* reset */ true);
    elem.classList.remove('amp-lightboxed');
  }

  /**
   * Updates the controls based on the current active element.
   * @private
   */
  updateControls_() {
    dev().assert(this.activeElem_);

    this.manager_.hasPrevious(this.activeElem_).then(hasPrev => {
      if (!hasPrev) {
        this.container_.setAttribute('no-prev', '');
      } else {
        this.container_.removeAttribute('no-prev');
      }
    });

    this.manager_.hasNext(this.activeElem_).then(hasNext => {
      if (!hasNext) {
        this.container_.setAttribute('no-next', '');
      } else {
        this.container_.removeAttribute('no-next');
      }
    });
  }

  /**
   * Walks up the tree from the given element and either adds or removes
   * `-amp-lightboxed-ancestor` class to/from all ancestors.
   *
   * `-amp-lightboxed-ancestor` resets the properties that create new
   * stacking context on the ancestors of the `elem` and therefore the z-index
   * value given to `elem` becomes absolute and `elem` can be displayed on top
   * of everything else. More info: https://goo.gl/uqY5CN
   *
   * @param {Element} elem
   * @param {boolean} reset Whether to add or remove the
   * `-amp-lightboxed-ancestor` classname.
   * @private
   */
  updateStackingContext_(elem, reset) {
    const ancestors = ancestorElements(elem, unused => {
      return true;
    });
    ancestors.forEach(ancestor => {
      if (reset) {
        ancestor.classList.remove('-amp-lightboxed-ancestor');
      } else {
        ancestor.classList.add('-amp-lightboxed-ancestor');
      }
    });
  }

  /**
   * Handles keyboard events for the lightbox.
   *  Esc will close the lightbox.
   *  Right arrow goes to next
   *  Left arrow goes to previous
   * @private
   */
  handleKeyboardEvents_(event) {
    // TODO(aghassemi): Add helper utility for keyboard events or an enum.
    const code = event.keyCode;

    // Escape
    if (code == 27) {
      this.close_();
    }

    // TODO(aghassemi): RTL support
    // Right arrow
    if (code == 39) {
      this.next_();
    }

    // Left arrow
    if (code == 37) {
      this.previous_();
    }
  }
}

AMP.registerElement('amp-lightbox-viewer', AmpLightboxViewer, CSS);