/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * An AMP element's ready state.
 *
 * @enum {string}
 */
export const ReadyState = {
  /**
   * The element has not been upgraded yet.
   */
  UPGRADING: 'upgrading',

  /**
   * The element has been upgraded and waiting to be built.
   */
  BUILDING: 'building',

  /**
   * The element has been built and waiting to be mounted.
   */
  MOUNTING: 'mounting',

  /**
   * The element has been built and waiting to be loaded.
   */
  LOADING: 'loading',

  /**
   * The element has been built and loaded.
   */
  COMPLETE: 'complete',

  /**
   * The element is in an error state.
   */
  ERROR: 'error',
};
