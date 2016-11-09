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
import {createElementWithAttributes} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {UX_EXPERIMENT} from '../../../src/layout';

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

    /** {number} */
    this.state = AdDisplayState.NOT_LAID_OUT;;

    /** {!boolean} */
    this.hasPageProvidedFallback_ = !!baseInstance.getFallback();
  }

  /**
   * TODO(@zhouyx): Add ad tag to the ad.
   */
  init() {
    if (!isExperimentOn(this.baseInstance_.win, UX_EXPERIMENT)) {
      return;
    }

    if (this.hasPageProvidedFallback_) {
      return;
    }

    // Apply default fallback div when there's no default one
    const holder = createElementWithAttributes(document, 'div', {
      'fallback': '',
    });
    holder.classList.add('amp-ad-default-fallback');
    this.baseInstance_.element.appendChild(holder);
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
    // The order here is user provided fallback > collapse > default fallback
    if (this.hasPageProvidedFallback_) {
      this.baseInstance_.deferMutate(() => {
        if (this.state == AdDisplayState.NOT_LAID_OUT) {
          // If already unlaid out, do not replace current placeholder then.
          return;
        }
        this.baseInstance_.togglePlaceholder(false);
        this.baseInstance_.toggleFallback(true);
        this.state = AdDisplayState.LOADED_NO_CONTENT;
      });
    } else {
      this.baseInstance_.attemptChangeHeight(0).then(() => {
        this.baseInstance_./*OK*/collapse();
        this.state = AdDisplayState.LOADED_NO_CONTENT;
      }, () => {
        // Apply default fallback when resize fail.
        this.baseInstance_.togglePlaceholder(false);
        this.baseInstance_.toggleFallback(true);
        this.state = AdDisplayState.LOADED_NO_CONTENT;
      });
    }
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
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
