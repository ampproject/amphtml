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

export const CTX_ATTR_NAME = 'shiftedctx';

export const CTX_ATTR_VALUE = () => {
  return Date.now();
};

/**
 * White list of anchor attributes allowed to be replace with
 * placeholders set on output config property
 */
export const WL_ANCHOR_ATTR = [
  'href',
  'id',
  'rel',
  'rev',
];

/**
 * Prefix elements data attributes
 */
export const PREFIX_DATA_ATTR = 'vars';

/**
 * Name space for data placeholders
 */
export const NS_DATA_PH = 'data.';
