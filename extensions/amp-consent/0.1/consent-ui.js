/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';
import {
  assertHttpsUrl,
} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {
  elementByTag,
  insertAfterOrAtStart,
  isAmpElement,
  removeElement,
} from '../../../src/dom';
import {getData} from '../../../src/event-helper';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';

const TAG = 'amp-consent-ui';

export class ConsentUI {

  /**
   * @param {!AMP.BaseElement} baseInstance
   * @param {!JsonObject} config
   * @param {string=} opt_postPromptUI
   */
  constructor(baseInstance, config, opt_postPromptUI) {

    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {boolean} */
    this.isCreatedIframe_ = false;

    /** @private {boolean} */
    this.isPostPrompt_ = false;

    /** @private {?Element} */
    this.ui_ = null;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = baseInstance.getAmpDoc();

    /** @private {!Element} */
    this.parent_ = baseInstance.element;

    /** @private {!Window} */
    this.win_ = baseInstance.win;

    /** @private {?Deferred} */
    this.iframeReady_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private @const {!Function} */
    this.boundHandleIframeMessages_ = this.handleIframeMessages_.bind(this);

    this.init_(config, opt_postPromptUI);
  }

  /**
   * @param {!JsonObject} config
   * @param {string=} opt_postPromptUI
   */
  init_(config, opt_postPromptUI) {
    if (opt_postPromptUI) {
      const postPromptUI =
          this.ampdoc_.getElementById(opt_postPromptUI);
      if (!postPromptUI) {
        user().error(TAG, 'postPromptUI element with ' +
          `id=${opt_postPromptUI} not found`);
      }
      this.ui_ = dev().assertElement(postPromptUI);
      this.isPostPrompt_ = true;
      return;
    }
    const promptUI = config['promptUI'];
    const promptUISrc = config['promptUISrc'];
    if (promptUI) {
      // Always respect promptUI first
      const promptElement = this.ampdoc_.getElementById(promptUI);
      if (!promptElement || !this.parent_.contains(promptElement)) {
        user().error(TAG, 'child element of <amp-consent> with ' +
          `promptUI id ${promptUI} not found`);
      }
      this.ui_ = dev().assertElement(promptElement);
    } else if (promptUISrc && isExperimentOn(this.win_, 'amp-consent-v2')) {
      // Create an iframe element with the provided src
      this.isCreatedIframe_ = true;
      this.ui_ =
          this.createPromptIframeFromSrc_(promptUISrc);
      this.placeholder_ = this.createPlaceholder_();
    }
  }

  /**
   * Display the UI.
   */
  show() {
    if (!this.ui_) {
      // No prompt UI specified, nothing to do
      return;
    }
    toggle(dev().assertElement(this.parent_), true);
    const {classList} = this.parent_;
    classList.add('amp-active');
    classList.remove('amp-hidden');
    // Add to fixed layer
    this.baseInstance_.getViewport().addToFixedLayer(this.parent_);
    if (this.isCreatedIframe_) {
      this.loadIframe_().then(() => {
        // It is safe to assume that the loadIframe_ promise will resolve
        // before resetIframe_. Because the iframe needs to be shown first
        // being hidden. CMP iframe is responsible to call consent-iframe-ready
        // API before consent-response API.
        this.baseInstance_.mutateElement(() => {
          this.showIframe_();
        });
      });
    } else {
      const show = () => {
        if (!this.ui_) {
          return;
        }
        toggle(this.ui_, true);
        if (!this.isPostPrompt_) {
          // scheduleLayout is required everytime because some AMP element may
          // get un laid out after toggle display (#unlayoutOnPause)
          // for example <amp-iframe>
          this.baseInstance_.scheduleLayout(this.ui_);
        }
      };

      // If the UI is an AMP Element, wait until it's built before showing it,
      // to avoid race conditions where the UI would be hidden by the runtime
      // at build time. (see #18841).
      isAmpElement(this.ui_) ?
        this.ui_.whenBuilt().then(() => show()) :
        show();
    }
  }

  /**
   * Hide the UI
   */
  hide() {
    if (!this.ui_) {
      // Nothing to hide from;
      return;
    }
    if (!this.isPostPrompt_) {
      const {classList} = this.parent_;
      classList.remove('amp-active');
      classList.add('amp-hidden');
    }
    // Need to remove from fixed layer and add it back to update element's top
    this.baseInstance_.getViewport().removeFromFixedLayer(this.parent_);
    toggle(this.ui_, false);
    if (this.isCreatedIframe_) {
      this.resetIframe_();
    }
  }

  /**
   * Create the iframe if promptUISrc is valid
   * @param {string} promptUISrc
   * @return {!Element}
   */
  createPromptIframeFromSrc_(promptUISrc) {
    const iframe = this.parent_.ownerDocument.createElement('iframe');
    iframe.src = assertHttpsUrl(promptUISrc, this.parent_);
    iframe.setAttribute('sandbox', 'allow-scripts');
    const {classList} = iframe;
    classList.add('i-amphtml-consent-fill');
    // Append iframe lazily to save resources.
    return iframe;
  }

  /**
   * Create the default placeholder
   * @return {!Element}
   */
  createPlaceholder_() {
    // TODO(@zhouyx): Allow publishers to provide placeholder upon request
    const placeholder = this.parent_.ownerDocument.createElement('placeholder');
    toggle(placeholder, false);
    const {classList} = placeholder;
    classList.add('i-amphtml-consent-fill');
    classList.add('i-amphtml-consent-placeholder');
    return placeholder;
  }


  /**
   * Apply placeholder
   * Set up event listener to handle UI related messages.
   * @return {!Promise}
   */
  loadIframe_() {
    this.iframeReady_ = new Deferred();
    const {classList} = this.parent_;
    if (!elementByTag(this.parent_, 'placeholder')) {
      insertAfterOrAtStart(this.parent_,
          dev().assertElement(this.placeholder_), null);
    }
    classList.add('loading');
    toggle(dev().assertElement(this.placeholder_), true);
    toggle(dev().assertElement(this.ui_), false);
    this.win_.addEventListener('message', this.boundHandleIframeMessages_);
    insertAfterOrAtStart(this.parent_, dev().assertElement(this.ui_), null);
    return this.iframeReady_.promise;
  }

  /**
   * Hide the placeholder
   * Apply animation to show the iframe
   */
  showIframe_() {
    const {classList} = this.parent_;
    toggle(dev().assertElement(this.placeholder_), false);
    toggle(dev().assertElement(this.ui_), true);
    classList.remove('loading');
    classList.add('i-amphtml-consent-ui-in');
    classList.add('consent-iframe-active');
  }

  /**
   * Remove the iframe from doc
   * Remove event listener
   * Reset UI state
   */
  resetIframe_() {
    const {classList} = this.parent_;
    classList.remove('i-amphtml-consent-ui-in');
    classList.remove('consent-iframe-active');
    this.win_.removeEventListener('message', this.boundHandleIframeMessages_);
    removeElement(dev().assertElement(this.ui_));
  }

  /**
   * Listen to iframe messages and handle events.
   * Current supported APIs:
   *
   * Required message from iframe to hide placeholder and display iframe
   * {
   *   type: 'consent-ui-ready'
   * }
   * @param {!Event} event
   */
  handleIframeMessages_(event) {
    if (this.ui_.contentWindow !== event.source) {
      // Ignore messages from else where
      return;
    }

    const data = getData(event);
    if (!data) {
      return;
    }

    if (data['type'] == 'consent-ui-ready') {
      this.iframeReady_.resolve();
    }
  }
}
