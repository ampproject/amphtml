/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * Used for inserted scoped analytics element.
 * @const {!Object<string, boolean>}
 */
export const SANDBOX_AVAILABLE_VARS = {
  'RANDOM': true,
  'CANONICAL_URL': true,
  'CANONICAL_HOST': true,
  'CANONICAL_HOSTNAME': true,
  'CANONICAL_PATH': true,
  'AMPDOC_URL': true,
  'AMPDOC_HOST': true,
  'AMPDOC_HOSTNAME': true,
  'SOURCE_URL': true,
  'SOURCE_HOST': true,
  'SOURCE_HOSTNAME': true,
  'SOURCE_PATH': true,
  'TIMESTAMP': true,
  'TIMEZONE': true,
  'VIEWPORT_HEIGHT': true,
  'VIEWPORT_WIDTH': true,
  'SCREEN_WIDTH': true,
  'SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_WIDTH': true,
  'SCREEN_COLOR_DEPTH': true,
  'DOCUMENT_CHARSET': true,
  'BROWSER_LANGUAGE': true,
  'AMP_VERSION': true,
  'BACKGROUND_STATE': true,
  'USER_AGENT': true
};
