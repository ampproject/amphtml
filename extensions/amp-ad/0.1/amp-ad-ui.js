/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use baseInstance file except in compliance with the License.
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

import {dev} from '../../../src/log';
import {getAdContainer} from '../../../src/ad-helper';
import {isExperimentOn} from '../../../src/experiments';

const TAG = 'AmpAdUIHandler';

/**
 * Ad display state.
 * @enum {number}
 */
export const AdDisplayState = {
  /**
   * The ad has not been laid out, or the ad has already be unlaid out
   */
  NOT_LAID_OUT: 0,

  /**
   * The ad has been laid out, but runtime haven't received any response from
   * the ad server.
   */
  LOADING: 1,

  /**
   * The ad has been laid out, and runtime has received render-start msg from
   * ad server.
   * Not used now.
   */
  LOADED_RENDER_START: 2,

  /**
   * The ad has been laid out, and runtime has received no-content msg from
   * ad server.
   */
  LOADED_NO_CONTENT: 3,
};

export class AmpAdUIHandler {

  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private @const {!Document} */
    this.doc_ = baseInstance.win.document;

    /** {number} */
    this.state = AdDisplayState.NOT_LAID_OUT;

    /** {!boolean} */
    this.hasPageProvidedFallback_ = !!baseInstance.getFallback();
  }

  /**
   * TODO(@zhouyx): Add ad tag to the ad.
   */
  init() {
    if (this.hasPageProvidedFallback_) {
      return;
    }

    // Apply default fallback div when there's no default one
    this.addDefaultUiComponent_('fallback');
  }

  /**
   * Exposed function to ad that enable them to set UI to correct display state
   * @param {number} state
   */
  setDisplayState(state) {
    if (this.state == AdDisplayState.NOT_LAID_OUT) {
      // Once unlayout UI applied, only another layout will change the UI again
      if (state != AdDisplayState.LOADING) {
        return;
      }
    }
    switch (state) {
      case AdDisplayState.LOADING:
        this.displayLoadingUI_();
        break;
      case AdDisplayState.LOADED_RENDER_START:
        this.displayRenderStartUI_();
        break;
      case AdDisplayState.LOADED_NO_CONTENT:
        this.displayNoContentUI_();
        break;
      case AdDisplayState.NOT_LAID_OUT:
        this.displayUnlayoutUI_();
        break;
      default:
        dev().error(TAG, 'state is not supported');
    }
  }

  /**
   * See BaseElement method.
   */
  createPlaceholderCallback() {
    return this.addDefaultUiComponent_('placeholder');
  }

  /**
   * TODO(@zhouyx): apply placeholder, add ad loading indicator
   * @private
   */
  displayLoadingUI_() {
    this.state = AdDisplayState.LOADING;
    this.baseInstance_.togglePlaceholder(true);
  }

  /**
   * TODO(@zhouyx): remove ad loading indicator
   * @private
   */
  displayRenderStartUI_() {
    this.state = AdDisplayState.LOADED_RENDER_START;
    this.baseInstance_.togglePlaceholder(false);
  }

  /**
   * Apply UI for laid out ad with no-content
   * If fallback exist try to display provided fallback
   * Else try to collapse the ad (Note: may not succeed)
   * TODO(@zhouyx): apply fallback, remove ad loading indicator
   * @private
   */
  displayNoContentUI_() {
    if (getAdContainer(this.element_) == 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      this.baseInstance_./*OK*/collapse();
      this.state = AdDisplayState.LOADED_NO_CONTENT;
      return;
    }
    // The order here is collapse > user provided fallback > default fallback
    this.baseInstance_.attemptCollapse().then(() => {
      this.state = AdDisplayState.LOADED_NO_CONTENT;
    }, () => {
      this.baseInstance_.deferMutate(() => {
        if (this.state == AdDisplayState.NOT_LAID_OUT) {
          // If already unlaid out, do not replace current placeholder.
          return;
        }
        this.baseInstance_.togglePlaceholder(false);
        this.baseInstance_.toggleFallback(true);
        this.state = AdDisplayState.LOADED_NO_CONTENT;
      });
    });
  }

  /**
   * Apply UI for unlaid out ad
   * Hide fallback and show placeholder if exists
   * Once unlayout UI applied, only another layout will change the UI again
   * TODO(@zhouyx): remove ad loading indicator
   * @private
   */
  displayUnlayoutUI_() {
    this.state = AdDisplayState.NOT_LAID_OUT;
    this.baseInstance_.deferMutate(() => {
      if (this.state != AdDisplayState.NOT_LAID_OUT) {
        return;
      }
      this.baseInstance_.togglePlaceholder(true);
      this.baseInstance_.toggleFallback(false);
    });
  }

  /**
   * @param {string} name
   * @return {?Element}
   * @private
   */
  addDefaultUiComponent_(name) {
    if (this.element_.tagName == 'AMP-EMBED') {
      // Do nothing for amp-embed element;
      return null;
    }
    const uiComponent = this.doc_.createElement('div');
    uiComponent.setAttribute(name, '');

    const content = this.doc_.createElement('div');
    content.classList.add('i-amphtml-ad-default-holder');
    if (isExperimentOn(this.baseInstance_.win, 'ad-loader-v1')) {
      content.setAttribute('experiment1', '');
    }
    if (isExperimentOn(this.baseInstance_.win, 'ad-loader-v2')) {
      content.setAttribute('experiment2', '');
    }
    uiComponent.appendChild(content);

    this.baseInstance_.element.appendChild(uiComponent);
    return uiComponent;
  }

  /**
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {number} iframeHeight
   * @param {number} iframeWidth
   * @return {!Promise<!Object>}
   */
  updateSize(height, width, iframeHeight, iframeWidth) {
    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(this.element_./*OK*/offsetHeight +
          height - iframeHeight, height);
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(this.element_./*OK*/offsetWidth +
          width - iframeWidth, width);
    }

    /** @type {!Object<!boolean, number|undefined, number|undefined>} */
    const resizeInfo = {
      success: true,
      newWidth,
      newHeight,
    };

    if (!newHeight && !newWidth) {
      return Promise.reject(new Error('undefined width and height'));
    }

    if (getAdContainer(this.element_) == 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      resizeInfo.success = false;
      return Promise.resolve(resizeInfo);
    }
    return this.baseInstance_.attemptChangeSize(
        newHeight, newWidth).then(() => {
          return resizeInfo;
        }, () => {
          resizeInfo.success = false;
          return resizeInfo;
        });
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
