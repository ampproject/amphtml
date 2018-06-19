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
 * @enum {number}
 */
export const AmpEvents = {
  // Values start at 801 for easier code searchability and to avoid conflation
  // with HTTP status codes.
  DOM_UPDATE: 801,
  // The following codes are only used for testing.
  // TODO(choumx): Move these to a separate enum so they can be DCE'd.
  BUILT: 901,
  ATTACHED: 902,
  STUBBED: 903,
  LOAD_START: 904,
  LOAD_END: 905,
  ERROR: 906,
  VISIBILITY_CHANGE: 907,
};
