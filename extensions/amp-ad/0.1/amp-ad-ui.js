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
export const AdDisplayState = {
  /**
   * The ad has been laid out, but runtime haven't received any response from
   * the ad server.
   */
  LOADING: 0,

  /**
   * The ad has been laid out, and runtime has received render-start msg from
   * ad server.
   * Not used now.
   */
  LOADED: 1,

  /**
   * The ad has been laid out, and runtime has received no-content msg from
   * ad server.
   */
  NO_CONTENT: 2,

  /**
   * The ad has not been laid out yet, or the ad has already be unlaid out.
   */
  UN_LAID_OUT: 3,
};

/**
 * Apply UI for laid out ad with no-content
 * If fallback exist try to display provided fallback
 * Else try to collapse the ad (Note: may not succeed)
 * @param {!BaseElement} baseInstance
 */
export function displayNoContentUI(baseInstance) {
  if (baseInstance.state == AdDisplayState.UN_LAID_OUT) {
    return;
  }
  if (!baseInstance.getFallback()) {
    baseInstance.attemptChangeHeight(0).then(() => {
      baseInstance./*OK*/collapse();
      baseInstance.state = AdDisplayState.NO_CONTENT;
    }, () => {});
  } else {
    baseInstance.deferMutate(() => {
      if (baseInstance.state == AdDisplayState.UN_LAID_OUT) {
        // If alreayd unlaid out, do not replace current placeholder then.
        return;
      }
      baseInstance.togglePlaceholder(false);
      baseInstance.toggleFallback(true);
      baseInstance.state = AdDisplayState.NO_CONTENT;
    });
  }
};

/**
 * Apply UI for unlaid out ad
 * Hide fallback and show placeholder if exists
 * Note: Once unlayout UI applied, only another layout will change the UI again
 * @param {!BaseElement} baseInstance
 */
export function displayUnlayoutUI(baseInstance) {
  baseInstance.state = AdDisplayState.UN_LAID_OUT;
  baseInstance.deferMutate(() => {
    baseInstance.togglePlaceholder(true);
    baseInstance.toggleFallback(false);
  });
}
