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
 * Common AMP events.
 * @enum {string}
 */
export const AmpEvents = {
  // Use short, unique strings to reduce bundle size impact.
  BUILT: 'e1',
  DOM_UPDATE: 'e2',
  // The following codes are only used for testing.
  // TODO(choumx): Move these to a separate enum so they can be DCE'd.
  ATTACHED: 'e3',
  STUBBED: 'e4',
  LOAD_START: 'e5',
  LOAD_END: 'e6',
  ERROR: 'e7',
  VISIBILITY_CHANGE: 'e8',
};
