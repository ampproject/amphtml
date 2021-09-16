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
import {isEnumValue} from '../../../src/core/types';
import {parseQueryString} from '../../../src/url';

/**
 * Embed mode for AMP story.  See ../embed-modes.md for details.
 * @enum {number}
 */
export const EmbedMode = {
  /**
   * Default mode.
   */
  NOT_EMBEDDED: 0,

  /**
   * TBD embed mode.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Hides bookend
   * - Hides all system layer buttons
   * - Disables swipe-based user education
   * - Disallows ads
   * - Unmutes audio in the story by default
   */
  NAME_TBD: 1,

  /**
   * This mode is intended for embedders that natively handle sharing the story,
   * thereby rendering the sharing functionality within the amp-story extension
   * redundant.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Removes share icon from system layer
   * - Removes sharing section from bookend
   * - TODO(#14923): Removes the link information from embedded UIs.
   */
  NO_SHARING: 2,

  /**
   * This mode is intended for a preview of the story.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Auto-advances pages by a given duration.
   * - Hides bookend
   * - Hides all system layer buttons
   * - Disables swipe-based user education
   * - Disallows ads
   */
  PREVIEW: 3,

  /**
   * This mode is intended for embedders that natively handle the audio and
   * sharing experiences, through native controls and viewer communication.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Removes share icon from system layer
   * - Removes sharing section from bookend
   * - Removes audio icon from system layer
   */
  NO_SHARING_NOR_AUDIO_UI: 4,
};

/**
 * Parameter to retrieve the embed mode from the location hash.
 * @type {string}
 */
export const EmbedModeParam = 'embedMode';

/**
 * @param {string} str
 * @return {!EmbedMode}
 * @package
 */
export function parseEmbedMode(str) {
  const params = parseQueryString(str);
  const unsanitizedEmbedMode = params[EmbedModeParam];
  const embedModeIndex = parseInt(unsanitizedEmbedMode, 10);

  return isEnumValue(EmbedMode, embedModeIndex)
    ? /** @type {!EmbedMode} */ (embedModeIndex)
    : EmbedMode.NOT_EMBEDDED;
}
