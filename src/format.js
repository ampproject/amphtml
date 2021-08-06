/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * Checks that the document is of an AMP format type.
 * @param {!Array<string>} formats
 * @param {!Document} doc
 * @return {boolean}
 */
function isAmpFormatType(formats, doc) {
  const html = doc.documentElement;
  const isFormatType = formats.some((format) => html.hasAttribute(format));
  return isFormatType;
}

/**
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAmp4Email(doc) {
  return isAmpFormatType(['⚡4email', 'amp4email'], doc);
}

/**
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAmphtml(doc) {
  return isAmpFormatType(['⚡', 'amp'], doc);
}
