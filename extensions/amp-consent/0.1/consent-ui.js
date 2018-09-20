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

import {
  assertHttpsUrl,
} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {
  insertAfterOrAtStart,
  removeElement,
} from '../../../src/dom';
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
    }
  }

  /**
   * Display the UI. TODO: Apply placeholder when necessary
   */
  show() {
    if (!this.ui_) {
      // No prompt UI specified, nothing to do
      return;
    }
    toggle(this.parent_, true);
    const {classList} = this.parent_;
    classList.add('amp-active');
    classList.remove('amp-hidden');
    // Add to fixed layer
    this.baseInstance_.getViewport().addToFixedLayer(this.parent_);
    toggle(this.ui_, true);
    if (this.isCreatedIframe_) {
      // TODO: Apply placeholder and hide iframe
      insertAfterOrAtStart(this.parent_, this.ui_, null);
    }
    if (!this.isPostPrompt_ && !this.isCreatedIframe_) {
      // scheduleLayout is required everytime because some AMP element may
      // get un laid out after toggle display (#unlayoutOnPause)
      // for example <amp-iframe>
      this.baseInstance_.scheduleLayout(this.ui_);
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
      removeElement(this.ui_);
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
    return iframe;
  }
}
