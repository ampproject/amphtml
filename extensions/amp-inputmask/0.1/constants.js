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

export const MaskChars = {
  ALPHANUMERIC_REQUIRED: 'A',
  ALPHANUMERIC_OPTIONAL: 'a',
  ALPHABETIC_REQUIRED: 'L',
  ALPHABETIC_OPTIONAL: 'l',
  ARBITRARY_REQUIRED: 'C',
  ARBITRARY_OPTIONAL: 'c',
  NUMERIC_REQUIRED: '0',
  NUMERIC_OPTIONAL: '9',
  ESCAPE: '\\',
};

export const MASK_SEPARATOR_CHAR = ' ';

export const NamedMasks = {
  EMAIL: 'email',
  PHONE: 'phone',
  PHONE_US: 'phone-us',
  DATE_INTL: 'date-intl',
  DATE_US: 'date-us',
  DATE_ISO: 'date-iso',
};

/** @enum {string} */
export const OutputMode = {
  RAW: 'raw',
  ALPHANUMERIC: 'alphanumeric',
};
