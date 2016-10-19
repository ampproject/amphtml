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


/**
 * Ad display state.
 * @enum {number}
 */
const AdDisplayState = {
  /**
   * The ad has not been laid out
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
  LOADED_RS: 2,

  /**
   * The ad has been laid out, and runtime has received no-content msg from
   * ad server.
   */
  LOADED_NC: 3,

  /**
   * The ad has not been laid out yet, or the ad has already be unlaid out.
   */
  UN_LAID_OUT: 4,
};

export class AmpAdUIHandler {

  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {?number} */
    this.state = null;
  }

  /**
   * TODO(@zhouyx): Add ad tag to the ad.
   */
  init() {
    this.state = AdDisplayState.NOT_LAID_OUT;
  }

  /**
   * TODO(@zhouyx): apply placeholder, add ad loading indicator
   */
  displayLoadingUI() {
    this.state = AdDisplayState.LOADING;
  }

  /**
   * TODO(@zhouyx): remove ad loading indicator
   */
  displayRenderStartUI() {
    this.state = AdDisplayState.LOADED_RS;
  }

  /**
   * Apply UI for laid out ad with no-content
   * If fallback exist try to display provided fallback
   * Else try to collapse the ad (Note: may not succeed)
   * TODO(@zhouyx): apply fallback, remove ad loading indicator
   */
  displayNoContentUI() {
    if (this.state == AdDisplayState.UN_LAID_OUT) {
      return;
    }
    if (!this.baseInstance_.getFallback()) {
      this.baseInstance_.attemptChangeHeight(0).then(() => {
        this.baseInstance_./*OK*/collapse();
        this.state = AdDisplayState.LOADED_NC;
      }, () => {
        this.state = AdDisplayState.LOADED_NC;
      });
    } else {
      this.baseInstance_.deferMutate(() => {
        if (this.state == AdDisplayState.UN_LAID_OUT) {
          // If alreayd unlaid out, do not replace current placeholder then.
          return;
        }
        this.baseInstance_.togglePlaceholder(false);
        this.baseInstance_.toggleFallback(true);
        this.state = AdDisplayState.LOADED_NC;
      });
    }
  }

  /**
   * Apply UI for unlaid out ad
   * Hide fallback and show placeholder if exists
   * Once unlayout UI applied, only another layout will change the UI again
   * TODO(@zhouyx): remove ad loading indicator
   */
  displayUnlayoutUI() {
    this.state = AdDisplayState.UN_LAID_OUT;
    this.baseInstance_.deferMutate(() => {
      this.baseInstance_.togglePlaceholder(true);
      this.baseInstance_.toggleFallback(false);
    });
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
