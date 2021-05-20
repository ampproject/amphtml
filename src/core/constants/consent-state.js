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

// This file will be imported by 3P scripts.

/**
 * Possible consent policy state to proceed with.
 * @enum {number}
 */
export const CONSENT_POLICY_STATE = {
  // Enum value has external dependency. Please do not change existing value.
  // If new values are added, please notify the AMP for Ads team to assure
  // correct Real Time Config behavior is maintained for Fast Fetch.
  SUFFICIENT: 1,
  INSUFFICIENT: 2,
  UNKNOWN_NOT_REQUIRED: 3,
  UNKNOWN: 4,
};

/**
 * Defines valid consent string types passed
 * in by consent iframe metadata.
 * @enum {number}
 */
export const CONSENT_STRING_TYPE = {
  // Enum value has external dependency for metadata collection.
  // It is up to the vendor to interpret an undefined CONSENT_STRING_TYPE.
  TCF_V1: 1,
  TCF_V2: 2,
  US_PRIVACY_STRING: 3,
};
