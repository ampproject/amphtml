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

import {startsWith} from '../../../src/string';

/** @const @private {string} */
const GMOSSP_SRC_PREFIX_ = 'https://sp.gmossp-sp.jp/';

/** @const @private {string} */
const GMOSSP_SRC_A4A_PREFIX_ = 'https://amp.sp.gmossp-sp.jp/_a4a/';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
export function gmosspIsA4AEnabled(win, element, useRemoteHtml) {
  let src;
  return (
    !useRemoteHtml &&
    !!(src = element.getAttribute('src')) &&
    !!element.getAttribute('data-use-a4a') &&
    (startsWith(src, GMOSSP_SRC_PREFIX_) ||
      startsWith(src, GMOSSP_SRC_A4A_PREFIX_))
  );
}
